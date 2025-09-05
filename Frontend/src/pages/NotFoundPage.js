import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Illustration 404 */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
            <div className="text-6xl mb-4">🌱</div>
          </div>

          {/* Message d'erreur */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h1>
          <p className="text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
            Mais ne vous inquiétez pas, nous pouvons vous aider à retrouver votre chemin !
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/"
              className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </Link>
            
            <Link
              to="/objects"
              className="btn-secondary btn-lg w-full flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Explorer les objets</span>
            </Link>
          </div>

          {/* Lien de retour */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="text-primary-600 hover:text-primary-700 flex items-center justify-center space-x-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à la page précédente</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
