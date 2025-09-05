import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Search,
  Filter,
  Eye,
  MessageCircle,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DeliveryTracking from '../components/DeliveryTracking';

const DeliveryTrackingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      loadDeliveries();
    }
  }, [isAuthenticated]);

  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées
      const mockDeliveries = [
        {
          id: 1,
          contractId: 'CONTRACT-001',
          objectTitle: 'Vélo vintage en bon état',
          status: 'in_transit',
          giverName: 'Marie Dubois',
          giverPhone: '01 23 45 67 89',
          giverEmail: 'marie.dubois@email.com',
          deliveryMethod: 'pickup',
          deliveryAddress: '123 Rue de la Paix, 75001 Paris',
          scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
          estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          specialInstructions: 'Sonner à l\'interphone'
        },
        {
          id: 2,
          contractId: 'CONTRACT-002',
          objectTitle: 'Table en bois massif',
          status: 'delivered',
          giverName: 'Jean Martin',
          giverPhone: '01 98 76 54 32',
          giverEmail: 'jean.martin@email.com',
          deliveryMethod: 'delivery',
          deliveryAddress: '456 Avenue des Champs, 75008 Paris',
          scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          estimatedArrival: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 3,
          contractId: 'CONTRACT-003',
          objectTitle: 'Livre de cuisine',
          status: 'scheduled',
          giverName: 'Sophie Laurent',
          giverPhone: '01 55 44 33 22',
          giverEmail: 'sophie.laurent@email.com',
          deliveryMethod: 'meeting',
          deliveryAddress: 'Place de la République, 75003 Paris',
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          specialInstructions: 'Rencontre devant la fontaine'
        }
      ];
      
      setDeliveries(mockDeliveries);
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    scheduled: {
      title: 'Programmée',
      color: 'blue',
      icon: <Calendar className="h-4 w-4" />
    },
    in_transit: {
      title: 'En cours',
      color: 'yellow',
      icon: <Truck className="h-4 w-4" />
    },
    out_for_delivery: {
      title: 'En livraison',
      color: 'orange',
      icon: <Truck className="h-4 w-4" />
    },
    delivered: {
      title: 'Livrée',
      color: 'green',
      icon: <CheckCircle className="h-4 w-4" />
    },
    failed: {
      title: 'Échouée',
      color: 'red',
      icon: <AlertCircle className="h-4 w-4" />
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

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.objectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.giverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.contractId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h2>
          <p className="text-gray-600">
            Vous devez être connecté pour voir vos livraisons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Suivi des livraisons
          </h1>
          <p className="text-gray-600">
            Gérez et suivez toutes vos livraisons ECOSHARE
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par objet, donateur ou contrat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">Tous les statuts</option>
                <option value="scheduled">Programmées</option>
                <option value="in_transit">En cours</option>
                <option value="out_for_delivery">En livraison</option>
                <option value="delivered">Livrées</option>
                <option value="failed">Échouées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des livraisons */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des livraisons...</p>
            </div>
          </div>
        ) : filteredDeliveries.length > 0 ? (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-soft p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {delivery.objectTitle}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(delivery.status)}`}>
                        {statusConfig[delivery.status]?.icon}
                        <span>{statusConfig[delivery.status]?.title}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{delivery.giverName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{delivery.deliveryMethod === 'pickup' ? 'Récupération' : 
                               delivery.deliveryMethod === 'delivery' ? 'Livraison' : 'Rendez-vous'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {delivery.status === 'delivered' 
                            ? `Livré le ${formatDate(delivery.deliveredAt)}`
                            : `Programmé le ${formatDate(delivery.scheduledDate)}`
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Contrat: {delivery.contractId}</p>
                      <p>Créé le: {formatDate(delivery.createdAt)} à {formatTime(delivery.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedDelivery(delivery)}
                      className="btn-primary btn-sm flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Suivre</span>
                    </button>
                    <button className="btn-secondary btn-sm flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>Contacter</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune livraison trouvée
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucune livraison ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore de livraisons en cours.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de suivi de livraison */}
      {selectedDelivery && (
        <DeliveryTracking
          contractData={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
        />
      )}
    </div>
  );
};

export default DeliveryTrackingPage;