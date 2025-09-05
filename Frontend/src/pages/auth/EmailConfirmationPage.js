import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const EmailConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');
  const { confirmEmail } = useAuth();

  const token = searchParams.get('token');

  const handleEmailConfirmation = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await confirmEmail(token);
      if (result.success) {
        setConfirmationStatus('success');
        setMessage('Votre email a été confirmé avec succès !');
      } else {
        setConfirmationStatus('error');
        setMessage(result.error || 'Erreur lors de la confirmation');
      }
    } catch (error) {
      setConfirmationStatus('error');
      setMessage('Erreur lors de la confirmation de l\'email');
    } finally {
      setIsLoading(false);
    }
  }, [token, confirmEmail]);

  useEffect(() => {
    if (token) {
      handleEmailConfirmation();
    } else {
      setConfirmationStatus('error');
      setMessage('Token de confirmation manquant');
    }
  }, [token, handleEmailConfirmation]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center space-y-6">
          <LoadingSpinner size="lg" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirmation en cours...
            </h2>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous confirmons votre email.
            </p>
          </div>
        </div>
      );
    }

    if (confirmationStatus === 'success') {
      return (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email confirmé ! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Vous pouvez maintenant accéder à toutes les fonctionnalités d'ECOSHARE.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
            >
              <span>Accéder au tableau de bord</span>
            </Link>
            
            <Link
              to="/"
              className="text-primary-600 hover:text-primary-700 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
          </div>
        </div>
      );
    }

    if (confirmationStatus === 'error') {
      return (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Erreur de confirmation
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Le lien de confirmation peut être expiré ou invalide.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/auth/login"
              className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
            >
              <span>Se connecter</span>
            </Link>
            
            <Link
              to="/auth/register"
              className="text-primary-600 hover:text-primary-700 flex items-center justify-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Créer un nouveau compte</span>
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🌱 ECOSHARE
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Confirmation d'email
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;