import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from '../../components/icons/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import GoogleAuth from '../../components/auth/GoogleAuth';
import FacebookAuth from '../../components/auth/FacebookAuth';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm();

  const password = watch('password');

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await registerUser(data);
      
      if (result.success) {
        // Sauvegarder l'email pour la confirmation
        localStorage.setItem('pending_confirmation_email', data.email);
        
        // Attendre un court délai pour que l'état soit mis à jour
        setTimeout(() => {
          // Rediriger vers la page de confirmation par code
          navigate('/auth/confirm-email-code', { 
            state: { 
              email: data.email
            }
          });
        }, 100);
      } else {
        setError('root', {
          type: 'manual',
          message: result.error,
        });
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Erreur lors de l\'inscription. Veuillez réessayer.',
      });
    }
    
    setIsLoading(false);
  };


  const handleOAuthSuccess = (result) => {
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleOAuthError = (error) => {
    setError('root', {
      type: 'manual',
      message: error,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-gray-600">
          Rejoignez la communauté ECOSHARE
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Erreur générale */}
        {errors.root && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{errors.root.message}</p>
          </motion.div>
        )}

        {/* Prénom et Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="firstName" className="label">
              Prénom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                className={`input pl-10 ${errors.firstName ? 'input-error' : ''}`}
                placeholder="Votre prénom"
                {...register('firstName', {
                  required: 'Le prénom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le prénom doit contenir au moins 2 caractères',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Le prénom ne peut pas dépasser 50 caractères',
                  },
                })}
              />
            </div>
            {errors.firstName && (
              <p className="form-error">{errors.firstName.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="label">
              Nom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                className={`input pl-10 ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Votre nom"
                {...register('lastName', {
                  required: 'Le nom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le nom doit contenir au moins 2 caractères',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Le nom ne peut pas dépasser 50 caractères',
                  },
                })}
              />
            </div>
            {errors.lastName && (
              <p className="form-error">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="label">
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
              placeholder="votre@email.com"
              {...register('email', {
                required: 'L\'email est requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Format d\'email invalide',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="form-group">
          <label htmlFor="password" className="label">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="Votre mot de passe"
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères',
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* Confirmation du mot de passe */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="label">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Confirmez votre mot de passe"
              {...register('confirmPassword', {
                required: 'La confirmation du mot de passe est requise',
                validate: value =>
                  value === password || 'Les mots de passe ne correspondent pas',
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Conditions d'utilisation */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            {...register('terms', {
              required: 'Vous devez accepter les conditions d\'utilisation',
            })}
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            J'accepte les{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
              conditions d'utilisation
            </Link>{' '}
            et la{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
              politique de confidentialité
            </Link>
          </label>
        </div>
        {errors.terms && (
          <p className="form-error">{errors.terms.message}</p>
        )}


        {/* Bouton d'inscription */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <span>Créer mon compte</span>
            </>
          )}
        </button>
      </form>

      {/* Liens */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link
            to="/auth/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>

      {/* Connexion sociale */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <GoogleAuth
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
            disabled={isLoading}
          />
          
          <FacebookAuth
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
            disabled={isLoading}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
