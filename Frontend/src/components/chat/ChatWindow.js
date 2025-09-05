import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Pin,
  Archive,
  Trash2,
  Block,
  UserPlus,
  Settings,
  X,
  MapPin,
  Image as ImageIcon,
  File,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { socketService } from '../../services/socketService';
import { messageService } from '../../services/api';

const ChatWindow = ({ conversation, onClose, isOpen }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (conversation && isOpen) {
      loadMessages();
      joinConversation();
    }

    return () => {
      if (conversation) {
        leaveConversation();
      }
    };
  }, [conversation, isOpen]);

  useEffect(() => {
    // Écouter les événements Socket.IO
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    const handleUserTyping = (data) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, data];
        });
      }
    };

    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    const handleMessagesRead = (data) => {
      // Mettre à jour le statut des messages comme lus
      setMessages(prev => prev.map(msg => {
        if (data.messageIds.includes(msg._id)) {
          return {
            ...msg,
            readBy: [...msg.readBy, { user: data.readBy, readAt: new Date() }]
          };
        }
        return msg;
      }));
    };

    if (socketService.socket) {
      socketService.socket.on('new_message', handleNewMessage);
      socketService.socket.on('user_typing', handleUserTyping);
      socketService.socket.on('user_stopped_typing', handleUserStoppedTyping);
      socketService.socket.on('messages_read', handleMessagesRead);

      return () => {
        socketService.socket.off('new_message', handleNewMessage);
        socketService.socket.off('user_typing', handleUserTyping);
        socketService.socket.off('user_stopped_typing', handleUserStoppedTyping);
        socketService.socket.off('messages_read', handleMessagesRead);
      };
    }
  }, [conversation, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversationMessages(conversation._id);
      setMessages(response.messages);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      setError('Erreur lors du chargement des messages');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = () => {
    if (socketService.socket) {
      socketService.socket.emit('join_conversation', { conversationId: conversation._id });
    }
  };

  const leaveConversation = () => {
    if (socketService.socket) {
      socketService.socket.emit('leave_conversation', { conversationId: conversation._id });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        conversationId: conversation._id,
        content: newMessage.trim(),
        type: 'text'
      };

      if (socketService.socket) {
        socketService.socket.emit('send_message', messageData);
      }

      setNewMessage('');
      stopTyping();
    } catch (error) {
      setError('Erreur lors de l\'envoi du message');
      console.error('Erreur:', error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      if (socketService.socket) {
        socketService.socket.emit('typing_start', { conversationId: conversation._id });
      }
    }

    // Arrêter l'indicateur de frappe après 3 secondes d'inactivité
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      if (socketService.socket) {
        socketService.socket.emit('typing_stop', { conversationId: conversation._id });
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Ici, vous implémenteriez l'upload de fichier
      console.log('Fichier sélectionné:', file);
    }
  };

  const getMessageStatus = (message) => {
    if (message.sender._id === user.id) {
      const readByOthers = message.readBy.filter(r => r.user._id !== user.id);
      if (readByOthers.length > 0) {
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      } else {
        return <Check className="w-4 h-4 text-gray-400" />;
      }
    }
    return null;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.sender._id === user.id;
    const isSystemMessage = message.type === 'system';

    if (isSystemMessage) {
      return (
        <div key={message._id} className="flex justify-center my-2">
          <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <motion.div
        key={message._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {!isOwnMessage && (
            <div className="flex-shrink-0 mr-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {message.sender.avatar ? (
                  <img
                    src={message.sender.avatar}
                    alt={message.sender.firstName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {message.sender.firstName[0]}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Message */}
          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            {/* Nom de l'expéditeur */}
            {!isOwnMessage && (
              <span className="text-xs text-gray-500 mb-1">
                {message.sender.firstName} {message.sender.lastName}
              </span>
            )}

            {/* Contenu du message */}
            <div
              className={`px-4 py-2 rounded-lg ${
                isOwnMessage
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {message.type === 'text' && (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              
              {message.type === 'image' && (
                <div className="max-w-xs">
                  <img
                    src={message.metadata.image.url}
                    alt={message.metadata.image.alt || 'Image'}
                    className="rounded-lg"
                  />
                </div>
              )}
              
              {message.type === 'file' && (
                <div className="flex items-center space-x-2">
                  <File className="w-4 h-4" />
                  <span className="text-sm">{message.metadata.file.originalName}</span>
                </div>
              )}
              
              {message.type === 'location' && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{message.metadata.location.address}</span>
                </div>
              )}
            </div>

            {/* Métadonnées du message */}
            <div className={`flex items-center space-x-1 mt-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-xs text-gray-500">
                {formatMessageTime(message.createdAt)}
              </span>
              {getMessageStatus(message)}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
      >
        {/* En-tête de la conversation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {conversation.participants.find(p => p._id !== user.id)?.avatar ? (
                <img
                  src={conversation.participants.find(p => p._id !== user.id).avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {conversation.participants.find(p => p._id !== user.id)?.firstName[0]}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {conversation.title || 
                 conversation.participants.find(p => p._id !== user.id)?.firstName + ' ' +
                 conversation.participants.find(p => p._id !== user.id)?.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {conversation.participants.length} participant{conversation.participants.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowConversationMenu(!showConversationMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              {messages.map(renderMessage)}
              
              {/* Indicateur de frappe */}
              <AnimatePresence>
                {typingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center space-x-2 text-gray-500 text-sm"
                  >
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>
                      {typingUsers.map(u => u.user.firstName).join(', ')} {typingUsers.length === 1 ? 'tape' : 'tapent'}...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Zone de saisie */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Tapez votre message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Menu des pièces jointes */}
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photo</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <File className="w-4 h-4" />
                  <span>Fichier</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span>Localisation</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Menu de la conversation */}
        <AnimatePresence>
          {showConversationMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48"
            >
              <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
                <span>Rechercher</span>
              </button>
              <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Pin className="w-4 h-4" />
                <span>Épingler</span>
              </button>
              <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Archive className="w-4 h-4" />
                <span>Archiver</span>
              </button>
              <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Block className="w-4 h-4" />
                <span>Bloquer</span>
              </button>
              <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span>Paramètres</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ChatWindow;