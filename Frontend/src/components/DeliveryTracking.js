import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Calendar,
  MessageCircle,
  RefreshCw,
  X
} from 'lucide-react';

const DeliveryTracking = ({ contractData, onClose }) => {
  const [deliveryStatus, setDeliveryStatus] = useState('scheduled');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const statusConfig = {
    scheduled: {
      title: 'Livraison programmée',
      description: 'Votre livraison est confirmée et programmée',
      color: 'blue',
      icon: <Calendar className="h-5 w-5" />
    },
    in_transit: {
      title: 'En cours de livraison',
      description: 'Votre objet est en route vers vous',
      color: 'yellow',
      icon: <Truck className="h-5 w-5" />
    },
    out_for_delivery: {
      title: 'En livraison',
      description: 'Votre objet arrive bientôt',
      color: 'orange',
      icon: <Navigation className="h-5 w-5" />
    },
    delivered: {
      title: 'Livré',
      description: 'Votre objet a été livré avec succès',
      color: 'green',
      icon: <CheckCircle className="h-5 w-5" />
    },
    failed: {
      title: 'Livraison échouée',
      description: 'La livraison n\'a pas pu être effectuée',
      color: 'red',
      icon: <AlertCircle className="h-5 w-5" />
    }
  };

  useEffect(() => {
    // Simuler le chargement des données de livraison
    loadDeliveryData();
  }, []);

  const loadDeliveryData = async () => {
    setIsLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées
      const mockDeliveryData = {
        status: 'in_transit',
        currentLocation: {
          lat: 48.8566,
          lng: 2.3522,
          address: 'Paris, France'
        },
        estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 heures
        history: [
          {
            id: 1,
            status: 'scheduled',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            description: 'Livraison programmée',
            location: 'Entrepôt ECOSHARE'
          },
          {
            id: 2,
            status: 'in_transit',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            description: 'Objet en cours de transport',
            location: 'En route vers Paris'
          }
        ]
      };
      
      setDeliveryStatus(mockDeliveryData.status);
      setCurrentLocation(mockDeliveryData.currentLocation);
      setEstimatedArrival(mockDeliveryData.estimatedArrival);
      setDeliveryHistory(mockDeliveryData.history);
    } catch (error) {
      console.error('Erreur lors du chargement des données de livraison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const config = statusConfig[status];
    switch (config.color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (estimatedArrival) => {
    if (!estimatedArrival) return null;
    
    const now = new Date();
    const arrival = new Date(estimatedArrival);
    const diff = arrival - now;
    
    if (diff <= 0) return 'Arrivé';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Suivi de livraison
                </h2>
                <p className="text-sm text-gray-600">
                  Contrat #{contractData?.contractId || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadDeliveryData}
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
        <div className="p-6 space-y-6">
          {/* Statut actuel */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${getStatusColor(deliveryStatus)}`}>
                {statusConfig[deliveryStatus]?.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {statusConfig[deliveryStatus]?.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {statusConfig[deliveryStatus]?.description}
                </p>
              </div>
            </div>

            {estimatedArrival && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Arrivée estimée: {formatTime(estimatedArrival)}</span>
                </div>
                <div className="flex items-center space-x-2 text-primary-600">
                  <span className="font-medium">
                    {getTimeRemaining(estimatedArrival)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Informations de livraison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Donateur</span>
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  {contractData?.giverName || 'Nom non disponible'}
                </p>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Phone className="h-3 w-3" />
                  <span>{contractData?.giverPhone || 'Téléphone non disponible'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Mail className="h-3 w-3" />
                  <span>{contractData?.giverEmail || 'Email non disponible'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Adresse de livraison</span>
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  {contractData?.deliveryAddress || 'Adresse non disponible'}
                </p>
                <p className="text-gray-500">
                  Méthode: {contractData?.deliveryMethod || 'Non spécifiée'}
                </p>
                {contractData?.specialInstructions && (
                  <p className="text-gray-500">
                    Instructions: {contractData.specialInstructions}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Historique de livraison */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">
              Historique de livraison
            </h4>
            <div className="space-y-4">
              {deliveryHistory.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className={`p-2 rounded-full ${getStatusColor(event.status)}`}>
                    {statusConfig[event.status]?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">
                        {statusConfig[event.status]?.title}
                      </h5>
                      <span className="text-sm text-gray-500">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button className="btn-primary btn-sm flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Contacter le livreur</span>
            </button>
            <button className="btn-secondary btn-sm flex items-center space-x-2">
              <Navigation className="h-4 w-4" />
              <span>Voir sur la carte</span>
            </button>
            <button className="btn-outline btn-sm">
              Modifier la livraison
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryTracking;
