const mongoose = require('mongoose');

const associationSchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: [true, 'Le nom de l\'association est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  
  // Contact
  contact: {
    email: {
      type: String,
      required: [true, 'L\'email de contact est requis'],
      lowercase: true
    },
    phone: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  
  // Adresse
  address: {
    street: {
      type: String,
      required: [true, 'L\'adresse est requise']
    },
    city: {
      type: String,
      required: [true, 'La ville est requise']
    },
    postalCode: {
      type: String,
      required: [true, 'Le code postal est requis']
    },
    country: {
      type: String,
      default: 'France'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Type d'association
  type: {
    type: String,
    enum: [
      'food_bank',      // Banque alimentaire
      'clothing',       // Vêtements
      'furniture',      // Meubles
      'books',          // Livres
      'toys',           // Jouets
      'electronics',    // Électronique
      'general',        // Généraliste
      'environmental',  // Environnementale
      'social',         // Sociale
      'other'           // Autre
    ],
    required: true
  },

  // Mission et public cible
  mission: {
    type: String,
    trim: true,
    maxlength: [500, 'La mission ne peut pas dépasser 500 caractères']
  },
  targetAudience: {
    type: String,
    trim: true,
    maxlength: [200, 'Le public cible ne peut pas dépasser 200 caractères']
  },
  
  // Catégories acceptées
  acceptedCategories: [{
    type: String,
    enum: ['electronics', 'clothing', 'furniture', 'books', 'toys', 'food', 'other']
  }],
  
  // Statut
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  
  // Horaires d'ouverture
  openingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String, // Format HH:MM
    close: String, // Format HH:MM
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Capacité et besoins
  capacity: {
    maxItemsPerDay: Number,
    currentItems: { type: Number, default: 0 },
    storageSpace: {
      type: String,
      enum: ['small', 'medium', 'large', 'unlimited']
    }
  },
  
  // Besoins spécifiques
  needs: [{
    category: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    quantity: Number,
    unit: String
  }],

  // Tags pour la recherche
  tags: [{
    type: String,
    trim: true
  }],
  
  // Images
  images: [{
    url: String,
    publicId: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  // Documents légaux
  legalDocuments: {
    registrationNumber: String,
    taxId: String,
    insuranceNumber: String,
    documents: [{
      type: String,
      url: String,
      name: String,
      uploadedAt: Date
    }]
  },
  
  // Personne de contact (utilisateur qui a créé l'association)
  contactPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Représentant légal
  legalRepresentative: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    position: String
  },
  
  // Statistiques
  stats: {
    totalDonations: { type: Number, default: 0 },
    totalItemsReceived: { type: Number, default: 0 },
    totalBeneficiaries: { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  
  // Avis et évaluations
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Partenariats
  partnerships: [{
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Association'
    },
    type: {
      type: String,
      enum: ['collaboration', 'exchange', 'support']
    },
    description: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Préférences de contact
  contactPreferences: {
    preferredMethod: {
      type: String,
      enum: ['email', 'phone', 'website'],
      default: 'email'
    },
    responseTime: {
      type: String,
      enum: ['immediate', 'same_day', 'within_week'],
      default: 'same_day'
    },
    languages: [{
      type: String,
      enum: ['french', 'english', 'spanish', 'arabic', 'other']
    }]
  }
}, {
  timestamps: true
});

// Index pour les recherches
associationSchema.index({ name: 'text', description: 'text' });
associationSchema.index({ type: 1 });
associationSchema.index({ status: 1 });
associationSchema.index({ 'address.coordinates': '2dsphere' });
associationSchema.index({ 'acceptedCategories': 1 });

// Middleware pour s'assurer qu'une seule image principale
associationSchema.pre('save', function(next) {
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

// Méthode pour mettre à jour la note moyenne
associationSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.stats.rating.average = totalRating / this.reviews.length;
    this.stats.rating.count = this.reviews.length;
  }
  return this.save();
};

// Méthode pour ajouter un avis
associationSchema.methods.addReview = function(userId, rating, comment) {
  // Vérifier si l'utilisateur a déjà laissé un avis
  const existingReview = this.reviews.find(review => 
    review.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    // Mettre à jour l'avis existant
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    // Ajouter un nouvel avis
    this.reviews.push({
      user: userId,
      rating,
      comment
    });
  }
  
  return this.updateRating();
};

// Méthode pour vérifier si l'association accepte une catégorie
associationSchema.methods.acceptsCategory = function(category) {
  return this.acceptedCategories.includes(category) || 
         this.acceptedCategories.includes('other');
};

// Méthode pour vérifier si l'association est ouverte
associationSchema.methods.isOpen = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.openingHours.find(hours => hours.day === currentDay);
  
  if (!todayHours || todayHours.isClosed) {
    return false;
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Méthode pour calculer la distance depuis un point
associationSchema.methods.calculateDistance = function(lat, lng) {
  if (!this.address.coordinates.lat || !this.address.coordinates.lng) {
    return null;
  }
  
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat - this.address.coordinates.lat) * Math.PI / 180;
  const dLng = (lng - this.address.coordinates.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.address.coordinates.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

module.exports = mongoose.model('Association', associationSchema);
