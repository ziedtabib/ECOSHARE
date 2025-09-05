const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
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
    publicId: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  // Classification IA
  aiClassification: {
    foodType: {
      type: String,
      enum: ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'canned', 'beverages', 'snacks', 'other'],
      required: true
    },
    ingredients: [String],
    expirationDate: Date,
    isExpired: {
      type: Boolean,
      default: false
    },
    condition: {
      type: String,
      enum: ['fresh', 'good', 'fair', 'expired'],
      default: 'good'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    },
    allergens: [String],
    isEdible: {
      type: Boolean,
      default: true
    }
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
    enum: ['available', 'reserved', 'taken', 'expired', 'cancelled'],
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
  
  // Recettes générées par IA
  recipes: [{
    title: String,
    description: String,
    ingredients: [String],
    instructions: [String],
    prepTime: String,
    cookTime: String,
    servings: Number,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    },
    tags: [String],
    image: String,
    isGenerated: {
      type: Boolean,
      default: true
    }
  }],
  
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
    },
    isFoodBank: {
      type: Boolean,
      default: false
    }
  }],
  
  // Instructions de recyclage/compostage
  recyclingInstructions: {
    canCompost: Boolean,
    compostInstructions: String,
    canRecycle: Boolean,
    recycleInstructions: String,
    disposalMethod: {
      type: String,
      enum: ['compost', 'recycle', 'trash', 'donate']
    }
  },
  
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
    default: 15 // Plus de points pour la nourriture
  },
  
  // Urgence (pour les aliments périssables)
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index pour les recherches
foodSchema.index({ title: 'text', description: 'text' });
foodSchema.index({ 'aiClassification.foodType': 1 });
foodSchema.index({ status: 1 });
foodSchema.index({ 'location.coordinates': '2dsphere' });
foodSchema.index({ owner: 1, status: 1 });
foodSchema.index({ 'aiClassification.expirationDate': 1 });
foodSchema.index({ urgency: 1 });

// Middleware pour calculer l'urgence et l'état d'expiration
foodSchema.pre('save', function(next) {
  if (this.aiClassification.expirationDate) {
    const now = new Date();
    const expirationDate = new Date(this.aiClassification.expirationDate);
    const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
    
    // Mettre à jour l'état d'expiration
    if (daysUntilExpiration < 0) {
      this.aiClassification.isExpired = true;
      this.status = 'expired';
      this.urgency = 'critical';
    } else if (daysUntilExpiration <= 1) {
      this.urgency = 'critical';
    } else if (daysUntilExpiration <= 3) {
      this.urgency = 'high';
    } else if (daysUntilExpiration <= 7) {
      this.urgency = 'medium';
    } else {
      this.urgency = 'low';
    }
  }
  
  // S'assurer qu'une seule image principale
  if (this.images && this.images.length > 0) {
    const mainImages = this.images.filter(img => img.isMain);
    if (mainImages.length === 0) {
      this.images[0].isMain = true;
    } else if (mainImages.length > 1) {
      this.images.forEach((img, index) => {
        img.isMain = index === 0;
      });
    }
  }
  
  next();
});

// Méthode pour réserver la nourriture
foodSchema.methods.reserve = function(userId, deliveryMethod = 'pickup') {
  if (this.status !== 'available') {
    throw new Error('Cette nourriture n\'est pas disponible');
  }
  
  if (this.aiClassification.isExpired) {
    throw new Error('Cette nourriture est expirée');
  }
  
  this.status = 'reserved';
  this.exchange.reservedBy = userId;
  this.exchange.reservedAt = new Date();
  this.exchange.deliveryMethod = deliveryMethod;
  
  return this.save();
};

// Méthode pour finaliser l'échange
foodSchema.methods.completeExchange = function() {
  this.status = 'taken';
  this.exchange.completedAt = new Date();
  
  return this.save();
};

// Méthode pour générer des recettes
foodSchema.methods.generateRecipes = async function() {
  // Cette méthode sera implémentée avec l'intégration IA
  // Pour l'instant, on retourne des recettes basiques
  const basicRecipes = [
    {
      title: `Recette avec ${this.title}`,
      description: `Une délicieuse recette utilisant ${this.title}`,
      ingredients: this.aiClassification.ingredients || [this.title],
      instructions: [
        'Préparez tous les ingrédients',
        'Suivez les instructions de base',
        'Dégustez votre plat !'
      ],
      prepTime: '15 min',
      cookTime: '30 min',
      servings: 4,
      difficulty: 'easy',
      isGenerated: true
    }
  ];
  
  this.recipes = basicRecipes;
  return this.save();
};

module.exports = mongoose.model('Food', foodSchema);
