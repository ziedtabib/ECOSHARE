const express = require('express');
const Reward = require('../models/Reward');
const RewardRedemption = require('../models/RewardRedemption');
const User = require('../models/User');
const { auth, checkOwnership } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/rewards
// @desc    Obtenir toutes les récompenses disponibles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      category,
      maxPoints,
      minLevel,
      search,
      featured,
      sortBy = 'priority'
    } = req.query;

    const filters = {
      type,
      category,
      maxPoints: maxPoints ? parseInt(maxPoints) : undefined,
      minLevel,
      search,
      featured: featured === 'true'
    };

    const rewards = await Reward.searchRewards(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reward.countDocuments({ 'availability.isActive': true });

    res.json({
      success: true,
      rewards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des récompenses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/rewards/:id
// @desc    Obtenir une récompense par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id)
      .populate('partner', 'name logo website description');

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Récompense non trouvée'
      });
    }

    res.json({
      success: true,
      reward
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la récompense:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/rewards/:id/redeem
// @desc    Rédimer une récompense
// @access  Private
router.post('/:id/redeem', auth, [
  body('deliveryAddress').optional().isObject().withMessage('Adresse de livraison invalide'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes trop longues')
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

    const { deliveryAddress, notes } = req.body;
    const userId = req.userId;

    // Récupérer la récompense
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Récompense non trouvée'
      });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier l'éligibilité
    const eligibility = reward.checkEligibility(user);
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.reason
      });
    }

    // Vérifier si l'utilisateur a déjà rédimé cette récompense
    const existingRedemption = await RewardRedemption.findOne({
      user: userId,
      reward: req.params.id,
      status: { $in: ['pending', 'confirmed', 'shipped', 'delivered'] }
    });

    if (existingRedemption) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà rédimé cette récompense'
      });
    }

    // Vérifier la limite par utilisateur
    const userRedemptions = await RewardRedemption.countDocuments({
      user: userId,
      reward: req.params.id
    });

    if (userRedemptions >= reward.availability.maxPerUser) {
      return res.status(400).json({
        success: false,
        message: 'Limite de rédemption atteinte pour cette récompense'
      });
    }

    // Créer la rédemption
    const redemption = new RewardRedemption({
      user: userId,
      reward: req.params.id,
      pointsUsed: reward.value.pointsRequired,
      status: 'pending',
      deliveryAddress: deliveryAddress || user.address,
      notes: notes || '',
      estimatedDelivery: calculateEstimatedDelivery(reward)
    });

    await redemption.save();

    // Déduire les points de l'utilisateur
    user.points -= reward.value.pointsRequired;
    await user.save();

    // Réserver la récompense (décrémenter le stock)
    await reward.reserve();

    // Mettre à jour les statistiques de la récompense
    await reward.updateStats();

    const populatedRedemption = await RewardRedemption.findById(redemption._id)
      .populate('user', 'firstName lastName email')
      .populate('reward', 'name description type category value images');

    res.status(201).json({
      success: true,
      message: 'Récompense rédimée avec succès',
      redemption: populatedRedemption
    });

  } catch (error) {
    console.error('Erreur lors de la rédemption:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/rewards/user/:userId/redemptions
// @desc    Obtenir les rédactions d'un utilisateur
// @access  Private
router.get('/user/:userId/redemptions', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Vérifier que l'utilisateur peut accéder à ces rédactions
    if (userId !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const redemptions = await RewardRedemption.find(query)
      .populate('reward', 'name description type category value images partner')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RewardRedemption.countDocuments(query);

    res.json({
      success: true,
      redemptions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des rédactions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/rewards/:id/redemptions
// @desc    Obtenir les rédactions d'une récompense (admin)
// @access  Private (Admin)
router.get('/:id/redemptions', auth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const { page = 1, limit = 10, status } = req.query;

    let query = { reward: req.params.id };
    if (status) {
      query.status = status;
    }

    const redemptions = await RewardRedemption.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RewardRedemption.countDocuments(query);

    res.json({
      success: true,
      redemptions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des rédactions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/rewards/redemptions/:redemptionId/status
// @desc    Mettre à jour le statut d'une rédemption (admin)
// @access  Private (Admin)
router.put('/redemptions/:redemptionId/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Statut invalide'),
  body('trackingNumber').optional().isString(),
  body('notes').optional().isString().isLength({ max: 500 })
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

    // Vérifier que l'utilisateur est admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const { status, trackingNumber, notes } = req.body;
    const redemptionId = req.params.redemptionId;

    const redemption = await RewardRedemption.findById(redemptionId);
    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Rédemption non trouvée'
      });
    }

    // Mettre à jour le statut
    redemption.status = status;
    if (trackingNumber) {
      redemption.trackingNumber = trackingNumber;
    }
    if (notes) {
      redemption.adminNotes = notes;
    }

    // Ajouter à l'historique
    redemption.statusHistory.push({
      status: status,
      changedBy: req.userId,
      changedAt: new Date(),
      notes: notes || ''
    });

    await redemption.save();

    const updatedRedemption = await RewardRedemption.findById(redemption._id)
      .populate('user', 'firstName lastName email')
      .populate('reward', 'name description type category value images');

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      redemption: updatedRedemption
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/rewards/redemptions/:redemptionId/cancel
// @desc    Annuler une rédemption
// @access  Private
router.post('/redemptions/:redemptionId/cancel', auth, [
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Raison trop longue')
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

    const { reason } = req.body;
    const redemptionId = req.params.redemptionId;

    const redemption = await RewardRedemption.findById(redemptionId)
      .populate('reward');

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Rédemption non trouvée'
      });
    }

    // Vérifier que l'utilisateur peut annuler cette rédemption
    if (redemption.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas annuler cette rédemption'
      });
    }

    // Vérifier que la rédemption peut être annulée
    if (!['pending', 'confirmed'].includes(redemption.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette rédemption ne peut pas être annulée'
      });
    }

    // Annuler la rédemption
    redemption.status = 'cancelled';
    redemption.cancellationReason = reason || 'Annulé par l\'utilisateur';
    redemption.cancelledAt = new Date();

    // Ajouter à l'historique
    redemption.statusHistory.push({
      status: 'cancelled',
      changedBy: req.userId,
      changedAt: new Date(),
      notes: reason || 'Annulé par l\'utilisateur'
    });

    await redemption.save();

    // Rembourser les points à l'utilisateur
    const user = await User.findById(req.userId);
    user.points += redemption.pointsUsed;
    await user.save();

    // Libérer la récompense (incrémenter le stock)
    await redemption.reward.release();

    res.json({
      success: true,
      message: 'Rédemption annulée avec succès',
      redemption
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/rewards/categories
// @desc    Obtenir les catégories de récompenses
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'eco_friendly', label: 'Éco-responsable', icon: '🌱' },
      { value: 'sustainable', label: 'Durable', icon: '♻️' },
      { value: 'organic', label: 'Biologique', icon: '🌿' },
      { value: 'recycled', label: 'Recyclé', icon: '🔄' },
      { value: 'local', label: 'Local', icon: '🏠' },
      { value: 'charity', label: 'Charité', icon: '❤️' }
    ];

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/rewards/types
// @desc    Obtenir les types de récompenses
// @access  Public
router.get('/types', async (req, res) => {
  try {
    const types = [
      { value: 'physical', label: 'Physique', icon: '📦' },
      { value: 'digital', label: 'Numérique', icon: '💻' },
      { value: 'discount', label: 'Réduction', icon: '💰' },
      { value: 'experience', label: 'Expérience', icon: '🎯' },
      { value: 'donation', label: 'Don', icon: '🎁' }
    ];

    res.json({
      success: true,
      types
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Fonction utilitaire pour calculer la date de livraison estimée
function calculateEstimatedDelivery(reward) {
  const now = new Date();
  let daysToAdd = 0;

  switch (reward.type) {
    case 'physical':
      daysToAdd = 7; // 7 jours pour les récompenses physiques
      break;
    case 'digital':
      daysToAdd = 1; // 1 jour pour les récompenses numériques
      break;
    case 'discount':
      daysToAdd = 1; // 1 jour pour les codes de réduction
      break;
    case 'experience':
      daysToAdd = 14; // 14 jours pour organiser l'expérience
      break;
    case 'donation':
      daysToAdd = 30; // 30 jours pour traiter le don
      break;
    default:
      daysToAdd = 7;
  }

  return new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
}

module.exports = router;