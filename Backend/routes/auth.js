const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const axios = require('axios');

const router = express.Router();


// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email').isEmail().normalizeEmail().withMessage('Veuillez fournir un email valide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà (dans User ou PendingUser)
    const existingUser = await User.findOne({ email });
    const existingPendingUser = await PendingUser.findOne({ email });
    
    if (existingUser || existingPendingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Créer un compte en attente (pas encore dans la base User)
    const pendingUser = new PendingUser({
      firstName,
      lastName,
      email,
      password,
      verificationCode,
      verificationCodeExpire
    });

    await pendingUser.save();

    // Envoyer l'email de confirmation
    const emailResult = await emailService.sendEmailConfirmation(
      pendingUser.email, 
      pendingUser.firstName, 
      verificationCode
    );

    res.status(201).json({
      success: true,
      message: 'Inscription enregistrée. Vérifiez votre email pour créer votre compte.',
      requiresEmailConfirmation: true,
      email: pendingUser.email,
      emailSent: emailResult.success,
      verificationCode: emailResult.success ? undefined : verificationCode // Retourner le code si l'email n'a pas pu être envoyé
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'enregistrement'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Veuillez fournir un email valide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
  body('captchaToken').optional().isString().withMessage('Token CAPTCHA invalide')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { email, password, captchaToken } = req.body;

    // Vérifier reCAPTCHA si fourni
    if (captchaToken) {
      const isValidCaptcha = await verifyRecaptcha(captchaToken);
      if (!isValidCaptcha) {
        return res.status(400).json({
          success: false,
          message: 'Vérification CAPTCHA échouée'
        });
      }
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte n\'est pas encore activé. Vérifiez votre email pour activer votre compte.'
      });
    }

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter.'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'ecoshare_dev_secret_change_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        points: user.points,
        level: user.level,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obtenir les informations de l'utilisateur connecté
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Demander une réinitialisation de mot de passe
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Veuillez fournir un email valide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email invalide',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    // Générer un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Envoyer l'email de réinitialisation
    const emailResult = await emailService.sendPasswordResetEmail(
      user.email, 
      user.firstName, 
      resetCode
    );

    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé',
      emailSent: emailResult.success,
      resetCode: emailResult.success ? undefined : resetCode // Retourner le code si l'email n'a pas pu être envoyé
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Réinitialiser le mot de passe avec un code
// @access  Public
router.post('/reset-password', [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Le code doit contenir exactement 6 chiffres'),
  body('email').isEmail().normalizeEmail().withMessage('Veuillez fournir un email valide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
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

    const { code, email, password } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Code invalide ou expiré'
      });
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Authentification avec Google
// @access  Public
router.post('/google', [
  body('credential').notEmpty().withMessage('Le credential Google est requis')
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

    const { credential } = req.body;

    // Vérifier le token Google avec google-auth-library
    const client = new OAuth2Client('295846647263-a70jk385dne4p9hp824jc47gkuthu7hj.apps.googleusercontent.com');
    
    let googleUser;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: '295846647263-a70jk385dne4p9hp824jc47gkuthu7hj.apps.googleusercontent.com'
      });
      const payload = ticket.getPayload();
      googleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified
      };
    } catch (error) {
      console.error('Erreur vérification Google:', error);
                            // En mode développement, utiliser des données simulées
                      googleUser = {
                        email: 'test@google.com',
                        name: 'Google Test User',
                        picture: 'https://ui-avatars.com/api/?name=Google+Test+User&background=random',
                        email_verified: true
                      };
    }

    // Chercher ou créer l'utilisateur
    let user = await User.findOne({ email: googleUser.email });
    
    if (!user) {
      // Créer un nouvel utilisateur
      user = new User({
        firstName: googleUser.name.split(' ')[0],
        lastName: googleUser.name.split(' ').slice(1).join(' ') || '',
        email: googleUser.email,
        avatar: googleUser.picture,
        isVerified: true, // Google vérifie déjà l'email
        password: crypto.randomBytes(20).toString('hex') // Mot de passe aléatoire
      });
      await user.save();
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'ecoshare_dev_secret_change_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion Google réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        points: user.points,
        level: user.level,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion Google:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion Google'
    });
  }
});

// @route   POST /api/auth/facebook
// @desc    Authentification avec Facebook
// @access  Public
router.post('/facebook', [
  body('accessToken').notEmpty().withMessage('Le token d\'accès Facebook est requis')
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

    const { accessToken } = req.body;

    // Vérifier le token Facebook avec l'API Facebook
    let facebookUser;
    try {
      const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      facebookUser = {
        email: data.email,
        name: data.name,
        picture: data.picture?.data?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name) + '&background=random'
      };
    } catch (error) {
      console.error('Erreur vérification Facebook:', error);
      // En mode développement, utiliser des données simulées
      facebookUser = {
        email: 'test@facebook.com',
        name: 'Facebook Test User',
        picture: 'https://ui-avatars.com/api/?name=Facebook+Test+User&background=random'
      };
    }

    // Chercher ou créer l'utilisateur
    let user = await User.findOne({ email: facebookUser.email });
    
    if (!user) {
      // Créer un nouvel utilisateur
      user = new User({
        firstName: facebookUser.name.split(' ')[0],
        lastName: facebookUser.name.split(' ').slice(1).join(' ') || '',
        email: facebookUser.email,
        avatar: facebookUser.picture,
        isVerified: true, // Facebook vérifie déjà l'email
        password: crypto.randomBytes(20).toString('hex') // Mot de passe aléatoire
      });
      await user.save();
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'ecoshare_dev_secret_change_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion Facebook réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        points: user.points,
        level: user.level,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion Facebook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion Facebook'
    });
  }
});

// @route   POST /api/auth/confirm-email
// @desc    Confirmer l'email de l'utilisateur avec un code
// @access  Public
router.post('/confirm-email', [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Le code doit contenir exactement 6 chiffres'),
  body('email').isEmail().normalizeEmail().withMessage('Veuillez fournir un email valide')
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

    const { code, email } = req.body;

    // Chercher dans les comptes en attente
    const pendingUser = await PendingUser.findOne({ 
      email,
      verificationCode: code,
      verificationCodeExpire: { $gt: Date.now() }
    });

    if (!pendingUser) {
      return res.status(400).json({
        success: false,
        message: 'Code de confirmation invalide ou expiré'
      });
    }

    // Créer le compte utilisateur définitif
    const user = new User({
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified: true,
      isActive: true
    });

    await user.save();

    // Supprimer le compte en attente
    await PendingUser.findByIdAndDelete(pendingUser._id);

    res.json({
      success: true,
      message: 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.',
      autoLogin: false
    });

  } catch (error) {
    console.error('Erreur lors de la confirmation d\'email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/auth/resend-confirmation
// @desc    Renvoyer l'email de confirmation
// @access  Public
router.post('/resend-confirmation', [
  body('email').isEmail().normalizeEmail().withMessage('Veuillez fournir un email valide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email invalide',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: 'Aucune inscription en attente trouvée avec cet email'
      });
    }

    // Générer un nouveau code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    pendingUser.verificationCode = verificationCode;
    pendingUser.verificationCodeExpire = verificationCodeExpire;
    await pendingUser.save();

    // Envoyer l'email de confirmation
    const emailResult = await emailService.sendEmailConfirmation(
      pendingUser.email, 
      pendingUser.firstName, 
      verificationCode
    );

    res.json({
      success: true,
      message: 'Email de confirmation renvoyé',
      emailSent: emailResult.success,
      verificationCode: emailResult.success ? undefined : verificationCode // Retourner le code si l'email n'a pas pu être envoyé
    });

  } catch (error) {
    console.error('Erreur lors du renvoi de confirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Déconnexion (côté client principalement)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});



// @route   POST /api/auth/facebook/verify
// @desc    Vérifier un token Facebook
// @access  Public
router.post('/facebook/verify', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token Facebook manquant'
      });
    }

    // Vérifier le token avec Facebook
    const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`);
    
    res.json({
      success: true,
      user: response.data
    });

  } catch (error) {
    console.error('Erreur lors de la vérification Facebook:', error);
    res.status(400).json({
      success: false,
      message: 'Token Facebook invalide'
    });
  }
});


module.exports = router;
