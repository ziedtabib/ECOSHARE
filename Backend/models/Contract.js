const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  // ID unique du contrat
  contractId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Référence à l'objet/aliment
  item: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemType',
    required: true
  },
  itemType: {
    type: String,
    enum: ['Object', 'Food'],
    required: true
  },
  
  // Parties du contrat
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    required: true
  },
  
  // Détails de l'échange
  exchangeDetails: {
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'delivery', 'meeting'],
      required: true
    },
    notes: String
  },
  
  // Signatures
  signatures: {
    owner: {
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: Date,
      signatureData: String, // Base64 de la signature
    ipAddress: String,
    userAgent: String
    },
    receiver: {
      signed: {
        type: Boolean,
        default: false
      },
      signedAt: Date,
      signatureData: String,
      ipAddress: String,
      userAgent: String
    }
  },
  
  // Statut du contrat
  status: {
    type: String,
    enum: ['pending', 'signed', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Métadonnées
  metadata: {
    contractVersion: {
      type: String,
      default: '1.0'
    },
    legalBasis: {
      type: String,
      default: 'Code civil français - Article 1101'
    },
    jurisdiction: {
      type: String,
      default: 'France'
    }
  },
  
  // Historique des modifications
  history: [{
    action: {
      type: String,
      enum: ['created', 'owner_signed', 'receiver_signed', 'completed', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String
  }],
  
  // Notifications
  notifications: {
    ownerNotified: {
      type: Boolean,
      default: false
    },
    receiverNotified: {
      type: Boolean,
      default: false
    },
    lastNotificationSent: Date
  }
}, {
  timestamps: true
});

// Index pour les recherches
// contractId index is automatically created by unique: true
contractSchema.index({ owner: 1, status: 1 });
contractSchema.index({ receiver: 1, status: 1 });
contractSchema.index({ item: 1, itemType: 1 });

// Méthodes du contrat
contractSchema.methods.generateContractId = function() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
  return `ECOSHARE-${timestamp}-${random}`.toUpperCase();
};

contractSchema.methods.sign = async function(userId, signatureData, ipAddress, userAgent) {
  const isOwner = this.owner.toString() === userId.toString();
  const isReceiver = this.receiver.toString() === userId.toString();
  
  if (!isOwner && !isReceiver) {
    throw new Error('Utilisateur non autorisé à signer ce contrat');
  }
  
  if (this.status !== 'pending') {
    throw new Error('Ce contrat ne peut plus être signé');
  }
  
  // Enregistrer la signature
  if (isOwner) {
    this.signatures.owner = {
      signed: true,
      signedAt: new Date(),
      signatureData,
      ipAddress,
      userAgent
    };
  } else {
    this.signatures.receiver = {
      signed: true,
      signedAt: new Date(),
      signatureData,
      ipAddress,
      userAgent
    };
  }
  
  // Ajouter à l'historique
  this.history.push({
    action: isOwner ? 'owner_signed' : 'receiver_signed',
    userId,
    details: `Signature ${isOwner ? 'du donneur' : 'du receveur'}`
  });
  
  // Vérifier si le contrat est complètement signé
  if (this.signatures.owner.signed && this.signatures.receiver.signed) {
    this.status = 'signed';
  this.history.push({
    action: 'completed',
      details: 'Contrat entièrement signé'
  });
  }
  
  return this.save();
};

contractSchema.methods.cancel = async function(userId, reason) {
  if (this.status === 'completed') {
    throw new Error('Impossible d\'annuler un contrat déjà complété');
  }
  
  this.status = 'cancelled';
  this.history.push({
    action: 'cancelled',
    userId,
    details: reason || 'Contrat annulé'
  });
  
  return this.save();
};

contractSchema.methods.getSigningStatus = function() {
  return {
    ownerSigned: this.signatures.owner.signed,
    receiverSigned: this.signatures.receiver.signed,
    fullySigned: this.signatures.owner.signed && this.signatures.receiver.signed,
    status: this.status
  };
};

contractSchema.methods.toContractView = function() {
  return {
    id: this.contractId,
    status: this.status,
    createdAt: this.createdAt,
    exchangeDate: this.exchangeDetails.date,
    exchangeLocation: this.exchangeDetails.location,
    deliveryMethod: this.exchangeDetails.deliveryMethod,
    ownerSigned: this.signatures.owner.signed,
    receiverSigned: this.signatures.receiver.signed,
    ownerSignedAt: this.signatures.owner.signedAt,
    receiverSignedAt: this.signatures.receiver.signedAt,
    fullySigned: this.signatures.owner.signed && this.signatures.receiver.signed
  };
};

// Middleware pre-save pour générer l'ID du contrat
contractSchema.pre('save', function(next) {
  if (this.isNew && !this.contractId) {
    this.contractId = this.generateContractId();
  }
  next();
});

// Middleware post-save pour les notifications
contractSchema.post('save', async function(doc) {
  // Ici on pourrait ajouter la logique de notification
  // par email, SMS, push notification, etc.
});

module.exports = mongoose.model('Contract', contractSchema);