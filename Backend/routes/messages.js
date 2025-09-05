const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Obtenir toutes les conversations de l'utilisateur
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.findUserConversations(req.userId, {
      archived: false
    });

    // Ajouter le nombre de messages non lus pour chaque conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.getUnreadMessages(req.userId)
          .then(messages => messages.filter(msg => 
            msg.conversation._id.toString() === conversation._id.toString()
          ).length);

        return {
          ...conversation.toObject(),
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithUnread
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Obtenir les messages d'une conversation
// @access  Private
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before, after } = req.query;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }

    const messages = await Message.getConversationMessages(conversationId, {
      limit: parseInt(limit),
      before,
      after
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Inverser pour avoir l'ordre chronologique
      conversation: {
        id: conversation._id,
        type: conversation.type,
        participants: conversation.participants,
        metadata: conversation.metadata
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/messages/:conversationId
// @desc    Envoyer un message dans une conversation
// @access  Private
router.post('/:conversationId', [
  auth,
  body('content').optional().isString().isLength({ max: 2000 }),
  body('type').optional().isIn(['text', 'image', 'file', 'location', 'contact', 'system']),
  body('replyTo').optional().isMongoId()
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

    const { conversationId } = req.params;
    const { content, type = 'text', replyTo, metadata = {} } = req.body;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }

    // Créer le message
    const message = new Message({
      conversation: conversationId,
      sender: req.userId,
      content,
      type,
      replyTo,
      metadata
    });

    await message.save();
    await message.populate([
      { path: 'sender', select: 'firstName lastName avatar email' },
      { path: 'replyTo' }
    ]);

    // Mettre à jour la conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: message
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   PUT /api/messages/:messageId
// @desc    Modifier un message
// @access  Private
router.put('/:messageId', [
  auth,
  body('content').isString().isLength({ min: 1, max: 2000 })
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

    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres messages'
      });
    }

    await message.editMessage(content, req.userId);

    res.json({
      success: true,
      message: 'Message modifié avec succès',
      data: message
    });

  } catch (error) {
    console.error('Erreur lors de la modification du message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur'
    });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Supprimer un message
// @access  Private
router.delete('/:messageId', [
  auth,
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'expéditeur ou un modérateur
    if (message.sender.toString() !== req.userId.toString()) {
      // Ici on pourrait vérifier si l'utilisateur est modérateur
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres messages'
      });
    }

    await message.deleteMessage(req.userId, reason);

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/messages/:messageId/read
// @desc    Marquer un message comme lu
// @access  Private
router.post('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation || !conversation.isParticipant(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    await message.markAsRead(req.userId);

    res.json({
      success: true,
      message: 'Message marqué comme lu'
    });

  } catch (error) {
    console.error('Erreur lors du marquage du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/messages/:conversationId/read-all
// @desc    Marquer tous les messages d'une conversation comme lus
// @access  Private
router.post('/:conversationId/read-all', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }

    await Message.markConversationAsRead(conversationId, req.userId);

    res.json({
      success: true,
      message: 'Tous les messages marqués comme lus'
    });

  } catch (error) {
    console.error('Erreur lors du marquage des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/messages/:messageId/reaction
// @desc    Ajouter/retirer une réaction à un message
// @access  Private
router.post('/:messageId/reaction', [
  auth,
  body('emoji').isString().isLength({ min: 1, max: 10 })
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

    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation || !conversation.isParticipant(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    await message.addReaction(req.userId, emoji);

    res.json({
      success: true,
      message: 'Réaction ajoutée/retirée avec succès',
      data: message.reactions
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/messages/search
// @desc    Rechercher des messages
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, conversationId, type, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Terme de recherche requis'
      });
    }

    const messages = await Message.searchMessages(q, {
      conversationId,
      userId: req.userId,
      type,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      messages,
      query: q
    });

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/messages/conversations
// @desc    Créer une nouvelle conversation
// @access  Private
router.post('/conversations', [
  auth,
  body('participants').isArray({ min: 1 }),
  body('type').optional().isIn(['direct', 'group', 'object_exchange', 'food_exchange']),
  body('title').optional().isString()
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

    const { participants, type = 'direct', title, metadata = {} } = req.body;

    // Ajouter l'utilisateur actuel aux participants
    const allParticipants = [...new Set([req.userId, ...participants])];

    // Vérifier que tous les participants existent
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: 'Un ou plusieurs participants n\'existent pas'
      });
    }

    // Pour les conversations directes, vérifier s'il en existe déjà une
    if (type === 'direct' && allParticipants.length === 2) {
      const existingConversation = await Conversation.findOrCreateDirectConversation(
        allParticipants[0],
        allParticipants[1]
      );
      
      return res.json({
        success: true,
        message: 'Conversation trouvée/créée avec succès',
        conversation: existingConversation
      });
    }

    // Créer une nouvelle conversation
    const conversation = new Conversation({
      type,
      participants: allParticipants.map(userId => ({ user: userId })),
      metadata: {
        title,
        ...metadata
      }
    });

    await conversation.save();
    await conversation.populate('participants.user', 'firstName lastName avatar email');

    res.status(201).json({
      success: true,
      message: 'Conversation créée avec succès',
      conversation
    });

  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;