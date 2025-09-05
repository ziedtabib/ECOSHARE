const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configuration multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image (JPEG, PNG, GIF, WebP) sont autorisés'));
    }
  }
});

// ==================== ROUTES CRUD PROFIL ====================

// @route   GET /api/profile
// @desc    Obtenir le profil complet de l'utilisateur connecté
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
      });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        preferences: user.preferences,
        points: user.points,
        level: user.level,
        isVerified: user.isVerified,
        isActive: user.isActive,
        stats: user.stats,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil'
    });
  }
});

// @route   PUT /api/profile
// @desc    Mettre à jour le profil de l'utilisateur connecté
// @access  Private
router.put('/', auth, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('phone').optional().custom((value) => {
    if (!value) return true; // Optionnel
    // Validation très permissive pour le téléphone
    if (typeof value !== 'string') {
      throw new Error('Le téléphone doit être une chaîne de caractères');
    }
    if (value.length < 5 || value.length > 20) {
      throw new Error('Le téléphone doit contenir entre 5 et 20 caractères');
    }
    return true;
  }),
  body('address.street').optional().trim().isLength({ max: 200 }).withMessage('La rue ne peut pas dépasser 200 caractères'),
  body('address.city').optional().trim().isLength({ max: 100 }).withMessage('La ville ne peut pas dépasser 100 caractères'),
  body('address.postalCode').optional().trim().isLength({ max: 10 }).withMessage('Le code postal ne peut pas dépasser 10 caractères'),
  body('address.country').optional().trim().isLength({ max: 100 }).withMessage('Le pays ne peut pas dépasser 100 caractères'),
  body('preferences.radius').optional().isInt({ min: 1, max: 100 }).withMessage('Le rayon doit être entre 1 et 100 km'),
  body('preferences.categories').optional().isArray().withMessage('Les catégories doivent être un tableau'),
  body('preferences.notifications.email').optional().isBoolean().withMessage('La notification email doit être un booléen'),
  body('preferences.notifications.push').optional().isBoolean().withMessage('La notification push doit être un booléen'),
  body('preferences.notifications.sms').optional().isBoolean().withMessage('La notification SMS doit être un booléen')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 'preferences'
    ];
    
    // Vérifier qu'il n'y a pas de champs non autorisés
    const unauthorizedFields = Object.keys(req.body).filter(key => !allowedUpdates.includes(key));
    if (unauthorizedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Champs non autorisés détectés',
        errors: unauthorizedFields.map(field => ({
          field: field,
          message: `Le champ '${field}' n'est pas autorisé pour la mise à jour du profil`
        }))
      });
    }
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Mettre à jour le profil
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }


    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        preferences: user.preferences,
        points: user.points,
        level: user.level,
        isVerified: user.isVerified,
        isActive: user.isActive,
        stats: user.stats,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil'
    });
  }
});

// @route   POST /api/profile/avatar
// @desc    Uploader un avatar pour l'utilisateur connecté
// @access  Private
router.post('/avatar', auth, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Erreur upload:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Erreur lors de l\'upload du fichier'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer l'ancien avatar s'il existe
    if (user.avatar && user.avatar.includes('/uploads/avatars/')) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Mettre à jour l'avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar mis à jour avec succès',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload de l\'avatar'
    });
  }
});

// @route   DELETE /api/profile/avatar
// @desc    Supprimer l'avatar de l'utilisateur connecté
// @access  Private
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer le fichier avatar s'il existe
    if (user.avatar && user.avatar.includes('/uploads/avatars/')) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Supprimer l'avatar de la base de données
    user.avatar = null;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'avatar'
    });
  }
});

// @route   PUT /api/profile/password
// @desc    Changer le mot de passe de l'utilisateur connecté
// @access  Private
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('La confirmation du mot de passe ne correspond pas');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de mot de passe'
    });
  }
});

// @route   GET /api/profile/stats
// @desc    Obtenir les statistiques de l'utilisateur connecté
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('stats points level createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Calculer des statistiques supplémentaires
    const daysSinceRegistration = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
    const averageExchangesPerMonth = user.stats.totalExchanges / Math.max(daysSinceRegistration / 30, 1);

    res.json({
      success: true,
      stats: {
        ...user.stats.toObject(),
        points: user.points,
        level: user.level,
        daysSinceRegistration,
        averageExchangesPerMonth: Math.round(averageExchangesPerMonth * 100) / 100,
        levelProgress: {
          current: user.points,
          next: user.level === 'Bronze' ? 100 : 
                user.level === 'Silver' ? 300 : 
                user.level === 'Gold' ? 600 : 1000,
          percentage: user.level === 'Bronze' ? (user.points / 100) * 100 :
                     user.level === 'Silver' ? ((user.points - 100) / 200) * 100 :
                     user.level === 'Gold' ? ((user.points - 300) / 300) * 100 :
                     user.level === 'Platinum' ? Math.min(((user.points - 600) / 400) * 100, 100) : 100
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

// @route   PUT /api/profile/preferences
// @desc    Mettre à jour les préférences de l'utilisateur connecté
// @access  Private
router.put('/preferences', auth, [
  body('radius').optional().isInt({ min: 1, max: 100 }).withMessage('Le rayon doit être entre 1 et 100 km'),
  body('categories').optional().isArray().withMessage('Les catégories doivent être un tableau'),
  body('notifications.email').optional().isBoolean().withMessage('La notification email doit être un booléen'),
  body('notifications.push').optional().isBoolean().withMessage('La notification push doit être un booléen'),
  body('notifications.sms').optional().isBoolean().withMessage('La notification SMS doit être un booléen')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Mettre à jour les préférences
    if (req.body.radius !== undefined) user.preferences.radius = req.body.radius;
    if (req.body.categories !== undefined) user.preferences.categories = req.body.categories;
    if (req.body.notifications) {
      if (req.body.notifications.email !== undefined) user.preferences.notifications.email = req.body.notifications.email;
      if (req.body.notifications.push !== undefined) user.preferences.notifications.push = req.body.notifications.push;
      if (req.body.notifications.sms !== undefined) user.preferences.notifications.sms = req.body.notifications.sms;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour des préférences'
    });
  }
});

// @route   GET /api/profile/public/:id
// @desc    Obtenir le profil public d'un utilisateur
// @access  Public
router.get('/public/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'firstName lastName avatar points level stats createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        stats: {
          objectsShared: user.stats.objectsShared,
          objectsReceived: user.stats.objectsReceived,
          foodsShared: user.stats.foodsShared,
          foodsReceived: user.stats.foodsReceived,
          totalExchanges: user.stats.totalExchanges
        },
        memberSince: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil public:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil public'
    });
  }
});

// @route   DELETE /api/profile
// @desc    Supprimer le compte de l'utilisateur connecté
// @access  Private
router.delete('/', auth, [
  body('password').notEmpty().withMessage('Le mot de passe est requis pour supprimer le compte'),
  body('confirmDelete').equals('SUPPRIMER').withMessage('Vous devez confirmer la suppression en tapant "SUPPRIMER"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { password } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }

    // Supprimer l'avatar s'il existe
    if (user.avatar && user.avatar.includes('/uploads/avatars/')) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.userId);

    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du compte'
    });
  }
});

// @route   POST /api/profile/resend-verification
// @desc    Renvoyer l'email de vérification
// @access  Private
router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà vérifié'
      });
    }

    // Générer un nouveau code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await user.save();

    // TODO: Envoyer l'email de vérification
    console.log(`Code de vérification pour ${user.email}: ${verificationCode}`);

    res.json({
      success: true,
      message: 'Email de vérification renvoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du renvoi de vérification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du renvoi de vérification'
    });
  }
});

// @route   POST /api/profile/verify-email
// @desc    Vérifier l'email avec le code
// @access  Private
router.post('/verify-email', auth, [
  body('code').notEmpty().withMessage('Le code de vérification est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { code } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà vérifié'
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Code de vérification incorrect'
      });
    }

    if (user.verificationCodeExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Code de vérification expiré'
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email vérifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification'
    });
  }
});

// @route   GET /api/profile/sessions
// @desc    Obtenir les sessions actives de l'utilisateur
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    // Pour l'instant, on simule des sessions
    // Dans un vrai système, vous stockeriez les sessions en base
    const sessions = [
      {
        id: 'current',
        device: 'Chrome sur Windows',
        location: 'Tunis, Tunisie',
        lastActive: new Date(),
        current: true
      },
      {
        id: 'mobile',
        device: 'Safari sur iPhone',
        location: 'Tunis, Tunisie',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        current: false
      }
    ];

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des sessions'
    });
  }
});

// @route   DELETE /api/profile/sessions/:sessionId
// @desc    Terminer une session spécifique
// @access  Private
router.delete('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Dans un vrai système, vous supprimeriez la session de la base
    if (sessionId === 'current') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de terminer la session actuelle'
      });
    }

    res.json({
      success: true,
      message: 'Session terminée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de session'
    });
  }
});

// @route   GET /api/profile/activity
// @desc    Obtenir l'historique des activités de l'utilisateur
// @access  Private
router.get('/activity', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Simulation d'activités - dans un vrai système, vous auriez une table d'activités
    const activities = [
      {
        id: '1',
        type: 'profile_update',
        description: 'Profil mis à jour',
        timestamp: new Date(),
        details: { field: 'firstName' }
      },
      {
        id: '2',
        type: 'object_created',
        description: 'Objet partagé',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        details: { objectName: 'Livre de cuisine' }
      },
      {
        id: '3',
        type: 'exchange_completed',
        description: 'Échange finalisé',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        details: { points: 10 }
      }
    ];

    res.json({
      success: true,
      activities,
      pagination: {
        current: parseInt(page),
        pages: 1,
        total: activities.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des activités'
    });
  }
});

// @route   GET /api/profile/export
// @desc    Exporter les données personnelles (RGPD)
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const exportData = {
      personalInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
        lastLogin: user.updatedAt
      },
      preferences: user.preferences,
      stats: user.stats,
      points: user.points,
      level: user.level,
      exportDate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: exportData,
      message: 'Données exportées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'export des données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'export des données'
    });
  }
});

// @route   GET /api/profile/notifications
// @desc    Obtenir les notifications de l'utilisateur
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    // Simulation de notifications - dans un vrai système, vous auriez une table de notifications
    const notifications = [
      {
        id: '1',
        type: 'exchange_request',
        title: 'Nouvelle demande d\'échange',
        message: 'Jean Dupont souhaite échanger votre livre',
        read: false,
        timestamp: new Date(),
        actionUrl: '/exchanges/123'
      },
      {
        id: '2',
        type: 'points_earned',
        title: 'Points gagnés !',
        message: 'Vous avez gagné 10 points pour votre partage',
        read: true,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        actionUrl: '/profile/stats'
      }
    ];

    const filteredNotifications = unreadOnly === 'true' 
      ? notifications.filter(n => !n.read)
      : notifications;

    res.json({
      success: true,
      notifications: filteredNotifications,
      unreadCount: notifications.filter(n => !n.read).length,
      pagination: {
        current: parseInt(page),
        pages: 1,
        total: filteredNotifications.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notifications'
    });
  }
});

// @route   PUT /api/profile/notifications/:id/read
// @desc    Marquer une notification comme lue
// @access  Private
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Dans un vrai système, vous mettriez à jour la notification en base
    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de notification'
    });
  }
});

// @route   GET /api/profile/analytics
// @desc    Obtenir les analytics avancées du profil
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Calculs d'analytics
    const daysSinceRegistration = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
    const averageExchangesPerMonth = user.stats.totalExchanges / Math.max(daysSinceRegistration / 30, 1);
    const pointsPerDay = user.points / Math.max(daysSinceRegistration, 1);

    const analytics = {
      overview: {
        totalExchanges: user.stats.totalExchanges,
        pointsEarned: user.points,
        daysActive: daysSinceRegistration,
        currentLevel: user.level
      },
      trends: {
        averageExchangesPerMonth: Math.round(averageExchangesPerMonth * 100) / 100,
        pointsPerDay: Math.round(pointsPerDay * 100) / 100,
        levelProgress: {
          current: user.points,
          next: user.level === 'Bronze' ? 100 : 
                user.level === 'Silver' ? 300 : 
                user.level === 'Gold' ? 600 : 1000,
          percentage: user.level === 'Bronze' ? (user.points / 100) * 100 :
                     user.level === 'Silver' ? ((user.points - 100) / 200) * 100 :
                     user.level === 'Gold' ? ((user.points - 300) / 300) * 100 :
                     user.level === 'Platinum' ? Math.min(((user.points - 600) / 400) * 100, 100) : 100
        }
      },
      breakdown: {
        objectsShared: user.stats.objectsShared,
        objectsReceived: user.stats.objectsReceived,
        foodsShared: user.stats.foodsShared,
        foodsReceived: user.stats.foodsReceived
      }
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des analytics'
    });
  }
});

module.exports = router;
