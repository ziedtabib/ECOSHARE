const express = require('express');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const Object = require('../models/Object');
const Food = require('../models/Food');
const RewardRedemption = require('../models/RewardRedemption');
const { auth, checkOwnership } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/deliveries/create
// @desc    Créer une nouvelle livraison
// @access  Private
router.post('/create', auth, [
  body('type').isIn(['object_exchange', 'food_exchange', 'reward_delivery', 'association_pickup']).withMessage('Type de livraison invalide'),
  body('referenceId').isMongoId().withMessage('ID de référence invalide'),
  body('referenceModel').isIn(['Object', 'Food', 'RewardRedemption', 'Contract']).withMessage('Modèle de référence invalide'),
  body('pickupAddress').isObject().withMessage('Adresse de collecte requise'),
  body('deliveryAddress').isObject().withMessage('Adresse de livraison requise'),
  body('scheduledDate').optional().isISO8601().withMessage('Date de planification invalide')
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

    const {
      type,
      referenceId,
      referenceModel,
      pickupAddress,
      deliveryAddress,
      scheduledDate,
      details,
      priority = 'normal'
    } = req.body;

    // Vérifier que la référence existe
    let reference;
    switch (referenceModel) {
      case 'Object':
        reference = await Object.findById(referenceId);
        break;
      case 'Food':
        reference = await Food.findById(referenceId);
        break;
      case 'RewardRedemption':
        reference = await RewardRedemption.findById(referenceId);
        break;
      case 'Contract':
        const Contract = require('../models/Contract');
        reference = await Contract.findById(referenceId);
        break;
    }

    if (!reference) {
      return res.status(404).json({
        success: false,
        message: 'Référence non trouvée'
      });
    }

    // Créer la livraison
    const delivery = new Delivery({
      type,
      reference: referenceId,
      referenceModel,
      pickupAddress,
      deliveryAddress,
      details: details || {},
      metadata: {
        priority,
        source: 'web'
      },
      dates: {
        scheduled: scheduledDate ? new Date(scheduledDate) : null
      }
    });

    // Calculer les frais
    await delivery.calculateFees();

    await delivery.save();

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('reference')
      .populate('deliveryPerson', 'firstName lastName phone email');

    res.status(201).json({
      success: true,
      message: 'Livraison créée avec succès',
      delivery: populatedDelivery
    });

  } catch (error) {
    console.error('Erreur lors de la création de la livraison:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/deliveries
// @desc    Obtenir les livraisons
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      deliveryPerson,
      priority,
      lat,
      lng,
      radius = 10
    } = req.query;

    let query = {};

    // Filtres
    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (deliveryPerson) {
      query.deliveryPerson = deliveryPerson;
    }

    if (priority) {
      query['metadata.priority'] = priority;
    }

    // Recherche géographique
    if (lat && lng) {
      query['pickupAddress.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      };
    }

    const deliveries = await Delivery.find(query)
      .populate('reference')
      .populate('deliveryPerson', 'firstName lastName phone email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(query);

    res.json({
      success: true,
      deliveries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des livraisons:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/deliveries/:id
// @desc    Obtenir une livraison par ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('reference')
      .populate('deliveryPerson', 'firstName lastName phone email avatar')
      .populate('statusHistory.changedBy', 'firstName lastName')
      .populate('incidents.reportedBy', 'firstName lastName');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    res.json({
      success: true,
      delivery
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la livraison:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/deliveries/:id/assign
// @desc    Assigner une livraison à un livreur
// @access  Private (Admin)
router.post('/:id/assign', auth, [
  body('deliveryPersonId').isMongoId().withMessage('ID de livreur invalide')
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

    const { deliveryPersonId } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    // Vérifier que le livreur existe
    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé'
      });
    }

    // Assigner la livraison
    delivery.deliveryPerson = deliveryPersonId;
    await delivery.updateStatus('assigned', req.userId, 'Livraison assignée par un administrateur');

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate('reference')
      .populate('deliveryPerson', 'firstName lastName phone email avatar');

    res.json({
      success: true,
      message: 'Livraison assignée avec succès',
      delivery: updatedDelivery
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/deliveries/:id/update-status
// @desc    Mettre à jour le statut d'une livraison
// @access  Private
router.post('/:id/update-status', auth, [
  body('status').isIn(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']).withMessage('Statut invalide'),
  body('reason').optional().isString(),
  body('notes').optional().isString()
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

    const { status, reason, notes } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    // Vérifier que l'utilisateur peut modifier cette livraison
    const canModify = delivery.deliveryPerson.toString() === req.userId.toString() || 
                     req.user.role === 'admin';

    if (!canModify) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation de modifier cette livraison'
      });
    }

    // Mettre à jour le statut
    await delivery.updateStatus(status, req.userId, reason, notes);

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate('reference')
      .populate('deliveryPerson', 'firstName lastName phone email avatar');

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      delivery: updatedDelivery
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/deliveries/:id/update-location
// @desc    Mettre à jour la localisation d'une livraison
// @access  Private
router.post('/:id/update-location', auth, [
  body('lat').isFloat().withMessage('Latitude invalide'),
  body('lng').isFloat().withMessage('Longitude invalide'),
  body('address').optional().isString()
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

    const { lat, lng, address } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le livreur assigné
    if (delivery.deliveryPerson.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le livreur assigné peut mettre à jour la localisation'
      });
    }

    // Mettre à jour la localisation
    await delivery.updateLocation(lat, lng, address);

    res.json({
      success: true,
      message: 'Localisation mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la localisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/deliveries/:id/complete
// @desc    Finaliser une livraison
// @access  Private
router.post('/:id/complete', auth, [
  body('signature').optional().isString(),
  body('photo').optional().isString(),
  body('notes').optional().isString(),
  body('receivedBy').isObject().withMessage('Informations du receveur requises')
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

    const { signature, photo, notes, receivedBy } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le livreur assigné
    if (delivery.deliveryPerson.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le livreur assigné peut finaliser cette livraison'
      });
    }

    // Mettre à jour la preuve de livraison
    delivery.proof = {
      signature: signature || '',
      photo: photo || '',
      notes: notes || '',
      deliveredBy: req.userId,
      receivedBy: receivedBy
    };

    // Mettre à jour le statut
    await delivery.updateStatus('delivered', req.userId, 'Livraison finalisée');

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate('reference')
      .populate('deliveryPerson', 'firstName lastName phone email avatar');

    res.json({
      success: true,
      message: 'Livraison finalisée avec succès',
      delivery: updatedDelivery
    });

  } catch (error) {
    console.error('Erreur lors de la finalisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/deliveries/:id/incident
// @desc    Signaler un incident
// @access  Private
router.post('/:id/incident', auth, [
  body('type').isIn(['delay', 'damage', 'lost', 'refused', 'wrong_address', 'other']).withMessage('Type d\'incident invalide'),
  body('description').isString().isLength({ min: 10, max: 500 }).withMessage('Description requise (10-500 caractères)')
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

    const { type, description } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    // Ajouter l'incident
    await delivery.addIncident(type, description, req.userId);

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate('reference')
      .populate('deliveryPerson', 'firstName lastName phone email avatar');

    res.json({
      success: true,
      message: 'Incident signalé avec succès',
      delivery: updatedDelivery
    });

  } catch (error) {
    console.error('Erreur lors du signalement d\'incident:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/deliveries/delivery-person/:userId
// @desc    Obtenir les livraisons d'un livreur
// @access  Private
router.get('/delivery-person/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Vérifier que l'utilisateur peut accéder à ces livraisons
    if (userId !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    let query = { deliveryPerson: userId };
    if (status) {
      query.status = status;
    }

    const deliveries = await Delivery.find(query)
      .populate('reference')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(query);

    res.json({
      success: true,
      deliveries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des livraisons du livreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/deliveries/stats
// @desc    Obtenir les statistiques de livraison
// @access  Private (Admin)
router.get('/stats', auth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const stats = await Delivery.getDeliveryStats();
    const overdueDeliveries = await Delivery.getOverdueDeliveries();

    res.json({
      success: true,
      stats,
      overdueDeliveries
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/deliveries/nearby
// @desc    Obtenir les livraisons à proximité
// @access  Private
router.get('/nearby', auth, [
  body('lat').isFloat().withMessage('Latitude invalide'),
  body('lng').isFloat().withMessage('Longitude invalide'),
  body('radius').optional().isInt({ min: 1, max: 50 }).withMessage('Rayon invalide')
], async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    const nearbyDeliveries = await Delivery.findNearbyDeliveries(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius)
    )
    .populate('reference')
    .populate('deliveryPerson', 'firstName lastName phone email avatar');

    res.json({
      success: true,
      deliveries: nearbyDeliveries
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des livraisons à proximité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;