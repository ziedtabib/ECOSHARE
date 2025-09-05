const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
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
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  
  // Type de partenaire
  type: {
    type: String,
    enum: ['brand', 'retailer', 'service', 'ngo', 'local_business', 'eco_company'],
    required: true
  },
  
  // Secteur d'activité
  sector: {
    type: String,
    enum: ['fashion', 'food', 'technology', 'beauty', 'home', 'transport', 'energy', 'education', 'health', 'other'],
    required: true
  },
  
  // Informations de contact
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: {
        type: String,
        default: 'France'
      },
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  
  // Logo et images
  logo: {
    url: String,
    publicId: String
  },
  
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  
  // Certifications et labels
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    expiryDate: Date,
    logo: String
  }],
  
  // Valeurs et engagement écologique
  ecoCommitment: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    initiatives: [String],
    carbonFootprint: {
      offset: Boolean,
      reduction: Number // pourcentage de réduction
    },
    wasteReduction: {
      percentage: Number,
      initiatives: [String]
    },
    renewableEnergy: {
      percentage: Number,
      sources: [String]
    }
  },
  
  // Statut du partenariat
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated'],
    default: 'pending'
  },
  
  // Conditions du partenariat
  partnershipTerms: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    commission: {
      type: Number,
      default: 0 // pourcentage de commission
    },
    minOrderValue: {
      type: Number,
      default: 0
    },
    maxRewardsPerMonth: {
      type: Number,
      default: 100
    },
    paymentTerms: {
      type: String,
      enum: ['monthly', 'quarterly', 'per_reward'],
      default: 'monthly'
    }
  },
  
  // Statistiques
  stats: {
    totalRewards: {
      type: Number,
      default: 0
    },
    totalRedemptions: {
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
  
  // Réseaux sociaux
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },
  
  // Métadonnées
  metadata: {
    isVerified: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    },
    tags: [String]
  }
}, {
  timestamps: true
});

// Index pour les recherches
partnerSchema.index({ name: 'text', description: 'text', 'metadata.tags': 'text' });
partnerSchema.index({ type: 1, sector: 1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ 'metadata.isVerified': 1 });
partnerSchema.index({ 'metadata.isFeatured': 1 });

// Méthode pour calculer le score écologique
partnerSchema.methods.calculateEcoScore = function() {
  let score = 0;
  
  // Score de base selon les certifications
  score += this.certifications.length * 10;
  
  // Score selon l'engagement carbone
  if (this.ecoCommitment.carbonFootprint.offset) {
    score += 20;
  }
  score += this.ecoCommitment.carbonFootprint.reduction || 0;
  
  // Score selon la réduction des déchets
  score += (this.ecoCommitment.wasteReduction.percentage || 0) * 0.5;
  
  // Score selon l'énergie renouvelable
  score += (this.ecoCommitment.renewableEnergy.percentage || 0) * 0.3;
  
  // Score selon les initiatives
  score += this.ecoCommitment.initiatives.length * 5;
  
  // Limiter à 100
  this.ecoCommitment.score = Math.min(100, Math.max(0, score));
  
  return this.ecoCommitment.score;
};

// Méthode pour mettre à jour les statistiques
partnerSchema.methods.updateStats = function(rewardValue, rating = null) {
  this.stats.totalRedemptions += 1;
  this.stats.totalValue += rewardValue;
  
  if (rating) {
    const totalRatings = this.stats.totalRatings;
    const currentAverage = this.stats.averageRating;
    this.stats.averageRating = ((currentAverage * totalRatings) + rating) / (totalRatings + 1);
    this.stats.totalRatings += 1;
  }
  
  return this.save();
};

// Méthode statique pour rechercher des partenaires
partnerSchema.statics.searchPartners = function(filters = {}) {
  let query = { status: 'active' };
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.sector) {
    query.sector = filters.sector;
  }
  
  if (filters.minEcoScore) {
    query['ecoCommitment.score'] = { $gte: filters.minEcoScore };
  }
  
  if (filters.verified) {
    query['metadata.isVerified'] = true;
  }
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query['metadata.tags'] = { $in: filters.tags };
  }
  
  let sort = {};
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'eco_score':
        sort['ecoCommitment.score'] = -1;
        break;
      case 'rating':
        sort['stats.averageRating'] = -1;
        break;
      case 'popular':
        sort['stats.totalRedemptions'] = -1;
        break;
      case 'name':
        sort.name = 1;
        break;
      default:
        sort['metadata.priority'] = -1;
        sort.createdAt = -1;
    }
  } else {
    sort['metadata.priority'] = -1;
    sort.createdAt = -1;
  }
  
  return this.find(query).sort(sort);
};

module.exports = mongoose.model('Partner', partnerSchema);
