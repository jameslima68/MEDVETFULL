from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
import secrets
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

# --- Pydantic Models ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    in_stock: bool = True

class ConsultationRequest(BaseModel):
    name: str
    email: str
    phone: str
    pet_name: str
    pet_type: str
    pet_age: Optional[str] = None
    category: str
    date: str
    time: str
    notes: Optional[str] = None

class ContactRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

# --- Auth Endpoints ---
@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "name": req.name,
        "email": email,
        "password_hash": hash_password(req.password),
        "phone": req.phone,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"id": user_id, "name": req.name, "email": email, "role": "user"}

@api_router.post("/auth/login")
async def login(req: LoginRequest, request: Request, response: Response):
    email = req.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    # Brute force check
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_until = attempt.get("locked_until")
        if lockout_until and datetime.now(timezone.utc) < datetime.fromisoformat(lockout_until):
            raise HTTPException(status_code=429, detail="Too many login attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        # Increment failed attempts
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Clear failed attempts on success
    await db.login_attempts.delete_many({"identifier": identifier})
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"id": user_id, "name": user["name"], "email": email, "role": user.get("role", "user")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        new_access = create_access_token(user_id, user["email"])
        response.set_cookie(key="access_token", value=new_access, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# --- Products ---
@api_router.get("/products")
async def get_products(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(50)
    return categories

# --- Consultations ---
@api_router.post("/consultations")
async def create_consultation(req: ConsultationRequest):
    doc = req.model_dump()
    doc["id"] = str(ObjectId())
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.consultations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/consultations")
async def get_consultations(user: dict = Depends(get_current_user)):
    email = user["email"]
    consultations = await db.consultations.find({"email": email}, {"_id": 0}).to_list(100)
    return consultations

# --- Blog/Tips ---
@api_router.get("/tips")
async def get_tips():
    tips = await db.tips.find({}, {"_id": 0}).to_list(50)
    return tips

@api_router.get("/tips/{tip_id}")
async def get_tip(tip_id: str):
    tip = await db.tips.find_one({"id": tip_id}, {"_id": 0})
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
    return tip

# --- Testimonials ---
@api_router.get("/testimonials")
async def get_testimonials():
    testimonials = await db.testimonials.find({}, {"_id": 0}).to_list(50)
    return testimonials

# --- FAQ ---
@api_router.get("/faq")
async def get_faq():
    faqs = await db.faq.find({}, {"_id": 0}).to_list(50)
    return faqs

# --- Contact ---
@api_router.post("/contact")
async def create_contact(req: ContactRequest):
    doc = req.model_dump()
    doc["id"] = str(ObjectId())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Message sent successfully", "id": doc["id"]}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Seed Data ---
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@medvet.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin MEDVET",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

async def seed_categories():
    count = await db.categories.count_documents({})
    if count > 0:
        return
    categories = [
        {"id": "homeopatia", "name": "Homeopatia Veterinaria", "slug": "homeopatia", "description": "Tratamentos homeopaticos naturais para seu pet, promovendo equilibrio e saude de forma suave e eficaz.", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "icon": "Leaf"},
        {"id": "hormonios", "name": "Hormonios Bioidenticos", "slug": "hormonios", "description": "Terapia hormonal bioidentica personalizada para animais, restaurando o equilibrio hormonal naturalmente.", "image_url": "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwbW9kZXJufGVufDB8fHx8MTc3NjEyNTg3MXww&ixlib=rb-4.1.0&q=85", "icon": "FlaskConical"},
        {"id": "medicina-chinesa", "name": "Medicina Chinesa", "slug": "medicina-chinesa", "description": "Produtos manipulados da medicina tradicional chinesa adaptados para uso veterinario.", "image_url": "https://images.unsplash.com/photo-1759863742702-41316e3db192?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxwZXQlMjB3ZWxsbmVzcyUyMGNhdCUyMGRvZyUyMG5hdHVyZXxlbnwwfHx8fDE3NzYxMjU4NTh8MA&ixlib=rb-4.1.0&q=85", "icon": "Yin"},
        {"id": "cbd", "name": "CBD para Pets", "slug": "cbd", "description": "Oleos e produtos a base de CBD para alivio de dor, ansiedade e inflamacao em animais.", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "icon": "Droplets"},
        {"id": "acupuntura", "name": "Acupuntura Veterinaria", "slug": "acupuntura", "description": "Sessoes de acupuntura para tratamento de dor cronica, reabilitacao e bem-estar animal.", "image_url": "https://images.unsplash.com/photo-1621371236495-1520d8dc72a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJ5JTIwZG9nfGVufDB8fHx8MTc3NjEyNTg1OHww&ixlib=rb-4.1.0&q=85", "icon": "Target"},
        {"id": "dicas", "name": "Dicas de Especialistas", "slug": "dicas", "description": "Conteudo educacional e dicas de veterinarios especialistas em medicina integrativa.", "image_url": "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwbW9kZXJufGVufDB8fHx8MTc3NjEyNTg3MXww&ixlib=rb-4.1.0&q=85", "icon": "BookOpen"}
    ]
    await db.categories.insert_many(categories)
    logger.info("Categories seeded")

async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    products = [
        {"id": "hom-001", "name": "Arnica Montana 30CH", "description": "Medicamento homeopatico indicado para traumas, contusoes e dores musculares em caes e gatos. Formulacao liquida de facil administracao.", "price": 45.90, "category": "homeopatia", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "hom-002", "name": "Nux Vomica 12CH", "description": "Ideal para problemas digestivos, nauseas e intoxicacoes em animais. Tratamento homeopatico suave e eficaz.", "price": 39.90, "category": "homeopatia", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "hom-003", "name": "Phosphorus 200CH", "description": "Tratamento homeopatico para problemas hepaticos e respiratorios em animais. Alta potencia para casos cronicos.", "price": 52.90, "category": "homeopatia", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "hor-001", "name": "Progesterona Bioidentica", "description": "Hormonio bioidentico manipulado para femeas com desequilibrio hormonal. Uso sob prescricao veterinaria.", "price": 189.90, "category": "hormonios", "image_url": "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwbW9kZXJufGVufDB8fHx8MTc3NjEyNTg3MXww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "hor-002", "name": "Testosterona Bioidentica", "description": "Reposicao hormonal para machos com deficiencia de testosterona. Formulacao personalizada.", "price": 210.00, "category": "hormonios", "image_url": "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwbW9kZXJufGVufDB8fHx8MTc3NjEyNTg3MXww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "mc-001", "name": "Formula Xiao Yao San", "description": "Formula tradicional chinesa adaptada para uso veterinario. Indicada para estresse, ansiedade e problemas hepaticos.", "price": 85.00, "category": "medicina-chinesa", "image_url": "https://images.unsplash.com/photo-1759863742702-41316e3db192?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxwZXQlMjB3ZWxsbmVzcyUyMGNhdCUyMGRvZyUyMG5hdHVyZXxlbnwwfHx8fDE3NzYxMjU4NTh8MA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "mc-002", "name": "Si Jun Zi Tang Veterinario", "description": "Formula chinesa para fortalecimento do sistema digestivo e imunologico. Ideal para animais debilitados.", "price": 78.00, "category": "medicina-chinesa", "image_url": "https://images.unsplash.com/photo-1759863742702-41316e3db192?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxwZXQlMjB3ZWxsbmVzcyUyMGNhdCUyMGRvZyUyMG5hdHVyZXxlbnwwfHx8fDE3NzYxMjU4NTh8MA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "cbd-001", "name": "Oleo CBD Full Spectrum 300mg", "description": "Oleo de CBD full spectrum para caes e gatos. Indicado para dor cronica, ansiedade e convulsoes. Dosagem por peso.", "price": 159.90, "category": "cbd", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "cbd-002", "name": "Petiscos CBD Calm", "description": "Petiscos funcionais com CBD para reducao de ansiedade e estresse em caes. Sabor frango.", "price": 89.90, "category": "cbd", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "acu-001", "name": "Sessao de Acupuntura - Avaliacao", "description": "Primeira sessao de acupuntura com avaliacao completa do animal. Inclui diagnostico pela medicina chinesa.", "price": 250.00, "category": "acupuntura", "image_url": "https://images.unsplash.com/photo-1621371236495-1520d8dc72a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJ5JTIwZG9nfGVufDB8fHx8MTc3NjEyNTg1OHww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "acu-002", "name": "Pacote 5 Sessoes de Acupuntura", "description": "Pacote com 5 sessoes de acupuntura veterinaria. Economia de 15% em relacao as sessoes individuais.", "price": 1062.50, "category": "acupuntura", "image_url": "https://images.unsplash.com/photo-1621371236495-1520d8dc72a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJ5JTIwZG9nfGVufDB8fHx8MTc3NjEyNTg1OHww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False}
    ]
    await db.products.insert_many(products)
    logger.info("Products seeded")

async def seed_testimonials():
    count = await db.testimonials.count_documents({})
    if count > 0:
        return
    testimonials = [
        {"id": "test-1", "name": "Maria Silva", "pet": "Luna (Golden Retriever)", "rating": 5, "text": "Minha Luna sofria com dores articulares ha anos. Depois do tratamento com acupuntura e homeopatia, ela voltou a correr como filhote! Equipe incrivel.", "avatar": "MS"},
        {"id": "test-2", "name": "Carlos Oliveira", "pet": "Thor (Bulldog Frances)", "rating": 5, "text": "O oleo CBD mudou a vida do Thor. Ele tinha crises de ansiedade terriveis e agora esta muito mais calmo e feliz. Recomendo demais!", "avatar": "CO"},
        {"id": "test-3", "name": "Ana Beatriz", "pet": "Mimi (Gata Persa)", "rating": 5, "text": "A Mimi tinha problemas digestivos cronicos. Com a medicina chinesa e homeopatia, ela melhorou 100%. Atendimento online super pratico.", "avatar": "AB"},
        {"id": "test-4", "name": "Roberto Santos", "pet": "Max (Pastor Alemao)", "rating": 5, "text": "Excelente atendimento! Os hormonios bioidenticos ajudaram muito o Max na velhice. A equipe e super atenciosa e o envio foi rapido.", "avatar": "RS"}
    ]
    await db.testimonials.insert_many(testimonials)
    logger.info("Testimonials seeded")

async def seed_tips():
    count = await db.tips.count_documents({})
    if count > 0:
        return
    tips = [
        {"id": "tip-1", "title": "CBD para Animais: O Guia Completo", "excerpt": "Entenda como o CBD pode ajudar no tratamento de dor, ansiedade e convulsoes em caes e gatos.", "content": "O canabidiol (CBD) tem ganhado cada vez mais espaco na medicina veterinaria integrativa...", "author": "Dra. Camila Santos", "category": "cbd", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "date": "2025-12-15", "read_time": "8 min"},
        {"id": "tip-2", "title": "Acupuntura Veterinaria: Mitos e Verdades", "excerpt": "Descubra como a acupuntura pode ser uma aliada poderosa na saude do seu animal.", "content": "A acupuntura e uma pratica milenar da medicina chinesa que tem se mostrado extremamente eficaz...", "author": "Dr. Ricardo Lima", "category": "acupuntura", "image_url": "https://images.unsplash.com/photo-1621371236495-1520d8dc72a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJ5JTIwZG9nfGVufDB8fHx8MTc3NjEyNTg1OHww&ixlib=rb-4.1.0&q=85", "date": "2025-11-28", "read_time": "6 min"},
        {"id": "tip-3", "title": "Homeopatia: Tratamento Natural para Pets", "excerpt": "Saiba como a homeopatia pode tratar diversas condicoes de forma suave e sem efeitos colaterais.", "content": "A homeopatia veterinaria segue os mesmos principios da homeopatia humana...", "author": "Dra. Patricia Mendes", "category": "homeopatia", "image_url": "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwbW9kZXJufGVufDB8fHx8MTc3NjEyNTg3MXww&ixlib=rb-4.1.0&q=85", "date": "2025-11-10", "read_time": "5 min"},
        {"id": "tip-4", "title": "Hormonios Bioidenticos na Veterinaria", "excerpt": "Como a reposicao hormonal bioidentica pode melhorar a qualidade de vida do seu pet.", "content": "Os hormonios bioidenticos sao sintetizados para serem quimicamente identicos...", "author": "Dr. Fernando Costa", "category": "hormonios", "image_url": "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwbW9kZXJufGVufDB8fHx8MTc3NjEyNTg3MXww&ixlib=rb-4.1.0&q=85", "date": "2025-10-20", "read_time": "7 min"}
    ]
    await db.tips.insert_many(tips)
    logger.info("Tips seeded")

async def seed_faq():
    count = await db.faq.count_documents({})
    if count > 0:
        return
    faqs = [
        {"id": "faq-1", "question": "Como funciona a consulta online?", "answer": "Voce agenda uma consulta pelo site, escolhe o horario e a especialidade desejada. Um veterinario especialista fara o atendimento por videochamada, avaliara seu pet e recomendara o melhor tratamento."},
        {"id": "faq-2", "question": "Os produtos sao seguros para meu animal?", "answer": "Sim! Todos os nossos produtos sao formulados e aprovados por veterinarios especialistas em medicina integrativa. Cada tratamento e personalizado para as necessidades do seu pet."},
        {"id": "faq-3", "question": "Como e feito o envio dos produtos?", "answer": "Enviamos para todo o Brasil via transportadora especializada. Produtos que precisam de refrigeracao sao embalados com caixas termicas. O prazo medio e de 3 a 7 dias uteis."},
        {"id": "faq-4", "question": "Preciso de receita veterinaria?", "answer": "Alguns produtos, como hormonios bioidenticos e CBD, necessitam de prescricao veterinaria. Voce pode obter a receita atraves de nossas consultas online ou com seu veterinario de confianca."},
        {"id": "faq-5", "question": "Qual a diferenca entre medicina integrativa e convencional?", "answer": "A medicina veterinaria integrativa combina o melhor da medicina convencional com terapias complementares como homeopatia, acupuntura e fitoterapia, buscando tratar o animal de forma holistica."},
        {"id": "faq-6", "question": "O CBD e legal para uso veterinario?", "answer": "Sim, o uso de CBD para animais e regulamentado no Brasil. Nossos produtos seguem todas as normas da ANVISA e do MAPA, garantindo seguranca e qualidade."}
    ]
    await db.faq.insert_many(faqs)
    logger.info("FAQ seeded")

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_admin()
    await seed_categories()
    await seed_products()
    await seed_testimonials()
    await seed_tips()
    await seed_faq()
    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin\n")
        f.write(f"- Email: {os.environ.get('ADMIN_EMAIL', 'admin@medvet.com')}\n")
        f.write(f"- Password: {os.environ.get('ADMIN_PASSWORD', 'admin123')}\n")
        f.write("- Role: admin\n\n")
        f.write("## Test User\n")
        f.write("- Email: test@medvet.com\n")
        f.write("- Password: test123\n")
        f.write("- Role: user\n")
        f.write("- (Register via /api/auth/register)\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/logout\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/refresh\n")
    logger.info("Startup complete")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
