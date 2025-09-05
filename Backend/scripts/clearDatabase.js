const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const User = require('../models/User');
const Object = require('../models/Object');
const Food = require('../models/Food');
const Association = require('../models/Association');
const Post = require('../models/Post');
const Contract = require('../models/Contract');
const Delivery = require('../models/Delivery');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Reward = require('../models/Reward');
const RewardRedemption = require('../models/RewardRedemption');
const PendingUser = require('../models/PendingUser');
const Partner = require('../models/Partner');

// Fonction pour nettoyer la base de données
async function clearDatabase() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoshare');
    console.log('✅ Connexion à MongoDB réussie');

    // Nettoyer toutes les collections
    console.log('🧹 Nettoyage de la base de données...');
    
    const collections = [
      { name: 'Users', model: User },
      { name: 'Objects', model: Object },
      { name: 'Foods', model: Food },
      { name: 'Associations', model: Association },
      { name: 'Posts', model: Post },
      { name: 'Contracts', model: Contract },
      { name: 'Deliveries', model: Delivery },
      { name: 'Messages', model: Message },
      { name: 'Conversations', model: Conversation },
      { name: 'Rewards', model: Reward },
      { name: 'RewardRedemptions', model: RewardRedemption },
      { name: 'PendingUsers', model: PendingUser },
      { name: 'Partners', model: Partner }
    ];

    for (const collection of collections) {
      const count = await collection.model.countDocuments();
      if (count > 0) {
        await collection.model.deleteMany({});
        console.log(`🗑️  ${count} ${collection.name} supprimés`);
      } else {
        console.log(`✅ ${collection.name} déjà vide`);
      }
    }

    console.log('\n🎉 Base de données nettoyée avec succès !');
    console.log('📱 L\'application devrait maintenant afficher un état vide.');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connexion fermée');
  }
}

// Exécuter le script
if (require.main === module) {
  clearDatabase();
}

module.exports = { clearDatabase };
