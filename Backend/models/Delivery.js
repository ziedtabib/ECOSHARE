const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  // Type de livraison
  type: {
    type: String,
    enum: ['object_exchange', 'food_exchange', 'reward_delivery', 'association_pickup'],
    required: true
  },
  
  // Référence à l'échange ou récompense
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel',
    required: true
  },
  
  // Modèle de référence
  referenceModel: {
    type: String,
    enum: ['Object', 'Food', 'RewardRedemption', 'Contract'],
    required: true
  },
  
  // Livreur assigné
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Adresses
  pickupAddress: {
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
    },
    contact: {
      name: String,
      phone: String,
      email: String
    },
    instructions: String
  },
  
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
    },
    contact: {
      name: String,
      phone: String,
      email: String
    },
    instructions: String
  },
  
  // Statut de la livraison
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Dates importantes
  dates: {
    requested: {
      type: Date,
      default: Date.now
    },
    assigned: Date,
    scheduled: Date,
    pickedUp: Date,
    delivered: Date,
    estimatedDelivery: Date
  },
  
  // Détails de la livraison
  details: {
    weight: Number, // en kg
    dimensions: {
      length: Number, // en cm
      width: Number,
      height: Number
    },
    fragile: {
      type: Boolean,
      default: false
    },
    requiresSignature: {
      type: Boolean,
      default: true
    },
    specialInstructions: String,
    estimatedDuration: Number, // en minutes
    distance: Number // en km
  },
  
  // Suivi de la livraison
  tracking: {
    currentLocation: {
      coordinates: {
        lat: Number,
        lng: Number
      },
      address: String,
      timestamp: Date
    },
    route: [{
      coordinates: {
        lat: Number,
        lng: Number
      },
      timestamp: Date,
      status: String
    }],
    estimatedArrival: Date,
    actualArrival: Date
  },
  
  // Preuve de livraison
  proof: {
    signature: String, // Base64 encoded signature
    photo: String, // URL de la photo
    notes: String,
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receivedBy: {
      name: String,
      relationship: String, // 'recipient', 'family', 'neighbor', etc.
      idVerified: Boolean
    }
  },
  
  // Frais de livraison
  fees: {
    baseFee: {
      type: Number,
      default: 0
    },
    distanceFee: Number,
    weightFee: Number,
    specialHandlingFee: Number,
    total: Number,
    paidBy: {
      type: String,
      enum: ['sender', 'receiver', 'platform'],
      default: 'platform'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    }
  },
  
  // Évaluation de la livraison
  rating: {
    service: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    },
    deliveryPerson: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratedAt: Date
  },
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'delayed', 'failed']
    },
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['email', 'push', 'sms']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // Historique des statuts
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    notes: String
  }],
  
  // Problèmes et incidents
  incidents: [{
    type: {
      type: String,
      enum: ['delay', 'damage', 'lost', 'refused', 'wrong_address', 'other']
    },
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolution: String,
    resolvedAt: Date
  }],
  
  // Métadonnées
  metadata: {
    deliveryId: {
      type: String,
      unique: true,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    }
  }
}, {
  timestamps: true
});

// Index pour les recherches
deliverySchema.index({ deliveryPerson: 1, status: 1 });
deliverySchema.index({ status: 1, 'dates.scheduled': 1 });
// deliveryId index créé automatiquement par unique: true
deliverySchema.index({ 'pickupAddress.coordinates': '2dsphere' });
deliverySchema.index({ 'deliveryAddress.coordinates': '2dsphere' });
deliverySchema.index({ 'dates.estimatedDelivery': 1 });

// Middleware pour générer un ID de livraison unique
deliverySchema.pre('save', async function(next) {
  if (!this.metadata.deliveryId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.metadata.deliveryId = `DEL-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Méthode pour mettre à jour le statut
deliverySchema.methods.updateStatus = function(newStatus, changedBy, reason = '', notes = '') {
  this.status = newStatus;
  
  // Mettre à jour la date correspondante
  const now = new Date();
  switch (newStatus) {
    case 'assigned':
      this.dates.assigned = now;
      break;
    case 'picked_up':
      this.dates.pickedUp = now;
      break;
    case 'delivered':
      this.dates.delivered = now;
      break;
  }
  
  // Ajouter à l'historique
  this.statusHistory.push({
    status: newStatus,
    changedBy: changedBy,
    changedAt: now,
    reason: reason,
    notes: notes
  });
  
  return this.save();
};

// Méthode pour mettre à jour la localisation
deliverySchema.methods.updateLocation = function(lat, lng, address) {
  this.tracking.currentLocation = {
    coordinates: { lat, lng },
    address: address,
    timestamp: new Date()
  };
  
  this.tracking.route.push({
    coordinates: { lat, lng },
    timestamp: new Date(),
    status: this.status
  });
  
  return this.save();
};

// Méthode pour ajouter un incident
deliverySchema.methods.addIncident = function(type, description, reportedBy) {
  this.incidents.push({
    type: type,
    description: description,
    reportedBy: reportedBy
  });
  
  return this.save();
};

// Méthode pour calculer les frais
deliverySchema.methods.calculateFees = function() {
  let total = this.fees.baseFee || 0;
  
  // Frais de distance (1€ par km)
  if (this.details.distance) {
    this.fees.distanceFee = this.details.distance * 1;
    total += this.fees.distanceFee;
  }
  
  // Frais de poids (0.5€ par kg)
  if (this.details.weight) {
    this.fees.weightFee = this.details.weight * 0.5;
    total += this.fees.weightFee;
  }
  
  // Frais de manipulation spéciale
  if (this.details.fragile) {
    this.fees.specialHandlingFee = 5;
    total += this.fees.specialHandlingFee;
  }
  
  this.fees.total = total;
  return this.save();
};

// Méthode pour évaluer la livraison
deliverySchema.methods.rate = function(serviceScore, serviceComment, deliveryPersonScore, deliveryPersonComment, ratedBy) {
  this.rating = {
    service: {
      score: serviceScore,
      comment: serviceComment
    },
    deliveryPerson: {
      score: deliveryPersonScore,
      comment: deliveryPersonComment
    },
    ratedBy: ratedBy,
    ratedAt: new Date()
  };
  
  return this.save();
};

// Méthode statique pour trouver les livraisons à proximité
deliverySchema.statics.findNearbyDeliveries = function(lat, lng, radius = 10) {
  return this.find({
    status: { $in: ['pending', 'assigned'] },
    'pickupAddress.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radius * 1000 // Convertir en mètres
      }
    }
  });
};

// Méthode statique pour obtenir les statistiques de livraison
deliverySchema.statics.getDeliveryStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalFees: { $sum: '$fees.total' }
      }
    }
  ];
  
  const stats = await this.aggregate(pipeline);
  
  const result = {
    total: 0,
    byStatus: {},
    totalFees: 0
  };
  
  stats.forEach(stat => {
    result.byStatus[stat._id] = {
      count: stat.count,
      totalFees: stat.totalFees
    };
    result.total += stat.count;
    result.totalFees += stat.totalFees;
  });
  
  return result;
};

// Méthode statique pour obtenir les livraisons en retard
deliverySchema.statics.getOverdueDeliveries = async function() {
  const now = new Date();
  
  return this.find({
    status: { $in: ['assigned', 'picked_up', 'in_transit'] },
    'dates.estimatedDelivery': { $lt: now }
  })
  .populate('deliveryPerson', 'firstName lastName phone')
  .populate('reference')
  .sort({ 'dates.estimatedDelivery': 1 });
};

module.exports = mongoose.model('Delivery', deliverySchema);