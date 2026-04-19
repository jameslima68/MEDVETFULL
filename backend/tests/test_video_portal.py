"""
Test suite for MEDVET TV Video Portal feature
Tests: /api/videos, /api/social/config endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://holistic-vet-shop.preview.emergentagent.com')

class TestVideoPortalAPI:
    """Video Portal API tests"""
    
    def test_get_all_videos(self):
        """GET /api/videos returns 19 videos with correct structure"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        
        videos = response.json()
        assert len(videos) == 19, f"Expected 19 videos, got {len(videos)}"
        
        # Verify video structure
        for video in videos:
            assert "id" in video
            assert "therapy" in video
            assert "title" in video
            assert "description" in video
            assert "duration" in video
            assert "tags" in video
            assert "thumbnail" in video
            assert "video_url" in video
            assert "has_video" in video
            assert isinstance(video["tags"], list)
    
    def test_videos_have_em_breve_status(self):
        """All 19 videos should have has_video=False (Em breve)"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        
        videos = response.json()
        # All videos are placeholders (no actual video files)
        for video in videos:
            assert video["has_video"] == False, f"Video {video['id']} should have has_video=False"
    
    def test_filter_videos_by_therapy_acupuntura(self):
        """GET /api/videos?therapy=acupuntura returns filtered videos"""
        response = requests.get(f"{BASE_URL}/api/videos?therapy=acupuntura")
        assert response.status_code == 200
        
        videos = response.json()
        # Should return acupuntura videos + geral videos
        assert len(videos) >= 1, "Should have at least 1 acupuntura video"
        
        # Verify all returned videos are either acupuntura or geral therapy
        for video in videos:
            assert video["therapy"] in ["acupuntura", "geral"], f"Video {video['id']} has unexpected therapy: {video['therapy']}"
    
    def test_filter_videos_by_therapy_homeopatia(self):
        """GET /api/videos?therapy=homeopatia returns filtered videos"""
        response = requests.get(f"{BASE_URL}/api/videos?therapy=homeopatia")
        assert response.status_code == 200
        
        videos = response.json()
        assert len(videos) >= 1, "Should have at least 1 homeopatia video"
        
        for video in videos:
            assert video["therapy"] in ["homeopatia", "geral"]
    
    def test_filter_videos_by_therapy_cbd(self):
        """GET /api/videos?therapy=cbd returns filtered videos"""
        response = requests.get(f"{BASE_URL}/api/videos?therapy=cbd")
        assert response.status_code == 200
        
        videos = response.json()
        assert len(videos) >= 1, "Should have at least 1 CBD video"
    
    def test_video_tags_present(self):
        """Videos should have relevant tags for filtering"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        
        videos = response.json()
        
        # Check specific videos have expected tags
        acupuntura_video = next((v for v in videos if v["id"] == "vid-acupuntura"), None)
        assert acupuntura_video is not None
        assert "acupuntura" in acupuntura_video["tags"]
        
        cbd_video = next((v for v in videos if v["id"] == "vid-cbd"), None)
        assert cbd_video is not None
        assert "CBD" in cbd_video["tags"]
    
    def test_video_thumbnails_are_urls(self):
        """All videos should have valid thumbnail URLs"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        
        videos = response.json()
        for video in videos:
            assert video["thumbnail"].startswith("http"), f"Video {video['id']} has invalid thumbnail URL"


class TestSocialConfigAPI:
    """Social Media Config API tests"""
    
    def test_get_social_config(self):
        """GET /api/social/config returns Instagram, TikTok, YouTube config"""
        response = requests.get(f"{BASE_URL}/api/social/config")
        assert response.status_code == 200
        
        config = response.json()
        
        # Verify structure
        assert "instagram" in config
        assert "tiktok" in config
        assert "youtube" in config
        
        # Verify Instagram structure
        assert "username" in config["instagram"]
        assert "profile_url" in config["instagram"]
        assert "configured" in config["instagram"]
        
        # Verify TikTok structure
        assert "username" in config["tiktok"]
        assert "profile_url" in config["tiktok"]
        assert "configured" in config["tiktok"]
        
        # Verify YouTube structure
        assert "channel_id" in config["youtube"]
        assert "channel_url" in config["youtube"]
        assert "configured" in config["youtube"]
    
    def test_social_config_not_configured(self):
        """Social media accounts should show as not configured (Em breve)"""
        response = requests.get(f"{BASE_URL}/api/social/config")
        assert response.status_code == 200
        
        config = response.json()
        
        # All should be not configured (env vars not set)
        assert config["instagram"]["configured"] == False
        assert config["tiktok"]["configured"] == False
        assert config["youtube"]["configured"] == False


class TestVideoPortalIntegration:
    """Integration tests for video portal"""
    
    def test_video_ids_are_unique(self):
        """All video IDs should be unique"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        
        videos = response.json()
        ids = [v["id"] for v in videos]
        assert len(ids) == len(set(ids)), "Video IDs are not unique"
    
    def test_all_therapies_have_videos(self):
        """Check that major therapies have associated videos"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        
        videos = response.json()
        therapies = set(v["therapy"] for v in videos)
        
        # Expected therapies
        expected = ["acupuntura", "fitoterapia", "homeopatia", "cbd", "florais", "fisioterapia", "nutricao"]
        for therapy in expected:
            assert therapy in therapies, f"Missing videos for therapy: {therapy}"
    
    def test_video_count_matches_expected(self):
        """Verify exactly 19 videos as per requirements"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        
        videos = response.json()
        assert len(videos) == 19, f"Expected exactly 19 videos, got {len(videos)}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
