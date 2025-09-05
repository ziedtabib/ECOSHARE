const express = require('express');
const Association = require('../models/Association');
const User = require('../models/User');
const { auth, checkOwnership } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/associations/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// @route   GET /api/associations
// @desc    Obtenir toutes les associations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      city,
      verified,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 50
    } = req.query;

    let query = { status: 'active' };

    // Filtres
    if (category && category.trim() !== '') {
      query.type = category;
    }

    if (city && city.trim() !== '') {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (verified !== undefined && verified !== '') {
      query.isVerified = verified === 'true';
    }

    if (search && search.trim() !== '') {
      query.$text = { $search: search };
    }

    // Recherche géographique
    if (lat && lng) {
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      };
    }

    // Tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const associations = await Association.find(query)
      .populate('contactPerson', 'firstName lastName email phone avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Association.countDocuments(query);

    res.json({
      success: true,
      associations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des associations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/associations/:id
// @desc    Obtenir une association par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const association = await Association.findById(req.params.id)
      .populate('contactPerson', 'firstName lastName email phone avatar')
      .populate('volunteers', 'firstName lastName avatar')
      .populate('partnerships.partner', 'name logo website');

    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Incrémenter le nombre de vues
    association.stats.views += 1;
    await association.save();

    res.json({
      success: true,
      association
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'association:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/associations
// @desc    Créer une nouvelle association
// @access  Private
router.post('/', auth, upload.single('logo'), async (req, res) => {
  try {
    // Parser les données JSON des objets imbriqués
    let address = {};
    let contact = {};
    let needs = [];
    let tags = [];

    try {
      address = req.body.address ? JSON.parse(req.body.address) : {};
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'adresse invalide'
      });
    }

    try {
      contact = req.body.contact ? JSON.parse(req.body.contact) : {};
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Format de contact invalide'
      });
    }

    try {
      needs = req.body.needs ? JSON.parse(req.body.needs) : [];
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Format des besoins invalide'
      });
    }

    try {
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Format des tags invalide'
      });
    }

    // Validation manuelle
    const validationErrors = [];

    if (!req.body.name || req.body.name.trim().length < 2 || req.body.name.trim().length > 100) {
      validationErrors.push({ field: 'name', message: 'Le nom doit contenir entre 2 et 100 caractères' });
    }

    if (!req.body.description || req.body.description.trim().length < 20 || req.body.description.trim().length > 1000) {
      validationErrors.push({ field: 'description', message: 'La description doit contenir entre 20 et 1000 caractères' });
    }

    const validTypes = ['food_bank', 'clothing', 'furniture', 'books', 'toys', 'electronics', 'general', 'environmental', 'social', 'other'];
    if (!req.body.type || !validTypes.includes(req.body.type)) {
      validationErrors.push({ field: 'type', message: 'Type invalide' });
    }

    if (!address.street || address.street.trim().length < 5 || address.street.trim().length > 200) {
      validationErrors.push({ field: 'address.street', message: 'Adresse invalide' });
    }

    if (!address.city || address.city.trim().length < 2 || address.city.trim().length > 100) {
      validationErrors.push({ field: 'address.city', message: 'Ville invalide' });
    }

    if (!address.postalCode || address.postalCode.trim().length < 5 || address.postalCode.trim().length > 10) {
      validationErrors.push({ field: 'address.postalCode', message: 'Code postal invalide' });
    }

    if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      validationErrors.push({ field: 'contact.email', message: 'Email de contact invalide' });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationErrors
      });
    }

    const associationData = {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      type: req.body.type,
      address: address,
      contact: contact,
      mission: req.body.mission,
      targetAudience: req.body.targetAudience,
      needs: needs,
      tags: tags,
      contactPerson: req.userId
    };

    // Ajouter l'image principale si un logo est fourni
    if (req.file) {
      associationData.images = [{
        url: req.file.path,
        isMain: true
      }];
    }

    const association = new Association(associationData);
    await association.save();

    const populatedAssociation = await Association.findById(association._id)
      .populate('contactPerson', 'firstName lastName email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Association créée avec succès',
      association: populatedAssociation
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'association:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/associations/:id
// @desc    Mettre à jour une association
// @access  Private (contact person ou admin)
router.put('/:id', auth, upload.single('logo'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ min: 20, max: 1000 }),
  body('category').optional().isIn(['food_bank', 'shelter', 'education', 'health', 'environment', 'social', 'other'])
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

    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Vérifier les permissions
    const user = await User.findById(req.userId);
    const canEdit = association.contactPerson.toString() === req.userId.toString() || user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation de modifier cette association'
      });
    }

    // Mettre à jour les données
    const allowedUpdates = ['name', 'description', 'category', 'address', 'contact', 'website', 'socialMedia', 'needs', 'activities'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (req.file) {
      updates.logo = req.file.path;
    }

    const updatedAssociation = await Association.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('contactPerson', 'firstName lastName email phone avatar');

    res.json({
      success: true,
      message: 'Association mise à jour avec succès',
      association: updatedAssociation
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'association:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/associations/:id/volunteer
// @desc    Rejoindre une association en tant que bénévole
// @access  Private
router.post('/:id/volunteer', auth, async (req, res) => {
  try {
    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Vérifier si l'utilisateur est déjà bénévole
    if (association.volunteers.includes(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà bénévole de cette association'
      });
    }

    // Ajouter le bénévole
    association.volunteers.push(req.userId);
    await association.save();

    const updatedAssociation = await Association.findById(association._id)
      .populate('volunteers', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Vous avez rejoint l\'association avec succès',
      association: updatedAssociation
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du bénévole:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   DELETE /api/associations/:id/volunteer
// @desc    Quitter une association
// @access  Private
router.delete('/:id/volunteer', auth, async (req, res) => {
  try {
    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Retirer le bénévole
    association.volunteers = association.volunteers.filter(
      volunteerId => volunteerId.toString() !== req.userId.toString()
    );
    await association.save();

    const updatedAssociation = await Association.findById(association._id)
      .populate('volunteers', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Vous avez quitté l\'association',
      association: updatedAssociation
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du bénévole:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/associations/:id/contact
// @desc    Contacter une association
// @access  Private
router.post('/:id/contact', auth, [
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Le sujet doit contenir entre 5 et 200 caractères'),
  body('message').trim().isLength({ min: 20, max: 1000 }).withMessage('Le message doit contenir entre 20 et 1000 caractères'),
  body('type').isIn(['donation', 'volunteer', 'partnership', 'general']).withMessage('Type de contact invalide')
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

    const { subject, message, type } = req.body;

    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Créer une demande de contact
    const contactRequest = {
      from: req.userId,
      subject,
      message,
      type,
      status: 'pending',
      createdAt: new Date()
    };

    association.contactRequests.push(contactRequest);
    await association.save();

    // Ici, vous pourriez envoyer un email de notification à l'association
    // await sendContactNotification(association.contactPerson, contactRequest);

    res.json({
      success: true,
      message: 'Votre message a été envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/associations/:id/needs
// @desc    Obtenir les besoins d'une association
// @access  Public
router.get('/:id/needs', async (req, res) => {
  try {
    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    res.json({
      success: true,
      needs: association.needs
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des besoins:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/associations/:id/needs
// @desc    Ajouter un besoin à une association
// @access  Private (contact person ou admin)
router.post('/:id/needs', auth, [
  body('item').trim().isLength({ min: 2, max: 100 }).withMessage('L\'objet doit contenir entre 2 et 100 caractères'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('La description doit contenir entre 10 et 500 caractères'),
  body('quantity').isInt({ min: 1 }).withMessage('La quantité doit être un nombre positif'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priorité invalide')
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

    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Vérifier les permissions
    const user = await User.findById(req.userId);
    const canEdit = association.contactPerson.toString() === req.userId.toString() || user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation de modifier cette association'
      });
    }

    const need = {
      item: req.body.item,
      description: req.body.description,
      quantity: req.body.quantity,
      priority: req.body.priority,
      addedBy: req.userId,
      addedAt: new Date()
    };

    association.needs.push(need);
    await association.save();

    res.json({
      success: true,
      message: 'Besoin ajouté avec succès',
      need
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du besoin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/associations/:id/needs/:needId
// @desc    Mettre à jour un besoin
// @access  Private (contact person ou admin)
router.put('/:id/needs/:needId', auth, [
  body('item').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 500 }),
  body('quantity').optional().isInt({ min: 1 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
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

    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Vérifier les permissions
    const user = await User.findById(req.userId);
    const canEdit = association.contactPerson.toString() === req.userId.toString() || user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation de modifier cette association'
      });
    }

    const need = association.needs.id(req.params.needId);
    if (!need) {
      return res.status(404).json({
        success: false,
        message: 'Besoin non trouvé'
      });
    }

    // Mettre à jour le besoin
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        need[key] = req.body[key];
      }
    });

    await association.save();

    res.json({
      success: true,
      message: 'Besoin mis à jour avec succès',
      need
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du besoin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   DELETE /api/associations/:id/needs/:needId
// @desc    Supprimer un besoin
// @access  Private (contact person ou admin)
router.delete('/:id/needs/:needId', auth, async (req, res) => {
  try {
    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Vérifier les permissions
    const user = await User.findById(req.userId);
    const canEdit = association.contactPerson.toString() === req.userId.toString() || user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas l\'autorisation de modifier cette association'
      });
    }

    const need = association.needs.id(req.params.needId);
    if (!need) {
      return res.status(404).json({
        success: false,
        message: 'Besoin non trouvé'
      });
    }

    need.remove();
    await association.save();

    res.json({
      success: true,
      message: 'Besoin supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du besoin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/associations/recommendations
// @desc    Obtenir des recommandations d'associations basées sur un objet
// @access  Public
router.get('/recommendations', async (req, res) => {
  try {
    const { category, subcategory, location, objectType } = req.query;

    let query = { status: 'active' };

    // Filtrage par catégorie d'objet
    if (category) {
      // Mapper les catégories d'objets vers les catégories d'associations
      const categoryMapping = {
        'electronics': ['environmental', 'general'],
        'clothing': ['general', 'social'],
        'furniture': ['general', 'environmental'],
        'books': ['education', 'general'],
        'toys': ['education', 'general'],
        'sports': ['general', 'social'],
        'beauty': ['general', 'social'],
        'home': ['general', 'environmental'],
        'other': ['general']
      };

      const associationTypes = categoryMapping[category] || ['general'];
      query.type = { $in: associationTypes };
    }

    // Filtrage par sous-catégorie
    if (subcategory) {
      query.acceptedCategories = { $in: [subcategory, 'other'] };
    }

    // Filtrage par localisation
    if (location) {
      query['address.city'] = new RegExp(location, 'i');
    }

    // Recherche par type d'objet dans les besoins
    if (objectType) {
      query.$or = [
        { 'needs.category': new RegExp(objectType, 'i') },
        { tags: { $in: [new RegExp(objectType, 'i')] } }
      ];
    }

    const associations = await Association.find(query)
      .populate('contactPerson', 'firstName lastName email phone avatar')
      .sort({ 'stats.rating.average': -1 })
      .limit(5);

    res.json({
      success: true,
      associations,
      recommendations: {
        basedOn: {
          category,
          subcategory,
          location,
          objectType
        },
        count: associations.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/associations/categories
// @desc    Obtenir les catégories d'associations
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'food_bank', label: 'Banque alimentaire', icon: '🍽️' },
      { value: 'shelter', label: 'Hébergement', icon: '🏠' },
      { value: 'education', label: 'Éducation', icon: '🎓' },
      { value: 'health', label: 'Santé', icon: '🏥' },
      { value: 'environment', label: 'Environnement', icon: '🌱' },
      { value: 'social', label: 'Social', icon: '🤝' },
      { value: 'other', label: 'Autre', icon: '📋' }
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

module.exports = router;