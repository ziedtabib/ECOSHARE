#!/usr/bin/env python3
"""
Script de démarrage pour le service IA ECOSHARE
"""

import os
import sys
import subprocess
import time
import signal
from pathlib import Path

def check_dependencies():
    """Vérifie que toutes les dépendances sont installées"""
    print("🔍 Vérification des dépendances...")
    
    required_packages = [
        'flask', 'flask_cors', 'pillow', 'requests', 
        'numpy', 'opencv-python', 'scikit-learn', 'python-dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} manquant")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Installation des packages manquants: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing_packages)
            print("✅ Installation terminée")
        except subprocess.CalledProcessError as e:
            print(f"❌ Erreur lors de l'installation: {e}")
            return False
    
    return True

def create_directories():
    """Crée les répertoires nécessaires"""
    print("\n📁 Création des répertoires...")
    
    directories = ['logs', 'models', 'uploads', 'temp']
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ {directory}/")

def start_service():
    """Démarre le service IA"""
    print("\n🚀 Démarrage du service IA ECOSHARE...")
    
    # Variables d'environnement
    env = os.environ.copy()
    env['FLASK_APP'] = 'app.py'
    env['FLASK_ENV'] = 'development'
    env['FLASK_DEBUG'] = 'True'
    env['PORT'] = '5001'
    
    try:
        # Démarrer le service
        process = subprocess.Popen(
            [sys.executable, 'app.py'],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print("✅ Service IA démarré")
        print("🌐 URL: http://localhost:5001")
        print("📊 Health check: http://localhost:5001/health")
        print("\n💡 Appuyez sur Ctrl+C pour arrêter le service")
        
        # Attendre que le processus se termine
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Arrêt du service...")
            process.terminate()
            process.wait()
            print("✅ Service arrêté")
            
    except Exception as e:
        print(f"❌ Erreur lors du démarrage: {e}")
        return False
    
    return True

def main():
    """Fonction principale"""
    print("🤖 Service IA ECOSHARE")
    print("=" * 50)
    
    # Vérifier les dépendances
    if not check_dependencies():
        print("❌ Impossible de démarrer le service")
        sys.exit(1)
    
    # Créer les répertoires
    create_directories()
    
    # Démarrer le service
    if not start_service():
        print("❌ Erreur lors du démarrage")
        sys.exit(1)

if __name__ == "__main__":
    main()
