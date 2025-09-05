# Service IA ECOSHARE

Service d'intelligence artificielle pour la plateforme ECOSHARE, fournissant des fonctionnalités d'analyse d'images, de classification d'objets et d'aliments, et de génération de contenu DIY.

## 🚀 Fonctionnalités

### 1. Classification d'Objets

- Analyse d'images d'objets avec OpenCV et scikit-learn
- Classification par catégorie (électronique, vêtements, meubles, etc.)
- Détection de l'état (excellent, bon, moyen, mauvais)
- Estimation de valeur
- Détection de recyclabilité

### 2. Classification d'Aliments

- Analyse d'images d'aliments
- Détection de fraîcheur
- Classification par type (fruits, légumes, produits laitiers, etc.)
- Estimation de durée de conservation

### 3. Génération DIY

- Projets de transformation d'objets
- Instructions étape par étape
- Adaptation selon l'état de l'objet
- Conseils et astuces

### 4. Génération de Recettes

- Recettes basées sur les ingrédients disponibles
- Suggestions de plats
- Instructions de préparation

## 🛠️ Installation

### Prérequis

- Python 3.8+
- pip

### Installation des dépendances

```bash
pip install -r requirements.txt
```

### Démarrage du service

```bash
# Méthode 1: Script de démarrage
python start_service.py

# Méthode 2: Directement
python app.py
```

## 📡 API Endpoints

### Health Check

```
GET /health
```

### Classification d'Objet

```
POST /classify_object
Content-Type: application/json

{
  "image_url": "https://example.com/image.jpg"
}
```

### Classification d'Aliment

```
POST /classify_food
Content-Type: application/json

{
  "image_url": "https://example.com/food.jpg"
}
```

### Génération DIY

```
POST /generate_diy
Content-Type: application/json

{
  "category": "electronics",
  "object_name": "ancien téléphone",
  "description": "iPhone 6 en bon état",
  "condition": "good"
}
```

### Génération de Recette

```
POST /generate_recipe
Content-Type: application/json

{
  "food_type": "fruits",
  "ingredients": ["pommes", "bananes", "fraises"]
}
```

## 🧪 Tests

```bash
# Lancer les tests
python test_service.py
```

## ⚙️ Configuration

Le service utilise un système de configuration flexible :

- **Développement** : `FLASK_ENV=development`
- **Production** : `FLASK_ENV=production`
- **Test** : `FLASK_ENV=testing`

### Variables d'environnement

- `PORT` : Port du service (défaut: 5001)
- `FRONTEND_URL` : URL du frontend (défaut: http://localhost:3000)
- `LOG_LEVEL` : Niveau de log (défaut: INFO)
- `AI_MODEL_PATH` : Chemin vers les modèles IA
- `AI_CACHE_SIZE` : Taille du cache (défaut: 1000)

## 🔧 Développement

### Structure du projet

```
AI-Service/
├── app.py              # Application principale
├── config.py           # Configuration
├── requirements.txt    # Dépendances Python
├── start_service.py    # Script de démarrage
├── test_service.py     # Tests
├── pyrightconfig.json  # Configuration Pyright
├── logs/               # Fichiers de log
├── models/             # Modèles IA
├── uploads/            # Images uploadées
└── temp/               # Fichiers temporaires
```

### Ajout de nouvelles fonctionnalités

1. **Nouveau endpoint** : Ajouter dans `app.py`
2. **Nouvelle catégorie** : Modifier `OBJECT_CATEGORIES` ou `FOOD_CATEGORIES`
3. **Nouveau modèle** : Ajouter dans `models/`

## 🐛 Dépannage

### Erreurs d'importation

```bash
# Réinstaller les dépendances
pip install -r requirements.txt --force-reinstall
```

### Service ne démarre pas

```bash
# Vérifier les logs
tail -f logs/ai-service.log

# Vérifier le port
netstat -an | grep 5001
```

### Erreurs CORS

- Vérifier que `FRONTEND_URL` est correctement configuré
- S'assurer que le frontend fait des requêtes vers le bon port

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:5001/health
```

### Logs

Les logs sont stockés dans `logs/ai-service.log` et affichés dans la console.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet fait partie de la plateforme ECOSHARE et est sous licence MIT.
