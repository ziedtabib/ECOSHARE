/**
 * Script pour ajouter des associations de test
 */
const mongoose = require('mongoose');
const Association = require('../models/Association');
const User = require('../models/User');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoshare', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Données d'associations de test
const testAssociations = [
  {
    name: 'Les Restos du Cœur Tunisie',
    description: 'Association caritative qui lutte contre la pauvreté et l\'exclusion en distribuant des repas gratuits aux plus démunis.',
    type: 'food_bank',
    category: 'social',
    status: 'active',
    address: {
      street: '10 Rue de la Solidarité',
      city: 'Tunis',
      postalCode: '1000',
      country: 'Tunisie',
      coordinates: { lat: 36.8065, lng: 10.1815 }
    },
    contact: {
      email: 'contact@restosducoeur-tn.org',
      phone: '+216 71 123 456',
      website: 'https://www.restosducoeur-tn.org'
    },
    socialMedia: {
      facebook: 'https://facebook.com/restosducoeur-tn',
      instagram: 'https://instagram.com/restosducoeur-tn'
    },
    needs: [
      { category: 'food', item: 'Riz', quantity: 100, unit: 'kg', priority: 'high' },
      { category: 'food', item: 'Pâtes', quantity: 50, unit: 'kg', priority: 'medium' },
      { category: 'food', item: 'Conserves', quantity: 200, unit: 'boîtes', priority: 'high' }
    ],
    acceptedCategories: ['food', 'clothing', 'other'],
    tags: ['solidarité', 'alimentation', 'pauvreté'],
    stats: {
      totalDonations: 150,
      totalItemsReceived: 500,
      totalBeneficiaries: 200,
      views: 0,
      rating: { average: 4.8, count: 25 }
    }
  },
  {
    name: 'Association Tunisienne de Protection de l\'Environnement',
    description: 'Organisation dédiée à la protection de l\'environnement et à la promotion du développement durable en Tunisie.',
    type: 'environmental',
    category: 'environment',
    status: 'active',
    address: {
      street: '25 Avenue Habib Bourguiba',
      city: 'Sfax',
      postalCode: '3000',
      country: 'Tunisie',
      coordinates: { lat: 34.7406, lng: 10.7603 }
    },
    contact: {
      email: 'info@atpe-tn.org',
      phone: '+216 74 987 654',
      website: 'https://www.atpe-tn.org'
    },
    socialMedia: {
      facebook: 'https://facebook.com/atpe-tn',
      twitter: 'https://twitter.com/atpe_tn'
    },
    needs: [
      { category: 'equipment', item: 'Poubelles de tri', quantity: 20, unit: 'pièces', priority: 'high' },
      { category: 'materials', item: 'Sacs réutilisables', quantity: 1000, unit: 'pièces', priority: 'medium' }
    ],
    acceptedCategories: ['electronics', 'furniture', 'other'],
    tags: ['environnement', 'développement durable', 'recyclage'],
    stats: {
      totalDonations: 75,
      totalItemsReceived: 300,
      totalBeneficiaries: 150,
      views: 0,
      rating: { average: 4.6, count: 18 }
    }
  },
  {
    name: 'Centre d\'Accueil pour Enfants Défavorisés',
    description: 'Centre qui accueille et accompagne les enfants en situation difficile en leur offrant éducation, soins et soutien.',
    type: 'general',
    category: 'social',
    status: 'active',
    address: {
      street: '15 Rue de l\'Espoir',
      city: 'Sousse',
      postalCode: '4000',
      country: 'Tunisie',
      coordinates: { lat: 35.8256, lng: 10.6411 }
    },
    contact: {
      email: 'contact@caed-tn.org',
      phone: '+216 73 456 789',
      website: 'https://www.caed-tn.org'
    },
    socialMedia: {
      facebook: 'https://facebook.com/caed-tn',
      instagram: 'https://instagram.com/caed_tn'
    },
    needs: [
      { category: 'education', item: 'Livres pour enfants', quantity: 200, unit: 'livres', priority: 'high' },
      { category: 'clothing', item: 'Vêtements enfants', quantity: 100, unit: 'pièces', priority: 'high' },
      { category: 'toys', item: 'Jouets éducatifs', quantity: 50, unit: 'pièces', priority: 'medium' }
    ],
    acceptedCategories: ['books', 'clothing', 'toys', 'food'],
    tags: ['enfants', 'éducation', 'solidarité'],
    stats: {
      totalDonations: 200,
      totalItemsReceived: 800,
      totalBeneficiaries: 300,
      views: 0,
      rating: { average: 4.9, count: 35 }
    }
  }
];

// Fonction pour créer les associations
const seedAssociations = async () => {
  try {
    console.log('🌱 Ajout des associations de test...');
    
    // Trouver un utilisateur existant pour être le contact
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé. Créez d\'abord un utilisateur.');
      return;
    }

    // Supprimer les associations existantes (optionnel)
    await Association.deleteMany({});
    console.log('🗑️ Anciennes associations supprimées');

    // Créer les nouvelles associations
    for (const associationData of testAssociations) {
      const association = new Association({
        ...associationData,
        contactPerson: user._id
      });
      
      await association.save();
      console.log(`✅ Association créée: ${association.name}`);
    }

    console.log('🎉 Toutes les associations ont été créées avec succès!');
    
    // Afficher le nombre total d'associations
    const totalAssociations = await Association.countDocuments();
    console.log(`📊 Total d'associations dans la base: ${totalAssociations}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des associations:', error);
  }
};

// Fonction principale
const main = async () => {
  await connectDB();
  await seedAssociations();
  await mongoose.connection.close();
  console.log('👋 Connexion fermée');
};

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { seedAssociations };
