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
  X,
  User,
  Clock,
  Check,
  CheckCheck,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../services/socketService';

const ChatInterface = ({ 
  conversationId, 
  recipient, 
  onClose, 
  isOpen = false 
}) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (conversationId && socket) {
      // Rejoindre la conversation
      socket.emit('join_conversation', { conversationId });
      
      // Charger les messages existants
      loadMessages();
      
      // Écouter les nouveaux messages
      socket.on('new_message', handleNewMessage);
      socket.on('typing_start', handleTypingStart);
      socket.on('typing_stop', handleTypingStop);
      socket.on('message_delivered', handleMessageDelivered);
      socket.on('message_read', handleMessageRead);
      
      return () => {
        socket.emit('leave_conversation', { conversationId });
        socket.off('new_message', handleNewMessage);
        socket.off('typing_start', handleTypingStart);
        socket.off('typing_stop', handleTypingStop);
        socket.off('message_delivered', handleMessageDelivered);
        socket.off('message_read', handleMessageRead);
      };
    }
  }, [conversationId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
    
    // Marquer comme lu si c'est notre conversation
    if (message.senderId !== user.id) {
      socket.emit('mark_as_read', { 
        conversationId, 
        messageId: message.id 
      });
    }
  };

  const handleTypingStart = (data) => {
    if (data.userId !== user.id) {
      setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
    }
  };

  const handleTypingStop = (data) => {
    setTypingUsers(prev => prev.filter(id => id !== data.userId));
  };

  const handleMessageDelivered = (data) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.messageId 
        ? { ...msg, status: 'delivered' }
        : msg
    ));
  };

  const handleMessageRead = (data) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.messageId 
        ? { ...msg, status: 'read' }
        : msg
    ));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const messageData = {
      conversationId,
      content: newMessage.trim(),
      attachments,
      type: 'text'
    };

    // Envoyer via socket
    socket.emit('send_message', messageData);

    // Ajouter le message localement (optimistic update)
    const tempMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: user.id,
      senderName: user.firstName,
      senderAvatar: user.avatar,
      timestamp: new Date().toISOString(),
      status: 'sending',
      attachments,
      type: 'text'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setAttachments([]);

    // Arrêter l'indicateur de frappe
    socket.emit('typing_stop', { conversationId });
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing_start', { conversationId });
      }
    } else {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing_stop', { conversationId });
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatus = (message) => {
    if (message.senderId !== user.id) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col"
      >
        {/* En-tête du chat */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
              {recipient?.avatar ? (
                <img 
                  src={recipient.avatar} 
                  alt={recipient.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{recipient?.name}</h3>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-500">
                  {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                    message.senderId === user.id ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {message.senderId !== user.id && (
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {message.senderAvatar ? (
                          <img 
                            src={message.senderAvatar} 
                            alt={message.senderName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    )}
                    
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.senderId === user.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id}>
                              {attachment.type === 'image' ? (
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name}
                                  className="max-w-full h-auto rounded-lg"
                                />
                              ) : (
                                <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{attachment.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        message.senderId === user.id ? 'text-white' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {getMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Indicateur de frappe */}
              <AnimatePresence>
                {typingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Pièces jointes */}
        {attachments.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="relative">
                  {attachment.type === 'image' ? (
                    <img 
                      src={attachment.url} 
                      alt={attachment.name}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone de saisie */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Tapez votre message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="1"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;
