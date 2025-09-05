import { api } from './api';

export const messageService = {
  // Obtenir les conversations de l'utilisateur
  getConversations: async (page = 1, limit = 20) => {
    const response = await api.get('/messages/conversations', {
      params: { page, limit }
    });
    return response.data;
  },

  // Obtenir les messages d'une conversation
  getConversation: async (userId, page = 1, limit = 50, before = null) => {
    const params = { page, limit };
    if (before) params.before = before;
    
    const response = await api.get(`/messages/conversation/${userId}`, { params });
    return response.data;
  },

  // Envoyer un message
  sendMessage: async (data) => {
    const response = await api.post('/messages/send', data);
    return response.data;
  },

  // Marquer un message comme lu
  markMessageAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // Marquer tous les messages d'une conversation comme lus
  markConversationAsRead: async (userId) => {
    const response = await api.put(`/messages/conversation/${userId}/read`);
    return response.data;
  },

  // Supprimer un message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Rechercher dans les messages
  searchMessages: async (query, userId = null, page = 1, limit = 20) => {
    const params = { q: query, page, limit };
    if (userId) params.userId = userId;
    
    const response = await api.get('/messages/search', { params });
    return response.data;
  },

  // Obtenir le nombre de messages non lus
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  }
};
