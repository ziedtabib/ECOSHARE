import pytest
import sys
import os

# Définir l'environnement de test avant d'importer l'app
os.environ['FLASK_ENV'] = 'testing'

# Ajouter le répertoire parent au path pour importer l'app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    """Test que l'endpoint de santé fonctionne"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert 'message' in data
    assert 'ECOSHARE AI Service' in data['message']

def test_classify_object_endpoint(client):
    """Test que l'endpoint de classification d'objets existe"""
    response = client.post('/classify-object')
    # Devrait retourner 400 car pas d'image fournie, mais l'endpoint existe
    assert response.status_code == 400

def test_classify_food_endpoint(client):
    """Test que l'endpoint de classification d'aliments existe"""
    response = client.post('/classify-food')
    # Devrait retourner 400 car pas d'image fournie, mais l'endpoint existe
    assert response.status_code == 400
