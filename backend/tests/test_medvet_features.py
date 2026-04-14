"""
MEDVET INTEGRATIVA - Backend API Tests
Testing: Blog, Symptom Calculator, Testimonials, Team Page data
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://holistic-vet-shop.preview.emergentagent.com')

class TestBlogAPI:
    """Blog endpoint tests - /api/blog"""
    
    def test_get_blog_articles(self):
        """GET /api/blog returns list of blog articles"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one blog article"
        
        # Validate article structure
        article = data[0]
        required_fields = ['id', 'title', 'excerpt', 'content', 'author', 'category', 'date', 'read_time']
        for field in required_fields:
            assert field in article, f"Article missing field: {field}"
        
        print(f"✓ GET /api/blog returned {len(data)} articles")
    
    def test_get_blog_article_by_id(self):
        """GET /api/blog/{id} returns specific article"""
        # First get list to find an ID
        list_response = requests.get(f"{BASE_URL}/api/blog")
        articles = list_response.json()
        assert len(articles) > 0, "Need at least one article"
        
        article_id = articles[0]['id']
        response = requests.get(f"{BASE_URL}/api/blog/{article_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        article = response.json()
        assert article['id'] == article_id
        assert 'title' in article
        assert 'content' in article
        
        print(f"✓ GET /api/blog/{article_id} returned article: {article['title'][:50]}...")
    
    def test_get_blog_article_not_found(self):
        """GET /api/blog/{id} returns 404 for non-existent article"""
        response = requests.get(f"{BASE_URL}/api/blog/non-existent-article-id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ GET /api/blog/non-existent returns 404")
    
    def test_filter_blog_by_category(self):
        """GET /api/blog?category=acupuntura filters by category"""
        response = requests.get(f"{BASE_URL}/api/blog", params={"category": "acupuntura"})
        assert response.status_code == 200
        
        data = response.json()
        # All returned articles should have the specified category
        for article in data:
            assert article['category'] == 'acupuntura', f"Article {article['id']} has wrong category"
        
        print(f"✓ GET /api/blog?category=acupuntura returned {len(data)} articles")


class TestSymptomCalculatorAPI:
    """Symptom Calculator endpoint tests"""
    
    def test_get_available_symptoms(self):
        """GET /api/symptom-calculator/symptoms returns symptom groups"""
        response = requests.get(f"{BASE_URL}/api/symptom-calculator/symptoms")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dictionary"
        
        # Check expected symptom groups
        expected_groups = ['Dor e Mobilidade', 'Pele e Pelagem', 'Emocional e Comportamental', 
                          'Digestivo e Metabolico', 'Neurologico e Grave', 'Outros']
        for group in expected_groups:
            assert group in data, f"Missing symptom group: {group}"
        
        # Validate symptom structure
        for group, symptoms in data.items():
            assert isinstance(symptoms, list), f"Group {group} should have list of symptoms"
            for symptom in symptoms:
                assert 'id' in symptom, f"Symptom missing 'id' in group {group}"
                assert 'label' in symptom, f"Symptom missing 'label' in group {group}"
        
        print(f"✓ GET /api/symptom-calculator/symptoms returned {len(data)} groups")
    
    def test_calculate_recommendations_single_symptom(self):
        """POST /api/symptom-calculator returns recommendations for single symptom"""
        payload = {
            "pet_type": "cao",
            "symptoms": ["dor_cronica"],
            "severity": "moderado"
        }
        response = requests.post(f"{BASE_URL}/api/symptom-calculator", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'recommended_therapies' in data
        assert 'recommended_categories' in data
        assert 'overall_urgency' in data
        assert 'message' in data
        
        assert isinstance(data['recommended_therapies'], list)
        assert len(data['recommended_therapies']) > 0, "Should have therapy recommendations"
        assert data['overall_urgency'] in ['leve', 'moderado', 'severo']
        
        print(f"✓ POST /api/symptom-calculator returned {len(data['recommended_therapies'])} therapies")
    
    def test_calculate_recommendations_multiple_symptoms(self):
        """POST /api/symptom-calculator handles multiple symptoms"""
        payload = {
            "pet_type": "gato",
            "symptoms": ["ansiedade", "problemas_digestivos", "queda_pelos"],
            "severity": "leve"
        }
        response = requests.post(f"{BASE_URL}/api/symptom-calculator", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data['recommended_therapies']) > 0
        assert 'details' in data
        assert len(data['details']) == 3, "Should have details for each symptom"
        
        print(f"✓ Multiple symptoms returned {len(data['recommended_therapies'])} unique therapies")
    
    def test_calculate_severe_urgency(self):
        """POST /api/symptom-calculator with severe symptoms returns severo urgency"""
        payload = {
            "pet_type": "cao",
            "symptoms": ["convulsoes"],
            "severity": "severo"
        }
        response = requests.post(f"{BASE_URL}/api/symptom-calculator", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data['overall_urgency'] == 'severo', "Convulsoes should be severe urgency"
        
        print("✓ Severe symptoms correctly return 'severo' urgency")


class TestTestimonialsAPI:
    """Testimonials endpoint tests"""
    
    def test_get_testimonials(self):
        """GET /api/testimonials returns seeded testimonials"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have seeded testimonials"
        
        # Validate testimonial structure
        testimonial = data[0]
        required_fields = ['id', 'name', 'pet', 'rating', 'text']
        for field in required_fields:
            assert field in testimonial, f"Testimonial missing field: {field}"
        
        # Check rating is valid
        assert 1 <= testimonial['rating'] <= 5, "Rating should be 1-5"
        
        print(f"✓ GET /api/testimonials returned {len(data)} testimonials")
    
    def test_get_approved_testimonials(self):
        """GET /api/testimonials/approved returns only approved customer testimonials"""
        response = requests.get(f"{BASE_URL}/api/testimonials/approved")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # May be empty if no customer testimonials approved yet
        print(f"✓ GET /api/testimonials/approved returned {len(data)} approved testimonials")
    
    def test_submit_testimonial_with_video_url(self):
        """POST /api/testimonials/submit accepts video_url field"""
        payload = {
            "name": "TEST_User",
            "pet": "TEST_Pet (Cao)",
            "text": "Este e um depoimento de teste com video.",
            "rating": 5,
            "photo_base64": "",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
        response = requests.post(f"{BASE_URL}/api/testimonials/submit", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'message' in data
        assert 'id' in data
        
        print(f"✓ POST /api/testimonials/submit with video_url succeeded, id: {data['id']}")
    
    def test_submit_testimonial_without_video(self):
        """POST /api/testimonials/submit works without video_url"""
        payload = {
            "name": "TEST_User2",
            "pet": "TEST_Pet2 (Gato)",
            "text": "Depoimento sem video.",
            "rating": 4
        }
        response = requests.post(f"{BASE_URL}/api/testimonials/submit", json=payload)
        assert response.status_code == 200
        
        print("✓ POST /api/testimonials/submit without video_url succeeded")


class TestAuthAPI:
    """Authentication endpoint tests"""
    
    def test_login_admin(self):
        """POST /api/auth/login with admin credentials"""
        payload = {
            "email": "admin@medvet.com",
            "password": "admin123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data['email'] == 'admin@medvet.com'
        assert data['role'] == 'admin'
        
        print("✓ Admin login successful")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login with wrong password returns 401"""
        payload = {
            "email": "admin@medvet.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("✓ Invalid credentials return 401")


class TestProductsAPI:
    """Products endpoint tests"""
    
    def test_get_products(self):
        """GET /api/products returns product list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have seeded products"
        
        print(f"✓ GET /api/products returned {len(data)} products")
    
    def test_get_categories(self):
        """GET /api/categories returns category list"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have seeded categories"
        
        print(f"✓ GET /api/categories returned {len(data)} categories")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
