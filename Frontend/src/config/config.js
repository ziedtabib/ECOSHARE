// Configuration de l'application
export const config = {
  // URLs de l'API
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        me: '/auth/me',
        refresh: '/auth/refresh',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password',
        google: '/auth/google',
        facebook: '/auth/facebook',
        confirmEmail: '/auth/confirm-email',
        resendConfirmation: '/auth/resend-confirmation'
      },
      users: {
        // Routes publiques uniquement
        profile: '/users/profile',
        userStats: '/users/stats',
        publicProfile: '/users/:id',
        leaderboard: '/users/leaderboard'
      },
      profile: {
        // Routes CRUD du profil utilisateur
        get: '/profile',
        update: '/profile',
        uploadAvatar: '/profile/avatar',
        deleteAvatar: '/profile/avatar',
        changePassword: '/profile/password',
        stats: '/profile/stats',
        preferences: '/profile/preferences',
        public: '/profile/public/:id',
        delete: '/profile',
        // Nouvelles fonctionnalités
        resendVerification: '/profile/resend-verification',
        verifyEmail: '/profile/verify-email',
        sessions: '/profile/sessions',
        deleteSession: '/profile/sessions/:id',
        activity: '/profile/activity',
        export: '/profile/export',
        notifications: '/profile/notifications',
        markNotificationRead: '/profile/notifications/:id/read',
        analytics: '/profile/analytics'
      },
      objects: {
        list: '/objects',
        create: '/objects',
        get: '/objects/:id',
        update: '/objects/:id',
        delete: '/objects/:id',
        search: '/objects/search',
        reserve: '/objects/:id/reserve',
        unreserve: '/objects/:id/unreserve'
      },
      foods: {
        list: '/foods',
        create: '/foods',
        get: '/foods/:id',
        update: '/foods/:id',
        delete: '/foods/:id',
        search: '/foods/search',
        reserve: '/foods/:id/reserve',
        unreserve: '/foods/:id/unreserve'
      },
      associations: {
        list: '/associations',
        create: '/associations',
        get: '/associations/:id',
        update: '/associations/:id',
        delete: '/associations/:id',
        search: '/associations/search',
        follow: '/associations/:id/follow',
        unfollow: '/associations/:id/unfollow'
      },
      posts: {
        list: '/posts',
        create: '/posts',
        get: '/posts/:id',
        update: '/posts/:id',
        delete: '/posts/:id',
        search: '/posts/search',
        like: '/posts/:id/like',
        unlike: '/posts/:id/unlike',
        comment: '/posts/:id/comments',
        deleteComment: '/posts/:id/comments/:commentId'
      },
      ai: {
        detectObjects: '/ai/classify-object',
        detectFood: '/ai/classify-food',
        generateRecipes: '/ai/generate-recipes',
        classifyImage: '/ai/classify-object'
      },
      upload: {
        images: '/upload/images',
        documents: '/upload/documents'
      }
    }
  },

  // Configuration de l'authentification
  auth: {
    tokenKey: 'ecoshare_token',
    refreshTokenKey: 'ecoshare_refresh_token',
    userKey: 'ecoshare_user',
    tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutes
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '295846647263-a70jk385dne4p9hp824jc47gkuthu7hj.apps.googleusercontent.com', // Client ID ECOSHARE
    facebookAppId: process.env.REACT_APP_FACEBOOK_APP_ID || '756152150467988' // App ID ECOSHARE
  },

  // Configuration CAPTCHA
  captcha: {
    enabled: false, // Temporairement désactivé pour éviter les erreurs
    siteKey: process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Clé de test Google
    secretKey: process.env.REACT_APP_RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe' // Clé secrète de test
  },

  // Configuration des uploads
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxImagesPerUpload: 10
  },

  // Configuration de la pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100]
  },

  // Configuration des notifications
  notifications: {
    defaultDuration: 5000,
    maxNotifications: 5,
    position: 'top-right'
  },

  // Configuration de la recherche
  search: {
    debounceDelay: 300,
    minQueryLength: 2,
    maxSuggestions: 10,
    cacheExpiry: 5 * 60 * 1000 // 5 minutes
  },

  // Configuration des cartes
  maps: {
    defaultZoom: 13,
    maxZoom: 18,
    minZoom: 8,
    defaultCenter: {
      lat: 36.8065,
      lng: 10.1815
    },
    mapboxToken: process.env.REACT_APP_MAPBOX_TOKEN
  },

  // Configuration des catégories
  categories: {
    objects: [
      { value: 'electronics', label: 'Électronique', icon: '📱' },
      { value: 'furniture', label: 'Mobilier', icon: '🪑' },
      { value: 'clothing', label: 'Vêtements', icon: '👕' },
      { value: 'books', label: 'Livres', icon: '📚' },
      { value: 'sports', label: 'Sport', icon: '⚽' },
      { value: 'home', label: 'Maison & Jardin', icon: '🏠' },
      { value: 'tools', label: 'Outils', icon: '🔧' },
      { value: 'toys', label: 'Jouets', icon: '🧸' },
      { value: 'other', label: 'Autre', icon: '📦' }
    ],
    foods: [
      { value: 'vegetables', label: 'Légumes', icon: '🥕' },
      { value: 'fruits', label: 'Fruits', icon: '🍎' },
      { value: 'dairy', label: 'Produits laitiers', icon: '🥛' },
      { value: 'meat', label: 'Viande', icon: '🥩' },
      { value: 'fish', label: 'Poisson', icon: '🐟' },
      { value: 'grains', label: 'Céréales', icon: '🌾' },
      { value: 'baked_goods', label: 'Pâtisseries', icon: '🥖' },
      { value: 'prepared_meals', label: 'Plats préparés', icon: '🍽️' },
      { value: 'beverages', label: 'Boissons', icon: '🥤' },
      { value: 'other', label: 'Autre', icon: '🍴' }
    ],
    associations: [
      { value: 'food_bank', label: 'Banque alimentaire', icon: '🏪' },
      { value: 'shelter', label: 'Hébergement', icon: '🏠' },
      { value: 'education', label: 'Éducation', icon: '🎓' },
      { value: 'health', label: 'Santé', icon: '🏥' },
      { value: 'environment', label: 'Environnement', icon: '🌱' },
      { value: 'social', label: 'Social', icon: '🤝' }
    ]
  },

  // Configuration des conditions
  conditions: {
    objects: [
      { value: 'new', label: 'Neuf', color: 'green' },
      { value: 'like_new', label: 'Comme neuf', color: 'blue' },
      { value: 'good', label: 'Bon état', color: 'yellow' },
      { value: 'fair', label: 'État correct', color: 'orange' },
      { value: 'poor', label: 'Mauvais état', color: 'red' }
    ],
    foods: [
      { value: 'fresh', label: 'Frais', color: 'green' },
      { value: 'good', label: 'Bon état', color: 'blue' },
      { value: 'fair', label: 'État correct', color: 'yellow' },
      { value: 'expired', label: 'Expiré', color: 'red' }
    ]
  },

  // Configuration des niveaux d'urgence
  urgency: {
    levels: [
      { value: 'low', label: 'Faible', color: 'gray' },
      { value: 'medium', label: 'Moyen', color: 'yellow' },
      { value: 'high', label: 'Élevé', color: 'orange' },
      { value: 'critical', label: 'Critique', color: 'red' }
    ]
  },

  // Configuration des points et niveaux
  points: {
    levels: [
      { name: 'Bronze', min: 0, max: 99, color: '#CD7F32' },
      { name: 'Silver', min: 100, max: 299, color: '#C0C0C0' },
      { name: 'Gold', min: 300, max: 599, color: '#FFD700' },
      { name: 'Platinum', min: 600, max: 999, color: '#E5E4E2' },
      { name: 'Diamond', min: 1000, max: Infinity, color: '#B9F2FF' }
    ],
    rewards: {
      objectCreated: 10,
      foodCreated: 15,
      postCreated: 5,
      objectReserved: 5,
      foodReserved: 8,
      associationFollowed: 3,
      postLiked: 1,
      commentCreated: 2,
      profileCompleted: 20,
      firstLogin: 10
    }
  },

  // Configuration des métadonnées
  meta: {
    title: 'ECOSHARE Tunisie - Partagez, Réutilisez, Durable',
    description: 'Plateforme de partage d\'objets et d\'aliments en Tunisie pour promouvoir la durabilité et créer une communauté d\'entraide.',
    keywords: 'partage, réutilisation, durabilité, écologie, communauté, entraide, objets, aliments, Tunisie',
    author: 'ECOSHARE Tunisie',
    ogImage: '/og-image.jpg',
    twitterCard: 'summary_large_image'
  },

  // Configuration du développement
  development: {
    enableLogging: process.env.NODE_ENV === 'development',
    enableReduxDevTools: process.env.NODE_ENV === 'development',
    mockApi: process.env.REACT_APP_MOCK_API === 'true'
  }
};

// Fonctions utilitaires
export const getApiUrl = (endpoint, params = {}) => {
  let url = config.api.baseURL + endpoint;
  
  // Remplacer les paramètres dans l'URL
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem(config.auth.tokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserLevel = (points) => {
  return config.points.levels.find(level => 
    points >= level.min && points <= level.max
  ) || config.points.levels[0];
};

export const getCategoryIcon = (category, type) => {
  const categories = config.categories[type] || [];
  const found = categories.find(cat => cat.value === category);
  return found ? found.icon : '📦';
};

export const getCategoryLabel = (category, type) => {
  const categories = config.categories[type] || [];
  const found = categories.find(cat => cat.value === category);
  return found ? found.label : category;
};

export const getConditionColor = (condition, type) => {
  const conditions = config.conditions[type] || [];
  const found = conditions.find(cond => cond.value === condition);
  return found ? found.color : 'gray';
};

export const getUrgencyColor = (urgency) => {
  const found = config.urgency.levels.find(level => level.value === urgency);
  return found ? found.color : 'gray';
};

export default config;
