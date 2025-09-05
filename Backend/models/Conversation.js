const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // Participants de la conversation
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Type de conversation
  type: {
    type: String,
    enum: ['direct', 'group', 'object_exchange', 'food_exchange', 'association'],
    default: 'direct'
  },
  
  // Référence à l'objet ou aliment (si applicable)
  relatedItem: {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedItem.itemType'
    },
    itemType: {
      type: String,
      enum: ['Object', 'Food']
    }
  },
  
  // Référence à une association (si applicable)
  association: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Association'
  },
  
  // Dernier message
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Métadonnées de la conversation
  metadata: {
    title: String, // Pour les conversations de groupe
    description: String,
    image: String, // Avatar de la conversation
    isArchived: {
      type: Boolean,
      default: false
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    settings: {
      allowFileSharing: {
        type: Boolean,
        default: true
      },
      allowImageSharing: {
        type: Boolean,
        default: true
      },
      maxParticipants: {
        type: Number,
        default: 10
      }
    }
  },
  
  // Statistiques
  stats: {
    messageCount: {
      type: Number,
      default: 0
    },
    unreadCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index pour les recherches
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ 'relatedItem.item': 1, 'relatedItem.itemType': 1 });
conversationSchema.index({ updatedAt: -1 });

// Méthodes du modèle
conversationSchema.methods.addParticipant = function(userId) {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
      lastReadAt: new Date(),
      isActive: true
    });
  } else {
    existingParticipant.isActive = true;
    existingParticipant.joinedAt = new Date();
  }
  
  return this.save();
};

conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
  return this.save();
};

conversationSchema.methods.updateLastRead = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastReadAt = new Date();
    return this.save();
  }
  
  return Promise.resolve(this);
};

conversationSchema.methods.getUnreadCount = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!participant) return 0;
  
  // Cette méthode sera complétée avec une requête sur les messages
  return 0; // Placeholder
};

conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(
    p => p.user.toString() === userId.toString() && p.isActive
  );
};

conversationSchema.methods.getOtherParticipant = function(userId) {
  if (this.type !== 'direct') return null;
  
  const otherParticipant = this.participants.find(
    p => p.user.toString() !== userId.toString() && p.isActive
  );
  
  return otherParticipant ? otherParticipant.user : null;
};

// Méthodes statiques
conversationSchema.statics.findOrCreateDirectConversation = async function(user1Id, user2Id) {
  // Chercher une conversation directe existante
  let conversation = await this.findOne({
    type: 'direct',
    'participants.user': { $all: [user1Id, user2Id] },
    'participants.1': { $exists: false } // Exactement 2 participants
  });
  
  if (!conversation) {
    // Créer une nouvelle conversation directe
    conversation = new this({
      type: 'direct',
      participants: [
        { user: user1Id },
        { user: user2Id }
      ]
    });
    
    await conversation.save();
  }
  
  return conversation;
};

conversationSchema.statics.findByItem = function(itemId, itemType) {
  return this.findOne({
    'relatedItem.item': itemId,
    'relatedItem.itemType': itemType
  });
};

conversationSchema.statics.findUserConversations = function(userId, options = {}) {
  const query = {
    'participants.user': userId,
    'participants.isActive': true
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.archived !== undefined) {
    query['metadata.isArchived'] = options.archived;
  }
  
  return this.find(query)
    .populate('participants.user', 'firstName lastName avatar email')
    .populate('lastMessage')
    .populate('relatedItem.item', 'title description images')
    .populate('association', 'name description image')
    .sort({ updatedAt: -1 });
};

// Middleware pre-save
conversationSchema.pre('save', function(next) {
  // Mettre à jour le nombre de participants actifs
  this.stats.participantCount = this.participants.filter(p => p.isActive).length;
  next();
});

// Middleware post-save
conversationSchema.post('save', async function(doc) {
  // Mettre à jour les statistiques si nécessaire
  if (doc.isModified('lastMessage')) {
    // Recalculer le nombre de messages non lus pour chaque participant
    // Cette logique sera implémentée dans le service de messages
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);