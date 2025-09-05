import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Users, 
  Heart, 
  Phone, 
  Mail, 
  Globe, 
  Search,
  Filter,
  Plus,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  UserPlus,
  MessageCircle,
  Gift,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { associationService } from '../services/api';
import { Link } from 'react-router-dom';

const AssociationsPage = () => {
  const { user } = useAuth();
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    verified: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    loadAssociations();
  }, [filters, searchTerm]);

  const loadAssociations = async () => {
    try {
      setLoading(true);
      const response = await associationService.getAssociations({
        ...filters,
        search: searchTerm
      });
      setAssociations(response.associations || []);
    } catch (error) {
      setError('Erreur lors du chargement des associations');
      console.error('Erreur lors du chargement des associations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (associationId, contactData) => {
    try {
      setContacting(true);
      await associationService.contactAssociation(associationId, contactData);
      setShowContactModal(false);
      setSelectedAssociation(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setContacting(false);
    }
  };

  const handleVolunteer = async (associationId) => {
    try {
      await associationService.joinAssociation(associationId);
      // Recharger les associations pour mettre à jour l'état
      await loadAssociations();
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food_bank: '🍽️',
      shelter: '🏠',
      education: '🎓',
      health: '🏥',
      environment: '🌱',
      social: '🤝',
      other: '📋'
    };
    return icons[category] || '📋';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      food_bank: 'Banque alimentaire',
      shelter: 'Hébergement',
      education: 'Éducation',
      health: 'Santé',
      environment: 'Environnement',
      social: 'Social',
      other: 'Autre'
    };
    return labels[category] || 'Autre';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des associations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-green-600" />
                <span>Associations</span>
              </h1>
              <p className="mt-2 text-gray-600">
                Découvrez et contactez les associations de votre région
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <Link
                  to="/associations/create"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Créer une association</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une association..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
            </button>
          </div>

          {/* Panneau de filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Catégorie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Toutes les catégories</option>
                      <option value="food_bank">Banque alimentaire</option>
                      <option value="shelter">Hébergement</option>
                      <option value="education">Éducation</option>
                      <option value="health">Santé</option>
                      <option value="environment">Environnement</option>
                      <option value="social">Social</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                    <input
                      type="text"
                      placeholder="Ex: Paris"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Vérification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vérification</label>
                    <select
                      value={filters.verified}
                      onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Toutes</option>
                      <option value="true">Vérifiées</option>
                      <option value="false">Non vérifiées</option>
                    </select>
                  </div>

                  {/* Tri */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setFilters({ ...filters, sortBy, sortOrder });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="createdAt-desc">Plus récentes</option>
                      <option value="createdAt-asc">Plus anciennes</option>
                      <option value="name-asc">Nom (A-Z)</option>
                      <option value="name-desc">Nom (Z-A)</option>
                      <option value="stats.views-desc">Plus vues</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grille des associations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {associations.map((association) => (
            <motion.div
              key={association._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* En-tête de l'association */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      {association.logo ? (
                        <img
                          src={association.logo}
                          alt={association.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{getCategoryIcon(association.category)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{association.name}</h3>
                      <p className="text-sm text-gray-500">{getCategoryLabel(association.category)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {association.isVerified && (
                      <CheckCircle className="w-5 h-5 text-green-600" title="Association vérifiée" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(association.category)}`}>
                      {getCategoryLabel(association.category)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{association.description}</p>

                {/* Localisation */}
                <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{association.address.city}, {association.address.postalCode}</span>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{association.volunteers.length} bénévoles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{association.stats.views} vues</span>
                  </div>
                </div>

                {/* Besoins urgents */}
                {association.needs && association.needs.filter(need => need.priority === 'urgent').length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600">Besoins urgents</span>
                    </div>
                    <div className="space-y-1">
                      {association.needs.filter(need => need.priority === 'urgent').slice(0, 2).map((need, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {need.item} ({need.quantity} unités)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedAssociation(association);
                      setShowContactModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contacter</span>
                  </button>

                  <button
                    onClick={() => handleVolunteer(association._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Rejoindre</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message si aucune association */}
        {associations.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune association trouvée</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>

      {/* Modal de contact */}
      <AnimatePresence>
        {showContactModal && selectedAssociation && (
          <ContactModal
            association={selectedAssociation}
            onContact={handleContact}
            onClose={() => setShowContactModal(false)}
            loading={contacting}
          />
        )}
      </AnimatePresence>

      {/* Modal de création */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateAssociationModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadAssociations();
            }}
          />
        )}
      </AnimatePresence>

      {/* Messages d'erreur */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal de contact
const ContactModal = ({ association, onContact, onClose, loading }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'general'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onContact(association._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contacter {association.name}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de contact
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="general">Général</option>
              <option value="donation">Don</option>
              <option value="volunteer">Bénévolat</option>
              <option value="partnership">Partenariat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Modal de création d'association
const CreateAssociationModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: {
      street: '',
      city: '',
      postalCode: ''
    },
    contact: {
      email: '',
      phone: ''
    },
    website: '',
    needs: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ici, vous implémenteriez la création de l'association
      console.log('Création de l\'association:', formData);
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Créer une association
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'association
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="food_bank">Banque alimentaire</option>
                <option value="shelter">Hébergement</option>
                <option value="education">Éducation</option>
                <option value="health">Santé</option>
                <option value="environment">Environnement</option>
                <option value="social">Social</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rue
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, street: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal
              </label>
              <input
                type="text"
                value={formData.address.postalCode}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, postalCode: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact
              </label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { ...formData.contact, email: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { ...formData.contact, phone: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site web (optionnel)
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer l'association
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AssociationsPage;