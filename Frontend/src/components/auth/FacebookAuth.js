import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config/config';

const FacebookAuth = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  const loadFacebookSDK = useCallback(() => {
    // Vérifier si le SDK est déjà chargé
    if (window.FB) {
      setIsSDKLoaded(true);
      return;
    }

    // Vérifier si l'App ID Facebook est configuré
    const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID || config.auth.facebookAppId;
    if (!facebookAppId) {
      console.warn('REACT_APP_FACEBOOK_APP_ID non configuré');
      setIsSDKLoaded(false);
      if (onError) {
        onError('Configuration Facebook manquante');
      }
      return;
    }

    // Vérifier si le script est déjà en cours de chargement
    if (document.querySelector('script[src*="connect.facebook.net"]')) {
      return;
    }

    // Créer le script pour charger le SDK Facebook
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/fr_FR/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      try {
        // Initialiser le SDK Facebook
        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
          status: false, // Ne pas vérifier automatiquement le statut de connexion
          autoLogAppEvents: false, // Désactiver les événements automatiques
          oauth: true, // Activer OAuth pour éviter les conflits de tokens
          useCachedAccessToken: false // Ne pas utiliser de token en cache
        });

        console.log('SDK Facebook initialisé avec succès');
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du SDK Facebook:', error);
        setIsSDKLoaded(false);
        if (onError) {
          onError('Erreur lors de l\'initialisation du SDK Facebook');
        }
      }
    };

    script.onerror = (error) => {
      console.error('Erreur lors du chargement du SDK Facebook:', error);
      setIsSDKLoaded(false);
      if (onError) {
        onError('Impossible de charger le SDK Facebook. Vérifiez votre connexion internet.');
      }
    };

    document.head.appendChild(script);
  }, [onError]);

  useEffect(() => {
    // Charger le SDK Facebook
    loadFacebookSDK();
  }, [loadFacebookSDK]);

  const handleFacebookLogin = () => {
    if (!isSDKLoaded || !window.FB) {
      console.error('SDK Facebook non chargé');
      if (onError) {
        onError('SDK Facebook non disponible. Veuillez réessayer.');
      }
      return;
    }

    // Vérifier s'il y a déjà un token d'accès et le supprimer si nécessaire
    if (window.FB.getAccessToken) {
      try {
        const currentToken = window.FB.getAccessToken();
        if (currentToken) {
          console.log('Token d\'accès existant détecté, suppression...');
          window.FB.logout();
        }
      } catch (error) {
        console.warn('Impossible de vérifier le token d\'accès existant:', error);
      }
    }

    setIsLoading(true);

    try {
      // Ouvrir la popup de connexion Facebook
      window.FB.login((response) => {
        if (response.authResponse) {
          // L'utilisateur s'est connecté avec succès
          handleFacebookResponse(response.authResponse);
        } else {
          // L'utilisateur a annulé la connexion ou erreur
          setIsLoading(false);
          if (response.error) {
            console.error('Erreur Facebook:', response.error);
            if (onError) {
              onError(`Erreur Facebook: ${response.error.message || 'Erreur inconnue'}`);
            }
          } else {
            if (onError) {
              onError('Connexion Facebook annulée');
            }
          }
        }
      }, {
        scope: 'email,public_profile',
        return_scopes: true
      });
    } catch (error) {
      console.error('Erreur lors de l\'appel Facebook login:', error);
      setIsLoading(false);
      if (onError) {
        onError('Erreur lors de l\'ouverture de la connexion Facebook');
      }
    }
  };

  const handleFacebookResponse = async (authResponse) => {
    try {
      // Obtenir les informations de l'utilisateur en passant le token directement
      window.FB.api('/me', { 
        fields: 'id,name,email,picture',
        access_token: authResponse.accessToken
      }, async (userInfo) => {
        try {
          if (userInfo.error) {
            throw new Error(`Erreur API Facebook: ${userInfo.error.message || 'Erreur inconnue'}`);
          }
          const facebookData = {
            accessToken: authResponse.accessToken,
            userID: authResponse.userID,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture?.data?.url,
            expiresIn: authResponse.expiresIn
          };

          // Envoyer les données au backend
          const response = await fetch(`${config.api.baseURL}/auth/facebook`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(facebookData)
          });

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();

          if (data.success) {
            // Stocker le token dans les cookies (comme le reste de l'application)
            Cookies.set('ecoshare_token', data.token, { 
              expires: 7, // 7 jours
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });

            // Recharger l'utilisateur dans le contexte d'authentification
            await loadUser();

            // Appeler la fonction de succès
            if (onSuccess) {
              onSuccess(data.user);
            }

            // Rediriger vers le dashboard
            navigate('/dashboard');
          } else {
            throw new Error(data.message || 'Erreur lors de la connexion Facebook');
          }
        } catch (error) {
          console.error('Erreur lors de la connexion Facebook:', error);
          if (onError) {
            onError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des informations Facebook:', error);
      setIsLoading(false);
      if (onError) {
        onError('Erreur lors de la récupération des informations');
      }
    }
  };

  // Ne pas afficher le composant si l'App ID Facebook n'est pas configuré
  const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID || config.auth.facebookAppId;
  if (!facebookAppId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleFacebookLogin}
        disabled={!isSDKLoaded || isLoading}
        className="w-full flex items-center justify-center space-x-3 bg-[#1877F2] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )}
        <span>
          {isLoading ? 'Connexion...' : 'Continuer avec Facebook'}
        </span>
      </button>

      {!isSDKLoaded && (
        <p className="text-sm text-gray-500 text-center">
          Chargement du SDK Facebook...
        </p>
      )}
    </div>
  );
};

export default FacebookAuth;