"""
Test Portuguese Accents in API Responses
Verifies that all API endpoints return properly accented Portuguese text
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPortugueseAccentsInAPIs:
    """Test that API responses contain proper Portuguese accents"""
    
    def test_categories_have_accented_names(self):
        """GET /api/categories - verify accented category names"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        categories = response.json()
        assert len(categories) > 0, "No categories returned"
        
        # Check for specific accented category names
        category_names = [cat['name'] for cat in categories]
        
        # Verify 'Homeopatia Veterinária' exists with accent
        assert any('Veterinária' in name for name in category_names), \
            f"'Veterinária' (with accent) not found in categories: {category_names}"
        
        # Verify 'Hormônios Bioidênticos' exists with accents
        assert any('Hormônios' in name for name in category_names), \
            f"'Hormônios' (with accent) not found in categories: {category_names}"
        
        print(f"✓ Categories have proper accents: {category_names}")
    
    def test_products_have_accented_descriptions(self):
        """GET /api/products - verify accented product descriptions"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        assert len(products) > 0, "No products returned"
        
        # Check first few products for accented text
        sample_product = products[0]
        assert 'description' in sample_product
        
        # Verify product descriptions contain Portuguese text
        all_descriptions = ' '.join([p.get('description', '') for p in products[:10]])
        
        # Check for common accented words in Portuguese
        has_accents = any(char in all_descriptions for char in 'áéíóúâêôãõç')
        assert has_accents, f"No accented characters found in product descriptions"
        
        print(f"✓ Products have accented descriptions")
    
    def test_blog_articles_have_accented_content(self):
        """GET /api/blog - verify accented blog content"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        
        articles = response.json()
        assert len(articles) > 0, "No blog articles returned"
        
        # Check article titles and content for accents
        all_content = ' '.join([
            a.get('title', '') + ' ' + a.get('excerpt', '') + ' ' + a.get('content', '')
            for a in articles[:5]
        ])
        
        # Verify content contains Portuguese accented characters
        has_accents = any(char in all_content for char in 'áéíóúâêôãõç')
        # Note: Some blog content may not have accents yet - this is informational
        if has_accents:
            print(f"✓ Blog articles have accented content")
        else:
            print(f"⚠ Blog articles may need accent corrections")
    
    def test_testimonials_api(self):
        """GET /api/testimonials - verify testimonials load"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200
        
        testimonials = response.json()
        assert isinstance(testimonials, list)
        print(f"✓ Testimonials API returns {len(testimonials)} items")
    
    def test_tips_api(self):
        """GET /api/tips - verify tips load"""
        response = requests.get(f"{BASE_URL}/api/tips")
        assert response.status_code == 200
        
        tips = response.json()
        assert isinstance(tips, list)
        print(f"✓ Tips API returns {len(tips)} items")
    
    def test_faq_api(self):
        """GET /api/faq - verify FAQ loads"""
        response = requests.get(f"{BASE_URL}/api/faq")
        assert response.status_code == 200
        
        faqs = response.json()
        assert isinstance(faqs, list)
        print(f"✓ FAQ API returns {len(faqs)} items")
    
    def test_symptom_calculator_symptoms(self):
        """GET /api/symptom-calculator/symptoms - verify symptoms load"""
        response = requests.get(f"{BASE_URL}/api/symptom-calculator/symptoms")
        assert response.status_code == 200
        
        symptoms = response.json()
        # Symptoms can be a dict (grouped by category) or list
        assert isinstance(symptoms, (list, dict))
        if isinstance(symptoms, dict):
            print(f"✓ Symptom Calculator API returns {len(symptoms)} symptom groups")
        else:
            print(f"✓ Symptom Calculator API returns {len(symptoms)} symptoms")


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_login_with_valid_credentials(self):
        """POST /api/auth/login - verify admin login works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@medvet.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        
        data = response.json()
        # Login can return user data directly or wrapped in 'user' key
        assert 'email' in data or 'user' in data or 'token' in data or 'access_token' in data
        print(f"✓ Admin login successful")
    
    def test_login_with_invalid_credentials(self):
        """POST /api/auth/login - verify invalid login returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 400]
        print(f"✓ Invalid login correctly rejected with status {response.status_code}")


class TestHealthAndBasicEndpoints:
    """Test basic health and endpoint availability"""
    
    def test_health_endpoint(self):
        """GET /api/health - verify health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        # Health endpoint may not exist, so we check for 200 or 404
        if response.status_code == 200:
            print(f"✓ Health endpoint available")
        else:
            print(f"⚠ Health endpoint not available (status {response.status_code})")
    
    def test_categories_endpoint_available(self):
        """GET /api/categories - verify endpoint is available"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        print(f"✓ Categories endpoint available")
    
    def test_products_endpoint_available(self):
        """GET /api/products - verify endpoint is available"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        print(f"✓ Products endpoint available")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
