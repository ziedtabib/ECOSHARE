import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const EmailConfirmationCodePage = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { confirmEmail, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer l'email depuis l'état de navigation ou les paramètres
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Le code doit contenir exactement 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await confirmEmail(code, email);
      if (result.success) {
        setSuccess(true);
        if (result.autoLogin) {
          // Connexion automatique réussie, rediriger vers le dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // Juste confirmation, rediriger vers la connexion
          setTimeout(() => {
            navigate('/auth/login');
          }, 2000);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erreur lors de la confirmation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await resendConfirmation(email);
      if (result.success) {
        setError('');
        // Afficher un message de succès temporaire
        const originalError = error;
        setError('Code renvoyé avec succès !');
        setTimeout(() => setError(originalError), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erreur lors du renvoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Seulement les chiffres
    if (value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              🌱 ECOSHARE
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Confirmation réussie
            </p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Email confirmé ! 🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  Votre compte a été activé avec succès.
                </p>
                <p className="text-sm text-gray-500">
                  Redirection vers la page de connexion...
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Vérifiez votre email
              </h2>
              <p className="text-gray-600">
                Nous avons envoyé un code de confirmation à 6 chiffres à :
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {email}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code de confirmation
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  maxLength={6}
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Entrez le code à 6 chiffres reçu par email
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <X className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Confirmer mon email'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous n'avez pas reçu le code ?
              </p>
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="mt-2 text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Renvoyer le code
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/auth/login')}
                className="text-gray-600 hover:text-gray-500 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à la connexion</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationCodePage;
