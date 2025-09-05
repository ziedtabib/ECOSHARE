const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  
  // Type de récompense
  type: {
    type: String,
    enum: ['physical', 'digital', 'discount', 'experience', 'donation'],
    required: true
  },
  
  // Catégorie
  category: {
    type: String,
    enum: ['eco_friendly', 'sustainable', 'organic', 'recycled', 'local', 'charity'],
    required: true
  },
  
  // Valeur et coût
  value: {
    pointsRequired: {
      type: Number,
      required: true,
      min: [1, 'Le nombre de points requis doit être positif']
    },
    monetaryValue: {
      type: Number,
      required: true,
      min: [0, 'La valeur monétaire doit être positive']
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  
  // Partenaire
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
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
    },
    alt: String
  }],
  
  // Disponibilité
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Number,
      default: -1 // -1 = illimité
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    maxPerUser: {
      type: Number,
      default: 1
    }
  },
  
  // Détails spécifiques selon le type
  details: {
    // Pour les récompenses physiques
    physical: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number
      },
      shippingCost: Number,
      requiresAddress: {
        type: Boolean,
        default: true
      }
    },
    
    // Pour les récompenses digitales
    digital: {
      code: String,
      instructions: String,
      expirationDate: Date
    },
    
    // Pour les réductions
    discount: {
      percentage: Number,
      maxAmount: Number,
      minPurchase: Number,
      applicableProducts: [String],
      code: String
    },
    
    // Pour les expériences
    experience: {
      duration: String,
      location: String,
      maxParticipants: Number,
      requirements: [String]
    },
    
    // Pour les dons
    donation: {
      organization: String,
      cause: String,
      impact: String
    }
  },
  
  // Conditions d'éligibilité
  eligibility: {
    minLevel: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze'
    },
    minExchanges: {
      type: Number,
      default: 0
    },
    minPoints: {
      type: Number,
      default: 0
    },
    requiredCategories: [String],
    excludedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Statistiques
  stats: {
    totalRedeemed: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // Tags pour la recherche
  tags: [String],
  
  // Métadonnées
  metadata: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    },
    ecoScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  }
}, {
  timestamps: true
});

// Index pour les recherches
rewardSchema.index({ name: 'text', description: 'text', tags: 'text' });
rewardSchema.index({ type: 1, category: 1 });
rewardSchema.index({ 'value.pointsRequired': 1 });
rewardSchema.index({ 'availability.isActive': 1 });
rewardSchema.index({ 'metadata.isFeatured': 1 });

// Méthode pour vérifier l'éligibilité d'un utilisateur
rewardSchema.methods.checkEligibility = function(user) {
  // Vérifier le niveau minimum
  const levelHierarchy = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const userLevelIndex = levelHierarchy.indexOf(user.level);
  const requiredLevelIndex = levelHierarchy.indexOf(this.eligibility.minLevel);
  
  if (userLevelIndex < requiredLevelIndex) {
    return { eligible: false, reason: 'Niveau insuffisant' };
  }
  
  // Vérifier le nombre minimum d'échanges
  if (user.stats.totalExchanges < this.eligibility.minExchanges) {
    return { eligible: false, reason: 'Nombre d\'échanges insuffisant' };
  }
  
  // Vérifier le nombre minimum de points
  if (user.points < this.eligibility.minPoints) {
    return { eligible: false, reason: 'Points insuffisants' };
  }
  
  // Vérifier si l'utilisateur est exclu
  if (this.eligibility.excludedUsers.includes(user._id)) {
    return { eligible: false, reason: 'Utilisateur exclu' };
  }
  
  // Vérifier la disponibilité
  if (!this.availability.isActive) {
    return { eligible: false, reason: 'Récompense non disponible' };
  }
  
  if (this.availability.stock === 0) {
    return { eligible: false, reason: 'Stock épuisé' };
  }
  
  const now = new Date();
  if (this.availability.startDate > now) {
    return { eligible: false, reason: 'Récompense pas encore disponible' };
  }
  
  if (this.availability.endDate && this.availability.endDate < now) {
    return { eligible: false, reason: 'Récompense expirée' };
  }
  
  return { eligible: true };
};

// Méthode pour réserver une récompense
rewardSchema.methods.reserve = function() {
  if (this.availability.stock > 0) {
    this.availability.stock -= 1;
    return this.save();
  }
  throw new Error('Stock insuffisant');
};

// Méthode pour libérer une réservation
rewardSchema.methods.release = function() {
  if (this.availability.stock >= 0) {
    this.availability.stock += 1;
    return this.save();
  }
};

// Méthode pour mettre à jour les statistiques
rewardSchema.methods.updateStats = function(rating = null) {
  this.stats.totalRedeemed += 1;
  this.stats.totalValue += this.value.monetaryValue;
  
  if (rating) {
    const totalRatings = this.stats.totalRatings;
    const currentAverage = this.stats.averageRating;
    this.stats.averageRating = ((currentAverage * totalRatings) + rating) / (totalRatings + 1);
    this.stats.totalRatings += 1;
  }
  
  return this.save();
};

// Méthode statique pour rechercher des récompenses
rewardSchema.statics.searchRewards = function(filters = {}) {
  let query = { 'availability.isActive': true };
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.maxPoints) {
    query['value.pointsRequired'] = { $lte: filters.maxPoints };
  }
  
  if (filters.minLevel) {
    const levelHierarchy = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const minLevelIndex = levelHierarchy.indexOf(filters.minLevel);
    const eligibleLevels = levelHierarchy.slice(minLevelIndex);
    query['eligibility.minLevel'] = { $in: eligibleLevels };
  }
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  if (filters.featured) {
    query['metadata.isFeatured'] = true;
  }
  
  let sort = {};
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'points_asc':
        sort['value.pointsRequired'] = 1;
        break;
      case 'points_desc':
        sort['value.pointsRequired'] = -1;
        break;
      case 'value_asc':
        sort['value.monetaryValue'] = 1;
        break;
      case 'value_desc':
        sort['value.monetaryValue'] = -1;
        break;
      case 'rating':
        sort['stats.averageRating'] = -1;
        break;
      case 'popular':
        sort['stats.totalRedeemed'] = -1;
        break;
      default:
        sort['metadata.priority'] = -1;
        sort.createdAt = -1;
    }
  } else {
    sort['metadata.priority'] = -1;
    sort.createdAt = -1;
  }
  
  return this.find(query)
    .populate('partner', 'name logo website')
    .sort(sort);
};

module.exports = mongoose.model('Reward', rewardSchema);
