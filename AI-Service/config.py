import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Config:
    """Configuration de base pour le service IA"""
    
    # Configuration Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ecoshare-ai-service-secret-key'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Configuration du port
    PORT = int(os.environ.get('PORT', 5001))
    
    # Configuration CORS
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    
    # Configuration des modèles IA
    AI_MODEL_PATH = os.environ.get('AI_MODEL_PATH', './models')
    AI_CACHE_SIZE = int(os.environ.get('AI_CACHE_SIZE', 1000))
    
    # Configuration des images
    MAX_IMAGE_SIZE = os.environ.get('MAX_IMAGE_SIZE', '10MB')
    ALLOWED_IMAGE_TYPES = os.environ.get('ALLOWED_IMAGE_TYPES', 'jpg,jpeg,png,gif,webp').split(',')
    
    # Configuration des logs
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', './logs/ai-service.log')
    
    # Configuration des API externes
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    GOOGLE_VISION_API_KEY = os.environ.get('GOOGLE_VISION_API_KEY')

class DevelopmentConfig(Config):
    """Configuration pour le développement"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """Configuration pour la production"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'

class TestingConfig(Config):
    """Configuration pour les tests"""
    TESTING = True
    DEBUG = True

# Configuration par défaut
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
