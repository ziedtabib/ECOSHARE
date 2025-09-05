#!/bin/bash

# Script de démarrage pour tous les services ECOSHARE
echo "🚀 Démarrage d'ECOSHARE - Tous les services"
echo "=============================================="

# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port est déjà utilisé"
        return 1
    else
        echo "✅ Port $port est libre"
        return 0
    fi
}

# Fonction pour attendre qu'un service soit prêt
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Attente du démarrage de $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name est prêt !"
            return 0
        fi
        
        echo "   Tentative $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service_name n'a pas démarré dans les temps"
    return 1
}

# Vérifier les ports
echo "🔍 Vérification des ports..."
check_port 3000 || echo "   Frontend (port 3000) déjà en cours d'exécution"
check_port 5000 || echo "   Backend (port 5000) déjà en cours d'exécution"
check_port 5001 || echo "   AI Service (port 5001) déjà en cours d'exécution"

echo ""

# Démarrer le service AI
echo "🤖 Démarrage du service AI..."
cd AI-Service
if [ ! -d ".venv" ]; then
    echo "📦 Création de l'environnement virtuel Python..."
    python -m venv .venv
fi

source .venv/bin/activate 2>/dev/null || .venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt > /dev/null 2>&1

echo "🚀 Lancement du service AI sur le port 5001..."
python app.py &
AI_PID=$!
cd ..

# Attendre que le service AI soit prêt
wait_for_service "http://localhost:5001/health" "Service AI"

# Démarrer le backend
echo "🔧 Démarrage du backend..."
cd Backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances Node.js..."
    npm install
fi

echo "🚀 Lancement du backend sur le port 5000..."
npm run dev &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
wait_for_service "http://localhost:5000/api/health" "Backend"

# Démarrer le frontend
echo "⚛️  Démarrage du frontend..."
cd Frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances React..."
    npm install
fi

echo "🚀 Lancement du frontend sur le port 3000..."
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Tous les services sont démarrés !"
echo "=============================================="
echo "🌐 Frontend:    http://localhost:3000"
echo "🔧 Backend:     http://localhost:5000"
echo "🤖 AI Service:  http://localhost:5001"
echo ""
echo "📊 PIDs des processus:"
echo "   Frontend: $FRONTEND_PID"
echo "   Backend:  $BACKEND_PID"
echo "   AI:       $AI_PID"
echo ""
echo "🛑 Pour arrêter tous les services, appuyez sur Ctrl+C"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    kill $FRONTEND_PID $BACKEND_PID $AI_PID 2>/dev/null
    echo "✅ Services arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Attendre indéfiniment
wait
