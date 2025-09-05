import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Filter, 
  Search, 
  ShoppingCart, 
  Clock, 
  MapPin,
  Award,
  Leaf,
  Heart,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rewardService } from '../services/api';

const RewardsPage = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    maxPoints: '',
    minLevel: '',
    featured: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  // Charger les récompenses
  useEffect(() => {
    loadRewards();
  }, []);

  // Filtrer les récompenses
  useEffect(() => {
    filterRewards();
  }, [rewards, searchTerm, filters]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const response = await rewardService.getRewards();
      setRewards(response.rewards);
    } catch (error) {
      setError('Erreur lors du chargement des récompenses');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRewards = () => {
    let filtered = rewards;

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(reward =>
        reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtres
    if (filters.type) {
      filtered = filtered.filter(reward => reward.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter(reward => reward.category === filters.category);
    }

    if (filters.maxPoints) {
      filtered = filtered.filter(reward => reward.value.pointsRequired <= parseInt(filters.maxPoints));
    }

    if (filters.minLevel) {
      const levelHierarchy = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
      const userLevelIndex = levelHierarchy.indexOf(user.level);
      const requiredLevelIndex = levelHierarchy.indexOf(filters.minLevel);
      filtered = filtered.filter(reward => userLevelIndex >= requiredLevelIndex);
    }

    if (filters.featured) {
      filtered = filtered.filter(reward => reward.metadata.isFeatured);
    }

    setFilteredRewards(filtered);
  };

  const handleRedeem = async (reward) => {
    if (user.points < reward.value.pointsRequired) {
      setError('Points insuffisants pour rédimer cette récompense');
      return;
    }

    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = async (deliveryAddress, notes) => {
    try {
      setRedeeming(true);
      await rewardService.redeemReward(selectedReward._id, {
        deliveryAddress,
        notes
      });
      
      setShowRedeemModal(false);
      setSelectedReward(null);
      
      // Recharger les récompenses et mettre à jour les points utilisateur
      await loadRewards();
      
      // Mettre à jour les points de l'utilisateur
      user.points -= selectedReward.value.pointsRequired;
      
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la rédemption');
    } finally {
      setRedeeming(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      eco_friendly: <Leaf className="w-5 h-5" />,
      sustainable: <Zap className="w-5 h-5" />,
      organic: <Heart className="w-5 h-5" />,
      recycled: <TrendingUp className="w-5 h-5" />,
      local: <MapPin className="w-5 h-5" />,
      charity: <Heart className="w-5 h-5" />
    };
    return icons[category] || <Gift className="w-5 h-5" />;
  };

  const getTypeIcon = (type) => {
    const icons = {
      physical: '📦',
      digital: '💻',
      discount: '💰',
      experience: '🎯',
      donation: '🎁'
    };
    return icons[type] || '🎁';
  };

  const getEligibilityStatus = (reward) => {
    if (user.points < reward.value.pointsRequired) {
      return { eligible: false, reason: 'Points insuffisants' };
    }
    
    const levelHierarchy = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const userLevelIndex = levelHierarchy.indexOf(user.level);
    const requiredLevelIndex = levelHierarchy.indexOf(reward.eligibility.minLevel);
    
    if (userLevelIndex < requiredLevelIndex) {
      return { eligible: false, reason: 'Niveau insuffisant' };
    }
    
    if (!reward.availability.isActive) {
      return { eligible: false, reason: 'Non disponible' };
    }
    
    if (reward.availability.stock === 0) {
      return { eligible: false, reason: 'Stock épuisé' };
    }
    
    return { eligible: true };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des récompenses...</p>
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
                <Gift className="w-8 h-8 text-green-600" />
                <span>Récompenses</span>
              </h1>
              <p className="mt-2 text-gray-600">
                Échangez vos points contre des récompenses éco-responsables
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Vos points</p>
                <p className="text-2xl font-bold text-green-600">{user.points}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-green-600" />
              </div>
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
                placeholder="Rechercher une récompense..."
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
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Tous les types</option>
                      <option value="physical">Physique</option>
                      <option value="digital">Numérique</option>
                      <option value="discount">Réduction</option>
                      <option value="experience">Expérience</option>
                      <option value="donation">Don</option>
                    </select>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Toutes les catégories</option>
                      <option value="eco_friendly">Éco-responsable</option>
                      <option value="sustainable">Durable</option>
                      <option value="organic">Biologique</option>
                      <option value="recycled">Recyclé</option>
                      <option value="local">Local</option>
                      <option value="charity">Charité</option>
                    </select>
                  </div>

                  {/* Points maximum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Points max</label>
                    <input
                      type="number"
                      placeholder="Ex: 500"
                      value={filters.maxPoints}
                      onChange={(e) => setFilters({ ...filters, maxPoints: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Niveau minimum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niveau min</label>
                    <select
                      value={filters.minLevel}
                      onChange={(e) => setFilters({ ...filters, minLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Tous les niveaux</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Diamond">Diamond</option>
                    </select>
                  </div>
                </div>

                {/* Filtre spécial */}
                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Récompenses en vedette</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grille des récompenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRewards.map((reward) => {
            const eligibility = getEligibilityStatus(reward);
            
            return (
              <motion.div
                key={reward._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Image de la récompense */}
                <div className="relative h-48 bg-gray-200">
                  {reward.images && reward.images.length > 0 ? (
                    <img
                      src={reward.images.find(img => img.isMain)?.url || reward.images[0].url}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    {reward.metadata.isFeatured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ⭐ Vedette
                      </span>
                    )}
                    <span className="bg-white text-gray-700 text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                      <span>{getTypeIcon(reward.type)}</span>
                      <span className="capitalize">{reward.type}</span>
                    </span>
                  </div>

                  {/* Catégorie */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-100 text-green-700 p-2 rounded-full">
                      {getCategoryIcon(reward.category)}
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{reward.name}</h3>
                    <div className="flex items-center space-x-1 text-green-600 ml-2">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">{reward.stats.averageRating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{reward.description}</p>

                  {/* Points et valeur */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">{reward.value.pointsRequired}</span>
                      <span className="text-sm text-gray-500">points</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Valeur</p>
                      <p className="font-medium">{reward.value.monetaryValue}€</p>
                    </div>
                  </div>

                  {/* Statut d'éligibilité */}
                  <div className="mb-4">
                    {eligibility.eligible ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Éligible</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{eligibility.reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton de rédemption */}
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!eligibility.eligible || redeeming}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Rédimer</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Message si aucune récompense */}
        {filteredRewards.length === 0 && !loading && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune récompense trouvée</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>

      {/* Modal de rédemption */}
      <AnimatePresence>
        {showRedeemModal && selectedReward && (
          <RedeemModal
            reward={selectedReward}
            user={user}
            onConfirm={confirmRedeem}
            onCancel={() => setShowRedeemModal(false)}
            loading={redeeming}
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

// Composant Modal de rédemption
const RedeemModal = ({ reward, user, onConfirm, onCancel, loading }) => {
  const [deliveryAddress, setDeliveryAddress] = useState(user.address || {});
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(deliveryAddress, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rédimer la récompense</h3>
        
        {/* Informations de la récompense */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900">{reward.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-green-600">{reward.value.pointsRequired} points</span>
            <span className="text-sm text-gray-500">Valeur: {reward.value.monetaryValue}€</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Adresse de livraison */}
          {reward.type === 'physical' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse de livraison
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Rue"
                  value={deliveryAddress.street || ''}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ville"
                    value={deliveryAddress.city || ''}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Code postal"
                    value={deliveryAddress.postalCode || ''}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              placeholder="Ajoutez des notes pour votre commande..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Rédemption...' : 'Confirmer la rédemption'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RewardsPage;
