const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversation à laquelle appartient le message
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  // Expéditeur du message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contenu du message
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères']
  },
  
  // Type de message
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'location', 'contact', 'system', 'exchange_update', 'delivery_update'],
    default: 'text'
  },
  
  // Métadonnées selon le type
  metadata: {
    // Pour les images
    image: {
      url: String,
      thumbnail: String,
      width: Number,
      height: Number,
      size: Number,
      alt: String
    },
    
    // Pour les fichiers
    file: {
      url: String,
      filename: String,
      size: Number,
      mimeType: String,
      originalName: String
    },
    
    // Pour la localisation
    location: {
      lat: Number,
      lng: Number,
      address: String,
      name: String
    },
    
    // Pour les contacts
    contact: {
      name: String,
      phone: String,
      email: String
    },
    
    // Pour les mises à jour d'échange
    exchangeUpdate: {
      status: String,
      objectId: String,
      foodId: String,
      details: mongoose.Schema.Types.Mixed
    },
    
    // Pour les mises à jour de livraison
    deliveryUpdate: {
      status: String,
      deliveryId: String,
      location: {
        lat: Number,
        lng: Number
      },
      estimatedArrival: Date
    }
  },
  
  // Message de réponse (reply)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Statut du message
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Utilisateurs qui ont lu le message
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Réactions au message
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Messages épinglés
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // Message supprimé
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  // Date de suppression
  deletedAt: Date,
  
  // Utilisateur qui a supprimé le message
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Raison de la suppression
  deletionReason: String,
  
  // Messages modifiés
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Modération
  moderation: {
    isReported: {
      type: Boolean,
      default: false
    },
    reports: [{
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'harassment', 'fake_news', 'other']
      },
      description: String,
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isModerated: {
      type: Boolean,
      default: false
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    moderationAction: {
      type: String,
      enum: ['warn', 'hide', 'delete', 'none']
    }
  }
}, {
  timestamps: true
});

// Index pour les recherches
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ 'readBy.user': 1 });

// Middleware pour mettre à jour le statut
messageSchema.pre('save', function(next) {
  // Si le message est marqué comme lu par au moins un utilisateur, mettre à jour le statut
  if (this.readBy.length > 0 && this.status === 'sent') {
    this.status = 'read';
  }
  
  next();
});

// Méthode pour ajouter une réaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Vérifier si l'utilisateur a déjà réagi avec cet emoji
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString() && r.emoji === emoji
  );
  
  if (existingReaction) {
    // Retirer la réaction existante
    this.reactions = this.reactions.filter(
      r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
    );
  } else {
    // Ajouter la nouvelle réaction
    this.reactions.push({
      user: userId,
      emoji: emoji
    });
  }
  
  return this.save();
};

// Méthode pour marquer comme lu
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(
    r => r.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({ user: userId });
    
    // Mettre à jour le statut si c'est le premier lecteur
    if (this.readBy.length === 1) {
      this.status = 'read';
    }
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Méthode pour modifier le message
messageSchema.methods.editMessage = function(newContent, userId) {
  if (this.sender.toString() !== userId.toString()) {
    throw new Error('Seul l\'expéditeur peut modifier le message');
  }
  
  // Sauvegarder l'ancien contenu dans l'historique
  if (!this.edited.isEdited) {
    this.edited.editHistory = [{
      content: this.content,
      editedAt: this.createdAt
    }];
  }
  
  this.edited.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  this.content = newContent;
  this.edited.isEdited = true;
  this.edited.editedAt = new Date();
  
  return this.save();
};

// Méthode pour supprimer le message
messageSchema.methods.deleteMessage = function(userId, reason = '') {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.deletionReason = reason;
  
  return this.save();
};

// Méthode pour épingler le message
messageSchema.methods.pinMessage = function(userId) {
  // Vérifier que l'utilisateur fait partie de la conversation
  // Cette vérification devrait être faite au niveau de la route
  this.isPinned = true;
  return this.save();
};

// Méthode pour désépingler le message
messageSchema.methods.unpinMessage = function(userId) {
  this.isPinned = false;
  return this.save();
};

// Méthode pour signaler le message
messageSchema.methods.reportMessage = function(userId, reason, description = '') {
  this.moderation.isReported = true;
  this.moderation.reports.push({
    reportedBy: userId,
    reason: reason,
    description: description
  });
  
  return this.save();
};

// Méthode statique pour obtenir les messages d'une conversation
messageSchema.statics.getConversationMessages = function(conversationId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    before = null,
    after = null,
    includeDeleted = false
  } = options;

  let query = { conversation: conversationId };
  
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  if (after) {
    query.createdAt = { $gt: new Date(after) };
  }

  return this.find(query)
    .populate('sender', 'firstName lastName avatar')
    .populate('replyTo')
    .populate('readBy.user', 'firstName lastName avatar')
    .populate('reactions.user', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Méthode statique pour rechercher des messages
messageSchema.statics.searchMessages = function(query, options = {}) {
  const {
    conversationId,
    userId,
    type,
    limit = 20,
    skip = 0
  } = options;

  let searchQuery = {
    content: { $regex: query, $options: 'i' },
    isDeleted: false
  };

  if (conversationId) {
    searchQuery.conversation = conversationId;
  }

  if (userId) {
    searchQuery.sender = userId;
  }

  if (type) {
    searchQuery.type = type;
  }

  return this.find(searchQuery)
    .populate('sender', 'firstName lastName avatar')
    .populate('conversation', 'title participants')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Méthode statique pour obtenir les messages non lus d'un utilisateur
messageSchema.statics.getUnreadMessages = function(userId) {
  return this.find({
    'readBy.user': { $ne: userId },
    sender: { $ne: userId },
    isDeleted: false
  })
  .populate('sender', 'firstName lastName avatar')
  .populate('conversation', 'title participants')
  .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Message', messageSchema);