# CRUD Complet du Profil Utilisateur

## 📋 Vue d'ensemble

Ce document décrit l'API complète pour la gestion des profils utilisateur dans ECOSHARE, incluant toutes les opérations CRUD (Create, Read, Update, Delete) et les fonctionnalités avancées.

## 🔗 Base URL

```
http://localhost:5000/api/profile
```

## 🔐 Authentification

Toutes les routes (sauf `/public/:id`) nécessitent un token d'authentification :

```
Authorization: Bearer <token>
```

## 📚 Routes Disponibles

### 1. **Gestion du Profil de Base**

#### `GET /` - Récupérer le profil complet

```javascript
// Réponse
{
  "success": true,
  "profile": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatar": "/uploads/avatars/avatar.jpg",
    "address": {
      "street": "123 Main St",
      "city": "Tunis",
      "postalCode": "1000",
      "country": "Tunisie"
    },
    "preferences": { ... },
    "points": 150,
    "level": "Silver",
    "isVerified": true,
    "isActive": true,
    "stats": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `PUT /` - Mettre à jour le profil

```javascript
// Requête
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Tunis",
    "postalCode": "1000",
    "country": "Tunisie"
  },
  "preferences": {
    "radius": 15,
    "categories": ["electronics", "books"],
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  }
}
```

### 2. **Gestion de l'Avatar**

#### `POST /avatar` - Uploader un avatar

```javascript
// FormData
{
  "avatar": File // Image (JPEG, PNG, GIF, WebP) - Max 5MB
}
```

#### `DELETE /avatar` - Supprimer l'avatar

```javascript
// Réponse
{
  "success": true,
  "message": "Avatar supprimé avec succès"
}
```

### 3. **Gestion du Mot de Passe**

#### `PUT /password` - Changer le mot de passe

```javascript
// Requête
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### 4. **Statistiques et Analytics**

#### `GET /stats` - Statistiques de base

```javascript
// Réponse
{
  "success": true,
  "stats": {
    "objectsShared": 5,
    "objectsReceived": 3,
    "foodsShared": 2,
    "foodsReceived": 1,
    "totalExchanges": 8,
    "points": 150,
    "level": "Silver",
    "daysSinceRegistration": 30,
    "averageExchangesPerMonth": 2.5,
    "levelProgress": {
      "current": 150,
      "next": 300,
      "percentage": 25
    }
  }
}
```

#### `GET /analytics` - Analytics avancées

```javascript
// Réponse
{
  "success": true,
  "analytics": {
    "overview": {
      "totalExchanges": 8,
      "pointsEarned": 150,
      "daysActive": 30,
      "currentLevel": "Silver"
    },
    "trends": {
      "averageExchangesPerMonth": 2.5,
      "pointsPerDay": 5.0,
      "levelProgress": { ... }
    },
    "breakdown": {
      "objectsShared": 5,
      "objectsReceived": 3,
      "foodsShared": 2,
      "foodsReceived": 1
    }
  }
}
```

### 5. **Préférences**

#### `PUT /preferences` - Mettre à jour les préférences

```javascript
// Requête
{
  "radius": 15,
  "categories": ["electronics", "books", "clothing"],
  "notifications": {
    "email": true,
    "push": false,
    "sms": true
  }
}
```

### 6. **Vérification d'Email**

#### `POST /resend-verification` - Renvoyer l'email de vérification

```javascript
// Réponse
{
  "success": true,
  "message": "Email de vérification renvoyé avec succès"
}
```

#### `POST /verify-email` - Vérifier l'email avec le code

```javascript
// Requête
{
  "code": "123456"
}
```

### 7. **Gestion des Sessions**

#### `GET /sessions` - Obtenir les sessions actives

```javascript
// Réponse
{
  "success": true,
  "sessions": [
    {
      "id": "current",
      "device": "Chrome sur Windows",
      "location": "Tunis, Tunisie",
      "lastActive": "2024-01-01T12:00:00.000Z",
      "current": true
    }
  ]
}
```

#### `DELETE /sessions/:id` - Terminer une session

```javascript
// Réponse
{
  "success": true,
  "message": "Session terminée avec succès"
}
```

### 8. **Historique des Activités**

#### `GET /activity` - Obtenir l'historique des activités

```javascript
// Paramètres de requête
{
  "page": 1,
  "limit": 20
}

// Réponse
{
  "success": true,
  "activities": [
    {
      "id": "1",
      "type": "profile_update",
      "description": "Profil mis à jour",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "details": { "field": "firstName" }
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 10
  }
}
```

### 9. **Export des Données (RGPD)**

#### `GET /export` - Exporter les données personnelles

```javascript
// Réponse
{
  "success": true,
  "data": {
    "personalInfo": { ... },
    "preferences": { ... },
    "stats": { ... },
    "exportDate": "2024-01-01T12:00:00.000Z"
  },
  "message": "Données exportées avec succès"
}
```

### 10. **Notifications**

#### `GET /notifications` - Obtenir les notifications

```javascript
// Paramètres de requête
{
  "page": 1,
  "limit": 20,
  "unreadOnly": false
}

// Réponse
{
  "success": true,
  "notifications": [
    {
      "id": "1",
      "type": "exchange_request",
      "title": "Nouvelle demande d'échange",
      "message": "Jean Dupont souhaite échanger votre livre",
      "read": false,
      "timestamp": "2024-01-01T12:00:00.000Z",
      "actionUrl": "/exchanges/123"
    }
  ],
  "unreadCount": 2,
  "pagination": { ... }
}
```

#### `PUT /notifications/:id/read` - Marquer une notification comme lue

```javascript
// Réponse
{
  "success": true,
  "message": "Notification marquée comme lue"
}
```

### 11. **Profil Public**

#### `GET /public/:id` - Obtenir le profil public d'un utilisateur

```javascript
// Réponse
{
  "success": true,
  "profile": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "/uploads/avatars/avatar.jpg",
    "points": 150,
    "level": "Silver",
    "stats": {
      "objectsShared": 5,
      "objectsReceived": 3,
      "foodsShared": 2,
      "foodsReceived": 1,
      "totalExchanges": 8
    },
    "memberSince": "2024-01-01T00:00:00.000Z"
  }
}
```

### 12. **Suppression du Compte**

#### `DELETE /` - Supprimer le compte

```javascript
// Requête
{
  "password": "userPassword123",
  "confirmDelete": "SUPPRIMER"
}

// Réponse
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

## 🚨 Codes d'Erreur

| Code | Description           |
| ---- | --------------------- |
| 400  | Données invalides     |
| 401  | Non authentifié       |
| 403  | Accès refusé          |
| 404  | Ressource non trouvée |
| 500  | Erreur serveur        |

## 📝 Exemples d'Utilisation Frontend

```javascript
import { profileService } from "../services/api";

// Récupérer le profil
const profile = await profileService.getProfile();

// Mettre à jour le profil
const updatedProfile = await profileService.updateProfile({
  firstName: "John",
  lastName: "Doe",
});

// Uploader un avatar
const avatarResult = await profileService.uploadAvatar(file);

// Obtenir les analytics
const analytics = await profileService.getAnalytics();

// Exporter les données
const exportData = await profileService.exportData();
```

## 🔧 Validation

### Champs requis pour la mise à jour du profil :

- `firstName`: 2-50 caractères
- `lastName`: 2-50 caractères
- `phone`: 5-20 caractères (optionnel)
- `address.street`: max 200 caractères (optionnel)
- `address.city`: max 100 caractères (optionnel)
- `address.postalCode`: max 10 caractères (optionnel)
- `address.country`: max 100 caractères (optionnel)
- `preferences.radius`: 1-100 (optionnel)
- `preferences.categories`: tableau (optionnel)
- `preferences.notifications.*`: booléen (optionnel)

### Types de fichiers autorisés pour l'avatar :

- JPEG, PNG, GIF, WebP
- Taille maximale : 5MB

## 🎯 Fonctionnalités Avancées

1. **Système de points et niveaux** : Bronze, Silver, Gold, Platinum
2. **Analytics en temps réel** : Tendances, statistiques détaillées
3. **Gestion des sessions** : Suivi des connexions actives
4. **Export RGPD** : Conformité aux réglementations
5. **Notifications granulaires** : Email, push, SMS
6. **Historique des activités** : Log complet des actions
7. **Vérification d'email** : Sécurité renforcée
8. **Profil public** : Partage sécurisé d'informations

## 🔒 Sécurité

- Authentification JWT requise
- Validation stricte des données
- Limitation de taille des fichiers
- Chiffrement des mots de passe
- Protection CSRF
- Rate limiting
