const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  
  // Propriétaire
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // Pour Cloudinary
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  // Classification IA
  aiClassification: {
    category: {
      type: String,
      enum: ['electronics', 'clothing', 'furniture', 'books', 'toys', 'sports', 'beauty', 'home', 'other'],
      required: true
    },
    subcategory: String,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    tags: [String],
    estimatedValue: Number,
    isRecyclable: Boolean,
    recyclingInstructions: String
  },
  
  // Localisation
  location: {
    address: String,
    city: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Statut
  status: {
    type: String,
    enum: ['available', 'reserved', 'exchanged', 'cancelled'],
    default: 'available'
  },
  
  // Détails de l'échange
  exchange: {
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reservedAt: Date,
    exchangeDate: Date,
    exchangeLocation: String,
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'delivery', 'meeting'],
      default: 'pickup'
    },
    completedAt: Date,
    contract: {
      signed: Boolean,
      signedAt: Date,
      contractId: String
    }
  },
  
  // DIY et recommandations
  diy: {
    generated: Boolean,
    instructions: [{
      title: String,
      description: String,
      materials: [String],
      steps: [String],
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
      },
      estimatedTime: String
    }]
  },
  
  // Recommandations d'associations
  recommendedAssociations: [{
    association: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Association'
    },
    reason: String,
    priority: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Interactions
  interactions: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    wishlistAdds: { type: Number, default: 0 }
  },
  
  // Wishlist
  inWishlist: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Points de récompense
  pointsReward: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

// Index pour les recherches
objectSchema.index({ title: 'text', description: 'text' });
objectSchema.index({ 'aiClassification.category': 1 });
objectSchema.index({ status: 1 });
objectSchema.index({ 'location.coordinates': '2dsphere' });
objectSchema.index({ owner: 1, status: 1 });

// Middleware pour s'assurer qu'une seule image principale
objectSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const mainImages = this.images.filter(img => img.isMain);
    if (mainImages.length === 0) {
      this.images[0].isMain = true;
    } else if (mainImages.length > 1) {
      // Garder seulement la première comme principale
      this.images.forEach((img, index) => {
        img.isMain = index === 0;
      });
    }
  }
  next();
});

// Méthode pour réserver l'objet
objectSchema.methods.reserve = function(userId, deliveryMethod = 'pickup') {
  if (this.status !== 'available') {
    throw new Error('Cet objet n\'est pas disponible');
  }
  
  this.status = 'reserved';
  this.exchange.reservedBy = userId;
  this.exchange.reservedAt = new Date();
  this.exchange.deliveryMethod = deliveryMethod;
  
  return this.save();
};

// Méthode pour annuler la réservation
objectSchema.methods.cancelReservation = function() {
  this.status = 'available';
  this.exchange.reservedBy = undefined;
  this.exchange.reservedAt = undefined;
  this.exchange.deliveryMethod = undefined;
  
  return this.save();
};

// Méthode pour finaliser l'échange
objectSchema.methods.completeExchange = function() {
  this.status = 'exchanged';
  this.exchange.completedAt = new Date();
  
  return this.save();
};

// Méthode pour ajouter à la wishlist
objectSchema.methods.addToWishlist = function(userId) {
  const existing = this.inWishlist.find(item => item.user.toString() === userId.toString());
  if (!existing) {
    this.inWishlist.push({ user: userId });
    this.interactions.wishlistAdds += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Méthode pour retirer de la wishlist
objectSchema.methods.removeFromWishlist = function(userId) {
  this.inWishlist = this.inWishlist.filter(item => item.user.toString() !== userId.toString());
  this.interactions.wishlistAdds = Math.max(0, this.interactions.wishlistAdds - 1);
  return this.save();
};

module.exports = mongoose.model('Object', objectSchema);
