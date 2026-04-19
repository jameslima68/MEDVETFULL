"""
Test suite for Chat Widget and Meus Pets features
- Chat specialist endpoint (rule-based responses)
- Pets CRUD operations
- Chat history for logged-in users
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestChatEndpoint:
    """Tests for /api/chat endpoint - rule-based specialist responses"""
    
    def test_chat_therapy_acupuntura(self):
        """Chat responds to acupuntura keyword"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "acupuntura",
            "context": "geral"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "acupuntura" in data["response"].lower() or "Medicina Tradicional Chinesa" in data["response"]
        assert data.get("pet_used") == False
    
    def test_chat_therapy_homeopatia(self):
        """Chat responds to homeopatia keyword"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "homeopatia",
            "context": "geral"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "homeopatia" in data["response"].lower() or "diluídos" in data["response"]
    
    def test_chat_therapy_cbd(self):
        """Chat responds to CBD keyword"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "CBD para meu cachorro",
            "context": "geral"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "cbd" in data["response"].lower() or "canabidiol" in data["response"].lower()
    
    def test_chat_symptom_dor(self):
        """Chat responds to pain symptom"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "meu pet está com dor",
            "context": "geral"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "dor" in data["response"].lower() or "acupuntura" in data["response"].lower()
    
    def test_chat_symptom_ansiedade(self):
        """Chat responds to anxiety symptom"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "meu gato tem ansiedade",
            "context": "geral"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "ansiedade" in data["response"].lower() or "florais" in data["response"].lower()
    
    def test_chat_symptom_pelagem(self):
        """Chat responds to coat/fur questions"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "queda de pelo",
            "context": "geral"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "pelagem" in data["response"].lower() or "pelo" in data["response"].lower() or "ômega" in data["response"].lower()
    
    def test_chat_general_question(self):
        """Chat responds to general questions"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "olá, preciso de ajuda",
            "context": "geral"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 50  # Should have a meaningful response


class TestPetsCRUD:
    """Tests for /api/pets CRUD operations - requires authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookies"""
        self.session = requests.Session()
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@medvet.com",
            "password": "admin123"
        })
        if login_response.status_code != 200:
            pytest.skip("Authentication failed - skipping authenticated tests")
        self.user_data = login_response.json()
    
    def test_get_pets_empty(self):
        """GET /api/pets returns empty list initially"""
        response = self.session.get(f"{BASE_URL}/api/pets")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_pet(self):
        """POST /api/pets creates a new pet"""
        pet_data = {
            "name": "TEST_Buddy",
            "species": "cao",
            "breed": "Labrador",
            "age_years": 5,
            "age_months": 3,
            "weight_kg": 25.5,
            "conditions": ["Artrose"],
            "notes": "Test pet for pytest"
        }
        response = self.session.post(f"{BASE_URL}/api/pets", json=pet_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Buddy"
        assert data["species"] == "cao"
        assert data["breed"] == "Labrador"
        assert "id" in data
        assert "user_id" in data
        
        # Store pet_id for cleanup
        self.pet_id = data["id"]
        
        # Verify persistence with GET
        get_response = self.session.get(f"{BASE_URL}/api/pets")
        assert get_response.status_code == 200
        pets = get_response.json()
        pet_ids = [p["id"] for p in pets]
        assert self.pet_id in pet_ids
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/pets/{self.pet_id}")
    
    def test_create_pet_gato(self):
        """POST /api/pets creates a cat"""
        pet_data = {
            "name": "TEST_Mimi",
            "species": "gato",
            "breed": "Siamês",
            "age_years": 2,
            "age_months": 0,
            "weight_kg": 4.5,
            "conditions": [],
            "notes": ""
        }
        response = self.session.post(f"{BASE_URL}/api/pets", json=pet_data)
        assert response.status_code == 200
        data = response.json()
        assert data["species"] == "gato"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/pets/{data['id']}")
    
    def test_create_pet_outro(self):
        """POST /api/pets creates other species"""
        pet_data = {
            "name": "TEST_Tweety",
            "species": "outro",
            "breed": "Calopsita",
            "age_years": 1,
            "age_months": 6,
            "weight_kg": 0.1,
            "conditions": [],
            "notes": "Bird"
        }
        response = self.session.post(f"{BASE_URL}/api/pets", json=pet_data)
        assert response.status_code == 200
        data = response.json()
        assert data["species"] == "outro"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/pets/{data['id']}")
    
    def test_update_pet(self):
        """PUT /api/pets/{id} updates a pet"""
        # Create pet first
        create_response = self.session.post(f"{BASE_URL}/api/pets", json={
            "name": "TEST_UpdateMe",
            "species": "cao",
            "breed": "Poodle",
            "age_years": 3,
            "age_months": 0,
            "weight_kg": 8.0,
            "conditions": [],
            "notes": ""
        })
        pet_id = create_response.json()["id"]
        
        # Update pet
        update_response = self.session.put(f"{BASE_URL}/api/pets/{pet_id}", json={
            "name": "TEST_Updated",
            "species": "cao",
            "breed": "Poodle Toy",
            "age_years": 4,
            "age_months": 0,
            "weight_kg": 9.0,
            "conditions": ["Diabetes"],
            "notes": "Updated notes"
        })
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["name"] == "TEST_Updated"
        assert data["breed"] == "Poodle Toy"
        assert data["age_years"] == 4
        assert "Diabetes" in data["conditions"]
        
        # Verify persistence
        get_response = self.session.get(f"{BASE_URL}/api/pets")
        pets = get_response.json()
        updated_pet = next((p for p in pets if p["id"] == pet_id), None)
        assert updated_pet is not None
        assert updated_pet["name"] == "TEST_Updated"
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/pets/{pet_id}")
    
    def test_delete_pet(self):
        """DELETE /api/pets/{id} removes a pet"""
        # Create pet first
        create_response = self.session.post(f"{BASE_URL}/api/pets", json={
            "name": "TEST_DeleteMe",
            "species": "gato",
            "breed": "",
            "age_years": 1,
            "age_months": 0,
            "weight_kg": 3.0,
            "conditions": [],
            "notes": ""
        })
        pet_id = create_response.json()["id"]
        
        # Delete pet
        delete_response = self.session.delete(f"{BASE_URL}/api/pets/{pet_id}")
        assert delete_response.status_code == 200
        assert delete_response.json()["message"] == "Pet removed"
        
        # Verify deletion
        get_response = self.session.get(f"{BASE_URL}/api/pets")
        pets = get_response.json()
        pet_ids = [p["id"] for p in pets]
        assert pet_id not in pet_ids
    
    def test_delete_nonexistent_pet(self):
        """DELETE /api/pets/{id} returns 404 for nonexistent pet"""
        response = self.session.delete(f"{BASE_URL}/api/pets/nonexistent123")
        assert response.status_code == 404


class TestChatWithPet:
    """Tests for chat with pet context - personalized responses"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and create a test pet"""
        self.session = requests.Session()
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@medvet.com",
            "password": "admin123"
        })
        if login_response.status_code != 200:
            pytest.skip("Authentication failed")
        
        # Create test pet
        pet_response = self.session.post(f"{BASE_URL}/api/pets", json={
            "name": "TEST_ChatPet",
            "species": "cao",
            "breed": "Beagle",
            "age_years": 7,
            "age_months": 0,
            "weight_kg": 12.0,
            "conditions": ["Artrose", "Obesidade"],
            "notes": "Senior dog"
        })
        self.pet_id = pet_response.json()["id"]
        yield
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/pets/{self.pet_id}")
    
    def test_chat_with_pet_context(self):
        """Chat uses pet data for personalized response"""
        response = self.session.post(f"{BASE_URL}/api/chat", json={
            "message": "dor nas articulações",
            "pet_id": self.pet_id,
            "context": "geral"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["pet_used"] == True
        # Response should mention pet details
        assert "cão" in data["response"].lower() or "Beagle" in data["response"]


class TestChatHistory:
    """Tests for /api/chat/history endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login"""
        self.session = requests.Session()
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@medvet.com",
            "password": "admin123"
        })
        if login_response.status_code != 200:
            pytest.skip("Authentication failed")
    
    def test_get_chat_history(self):
        """GET /api/chat/history returns chat history"""
        # Send a chat message first
        self.session.post(f"{BASE_URL}/api/chat", json={
            "message": "TEST_history_message",
            "context": "geral"
        })
        
        # Get history
        response = self.session.get(f"{BASE_URL}/api/chat/history")
        assert response.status_code == 200
        history = response.json()
        assert isinstance(history, list)
        # Should have at least one entry
        if len(history) > 0:
            assert "user_message" in history[0]
            assert "specialist_response" in history[0]
            assert "created_at" in history[0]
    
    def test_chat_history_requires_auth(self):
        """GET /api/chat/history requires authentication"""
        # Use a new session without login
        response = requests.get(f"{BASE_URL}/api/chat/history")
        assert response.status_code == 401


class TestPetsAuth:
    """Tests for pets endpoints authentication"""
    
    def test_get_pets_requires_auth(self):
        """GET /api/pets requires authentication"""
        response = requests.get(f"{BASE_URL}/api/pets")
        assert response.status_code == 401
    
    def test_create_pet_requires_auth(self):
        """POST /api/pets requires authentication"""
        response = requests.post(f"{BASE_URL}/api/pets", json={
            "name": "Unauthorized",
            "species": "cao"
        })
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
