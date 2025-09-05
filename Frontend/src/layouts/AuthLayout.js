import React from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <>
      <Helmet>
        <title>Authentification - ECOSHARE</title>
        <meta name="description" content="Connectez-vous ou créez un compte sur ECOSHARE pour commencer à partager et échanger des objets et aliments." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo et titre */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">🌱</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              ECOSHARE
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Partagez, Réutilisez, Durable
            </p>
          </motion.div>

          {/* Contenu des pages d'authentification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-strong p-8"
          >
            <Outlet />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center text-sm text-gray-500"
          >
            <p>
              En continuant, vous acceptez nos{' '}
              <a href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                Conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                Politique de confidentialité
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
