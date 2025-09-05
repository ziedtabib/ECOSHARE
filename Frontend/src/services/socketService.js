import { io } from 'socket.io-client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialiser la connexion Socket.io
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id
        },
        transports: ['websocket', 'polling']
      });

      // Gestion des événements de connexion
      newSocket.on('connect', () => {
        console.log('✅ Connecté au serveur Socket.io');
        setIsConnected(true);
        setConnectionError(null);
        
        // Rejoindre la room de l'utilisateur
        newSocket.emit('join_user_room', { userId: user.id });
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Déconnecté du serveur Socket.io:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion Socket.io:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      // Gestion des erreurs d'authentification
      newSocket.on('auth_error', (error) => {
        console.error('❌ Erreur d\'authentification Socket.io:', error);
        setConnectionError('Erreur d\'authentification');
        // Optionnel: déconnecter l'utilisateur
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      });

      // Gestion des notifications
      newSocket.on('notification', (notification) => {
        console.log('📢 Notification reçue:', notification);
        // Ici on pourrait afficher une notification toast
        showNotification(notification);
      });

      // Gestion des messages en temps réel
      newSocket.on('new_message', (message) => {
        console.log('💬 Nouveau message reçu:', message);
        // Émettre un événement personnalisé pour les composants qui écoutent
        window.dispatchEvent(new CustomEvent('new_message', { detail: message }));
      });

      // Gestion des mises à jour de statut
      newSocket.on('user_status_update', (data) => {
        console.log('👤 Mise à jour de statut utilisateur:', data);
        window.dispatchEvent(new CustomEvent('user_status_update', { detail: data }));
      });

      // Gestion des mises à jour de contrats
      newSocket.on('contract_update', (data) => {
        console.log('📄 Mise à jour de contrat:', data);
        window.dispatchEvent(new CustomEvent('contract_update', { detail: data }));
      });

      // Gestion des mises à jour d'objets
      newSocket.on('object_update', (data) => {
        console.log('📦 Mise à jour d\'objet:', data);
        window.dispatchEvent(new CustomEvent('object_update', { detail: data }));
      });

      setSocket(newSocket);

      // Nettoyage lors du démontage
      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Déconnecter si l'utilisateur n'est plus authentifié
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Fonction pour envoyer un message
  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    } else {
      console.error('Socket non connecté');
      throw new Error('Socket non connecté');
    }
  };

  // Fonction pour rejoindre une conversation
  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', { conversationId });
    }
  };

  // Fonction pour quitter une conversation
  const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', { conversationId });
    }
  };

  // Fonction pour indiquer qu'on tape
  const startTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId });
    }
  };

  // Fonction pour arrêter l'indicateur de frappe
  const stopTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId });
    }
  };

  // Fonction pour marquer un message comme lu
  const markAsRead = (conversationId, messageId) => {
    if (socket && isConnected) {
      socket.emit('mark_as_read', { conversationId, messageId });
    }
  };

  // Fonction pour envoyer une notification
  const sendNotification = (notificationData) => {
    if (socket && isConnected) {
      socket.emit('send_notification', notificationData);
    }
  };

  // Fonction pour rejoindre une room spécifique
  const joinRoom = (roomName) => {
    if (socket && isConnected) {
      socket.emit('join_room', { roomName });
    }
  };

  // Fonction pour quitter une room
  const leaveRoom = (roomName) => {
    if (socket && isConnected) {
      socket.emit('leave_room', { roomName });
    }
  };

  // Fonction pour émettre un événement personnalisé
  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.error('Socket non connecté');
    }
  };

  // Fonction pour écouter un événement
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Fonction pour arrêter d'écouter un événement
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  // Fonction pour afficher une notification
  const showNotification = (notification) => {
    // Vérifier si les notifications sont autorisées
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        tag: notification.id
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Demander la permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: notification.icon || '/favicon.ico',
            tag: notification.id
          });
        }
      });
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markAsRead,
    sendNotification,
    joinRoom,
    leaveRoom,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;