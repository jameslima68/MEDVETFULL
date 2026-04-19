from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
import secrets
import asyncio
import hashlib
import qrcode
import io
import base64
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

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
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=2), "type": "access"}
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
        user["id"] = user["_id"]  # Add 'id' alias for consistency
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=7200, path="/")
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

class SubscriptionRequest(BaseModel):
    plan_id: str
    plan_name: str
    price: float

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    in_stock: Optional[bool] = None
    featured: Optional[bool] = None

class CheckoutRequest(BaseModel):
    product_id: str
    origin_url: str
    email: Optional[str] = None
    coupon_code: Optional[str] = None

class PixCheckoutRequest(BaseModel):
    product_id: str
    name: str
    email: str
    coupon_code: Optional[str] = None

class CouponCreate(BaseModel):
    code: str
    discount_type: str  # 'percentage' or 'fixed'
    discount_value: float
    min_purchase: float = 0
    max_uses: int = 100
    active: bool = True
    description: Optional[str] = None

# --- Email Helper ---
async def send_email_notification(to_email: str, subject: str, html_content: str):
    """Send email via Resend if API key available, otherwise log."""
    resend_key = os.environ.get("RESEND_API_KEY")
    if not resend_key:
        logger.info(f"[EMAIL LOG] To: {to_email} | Subject: {subject}")
        return {"status": "logged", "message": "Email logged (no RESEND_API_KEY)"}
    try:
        import resend
        resend.api_key = resend_key
        sender = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
        params = {"from": sender, "to": [to_email], "subject": subject, "html": html_content}
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"[EMAIL SENT] To: {to_email} | Subject: {subject}")
        return {"status": "sent", "email_id": result.get("id")}
    except Exception as e:
        logger.error(f"[EMAIL ERROR] {e}")
        return {"status": "error", "message": str(e)}

def build_purchase_email(product_name: str, amount: float, payment_method: str, tx_id: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F9F6F0;padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#2C4C3B;font-size:24px;margin:0;">MEDVET INTEGRATIVA</h1>
        <p style="color:#84978F;font-size:14px;">Medicina Veterinária Integrativa</p>
      </div>
      <div style="background:white;border-radius:16px;padding:24px;border:1px solid #E0DDD5;">
        <h2 style="color:#2C4C3B;font-size:20px;">Compra Confirmada!</h2>
        <p style="color:#4A6B5A;">Seu pedido foi processado com sucesso.</p>
        <table style="width:100%;margin:16px 0;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#84978F;">Produto:</td><td style="padding:8px 0;color:#1A2E24;font-weight:600;">{product_name}</td></tr>
          <tr><td style="padding:8px 0;color:#84978F;">Valor:</td><td style="padding:8px 0;color:#2C4C3B;font-weight:600;">R$ {amount:.2f}</td></tr>
          <tr><td style="padding:8px 0;color:#84978F;">Metodo:</td><td style="padding:8px 0;color:#1A2E24;">{payment_method}</td></tr>
          <tr><td style="padding:8px 0;color:#84978F;">ID:</td><td style="padding:8px 0;color:#84978F;font-size:12px;">{tx_id}</td></tr>
        </table>
        <p style="color:#4A6B5A;font-size:14px;">Entraremos em contato para combinar o envio. Obrigado pela preferência!</p>
      </div>
    </div>"""

def build_consultation_email(name: str, pet_name: str, category: str, date: str, time: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F9F6F0;padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#2C4C3B;font-size:24px;margin:0;">MEDVET INTEGRATIVA</h1>
        <p style="color:#84978F;font-size:14px;">Medicina Veterinária Integrativa</p>
      </div>
      <div style="background:white;border-radius:16px;padding:24px;border:1px solid #E0DDD5;">
        <h2 style="color:#2C4C3B;font-size:20px;">Consulta Agendada!</h2>
        <p style="color:#4A6B5A;">Ola {name}, sua consulta foi agendada com sucesso.</p>
        <table style="width:100%;margin:16px 0;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#84978F;">Pet:</td><td style="padding:8px 0;color:#1A2E24;font-weight:600;">{pet_name}</td></tr>
          <tr><td style="padding:8px 0;color:#84978F;">Especialidade:</td><td style="padding:8px 0;color:#1A2E24;">{category}</td></tr>
          <tr><td style="padding:8px 0;color:#84978F;">Data:</td><td style="padding:8px 0;color:#2C4C3B;font-weight:600;">{date}</td></tr>
          <tr><td style="padding:8px 0;color:#84978F;">Horario:</td><td style="padding:8px 0;color:#2C4C3B;font-weight:600;">{time}</td></tr>
        </table>
        <p style="color:#4A6B5A;font-size:14px;">Voce recebera um link de videochamada antes da consulta. Ate la!</p>
      </div>
    </div>"""

def generate_pix_code(amount: float, tx_id: str) -> dict:
    """Generate a simulated PIX payment code and QR code."""
    pix_key = "medvet@integrativa.com.br"
    # Simulated PIX copy-paste code
    raw = f"PIX{tx_id}{amount:.2f}{pix_key}"
    code_hash = hashlib.sha256(raw.encode()).hexdigest()[:32].upper()
    pix_copy_paste = f"00020126580014br.gov.bcb.pix0136{pix_key}5204000053039865404{amount:.2f}5802BR5925MEDVET INTEGRATIVA6009SAO PAULO62070503***6304{code_hash[:4]}"
    # Generate QR code as base64
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(pix_copy_paste)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#2C4C3B", back_color="#F9F6F0")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    return {"pix_key": pix_key, "pix_code": pix_copy_paste, "qr_code": f"data:image/png;base64,{qr_base64}", "tx_id": tx_id}

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
        response.set_cookie(key="access_token", value=new_access, httponly=True, secure=False, samesite="lax", max_age=7200, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# --- Products ---
@api_router.get("/products")
async def get_products(category: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        price_q = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        query["price"] = price_q
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    products = await db.products.find(query, {"_id": 0}).to_list(200)
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
    # Send confirmation email (async, non-blocking)
    asyncio.create_task(send_email_notification(
        req.email,
        "MEDVET Integrativa - Consulta Agendada",
        build_consultation_email(req.name, req.pet_name, req.category, req.date, req.time)
    ))
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

# --- Admin Guard ---
async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# --- Admin: Products CRUD ---
@api_router.post("/admin/products")
async def admin_create_product(req: ProductCreate, user: dict = Depends(get_admin_user)):
    doc = req.model_dump()
    doc["id"] = str(ObjectId())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, req: ProductUpdate, user: dict = Depends(get_admin_user)):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.products.update_one({"id": product_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, user: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# --- Admin: Consultations ---
@api_router.get("/admin/consultations")
async def admin_get_consultations(user: dict = Depends(get_admin_user)):
    consultations = await db.consultations.find({}, {"_id": 0}).to_list(500)
    return consultations

@api_router.put("/admin/consultations/{consultation_id}/status")
async def admin_update_consultation_status(consultation_id: str, status: str, user: dict = Depends(get_admin_user)):
    result = await db.consultations.update_one({"id": consultation_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return {"message": f"Status updated to {status}"}

# --- Admin: Stats ---
@api_router.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_admin_user)):
    products_count = await db.products.count_documents({})
    consultations_count = await db.consultations.count_documents({})
    users_count = await db.users.count_documents({})
    payments_count = await db.payment_transactions.count_documents({})
    paid_count = await db.payment_transactions.count_documents({"payment_status": "paid"})
    pipeline = [{"$match": {"payment_status": "paid"}}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    revenue_result = await db.payment_transactions.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    return {
        "products": products_count,
        "consultations": consultations_count,
        "users": users_count,
        "total_payments": payments_count,
        "paid_payments": paid_count,
        "total_revenue": total_revenue
    }

# --- Admin: Users ---
@api_router.get("/admin/users")
async def admin_get_users(user: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users

# --- Admin: Payments ---
@api_router.get("/admin/payments")
async def admin_get_payments(user: dict = Depends(get_admin_user)):
    payments = await db.payment_transactions.find({}, {"_id": 0}).to_list(500)
    return payments

# --- Stripe Payment ---
@api_router.post("/checkout")
async def create_checkout(req: CheckoutRequest, request: Request):
    product = await db.products.find_one({"id": req.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    final_price = float(product["price"])
    discount = 0.0
    coupon_code = ""
    if req.coupon_code:
        cv = await validate_coupon(req.coupon_code, final_price)
        if cv["valid"]:
            discount = cv["discount"]
            final_price = cv["final_price"]
            coupon_code = req.coupon_code.upper().strip()
            await db.coupons.update_one({"code": coupon_code}, {"$inc": {"uses": 1}})

    origin = req.origin_url.rstrip("/")
    success_url = f"{origin}/pagamento/sucesso?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/produtos"
    
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    metadata = {
        "product_id": product["id"],
        "product_name": product["name"],
        "source": "medvet_integrativa",
        "coupon": coupon_code
    }
    
    checkout_req = CheckoutSessionRequest(
        amount=final_price,
        currency="brl",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)
    
    tx = {
        "id": str(ObjectId()),
        "session_id": session.session_id,
        "product_id": product["id"],
        "product_name": product["name"],
        "amount": final_price,
        "original_price": float(product["price"]),
        "discount": discount,
        "coupon_code": coupon_code,
        "currency": "brl",
        "payment_method": "stripe",
        "payment_status": "pending",
        "status": "initiated",
        "email": req.email or "",
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(tx)
    tx.pop("_id", None)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    try:
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logger.error(f"Stripe status check error: {e}")
        # Check if we have local transaction data
        tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if tx:
            return {
                "status": tx.get("status", "unknown"),
                "payment_status": tx.get("payment_status", "pending"),
                "amount_total": int(tx.get("amount", 0) * 100),
                "currency": tx.get("currency", "brl"),
                "metadata": tx.get("metadata", {})
            }
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Update transaction
    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if tx:
        already_paid = tx.get("payment_status") == "paid"
        if not already_paid:
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "payment_status": checkout_status.payment_status,
                    "status": checkout_status.status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount_total": checkout_status.amount_total,
        "currency": checkout_status.currency,
        "metadata": checkout_status.metadata
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    try:
        event = await stripe_checkout.handle_webhook(body, sig)
        if event.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {"$set": {"payment_status": "paid", "status": "complete", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            # Send purchase email + loyalty points
            tx = await db.payment_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
            if tx and tx.get("email"):
                asyncio.create_task(send_email_notification(
                    tx["email"], "MEDVET Integrativa - Compra Confirmada",
                    build_purchase_email(tx.get("product_name", ""), tx.get("amount", 0), "Cartao (Stripe)", tx.get("id", ""))
                ))
                asyncio.create_task(award_loyalty_points(tx["email"], tx.get("amount", 0), tx.get("product_name", "")))
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# --- PIX Payment ---
@api_router.post("/checkout/pix")
async def create_pix_checkout(req: PixCheckoutRequest):
    product = await db.products.find_one({"id": req.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    final_price = float(product["price"])
    discount = 0.0
    coupon_code = ""
    if req.coupon_code:
        cv = await validate_coupon(req.coupon_code, final_price)
        if cv["valid"]:
            discount = cv["discount"]
            final_price = cv["final_price"]
            coupon_code = req.coupon_code.upper().strip()
            await db.coupons.update_one({"code": coupon_code}, {"$inc": {"uses": 1}})

    tx_id = str(ObjectId())
    pix_data = generate_pix_code(final_price, tx_id)
    
    tx = {
        "id": tx_id,
        "session_id": f"pix_{tx_id}",
        "product_id": product["id"],
        "product_name": product["name"],
        "amount": final_price,
        "original_price": float(product["price"]),
        "discount": discount,
        "coupon_code": coupon_code,
        "currency": "brl",
        "payment_method": "pix",
        "payment_status": "pending",
        "status": "awaiting_pix",
        "email": req.email,
        "customer_name": req.name,
        "pix_code": pix_data["pix_code"],
        "metadata": {"product_id": product["id"], "product_name": product["name"], "source": "medvet_pix"},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(tx)
    tx.pop("_id", None)
    
    # Send email with PIX info
    asyncio.create_task(send_email_notification(
        req.email, "MEDVET Integrativa - Pagamento PIX Pendente",
        f"""<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F9F6F0;padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#2C4C3B;font-size:24px;margin:0;">MEDVET INTEGRATIVA</h1>
        </div>
        <div style="background:white;border-radius:16px;padding:24px;border:1px solid #E0DDD5;">
          <h2 style="color:#2C4C3B;font-size:20px;">Pagamento PIX Pendente</h2>
          <p style="color:#4A6B5A;">Produto: <strong>{product['name']}</strong></p>
          <p style="color:#2C4C3B;font-size:24px;font-weight:bold;">R$ {product['price']:.2f}</p>
          <p style="color:#4A6B5A;">Chave PIX: <strong>{pix_data['pix_key']}</strong></p>
          <p style="color:#84978F;font-size:12px;">Apos o pagamento, sua compra sera confirmada em ate 24h.</p>
        </div></div>"""
    ))
    
    return {
        "tx_id": tx_id,
        "pix_key": pix_data["pix_key"],
        "pix_code": pix_data["pix_code"],
        "qr_code": pix_data["qr_code"],
        "amount": float(product["price"]),
        "product_name": product["name"]
    }

# --- Admin: Confirm PIX Payment ---
@api_router.put("/admin/payments/{tx_id}/confirm")
async def admin_confirm_pix(tx_id: str, user: dict = Depends(get_admin_user)):
    tx = await db.payment_transactions.find_one({"id": tx_id})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx.get("payment_status") == "paid":
        return {"message": "Already confirmed"}
    await db.payment_transactions.update_one(
        {"id": tx_id},
        {"$set": {"payment_status": "paid", "status": "complete", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    # Send confirmation email + award loyalty points
    if tx.get("email"):
        asyncio.create_task(send_email_notification(
            tx["email"], "MEDVET Integrativa - Compra Confirmada",
            build_purchase_email(tx.get("product_name", ""), tx.get("amount", 0), "PIX", tx_id)
        ))
        asyncio.create_task(award_loyalty_points(tx["email"], tx.get("amount", 0), tx.get("product_name", "")))
    return {"message": "Payment confirmed"}

# --- Purchase History ---
@api_router.get("/purchases")
async def get_purchases(user: dict = Depends(get_current_user)):
    email = user["email"]
    purchases = await db.payment_transactions.find({"email": email}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return purchases

# --- Coupons ---
async def validate_coupon(code: str, product_price: float) -> dict:
    """Validate coupon and return discount info."""
    if not code:
        return {"valid": False}
    coupon = await db.coupons.find_one({"code": code.upper().strip(), "active": True}, {"_id": 0})
    if not coupon:
        return {"valid": False, "error": "Cupom inválido ou expirado"}
    if coupon.get("uses", 0) >= coupon.get("max_uses", 100):
        return {"valid": False, "error": "Cupom esgotado"}
    if product_price < coupon.get("min_purchase", 0):
        return {"valid": False, "error": f"Compra minima de R$ {coupon['min_purchase']:.2f}"}
    if coupon["discount_type"] == "percentage":
        discount = round(product_price * coupon["discount_value"] / 100, 2)
    else:
        discount = min(coupon["discount_value"], product_price)
    final_price = round(product_price - discount, 2)
    return {"valid": True, "discount": discount, "final_price": final_price, "coupon": coupon}

@api_router.post("/coupons/validate")
async def validate_coupon_endpoint(code: str, product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    result = await validate_coupon(code, float(product["price"]))
    if not result["valid"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Cupom inválido"))
    return {
        "valid": True,
        "original_price": float(product["price"]),
        "discount": result["discount"],
        "final_price": result["final_price"],
        "coupon_code": code.upper().strip()
    }

# --- Admin: Coupons CRUD ---
@api_router.get("/admin/coupons")
async def admin_get_coupons(user: dict = Depends(get_admin_user)):
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(100)
    return coupons

@api_router.post("/admin/coupons")
async def admin_create_coupon(req: CouponCreate, user: dict = Depends(get_admin_user)):
    existing = await db.coupons.find_one({"code": req.code.upper().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    doc = req.model_dump()
    doc["id"] = str(ObjectId())
    doc["code"] = doc["code"].upper().strip()
    doc["uses"] = 0
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.coupons.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/admin/coupons/{coupon_id}")
async def admin_delete_coupon(coupon_id: str, user: dict = Depends(get_admin_user)):
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}

@api_router.put("/admin/coupons/{coupon_id}/toggle")
async def admin_toggle_coupon(coupon_id: str, user: dict = Depends(get_admin_user)):
    coupon = await db.coupons.find_one({"id": coupon_id})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    new_active = not coupon.get("active", True)
    await db.coupons.update_one({"id": coupon_id}, {"$set": {"active": new_active}})
    return {"active": new_active}

# --- Admin: Analytics/Reports ---
@api_router.get("/admin/analytics/revenue")
async def admin_revenue_analytics(user: dict = Depends(get_admin_user)):
    """Revenue by day for last 30 days."""
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": {"$substr": ["$created_at", 0, 10]}, "revenue": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
        {"$limit": 30}
    ]
    result = await db.payment_transactions.aggregate(pipeline).to_list(30)
    return [{"date": r["_id"], "revenue": r["revenue"], "count": r["count"]} for r in result]

@api_router.get("/admin/analytics/products")
async def admin_product_analytics(user: dict = Depends(get_admin_user)):
    """Products by category count and top sellers."""
    # By category
    cat_pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    by_category = await db.products.aggregate(cat_pipeline).to_list(20)
    # Top sold
    sold_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": "$product_name", "sold": {"$sum": 1}, "revenue": {"$sum": "$amount"}}},
        {"$sort": {"sold": -1}},
        {"$limit": 10}
    ]
    top_sold = await db.payment_transactions.aggregate(sold_pipeline).to_list(10)
    return {
        "by_category": [{"category": r["_id"], "count": r["count"]} for r in by_category],
        "top_sold": [{"product": r["_id"], "sold": r["sold"], "revenue": r["revenue"]} for r in top_sold]
    }

@api_router.get("/admin/analytics/consultations")
async def admin_consultation_analytics(user: dict = Depends(get_admin_user)):
    """Consultations by category and status."""
    cat_pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    by_category = await db.consultations.aggregate(cat_pipeline).to_list(20)
    status_pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    by_status = await db.consultations.aggregate(status_pipeline).to_list(10)
    return {
        "by_category": [{"category": r["_id"], "count": r["count"]} for r in by_category],
        "by_status": [{"status": r["_id"], "count": r["count"]} for r in by_status]
    }

@api_router.get("/admin/analytics/overview")
async def admin_overview(user: dict = Depends(get_admin_user)):
    """Overview metrics."""
    products = await db.products.count_documents({})
    consultations = await db.consultations.count_documents({})
    users = await db.users.count_documents({})
    total_payments = await db.payment_transactions.count_documents({})
    paid = await db.payment_transactions.count_documents({"payment_status": "paid"})
    pix_count = await db.payment_transactions.count_documents({"payment_method": "pix"})
    stripe_count = await db.payment_transactions.count_documents({"payment_method": "stripe"})
    rev_pipeline = [{"$match": {"payment_status": "paid"}}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    rev = await db.payment_transactions.aggregate(rev_pipeline).to_list(1)
    total_revenue = rev[0]["total"] if rev else 0
    coupons_active = await db.coupons.count_documents({"active": True})
    return {
        "products": products, "consultations": consultations, "users": users,
        "total_payments": total_payments, "paid_payments": paid,
        "pix_payments": pix_count, "stripe_payments": stripe_count,
        "total_revenue": total_revenue, "active_coupons": coupons_active
    }

# --- Customer Testimonials with Photo ---
class TestimonialSubmit(BaseModel):
    name: str
    pet: str
    text: str
    rating: int = 5
    photo_base64: Optional[str] = None
    video_url: Optional[str] = None  # YouTube/external video URL

class BlogArticleCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    image_url: Optional[str] = None
    read_time: Optional[str] = None

class SymptomQuery(BaseModel):
    pet_type: str  # cao, gato
    symptoms: List[str]
    severity: str  # leve, moderado, severo

@api_router.post("/testimonials/submit")
async def submit_testimonial(req: TestimonialSubmit, request: Request):
    """Submit a testimonial (optionally with photo). Needs auth."""
    user = None
    try:
        user = await get_current_user(request)
    except Exception:
        pass
    doc = {
        "id": str(ObjectId()),
        "name": req.name,
        "pet": req.pet,
        "text": req.text,
        "rating": min(max(req.rating, 1), 5),
        "photo": req.photo_base64 or "",
        "video_url": req.video_url or "",
        "avatar": req.name[:2].upper(),
        "email": user["email"] if user else "",
        "approved": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.customer_testimonials.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Depoimento enviado! Sera publicado apos aprovação.", "id": doc["id"]}

@api_router.get("/testimonials/approved")
async def get_approved_testimonials():
    testimonials = await db.customer_testimonials.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return testimonials

@api_router.get("/admin/testimonials")
async def admin_get_customer_testimonials(user: dict = Depends(get_admin_user)):
    testimonials = await db.customer_testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return testimonials

@api_router.put("/admin/testimonials/{tid}/approve")
async def admin_approve_testimonial(tid: str, user: dict = Depends(get_admin_user)):
    result = await db.customer_testimonials.update_one({"id": tid}, {"$set": {"approved": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Approved"}

@api_router.delete("/admin/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, user: dict = Depends(get_admin_user)):
    result = await db.customer_testimonials.delete_one({"id": tid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

# --- Loyalty Points ---
POINTS_PER_REAL = 10  # 10 points per R$1 spent

@api_router.get("/loyalty")
async def get_loyalty_info(user: dict = Depends(get_current_user)):
    """Get user's loyalty points and history."""
    loyalty = await db.loyalty.find_one({"email": user["email"]}, {"_id": 0})
    if not loyalty:
        loyalty = {"email": user["email"], "points": 0, "total_earned": 0, "total_redeemed": 0, "tier": "Bronze"}
    history = await db.loyalty_history.find({"email": user["email"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    # Determine tier
    total = loyalty.get("total_earned", 0)
    if total >= 10000:
        tier = "Ouro"
    elif total >= 5000:
        tier = "Prata"
    else:
        tier = "Bronze"
    loyalty["tier"] = tier
    return {"loyalty": loyalty, "history": history}

@api_router.post("/loyalty/redeem")
async def redeem_points(points: int, user: dict = Depends(get_current_user)):
    """Redeem points for a discount coupon."""
    if points < 500:
        raise HTTPException(status_code=400, detail="Mínimo 500 pontos para resgatar")
    loyalty = await db.loyalty.find_one({"email": user["email"]})
    if not loyalty or loyalty.get("points", 0) < points:
        raise HTTPException(status_code=400, detail="Pontos insuficientes")
    # Calculate discount: 500 points = R$5 discount
    discount_value = round(points / 100, 2)
    code = f"FIEL{str(ObjectId())[-6:].upper()}"
    # Create coupon
    await db.coupons.insert_one({
        "id": str(ObjectId()), "code": code, "discount_type": "fixed",
        "discount_value": discount_value, "min_purchase": 0, "max_uses": 1,
        "uses": 0, "active": True, "description": f"Cupom de fidelidade ({points} pontos)",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    # Deduct points
    await db.loyalty.update_one(
        {"email": user["email"]},
        {"$inc": {"points": -points, "total_redeemed": points}}
    )
    await db.loyalty_history.insert_one({
        "id": str(ObjectId()), "email": user["email"], "type": "redeem",
        "points": -points, "description": f"Resgate: cupom {code} (R$ {discount_value:.2f})",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"coupon_code": code, "discount_value": discount_value, "remaining_points": loyalty["points"] - points}

async def award_loyalty_points(email: str, amount: float, product_name: str):
    """Award points after a purchase. Called internally."""
    if not email:
        return
    points = int(amount * POINTS_PER_REAL)
    await db.loyalty.update_one(
        {"email": email},
        {"$inc": {"points": points, "total_earned": points}, "$setOnInsert": {"total_redeemed": 0}},
        upsert=True
    )
    await db.loyalty_history.insert_one({
        "id": str(ObjectId()), "email": email, "type": "earn",
        "points": points, "description": f"Compra: {product_name} (R$ {amount:.2f})",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    logger.info(f"[LOYALTY] {email} earned {points} points for {product_name}")

# --- Blog / Articles ---
@api_router.get("/blog")
async def get_blog_articles(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    articles = await db.blog_articles.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    return articles

@api_router.get("/blog/{article_id}")
async def get_blog_article(article_id: str):
    article = await db.blog_articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@api_router.post("/admin/blog")
async def admin_create_blog(req: BlogArticleCreate, user: dict = Depends(get_admin_user)):
    doc = req.model_dump()
    doc["id"] = str(ObjectId())
    doc["date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    doc["read_time"] = doc.get("read_time") or "5 min"
    await db.blog_articles.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/admin/blog/{article_id}")
async def admin_delete_blog(article_id: str, user: dict = Depends(get_admin_user)):
    result = await db.blog_articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

# --- Symptom Calculator ---
THERAPY_RECOMMENDATIONS = {
    "dor_crônica": {"therapies": ["Acupuntura", "Eletroacupuntura", "CBD", "Laserterapia", "Magnetoterapia"], "products": ["acupuntura", "cbd"], "urgency": "moderado"},
    "ansiedade": {"therapies": ["Florais de Bach", "Reiki", "Cromoterapia", "Musicoterapia", "CBD"], "products": ["cbd", "cromoterapia"], "urgency": "leve"},
    "problemas_digestivos": {"therapies": ["Fitoterapia Chinesa", "Homeopatia", "Nutrição Funcional", "Acupuntura", "Dietoterapia"], "products": ["medicina-chinesa", "homeopatia"], "urgency": "moderado"},
    "problemas_pele": {"therapies": ["Homeopatia", "Ozonioterapia", "Geoterapia", "Nutrição Funcional", "Fitoterapia"], "products": ["homeopatia", "saúde-pelos"], "urgency": "leve"},
    "problemas_articulares": {"therapies": ["Acupuntura", "Fisioterapia", "Hidroterapia", "Quiropraxia", "PRP"], "products": ["acupuntura"], "urgency": "moderado"},
    "problemas_neurologicos": {"therapies": ["Acupuntura", "Eletroacupuntura", "Moxabustao", "Celulas-Tronco", "Fisioterapia"], "products": ["acupuntura", "medicina-chinesa"], "urgency": "severo"},
    "alergia": {"therapies": ["Homeopatia", "Biorressonancia", "Nutrição Funcional", "Ozonioterapia", "Fitoterapia"], "products": ["homeopatia", "saúde-pelos"], "urgency": "leve"},
    "trauma_emocional": {"therapies": ["Florais de Bach", "Reiki", "Constelacao Familiar", "Cromoterapia", "Musicoterapia"], "products": ["cromoterapia"], "urgency": "leve"},
    "pos_cirurgico": {"therapies": ["Laserterapia", "Fisioterapia", "Hidroterapia", "Acupuntura", "PRP"], "products": ["acupuntura"], "urgency": "moderado"},
    "cancer": {"therapies": ["Viscum Album", "Ozonioterapia", "Acupuntura", "Fitoterapia Chinesa", "CBD"], "products": ["medicina-chinesa", "cbd"], "urgency": "severo"},
    "problemas_respiratórios": {"therapies": ["Acupuntura", "Fitoterapia Chinesa", "Ozonioterapia", "Homeopatia", "Cromoterapia"], "products": ["homeopatia", "medicina-chinesa"], "urgency": "moderado"},
    "idoso_qualidade_vida": {"therapies": ["Acupuntura", "Moxabustao", "Hormônios Bioidênticos", "Nutrição Funcional", "Massoterapia"], "products": ["hormonios", "acupuntura"], "urgency": "leve"},
    "convulsoes": {"therapies": ["CBD", "Acupuntura", "Homeopatia", "Fitoterapia Chinesa", "Terapia Neural"], "products": ["cbd"], "urgency": "severo"},
    "feridas": {"therapies": ["Ozonioterapia", "Laserterapia", "Apiterapia", "Geoterapia", "PRP"], "products": [], "urgency": "moderado"},
    "obesidade": {"therapies": ["Nutrição Funcional", "Hidroterapia", "Acupuntura", "Fitoterapia", "Fisioterapia"], "products": ["saúde-pelos"], "urgency": "leve"},
    "queda_pelos": {"therapies": ["Nutrição Funcional", "Homeopatia", "Ozonioterapia", "Hormônios Bioidênticos", "Fitoterapia"], "products": ["saúde-pelos", "hormonios"], "urgency": "leve"},
}

@api_router.post("/symptom-calculator")
async def symptom_calculator(req: SymptomQuery):
    results = []
    all_therapies = set()
    all_products = set()
    max_urgency = "leve"
    urgency_levels = {"leve": 0, "moderado": 1, "severo": 2}
    for symptom in req.symptoms:
        rec = THERAPY_RECOMMENDATIONS.get(symptom)
        if rec:
            results.append({"symptom": symptom, **rec})
            all_therapies.update(rec["therapies"])
            all_products.update(rec["products"])
            if urgency_levels.get(rec["urgency"], 0) > urgency_levels.get(max_urgency, 0):
                max_urgency = rec["urgency"]
    # Adjust severity
    if req.severity == "severo":
        max_urgency = "severo"
    return {
        "recommended_therapies": sorted(list(all_therapies)),
        "recommended_categories": sorted(list(all_products)),
        "overall_urgency": max_urgency,
        "details": results,
        "message": "Consulte sempre um veterinário antes de iniciar qualquer tratamento."
    }

@api_router.get("/symptom-calculator/symptoms")
async def get_available_symptoms():
    symptoms = {
        "Dor e Mobilidade": [
            {"id": "dor_crônica", "label": "Dor crônica"},
            {"id": "problemas_articulares", "label": "Problemas articulares (artrite, displasia)"},
            {"id": "pos_cirurgico", "label": "Recuperação pós-cirúrgica"},
        ],
        "Pele e Pelagem": [
            {"id": "problemas_pele", "label": "Problemas de pele e dermatites"},
            {"id": "alergia", "label": "Alergias"},
            {"id": "queda_pelos", "label": "Queda excessiva de pelos"},
        ],
        "Emocional e Comportamental": [
            {"id": "ansiedade", "label": "Ansiedade e estresse"},
            {"id": "trauma_emocional", "label": "Trauma emocional e medo"},
        ],
        "Digestivo e Metabolico": [
            {"id": "problemas_digestivos", "label": "Problemas digestivos"},
            {"id": "obesidade", "label": "Obesidade"},
        ],
        "Neurologico e Grave": [
            {"id": "problemas_neurologicos", "label": "Problemas neurologicos"},
            {"id": "convulsoes", "label": "Convulsoes e epilepsia"},
            {"id": "cancer", "label": "Suporte oncologico"},
        ],
        "Outros": [
            {"id": "problemas_respiratórios", "label": "Problemas respiratórios"},
            {"id": "feridas", "label": "Feridas e cicatrizacao"},
            {"id": "idoso_qualidade_vida", "label": "Qualidade de vida (pet idoso)"},
        ],
    }
    return symptoms

# --- Subscriptions ---
@api_router.post("/subscriptions")
async def create_subscription(req: SubscriptionRequest, user: dict = Depends(get_current_user)):
    existing = await db.subscriptions.find_one({"email": user["email"], "status": "active"})
    if existing:
        raise HTTPException(status_code=400, detail="Voce ja possui uma assinatura ativa. Cancele a atual para assinar outro plano.")
    next_month = datetime.now(timezone.utc) + timedelta(days=30)
    doc = {
        "id": str(ObjectId()),
        "email": user["email"],
        "user_name": user.get("name", ""),
        "plan_id": req.plan_id,
        "plan_name": req.plan_name,
        "price": req.price,
        "status": "active",
        "next_delivery": next_month.strftime("%d/%m/%Y"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.subscriptions.insert_one(doc)
    doc.pop("_id", None)
    asyncio.create_task(send_email_notification(
        user["email"],
        f"MEDVET Integrativa - Assinatura {req.plan_name} Ativada",
        f"""<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F9F6F0;padding:32px;">
        <h1 style="color:#2C4C3B;text-align:center;">MEDVET INTEGRATIVA</h1>
        <div style="background:white;border-radius:16px;padding:24px;border:1px solid #E0DDD5;">
          <h2 style="color:#2C4C3B;">Assinatura Ativada!</h2>
          <p style="color:#4A6B5A;">Plano: <strong>{req.plan_name}</strong></p>
          <p style="color:#2C4C3B;font-size:24px;font-weight:bold;">R$ {req.price:.2f}/mes</p>
          <p style="color:#4A6B5A;">Próximo envio: <strong>{next_month.strftime('%d/%m/%Y')}</strong></p>
        </div></div>"""
    ))
    return doc

@api_router.get("/subscriptions")
async def get_user_subscriptions(user: dict = Depends(get_current_user)):
    subs = await db.subscriptions.find({"email": user["email"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return subs

@api_router.put("/subscriptions/{sub_id}/cancel")
async def cancel_subscription(sub_id: str, user: dict = Depends(get_current_user)):
    result = await db.subscriptions.update_one(
        {"id": sub_id, "email": user["email"], "status": "active"},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found or already cancelled")
    return {"message": "Assinatura cancelada"}

@api_router.get("/admin/subscriptions")
async def admin_get_subscriptions(user: dict = Depends(get_admin_user)):
    subs = await db.subscriptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return subs

# --- Contact ---
@api_router.post("/contact")
async def create_contact(req: ContactRequest):
    doc = req.model_dump()
    doc["id"] = str(ObjectId())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Message sent successfully", "id": doc["id"]}

# ===== MEUS PETS =====
class PetCreate(BaseModel):
    name: str
    species: str  # cao, gato, outro
    breed: str = ""
    age_years: int = 0
    age_months: int = 0
    weight_kg: float = 0
    conditions: List[str] = []
    notes: str = ""

@api_router.get("/pets")
async def get_user_pets(user=Depends(get_current_user)):
    pets = await db.pets.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return pets

@api_router.post("/pets")
async def create_pet(pet: PetCreate, user=Depends(get_current_user)):
    doc = pet.model_dump()
    doc["id"] = str(ObjectId())
    doc["user_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.pets.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/pets/{pet_id}")
async def update_pet(pet_id: str, pet: PetCreate, user=Depends(get_current_user)):
    update_data = pet.model_dump()
    result = await db.pets.update_one({"id": pet_id, "user_id": user["id"]}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pet not found")
    updated = await db.pets.find_one({"id": pet_id}, {"_id": 0})
    return updated

@api_router.delete("/pets/{pet_id}")
async def delete_pet(pet_id: str, user=Depends(get_current_user)):
    result = await db.pets.delete_one({"id": pet_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pet not found")
    return {"message": "Pet removed"}

# ===== CHAT ESPECIALISTA =====
THERAPY_KNOWLEDGE = {
    "acupuntura": "A acupuntura veterinária é parte da Medicina Tradicional Chinesa. Utiliza agulhas em meridianos para restaurar o Qi. Indicada para dor crônica, doenças neurológicas, problemas articulares e digestivos. Estimula endorfinas naturais.",
    "homeopatia": "A homeopatia veterinária usa medicamentos altamente diluídos baseados no princípio 'semelhante cura semelhante'. Tratamento individualizado, sem efeitos colaterais. Indicada para todas as idades e espécies.",
    "fitoterapia": "A fitoterapia usa plantas medicinais para tratamento e prevenção. Cúrcuma (anti-inflamatório), gengibre (digestivo), camomila (calmante), equinácea (imunoestimulante). Fórmulas manipuladas sob medida.",
    "cbd": "O CBD (canabidiol) é um fitocanabinóide não psicoativo. Atua no sistema endocanabinoide. Indicado para dor crônica, epilepsia refratária, ansiedade e inflamação. Regulamentado pela ANVISA.",
    "florais": "Florais de Bach são essências vibracionais de flores silvestres. Tratam desequilíbrios emocionais: medos, ansiedade de separação, agressividade, ciúmes, luto. Sem contraindicações.",
    "nutricao": "Nutrição funcional veterinária usa alimentos como ferramenta terapêutica. Inclui alimentação natural (AN), dieta cetogênica e BARF. Cada plano é personalizado pelo veterinário nutrólogo.",
    "cromoterapia": "Cromoterapia usa cores do espectro solar para equilíbrio. Azul (calma), verde (imunidade), vermelho (vitalidade). Complementar a outros tratamentos.",
    "hormonios": "Hormônios bioidênticos têm estrutura idêntica aos naturais. Melhor metabolizados, menos efeitos colaterais. Para tireoide, adrenal, menopausa animal.",
    "ozonioterapia": "Ozonioterapia aplica mistura de oxigênio e ozônio. Anti-inflamatória, antisséptica, fortalece imunidade. Para feridas crônicas, infecções, articulações.",
    "reiki": "Reiki é terapia energética japonesa. Equilibra campo energético via imposição de mãos. Promove relaxamento, acelera cicatrização. Animais são naturalmente receptivos.",
    "fisioterapia": "Fisioterapia veterinária inclui hidroterapia, cinesioterapia e eletroterapia. Recupera mobilidade, fortalece musculatura. Fundamental no pós-operatório.",
    "quiropraxia": "Quiropraxia veterinária alinha coluna e sistema nervoso. Ajustes manuais suaves. Para dor, rigidez, claudicação.",
    "neural": "Terapia neural aplica microdoses de anestésicos em pontos específicos. Reseta campos interferentes de dor crônica.",
    "pelagem": "Saúde da pelagem reflete saúde interna. Óleos prensados a frio (gergelim, coco, linhaça), ômega 3/6, biotina, zinco. Nutrição de dentro para fora.",
}

class ChatMessage(BaseModel):
    message: str
    pet_id: Optional[str] = None
    context: str = "geral"  # geral, terapia, produto

def generate_specialist_response(message: str, pet_info: dict = None, context: str = "geral"):
    """Generate a contextual response based on keywords. Will be replaced by AI later."""
    msg_lower = message.lower()
    response_parts = []

    # Pet context
    if pet_info:
        species_name = {"cao": "cão", "gato": "gato"}.get(pet_info.get("species", ""), "pet")
        response_parts.append(f"Considerando que seu {species_name}")
        if pet_info.get("breed"):
            response_parts[-1] += f" da raça {pet_info['breed']}"
        if pet_info.get("age_years"):
            response_parts[-1] += f" com {pet_info['age_years']} ano(s)"
        if pet_info.get("weight_kg"):
            response_parts[-1] += f" e {pet_info['weight_kg']}kg"
        if pet_info.get("conditions"):
            response_parts[-1] += f", com histórico de {', '.join(pet_info['conditions'])}"
        response_parts[-1] += ":"

    # Match therapy keywords
    matched_therapy = None
    for key, knowledge in THERAPY_KNOWLEDGE.items():
        if key in msg_lower or any(w in msg_lower for w in key.split()):
            matched_therapy = key
            response_parts.append(knowledge)
            break

    # General topic matching
    if not matched_therapy:
        if any(w in msg_lower for w in ["dor", "inflamação", "artrite", "artrose"]):
            response_parts.append("Para dor e inflamação, as terapias mais indicadas são: acupuntura (alívio imediato), ozonioterapia (anti-inflamatório), CBD (manejo crônico) e fisioterapia (reabilitação). A combinação de terapias costuma trazer os melhores resultados.")
        elif any(w in msg_lower for w in ["ansiedade", "medo", "estresse", "nervoso"]):
            response_parts.append("Para questões emocionais e comportamentais, recomendamos: Florais de Bach (medos e ansiedade), Reiki (relaxamento energético), musicoterapia (redução de estresse) e CBD (ansiedade severa). A nutrição funcional também ajuda no equilíbrio emocional.")
        elif any(w in msg_lower for w in ["alimentação", "dieta", "ração", "comida", "nutrição"]):
            response_parts.append("Na nutrição integrativa veterinária, trabalhamos com alimentação natural (AN), dieta cetogênica e nutrição funcional. Cada plano é personalizado conforme espécie, porte, idade e condições de saúde. A suplementação com ômega 3, probióticos e vitaminas é essencial.")
        elif any(w in msg_lower for w in ["pelo", "pelagem", "queda", "coceira", "pele"]):
            response_parts.append("Para saúde da pelagem, recomendamos: óleos prensados a frio (gergelim, coco, linhaça), suplementação com ômega 3/6, biotina e zinco. A nutrição de dentro para fora é fundamental. A fitoterapia chinesa também oferece fórmulas específicas para pele e pelos.")
        elif any(w in msg_lower for w in ["câncer", "tumor", "oncologia"]):
            response_parts.append("No tratamento oncológico integrativo, utilizamos: dieta cetogênica (corta glicose do tumor), Viscum album/antroposofia (fortalece imunidade), ozonioterapia (complementar), acupuntura (manejo da dor) e fitoterapia (suporte hepático). Sempre em conjunto com o tratamento convencional.")
        elif any(w in msg_lower for w in ["convulsão", "epilepsia", "neurológico"]):
            response_parts.append("Para distúrbios neurológicos, as abordagens integrativas incluem: acupuntura (neuromodulação), CBD (epilepsia refratária), dieta cetogênica (neuroprotetora), homeopatia (constitucional) e fisioterapia (reabilitação neurológica).")
        else:
            response_parts.append("Obrigado pela sua pergunta! Na medicina veterinária integrativa, tratamos o animal como um ser completo — corpo, mente e espírito. Temos mais de 25 terapias disponíveis, desde acupuntura e homeopatia até nutrição funcional e terapia com CBD.")

    # Add recommendation
    if pet_info and pet_info.get("conditions"):
        response_parts.append("\nCom base no histórico do seu pet, recomendo agendar uma consulta para uma avaliação personalizada.")
    else:
        response_parts.append("\nPara uma orientação mais precisa, recomendo cadastrar seu pet em 'Meus Pets' com os dados completos (raça, idade, peso e condições de saúde).")

    response_parts.append("\n*Importante: Esta orientação é informativa e não substitui a consulta com um veterinário especialista.*")

    return " ".join(response_parts)

@api_router.post("/chat")
async def chat_with_specialist(msg: ChatMessage, request: Request):
    user = None
    pet_info = None
    try:
        user = await get_current_user(request)
    except:
        pass

    if msg.pet_id and user:
        pet_doc = await db.pets.find_one({"id": msg.pet_id, "user_id": user["id"]}, {"_id": 0})
        if pet_doc:
            pet_info = pet_doc

    response_text = generate_specialist_response(msg.message, pet_info, msg.context)

    # Save chat history if user logged in
    if user:
        chat_doc = {
            "id": str(ObjectId()),
            "user_id": user["id"],
            "pet_id": msg.pet_id,
            "user_message": msg.message,
            "specialist_response": response_text,
            "context": msg.context,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_history.insert_one(chat_doc)

    return {"response": response_text, "pet_used": pet_info is not None}

@api_router.get("/chat/history")
async def get_chat_history(user=Depends(get_current_user), limit: int = 20):
    chats = await db.chat_history.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    return chats

# ===== VIDEO PORTAL =====
THERAPY_VIDEOS = [
    {"id": "vid-acupuntura", "therapy": "acupuntura", "title": "Acupuntura Veterinária: Alívio Natural da Dor", "description": "Descubra como a acupuntura pode aliviar dores crônicas e inflamações no seu pet de forma natural e sem efeitos colaterais.", "duration": "4s", "tags": ["acupuntura", "dor", "MTC"], "video_file": "acupuntura.mp4", "thumbnail": "https://images.unsplash.com/photo-1584738620467-51b852c2af2e?w=400&h=300&fit=crop"},
    {"id": "vid-fitoterapia", "therapy": "fitoterapia", "title": "Fitoterapia: A Cura pelas Plantas", "description": "Conheça as plantas medicinais mais utilizadas na medicina veterinária integrativa e seus benefícios comprovados.", "duration": "4s", "tags": ["fitoterapia", "ervas", "natural"], "video_file": "fitoterapia.mp4", "thumbnail": "https://images.unsplash.com/photo-1545840716-c82e9eec6930?w=400&h=300&fit=crop"},
    {"id": "vid-bem-estar", "therapy": "geral", "title": "Bem-estar Pet: Dicas de Cuidado Integrativo", "description": "Dicas práticas de bem-estar e cuidados integrativos para manter seu pet saudável e feliz todos os dias.", "duration": "4s", "tags": ["bem-estar", "dicas", "cuidados"], "video_file": "bem-estar.mp4", "thumbnail": "https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop"},
    {"id": "vid-homeopatia", "therapy": "homeopatia", "title": "Homeopatia: Cura Suave e Natural", "description": "Entenda como a homeopatia veterinária estimula a autocura do organismo do seu pet.", "duration": "placeholder", "tags": ["homeopatia", "natural"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1564316911608-6b51e3a3cf3d?w=400&h=300&fit=crop"},
    {"id": "vid-ozonioterapia", "therapy": "ozonioterapia", "title": "Ozonioterapia: Oxigênio que Cura", "description": "Saiba como a mistura de oxigênio e ozônio pode combater inflamações e fortalecer a imunidade do seu pet.", "duration": "placeholder", "tags": ["ozonioterapia", "imunidade"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop"},
    {"id": "vid-reiki", "therapy": "reiki", "title": "Reiki para Pets: Energia que Equilibra", "description": "O poder da energia Reiki no relaxamento e cura dos nossos companheiros de quatro patas.", "duration": "placeholder", "tags": ["reiki", "energia", "relaxamento"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=300&fit=crop"},
    {"id": "vid-cbd", "therapy": "cbd", "title": "CBD Veterinário: Manejo Natural da Dor", "description": "Como o canabidiol pode ajudar pets com dor crônica, ansiedade e convulsões.", "duration": "placeholder", "tags": ["CBD", "dor", "ansiedade"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1610243684348-dc537f6067ca?w=400&h=300&fit=crop"},
    {"id": "vid-florais", "therapy": "florais", "title": "Florais de Bach: Equilíbrio Emocional", "description": "Tratando medos, ansiedade e agressividade com as essências florais de Bach.", "duration": "placeholder", "tags": ["florais", "emocional", "ansiedade"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1585383234137-2367d3c5302d?w=400&h=300&fit=crop"},
    {"id": "vid-fisioterapia", "therapy": "fisioterapia", "title": "Fisioterapia Pet: Recuperando a Mobilidade", "description": "Hidroterapia, eletroterapia e exercícios terapêuticos para devolver qualidade de vida.", "duration": "placeholder", "tags": ["fisioterapia", "reabilitação"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1612830565936-6388483d801b?w=400&h=300&fit=crop"},
    {"id": "vid-nutricao", "therapy": "nutricao", "title": "Alimentação Natural: Nutrição como Medicina", "description": "Dieta cetogênica, BARF e alimentação funcional para pets mais saudáveis.", "duration": "placeholder", "tags": ["nutrição", "dieta", "natural"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1745252798506-29500efc5b39?w=400&h=300&fit=crop"},
    {"id": "vid-cromoterapia", "therapy": "cromoterapia", "title": "Cromoterapia: Cores que Curam", "description": "O poder terapêutico das cores no equilíbrio físico e emocional dos pets.", "duration": "placeholder", "tags": ["cromoterapia", "cores", "energia"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=300&fit=crop"},
    {"id": "vid-neural", "therapy": "neural", "title": "Terapia Neural: Resetando a Dor", "description": "Como a terapia neural restaura o sistema nervoso e alivia dores crônicas.", "duration": "placeholder", "tags": ["neural", "dor", "nervoso"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop"},
    {"id": "vid-hormonios", "therapy": "hormonios", "title": "Hormônios Bioidênticos: Equilíbrio Natural", "description": "Reposição hormonal com moléculas naturais para restaurar a vitalidade do seu pet.", "duration": "placeholder", "tags": ["hormônios", "bioidênticos"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1582719299074-be127353065f?w=400&h=300&fit=crop"},
    {"id": "vid-quiropraxia", "therapy": "quiropraxia", "title": "Quiropraxia Veterinária: Alinhamento e Bem-estar", "description": "Ajustes vertebrais suaves para melhorar a função física e reduzir dores.", "duration": "placeholder", "tags": ["quiropraxia", "coluna"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1596058939740-516d0d71f3d4?w=400&h=300&fit=crop"},
    {"id": "vid-massoterapia", "therapy": "massoterapia", "title": "Massoterapia Pet: Relaxamento Profundo", "description": "Técnicas manuais que liberam tensões e promovem bem-estar no seu animal.", "duration": "placeholder", "tags": ["massoterapia", "relaxamento"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1596058939740-516d0d71f3d4?w=400&h=300&fit=crop"},
    {"id": "vid-hidroterapia", "therapy": "hidroterapia", "title": "Hidroterapia: Reabilitação na Água", "description": "Reabilitação de baixo impacto usando as propriedades terapêuticas da água.", "duration": "placeholder", "tags": ["hidroterapia", "reabilitação"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop"},
    {"id": "vid-celulas", "therapy": "celulas", "title": "Células-Tronco: Regeneração Avançada", "description": "A fronteira da medicina regenerativa aplicada à veterinária integrativa.", "duration": "placeholder", "tags": ["células-tronco", "regeneração"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1582719299074-be127353065f?w=400&h=300&fit=crop"},
    {"id": "vid-comportamento", "therapy": "geral", "title": "Comportamento Pet: Entendendo seu Animal", "description": "Dicas para entender e melhorar o comportamento do seu pet com abordagem integrativa.", "duration": "placeholder", "tags": ["comportamento", "dicas", "bem-estar"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1584738620467-51b852c2af2e?w=400&h=300&fit=crop"},
    {"id": "vid-pelagem", "therapy": "pelagem", "title": "Pelagem Saudável: Nutrição de Dentro para Fora", "description": "Como manter os pelos do seu pet brilhantes e saudáveis com óleos naturais e nutrição.", "duration": "placeholder", "tags": ["pelagem", "nutrição", "óleos"], "video_file": None, "thumbnail": "https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop"},
]

@api_router.get("/videos")
async def get_videos(therapy: str = None):
    videos = THERAPY_VIDEOS.copy()
    if therapy:
        videos = [v for v in videos if v["therapy"] == therapy or v["therapy"] == "geral"]
    result = []
    for v in videos:
        video_url = None
        if v["video_file"]:
            video_path = ROOT_DIR / "static" / "videos" / v["video_file"]
            if video_path.exists():
                video_url = f"/api/static/videos/{v['video_file']}"
        result.append({
            "id": v["id"],
            "therapy": v["therapy"],
            "title": v["title"],
            "description": v["description"],
            "duration": v["duration"],
            "tags": v["tags"],
            "thumbnail": v["thumbnail"],
            "video_url": video_url,
            "has_video": video_url is not None
        })
    return result

@api_router.get("/social/config")
async def get_social_config():
    return {
        "instagram": {
            "username": os.environ.get("INSTAGRAM_USERNAME", ""),
            "profile_url": os.environ.get("INSTAGRAM_URL", ""),
            "configured": bool(os.environ.get("INSTAGRAM_USERNAME"))
        },
        "tiktok": {
            "username": os.environ.get("TIKTOK_USERNAME", ""),
            "profile_url": os.environ.get("TIKTOK_URL", ""),
            "configured": bool(os.environ.get("TIKTOK_USERNAME"))
        },
        "youtube": {
            "channel_id": os.environ.get("YOUTUBE_CHANNEL_ID", ""),
            "channel_url": os.environ.get("YOUTUBE_URL", ""),
            "configured": bool(os.environ.get("YOUTUBE_CHANNEL_ID"))
        }
    }

# Include router
app.include_router(api_router)

# Static files for videos
static_dir = ROOT_DIR / "static"
static_dir.mkdir(exist_ok=True)
(static_dir / "videos").mkdir(exist_ok=True)
app.mount("/api/static", StaticFiles(directory=str(static_dir)), name="static")

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
    await db.categories.drop()
    categories = [
        {"id": "homeopatia", "name": "Homeopatia Veterinária", "slug": "homeopatia", "description": "Medicamentos homeopaticos manipulados para seu pet, promovendo equilíbrio e saúde de forma suave e eficaz.", "image_url": "https://images.unsplash.com/photo-1564316911608-6b51e3a3cf3d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwzfHxob21lb3BhdGhpYyUyMG1lZGljaW5lJTIwZ2xvYnVsZXMlMjB2aWFsc3xlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85", "icon": "Leaf"},
        {"id": "hormonios", "name": "Hormônios Bioidênticos", "slug": "hormonios", "description": "Terapia hormonal bioidentica e vitaminas manipuladas para animais, restaurando o equilíbrio naturalmente.", "image_url": "https://images.unsplash.com/photo-1579154204601-01588f351e67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHw0fHxiaW9pZGVudGljYWwlMjBob3Jtb25lJTIwdGhlcmFweSUyMGNvbXBvdW5kaW5nJTIwcGhhcm1hY3l8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "icon": "FlaskConical"},
        {"id": "medicina-chinesa", "name": "Medicina Chinesa", "slug": "medicina-chinesa", "description": "Fórmulas manipuladas da medicina tradicional chinesa adaptadas para uso veterinário.", "image_url": "https://images.unsplash.com/photo-1545840716-c82e9eec6930?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxjaGluZXNlJTIwaGVyYmFsJTIwbWVkaWNpbmUlMjB0cmFkaXRpb25hbHxlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85", "icon": "Yin"},
        {"id": "cbd", "name": "CBD para Pets", "slug": "cbd", "description": "Óleos e produtos a base de CBD para alivio de dor, ansiedade e inflamação em animais.", "image_url": "https://images.unsplash.com/photo-1610243684348-dc537f6067ca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwyfHxjYmQlMjBvaWwlMjBkcm9wcGVyJTIwcGV0JTIwd2VsbG5lc3N8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "icon": "Droplets"},
        {"id": "acupuntura", "name": "Acupuntura Veterinária", "slug": "acupuntura", "description": "Sessoes de acupuntura para tratamento de dor crônica, reabilitação e bem-estar animal.", "image_url": "https://images.unsplash.com/photo-1584738620467-51b852c2af2e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJ5JTIwYWN1cHVuY3R1cmUlMjBkb2clMjB0cmVhdG1lbnR8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "icon": "Target"},
        {"id": "saúde-pelos", "name": "Saúde dos Pelos", "slug": "saúde-pelos", "description": "Produtos naturais e dicas de alimentação para pelagem brilhante e saudavel. Óleos prensados a frio, suplementos e nutrição.", "image_url": "https://images.unsplash.com/photo-1603890227524-e6f9a790c263?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwyfHxkb2clMjBzaGlueSUyMGNvYXQlMjBncm9vbWluZyUyMGhlYWx0aHklMjBmdXIlMjBwZXR8ZW58MHx8fHwxNzc2MTgyMzA2fDA&ixlib=rb-4.1.0&q=85", "icon": "Sparkles"},
        {"id": "cromoterapia", "name": "Cromoterapia para Pets", "slug": "cromoterapia", "description": "Terapia das cores para equilíbrio fisico e emocional do seu pet. Lampadas LED, cristais, agua solarizada e sessões profissionais.", "image_url": "https://images.unsplash.com/photo-1618018353764-685cb47681d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwzfHxjb2xvciUyMHRoZXJhcHklMjBsaWdodCUyMExFRCUyMHJhaW5ib3clMjBwcmlzbSUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "icon": "Rainbow"},
        {"id": "terapia-alimentar", "name": "Terapia Alimentar", "slug": "terapia-alimentar", "description": "Alimentação cetogênica, natural e funcional como ferramenta terapêutica. Rações naturais, kits cetogênicos e suplementos nutricionais para pets.", "image_url": "https://images.unsplash.com/photo-1745252798506-29500efc5b39?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwcGV0JTIwZm9vZCUyMHJhdyUyMGRpZXQlMjBoZWFsdGh5JTIwZG9nJTIwbWVhbHxlbnwwfHx8fDE3NzYyMDQzNDd8MA&ixlib=rb-4.1.0&q=85", "icon": "UtensilsCrossed"},
        {"id": "dicas", "name": "Dicas de Especialistas", "slug": "dicas", "description": "Conteúdo educacional e dicas de veterinários especialistas em medicina integrativa.", "image_url": "https://images.unsplash.com/photo-1762686796610-acde6d785ad3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwYWN1cHVuY3R1cmUlMjBkb2clMjB0cmVhdG1lbnR8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "icon": "BookOpen"}
    ]
    await db.categories.insert_many(categories)
    logger.info("Categories seeded")

async def seed_products():
    await db.products.drop()
    # Image URLs organized by category
    IMG_HOM = [
        "https://images.unsplash.com/photo-1564316911608-6b51e3a3cf3d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwzfHxob21lb3BhdGhpYyUyMG1lZGljaW5lJTIwZ2xvYnVsZXMlMjB2aWFsc3xlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1619278874214-7eb5d1b7498a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwyfHxob21lb3BhdGhpYyUyMG1lZGljaW5lJTIwZ2xvYnVsZXMlMjB2aWFsc3xlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1722843065077-f47ea1269bd8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwxfHxob21lb3BhdGhpYyUyMG1lZGljaW5lJTIwZ2xvYnVsZXMlMjB2aWFsc3xlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1675897386680-a0645eb60784?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHw0fHxob21lb3BhdGhpYyUyMG1lZGljaW5lJTIwZ2xvYnVsZXMlMjB2aWFsc3xlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1771128264855-1c032332cbc8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwaGVyYmFsJTIwbWVkaWNpbmUlMjBib3R0bGVzJTIwdGluY3R1cmV8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
    ]
    IMG_HOR = [
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHw0fHxiaW9pZGVudGljYWwlMjBob3Jtb25lJTIwdGhlcmFweSUyMGNvbXBvdW5kaW5nJTIwcGhhcm1hY3l8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1582719299074-be127353065f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwzfHxiaW9pZGVudGljYWwlMjBob3Jtb25lJTIwdGhlcmFweSUyMGNvbXBvdW5kaW5nJTIwcGhhcm1hY3l8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1669272454802-011adc62cd9a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBjYXBzdWxlcyUyMGJvdHRsZXN8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1704694671866-f83e0b91df09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBjYXBzdWxlcyUyMGJvdHRsZXN8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1622328138102-7a8f5b7e0aba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwzfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBjYXBzdWxlcyUyMGJvdHRsZXN8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1662673146101-b9ce6400578b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBjYXBzdWxlcyUyMGJvdHRsZXN8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
    ]
    IMG_MC = [
        "https://images.unsplash.com/photo-1572005256772-af4c47972590?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwaGVyYmFsJTIwbWVkaWNpbmUlMjB0cmFkaXRpb25hbHxlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1545840716-c82e9eec6930?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxjaGluZXNlJTIwaGVyYmFsJTIwbWVkaWNpbmUlMjB0cmFkaXRpb25hbHxlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1771128264855-1c032332cbc8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwaGVyYmFsJTIwbWVkaWNpbmUlMjBib3R0bGVzJTIwdGluY3R1cmV8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1574586595103-6775e147e412?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHw0fHxjaGluZXNlJTIwaGVyYmFsJTIwbWVkaWNpbmUlMjB0cmFkaXRpb25hbHxlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85",
    ]
    IMG_CBD = [
        "https://images.unsplash.com/photo-1610243684348-dc537f6067ca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwyfHxjYmQlMjBvaWwlMjBkcm9wcGVyJTIwcGV0JTIwd2VsbG5lc3N8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1573461221473-5af59bdac980?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxjYmQlMjBvaWwlMjBkcm9wcGVyJTIwcGV0JTIwd2VsbG5lc3N8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1623099354893-9a1fbd0dbb3f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwzfHxjYmQlMjBvaWwlMjBkcm9wcGVyJTIwcGV0JTIwd2VsbG5lc3N8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1596645116033-bbcf5a34dccb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBkcm9wcGVyJTIwcGV0JTIwd2VsbG5lc3N8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
    ]
    IMG_ACU = [
        "https://images.unsplash.com/photo-1762686796610-acde6d785ad3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwYWN1cHVuY3R1cmUlMjBkb2clMjB0cmVhdG1lbnR8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1584738620467-51b852c2af2e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJ5JTIwYWN1cHVuY3R1cmUlMjBkb2clMjB0cmVhdG1lbnR8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1612830565936-6388483d801b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwzfHx2ZXRlcmluYXJ5JTIwYWN1cHVuY3R1cmUlMjBkb2clMjB0cmVhdG1lbnR8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1757866332863-e43fee27df10?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJ5JTIwYWN1cHVuY3R1cmUlMjBkb2clMjB0cmVhdG1lbnR8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85",
    ]
    products = [
        # ===== HOMEOPATIA - Manipulados =====
        {"id": "hom-001", "name": "Arnica Montana 30CH Manipulada", "description": "Medicamento homeopatico manipulado indicado para traumas, contusoes e dores musculares em caes e gatos. Globulos de facil administração, preparados sob encomenda.", "price": 45.90, "category": "homeopatia", "image_url": IMG_HOM[0], "in_stock": True, "featured": True},
        {"id": "hom-002", "name": "Nux Vomica 12CH Manipulada", "description": "Formula manipulada ideal para problemas digestivos, nauseas e intoxicacoes em animais. Tratamento homeopatico suave e personalizado.", "price": 39.90, "category": "homeopatia", "image_url": IMG_HOM[1], "in_stock": True, "featured": False},
        {"id": "hom-003", "name": "Phosphorus 200CH Manipulado", "description": "Preparação manipulada para problemas hepaticos e respiratórios em animais. Alta potencia para casos crônicos, com dosagem personalizada.", "price": 52.90, "category": "homeopatia", "image_url": IMG_HOM[2], "in_stock": True, "featured": False},
        {"id": "hom-004", "name": "Belladonna 30CH Manipulada", "description": "Formula manipulada para febres agudas, inflamacoes e dores intensas. Indicada para quadros agudos com inicio subito em pets.", "price": 42.90, "category": "homeopatia", "image_url": IMG_HOM[3], "in_stock": True, "featured": False},
        {"id": "hom-005", "name": "Chamomilla 12CH Manipulada", "description": "Manipulado homeopatico para irritabilidade, denticao dolorosa e colicas. Muito utilizado em filhotes e animais jovens.", "price": 38.90, "category": "homeopatia", "image_url": IMG_HOM[4], "in_stock": True, "featured": False},
        {"id": "hom-006", "name": "Rhus Toxicodendron 30CH Manipulado", "description": "Preparação manipulada para rigidez articular, artrite e dores que melhoram com movimento. Ideal para caes idosos.", "price": 48.90, "category": "homeopatia", "image_url": IMG_HOM[0], "in_stock": True, "featured": False},
        {"id": "hom-007", "name": "Calcarea Carbonica 200CH Manipulada", "description": "Formula manipulada constitucional para animais com tendencia a obesidade, problemas ósseos e metabolismo lento.", "price": 55.90, "category": "homeopatia", "image_url": IMG_HOM[1], "in_stock": True, "featured": False},
        {"id": "hom-008", "name": "Sulphur 30CH Manipulado", "description": "Manipulado homeopatico para problemas de pele crônicos, alergias cutaneas e prurido persistente em caes e gatos.", "price": 44.90, "category": "homeopatia", "image_url": IMG_HOM[2], "in_stock": True, "featured": False},
        {"id": "hom-009", "name": "Lycopodium 200CH Manipulado", "description": "Preparação manipulada para disturbios digestivos crônicos, problemas hepaticos e flatulencia excessiva em animais.", "price": 49.90, "category": "homeopatia", "image_url": IMG_HOM[3], "in_stock": True, "featured": False},
        {"id": "hom-010", "name": "Apis Mellifica 30CH Manipulada", "description": "Formula manipulada para edemas, picadas de inseto, reacoes alergicas agudas e inflamacoes com inchaco em pets.", "price": 41.90, "category": "homeopatia", "image_url": IMG_HOM[4], "in_stock": True, "featured": False},
        {"id": "hom-011", "name": "Kit Homeopatico Emergencial Manipulado", "description": "Kit com 5 remedios homeopaticos manipulados essenciais para emergencias: Arnica, Aconitum, Belladonna, Apis e Nux Vomica.", "price": 159.90, "category": "homeopatia", "image_url": IMG_HOM[0], "in_stock": True, "featured": True},

        # ===== HORMONIOS BIOIDENTICOS =====
        {"id": "hor-001", "name": "Progesterona Bioidentica Manipulada", "description": "Hormonio bioidentico manipulado para femeas com desequilíbrio hormonal. Dosagem personalizada conforme exames. Uso sob prescricao veterinária.", "price": 189.90, "category": "hormonios", "image_url": IMG_HOR[0], "in_stock": True, "featured": True},
        {"id": "hor-002", "name": "Testosterona Bioidentica Manipulada", "description": "Reposicao hormonal bioidentica para machos com deficiência de testosterona. Formulacao personalizada em creme ou injetavel.", "price": 210.00, "category": "hormonios", "image_url": IMG_HOR[1], "in_stock": True, "featured": True},
        {"id": "hor-003", "name": "Ocitocina Bioidentica Manipulada", "description": "Hormonio bioidentico manipulado para auxiliar em partos, lactacao e comportamento maternal. Formulacao nasal ou injetavel.", "price": 175.00, "category": "hormonios", "image_url": IMG_HOR[0], "in_stock": True, "featured": False},
        # Complexo B completo
        {"id": "hor-004", "name": "Vitamina B1 (Tiamina) Manipulada", "description": "Vitamina B1 manipulada para suporte ao sistema nervoso e metabolismo energético. Essencial para funcao cerebral em caes e gatos.", "price": 35.90, "category": "hormonios", "image_url": IMG_HOR[2], "in_stock": True, "featured": False},
        {"id": "hor-005", "name": "Vitamina B2 (Riboflavina) Manipulada", "description": "Vitamina B2 manipulada para saúde ocular, pele e produção de energia celular. Importante para metabolismo de gorduras e proteínas.", "price": 35.90, "category": "hormonios", "image_url": IMG_HOR[3], "in_stock": True, "featured": False},
        {"id": "hor-006", "name": "Vitamina B3 (Niacina) Manipulada", "description": "Vitamina B3 manipulada para saúde cardiovascular e suporte ao metabolismo. Auxilia na funcao digestiva e saúde da pele.", "price": 37.90, "category": "hormonios", "image_url": IMG_HOR[4], "in_stock": True, "featured": False},
        {"id": "hor-007", "name": "Vitamina B5 (Acido Pantotenico) Manipulada", "description": "Vitamina B5 manipulada essencial para produção de hormonios, metabolismo de nutrientes e cicatrizacao. Suporte adrenal.", "price": 36.90, "category": "hormonios", "image_url": IMG_HOR[5], "in_stock": True, "featured": False},
        {"id": "hor-008", "name": "Vitamina B6 (Piridoxina) Manipulada", "description": "Vitamina B6 manipulada para funcao cerebral, produção de neurotransmissores e metabolismo de aminoácidos em animais.", "price": 36.90, "category": "hormonios", "image_url": IMG_HOR[2], "in_stock": True, "featured": False},
        {"id": "hor-009", "name": "Vitamina B7 (Biotina) Manipulada", "description": "Biotina manipulada para saúde da pele, pelos e unhas. Auxilia no metabolismo de carboidratos e fortalece a pelagem.", "price": 38.90, "category": "hormonios", "image_url": IMG_HOR[3], "in_stock": True, "featured": False},
        {"id": "hor-010", "name": "Vitamina B9 (Acido Folico) Manipulada", "description": "Acido folico manipulado essencial para formação celular, gestacao saudavel e prevenção de anemias em animais.", "price": 34.90, "category": "hormonios", "image_url": IMG_HOR[4], "in_stock": True, "featured": False},
        {"id": "hor-011", "name": "Vitamina B12 (Cobalamina) Manipulada", "description": "Vitamina B12 manipulada para funcao neurológica, formação de globulos vermelhos e energia. Essencial para caes e gatos.", "price": 42.90, "category": "hormonios", "image_url": IMG_HOR[5], "in_stock": True, "featured": False},
        {"id": "hor-012", "name": "Complexo B Completo Manipulado", "description": "Formula manipulada com todas as vitaminas do complexo B (B1, B2, B3, B5, B6, B7, B9 e B12) em dosagem veterinária otimizada.", "price": 89.90, "category": "hormonios", "image_url": IMG_HOR[2], "in_stock": True, "featured": True},
        # Vitamina D
        {"id": "hor-013", "name": "Vitamina D2 (Ergocalciferol) Manipulada", "description": "Vitamina D2 manipulada de origem vegetal para suporte osseo e imunológico. Indicada para animais com baixa exposição solar.", "price": 45.90, "category": "hormonios", "image_url": IMG_HOR[3], "in_stock": True, "featured": False},
        {"id": "hor-014", "name": "Vitamina D3 (Colecalciferol) Manipulada", "description": "Vitamina D3 manipulada para absorcao de calcio, saúde ossea e funcao imunologica. A forma mais biodisponivel de vitamina D.", "price": 48.90, "category": "hormonios", "image_url": IMG_HOR[4], "in_stock": True, "featured": True},
        {"id": "hor-015", "name": "Calcifediol (25-OH Vitamina D) Manipulado", "description": "Forma ativa da vitamina D manipulada para casos de insuficiência severa. Absorcao rapida e eficiente, uso sob prescricao.", "price": 68.90, "category": "hormonios", "image_url": IMG_HOR[5], "in_stock": True, "featured": False},
        {"id": "hor-016", "name": "Complexo Vitamina D Completo Manipulado", "description": "Formula manipulada com D2, D3 e Calcifediol em proporcoes otimizadas, associada a vitamina K2 para melhor absorcao de calcio.", "price": 95.90, "category": "hormonios", "image_url": IMG_HOR[0], "in_stock": True, "featured": False},
        {"id": "hor-017", "name": "DHEA Bioidentico Manipulado", "description": "Hormonio precursor manipulado para suporte hormonal geral em animais idosos. Auxilia na vitalidade e funcao imunologica.", "price": 165.00, "category": "hormonios", "image_url": IMG_HOR[1], "in_stock": True, "featured": False},
        {"id": "hor-018", "name": "Melatonina Bioidentica Manipulada", "description": "Melatonina manipulada para regulacao do ciclo sono-vigilia, alopecia sazonal e suporte imunológico em caes e gatos.", "price": 55.90, "category": "hormonios", "image_url": IMG_HOR[2], "in_stock": True, "featured": False},

        # ===== MEDICINA CHINESA - Manipulados =====
        {"id": "mc-001", "name": "Xiao Yao San Manipulado Veterinário", "description": "Formula tradicional chinesa manipulada e adaptada para uso veterinário. Indicada para estresse, ansiedade e estagnacao do Qi do Fígado.", "price": 85.00, "category": "medicina-chinesa", "image_url": IMG_MC[0], "in_stock": True, "featured": True},
        {"id": "mc-002", "name": "Si Jun Zi Tang Manipulado Veterinário", "description": "Formula dos Quatro Cavalheiros manipulada para fortalecer o Qi do Baco. Ideal para animais com digestao fraça e fadiga crônica.", "price": 78.00, "category": "medicina-chinesa", "image_url": IMG_MC[1], "in_stock": True, "featured": False},
        {"id": "mc-003", "name": "Liu Wei Di Huang Wan Manipulado", "description": "Pilula dos Seis Ingredientes manipulada para nutrir o Yin do Rim. Indicada para animais idosos com sede excessiva e calor.", "price": 82.00, "category": "medicina-chinesa", "image_url": IMG_MC[2], "in_stock": True, "featured": False},
        {"id": "mc-004", "name": "Bu Zhong Yi Qi Tang Manipulado", "description": "Formula manipulada para elevar o Qi do meio. Indicada para prolapsos, diarreia crônica e fraqueza pós-cirúrgica em animais.", "price": 88.00, "category": "medicina-chinesa", "image_url": IMG_MC[3], "in_stock": True, "featured": False},
        {"id": "mc-005", "name": "Gui Pi Tang Manipulado Veterinário", "description": "Formula manipulada para nutrir Sangue e Qi. Indicada para anemias, insonia e palpitacoes em caes e gatos.", "price": 86.00, "category": "medicina-chinesa", "image_url": IMG_MC[0], "in_stock": True, "featured": False},
        {"id": "mc-006", "name": "Yin Qiao San Manipulado Veterinário", "description": "Formula manipulada para invasao de Vento-Calor. Indicada para inicio de infeccoes respiratorias, febre e garganta inflamada.", "price": 72.00, "category": "medicina-chinesa", "image_url": IMG_MC[1], "in_stock": True, "featured": False},
        {"id": "mc-007", "name": "Ba Zhen Tang Manipulado", "description": "Formula das Oito Preciosidades manipulada para deficiência de Qi e Sangue. Ideal para animais debilitados e em recuperação.", "price": 92.00, "category": "medicina-chinesa", "image_url": IMG_MC[2], "in_stock": True, "featured": True},
        {"id": "mc-008", "name": "Du Huo Ji Sheng Tang Manipulado", "description": "Formula manipulada para dores articulares, rigidez e sindrome Bi. Muito usada em caes com displasia e artrose.", "price": 95.00, "category": "medicina-chinesa", "image_url": IMG_MC[3], "in_stock": True, "featured": False},
        {"id": "mc-009", "name": "Shen Ling Bai Zhu San Manipulado", "description": "Formula manipulada para fortalecer Baco e drenar Umidade. Indicada para diarreia crônica, edema e obesidade em pets.", "price": 79.00, "category": "medicina-chinesa", "image_url": IMG_MC[0], "in_stock": True, "featured": False},
        {"id": "mc-010", "name": "Xue Fu Zhu Yu Tang Manipulado", "description": "Formula manipulada para mover Sangue e eliminar estase. Indicada para dores fixas, tumores e problemas circulatorios.", "price": 98.00, "category": "medicina-chinesa", "image_url": IMG_MC[1], "in_stock": True, "featured": False},

        # ===== CBD =====
        {"id": "cbd-001", "name": "Óleo CBD Full Spectrum 300mg", "description": "Óleo de CBD full spectrum para caes e gatos. Indicado para dor crônica, ansiedade e convulsoes. Dosagem por peso do animal.", "price": 159.90, "category": "cbd", "image_url": IMG_CBD[0], "in_stock": True, "featured": True},
        {"id": "cbd-002", "name": "Petiscos CBD Calm", "description": "Petiscos funcionais com CBD para reducao de ansiedade e estresse em caes. Sabor frango natural.", "price": 89.90, "category": "cbd", "image_url": IMG_CBD[1], "in_stock": True, "featured": False},
        {"id": "cbd-003", "name": "Óleo CBD Isolado 500mg", "description": "CBD isolado de alta concentração para animais de grande porte. Sem THC, ideal para caes com sensibilidade.", "price": 219.90, "category": "cbd", "image_url": IMG_CBD[2], "in_stock": True, "featured": False},
        {"id": "cbd-004", "name": "Balsamo CBD Topico para Pets", "description": "Balsamo topico com CBD para aplicacao local em articulacoes, musculos e pele inflamada. Alivio rápido e natural.", "price": 129.90, "category": "cbd", "image_url": IMG_CBD[3], "in_stock": True, "featured": True},
        {"id": "cbd-005", "name": "Óleo CBD para Gatos 150mg", "description": "Formulacao especifica para felinos com CBD em baixa concentração. Para ansiedade, dor e inflamação em gatos.", "price": 139.90, "category": "cbd", "image_url": IMG_CBD[0], "in_stock": True, "featured": False},

        # ===== ACUPUNTURA =====
        {"id": "acu-001", "name": "Sessao de Acupuntura - Avaliacao Inicial", "description": "Primeira sessao de acupuntura com avaliacao completa do animal. Inclui diagnóstico pela medicina chinesa e plano de tratamento.", "price": 250.00, "category": "acupuntura", "image_url": IMG_ACU[0], "in_stock": True, "featured": True},
        {"id": "acu-002", "name": "Pacote 5 Sessoes de Acupuntura", "description": "Pacote com 5 sessões de acupuntura veterinária. Economia de 15% em relacao as sessões individuais.", "price": 1062.50, "category": "acupuntura", "image_url": IMG_ACU[1], "in_stock": True, "featured": False},
        {"id": "acu-003", "name": "Pacote 10 Sessoes de Acupuntura", "description": "Pacote completo com 10 sessões para tratamentos prolongados. Economia de 25%. Inclui reavaliacao mensal.", "price": 1875.00, "category": "acupuntura", "image_url": IMG_ACU[2], "in_stock": True, "featured": True},
        {"id": "acu-004", "name": "Sessao de Eletroacupuntura", "description": "Sessao de acupuntura com estimulacao eletrica para potencializar o efeito analgesico. Indicada para dores crônicas severas.", "price": 290.00, "category": "acupuntura", "image_url": IMG_ACU[3], "in_stock": True, "featured": False},
        {"id": "acu-005", "name": "Sessao de Moxabustao Veterinária", "description": "Terapia com aplicacao de calor nos pontos de acupuntura usando moxa. Ideal para condicoes de frio e deficiência de Yang.", "price": 220.00, "category": "acupuntura", "image_url": IMG_ACU[0], "in_stock": True, "featured": False},

        # ===== SAUDE DOS PELOS =====
        {"id": "pel-001", "name": "Óleo de Gergelim Prensado a Frio", "description": "Óleo de gergelim puro, prensado a frio, para uso topico e oral. Rico em vitamina E, acidos graxos e antioxidantes. Nutre a pele, fortalece os pelos e promove brilho natural. Uso: adicionar a ração ou aplicar diretamente na pelagem.", "price": 49.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1543416689-e3a7ed4dd3b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxzZXNhbWUlMjBvaWwlMjBuYXR1cmFsJTIwY29sZCUyMHByZXNzZWQlMjBib3R0bGUlMjBvcmdhbmljfGVufDB8fHx8MTc3NjE4MjMwNnww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "pel-002", "name": "Óleo de Coco Extra Virgem para Pets", "description": "Óleo de coco prensado a frio para hidratar pele e pelos. Rico em acido laurico com propriedades antibacterianas e antifungicas. Ideal para pele ressecada e pelagem opaca.", "price": 42.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1552592074-ea7a91b851b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxzZXNhbWUlMjBvaWwlMjBuYXR1cmFsJTIwY29sZCUyMHByZXNzZWQlMjBib3R0bGUlMjBvcmdhbmljfGVufDB8fHx8MTc3NjE4MjMwNnww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "pel-003", "name": "Ômega 3-6-9 Veterinário", "description": "Suplemento completo de acidos graxos essenciais para saúde da pele e pelagem. Fonte de EPA e DHA de óleo de peixe. Reduz inflamação e promove pelos sedosos.", "price": 79.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1693996047034-311ab7656691?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwzfHxvbWVnYSUyMGZpc2glMjBvaWwlMjBzdXBwbGVtZW50JTIwcGV0JTIwbnV0cml0aW9ufGVufDB8fHx8MTc3NjE4MjMwNnww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "pel-004", "name": "Biotina + Zinco Manipulados", "description": "Formula manipulada com biotina (vitamina B7) e zinco quelatado para fortalecimento de pelos e unhas. Essencial para animais com queda excessiva de pelos.", "price": 55.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1669272454802-011adc62cd9a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBjYXBzdWxlcyUyMGJvdHRsZXN8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "pel-005", "name": "Shampoo Natural de Aveia e Aloe Vera", "description": "Shampoo sem sulfatos formulado com aveia coloidal e aloe vera. Acalma peles sensiveis, reduz coceira e deixa a pelagem macia e brilhante.", "price": 38.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1590518563786-901882bf6f82?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw0fHxzZXNhbWUlMjBvaWwlMjBuYXR1cmFsJTIwY29sZCUyMHByZXNzZWQlMjBib3R0bGUlMjBvcmdhbmljfGVufDB8fHx8MTc3NjE4MjMwNnww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "pel-006", "name": "Mix Nutricional Pelagem Brilhante", "description": "Suplemento alimentar em po com linhaça, chia, spirulina e levedura de cerveja. Adicione a ração diariamente para pelagem exuberante e pele saudavel.", "price": 65.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1549530708-be1b34900690?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxzZXNhbWUlMjBvaWwlMjBuYXR1cmFsJTIwY29sZCUyMHByZXNzZWQlMjBib3R0bGUlMjBvcmdhbmljfGVufDB8fHx8MTc3NjE4MjMwNnww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "pel-007", "name": "Óleo de Linhaça Dourada Prensado a Frio", "description": "Fonte vegetal de Ômega 3 (ALA) para saúde da pele. Reduz inflamação, combate dermatites e promove crescimento saudavel dos pelos. Ideal para caes e gatos.", "price": 44.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1662673145204-c843cb1d6ff0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwyfHxvbWVnYSUyMGZpc2glMjBvaWwlMjBzdXBwbGVtZW50JTIwcGV0JTIwbnV0cml0aW9ufGVufDB8fHx8MTc3NjE4MjMwNnww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "pel-008", "name": "Condicionador Leave-in Karite e Argan", "description": "Condicionador sem enxague com manteiga de karite e óleo de argan. Desembaraça, hidrata profundamente e protege a pelagem contra ressecamento.", "price": 45.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1757553532952-401e0b0e9386?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHw0fHxkb2clMjBzaGlueSUyMGNvYXQlMjBncm9vbWluZyUyMGhlYWx0aHklMjBmdXIlMjBwZXR8ZW58MHx8fHwxNzc2MTgyMzA2fDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "pel-009", "name": "Kit Pelagem Saudável Completo", "description": "Kit completo com Óleo de Gergelim, Ômega 3-6-9, Biotina+Zinco e Shampoo Natural. Tudo que seu pet precisa para uma pelagem exuberante. Economia de 20%.", "price": 169.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1694372550345-9149dddc390f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwzfHxkb2clMjBzaGlueSUyMGNvYXQlMjBncm9vbWluZyUyMGhlYWx0aHklMjBmdXIlMjBwZXR8ZW58MHx8fHwxNzc2MTgyMzA2fDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "pel-010", "name": "Ração Natural para Pelagem - Receita Ayurvedica", "description": "Suplemento alimentar inspirado na Ayurveda com curcuma, ashwagandha e ghee para nutrir a pelagem de dentro para fora. Fortalece os folículos e promove brilho natural.", "price": 89.90, "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1673859360498-0034d111358c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxkb2clMjBzaGlueSUyMGNvYXQlMjBncm9vbWluZyUyMGhlYWx0aHklMjBmdXIlMjBwZXR8ZW58MHx8fHwxNzc2MTgyMzA2fDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},

        # ===== CROMOTERAPIA =====
        {"id": "cro-001", "name": "Lampada LED Cromoterapia 7 Cores Pet", "description": "Lampada LED com 7 cores terapêuticas e controle remoto. Cada cor possui vibração especifica: azul (calmante), verde (equilibrante), vermelho (energizante), amarelo (cicatrizante). Ideal para sessões de cromoterapia em casa.", "price": 129.90, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1652759718142-5e6f8ece161c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxjb2xvciUyMHRoZXJhcHklMjBsaWdodCUyMExFRCUyMHJhaW5ib3clMjBwcmlzbSUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "cro-002", "name": "Bastao Cromatico com Cristal de Quartzo", "description": "Bastao cromatico profissional com ponteira de cristal de quartzo e 12 filtros de cores. Usado por veterinários para aplicacao pontual de cromoterapia em pontos de acupuntura e areas especificas.", "price": 189.90, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1663899940839-06ff68bebd50?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHw0fHxjcnlzdGFsJTIwaGVhbGluZyUyMHN0b25lcyUyMGNvbG9yZnVsJTIwYW1ldGh5c3QlMjBxdWFydHp8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "cro-003", "name": "Kit Água Solarizada 7 Cores", "description": "Kit com 7 garrafas de vidro colorido para preparação de agua solarizada. Cada cor carrega a vibração da luz solar: azul (relaxamento), verde (imunidade), amarelo (digestao), vermelho (vitalidade). Inclui manual de uso veterinário.", "price": 149.90, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1597858949210-e255261302fc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxjb2xvciUyMHRoZXJhcHklMjBsaWdodCUyMExFRCUyMHJhaW5ib3clMjBwcmlzbSUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "cro-004", "name": "Kit Cristais Terapeuticos para Pets", "description": "Kit com 7 cristais alinhados aos chakras: ametista (calmante), quartzo rosa (amor), citrino (energia), turmalina negra (protecao), quartzo verde (cura), sodalita (comunicacao), jaspe vermelho (vitalidade). Para ambientacao do espaco do pet.", "price": 119.90, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1753734051140-962fa3908a4a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwzfHxjcnlzdGFsJTIwaGVhbGluZyUyMHN0b25lcyUyMGNvbG9yZnVsJTIwYW1ldGh5c3QlMjBxdWFydHp8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "cro-005", "name": "Colchonete Cromatico Calmante - Azul", "description": "Colchonete com tecido na tonalidade azul terapêutica para area de descanso do pet. A cor azul promove relaxamento, reduz ansiedade e melhora a qualidade do sono. Tecido antialergico e lavavel.", "price": 89.90, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1587020439742-866b7cf5bd7c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHw0fHxjb2xvciUyMHRoZXJhcHklMjBsaWdodCUyMExFRCUyMHJhaW5ib3clMjBwcmlzbSUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "cro-006", "name": "Sessao de Cromoterapia Veterinária", "description": "Sessao profissional de cromoterapia com veterinário especialista. Inclui avaliacao energética, aplicacao de cores terapêuticas com bastao cromatico e lampada LED, e plano de tratamento personalizado.", "price": 180.00, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1618018353764-685cb47681d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwzfHxjb2xvciUyMHRoZXJhcHklMjBsaWdodCUyMExFRCUyMHJhaW5ib3clMjBwcmlzbSUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "cro-007", "name": "Pacote 5 Sessoes de Cromoterapia", "description": "Pacote com 5 sessões de cromoterapia veterinária com 15% de desconto. Inclui acompanhamento semanal e ajuste de cores conforme evolucao do tratamento.", "price": 765.00, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1585383234137-2367d3c5302d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwyfHxjcnlzdGFsJTIwaGVhbGluZyUyMHN0b25lcyUyMGNvbG9yZnVsJTIwYW1ldGh5c3QlMjBxdWFydHp8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "cro-008", "name": "Luminaria Terapeutica Noturna para Pets", "description": "Luminaria com luz suave em tons de azul e violeta para uso noturno. Reduz insonia, ansiedade noturna e medo de fogos de artificio. Sensor de luminosidade automatico e consumo mínimo de energia.", "price": 79.90, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1641997644736-e4f82b939e71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHxjcnlzdGFsJTIwaGVhbGluZyUyMHN0b25lcyUyMGNvbG9yZnVsJTIwYW1ldGh5c3QlMjBxdWFydHp8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "cro-009", "name": "Óleo Essencial Cromatico Verde - Equilibrio", "description": "Blend de óleos essenciais associado a vibração da cor verde (eucalipto, alecrim, horteña). Para uso em difusor no ambiente do pet. Promove equilíbrio, alivia dores respiratorias e estimula imunidade.", "price": 59.90, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1552592074-ea7a91b851b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxzZXNhbWUlMjBvaWwlMjBuYXR1cmFsJTIwY29sZCUyMHByZXNzZWQlMjBib3R0bGUlMjBvcmdhbmljfGVufDB8fHx8MTc3NjE4MjMwNnww&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "cro-010", "name": "Kit Cromoterapia Completo para Casa", "description": "Kit completo para práticar cromoterapia em casa: Lampada LED 7 cores, kit agua solarizada, 7 cristais terapêuticos, luminaria noturna e manual ilustrado de cromoterapia veterinária. Economia de 20%.", "price": 399.90, "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1652759718142-5e6f8ece161c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxjb2xvciUyMHRoZXJhcHklMjBsaWdodCUyMExFRCUyMHJhaW5ib3clMjBwcmlzbSUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        # ===== TERAPIA ALIMENTAR =====
        {"id": "ali-001", "name": "Kit Dieta Cetogênica para Cães - 30 dias", "description": "Kit completo para iniciar a dieta cetogênica: proteínas liofilizadas, óleo de coco extra virgem, mix de vegetais low-carb desidratados e guia nutricional. Proporção 70% gordura, 25% proteína, 5% carboidratos.", "price": 289.90, "category": "terapia-alimentar", "image_url": "https://images.unsplash.com/photo-1745252798506-29500efc5b39?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwcGV0JTIwZm9vZCUyMHJhdyUyMGRpZXQlMjBoZWFsdGh5JTIwZG9nJTIwbWVhbHxlbnwwfHx8fDE3NzYyMDQzNDd8MA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "ali-002", "name": "Ração Natural Artesanal - Frango e Batata-Doce", "description": "Ração natural desidratada com frango caipira, batata-doce orgânica, cenoura, abobrinha e suplementação completa (cálcio, ômega 3, vitaminas). Sem conservantes, corantes ou transgênicos. Pacote 1kg.", "price": 89.90, "category": "terapia-alimentar", "image_url": "https://images.unsplash.com/photo-1596491119044-93adcb618444?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHw0fHxuYXR1cmFsJTIwcGV0JTIwZm9vZCUyMHJhdyUyMGRpZXQlMjBoZWFsdGh5JTIwZG9nJTIwbWVhbHxlbnwwfHx8fDE3NzYyMDQzNDd8MA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "ali-003", "name": "Ração Natural Artesanal - Peixe e Abóbora", "description": "Ração natural com salmão fresco, abóbora orgânica, espinafre e quinoa. Rica em ômega 3 para pele e pelagem saudáveis. Sem grãos, ideal para pets com alergias alimentares. Pacote 1kg.", "price": 99.90, "category": "terapia-alimentar", "image_url": "https://images.unsplash.com/photo-1612956331286-cec478562654?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxuYXR1cmFsJTIwcGV0JTIwZm9vZCUyMHJhdyUyMGRpZXQlMjBoZWFsdGh5JTIwZG9nJTIwbWVhbHxlbnwwfHx8fDE3NzYyMDQzNDd8MA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "ali-004", "name": "Mix Nutricional Superfoods para Pets", "description": "Blend de superalimentos em pó: spirulina, cúrcuma, levedura nutricional, semente de chia e cogumelo reishi. Adicione à ração para potencializar a nutrição. Frasco 200g rende 60 porções.", "price": 79.90, "category": "terapia-alimentar", "image_url": "https://images.unsplash.com/photo-1651571479517-7596d3d3921a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxuYXR1cmFsJTIwcGV0JTIwZm9vZCUyMHJhdyUyMGRpZXQlMjBoZWFsdGh5JTIwZG9nJTIwbWVhbHxlbnwwfHx8fDE3NzYyMDQzNDd8MA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "ali-005", "name": "Óleo de Coco Extra Virgem Veterinário - 500ml", "description": "Óleo de coco prensado a frio, grau alimentício para pets. Rico em ácido láurico com propriedades antimicrobianas. Ideal para dietas cetogênicas e como suplemento energético. Uso oral e tópico.", "price": 59.90, "category": "terapia-alimentar", "image_url": "https://images.unsplash.com/photo-1573461221473-5af59bdac980?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxjYmQlMjBvaWwlMjBkcm9wcGVyJTIwcGV0JTIwd2VsbG5lc3N8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "ali-006", "name": "Kefir de Leite para Pets - Kit Inicial", "description": "Grãos de kefir de leite com manual de cultivo para pets. Probiótico natural vivo que fortalece a flora intestinal, melhora digestão e imunidade. Inclui recipiente de vidro e instruções de dosagem.", "price": 49.90, "category": "terapia-alimentar", "image_url": "https://images.unsplash.com/photo-1622328138102-7a8f5b7e0aba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwzfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBjYXBzdWxlcyUyMGJvdHRsZXN8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": False},
        {"id": "ali-007", "name": "Suplemento Completo para Alimentação Natural", "description": "Mix de suplementação essencial para dietas caseiras: carbonato de cálcio, taurina, complexo B, vitamina E, zinco quelado e ômega 3. Garante que a alimentação natural seja nutricionalmente completa. Frasco 300g.", "price": 69.90, "category": "terapia-alimentar", "image_url": "https://images.unsplash.com/photo-1669272454802-011adc62cd9a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBjYXBzdWxlcyUyMGJvdHRsZXN8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
        {"id": "ali-008", "name": "Consulta Nutrição Veterinária Online", "description": "Consulta online de 40 minutos com veterinário nutrólogo. Inclui avaliação nutricional completa, plano alimentar personalizado (natural, cetogênica ou funcional), lista de compras e acompanhamento por 30 dias.", "price": 220.00, "category": "terapia-alimentar", "image_url": "https://images.unsplash.com/photo-1612830565936-6388483d801b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwzfHx2ZXRlcmluYXJ5JTIwYWN1cHVuY3R1cmUlMjBkb2clMjB0cmVhdG1lbnR8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "in_stock": True, "featured": True},
    ]
    await db.products.insert_many(products)
    logger.info(f"Products seeded: {len(products)} items")

async def seed_testimonials():
    count = await db.testimonials.count_documents({})
    if count > 0:
        return
    testimonials = [
        {"id": "test-1", "name": "Maria Silva", "pet": "Luna (Golden Retriever)", "rating": 5, "text": "Minha Luna sofria com dores articulares ha anos. Depois do tratamento com acupuntura e homeopatia, ela voltou a correr como filhote! Equipe incrivel.", "avatar": "MS"},
        {"id": "test-2", "name": "Carlos Oliveira", "pet": "Thor (Bulldog Frances)", "rating": 5, "text": "O óleo CBD mudou a vida do Thor. Ele tinha crises de ansiedade terriveis e agora esta muito mais calmo e feliz. Recomendo demais!", "avatar": "CO"},
        {"id": "test-3", "name": "Ana Beatriz", "pet": "Mimi (Gata Persa)", "rating": 5, "text": "A Mimi tinha problemas digestivos crônicos. Com a medicina chinesa e homeopatia, ela melhorou 100%. Atendimento online super pratico.", "avatar": "AB"},
        {"id": "test-4", "name": "Roberto Santos", "pet": "Max (Pastor Alemao)", "rating": 5, "text": "Excelente atendimento! Os hormonios bioidenticos ajudaram muito o Max na velhice. A equipe e super atenciosa e o envio foi rápido.", "avatar": "RS"}
    ]
    await db.testimonials.insert_many(testimonials)
    logger.info("Testimonials seeded")

async def seed_tips():
    await db.tips.drop()
    tips = [
        {"id": "tip-1", "title": "CBD para Animais: O Guia Completo", "excerpt": "Entenda como o CBD pode ajudar no tratamento de dor, ansiedade e convulsoes em caes e gatos.", "content": "O canabidiol (CBD) tem ganhado cada vez mais espaco na medicina veterinária integrativa...", "author": "Dra. Camila Santos", "category": "cbd", "image_url": "https://images.unsplash.com/photo-1700151573574-93eca8777bf0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxjYmQlMjBvaWwlMjBtZWRpY2luZSUyMG5hdHVyYWx8ZW58MHx8fHwxNzc2MTI1ODcxfDA&ixlib=rb-4.1.0&q=85", "date": "2025-12-15", "read_time": "8 min"},
        {"id": "tip-2", "title": "Acupuntura Veterinária: Mitos e Verdades", "excerpt": "Descubra como a acupuntura pode ser uma aliada poderosa na saúde do seu animal.", "content": "A acupuntura e uma prática milenar da medicina chinesa que tem se mostrado extremamente eficaz...", "author": "Dr. Ricardo Lima", "category": "acupuntura", "image_url": "https://images.unsplash.com/photo-1621371236495-1520d8dc72a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJ5JTIwZG9nfGVufDB8fHx8MTc3NjEyNTg1OHww&ixlib=rb-4.1.0&q=85", "date": "2025-11-28", "read_time": "6 min"},
        {"id": "tip-3", "title": "Homeopatia: Tratamento Natural para Pets", "excerpt": "Saiba como a homeopatia pode tratar diversas condicoes de forma suave e sem efeitos colaterais.", "content": "A homeopatia veterinária segue os mesmos princípios da homeopatia humana...", "author": "Dra. Patricia Mendes", "category": "homeopatia", "image_url": "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwbW9kZXJufGVufDB8fHx8MTc3NjEyNTg3MXww&ixlib=rb-4.1.0&q=85", "date": "2025-11-10", "read_time": "5 min"},
        {"id": "tip-4", "title": "Hormônios Bioidênticos na Veterinária", "excerpt": "Como a reposicao hormonal bioidentica pode melhorar a qualidade de vida do seu pet.", "content": "Os hormonios bioidenticos sao sintetizados para serem quimicamente identicos...", "author": "Dr. Fernando Costa", "category": "hormonios", "image_url": "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwbW9kZXJufGVufDB8fHx8MTc3NjEyNTg3MXww&ixlib=rb-4.1.0&q=85", "date": "2025-10-20", "read_time": "7 min"},
        {"id": "tip-5", "title": "Óleo de Gergelim: O Segredo para Pelos Brilhantes", "excerpt": "Descubra como o óleo de gergelim prensado a frio pode transformar a pelagem do seu pet, nutrindo de dentro para fora.", "content": "O óleo de gergelim prensado a frio e um dos segredos mais antigos da Ayurveda para saúde da pele e dos pelos. Rico em vitamina E, acidos graxos essenciais (ômega 6 e 9), sesamina e sesamolina (antioxidantes exclusivos), ele nutre profundamente os folículos pilosos, fortalece a fibra capilar e cria uma barreira protetora natural contra ressecamento. Na medicina ayurvedica, o gergelim e considerado um alimento 'sattvico' — que promove equilíbrio e vitalidade. Para uso em pets, recomenda-se adicionar 1 colher de chá (caes pequenos) a 1 colher de sopa (caes grandes) na ração diariamente. Tambem pode ser aplicado topicamente com massagem suave para hidratar areas ressecadas. Alem do gergelim, outros óleos como coco, linhaça e argan complementam o tratamento. A alimentação e fundamental: proteínas de qualidade, zinco, biotina e acidos graxos sao os pilares para uma pelagem exuberante.", "author": "Dra. Juliana Ferreira", "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1603890227524-e6f9a790c263?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwyfHxkb2clMjBzaGlueSUyMGNvYXQlMjBncm9vbWluZyUyMGhlYWx0aHklMjBmdXIlMjBwZXR8ZW58MHx8fHwxNzc2MTgyMzA2fDA&ixlib=rb-4.1.0&q=85", "date": "2026-01-10", "read_time": "10 min"},
        {"id": "tip-6", "title": "Alimentação Natural para Pelagem Saudável", "excerpt": "Saiba quais alimentos naturais incluir na dieta do seu pet para pelos fortes, brilhantes e saudaveis.", "content": "A saúde da pelagem começa no prato. Uma dieta rica em proteínas de alta qualidade (como frango, peixe e ovos) fornece os aminoácidos essenciais para a formação da queratina, principal componente dos pelos. Acidos graxos ômega 3 (encontrados em peixes como salmao e sardinha) e ômega 6 (presentes em óleos vegetais como gergelim e linhaça) sao fundamentais para manter a pele hidratada e os pelos brilhantes. Vitaminas do complexo B, especialmente a biotina (B7), sao cruciais para o ciclo de crescimento capilar. O zinco participa diretamente na sintese de queratina. Alimentos como cenoura, abóbora e batata-doce fornecem betacaroteno, que o organismo converte em vitamina A — essencial para a renovação celular da pele. Dica prática: adicione uma colher de óleo de gergelim prensado a frio ou de linhaça a ração do seu pet diariamente.", "author": "Dra. Carolina Mendes", "category": "saúde-pelos", "image_url": "https://images.unsplash.com/photo-1623099354893-9a1fbd0dbb3f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwzfHxjYmQlMjBvaWwlMjBkcm9wcGVyJTIwcGV0JTIwd2VsbG5lc3N8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85", "date": "2026-02-05", "read_time": "8 min"},
        {"id": "tip-7", "title": "Cromoterapia para Pets: Guia Completo das Cores que Curam", "excerpt": "Descubra como a terapia das cores pode transformar a saúde fisica e emocional do seu animal de estimacao.", "content": "A cromoterapia e uma terapia complementar reconhecida pela OMS desde 1976 que utiliza a vibração das cores do espectro solar para restabelecer o equilíbrio fisico e energético. Na veterinária integrativa, cada cor possui efeitos especificos: o AZUL tem efeito calmante e analgesico — ideal para animais ansiosos, com insonia ou dores. O VERDE e equilibrante, alivia patologias respiratorias e estimula o sistema imunológico. O VERMELHO aumenta a energia vital e auxilia em casos de depressao e anemia (contraindicado para animais agressivos). O AMARELO estimula a cicatrizacao e regeneração tecidual, beneficiando o sistema digestivo. O LARANJA e vitalizante, usado para fadiga e problemas reprodutivos. O ROSA promove bem-estar e tranquilidade sem contraindicacoes. A aplicacao pode ser feita com lampadas LED coloridas, bastoes cromaticos com cristal, agua solarizada (agua exposta ao sol em garrafas coloridas) ou tecidos e acessorios na cor terapêutica. Os animais frequentemente escolhem instintivamente a cor que necessitam — observe se seu pet e atraido por determinadas cores. Sessoes de 15 a 30 minutos, 2 a 3 vezes por semana, ja mostram resultados. A cromoterapia e especialmente eficaz quando combinada com outras terapias integrativas como acupuntura, homeopatia e florais.", "author": "Dr. Paulo Henrique Viana", "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1618018353764-685cb47681d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwzfHxjb2xvciUyMHRoZXJhcHklMjBsaWdodCUyMExFRCUyMHJhaW5ib3clMjBwcmlzbSUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "date": "2026-03-12", "read_time": "12 min"},
        {"id": "tip-8", "title": "Água Solarizada: Como Preparar e Usar no seu Pet", "excerpt": "Aprenda a preparar agua solarizada em casa e como cada cor beneficia a saúde do seu animal.", "content": "A agua solarizada e uma das formas mais simples e acessiveis de aplicar cromoterapia no dia a dia do seu pet. O preparo e simples: coloque agua mineral em uma garrafa de vidro da cor desejada e deixe exposta a luz solar direta por 2 a 4 horas. A agua absorve a vibração da cor e pode ser oferecida ao animal para beber ou usada para banhos e compressas. AGUA AZUL: a mais utilizada — acalma ansiedade, reduz inflamacoes, melhora o sono. Ofereca como agua de beber para pets ansiosos ou apos situacoes de estresse. AGUA VERDE: equilibra o organismo, fortalece imunidade. Ideal para pets em recuperação de doenças. AGUA AMARELA: estimula digestao e apetite. Excelente para animais inapetentes. AGUA VERMELHA: aumenta energia e vitalidade. Para animais debilitados ou com anemia (usar com cautela). A agua solarizada nao substitui tratamento veterinário convencional, mas e um complemento seguro e natural. Armazene na geladeira por ate 24 horas.", "author": "Dra. Renata Campos", "category": "cromoterapia", "image_url": "https://images.unsplash.com/photo-1597858949210-e255261302fc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxjb2xvciUyMHRoZXJhcHklMjBsaWdodCUyMExFRCUyMHJhaW5ib3clMjBwcmlzbSUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTgzNzExfDA&ixlib=rb-4.1.0&q=85", "date": "2026-03-20", "read_time": "9 min"}
    ]
    await db.tips.insert_many(tips)
    logger.info("Tips seeded")

async def seed_faq():
    count = await db.faq.count_documents({})
    if count > 0:
        return
    faqs = [
        {"id": "faq-1", "question": "Como funciona a consulta online?", "answer": "Voce agenda uma consulta pelo site, escolhe o horário e a especialidade desejada. Um veterinário especialista fara o atendimento por videochamada, avaliara seu pet e recomendara o melhor tratamento."},
        {"id": "faq-2", "question": "Os produtos sao seguros para meu animal?", "answer": "Sim! Todos os nossos produtos sao formulados e aprovados por veterinários especialistas em medicina integrativa. Cada tratamento e personalizado para as necessidades do seu pet."},
        {"id": "faq-3", "question": "Como e feito o envio dos produtos?", "answer": "Enviamos para todo o Brasil via transportadora especializada. Produtos que precisam de refrigeração sao embalados com caixas termicas. O prazo medio e de 3 a 7 dias uteis."},
        {"id": "faq-4", "question": "Preciso de receita veterinária?", "answer": "Alguns produtos, como hormonios bioidenticos e CBD, necessitam de prescricao veterinária. Voce pode obter a receita atraves de nossas consultas online ou com seu veterinário de confianca."},
        {"id": "faq-5", "question": "Qual a diferenca entre medicina integrativa e convencional?", "answer": "A medicina veterinária integrativa combina o melhor da medicina convencional com terapias complementares como homeopatia, acupuntura e fitoterapia, buscando tratar o animal de forma holística."},
        {"id": "faq-6", "question": "O CBD e legal para uso veterinário?", "answer": "Sim, o uso de CBD para animais e regulamentado no Brasil. Nossos produtos seguem todas as normas da ANVISA e do MAPA, garantindo segurança e qualidade."}
    ]
    await db.faq.insert_many(faqs)
    logger.info("FAQ seeded")

async def seed_coupons():
    count = await db.coupons.count_documents({})
    if count > 0:
        return
    coupons = [
        {"id": "cup-1", "code": "BEMVINDO10", "discount_type": "percentage", "discount_value": 10, "min_purchase": 0, "max_uses": 500, "uses": 0, "active": True, "description": "10% de desconto para novos clientes", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "cup-2", "code": "MEDVET20", "discount_type": "percentage", "discount_value": 20, "min_purchase": 100, "max_uses": 200, "uses": 0, "active": True, "description": "20% OFF em compras acima de R$100", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "cup-3", "code": "FRETEGRATIS", "discount_type": "fixed", "discount_value": 25.00, "min_purchase": 80, "max_uses": 300, "uses": 0, "active": True, "description": "R$25 OFF (frete grátis)", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "cup-4", "code": "CBD15", "discount_type": "percentage", "discount_value": 15, "min_purchase": 50, "max_uses": 100, "uses": 0, "active": True, "description": "15% OFF em produtos CBD", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.coupons.insert_many(coupons)
    logger.info("Coupons seeded")


async def seed_blog_articles():
    count = await db.blog_articles.count_documents({})
    if count > 0:
        return
    articles = [
        {"id": "blog-acu", "title": "Acupuntura Veterinária: Tudo que Voce Precisa Saber", "excerpt": "Um guia completo sobre como a acupuntura pode transformar a saúde do seu pet, com explicacoes sobre meridianos, pontos e tipos de agulhamento.", "content": "A acupuntura veterinária e reconhecida pelo CFMV como especialidade desde 2000. Baseia-se na insercao de agulhas ultrafinas (0,20mm) em pontos especificos ao longo dos 14 meridianos principais do corpo, estimulando a liberação de endorfinas, serotonina e cortisol endogeno. Estudos do Journal of Veterinary Internal Medicine demonstram eficácia em 85% dos casos de dor crônica. As sessões duram 20-30 minutos e a maioria dos animais relaxa profundamente. A eletroacupuntura adiciona estimulacao eletrica de baixa frequência (2-4Hz para dor crônica, 80-120Hz para dor aguda). A moxabustao complementa com calor terapêutico em condicoes de frio. Indicacoes principais: artrite, displasia, hernia de disco, paralisia, reabilitação pós-cirúrgica, manejo de dor oncologica.", "author": "Dr. Paulo Henrique Viana", "category": "acupuntura", "image_url": "https://images.unsplash.com/photo-1584738620467-51b852c2af2e?w=800", "date": "2026-01-15", "read_time": "15 min"},
        {"id": "blog-fito", "title": "Fitoterapia Chinesa: Fórmulas Milenares para Pets", "excerpt": "Conheca as principais fórmulas da fitoterapia chinesa adaptadas para uso veterinário e como elas atuam no organismo animal.", "content": "A fitoterapia chinesa veterinária utiliza mais de 400 ervas em combinacoes sinergicas chamadas fórmulas. Cada formula segue hierarquia: o ingrediente Imperador (acao principal), o Ministro (potencializa), o Assistente (harmoniza) e o Mensageiro (direciona). Fórmulas classicas adaptadas para pets: Xiao Yao San (estresse, fígado), Si Jun Zi Tang (digestao, imunidade), Liu Wei Di Huang Wan (rim, envelhecimento), Bu Zhong Yi Qi Tang (fadiga, prolapso). Todas sao manipuladas sob medida apos diagnóstico energético que avalia lingua, pulso, temperatura e os 8 Principios da MTC. A fitoterapia chinesa e especialmente eficaz quando combinada com acupuntura, potencializando resultados em 40-60% segundo estudos da Chi University.", "author": "Dra. Tabatha Novikov", "category": "fitoterapia", "image_url": "https://images.unsplash.com/photo-1545840716-c82e9eec6930?w=800", "date": "2026-01-20", "read_time": "12 min"},
        {"id": "blog-ozonio", "title": "Ozonioterapia: O Poder do Ozonio na Saúde Animal", "excerpt": "Como a mistura de oxigênio e ozonio pode tratar infeccoes, inflamacoes e fortalecer a imunidade do seu pet.", "content": "A ozonioterapia veterinária utiliza uma mistura controlada de 95-99.5% oxigênio e 0.5-5% ozonio (O3). O ozonio possui propriedades anti-inflamatorias, antisepticas, antifungicas e imunomoduladoras. Vias de aplicacao: retal (mais comum, sistemica), topica (feridas, otites), subcutanea, intra-articular e auto-hemoterapia menor. Indicacoes comprovadas: feridas infectadas resistentes, otites crônicas, dermatites fungicas, doença periodontal, hernias de disco, doenças autoimunes. Estudos publicados na Veterinary Dermatology mostram 90% de melhora em dermatites crônicas. O tratamento e indolor, sem efeitos colaterais quando aplicado corretamente, e pode reduzir necessidade de antibioticos em ate 70%.", "author": "Dr. Fernando Costa", "category": "ozonioterapia", "image_url": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800", "date": "2026-02-01", "read_time": "10 min"},
        {"id": "blog-reiki", "title": "Reiki Animal: Energia que Cura com Amor", "excerpt": "Entenda como a terapia energética japonesa pode beneficiar o equilíbrio emocional e fisico do seu pet.", "content": "O Reiki e uma terapia energética japonesa criada por Mikao Usui que canaliza energia universal (Rei = universal, Ki = energia vital) pelas maos do terapeuta. Em animais, o Reiki e aplicado com as maos posicionadas a poucos centimetros do corpo, sem contato forçado — animais sensiveis captam a energia e frequentemente se aproximam espontaneamente. Beneficios documentados: reducao de ansiedade em 80% dos casos, melhora do sono, aceleração pós-cirúrgica, conforto em animais terminais. O Reiki atua nos 7 chakras principais do animal, equilibrando centros energéticos. E especialmente indicado para animais resgatados com traumas, pets em tratamento oncologico e companheiros em cuidados paliativos. Pode ser aplicado presencialmente ou a distancia.", "author": "Dra. Renata Campos", "category": "reiki", "image_url": "https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=800", "date": "2026-02-10", "read_time": "8 min"},
        {"id": "blog-florais", "title": "Florais de Bach para Pets: Equilibrio Emocional Natural", "excerpt": "As 38 essencias florais de Dr. Bach e como elas podem ajudar seu pet a superar medos, ansiedade e traumas.", "content": "Os Florais de Bach sao 38 essencias preparadas a partir de flores silvestres, cada uma atuando em um estado emocional especifico. Para pets: Rescue Remedy (emergencias, sustos, fogos), Mimulus (medos conhecidos — trovao, veterinário), Rock Rose (panico extremo), Star of Bethlehem (traumas, luto), Walnut (adaptacao a mudanças), Vine (dominancia/agressividade), Chicory (apego excessivo), Agrimony (inquietacao disfarçada). A prescricao ideal e individualizada: observa-se comportamento, histórico e personalidade do animal. Administração: 4 gotas, 4 vezes ao dia, diretamente na boca ou na agua. Sem contraindicacoes, pode ser combinado com qualquer tratamento. Resultados em 2-4 semanas para crônico, imediato em emergencias.", "author": "Dra. Renata Campos", "category": "florais", "image_url": "https://images.unsplash.com/photo-1652759718142-5e6f8ece161c?w=800", "date": "2026-02-18", "read_time": "11 min"},
        {"id": "blog-fisio", "title": "Fisioterapia e Hidroterapia Veterinária: Recuperação com Movimento", "excerpt": "Tecnicas de reabilitação fisica que devolvem mobilidade e qualidade de vida ao seu pet.", "content": "A fisioterapia veterinária integra cinesioterapia (exercicios terapêuticos), eletroterapia (TENS, FES), termoterapia e hidroterapia. A HIDROTERAPIA e destaque: em esteira aquatica, a flutuabilidade reduz ate 60% do peso corporal, permitindo exercicio seguro para articulacoes comprometidas. A resistencia da agua fortalece musculatura 2x mais rápido que exercicio em solo. Indicacoes: pos-operatorio ortopedico (ligamento cruzado, displasia), paralisia (DDIV), atrofia muscular, obesidade, reabilitação neurológica. A quiropraxia veterinária complementa com ajustes vertebrais que restauram comunicacao neural. Protocolos tipicos: 2-3x/semana por 4-12 semanas, com exercicios domiciliares. Resultados: 85% retornam a mobilidade funcional.", "author": "Dr. Ricardo Lima", "category": "fisioterapia", "image_url": "https://images.unsplash.com/photo-1762686796610-acde6d785ad3?w=800", "date": "2026-03-01", "read_time": "13 min"},
        {"id": "blog-celulas", "title": "Celulas-Tronco e PRP: Medicina Regenerativa Veterinária", "excerpt": "Tratamentos de ponta que usam o proprio organismo do animal para regenerar tecidos danificados.", "content": "CELULAS-TRONCO MESENQUIMAIS: Extraidas do tecido adiposo do proprio animal (lipoaspiração minima), processadas e reinjetadas no local da lesao. Secretam fatores anti-inflamatórios e de crescimento que regeneram cartilagem, tendoes, ligamentos e ate tecido renal. Estudos da Universidade de Cornell mostram 78% de melhora em osteoartrite. PRP (Plasma Rico em Plaquetas): Coleta de sangue do animal, centrifugacao para concentrar plaquetas (5-7x a concentração normal) e injecao no local da lesao. Os fatores de crescimento (PDGF, TGF-B, VEGF) aceleram cicatrizacao em 40-60%. Indicacoes de PRP: lesoes tendineanas, feridas crônicas, osteoartrite, pos-cirurgico articular. Ambos os tratamentos sao autologos (do proprio animal), eliminando risco de rejeicao.", "author": "Dr. Fernando Costa", "category": "regenerativa", "image_url": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800", "date": "2026-03-15", "read_time": "14 min"},
        {"id": "blog-nutrição", "title": "Nutrição Funcional: Alimento como Medicina para Pets", "excerpt": "Como a alimentação natural e personalizada pode prevenir doenças e transformar a saúde do seu animal.", "content": "A nutrição funcional veterinária trata cada alimento como ferramenta terapêutica. Pilares: PROTEINAS de alta qualidade (frango, peixe, ovos) para formação muscular e imunidade. GORDURAS BOAS (ômega 3 de peixe, ômega 6 de gergelim e linhaça) para pele, pelos e cerebro. FITOQUIMICOS (curcuma, brocolis, mirtilo) como antioxidantes e anti-inflamatórios. PREBIOTICOS e PROBIOTICOS para saúde intestinal — 70% da imunidade esta no intestino. Na dietoterapia chinesa, alimentos tem natureza termica: QUENTES (cordeiro, canela) para pets com frio. FRESCOS (pato, pepino) para pets com calor. NEUTROS (frango, arroz) para manutencao. A prescricao e individualizada considerando especie, raça, idade, condicao de saúde e ate estacao do ano.", "author": "Dra. Juliana Ferreira", "category": "nutrição", "image_url": "https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=800", "date": "2026-03-25", "read_time": "11 min"},
    ]
    await db.blog_articles.insert_many(articles)
    logger.info(f"Blog articles seeded: {len(articles)}")

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
    await seed_coupons()
    await seed_blog_articles()
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
