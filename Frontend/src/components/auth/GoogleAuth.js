import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config/config';

const GoogleAuth = ({ onSuccess, onError, disabled = false }) => {
  const { googleAuth } = useAuth();
  const googleButtonRef = useRef(null);

  const handleCredentialResponse = useCallback((response) => {
    if (!googleAuth) {
      console.error('googleAuth function not available in context');
      if (onError) onError('Google Auth non disponible');
      return;
    }

    // Appeler googleAuth de manière asynchrone
    googleAuth(response.credential)
      .then(result => {
        if (result.success && onSuccess) {
          onSuccess(result);
        } else if (onError) {
          onError(result.error || 'Erreur de connexion Google');
        }
      })
      .catch(error => {
        console.error('Erreur Google Auth:', error);
        if (onError) {
          onError('Erreur lors de la connexion Google');
        }
      });
  }, [googleAuth, onSuccess, onError]);

  useEffect(() => {
    const currentGoogleButtonRef = googleButtonRef.current;
    
    // Charger le script Google Identity Services
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleAuth();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Erreur lors du chargement du script Google');
        if (onError) onError('Impossible de charger Google Auth');
      };
      document.head.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      if (!window.google || !config.auth.googleClientId || !googleButtonRef.current) {
        return;
      }

      // Vérifier si Google Auth est déjà initialisé
      if (window.google.accounts.id._initialized) {
        return;
      }

      try {
        // Initialiser Google Auth
        window.google.accounts.id.initialize({
          client_id: config.auth.googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de Google Auth:', error);
        return;
      }

      // Vérifier si le bouton n'est pas déjà rendu
      if (googleButtonRef.current && googleButtonRef.current.children.length === 0) {
        // Rendre le bouton Google avec un style personnalisé
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 300, // Utiliser une largeur fixe au lieu de '100%'
          text: 'continue_with',
          shape: 'rectangular'
        });
      }

      // Appliquer des styles personnalisés au bouton Google
      setTimeout(() => {
        if (googleButtonRef.current) {
          const googleButton = googleButtonRef.current.querySelector('div[role="button"]');
          if (googleButton) {
          // Appliquer les mêmes styles que le bouton Facebook
          googleButton.style.cssText = `
            width: 100% !important;
            height: 48px !important;
            border: 1px solid #d1d5db !important;
            border-radius: 8px !important;
            background-color: white !important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            color: #374151 !important;
            transition: background-color 0.2s !important;
            cursor: pointer !important;
          `;
          
          // Ajouter l'effet hover
          googleButton.addEventListener('mouseenter', () => {
            googleButton.style.backgroundColor = '#f9fafb';
          });
          
          googleButton.addEventListener('mouseleave', () => {
            googleButton.style.backgroundColor = 'white';
          });
          }
        }
      }, 100);
    };

    loadGoogleScript();

    return () => {
      // Nettoyage si nécessaire
      if (currentGoogleButtonRef) {
        currentGoogleButtonRef.innerHTML = '';
      }
    };
  }, [googleAuth, onSuccess, onError, handleCredentialResponse]);

  if (!config.auth.googleClientId) {
    return (
      <div className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-sm font-medium text-gray-500">
        Google Auth non configuré
      </div>
    );
  }

  return (
    <div 
      ref={googleButtonRef}
      className="w-full"
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    />
  );
};

export default GoogleAuth;
