"""
Test suite for Courses Platform and Vet Portal features
- Courses: 5 active + 20 coming_soon courses
- Vet Portal: registration and login
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCoursesAPI:
    """Test courses endpoints"""
    
    def test_get_all_courses(self):
        """GET /api/courses returns 25 courses (5 active + 20 coming_soon)"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        courses = response.json()
        assert isinstance(courses, list), "Response should be a list"
        assert len(courses) == 25, f"Expected 25 courses, got {len(courses)}"
        print(f"✓ GET /api/courses returns {len(courses)} courses")
    
    def test_get_active_courses(self):
        """GET /api/courses?status=active returns 5 courses"""
        response = requests.get(f"{BASE_URL}/api/courses?status=active")
        assert response.status_code == 200
        courses = response.json()
        assert len(courses) == 5, f"Expected 5 active courses, got {len(courses)}"
        for course in courses:
            assert course.get("status") == "active", f"Course {course.get('id')} is not active"
        print(f"✓ GET /api/courses?status=active returns {len(courses)} active courses")
    
    def test_get_coming_soon_courses(self):
        """GET /api/courses?status=coming_soon returns 20 courses"""
        response = requests.get(f"{BASE_URL}/api/courses?status=coming_soon")
        assert response.status_code == 200
        courses = response.json()
        assert len(courses) == 20, f"Expected 20 coming_soon courses, got {len(courses)}"
        for course in courses:
            assert course.get("status") == "coming_soon", f"Course {course.get('id')} is not coming_soon"
        print(f"✓ GET /api/courses?status=coming_soon returns {len(courses)} coming_soon courses")
    
    def test_course_card_fields(self):
        """Course cards have required fields: price, hours, modules count"""
        response = requests.get(f"{BASE_URL}/api/courses?status=active")
        assert response.status_code == 200
        courses = response.json()
        for course in courses:
            assert "price" in course, f"Course {course.get('id')} missing price"
            assert "hours" in course, f"Course {course.get('id')} missing hours"
            assert "modules" in course, f"Course {course.get('id')} missing modules"
            assert isinstance(course["price"], (int, float)), "Price should be numeric"
            assert isinstance(course["hours"], (int, float)), "Hours should be numeric"
            assert isinstance(course["modules"], list), "Modules should be a list"
        print("✓ All active courses have price, hours, and modules fields")
    
    def test_course_detail_acupuntura(self):
        """GET /api/courses/curso-acupuntura returns course with full module breakdown"""
        response = requests.get(f"{BASE_URL}/api/courses/curso-acupuntura")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        course = response.json()
        
        # Verify course fields
        assert course["id"] == "curso-acupuntura"
        assert course["title"] == "Acupuntura Veterinária Integrativa"
        assert course["price"] == 4500.00
        assert course["hours"] == 60
        assert course["status"] == "active"
        
        # Verify modules
        assert "modules" in course, "Course should have modules"
        modules = course["modules"]
        assert len(modules) >= 5, f"Expected at least 5 modules, got {len(modules)}"
        
        # Verify module structure
        for module in modules:
            assert "num" in module, "Module should have num"
            assert "title" in module, "Module should have title"
            assert "hours" in module, "Module should have hours"
            assert "topics" in module, "Module should have topics"
            assert isinstance(module["topics"], list), "Topics should be a list"
        
        print(f"✓ GET /api/courses/curso-acupuntura returns course with {len(modules)} modules")
    
    def test_course_detail_not_found(self):
        """GET /api/courses/invalid-id returns 404"""
        response = requests.get(f"{BASE_URL}/api/courses/invalid-course-id")
        assert response.status_code == 404
        print("✓ GET /api/courses/invalid-id returns 404")
    
    def test_active_course_prices(self):
        """Verify active course prices match expected values"""
        expected_prices = {
            "curso-acupuntura": 4500.00,
            "curso-ozonioterapia": 2800.00,
            "curso-cbd": 3200.00,
            "curso-quiropraxia": 3800.00,
            "curso-fitoterapia": 2500.00
        }
        response = requests.get(f"{BASE_URL}/api/courses?status=active")
        assert response.status_code == 200
        courses = response.json()
        
        for course in courses:
            course_id = course.get("id")
            if course_id in expected_prices:
                assert course["price"] == expected_prices[course_id], \
                    f"Course {course_id} price mismatch: expected {expected_prices[course_id]}, got {course['price']}"
        
        print("✓ All active course prices match expected values")


class TestVetPortalAPI:
    """Test Vet Portal registration and login"""
    
    @pytest.fixture
    def unique_vet_data(self):
        """Generate unique vet data for each test"""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "name": f"Dr. Test Vet {unique_id}",
            "email": f"testvet_{unique_id}@example.com",
            "password": "testpass123",
            "crmv": f"TEST{unique_id}",
            "crmv_state": "SP",
            "specialties": ["Acupuntura", "Fitoterapia"],
            "area": "integrativa",
            "education": [{"type": "graduacao", "institution": "USP", "year": "2020"}],
            "bio": "Test veterinarian bio",
            "phone": "11999999999"
        }
    
    def test_vet_register_success(self, unique_vet_data):
        """POST /api/vet/register creates a vet account"""
        response = requests.post(f"{BASE_URL}/api/vet/register", json=unique_vet_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "vet" in data, "Response should contain vet data"
        
        vet = data["vet"]
        assert vet["name"] == unique_vet_data["name"]
        assert vet["email"] == unique_vet_data["email"]
        assert vet["crmv"] == unique_vet_data["crmv"]
        assert vet["crmv_state"] == unique_vet_data["crmv_state"]
        assert vet["status"] == "approved", "Vet should be auto-approved"
        assert "password_hash" not in vet, "Password hash should not be returned"
        
        print(f"✓ POST /api/vet/register creates vet: {vet['name']}")
        return data
    
    def test_vet_register_duplicate_email(self, unique_vet_data):
        """POST /api/vet/register with duplicate email returns 400"""
        # First registration
        response1 = requests.post(f"{BASE_URL}/api/vet/register", json=unique_vet_data)
        assert response1.status_code == 200
        
        # Second registration with same email
        response2 = requests.post(f"{BASE_URL}/api/vet/register", json=unique_vet_data)
        assert response2.status_code == 400, f"Expected 400, got {response2.status_code}"
        assert "já cadastrado" in response2.json().get("detail", "").lower() or "already" in response2.json().get("detail", "").lower()
        
        print("✓ POST /api/vet/register with duplicate email returns 400")
    
    def test_vet_login_success(self, unique_vet_data):
        """POST /api/vet/login authenticates a vet"""
        # First register
        reg_response = requests.post(f"{BASE_URL}/api/vet/register", json=unique_vet_data)
        assert reg_response.status_code == 200
        
        # Then login
        login_data = {
            "email": unique_vet_data["email"],
            "password": unique_vet_data["password"]
        }
        response = requests.post(f"{BASE_URL}/api/vet/login", json=login_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "vet" in data, "Response should contain vet data"
        assert data["vet"]["email"] == unique_vet_data["email"]
        
        print(f"✓ POST /api/vet/login authenticates vet: {data['vet']['email']}")
    
    def test_vet_login_invalid_credentials(self):
        """POST /api/vet/login with invalid credentials returns 401"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/api/vet/login", json=login_data)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("✓ POST /api/vet/login with invalid credentials returns 401")
    
    def test_vet_profile_with_token(self, unique_vet_data):
        """GET /api/vet/profile returns vet data with valid token"""
        # Register and get token
        reg_response = requests.post(f"{BASE_URL}/api/vet/register", json=unique_vet_data)
        assert reg_response.status_code == 200
        token = reg_response.json()["token"]
        
        # Get profile
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/vet/profile", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        vet = response.json()
        assert vet["email"] == unique_vet_data["email"]
        assert "password_hash" not in vet
        
        print(f"✓ GET /api/vet/profile returns vet data")
    
    def test_vet_profile_without_token(self):
        """GET /api/vet/profile without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/vet/profile")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("✓ GET /api/vet/profile without token returns 401")
    
    def test_vet_registration_fields(self, unique_vet_data):
        """Verify all registration fields are stored correctly"""
        response = requests.post(f"{BASE_URL}/api/vet/register", json=unique_vet_data)
        assert response.status_code == 200
        
        vet = response.json()["vet"]
        
        # Check all fields
        assert vet["name"] == unique_vet_data["name"]
        assert vet["email"] == unique_vet_data["email"]
        assert vet["crmv"] == unique_vet_data["crmv"]
        assert vet["crmv_state"] == unique_vet_data["crmv_state"]
        assert vet["specialties"] == unique_vet_data["specialties"]
        assert vet["area"] == unique_vet_data["area"]
        assert vet["education"] == unique_vet_data["education"]
        assert vet["bio"] == unique_vet_data["bio"]
        assert vet["phone"] == unique_vet_data["phone"]
        
        print("✓ All vet registration fields stored correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
