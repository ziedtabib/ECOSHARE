import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Clock, 
  Users,
  Heart,
  ExternalLink,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';

const AssociationRecommendations = ({ objectData, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState(null);

  // Charger les recommandations d'associations
  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Simuler l'appel à l'API IA pour les recommandations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Données simulées des recommandations d'associations
      const mockRecommendations = [
        {
          id: 1,
          association: {
            name: 'Emmaüs',
            type: 'general',
            address: '25 Rue de la Réutilisation, 75001 Paris',
            phone: '01 23 45 67 89',
            email: 'contact@emmaus-paris.fr',
            website: 'https://www.emmaus-paris.fr',
            description: 'Association caritative qui collecte et revend des objets de seconde main pour financer des projets solidaires.',
            rating: 4.5,
            volunteers: 150,
            responseTime: 'same_day'
          },
          reason: 'Accepte les vélos pour réparation et revente',
          priority: 4,
          isFoodBank: false,
          distance: '2.3 km',
          estimatedPickup: '24-48h'
        },
        {
          id: 2,
          association: {
            name: 'Atelier Vélo Participatif',
            type: 'repair',
            address: '12 Avenue du Cyclisme, 75011 Paris',
            phone: '01 98 76 54 32',
            email: 'contact@velo-participatif.fr',
            website: 'https://www.velo-participatif.fr',
            description: 'Atelier associatif qui répare et remet en état des vélos pour les personnes en difficulté.',
            rating: 4.8,
            volunteers: 45,
            responseTime: 'immediate'
          },
          reason: 'Spécialisé dans la réparation de vélos vintage',
          priority: 5,
          isFoodBank: false,
          distance: '1.8 km',
          estimatedPickup: '12-24h'
        },
        {
          id: 3,
          association: {
            name: 'Recyclerie Créative',
            type: 'creative',
            address: '8 Rue de l\'Écologie, 75020 Paris',
            phone: '01 55 44 33 22',
            email: 'info@recyclerie-creative.fr',
            website: 'https://www.recyclerie-creative.fr',
            description: 'Espace de création qui transforme les objets usagés en œuvres d\'art et objets décoratifs.',
            rating: 4.2,
            volunteers: 30,
            responseTime: 'within_week'
          },
          reason: 'Transforme les vélos en œuvres d\'art',
          priority: 3,
          isFoodBank: false,
          distance: '4.1 km',
          estimatedPickup: '3-5 jours'
        }
      ];
      
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleContactAssociation = (association) => {
    // Logique pour contacter l'association
    console.log('Contact de l\'association:', association.name);
    // Ici, on pourrait ouvrir un modal de contact ou rediriger vers un formulaire
  };

  const handleDonateToAssociation = (association) => {
    // Logique pour faire un don à l'association
    console.log('Don à l\'association:', association.name);
    // Ici, on pourrait ouvrir un modal de don ou rediriger vers une page de don
  };

  const getPriorityStars = (priority) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < priority ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getResponseTimeColor = (responseTime) => {
    switch (responseTime) {
      case 'immediate':
        return 'text-green-600 bg-green-100';
      case 'same_day':
        return 'text-blue-600 bg-blue-100';
      case 'within_week':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getResponseTimeLabel = (responseTime) => {
    switch (responseTime) {
      case 'immediate':
        return 'Réponse immédiate';
      case 'same_day':
        return 'Même jour';
      case 'within_week':
        return 'Sous une semaine';
      default:
        return 'Variable';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Associations recommandées
                </h2>
                <p className="text-sm text-gray-600">
                  Pour {objectData?.title || 'cet objet'} - {recommendations.length} association{recommendations.length > 1 ? 's' : ''} trouvée{recommendations.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadRecommendations}
                disabled={isLoading}
                className="btn-secondary btn-sm flex items-center space-x-1"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Recherche d'associations en cours...</p>
              </div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-6">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rec.association.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResponseTimeColor(rec.association.responseTime)}`}>
                          {getResponseTimeLabel(rec.association.responseTime)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {rec.association.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{rec.distance}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{rec.association.volunteers} bénévoles</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Récupération: {rec.estimatedPickup}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center space-x-1">
                          {getPriorityStars(rec.priority)}
                        </div>
                        <span className="text-sm text-gray-600">
                          Priorité: {rec.priority}/5
                        </span>
                      </div>

                      <div className="bg-white rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Pourquoi cette association ?</strong> {rec.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{rec.association.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{rec.association.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{rec.association.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={rec.association.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>Site web</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleContactAssociation(rec.association)}
                      className="btn-primary btn-sm flex items-center space-x-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Contacter</span>
                    </button>
                    <button
                      onClick={() => handleDonateToAssociation(rec.association)}
                      className="btn-secondary btn-sm flex items-center space-x-2"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Faire un don</span>
                    </button>
                    <button
                      onClick={() => setSelectedAssociation(rec)}
                      className="btn-outline btn-sm"
                    >
                      Voir détails
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune association trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Aucune association n'a été trouvée pour ce type d'objet dans votre région.
              </p>
              <button
                onClick={loadRecommendations}
                className="btn-primary btn"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AssociationRecommendations;
