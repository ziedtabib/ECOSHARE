const express = require('express');
const Food = require('../models/Food');
const User = require('../models/User');
const { auth, checkOwnership } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/foods
// @desc    Obtenir tous les aliments disponibles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      foodType,
      status = 'available',
      lat,
      lng,
      radius = 10,
      search,
      urgency
    } = req.query;

    let query = { status };

    // Filtrage par type d'aliment
    if (foodType) {
      query['aiClassification.foodType'] = foodType;
    }

    // Filtrage par urgence
    if (urgency) {
      query.urgency = urgency;
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

    const foods = await Food.find(query)
      .populate('owner', 'firstName lastName avatar')
      .populate('exchange.reservedBy', 'firstName lastName')
      .sort({ urgency: -1, createdAt: -1 }) // Trier par urgence puis par date
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Food.countDocuments(query);

    res.json({
      success: true,
      foods,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des aliments:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/foods/:id
// @desc    Obtenir un aliment par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('owner', 'firstName lastName avatar points level')
      .populate('exchange.reservedBy', 'firstName lastName avatar')
      .populate('recommendedAssociations.association', 'name type address');

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Aliment non trouvé'
      });
    }

    // Incrémenter le nombre de vues
    food.interactions.views += 1;
    await food.save();

    res.json({
      success: true,
      food
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'aliment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/foods
// @desc    Créer un nouvel aliment
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

    const foodData = {
      ...req.body,
      owner: req.userId
    };

    const food = new Food(foodData);
    await food.save();

    // Ajouter des points à l'utilisateur
    const user = await User.findById(req.userId);
    await user.addPoints(food.pointsReward);

    // Mettre à jour les statistiques
    user.stats.foodsShared += 1;
    await user.save();

    const populatedFood = await Food.findById(food._id)
      .populate('owner', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Aliment créé avec succès',
      food: populatedFood
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'aliment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/foods/:id/reserve
// @desc    Réserver un aliment
// @access  Private
router.post('/:id/reserve', auth, [
  body('deliveryMethod').optional().isIn(['pickup', 'delivery', 'meeting'])
], async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Aliment non trouvé'
      });
    }

    if (food.owner.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas réserver votre propre aliment'
      });
    }

    await food.reserve(req.userId, req.body.deliveryMethod);

    const updatedFood = await Food.findById(food._id)
      .populate('owner', 'firstName lastName avatar')
      .populate('exchange.reservedBy', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Aliment réservé avec succès',
      food: updatedFood
    });
  } catch (error) {
    console.error('Erreur lors de la réservation:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/foods/:id/complete
// @desc    Finaliser l'échange d'un aliment
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Aliment non trouvé'
      });
    }

    // Vérifier que l'utilisateur est impliqué dans l'échange
    const isOwner = food.owner.toString() === req.userId.toString();
    const isReserver = food.exchange.reservedBy && 
                      food.exchange.reservedBy.toString() === req.userId.toString();

    if (!isOwner && !isReserver) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation de finaliser cet échange'
      });
    }

    await food.completeExchange();

    // Ajouter des points aux utilisateurs impliqués
    const owner = await User.findById(food.owner);
    const reserver = await User.findById(food.exchange.reservedBy);

    await owner.addPoints(food.pointsReward);
    if (reserver) {
      await reserver.addPoints(Math.floor(food.pointsReward * 0.5)); // 50% des points pour le receveur
      reserver.stats.foodsReceived += 1;
      await reserver.save();
    }

    owner.stats.totalExchanges += 1;
    await owner.save();

    const updatedFood = await Food.findById(food._id)
      .populate('owner', 'firstName lastName avatar')
      .populate('exchange.reservedBy', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Échange finalisé avec succès',
      food: updatedFood
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de l\'échange:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/foods/:id/generate-recipes
// @desc    Générer des recettes pour un aliment
// @access  Private
router.post('/:id/generate-recipes', auth, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Aliment non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (food.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation de générer des recettes pour cet aliment'
      });
    }

    await food.generateRecipes();

    res.json({
      success: true,
      message: 'Recettes générées avec succès',
      recipes: food.recipes
    });
  } catch (error) {
    console.error('Erreur lors de la génération des recettes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/foods/:id/wishlist
// @desc    Ajouter/retirer un aliment de la wishlist
// @access  Private
router.post('/:id/wishlist', auth, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Aliment non trouvé'
      });
    }

    const isInWishlist = food.inWishlist.some(item => 
      item.user.toString() === req.userId.toString()
    );

    if (isInWishlist) {
      await food.removeFromWishlist(req.userId);
      res.json({
        success: true,
        message: 'Aliment retiré de votre wishlist',
        inWishlist: false
      });
    } else {
      await food.addToWishlist(req.userId);
      res.json({
        success: true,
        message: 'Aliment ajouté à votre wishlist',
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

// @route   GET /api/foods/expiring-soon
// @desc    Obtenir les aliments qui expirent bientôt
// @access  Public
router.get('/expiring-soon', async (req, res) => {
  try {
    const { limit = 20, lat, lng, radius = 10 } = req.query;
    
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    let query = {
      status: 'available',
      'aiClassification.expirationDate': {
        $gte: now,
        $lte: threeDaysFromNow
      }
    };

    // Filtrage géographique
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      };
    }

    const foods = await Food.find(query)
      .populate('owner', 'firstName lastName avatar')
      .sort({ 'aiClassification.expirationDate': 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      foods
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des aliments expirant bientôt:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
