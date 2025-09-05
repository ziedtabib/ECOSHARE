#!/bin/bash

# Script de déploiement ECOSHARE
set -e

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
REGISTRY="ghcr.io/ziedtabib/ECOSHARE"

echo "🚀 Déploiement ECOSHARE - Environment: $ENVIRONMENT, Version: $VERSION"

# Fonction pour vérifier les prérequis
check_prerequisites() {
    echo "🔍 Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose n'est pas installé"
        exit 1
    fi
    
    echo "✅ Prérequis vérifiés"
}

# Fonction pour sauvegarder la base de données
backup_database() {
    echo "💾 Sauvegarde de la base de données..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker exec ecoshare-mongodb mongodump --out /backup/$(date +%Y%m%d_%H%M%S)
        echo "✅ Sauvegarde créée"
    fi
}

# Fonction pour arrêter les services
stop_services() {
    echo "🛑 Arrêt des services existants..."
    docker-compose down
    echo "✅ Services arrêtés"
}

# Fonction pour mettre à jour les images
update_images() {
    echo "📦 Mise à jour des images Docker..."
    
    # Pull des nouvelles images
    docker-compose pull
    
    # Build des images locales si nécessaire
    docker-compose build --no-cache
    
    echo "✅ Images mises à jour"
}

# Fonction pour démarrer les services
start_services() {
    echo "🚀 Démarrage des services..."
    
    # Démarrer les services
    docker-compose up -d
    
    # Attendre que les services soient prêts
    echo "⏳ Attente du démarrage des services..."
    sleep 30
    
    # Vérifier la santé des services
    check_health
    
    echo "✅ Services démarrés"
}

# Fonction pour vérifier la santé des services
check_health() {
    echo "🔍 Vérification de la santé des services..."
    
    # Vérifier le backend
    if ! curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "❌ Backend non disponible"
        exit 1
    fi
    
    # Vérifier le frontend
    if ! curl -f http://localhost:80 > /dev/null 2>&1; then
        echo "❌ Frontend non disponible"
        exit 1
    fi
    
    # Vérifier l'AI service
    if ! curl -f http://localhost:5001/health > /dev/null 2>&1; then
        echo "❌ AI Service non disponible"
        exit 1
    fi
    
    echo "✅ Tous les services sont opérationnels"
}

# Fonction pour nettoyer les ressources inutilisées
cleanup() {
    echo "🧹 Nettoyage des ressources inutilisées..."
    
    # Supprimer les images inutilisées
    docker image prune -f
    
    # Supprimer les volumes inutilisés
    docker volume prune -f
    
    echo "✅ Nettoyage terminé"
}

# Fonction pour envoyer des notifications
send_notification() {
    local status=$1
    local message=$2
    
    echo "📧 Envoi de notification: $status"
    
    # Ici vous pouvez ajouter l'envoi d'emails, Slack, Discord, etc.
    # Exemple avec curl vers un webhook:
    # curl -X POST -H 'Content-type: application/json' \
    #      --data "{\"text\":\"ECOSHARE Deployment $status: $message\"}" \
    #      $SLACK_WEBHOOK_URL
    
    echo "✅ Notification envoyée"
}

# Fonction principale
main() {
    echo "🎯 Début du déploiement ECOSHARE"
    
    check_prerequisites
    backup_database
    stop_services
    update_images
    start_services
    cleanup
    
    echo "🎉 Déploiement terminé avec succès!"
    send_notification "SUCCESS" "Déploiement réussi sur $ENVIRONMENT"
}

# Gestion des erreurs
trap 'echo "❌ Erreur lors du déploiement"; send_notification "FAILED" "Erreur lors du déploiement sur $ENVIRONMENT"; exit 1' ERR

# Exécution
main "$@"
