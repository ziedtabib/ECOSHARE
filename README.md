# 🌱 ECOSHARE - Plateforme de Partage Écologique

[![CI/CD](https://github.com/ziedtabib/ECOSHARE/workflows/CI/badge.svg)](https://github.com/ziedtabib/ECOSHARE/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Description

ECOSHARE est une plateforme innovante de partage d'objets et d'aliments qui favorise l'économie circulaire et réduit le gaspillage. Grâce à l'intelligence artificielle, la plateforme classifie automatiquement les objets, génère des DIY créatifs et recommande des associations caritatives adaptées.

## ✨ Fonctionnalités Principales

### 🔍 **Module 1 - Gestion des Utilisateurs**

- ✅ Inscription et authentification (Email, Google, Facebook)
- ✅ Profils utilisateurs avec système de points
- ✅ Gestion des préférences et localisation
- ✅ Système de récompenses et classements

### 📦 **Module 2 - Partage d'Objets**

- ✅ Recherche et acquisition d'objets
- ✅ Classification automatique par IA
- ✅ Génération de DIY personnalisés
- ✅ Recommandations d'associations

### 🍎 **Module 3 - Partage d'Aliments**

- ✅ Partage d'aliments entre utilisateurs
- ✅ Classification des aliments par IA
- ✅ Génération de recettes
- ✅ Gestion des dates de péremption

### 🤝 **Module 4 - Associations Caritatives**

- ✅ Annuaire d'associations
- ✅ Système de recommandations
- ✅ Gestion des besoins et dons
- ✅ Suivi des contributions

### 📄 **Module 5 - Contrats Numériques**

- ✅ Création de contrats automatiques
- ✅ Signature électronique
- ✅ Suivi des échanges
- ✅ Historique des transactions

### 🚚 **Module 6 - Suivi de Livraison**

- ✅ Géolocalisation en temps réel
- ✅ Notifications de statut
- ✅ Estimation des délais
- ✅ Historique des livraisons

### 💬 **Module 7 - Chat en Temps Réel**

- ✅ Messagerie instantanée
- ✅ Notifications push
- ✅ Gestion des conversations
- ✅ Partage de fichiers

### 🏆 **Module 8 - Système de Récompenses**

- ✅ Points et niveaux
- ✅ Badges et achievements
- ✅ Classements communautaires
- ✅ Programmes de fidélité

## 🏗️ Architecture Technique

### Stack Technologique

| Composant           | Technologie            | Description                                      |
| ------------------- | ---------------------- | ------------------------------------------------ |
| **Frontend**        | React 18, Tailwind CSS | Interface utilisateur moderne et responsive      |
| **Backend**         | Node.js, Express.js    | API REST avec authentification JWT               |
| **IA Service**      | Python, Flask, OpenCV  | Classification d'objets et génération de contenu |
| **Base de données** | MongoDB                | Stockage des données NoSQL                       |
| **Cache**           | Redis                  | Cache et sessions                                |
| **Monitoring**      | Prometheus, Grafana    | Surveillance et métriques                        |
| **Logs**            | ELK Stack              | Centralisation des logs                          |
| **Déploiement**     | Docker, Kubernetes     | Containerisation et orchestration                |

### Architecture Microservices

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │   AI Service    │
│   (React/Nginx) │◄──►│   (Node.js)     │◄──►│   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   (Database)    │
                    └─────────────────┘
```

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** 18+
- **Python** 3.9+
- **MongoDB** 6.0+
- **Docker** 20.10+
- **Docker Compose** 2.0+

### Installation Rapide

1. **Cloner le repository**

   ```bash
   git clone https://github.com/ziedtabib/ECOSHARE.git
   cd ECOSHARE
   ```

2. **Configuration automatique**

   ```bash
   ./scripts/setup-dev.sh
   ```

3. **Démarrage avec Docker**

   ```bash
   docker-compose up -d
   ```

4. **Accès aux services**
   - 🌐 **Frontend**: http://localhost:3000
   - 🔧 **Backend API**: http://localhost:5000
   - 🤖 **AI Service**: http://localhost:5001
   - 📊 **Monitoring**: http://localhost:9090 (Prometheus)
   - 📈 **Dashboards**: http://localhost:3001 (Grafana)

### Installation Manuelle

#### Backend

```bash
cd Backend
npm install
cp .env.example .env
# Éditer .env avec vos configurations
npm run dev
```

#### Frontend

```bash
cd Frontend
npm install
npm start
```

#### AI Service

```bash
cd AI-Service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## 📊 Monitoring et Observabilité

### Métriques Disponibles

- **Performance**: Temps de réponse, débit, erreurs
- **Ressources**: CPU, mémoire, disque
- **Base de données**: Connexions, requêtes, index
- **Business**: Utilisateurs actifs, objets partagés, associations

### Dashboards Grafana

- 📊 **Vue d'ensemble**: Métriques globales du système
- 🔧 **API Performance**: Performance des endpoints
- 💾 **Base de données**: Métriques MongoDB
- 🖥️ **Ressources**: Utilisation CPU/Mémoire

### Alertes Configurées

- ⚠️ Taux d'erreur > 5%
- ⏱️ Latence > 2 secondes
- 💾 Utilisation mémoire > 90%
- 🔥 Utilisation CPU > 80%

## 🔄 CI/CD et Déploiement

### Pipeline Automatique

1. **Code commit** → GitHub
2. **Tests automatiques** → GitHub Actions
3. **Build images** → Docker Registry
4. **Deploy staging** → Serveur de test
5. **Tests d'intégration** → Automatiques
6. **Deploy production** → Serveur de production

### Environnements

- 🧪 **Development**: Développement local
- 🧪 **Staging**: Tests et validation
- 🚀 **Production**: Environnement de production

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

- 🔐 **Authentification JWT** avec refresh tokens
- 🛡️ **Validation des données** avec express-validator
- 🔒 **Chiffrement des mots de passe** avec bcrypt
- 🌐 **HTTPS obligatoire** en production
- 🚫 **Headers de sécurité** (CORS, CSP, etc.)
- 🔍 **Scan de vulnérabilités** automatique

### Audit de Sécurité

```bash
# Scan des vulnérabilités Docker
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ecoshare-backend:latest

# Scan des dépendances
npm audit
pip check
```

## 📚 Documentation

- 📖 **[Documentation API](docs/API.md)** - Documentation complète de l'API
- 🚀 **[Guide DevOps](docs/DEVOPS.md)** - Déploiement et infrastructure
- 🧪 **[Tests](docs/TESTS.md)** - Guide des tests
- 🔧 **[Configuration](docs/CONFIG.md)** - Configuration des services

## 🧪 Tests

### Exécution des Tests

```bash
# Tests Backend
cd Backend && npm test

# Tests Frontend
cd Frontend && npm test

# Tests AI Service
cd AI-Service && pytest

# Tests d'intégration
docker-compose -f docker-compose.test.yml up --build
```

### Coverage

- **Backend**: 85%+ de couverture
- **Frontend**: 80%+ de couverture
- **AI Service**: 75%+ de couverture

## 🤝 Contribution

### Comment Contribuer

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code

- **ESLint** pour JavaScript/TypeScript
- **Prettier** pour le formatage
- **PEP 8** pour Python
- **Conventional Commits** pour les messages

## 📈 Roadmap

### Version 1.1 (Q2 2024)

- [ ] Application mobile React Native
- [ ] Intégration blockchain pour la traçabilité
- [ ] API GraphQL
- [ ] Système de notifications push

### Version 1.2 (Q3 2024)

- [ ] Intelligence artificielle avancée
- [ ] Réalité augmentée pour la classification
- [ ] Intégration IoT
- [ ] Analytics avancés

### Version 2.0 (Q4 2024)

- [ ] Marketplace intégré
- [ ] Système de paiement
- [ ] API publique
- [ ] Intégrations tierces

## 🐛 Signaler un Bug

Pour signaler un bug, veuillez :

1. Vérifier que le bug n'a pas déjà été signalé
2. Créer une issue avec le template fourni
3. Inclure les logs et étapes de reproduction
4. Ajouter les labels appropriés

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développement**: Équipe ECOSHARE
- **DevOps**: Infrastructure et déploiement
- **Design**: Interface utilisateur et UX
- **IA**: Intelligence artificielle et ML

## 📞 Support

- 📧 **Email**: support@ecoshare.com
- 💬 **Discord**: [Serveur ECOSHARE](https://discord.gg/ecoshare)
- 📖 **Documentation**: [docs.ecoshare.com](https://docs.ecoshare.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/ziedtabib/ECOSHARE/issues)

## 🙏 Remerciements

- **Communauté Open Source** pour les outils et bibliothèques
- **Contributeurs** qui participent au développement
- **Utilisateurs** pour leurs retours et suggestions
- **Partenaires** pour leur soutien et collaboration

---

<div align="center">

**🌱 Ensemble, créons un monde plus durable et solidaire ! 🌱**

[![Website](https://img.shields.io/badge/Website-ecoshare.com-blue)](https://ecoshare.com)
[![Twitter](https://img.shields.io/badge/Twitter-@ecoshare-blue)](https://twitter.com/ecoshare)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ecoshare-blue)](https://linkedin.com/company/ecoshare)

</div>
