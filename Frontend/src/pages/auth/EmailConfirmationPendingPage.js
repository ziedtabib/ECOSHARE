import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { authService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const EmailConfirmationPendingPage = () => {
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  
  const email = location.state?.email || localStorage.getItem('pending_confirmation_email');

  const resendConfirmationEmail = async () => {
    if (!email) {
      setMessage('Email non trouvé. Veuillez vous réinscrire.');
      return;
    }

    try {
      setIsResending(true);
      setMessage('');
      
      await authService.resendConfirmationEmail(email);
      setMessage('Email de confirmation renvoyé ! Vérifiez votre boîte de réception.');
    } catch (error) {
      console.error('Erreur lors du renvoi:', error);
      setMessage(error.response?.data?.message || 'Erreur lors du renvoi de l\'email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center">
          {/* Icône */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Mail className="h-16 w-16 text-blue-500" />
              <Clock className="h-6 w-6 text-blue-600 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Confirmez votre email
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {location.state?.message || 'Un email de confirmation a été envoyé à votre adresse email.'}
          </p>

          {email && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Email :</strong> {email}
              </p>
            </div>
          )}

          {/* Message de statut */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-4 mb-6 ${
                message.includes('renvoyé') 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="text-sm">{message}</p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={resendConfirmationEmail}
              disabled={isResending}
              className="btn-primary btn w-full"
            >
              {isResending ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Envoi en cours...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renvoyer l'email
                </>
              )}
            </button>

            <Link
              to="/auth/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Instructions
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">1.</span>
              Vérifiez votre boîte de réception
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">2.</span>
              Cliquez sur le lien de confirmation dans l'email
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">3.</span>
              Vérifiez votre dossier spam si nécessaire
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">4.</span>
              Une fois confirmé, vous pourrez vous connecter
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Problème ? Contactez le{' '}
            <a href="mailto:support@ecoshare.app" className="text-primary-600 hover:underline">
              support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailConfirmationPendingPage;
