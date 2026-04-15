"""
Test suite for MEDVET INTEGRATIVA new features:
1. Terapia Alimentar category and products
2. Products by segment page (/loja)
3. Dietary therapy page (/terapia-alimentar)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTerapiaAlimentarCategory:
    """Tests for the new Terapia Alimentar category"""
    
    def test_categories_includes_terapia_alimentar(self):
        """GET /api/categories should include terapia-alimentar category"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        categories = response.json()
        category_slugs = [c['slug'] for c in categories]
        assert 'terapia-alimentar' in category_slugs, "terapia-alimentar category not found"
        
        # Verify category details
        terapia_cat = next((c for c in categories if c['slug'] == 'terapia-alimentar'), None)
        assert terapia_cat is not None
        assert terapia_cat['name'] == 'Terapia Alimentar'
        assert 'cetogênica' in terapia_cat['description'].lower() or 'cetogenica' in terapia_cat['description'].lower()
        print(f"✓ Terapia Alimentar category found: {terapia_cat['name']}")
    
    def test_terapia_alimentar_products_count(self):
        """GET /api/products?category=terapia-alimentar should return 8 products"""
        response = requests.get(f"{BASE_URL}/api/products?category=terapia-alimentar")
        assert response.status_code == 200
        
        products = response.json()
        assert len(products) == 8, f"Expected 8 products, got {len(products)}"
        print(f"✓ Found {len(products)} terapia-alimentar products")
    
    def test_terapia_alimentar_products_details(self):
        """Verify terapia-alimentar products have correct structure"""
        response = requests.get(f"{BASE_URL}/api/products?category=terapia-alimentar")
        assert response.status_code == 200
        
        products = response.json()
        expected_ids = ['ali-001', 'ali-002', 'ali-003', 'ali-004', 'ali-005', 'ali-006', 'ali-007', 'ali-008']
        
        for product in products:
            assert 'id' in product
            assert 'name' in product
            assert 'description' in product
            assert 'price' in product
            assert 'category' in product
            assert product['category'] == 'terapia-alimentar'
            assert product['price'] > 0
            print(f"  ✓ Product: {product['name']} - R$ {product['price']}")
        
        product_ids = [p['id'] for p in products]
        for expected_id in expected_ids:
            assert expected_id in product_ids, f"Product {expected_id} not found"
        
        print(f"✓ All 8 terapia-alimentar products verified")
    
    def test_cetogenic_kit_product(self):
        """Verify the cetogenic diet kit product exists"""
        response = requests.get(f"{BASE_URL}/api/products?category=terapia-alimentar")
        assert response.status_code == 200
        
        products = response.json()
        cetogenic_kit = next((p for p in products if 'cetogênica' in p['name'].lower() or 'cetogenica' in p['name'].lower()), None)
        
        assert cetogenic_kit is not None, "Cetogenic diet kit not found"
        assert cetogenic_kit['id'] == 'ali-001'
        assert cetogenic_kit['price'] == 289.90
        print(f"✓ Cetogenic kit found: {cetogenic_kit['name']}")


class TestAllCategories:
    """Tests for all categories including the new one"""
    
    def test_total_categories_count(self):
        """Should have 9 categories total"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        categories = response.json()
        assert len(categories) == 9, f"Expected 9 categories, got {len(categories)}"
        print(f"✓ Total categories: {len(categories)}")
    
    def test_all_expected_categories_exist(self):
        """Verify all expected categories exist"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        categories = response.json()
        expected_slugs = [
            'homeopatia',
            'hormonios',
            'medicina-chinesa',
            'cbd',
            'acupuntura',
            'saúde-pelos',
            'cromoterapia',
            'terapia-alimentar',
            'dicas'
        ]
        
        category_slugs = [c['slug'] for c in categories]
        for slug in expected_slugs:
            assert slug in category_slugs, f"Category {slug} not found"
            print(f"  ✓ Category: {slug}")
        
        print(f"✓ All {len(expected_slugs)} expected categories found")


class TestProductsEndpoint:
    """Tests for products endpoint"""
    
    def test_products_endpoint_works(self):
        """GET /api/products should return products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        assert len(products) > 0, "No products returned"
        print(f"✓ Total products: {len(products)}")
    
    def test_products_filter_by_category(self):
        """Products can be filtered by category"""
        categories_to_test = ['homeopatia', 'cbd', 'terapia-alimentar']
        
        for category in categories_to_test:
            response = requests.get(f"{BASE_URL}/api/products?category={category}")
            assert response.status_code == 200
            
            products = response.json()
            assert len(products) > 0, f"No products for category {category}"
            
            for product in products:
                assert product['category'] == category
            
            print(f"  ✓ Category {category}: {len(products)} products")
        
        print(f"✓ Category filtering works correctly")


class TestAuthEndpoints:
    """Tests for authentication endpoints"""
    
    def test_login_with_admin_credentials(self):
        """Admin login should work"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@medvet.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert 'id' in data
        assert data['email'] == 'admin@medvet.com'
        assert data['role'] == 'admin'
        print(f"✓ Admin login successful: {data['email']}")
    
    def test_login_with_invalid_credentials(self):
        """Invalid login should return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print(f"✓ Invalid login correctly rejected")


class TestOtherEndpoints:
    """Tests for other API endpoints"""
    
    def test_testimonials_endpoint(self):
        """GET /api/testimonials should work"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200
        print(f"✓ Testimonials endpoint works")
    
    def test_faq_endpoint(self):
        """GET /api/faq should work"""
        response = requests.get(f"{BASE_URL}/api/faq")
        assert response.status_code == 200
        print(f"✓ FAQ endpoint works")
    
    def test_tips_endpoint(self):
        """GET /api/tips should work"""
        response = requests.get(f"{BASE_URL}/api/tips")
        assert response.status_code == 200
        print(f"✓ Tips endpoint works")
    
    def test_blog_endpoint(self):
        """GET /api/blog should work"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        print(f"✓ Blog endpoint works")
    
    def test_symptom_calculator_symptoms(self):
        """GET /api/symptom-calculator/symptoms should work"""
        response = requests.get(f"{BASE_URL}/api/symptom-calculator/symptoms")
        assert response.status_code == 200
        
        symptoms = response.json()
        assert len(symptoms) > 0
        print(f"✓ Symptom calculator endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
