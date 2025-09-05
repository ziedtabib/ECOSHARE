const express = require('express');
const Contract = require('../models/Contract');
const Object = require('../models/Object');
const Food = require('../models/Food');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

const router = express.Router();

// @route   POST /api/contracts
// @desc    Créer un nouveau contrat
// @access  Private
router.post('/', [
  auth,
  body('itemId').notEmpty().withMessage('ID de l\'objet requis'),
  body('itemType').isIn(['Object', 'Food']).withMessage('Type d\'objet invalide'),
  body('receiverId').notEmpty().withMessage('ID du receveur requis'),
  body('exchangeDate').isISO8601().withMessage('Date d\'échange invalide'),
  body('exchangeLocation').notEmpty().withMessage('Lieu d\'échange requis'),
  body('deliveryMethod').isIn(['pickup', 'delivery', 'meeting']).withMessage('Méthode de livraison invalide')
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
      itemId,
      itemType,
      receiverId,
      exchangeDate,
      exchangeLocation,
      deliveryMethod,
      notes
    } = req.body;

    // Vérifier que l'utilisateur est le propriétaire de l'objet
    let item;
    if (itemType === 'Object') {
      item = await Object.findById(itemId);
    } else {
      item = await Food.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Objet non trouvé'
      });
    }

    if (item.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas le propriétaire de cet objet'
      });
    }

    // Vérifier que l'objet est réservé par le receveur
    if (!item.exchange.reservedBy || 
        item.exchange.reservedBy.toString() !== receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cet objet n\'est pas réservé par ce receveur'
      });
    }

    // Vérifier que le receveur existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receveur non trouvé'
      });
    }

    // Créer le contrat
    const contract = new Contract({
      item: itemId,
      itemType,
      owner: req.userId,
      receiver: receiverId,
      exchangeDetails: {
        date: new Date(exchangeDate),
        location: exchangeLocation,
        deliveryMethod,
        notes
      }
    });

    await contract.save();

    // Mettre à jour l'objet avec l'ID du contrat
    item.exchange.contract.contractId = contract.contractId;
    await item.save();

    // Populer les données pour la réponse
    await contract.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'receiver', select: 'firstName lastName email' },
      { path: 'item', select: 'title description' }
    ]);

    // Envoyer un email de notification au receveur
    try {
      const contractData = {
        contractId: contract.contractId,
        objectTitle: contract.item.title,
        ownerName: `${contract.owner.firstName} ${contract.owner.lastName}`,
        ownerEmail: contract.owner.email,
        receiverName: `${contract.receiver.firstName} ${contract.receiver.lastName}`,
        receiverEmail: contract.receiver.email,
        exchangeDate: contract.exchangeDetails.date,
        exchangeLocation: contract.exchangeDetails.location,
        deliveryMethod: contract.exchangeDetails.deliveryMethod
      };

      await emailService.sendContractNotificationEmail(contractData, 'receiver');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
      // Ne pas faire échouer la création du contrat si l'email échoue
    }

    res.status(201).json({
      success: true,
      message: 'Contrat créé avec succès',
      contract: contract.toContractView()
    });

  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/contracts
// @desc    Obtenir les contrats de l'utilisateur
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = {
      $or: [
        { owner: req.userId },
        { receiver: req.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.itemType = type;
    }

    const contracts = await Contract.find(query)
      .populate('owner', 'firstName lastName email avatar')
      .populate('receiver', 'firstName lastName email avatar')
      .populate({
        path: 'item',
        select: 'title description images aiClassification'
      })
      .sort({ createdAt: -1 });

    const formattedContracts = contracts.map(contract => {
      const contractData = contract.toContractView();
      const item = contract.item;
      
      return {
        ...contractData,
        objectTitle: item.title,
        objectDescription: item.description,
        objectCategory: item.aiClassification?.category,
        objectCondition: item.aiClassification?.condition,
        ownerName: `${contract.owner.firstName} ${contract.owner.lastName}`,
        ownerEmail: contract.owner.email,
        receiverName: `${contract.receiver.firstName} ${contract.receiver.lastName}`,
        receiverEmail: contract.receiver.email,
        ownerAvatar: contract.owner.avatar,
        receiverAvatar: contract.receiver.avatar
      };
    });

    res.json({
      success: true,
      contracts: formattedContracts
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/contracts/:id
// @desc    Obtenir un contrat par ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findOne({ contractId: req.params.id })
      .populate('owner', 'firstName lastName email avatar')
      .populate('receiver', 'firstName lastName email avatar')
      .populate({
        path: 'item',
        select: 'title description images aiClassification'
      });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    // Vérifier que l'utilisateur est impliqué dans ce contrat
    const isOwner = contract.owner._id.toString() === req.userId.toString();
    const isReceiver = contract.receiver._id.toString() === req.userId.toString();

    if (!isOwner && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    const contractData = contract.toContractView();
    const item = contract.item;
    
    const formattedContract = {
      ...contractData,
      objectTitle: item.title,
      objectDescription: item.description,
      objectCategory: item.aiClassification?.category,
      objectCondition: item.aiClassification?.condition,
      ownerName: `${contract.owner.firstName} ${contract.owner.lastName}`,
      ownerEmail: contract.owner.email,
      receiverName: `${contract.receiver.firstName} ${contract.receiver.lastName}`,
      receiverEmail: contract.receiver.email,
      ownerAvatar: contract.owner.avatar,
      receiverAvatar: contract.receiver.avatar,
      exchangeLocation: contract.exchangeDetails.location,
      exchangeDate: contract.exchangeDetails.date,
      deliveryMethod: contract.exchangeDetails.deliveryMethod,
      notes: contract.exchangeDetails.notes,
      isOwner,
      isReceiver
    };

    res.json({
      success: true,
      contract: formattedContract
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du contrat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/contracts/:id/sign
// @desc    Signer un contrat
// @access  Private
router.post('/:id/sign', [
  auth,
  body('signature').notEmpty().withMessage('Signature requise')
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

    const { signature } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const contract = await Contract.findOne({ contractId: req.params.id });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    // Signer le contrat
    await contract.sign(req.userId, signature, ipAddress, userAgent);

    // Populer les données pour les emails
    await contract.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'receiver', select: 'firstName lastName email' },
      { path: 'item', select: 'title description' }
    ]);

    // Si le contrat est maintenant complètement signé, finaliser l'échange
    if (contract.status === 'signed') {
      let item;
      if (contract.itemType === 'Object') {
        item = await Object.findById(contract.item);
      } else {
        item = await Food.findById(contract.item);
      }

      if (item) {
        // Marquer l'échange comme complété
        item.exchange.contract.signed = true;
        item.exchange.contract.signedAt = new Date();
        await item.completeExchange();
      }

      // Envoyer un email de confirmation à toutes les parties
      try {
        const contractData = {
          contractId: contract.contractId,
          objectTitle: contract.item.title,
          ownerName: `${contract.owner.firstName} ${contract.owner.lastName}`,
          ownerEmail: contract.owner.email,
          receiverName: `${contract.receiver.firstName} ${contract.receiver.lastName}`,
          receiverEmail: contract.receiver.email,
          exchangeDate: contract.exchangeDetails.date,
          exchangeLocation: contract.exchangeDetails.location,
          deliveryMethod: contract.exchangeDetails.deliveryMethod
        };

        await emailService.sendContractSignedEmail(contractData);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
        // Ne pas faire échouer la signature si l'email échoue
      }
    } else {
      // Le contrat n'est pas encore complètement signé, notifier l'autre partie
      try {
        const contractData = {
          contractId: contract.contractId,
          objectTitle: contract.item.title,
          ownerName: `${contract.owner.firstName} ${contract.owner.lastName}`,
          ownerEmail: contract.owner.email,
          receiverName: `${contract.receiver.firstName} ${contract.receiver.lastName}`,
          receiverEmail: contract.receiver.email,
          exchangeDate: contract.exchangeDetails.date,
          exchangeLocation: contract.exchangeDetails.location,
          deliveryMethod: contract.exchangeDetails.deliveryMethod
        };

        // Déterminer qui doit être notifié
        const isOwner = contract.owner._id.toString() === req.userId.toString();
        const recipientType = isOwner ? 'receiver' : 'owner';
        
        await emailService.sendContractNotificationEmail(contractData, recipientType);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
        // Ne pas faire échouer la signature si l'email échoue
      }
    }

    res.json({
      success: true,
      message: 'Contrat signé avec succès',
      contract: contract.toContractView()
    });

  } catch (error) {
    console.error('Erreur lors de la signature du contrat:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur'
    });
  }
});

// @route   POST /api/contracts/:id/cancel
// @desc    Annuler un contrat
// @access  Private
router.post('/:id/cancel', [
  auth,
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const { reason } = req.body;

    const contract = await Contract.findOne({ contractId: req.params.id });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    // Vérifier que l'utilisateur peut annuler ce contrat
    const isOwner = contract.owner.toString() === req.userId.toString();
    const isReceiver = contract.receiver.toString() === req.userId.toString();

    if (!isOwner && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à annuler ce contrat'
      });
    }

    await contract.cancel(req.userId, reason);

    // Remettre l'objet en disponibilité
    let item;
    if (contract.itemType === 'Object') {
      item = await Object.findById(contract.item);
    } else {
      item = await Food.findById(contract.item);
    }

    if (item) {
      await item.cancelReservation();
    }

    res.json({
      success: true,
      message: 'Contrat annulé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation du contrat:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur'
    });
  }
});

// @route   POST /api/contracts/:id/resend-email
// @desc    Renvoyer l'email de contrat signé
// @access  Private
router.post('/:id/resend-email', auth, async (req, res) => {
  try {
    const contract = await Contract.findOne({ contractId: req.params.id })
      .populate('owner', 'firstName lastName email')
      .populate('receiver', 'firstName lastName email')
      .populate({
        path: 'item',
        select: 'title description'
      });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    // Vérifier que l'utilisateur est impliqué dans ce contrat
    const isOwner = contract.owner._id.toString() === req.userId.toString();
    const isReceiver = contract.receiver._id.toString() === req.userId.toString();

    if (!isOwner && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    // Vérifier que le contrat est signé
    if (contract.status !== 'signed') {
      return res.status(400).json({
        success: false,
        message: 'Le contrat doit être entièrement signé pour renvoyer l\'email'
      });
    }

    // Préparer les données du contrat
    const contractData = {
      contractId: contract.contractId,
      objectTitle: contract.item.title,
      ownerName: `${contract.owner.firstName} ${contract.owner.lastName}`,
      ownerEmail: contract.owner.email,
      receiverName: `${contract.receiver.firstName} ${contract.receiver.lastName}`,
      receiverEmail: contract.receiver.email,
      exchangeDate: contract.exchangeDetails.date,
      exchangeLocation: contract.exchangeDetails.location,
      deliveryMethod: contract.exchangeDetails.deliveryMethod
    };

    // Envoyer l'email
    const emailResult = await emailService.sendContractSignedEmail(contractData);

    res.json({
      success: true,
      message: 'Email de contrat renvoyé avec succès',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du renvoi de l\'email'
    });
  }
});

// @route   GET /api/contracts/:id/pdf
// @desc    Générer le PDF du contrat
// @access  Private
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const contract = await Contract.findOne({ contractId: req.params.id })
      .populate('owner', 'firstName lastName email')
      .populate('receiver', 'firstName lastName email')
      .populate({
        path: 'item',
        select: 'title description aiClassification'
      });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    // Vérifier l'autorisation
    const isOwner = contract.owner._id.toString() === req.userId.toString();
    const isReceiver = contract.receiver._id.toString() === req.userId.toString();

    if (!isOwner && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Ici on pourrait générer un vrai PDF avec une librairie comme puppeteer
    // Pour l'instant, on retourne les données du contrat
    const contractData = {
      contractId: contract.contractId,
      createdAt: contract.createdAt,
      status: contract.status,
      owner: {
        name: `${contract.owner.firstName} ${contract.owner.lastName}`,
        email: contract.owner.email
      },
      receiver: {
        name: `${contract.receiver.firstName} ${contract.receiver.lastName}`,
        email: contract.receiver.email
      },
      item: {
        title: contract.item.title,
        description: contract.item.description,
        category: contract.item.aiClassification?.category,
        condition: contract.item.aiClassification?.condition
      },
      exchange: contract.exchangeDetails,
      signatures: contract.signatures
    };

    res.json({
      success: true,
      contract: contractData
    });

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;