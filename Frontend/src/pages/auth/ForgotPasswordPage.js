import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Check, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await forgotPassword(data.email);
    
    if (result.success) {
      setIsEmailSent(true);
    } else {
      setError('root', {
        type: 'manual',
        message: result.error,
      });
    }
    
    setIsLoading(false);
  };

  if (isEmailSent) {
    return (
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
            Email envoyé !
          </h2>
          <p className="text-gray-600">
            Nous avons envoyé un code de réinitialisation à votre adresse email.
            Vérifiez votre boîte de réception et utilisez ce code pour réinitialiser votre mot de passe.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/auth/reset-password-code"
            className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
          >
            <Lock className="h-5 w-5" />
            <span>Réinitialiser le mot de passe</span>
          </Link>
          <Link
            to="/auth/login"
            className="btn-secondary btn-lg w-full flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </motion.div>
    );
  }

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
          Mot de passe oublié ?
        </h2>
        <p className="mt-2 text-gray-600">
          Entrez votre email et nous vous enverrons un lien de réinitialisation
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Erreur générale */}
        {errors.root && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-800 text-sm">{errors.root.message}</p>
          </motion.div>
        )}

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

        {/* Bouton d'envoi */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <span>Envoyer le lien</span>
            </>
          )}
        </button>
      </form>

      {/* Liens */}
      <div className="text-center">
        <Link
          to="/auth/login"
          className="text-primary-600 hover:text-primary-700 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à la connexion</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
