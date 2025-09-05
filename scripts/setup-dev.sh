#!/bin/bash

# Script de configuration de l'environnement de développement
set -e

echo "🛠️ Configuration de l'environnement de développement ECOSHARE"

# Vérifier les prérequis
check_prerequisites() {
    echo "🔍 Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js n'est pas installé"
        echo "📥 Installation de Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 n'est pas installé"
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv
    fi
    
    # Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker n'est pas installé"
        echo "📥 Installation de Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose n'est pas installé"
        echo "📥 Installation de Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "✅ Prérequis vérifiés"
}

# Installer les dépendances
install_dependencies() {
    echo "📦 Installation des dépendances..."
    
    # Backend
    echo "🔧 Installation des dépendances Backend..."
    cd Backend
    npm install
    cd ..
    
    # Frontend
    echo "🔧 Installation des dépendances Frontend..."
    cd Frontend
    npm install
    cd ..
    
    # AI Service
    echo "🔧 Installation des dépendances AI Service..."
    cd AI-Service
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    cd ..
    
    echo "✅ Dépendances installées"
}

# Configuration des variables d'environnement
setup_environment() {
    echo "⚙️ Configuration des variables d'environnement..."
    
    # Backend .env
    if [ ! -f Backend/.env ]; then
        cat > Backend/.env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecoshare
JWT_SECRET=your-super-secret-jwt-key-change-in-production
AI_SERVICE_URL=http://localhost:5001
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF
        echo "✅ Fichier .env Backend créé"
    fi
    
    # AI Service .env
    if [ ! -f AI-Service/.env ]; then
        cat > AI-Service/.env << EOF
FLASK_ENV=development
FLASK_APP=app.py
MODEL_PATH=./models
UPLOAD_FOLDER=./uploads
EOF
        echo "✅ Fichier .env AI Service créé"
    fi
    
    echo "✅ Variables d'environnement configurées"
}

# Démarrer les services de développement
start_dev_services() {
    echo "🚀 Démarrage des services de développement..."
    
    # Démarrer MongoDB
    echo "📊 Démarrage de MongoDB..."
    docker run -d --name ecoshare-mongodb-dev -p 27017:27017 mongo:6.0
    
    # Attendre que MongoDB soit prêt
    echo "⏳ Attente de MongoDB..."
    sleep 10
    
    # Démarrer les services
    echo "🔧 Démarrage du Backend..."
    cd Backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    echo "🔧 Démarrage de l'AI Service..."
    cd AI-Service
    source venv/bin/activate
    python app.py &
    AI_PID=$!
    deactivate
    cd ..
    
    echo "🔧 Démarrage du Frontend..."
    cd Frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Sauvegarder les PIDs
    echo $BACKEND_PID > .pids/backend.pid
    echo $AI_PID > .pids/ai.pid
    echo $FRONTEND_PID > .pids/frontend.pid
    
    echo "✅ Services démarrés"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:5000"
    echo "🤖 AI Service: http://localhost:5001"
}

# Fonction principale
main() {
    echo "🎯 Configuration de l'environnement de développement"
    
    # Créer le dossier des PIDs
    mkdir -p .pids
    
    check_prerequisites
    install_dependencies
    setup_environment
    start_dev_services
    
    echo "🎉 Environnement de développement configuré!"
    echo "📝 Pour arrêter les services: ./scripts/stop-dev.sh"
}

# Exécution
main "$@"
