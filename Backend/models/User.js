const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Informations de base
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Veuillez fournir un email valide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas inclure le mot de passe dans les requêtes par défaut
  },
  
  // Informations de profil
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
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
  },
  
  // Statut et préférences
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationCode: String,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordCode: String,
  resetPasswordExpire: Date,
  
  // Système de points
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  
  // Préférences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    radius: {
      type: Number,
      default: 10, // Rayon de recherche en km
      min: 1,
      max: 100
    },
    categories: [{
      type: String,
      enum: ['electronics', 'clothing', 'furniture', 'books', 'toys', 'food', 'other']
    }]
  },
  
  // OAuth
  googleId: String,
  facebookId: String,
  
  // Statistiques
  stats: {
    objectsShared: { type: Number, default: 0 },
    objectsReceived: { type: Number, default: 0 },
    foodsShared: { type: Number, default: 0 },
    foodsReceived: { type: Number, default: 0 },
    totalExchanges: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index pour les recherches géographiques
userSchema.index({ 'address.coordinates': '2dsphere' });

// Middleware pour hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour mettre à jour le niveau basé sur les points
userSchema.methods.updateLevel = function() {
  if (this.points >= 1000) this.level = 'Platinum';
  else if (this.points >= 500) this.level = 'Gold';
  else if (this.points >= 100) this.level = 'Silver';
  else this.level = 'Bronze';
};

// Méthode pour ajouter des points
userSchema.methods.addPoints = function(points) {
  this.points += points;
  this.updateLevel();
  return this.save();
};

// Méthode pour obtenir le nom complet
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// S'assurer que les champs virtuels sont inclus dans le JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
