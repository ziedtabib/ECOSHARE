const express = require('express');
const Post = require('../models/Post');
const { auth, checkOwnership } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/posts
// @desc    Obtenir tous les posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      status = 'active',
      lat,
      lng,
      radius = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { status };

    // Filtrage par type
    if (type) {
      query.type = type;
    }

    // Filtrage par catégorie
    if (category) {
      query.category = category;
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
          $maxDistance: radius * 1000
        }
      };
    }

    // Tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName avatar')
      .populate('participants.user', 'firstName lastName avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Obtenir un post par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName avatar points level')
      .populate('participants.user', 'firstName lastName avatar')
      .populate('comments.author', 'firstName lastName avatar')
      .populate('comments.replies.author', 'firstName lastName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    // Incrémenter le nombre de vues
    post.interactions.views += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/posts
// @desc    Créer un nouveau post
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Le titre doit contenir entre 5 et 200 caractères'),
  body('content').trim().isLength({ min: 20, max: 2000 }).withMessage('Le contenu doit contenir entre 20 et 2000 caractères'),
  body('type').isIn(['help_request', 'announcement', 'success_story', 'tip', 'event', 'general']).withMessage('Type de post invalide'),
  body('category').isIn(['food_collection', 'clothing_drive', 'toy_donation', 'furniture_pickup', 'book_donation', 'electronics_recycling', 'community_event', 'volunteer_help', 'emergency_help', 'other']).withMessage('Catégorie invalide')
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

    const postData = {
      ...req.body,
      author: req.userId
    };

    const post = new Post(postData);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Post créé avec succès',
      post: populatedPost
    });
  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Mettre à jour un post
// @access  Private (auteur uniquement)
router.put('/:id', auth, checkOwnership(Post, 'id'), [
  body('title').optional().trim().isLength({ min: 5, max: 200 }),
  body('content').optional().trim().isLength({ min: 20, max: 2000 })
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

    const allowedUpdates = ['title', 'content', 'media', 'location', 'details', 'tags'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Post mis à jour avec succès',
      post
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Ajouter un commentaire à un post
// @access  Private
router.post('/:id/comment', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Le commentaire doit contenir entre 1 et 500 caractères')
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

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    await post.addComment(req.userId, req.body.content);

    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'firstName lastName avatar')
      .populate('comments.replies.author', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      post: updatedPost
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/posts/:id/participate
// @desc    Participer à un post (événement ou demande d'aide)
// @access  Private
router.post('/:id/participate', auth, [
  body('contribution').optional().trim().isLength({ max: 200 }).withMessage('La contribution ne peut pas dépasser 200 caractères')
], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    if (post.author.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas participer à votre propre post'
      });
    }

    await post.addParticipant(req.userId, req.body.contribution);

    const updatedPost = await Post.findById(post._id)
      .populate('participants.user', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Participation enregistrée avec succès',
      post: updatedPost
    });
  } catch (error) {
    console.error('Erreur lors de la participation:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/posts/:id/complete
// @desc    Marquer un post comme terminé
// @access  Private (auteur uniquement)
router.post('/:id/complete', auth, checkOwnership(Post, 'id'), async (req, res) => {
  try {
    await req.resource.markCompleted();

    res.json({
      success: true,
      message: 'Post marqué comme terminé'
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation du post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/posts/:id/report
// @desc    Signaler un post
// @access  Private
router.post('/:id/report', auth, [
  body('reason').isIn(['spam', 'inappropriate', 'misleading', 'other']).withMessage('Raison de signalement invalide'),
  body('description').optional().trim().isLength({ max: 300 }).withMessage('La description ne peut pas dépasser 300 caractères')
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

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    await post.report(req.userId, req.body.reason, req.body.description);

    res.json({
      success: true,
      message: 'Post signalé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du signalement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Supprimer un post
// @access  Private (auteur uniquement)
router.delete('/:id', auth, checkOwnership(Post, 'id'), async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/posts/urgent/help-requests
// @desc    Obtenir les demandes d'aide urgentes
// @access  Public
router.get('/urgent/help-requests', async (req, res) => {
  try {
    const { lat, lng, radius = 20, limit = 10 } = req.query;

    let query = {
      type: 'help_request',
      status: 'active',
      'details.helpRequest.urgency': { $in: ['high', 'critical'] }
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

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName avatar')
      .sort({ 'details.helpRequest.urgency': -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes urgentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
