const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import des modèles
const User = require('../models/User');
const Object = require('../models/Object');
const Food = require('../models/Food');
const Association = require('../models/Association');
const Post = require('../models/Post');

// Données de test
const testUsers = [
  {
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@example.com',
    password: 'password123',
    phone: '+33123456789',
    address: {
      street: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    points: 150,
    level: 'Silver'
  },
  {
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre.martin@example.com',
    password: 'password123',
    phone: '+33987654321',
    address: {
      street: '456 Avenue des Champs',
      city: 'Paris',
      postalCode: '75008',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    points: 75,
    level: 'Bronze'
  },
  {
    firstName: 'Sophie',
    lastName: 'Chen',
    email: 'sophie.chen@example.com',
    password: 'password123',
    phone: '+33555666777',
    address: {
      street: '789 Boulevard Saint-Germain',
      city: 'Paris',
      postalCode: '75006',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    points: 300,
    level: 'Gold'
  }
];

const testAssociations = [
  {
    name: 'Restos du Cœur',
    description: 'Association caritative aidant les personnes en difficulté avec des repas et des produits de première nécessité.',
    contact: {
      email: 'contact@restosducoeur.org',
      phone: '+33123456789',
      website: 'https://www.restosducoeur.org'
    },
    address: {
      street: '10 Rue de la Solidarité',
      city: 'Paris',
      postalCode: '75012',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    type: 'food_bank',
    acceptedCategories: ['food', 'clothing', 'other'],
    status: 'active',
    openingHours: [
      { day: 'monday', open: '09:00', close: '17:00' },
      { day: 'tuesday', open: '09:00', close: '17:00' },
      { day: 'wednesday', open: '09:00', close: '17:00' },
      { day: 'thursday', open: '09:00', close: '17:00' },
      { day: 'friday', open: '09:00', close: '17:00' },
      { day: 'saturday', isClosed: true },
      { day: 'sunday', isClosed: true }
    ]
  },
  {
    name: 'Emmaüs',
    description: 'Mouvement solidaire qui lutte contre l\'exclusion en collectant et revendant des objets de seconde main.',
    contact: {
      email: 'contact@emmaus-france.org',
      phone: '+33987654321',
      website: 'https://www.emmaus-france.org'
    },
    address: {
      street: '25 Rue de la Réutilisation',
      city: 'Paris',
      postalCode: '75015',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    type: 'general',
    acceptedCategories: ['furniture', 'clothing', 'electronics', 'books', 'other'],
    status: 'active',
    openingHours: [
      { day: 'monday', open: '10:00', close: '18:00' },
      { day: 'tuesday', open: '10:00', close: '18:00' },
      { day: 'wednesday', open: '10:00', close: '18:00' },
      { day: 'thursday', open: '10:00', close: '18:00' },
      { day: 'friday', open: '10:00', close: '18:00' },
      { day: 'saturday', open: '10:00', close: '18:00' },
      { day: 'sunday', isClosed: true }
    ]
  }
];

const testObjects = [
  {
    title: 'Vélo vintage en bon état',
    description: 'Magnifique vélo vintage des années 80, parfait pour se déplacer en ville. Quelques rayures mais fonctionne parfaitement.',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', isMain: true }
    ],
    aiClassification: {
      category: 'electronics',
      subcategory: 'transport',
      condition: 'good',
      confidence: 0.9,
      tags: ['vélo', 'transport', 'vintage', 'écologique'],
      estimatedValue: 150,
      isRecyclable: true,
      recyclingInstructions: 'Peut être réparé et réutilisé. Les pièces métalliques sont recyclables.'
    },
    location: {
      address: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    pointsReward: 20
  },
  {
    title: 'Livres de cuisine',
    description: 'Collection de 5 livres de cuisine française et internationale. Parfaits pour découvrir de nouvelles recettes.',
    images: [
      { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', isMain: true }
    ],
    aiClassification: {
      category: 'books',
      subcategory: 'cooking',
      condition: 'excellent',
      confidence: 0.95,
      tags: ['livres', 'cuisine', 'recettes', 'culture'],
      estimatedValue: 50,
      isRecyclable: true,
      recyclingInstructions: 'Les livres peuvent être donnés à des bibliothèques ou associations.'
    },
    location: {
      address: '456 Avenue des Champs',
      city: 'Paris',
      postalCode: '75008',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    pointsReward: 15
  }
];

const testFoods = [
  {
    title: 'Légumes bio du jardin',
    description: 'Tomates, courgettes et aubergines de mon jardin bio. Récoltés ce matin, parfaits pour une ratatouille !',
    images: [
      { url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', isMain: true }
    ],
    aiClassification: {
      foodType: 'vegetables',
      ingredients: ['tomates', 'courgettes', 'aubergines'],
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours
      condition: 'fresh',
      confidence: 0.9,
      nutritionalInfo: {
        calories: 25,
        protein: 1,
        carbs: 5,
        fat: 0
      },
      allergens: [],
      isEdible: true
    },
    location: {
      address: '789 Boulevard Saint-Germain',
      city: 'Paris',
      postalCode: '75006',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    urgency: 'medium',
    pointsReward: 25
  }
];

const testPosts = [
  {
    title: 'Collecte de jouets pour l\'hôpital',
    content: 'Bonjour à tous ! Nous organisons une collecte de jouets pour égayer les journées des enfants hospitalisés. Tous les jouets en bon état sont les bienvenus : peluches, jeux de société, livres, etc. Merci pour votre générosité !',
    type: 'help_request',
    category: 'toy_donation',
    location: {
      address: 'Hôpital Necker',
      city: 'Paris',
      postalCode: '75015',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      radius: 20
    },
    details: {
      helpRequest: {
        urgency: 'medium',
        targetQuantity: 50,
        unit: 'jouets',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        contactMethod: 'message'
      }
    },
    tags: ['jouets', 'hôpital', 'enfants', 'solidarité']
  }
];

// Fonction pour insérer les données
async function seedDatabase() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoshare');
    console.log('✅ Connexion à MongoDB réussie');

    // Nettoyer la base de données
    await User.deleteMany({});
    await Object.deleteMany({});
    await Food.deleteMany({});
    await Association.deleteMany({});
    await Post.deleteMany({});
    console.log('🧹 Base de données nettoyée');

    // Créer les utilisateurs
    const users = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log(`👥 ${users.length} utilisateurs créés`);

    // Créer les associations
    const associations = [];
    for (const associationData of testAssociations) {
      const association = new Association(associationData);
      await association.save();
      associations.push(association);
    }
    console.log(`🏢 ${associations.length} associations créées`);

    // Créer les objets
    const objects = [];
    for (let i = 0; i < testObjects.length; i++) {
      const objectData = {
        ...testObjects[i],
        owner: users[i % users.length]._id
      };
      const object = new Object(objectData);
      await object.save();
      objects.push(object);
    }
    console.log(`📦 ${objects.length} objets créés`);

    // Créer les aliments
    const foods = [];
    for (let i = 0; i < testFoods.length; i++) {
      const foodData = {
        ...testFoods[i],
        owner: users[i % users.length]._id
      };
      const food = new Food(foodData);
      await food.save();
      foods.push(food);
    }
    console.log(`🍎 ${foods.length} aliments créés`);

    // Créer les posts
    const posts = [];
    for (let i = 0; i < testPosts.length; i++) {
      const postData = {
        ...testPosts[i],
        author: users[i % users.length]._id
      };
      const post = new Post(postData);
      await post.save();
      posts.push(post);
    }
    console.log(`📝 ${posts.length} posts créés`);

    console.log('\n🎉 Base de données peuplée avec succès !');
    console.log('\n📊 Résumé :');
    console.log(`- ${users.length} utilisateurs`);
    console.log(`- ${associations.length} associations`);
    console.log(`- ${objects.length} objets`);
    console.log(`- ${foods.length} aliments`);
    console.log(`- ${posts.length} posts`);

    console.log('\n🔑 Comptes de test :');
    testUsers.forEach(user => {
      console.log(`- ${user.email} / password123`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du peuplement de la base de données:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connexion fermée');
  }
}

// Exécuter le script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
