import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Heart, Eye, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { foodService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const FoodsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFoodType, setSelectedFoodType] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Charger les aliments depuis l'API
  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Essayer de charger depuis l'API
      const response = await foodService.getFoods();
      const apiFoods = (response.foods || response.data || []).map((food, index) => ({
        ...food,
        id: food.id || `api-food-${index}`,
        ingredients: Array.isArray(food.ingredients) ? food.ingredients : []
      }));
      
      // Charger les aliments du localStorage (aliments ajoutés localement)
      const localFoods = JSON.parse(localStorage.getItem('ecoshare_foods') || '[]');
      
      // Nettoyer les dates dans les aliments locaux
      const cleanedLocalFoods = localFoods.map((food, index) => ({
        ...food,
        id: food.id || `local-food-${index}`,
        createdAt: food.createdAt || new Date().toISOString(),
        expirationDate: food.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ingredients: Array.isArray(food.ingredients) ? food.ingredients : []
      }));
      
      // Combiner les aliments de l'API et du localStorage
      const allFoods = [...apiFoods, ...cleanedLocalFoods];
      
      // Supprimer les doublons basés sur l'ID
      const uniqueFoods = allFoods.filter((food, index, self) => 
        index === self.findIndex(f => f.id === food.id)
      );
      
      setFoods(uniqueFoods);
    } catch (err) {
      console.error('Erreur lors du chargement des aliments:', err);
      setError('Impossible de charger les aliments depuis le serveur');
      
      // En cas d'erreur, utiliser les aliments du localStorage + données de test
      const localFoods = JSON.parse(localStorage.getItem('ecoshare_foods') || '[]');
      
      // Nettoyer les dates dans les aliments locaux
      const cleanedLocalFoods = localFoods.map((food, index) => ({
        ...food,
        id: food.id || `local-food-${index}`,
        createdAt: food.createdAt || new Date().toISOString(),
        expirationDate: food.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ingredients: Array.isArray(food.ingredients) ? food.ingredients : []
      }));
      
      const testFoods = [
        {
          id: 1,
          title: 'Légumes bio du jardin',
          description: 'Tomates, courgettes et aubergines de mon jardin bio. Récoltés ce matin, parfaits pour une ratatouille !',
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          foodType: 'vegetables',
          condition: 'fresh',
          location: 'Paris, 75006',
          owner: { firstName: 'Sophie', lastName: 'Chen', avatar: null },
          pointsReward: 25,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          interactions: { views: 32, likes: 15 },
          urgency: 'medium',
          expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          ingredients: ['tomates', 'courgettes', 'aubergines']
        },
        {
          id: 2,
          title: 'Pain de mie et viennoiseries',
          description: 'Pain de mie frais et croissants du boulanger. Achetés ce matin, encore chauds !',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          foodType: 'bakery',
          condition: 'fresh',
          location: 'Paris, 75011',
          owner: { firstName: 'Pierre', lastName: 'Martin', avatar: null },
          pointsReward: 15,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 heures
          interactions: { views: 18, likes: 8 },
          urgency: 'high',
          expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          ingredients: ['pain de mie', 'croissants', 'beurre']
        }
      ];
      
      setFoods([...cleanedLocalFoods, ...testFoods]);
    } finally {
      setLoading(false);
    }
  };

  const foodTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Légumes' },
    { value: 'dairy', label: 'Produits laitiers' },
    { value: 'meat', label: 'Viande' },
    { value: 'bakery', label: 'Boulangerie' },
    { value: 'canned', label: 'Conserves' },
    { value: 'beverages', label: 'Boissons' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'other', label: 'Autre' }
  ];

  const urgencyLevels = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyen' },
    { value: 'high', label: 'Élevé' },
    { value: 'critical', label: 'Critique' }
  ];

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(food.ingredients) && food.ingredients.some(ingredient => 
                           ingredient.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    const matchesFoodType = !selectedFoodType || food.foodType === selectedFoodType;
    const matchesUrgency = !selectedUrgency || food.urgency === selectedUrgency;
    return matchesSearch && matchesFoodType && matchesUrgency;
  });

  const formatDate = (date) => {
    // S'assurer que date est un objet Date
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'Date inconnue';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Il y a 1 jour';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return dateObj.toLocaleDateString('fr-FR');
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'badge-danger animate-pulse';
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevé';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Aliments à partager
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez des aliments frais partagés par notre communauté et réduisez le gaspillage alimentaire
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un aliment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Filtre par type */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedFoodType}
                  onChange={(e) => setSelectedFoodType(e.target.value)}
                  className="input pl-10 pr-10 appearance-none bg-white"
                >
                  {foodTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par urgence */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="input pl-10 pr-10 appearance-none bg-white"
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton d'ajout */}
              {isAuthenticated && (
                <Link
                  to="/foods/create"
                  className="btn-primary btn-lg flex items-center space-x-2"
                >
                  <span>Ajouter un aliment</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-custom py-8">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadFoods}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Résultats */}
        {!loading && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              {filteredFoods.length} aliment{filteredFoods.length > 1 ? 's' : ''} trouvé{filteredFoods.length > 1 ? 's' : ''}
            </p>
            <button 
              onClick={loadFoods}
              className="text-sm text-primary-600 hover:text-primary-800 underline"
            >
              Rafraîchir
            </button>
          </div>
        )}

        {/* Grille d'aliments */}
        {!loading && filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((food, index) => (
              <motion.div
                key={food.id || `food-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="object-card"
              >
                <Link to={`/foods/${food.id}`}>
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-xl overflow-hidden">
                    <img
                      src={food.image}
                      alt={food.title}
                      className="image-cover"
                    />
                    <div className="absolute top-3 right-3 flex flex-col space-y-2">
                      <span className={`badge ${getUrgencyColor(food.urgency)}`}>
                        {getUrgencyLabel(food.urgency)}
                      </span>
                      <span className="badge-success">
                        {food.condition === 'fresh' ? 'Frais' : 'Bon'}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {food.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {food.description}
                    </p>

                    {/* Ingrédients */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(food.ingredients) && food.ingredients.slice(0, 3).map((ingredient, i) => (
                          <span key={i} className="badge-secondary text-xs">
                            {ingredient}
                          </span>
                        ))}
                        {Array.isArray(food.ingredients) && food.ingredients.length > 3 && (
                          <span className="badge-secondary text-xs">
                            +{food.ingredients.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {typeof food.location === 'string' 
                            ? food.location 
                            : `${food.location.city}, ${food.location.postalCode}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatDate(food.createdAt)}</span>
                      </div>
                    </div>

                    {/* Propriétaire et interactions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {food.owner.firstName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {food.owner.firstName} {food.owner.lastName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{food.interactions.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{food.interactions.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Points de récompense */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Points de récompense</span>
                        <span className="text-sm font-semibold text-primary-600">
                          +{food.pointsReward} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍎</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun aliment trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou ajoutez le premier aliment !
            </p>
            {isAuthenticated && (
              <Link
                to="/foods/create"
                className="btn-primary btn-lg"
              >
                Ajouter un aliment
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodsPage;
