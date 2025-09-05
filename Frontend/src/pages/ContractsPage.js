import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ContractsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadContracts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchTerm, statusFilter, typeFilter]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contracts');
      
      if (response.data.success) {
        setContracts(response.data.contracts || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = contracts;

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.objectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(contract => contract.itemType === typeFilter);
    }

    setFilteredContracts(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'signed': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'signed': return 'Signé';
      case 'completed': return 'Complété';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (contract) => {
    if (contract.isOwner) return 'Propriétaire';
    if (contract.isReceiver) return 'Receveur';
    return 'Participant';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour voir vos contrats.</p>
          <Link to="/login" className="btn btn-primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos contrats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mes Contrats
              </h1>
              <p className="text-gray-600">
                Gérez vos contrats d'échange et suivez leur progression
              </p>
            </div>
            
            <Link
              to="/objects"
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvel échange</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="container-custom py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un contrat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10 pr-10 appearance-none bg-white"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="signed">Signé</option>
                <option value="completed">Complété</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            {/* Filtre par type */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input pr-10 appearance-none bg-white"
              >
                <option value="">Tous les types</option>
                <option value="Object">Objets</option>
                <option value="Food">Aliments</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{contracts.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {contracts.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'signed').length}
            </div>
            <div className="text-sm text-gray-600">Signés</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Complétés</div>
          </div>
        </div>

        {/* Liste des contrats */}
        {filteredContracts.length > 0 ? (
          <div className="space-y-4">
            {filteredContracts.map((contract, index) => (
              <motion.div
                key={contract.contractId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contract.objectTitle}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        <span>{getStatusLabel(contract.status)}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>
                          {contract.isOwner ? 'Vous → ' : ''}
                          {contract.isOwner ? contract.receiverName : contract.ownerName}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(contract.exchangeDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{contract.exchangeLocation}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        ID: <span className="font-mono">{contract.contractId}</span>
                      </span>
                      <span className="text-gray-500">
                        Rôle: <span className="font-medium">{getRoleLabel(contract)}</span>
                      </span>
                      <span className="text-gray-500">
                        Type: <span className="font-medium">{contract.itemType}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <Link
                      to={`/contracts/${contract.contractId}`}
                      className="btn btn-primary"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Voir le contrat
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {contracts.length === 0 ? 'Aucun contrat' : 'Aucun contrat trouvé'}
            </h3>
            <p className="text-gray-600 mb-6">
              {contracts.length === 0 
                ? 'Vous n\'avez pas encore de contrats d\'échange.'
                : 'Essayez de modifier vos critères de recherche.'
              }
            </p>
            {contracts.length === 0 && (
              <Link to="/objects" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Créer un échange
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
