"""
Tests for MEDVET News and Newsletter features
- GET /api/news - Returns 10 seed articles
- GET /api/news?category=acupuntura - Returns filtered articles
- POST /api/newsletter/subscribe - Subscribe to newsletter
- POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNewsEndpoints:
    """Tests for MEDVET News API endpoints"""
    
    def test_get_all_news_returns_10_articles(self):
        """GET /api/news should return 10 seed articles"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 10, f"Expected 10 articles, got {len(data)}"
        print(f"✓ GET /api/news returns {len(data)} articles")
    
    def test_news_article_structure(self):
        """Each news article should have required fields"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ['id', 'title', 'source', 'author', 'link', 'summary', 'category', 'date']
        
        for article in data:
            for field in required_fields:
                assert field in article, f"Article missing field: {field}"
        
        # Check first article has expected values
        first = data[0]
        assert first['id'] == 'news-001'
        assert 'Acupuntura' in first['title']
        assert first['source'] == 'Journal of Veterinary Internal Medicine'
        assert first['category'] == 'acupuntura'
        print("✓ All news articles have required fields (id, title, source, author, link, summary, category, date)")
    
    def test_filter_news_by_category_acupuntura(self):
        """GET /api/news?category=acupuntura should return filtered articles"""
        response = requests.get(f"{BASE_URL}/api/news?category=acupuntura")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 1, "Should have at least 1 acupuntura article"
        
        for article in data:
            assert article['category'] == 'acupuntura', f"Expected category 'acupuntura', got '{article['category']}'"
        
        print(f"✓ GET /api/news?category=acupuntura returns {len(data)} filtered articles")
    
    def test_filter_news_by_category_cbd(self):
        """GET /api/news?category=cbd should return filtered articles"""
        response = requests.get(f"{BASE_URL}/api/news?category=cbd")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 1, "Should have at least 1 CBD article"
        
        for article in data:
            assert article['category'] == 'cbd'
        
        print(f"✓ GET /api/news?category=cbd returns {len(data)} filtered articles")
    
    def test_filter_news_by_category_ozonioterapia(self):
        """GET /api/news?category=ozonioterapia should return filtered articles"""
        response = requests.get(f"{BASE_URL}/api/news?category=ozonioterapia")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 1
        
        for article in data:
            assert article['category'] == 'ozonioterapia'
        
        print(f"✓ GET /api/news?category=ozonioterapia returns {len(data)} filtered articles")
    
    def test_filter_news_by_nonexistent_category(self):
        """GET /api/news?category=nonexistent should return empty list"""
        response = requests.get(f"{BASE_URL}/api/news?category=nonexistent")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 0, "Should return empty list for nonexistent category"
        print("✓ GET /api/news?category=nonexistent returns empty list")
    
    def test_news_sources_are_real_journals(self):
        """News articles should reference real scientific journals"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        
        data = response.json()
        expected_sources = [
            'Journal of Veterinary Internal Medicine',
            'Frontiers in Veterinary Science',
            'Veterinary Surgery',
            'Journal of the American Veterinary Medical Association',
            'BMC Veterinary Research',
            'Applied Animal Behaviour Science',
            'Stem Cell Research & Therapy',
            'Veterinary and Comparative Orthopaedics and Traumatology',
            'Veterinary Record',
            'SciELO - Pesquisa Veterinária Brasileira'
        ]
        
        sources_found = [article['source'] for article in data]
        for source in expected_sources:
            assert source in sources_found, f"Expected source '{source}' not found"
        
        print("✓ All 10 news articles reference real scientific journals")


class TestNewsletterEndpoints:
    """Tests for Newsletter subscribe/unsubscribe endpoints"""
    
    def test_subscribe_new_email(self):
        """POST /api/newsletter/subscribe should add new email"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'message' in data
        assert 'cadastrado' in data['message'].lower() or 'sucesso' in data['message'].lower()
        print(f"✓ POST /api/newsletter/subscribe works for new email")
        
        # Cleanup - unsubscribe
        requests.post(f"{BASE_URL}/api/newsletter/unsubscribe", json={"email": unique_email})
    
    def test_subscribe_duplicate_email(self):
        """POST /api/newsletter/subscribe with existing email should return appropriate message"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        # First subscription
        response1 = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email}
        )
        assert response1.status_code == 200
        
        # Second subscription (duplicate)
        response2 = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email}
        )
        assert response2.status_code == 200
        
        data = response2.json()
        assert 'message' in data
        # Should indicate already subscribed
        assert 'já cadastrado' in data['message'].lower() or 'cadastrado' in data['message'].lower()
        print("✓ POST /api/newsletter/subscribe handles duplicate email correctly")
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/newsletter/unsubscribe", json={"email": unique_email})
    
    def test_unsubscribe_existing_email(self):
        """POST /api/newsletter/unsubscribe should remove subscribed email"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        # First subscribe
        requests.post(f"{BASE_URL}/api/newsletter/subscribe", json={"email": unique_email})
        
        # Then unsubscribe
        response = requests.post(
            f"{BASE_URL}/api/newsletter/unsubscribe",
            json={"email": unique_email}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert 'message' in data
        assert 'descadastrado' in data['message'].lower()
        print("✓ POST /api/newsletter/unsubscribe works for existing email")
    
    def test_unsubscribe_nonexistent_email(self):
        """POST /api/newsletter/unsubscribe with nonexistent email should return 404"""
        nonexistent_email = f"nonexistent_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/newsletter/unsubscribe",
            json={"email": nonexistent_email}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        data = response.json()
        assert 'detail' in data
        assert 'não encontrado' in data['detail'].lower()
        print("✓ POST /api/newsletter/unsubscribe returns 404 for nonexistent email")
    
    def test_resubscribe_after_unsubscribe(self):
        """Should be able to resubscribe after unsubscribing"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        # Subscribe
        requests.post(f"{BASE_URL}/api/newsletter/subscribe", json={"email": unique_email})
        
        # Unsubscribe
        requests.post(f"{BASE_URL}/api/newsletter/unsubscribe", json={"email": unique_email})
        
        # Resubscribe
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert 'message' in data
        # Should indicate reactivated
        assert 'reativado' in data['message'].lower() or 'cadastrado' in data['message'].lower()
        print("✓ Resubscription after unsubscribe works correctly")
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/newsletter/unsubscribe", json={"email": unique_email})


class TestNewsCategories:
    """Test all news categories have articles"""
    
    def test_all_categories_have_articles(self):
        """Each category in seed data should have at least one article"""
        categories = ['acupuntura', 'cbd', 'ozonioterapia', 'nutricao', 'fitoterapia', 
                      'florais', 'celulas', 'fisioterapia', 'prp', 'homeopatia']
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/news?category={category}")
            assert response.status_code == 200
            
            data = response.json()
            assert len(data) >= 1, f"Category '{category}' should have at least 1 article"
            print(f"✓ Category '{category}' has {len(data)} article(s)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
