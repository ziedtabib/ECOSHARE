const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Auteur du post
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contenu du post
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  content: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true,
    maxlength: [2000, 'Le contenu ne peut pas dépasser 2000 caractères']
  },
  
  // Type de post
  type: {
    type: String,
    enum: [
      'help_request',    // Demande d'aide
      'announcement',    // Annonce
      'success_story',   // Histoire de succès
      'tip',            // Conseil
      'event',          // Événement
      'general'         // Général
    ],
    required: true
  },
  
  // Catégorie
  category: {
    type: String,
    enum: [
      'food_collection',     // Collecte de nourriture
      'clothing_drive',      // Collecte de vêtements
      'toy_donation',        // Don de jouets
      'furniture_pickup',    // Récupération de meubles
      'book_donation',       // Don de livres
      'electronics_recycling', // Recyclage électronique
      'community_event',     // Événement communautaire
      'volunteer_help',      // Aide bénévole
      'emergency_help',      // Aide d'urgence
      'other'               // Autre
    ],
    required: true
  },
  
  // Localisation
  location: {
    address: String,
    city: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    radius: {
      type: Number,
      default: 10, // Rayon en km
      min: 1,
      max: 100
    }
  },
  
  // Images et médias
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  // Détails spécifiques selon le type
  details: {
    // Pour les demandes d'aide
    helpRequest: {
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      targetQuantity: Number,
      unit: String,
      deadline: Date,
      contactMethod: {
        type: String,
        enum: ['email', 'phone', 'message'],
        default: 'message'
      },
      isCompleted: {
        type: Boolean,
        default: false
      }
    },
    
    // Pour les événements
    event: {
      startDate: Date,
      endDate: Date,
      maxParticipants: Number,
      currentParticipants: { type: Number, default: 0 },
      registrationRequired: {
        type: Boolean,
        default: false
      },
      location: String,
      organizer: String
    },
    
    // Pour les annonces
    announcement: {
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      expiresAt: Date,
      isPinned: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Statut
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  
  // Interactions
  interactions: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  
  // Commentaires
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: { type: Number, default: 0 },
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: [300, 'La réponse ne peut pas dépasser 300 caractères']
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      likes: { type: Number, default: 0 }
    }]
  }],
  
  // Participants (pour les événements et demandes d'aide)
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
    contribution: String, // Description de la contribution
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    }
  }],
  
  // Tags
  tags: [String],
  
  // Visibilité
  visibility: {
    type: String,
    enum: ['public', 'community', 'private'],
    default: 'public'
  },
  
  // Modération
  moderation: {
    isApproved: {
      type: Boolean,
      default: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    reports: [{
      reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'misleading', 'other']
      },
      description: String,
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Index pour les recherches
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ type: 1, category: 1 });
postSchema.index({ status: 1 });
postSchema.index({ 'location.coordinates': '2dsphere' });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'details.helpRequest.urgency': 1 });
postSchema.index({ 'details.event.startDate': 1 });

// Middleware pour s'assurer qu'un seul média principal
postSchema.pre('save', function(next) {
  if (this.media && this.media.length > 0) {
    const mainMedia = this.media.filter(media => media.isMain);
    if (mainMedia.length === 0) {
      this.media[0].isMain = true;
    } else if (mainMedia.length > 1) {
      this.media.forEach((media, index) => {
        media.isMain = index === 0;
      });
    }
  }
  
  // Mettre à jour le compteur de commentaires
  this.interactions.comments = this.comments.length;
  
  next();
});

// Méthode pour ajouter un commentaire
postSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    author: userId,
    content
  });
  this.interactions.comments += 1;
  return this.save();
};

// Méthode pour ajouter une réponse à un commentaire
postSchema.methods.addReply = function(commentId, userId, content) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.replies.push({
      author: userId,
      content
    });
    return this.save();
  }
  throw new Error('Commentaire non trouvé');
};

// Méthode pour participer à un post
postSchema.methods.addParticipant = function(userId, contribution = '') {
  // Vérifier si l'utilisateur participe déjà
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    throw new Error('Vous participez déjà à ce post');
  }
  
  // Vérifier la limite de participants pour les événements
  if (this.type === 'event' && this.details.event.maxParticipants) {
    if (this.participants.length >= this.details.event.maxParticipants) {
      throw new Error('Limite de participants atteinte');
    }
  }
  
  this.participants.push({
    user: userId,
    contribution
  });
  
  if (this.type === 'event') {
    this.details.event.currentParticipants += 1;
  }
  
  return this.save();
};

// Méthode pour retirer un participant
postSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => 
    p.user.toString() !== userId.toString()
  );
  
  if (this.type === 'event') {
    this.details.event.currentParticipants = Math.max(0, 
      this.details.event.currentParticipants - 1
    );
  }
  
  return this.save();
};

// Méthode pour marquer comme terminé
postSchema.methods.markCompleted = function() {
  this.status = 'completed';
  if (this.details.helpRequest) {
    this.details.helpRequest.isCompleted = true;
  }
  return this.save();
};

// Méthode pour signaler un post
postSchema.methods.report = function(userId, reason, description = '') {
  this.moderation.reports.push({
    reporter: userId,
    reason,
    description
  });
  return this.save();
};

// Méthode pour vérifier si le post est dans un rayon donné
postSchema.methods.isWithinRadius = function(lat, lng, radius) {
  if (!this.location.coordinates.lat || !this.location.coordinates.lng) {
    return false;
  }
  
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat - this.location.coordinates.lat) * Math.PI / 180;
  const dLng = (lng - this.location.coordinates.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.coordinates.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= (radius || this.location.radius);
};

module.exports = mongoose.model('Post', postSchema);
