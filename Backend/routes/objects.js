const express = require('express');
const Object = require('../models/Object');
const User = require('../models/User');
const { auth, checkOwnership } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/objects
// @desc    Obtenir tous les objets disponibles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'available',
      lat,
      lng,
      radius = 10,
      search
    } = req.query;

    let query = { status };

    // Filtrage par catégorie
    if (category) {
      query['aiClassification.category'] = category;
    }

    // Recherche textuelle
    if (search) {
      query.$text = { $search: search };
    }

    // Filtrage géographique
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convertir en mètres
        }
      };
    }

    const objects = await Object.find(query)
      .populate('owner', 'firstName lastName avatar')
      .populate('exchange.reservedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Object.countDocuments(query);

    res.json({
      success: true,
      objects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des objets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/objects/:id
// @desc    Obtenir un objet par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const object = await Object.findById(req.params.id)
      .populate('owner', 'firstName lastName avatar points level')
      .populate('exchange.reservedBy', 'firstName lastName avatar')
      .populate('recommendedAssociations.association', 'name type address');

    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Objet non trouvé'
      });
    }

    // Incrémenter le nombre de vues
    object.interactions.views += 1;
    await object.save();

    res.json({
      success: true,
      object
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'objet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/objects
// @desc    Créer un nouvel objet
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('La description doit contenir entre 10 et 500 caractères'),
  body('images').isArray({ min: 1 }).withMessage('Au moins une image est requise'),
  body('location.address').notEmpty().withMessage('L\'adresse est requise'),
  body('location.city').notEmpty().withMessage('La ville est requise'),
  body('location.postalCode').notEmpty().withMessage('Le code postal est requis')
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

    const objectData = {
      ...req.body,
      owner: req.userId
    };

    const object = new Object(objectData);
    await object.save();

    // Ajouter des points à l'utilisateur
    const user = await User.findById(req.userId);
    await user.addPoints(object.pointsReward);

    // Mettre à jour les statistiques
    user.stats.objectsShared += 1;
    await user.save();

    const populatedObject = await Object.findById(object._id)
      .populate('owner', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Objet créé avec succès',
      object: populatedObject
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'objet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/objects/:id
// @desc    Mettre à jour un objet
// @access  Private (propriétaire uniquement)
router.put('/:id', auth, checkOwnership(Object), [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 500 })
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

    const allowedUpdates = ['title', 'description', 'images', 'location'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const object = await Object.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Objet mis à jour avec succès',
      object
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'objet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/objects/:id/reserve
// @desc    Réserver un objet
// @access  Private
router.post('/:id/reserve', auth, [
  body('deliveryMethod').optional().isIn(['pickup', 'delivery', 'meeting'])
], async (req, res) => {
  try {
    const object = await Object.findById(req.params.id);
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Objet non trouvé'
      });
    }

    if (object.owner.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas réserver votre propre objet'
      });
    }

    await object.reserve(req.userId, req.body.deliveryMethod);

    const updatedObject = await Object.findById(object._id)
      .populate('owner', 'firstName lastName avatar')
      .populate('exchange.reservedBy', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Objet réservé avec succès',
      object: updatedObject
    });
  } catch (error) {
    console.error('Erreur lors de la réservation:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/objects/:id/cancel-reservation
// @desc    Annuler la réservation d'un objet
// @access  Private
router.post('/:id/cancel-reservation', auth, async (req, res) => {
  try {
    const object = await Object.findById(req.params.id);
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Objet non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire ou celui qui a réservé
    const isOwner = object.owner.toString() === req.userId.toString();
    const isReserver = object.exchange.reservedBy && 
                      object.exchange.reservedBy.toString() === req.userId.toString();

    if (!isOwner && !isReserver) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation d\'annuler cette réservation'
      });
    }

    await object.cancelReservation();

    const updatedObject = await Object.findById(object._id)
      .populate('owner', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Réservation annulée avec succès',
      object: updatedObject
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/objects/:id/complete
// @desc    Finaliser l'échange d'un objet
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const object = await Object.findById(req.params.id);
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Objet non trouvé'
      });
    }

    // Vérifier que l'utilisateur est impliqué dans l'échange
    const isOwner = object.owner.toString() === req.userId.toString();
    const isReserver = object.exchange.reservedBy && 
                      object.exchange.reservedBy.toString() === req.userId.toString();

    if (!isOwner && !isReserver) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation de finaliser cet échange'
      });
    }

    await object.completeExchange();

    // Ajouter des points aux utilisateurs impliqués
    const owner = await User.findById(object.owner);
    const reserver = await User.findById(object.exchange.reservedBy);

    await owner.addPoints(object.pointsReward);
    if (reserver) {
      await reserver.addPoints(Math.floor(object.pointsReward * 0.5)); // 50% des points pour le receveur
      reserver.stats.objectsReceived += 1;
      await reserver.save();
    }

    owner.stats.totalExchanges += 1;
    await owner.save();

    const updatedObject = await Object.findById(object._id)
      .populate('owner', 'firstName lastName avatar')
      .populate('exchange.reservedBy', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Échange finalisé avec succès',
      object: updatedObject
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de l\'échange:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/objects/:id/wishlist
// @desc    Ajouter/retirer un objet de la wishlist
// @access  Private
router.post('/:id/wishlist', auth, async (req, res) => {
  try {
    const object = await Object.findById(req.params.id);
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Objet non trouvé'
      });
    }

    const isInWishlist = object.inWishlist.some(item => 
      item.user.toString() === req.userId.toString()
    );

    if (isInWishlist) {
      await object.removeFromWishlist(req.userId);
      res.json({
        success: true,
        message: 'Objet retiré de votre wishlist',
        inWishlist: false
      });
    } else {
      await object.addToWishlist(req.userId);
      res.json({
        success: true,
        message: 'Objet ajouté à votre wishlist',
        inWishlist: true
      });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   DELETE /api/objects/:id
// @desc    Supprimer un objet
// @access  Private (propriétaire uniquement)
router.delete('/:id', auth, checkOwnership(Object), async (req, res) => {
  try {
    await Object.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Objet supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'objet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
