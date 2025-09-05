import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import config from '../config/config';

// Configuration d'axios
const API_BASE_URL = config.api.baseURL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('ecoshare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      Cookies.remove('ecoshare_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// État initial
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// Actions
const authActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.LOGIN_START:
    case authActions.REGISTER_START:
    case authActions.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case authActions.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.payload.requiresEmailConfirmation ? false : true,
        user: action.payload.user || null,
        token: action.payload.token || null,
        error: null,
      };

    case authActions.LOAD_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };

    case authActions.LOGIN_FAILURE:
    case authActions.REGISTER_FAILURE:
    case authActions.LOAD_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case authActions.LOGOUT:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };

    case authActions.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case authActions.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Contexte
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fonction pour charger l'utilisateur
  const loadUser = useCallback(async () => {
    try {
      dispatch({ type: authActions.LOAD_USER_START });
      
      const response = await api.get(config.api.endpoints.profile.get);
      
      dispatch({
        type: authActions.LOAD_USER_SUCCESS,
        payload: response.data.profile,
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      dispatch({
        type: authActions.LOAD_USER_FAILURE,
        payload: error.response?.data?.message || 'Erreur de connexion',
      });
    }
  }, []);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const token = Cookies.get('ecoshare_token');
    if (token) {
      loadUser();
    } else {
      dispatch({ type: authActions.LOAD_USER_FAILURE });
    }
  }, [loadUser]);

  // Fonction de connexion
  const login = useCallback(async (email, password, captchaToken = null) => {
    try {
      dispatch({ type: authActions.LOGIN_START });

      const loginData = {
        email,
        password,
      };

      // Ajouter le CAPTCHA si fourni
      if (captchaToken) {
        loginData.captchaToken = captchaToken;
      }

      const response = await api.post(config.api.endpoints.auth.login, loginData);

      const { token, user } = response.data;

      // Sauvegarder le token dans les cookies
      Cookies.set('ecoshare_token', token, { 
        expires: 7, // 7 jours
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { token, user },
      });

      toast.success(`Bienvenue ${user.firstName} ! 🌱`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  // Fonction d'inscription
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: authActions.REGISTER_START });

      const response = await api.post(config.api.endpoints.auth.register, userData);

      const { requiresEmailConfirmation, email } = response.data;

      if (requiresEmailConfirmation) {
        dispatch({
          type: authActions.REGISTER_SUCCESS,
          payload: { 
            message: 'Compte créé avec succès ! Vérifiez votre email pour activer votre compte.',
            requiresEmailConfirmation: true,
            email: email,
            user: null,
            token: null
          },
        });
        toast.success('Compte créé ! Vérifiez votre email pour l\'activer.');
        return { success: true, requiresEmailConfirmation: true, email: email };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      dispatch({
        type: authActions.REGISTER_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      await api.post(config.api.endpoints.auth.logout);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer le token des cookies
      Cookies.remove('ecoshare_token');
      
      dispatch({ type: authActions.LOGOUT });
      toast.success('Déconnexion réussie');
    }
  }, [dispatch]);

  // Fonction pour mettre à jour le profil utilisateur
  const updateProfile = useCallback(async (userData) => {
    try {
      const response = await api.put(config.api.endpoints.profile.update, userData);
      
      dispatch({
        type: authActions.UPDATE_USER,
        payload: response.data.profile,
      });

      toast.success('Profil mis à jour avec succès');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  // Fonction pour réinitialiser le mot de passe
  const forgotPassword = useCallback(async (email) => {
    try {
      await api.post(config.api.endpoints.auth.forgotPassword, { email });
      toast.success('Email de réinitialisation envoyé');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fonction pour réinitialiser le mot de passe
  const resetPassword = useCallback(async (code, email, password) => {
    try {
      await api.post(config.api.endpoints.auth.resetPassword, { code, email, password });
      toast.success('Mot de passe réinitialisé avec succès');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la réinitialisation';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fonction pour effacer les erreurs
  const clearErrors = useCallback(() => {
    dispatch({ type: authActions.CLEAR_ERRORS });
  }, [dispatch]);

  // Fonction d'authentification Google
  const googleAuth = useCallback(async (credential) => {
    try {
      dispatch({ type: authActions.LOGIN_START });

      const response = await api.post(config.api.endpoints.auth.google, { credential });
      const { token, user } = response.data;

      // Sauvegarder le token dans les cookies
      Cookies.set('ecoshare_token', token, { 
        expires: 7, // 7 jours
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { token, user },
      });

      toast.success(`Bienvenue ${user.firstName} ! 🌱`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion Google';
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  // Fonction d'authentification Facebook
  const facebookAuth = useCallback(async (accessToken) => {
    try {
      dispatch({ type: authActions.LOGIN_START });

      const response = await api.post(config.api.endpoints.auth.facebook, { accessToken });
      const { token, user } = response.data;

      // Sauvegarder le token dans les cookies
      Cookies.set('ecoshare_token', token, { 
        expires: 7, // 7 jours
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { token, user },
      });

      toast.success(`Bienvenue ${user.firstName} ! 🌱`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion Facebook';
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  // Fonction de confirmation d'email
  const confirmEmail = useCallback(async (code, email) => {
    try {
      const response = await api.post(config.api.endpoints.auth.confirmEmail, { code, email });
      
      toast.success('Compte activé avec succès ! Vous pouvez maintenant vous connecter.');
      return { success: true, message: response.data.message, autoLogin: false };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la confirmation';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fonction de renvoi de confirmation d'email
  const resendConfirmation = useCallback(async (email) => {
    try {
      const response = await api.post(config.api.endpoints.auth.resendConfirmation, { email });
      
      toast.success('Email de confirmation renvoyé !');
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du renvoi';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    loadUser, // Exposer la fonction loadUser
    updateProfile,
    forgotPassword,
    resetPassword,
    clearErrors,
    googleAuth,
    facebookAuth,
    confirmEmail,
    resendConfirmation,
    api, // Exposer l'instance axios configurée
  }), [
    state,
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    forgotPassword,
    resetPassword,
    clearErrors,
    googleAuth,
    facebookAuth,
    confirmEmail,
    resendConfirmation
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;
