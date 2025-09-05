import axios from 'axios';
import config, { getApiUrl } from '../config/config';

// Fonction utilitaire pour récupérer le token d'authentification
export const getAuthToken = () => {
  // Essayer d'abord les cookies
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('ecoshare_token='))
    ?.split('=')[1];
  
  // Sinon essayer localStorage
  const localToken = localStorage.getItem('ecoshare_token');
  
  return cookieToken || localToken;
};

// Configuration d'axios
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et qu'on n'a pas déjà tenté de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('ecoshare_refresh_token');
        if (refreshToken) {
          const response = await axios.post(getApiUrl(config.api.endpoints.auth.refresh), {
            refreshToken
          });

          const { token } = response.data;
          localStorage.setItem('ecoshare_token', token);

          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('ecoshare_token');
        localStorage.removeItem('ecoshare_refresh_token');
        localStorage.removeItem('ecoshare_user');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (credentials) => {
    const response = await api.post(config.api.endpoints.auth.login, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(config.api.endpoints.auth.register, userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(config.api.endpoints.auth.logout);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get(config.api.endpoints.auth.me);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post(config.api.endpoints.auth.forgotPassword, { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(config.api.endpoints.auth.resetPassword, { token, password });
    return response.data;
  },

  googleAuth: async (token) => {
    const response = await api.post(config.api.endpoints.auth.google, { token });
    return response.data;
  },

  facebookAuth: async (token) => {
    const response = await api.post(config.api.endpoints.auth.facebook, { token });
    return response.data;
  },

  confirmEmail: async (token) => {
    try {
      const response = await api.post(config.api.endpoints.auth.confirmEmail, { token });
      return response.data;
    } catch (error) {
      // Mock pour le développement - simuler une confirmation réussie
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock: Email confirmation successful for token:', token);
        return { 
          message: 'Votre email a été confirmé avec succès !',
          success: true 
        };
      }
      throw error;
    }
  },

  resendConfirmationEmail: async (email) => {
    try {
      const response = await api.post(config.api.endpoints.auth.resendConfirmation, { email });
      return response.data;
    } catch (error) {
      // Mock pour le développement - simuler un renvoi réussi
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock: Resend confirmation email to:', email);
        return { 
          message: 'Email de confirmation renvoyé !',
          success: true 
        };
      }
      throw error;
    }
  },

};

// Services des utilisateurs (CRUD complet)
// Services des utilisateurs (fonctions publiques uniquement)
export const userService = {
  // Obtenir le profil de l'utilisateur connecté
  getProfile: async () => {
    const response = await api.get(config.api.endpoints.profile.get);
    return response.data;
  },

  // Obtenir les statistiques de l'utilisateur connecté
  getUserStats: async () => {
    const response = await api.get(config.api.endpoints.users.userStats);
    return response.data;
  },

  // Obtenir le profil public d'un utilisateur
  getPublicProfile: async (id) => {
    const response = await api.get(getApiUrl(config.api.endpoints.users.publicProfile, { id }));
    return response.data;
  },

  // Obtenir le classement des utilisateurs
  getLeaderboard: async (params = {}) => {
    const response = await api.get(config.api.endpoints.users.leaderboard, { params });
    return response.data;
  }
};

// Services du profil utilisateur (CRUD complet)
export const profileService = {
  // Obtenir le profil complet de l'utilisateur connecté
  getProfile: async () => {
    const response = await api.get(config.api.endpoints.profile.get);
    return response.data;
  },

  // Mettre à jour le profil de l'utilisateur connecté
  updateProfile: async (profileData) => {
    const response = await api.put(config.api.endpoints.profile.update, profileData);
    return response.data;
  },

  // Uploader un avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post(config.api.endpoints.profile.uploadAvatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Supprimer l'avatar
  deleteAvatar: async () => {
    const response = await api.delete(config.api.endpoints.profile.deleteAvatar);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    const response = await api.put(config.api.endpoints.profile.changePassword, passwordData);
    return response.data;
  },

  // Obtenir les statistiques du profil
  getProfileStats: async () => {
    const response = await api.get(config.api.endpoints.profile.stats);
    return response.data;
  },

  // Mettre à jour les préférences
  updatePreferences: async (preferences) => {
    const response = await api.put(config.api.endpoints.profile.preferences, preferences);
    return response.data;
  },

  // Obtenir le profil public d'un utilisateur
  getPublicProfile: async (userId) => {
    const response = await api.get(getApiUrl(config.api.endpoints.profile.public, { id: userId }));
    return response.data;
  },

  // Supprimer le compte
  deleteAccount: async (confirmationData) => {
    const response = await api.delete(config.api.endpoints.profile.delete, { data: confirmationData });
    return response.data;
  },

  // ==================== NOUVELLES FONCTIONNALITÉS ====================

  // Renvoyer l'email de vérification
  resendVerification: async () => {
    const response = await api.post(config.api.endpoints.profile.resendVerification);
    return response.data;
  },

  // Vérifier l'email avec le code
  verifyEmail: async (code) => {
    const response = await api.post(config.api.endpoints.profile.verifyEmail, { code });
    return response.data;
  },

  // Obtenir les sessions actives
  getSessions: async () => {
    const response = await api.get(config.api.endpoints.profile.sessions);
    return response.data;
  },

  // Terminer une session
  deleteSession: async (sessionId) => {
    const response = await api.delete(getApiUrl(config.api.endpoints.profile.deleteSession, { id: sessionId }));
    return response.data;
  },

  // Obtenir l'historique des activités
  getActivity: async (params = {}) => {
    const response = await api.get(config.api.endpoints.profile.activity, { params });
    return response.data;
  },

  // Exporter les données personnelles (RGPD)
  exportData: async () => {
    const response = await api.get(config.api.endpoints.profile.export);
    return response.data;
  },

  // Obtenir les notifications
  getNotifications: async (params = {}) => {
    const response = await api.get(config.api.endpoints.profile.notifications, { params });
    return response.data;
  },

  // Marquer une notification comme lue
  markNotificationRead: async (notificationId) => {
    const response = await api.put(getApiUrl(config.api.endpoints.profile.markNotificationRead, { id: notificationId }));
    return response.data;
  },

  // Obtenir les analytics avancées
  getAnalytics: async () => {
    const response = await api.get(config.api.endpoints.profile.analytics);
    return response.data;
  }
};

// Services des objets
export const objectService = {
  getObjects: async (params = {}) => {
    const response = await api.get(config.api.endpoints.objects.list, { params });
    return response.data;
  },

  getObject: async (id) => {
    const response = await api.get(getApiUrl(config.api.endpoints.objects.get, { id }));
    return response.data;
  },

  createObject: async (objectData) => {
    const response = await api.post(config.api.endpoints.objects.create, objectData);
    return response.data;
  },

  updateObject: async (id, objectData) => {
    const response = await api.put(getApiUrl(config.api.endpoints.objects.update, { id }), objectData);
    return response.data;
  },

  deleteObject: async (id) => {
    const response = await api.delete(getApiUrl(config.api.endpoints.objects.delete, { id }));
    return response.data;
  },

  searchObjects: async (query, filters = {}) => {
    const response = await api.get(config.api.endpoints.objects.search, {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  reserveObject: async (id) => {
    const response = await api.post(getApiUrl(config.api.endpoints.objects.reserve, { id }));
    return response.data;
  },

  unreserveObject: async (id) => {
    const response = await api.post(getApiUrl(config.api.endpoints.objects.unreserve, { id }));
    return response.data;
  }
};

// Services des aliments
export const foodService = {
  getFoods: async (params = {}) => {
    const response = await api.get(config.api.endpoints.foods.list, { params });
    return response.data;
  },

  getFood: async (id) => {
    const response = await api.get(getApiUrl(config.api.endpoints.foods.get, { id }));
    return response.data;
  },

  createFood: async (foodData) => {
    const response = await api.post(config.api.endpoints.foods.create, foodData);
    return response.data;
  },

  updateFood: async (id, foodData) => {
    const response = await api.put(getApiUrl(config.api.endpoints.foods.update, { id }), foodData);
    return response.data;
  },

  deleteFood: async (id) => {
    const response = await api.delete(getApiUrl(config.api.endpoints.foods.delete, { id }));
    return response.data;
  },

  searchFoods: async (query, filters = {}) => {
    const response = await api.get(config.api.endpoints.foods.search, {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  reserveFood: async (id) => {
    const response = await api.post(getApiUrl(config.api.endpoints.foods.reserve, { id }));
    return response.data;
  },

  unreserveFood: async (id) => {
    const response = await api.post(getApiUrl(config.api.endpoints.foods.unreserve, { id }));
    return response.data;
  }
};

// Services des associations
export const associationService = {
  getAssociations: async (params = {}) => {
    const response = await api.get(config.api.endpoints.associations.list, { params });
    return response.data;
  },

  getAssociation: async (id) => {
    const response = await api.get(getApiUrl(config.api.endpoints.associations.get, { id }));
    return response.data;
  },

  createAssociation: async (associationData, logoFile = null) => {
    const formData = new FormData();
    
    // Ajouter toutes les données de l'association
    Object.keys(associationData).forEach(key => {
      if (key === 'address' || key === 'contact') {
        // Pour les objets imbriqués, les convertir en JSON
        formData.append(key, JSON.stringify(associationData[key]));
      } else if (Array.isArray(associationData[key])) {
        // Pour les tableaux, les convertir en JSON
        formData.append(key, JSON.stringify(associationData[key]));
      } else {
        formData.append(key, associationData[key]);
      }
    });
    
    // Ajouter le fichier logo s'il existe
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    
    const response = await api.post(config.api.endpoints.associations.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateAssociation: async (id, associationData) => {
    const response = await api.put(getApiUrl(config.api.endpoints.associations.update, { id }), associationData);
    return response.data;
  },

  deleteAssociation: async (id) => {
    const response = await api.delete(getApiUrl(config.api.endpoints.associations.delete, { id }));
    return response.data;
  },

  searchAssociations: async (query, filters = {}) => {
    const response = await api.get(config.api.endpoints.associations.search, {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  followAssociation: async (id) => {
    const response = await api.post(getApiUrl(config.api.endpoints.associations.follow, { id }));
    return response.data;
  },

  unfollowAssociation: async (id) => {
    const response = await api.post(getApiUrl(config.api.endpoints.associations.unfollow, { id }));
    return response.data;
  }
};

// Services des publications
export const postService = {
  getPosts: async (params = {}) => {
    const response = await api.get(config.api.endpoints.posts.list, { params });
    return response.data;
  },

  getPost: async (id) => {
    const response = await api.get(getApiUrl(config.api.endpoints.posts.get, { id }));
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post(config.api.endpoints.posts.create, postData);
    return response.data;
  },

  updatePost: async (id, postData) => {
    const response = await api.put(getApiUrl(config.api.endpoints.posts.update, { id }), postData);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(getApiUrl(config.api.endpoints.posts.delete, { id }));
    return response.data;
  },

  searchPosts: async (query, filters = {}) => {
    const response = await api.get(config.api.endpoints.posts.search, {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  likePost: async (id) => {
    const response = await api.post(getApiUrl(config.api.endpoints.posts.like, { id }));
    return response.data;
  },

  unlikePost: async (id) => {
    const response = await api.post(getApiUrl(config.api.endpoints.posts.unlike, { id }));
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(getApiUrl(config.api.endpoints.posts.comment, { id }), { comment });
    return response.data;
  },

  deleteComment: async (postId, commentId) => {
    const response = await api.delete(getApiUrl(config.api.endpoints.posts.deleteComment, { id: postId, commentId }));
    return response.data;
  }
};


// Services IA
export const aiService = {
  detectObjects: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(config.api.endpoints.ai.detectObjects, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  detectFood: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(config.api.endpoints.ai.detectFood, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  generateRecipes: async (ingredients) => {
    const response = await api.post(config.api.endpoints.ai.generateRecipes, { ingredients });
    return response.data;
  },

  classifyImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(config.api.endpoints.ai.classifyImage, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Services d'upload
export const uploadService = {
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });
    
    const response = await api.post(config.api.endpoints.upload.images, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  uploadDocuments: async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`documents`, file);
    });
    
    const response = await api.post(config.api.endpoints.upload.documents, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Service de recherche global
export const searchService = {
  globalSearch: async (query, filters = {}) => {
    const response = await api.get('/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  }
};

export { api };
export default api;
