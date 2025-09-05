const mongoose = require('mongoose');

const rewardRedemptionSchema = new mongoose.Schema({
  // Utilisateur qui rédime
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Récompense rédimée
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  
  // Points utilisés
  pointsUsed: {
    type: Number,
    required: true,
    min: [1, 'Le nombre de points doit être positif']
  },
  
  // Statut de la rédemption
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Adresse de livraison
  deliveryAddress: {
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
  },
  
  // Notes de l'utilisateur
  notes: {
    type: String,
    maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
  },
  
  // Notes de l'administrateur
  adminNotes: {
    type: String,
    maxlength: [500, 'Les notes admin ne peuvent pas dépasser 500 caractères']
  },
  
  // Numéro de suivi
  trackingNumber: String,
  
  // Dates importantes
  dates: {
    redeemed: {
      type: Date,
      default: Date.now
    },
    confirmed: Date,
    shipped: Date,
    delivered: Date,
    cancelled: Date,
    estimatedDelivery: Date
  },
  
  // Raison d'annulation
  cancellationReason: String,
  
  // Historique des statuts
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Évaluation de la rédemption
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
    },
    ratedAt: Date
  },
  
  // Informations de livraison
  delivery: {
    method: {
      type: String,
      enum: ['standard', 'express', 'pickup'],
      default: 'standard'
    },
    carrier: String,
    trackingUrl: String,
    deliveryProof: String, // URL de la preuve de livraison
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Informations de paiement (si applicable)
  payment: {
    method: {
      type: String,
      enum: ['points', 'mixed', 'cash']
    },
    amount: Number,
    currency: {
      type: String,
      default: 'EUR'
    },
    transactionId: String,
    refunded: {
      type: Boolean,
      default: false
    },
    refundedAt: Date,
    refundAmount: Number
  },
  
  // Métadonnées
  metadata: {
    redemptionId: {
      type: String,
      unique: true,
      required: true
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Index pour les recherches
rewardRedemptionSchema.index({ user: 1, status: 1 });
rewardRedemptionSchema.index({ reward: 1, status: 1 });
// redemptionId index créé automatiquement par unique: true
rewardRedemptionSchema.index({ 'dates.redeemed': -1 });
rewardRedemptionSchema.index({ status: 1, 'dates.estimatedDelivery': 1 });

// Middleware pour générer un ID de rédemption unique
rewardRedemptionSchema.pre('save', async function(next) {
  if (!this.metadata.redemptionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.metadata.redemptionId = `RED-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Méthode pour mettre à jour le statut
rewardRedemptionSchema.methods.updateStatus = function(newStatus, changedBy, notes = '') {
  this.status = newStatus;
  
  // Mettre à jour la date correspondante
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.dates.confirmed = now;
      break;
    case 'shipped':
      this.dates.shipped = now;
      break;
    case 'delivered':
      this.dates.delivered = now;
      break;
    case 'cancelled':
      this.dates.cancelled = now;
      break;
  }
  
  // Ajouter à l'historique
  this.statusHistory.push({
    status: newStatus,
    changedBy: changedBy,
    changedAt: now,
    notes: notes
  });
  
  return this.save();
};

// Méthode pour annuler la rédemption
rewardRedemptionSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.dates.cancelled = new Date();
  
  this.statusHistory.push({
    status: 'cancelled',
    changedBy: cancelledBy,
    changedAt: new Date(),
    notes: reason
  });
  
  return this.save();
};

// Méthode pour évaluer la rédemption
rewardRedemptionSchema.methods.rate = function(score, comment) {
  if (this.status !== 'delivered') {
    throw new Error('Seules les rédactions livrées peuvent être évaluées');
  }
  
  this.rating = {
    score: score,
    comment: comment,
    ratedAt: new Date()
  };
  
  return this.save();
};

// Méthode pour vérifier si la rédemption peut être annulée
rewardRedemptionSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Méthode pour vérifier si la rédemption peut être évaluée
rewardRedemptionSchema.methods.canBeRated = function() {
  return this.status === 'delivered' && !this.rating.score;
};

// Méthode statique pour obtenir les statistiques de rédemption
rewardRedemptionSchema.statics.getRedemptionStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$pointsUsed' }
      }
    }
  ];
  
  const stats = await this.aggregate(pipeline);
  
  const result = {
    total: 0,
    byStatus: {},
    totalPointsUsed: 0
  };
  
  stats.forEach(stat => {
    result.byStatus[stat._id] = {
      count: stat.count,
      totalPoints: stat.totalPoints
    };
    result.total += stat.count;
    result.totalPointsUsed += stat.totalPoints;
  });
  
  return result;
};

// Méthode statique pour obtenir les rédactions en retard
rewardRedemptionSchema.statics.getOverdueRedemptions = async function() {
  const now = new Date();
  
  return this.find({
    status: { $in: ['confirmed', 'shipped'] },
    'dates.estimatedDelivery': { $lt: now }
  })
  .populate('user', 'firstName lastName email')
  .populate('reward', 'name type category')
  .sort({ 'dates.estimatedDelivery': 1 });
};

// Méthode statique pour obtenir les rédactions à traiter
rewardRedemptionSchema.statics.getPendingRedemptions = async function() {
  return this.find({
    status: 'pending'
  })
  .populate('user', 'firstName lastName email')
  .populate('reward', 'name type category value')
  .sort({ createdAt: 1 });
};

module.exports = mongoose.model('RewardRedemption', rewardRedemptionSchema);