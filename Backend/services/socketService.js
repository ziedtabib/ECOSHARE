const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

class SocketService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Middleware d'authentification
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Token d\'authentification requis'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoshare_dev_secret_change_in_production');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('Utilisateur non trouvé'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Token invalide'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Utilisateur connecté: ${socket.user.firstName} ${socket.user.lastName} (${socket.userId})`);

      // Enregistrer la connexion
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Notifier les autres utilisateurs de la connexion
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        user: {
          _id: socket.user._id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          avatar: socket.user.avatar
        }
      });

      // Événements de chat
      this.setupChatEvents(socket);
      
      // Événements de notification
      this.setupNotificationEvents(socket);
      
      // Événements de livraison
      this.setupDeliveryEvents(socket);

      // Gestion de la déconnexion
      socket.on('disconnect', () => {
        console.log(`Utilisateur déconnecté: ${socket.user.firstName} ${socket.user.lastName}`);
        
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);

        // Notifier les autres utilisateurs de la déconnexion
        socket.broadcast.emit('user_offline', {
          userId: socket.userId
        });
      });
    });
  }

  setupChatEvents(socket) {
    // Rejoindre une conversation
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        
        // Vérifier que l'utilisateur fait partie de la conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Conversation non trouvée ou accès non autorisé' });
          return;
        }

        socket.join(conversationId);
        socket.emit('joined_conversation', { conversationId });

        // Marquer les messages comme lus
        await Message.updateMany(
          { 
            conversation: conversationId, 
            sender: { $ne: socket.userId },
            readBy: { $ne: socket.userId }
          },
          { $push: { readBy: socket.userId } }
        );

      } catch (error) {
        console.error('Erreur lors de la jonction à la conversation:', error);
        socket.emit('error', { message: 'Erreur lors de la jonction à la conversation' });
      }
    });

    // Quitter une conversation
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(conversationId);
      socket.emit('left_conversation', { conversationId });
    });

    // Envoyer un message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'text', metadata = {} } = data;

        // Vérifier que l'utilisateur fait partie de la conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Conversation non trouvée ou accès non autorisé' });
          return;
        }

        // Créer le message
        const message = new Message({
          conversation: conversationId,
          sender: socket.userId,
          content,
          type,
          metadata
        });

        await message.save();

        // Populer le message avec les informations de l'expéditeur
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'firstName lastName avatar');

        // Envoyer le message à tous les participants de la conversation
        this.io.to(conversationId).emit('new_message', populatedMessage);

        // Mettre à jour la conversation
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
        await conversation.save();

        // Notifier les utilisateurs non connectés
        const offlineParticipants = conversation.participants.filter(
          participantId => !this.connectedUsers.has(participantId.toString())
        );

        for (const participantId of offlineParticipants) {
          // Ici, vous pourriez envoyer une notification push ou email
          console.log(`Notification pour utilisateur hors ligne: ${participantId}`);
        }

      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Marquer les messages comme lus
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId, messageIds } = data;

        await Message.updateMany(
          { 
            _id: { $in: messageIds },
            conversation: conversationId,
            sender: { $ne: socket.userId },
            readBy: { $ne: socket.userId }
          },
          { $push: { readBy: socket.userId } }
        );

        // Notifier les autres participants
        socket.to(conversationId).emit('messages_read', {
          conversationId,
          messageIds,
          readBy: socket.userId
        });

      } catch (error) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
        socket.emit('error', { message: 'Erreur lors du marquage des messages' });
      }
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        user: {
          _id: socket.user._id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_stopped_typing', {
        conversationId,
        userId: socket.userId
      });
    });
  }

  setupNotificationEvents(socket) {
    // S'abonner aux notifications
    socket.on('subscribe_notifications', () => {
      socket.join(`notifications_${socket.userId}`);
    });

    // Se désabonner des notifications
    socket.on('unsubscribe_notifications', () => {
      socket.leave(`notifications_${socket.userId}`);
    });
  }

  setupDeliveryEvents(socket) {
    // S'abonner aux mises à jour de livraison
    socket.on('subscribe_delivery', (data) => {
      const { deliveryId } = data;
      socket.join(`delivery_${deliveryId}`);
    });

    // Se désabonner des mises à jour de livraison
    socket.on('unsubscribe_delivery', (data) => {
      const { deliveryId } = data;
      socket.leave(`delivery_${deliveryId}`);
    });
  }

  // Méthodes publiques pour envoyer des notifications
  sendNotification(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  sendNotificationToRoom(room, notification) {
    this.io.to(room).emit('notification', notification);
  }

  sendDeliveryUpdate(deliveryId, update) {
    this.io.to(`delivery_${deliveryId}`).emit('delivery_update', update);
  }

  sendMessageToConversation(conversationId, message) {
    this.io.to(conversationId).emit('new_message', message);
  }

  // Obtenir les utilisateurs connectés
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Vérifier si un utilisateur est connecté
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Obtenir le socket d'un utilisateur
  getUserSocket(userId) {
    const socketId = this.connectedUsers.get(userId);
    return socketId ? this.io.sockets.sockets.get(socketId) : null;
  }
}

module.exports = SocketService;