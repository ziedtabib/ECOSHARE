import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Heart, Eye, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { objectService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ObjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Charger les objets depuis l'API
  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Essayer de charger depuis l'API
      const response = await objectService.getObjects();
      const apiObjects = (response.objects || response.data || []).map((obj, index) => ({
        ...obj,
        id: obj.id || `api-object-${index}`,
        owner: obj.owner || { firstName: 'Utilisateur', lastName: 'Inconnu', avatar: null }
      }));
      
      // Charger les objets du localStorage (objets ajoutés localement)
      const localObjects = JSON.parse(localStorage.getItem('ecoshare_objects') || '[]');
      
      // Nettoyer les dates dans les objets locaux
      const cleanedLocalObjects = localObjects.map((obj, index) => ({
        ...obj,
        id: obj.id || `local-object-${index}`,
        createdAt: obj.createdAt || new Date().toISOString(),
        owner: obj.owner || { firstName: 'Utilisateur', lastName: 'Inconnu', avatar: null }
      }));
      
      // Combiner les objets de l'API et du localStorage
      const allObjects = [...apiObjects, ...cleanedLocalObjects];
      
      // Supprimer les doublons basés sur l'ID
      const uniqueObjects = allObjects.filter((obj, index, self) => 
        index === self.findIndex(o => o.id === obj.id)
      );
      
      setObjects(uniqueObjects);
    } catch (err) {
      console.error('Erreur lors du chargement des objets:', err);
      setError('Impossible de charger les objets depuis le serveur');
      
      // En cas d'erreur, utiliser les objets du localStorage + données de test
      const localObjects = JSON.parse(localStorage.getItem('ecoshare_objects') || '[]');
      
      // Nettoyer les dates dans les objets locaux
      const cleanedLocalObjects = localObjects.map((obj, index) => ({
        ...obj,
        id: obj.id || `local-object-${index}`,
        createdAt: obj.createdAt || new Date().toISOString(),
        owner: obj.owner || { firstName: 'Utilisateur', lastName: 'Inconnu', avatar: null }
      }));
      const testObjects = [
        {
          id: 1,
          title: 'Vélo vintage en bon état',
          description: 'Magnifique vélo vintage des années 80, parfait pour se déplacer en ville.',
          image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          category: 'electronics',
          condition: 'good',
          location: 'Paris, 75001',
          owner: { firstName: 'Marie', lastName: 'Dubois', avatar: null },
          pointsReward: 20,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          interactions: { views: 45, likes: 12 }
        },
        {
          id: 2,
          title: 'Livres de cuisine',
          description: 'Collection de 5 livres de cuisine française et internationale.',
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          category: 'books',
          condition: 'excellent',
          location: 'Paris, 75008',
          owner: { firstName: 'Pierre', lastName: 'Martin', avatar: null },
          pointsReward: 15,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          interactions: { views: 23, likes: 8 }
        }
      ];
      
      setObjects([...cleanedLocalObjects, ...testObjects]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'electronics', label: 'Électronique' },
    { value: 'clothing', label: 'Vêtements' },
    { value: 'furniture', label: 'Meubles' },
    { value: 'books', label: 'Livres' },
    { value: 'toys', label: 'Jouets' },
    { value: 'sports', label: 'Sport' },
    { value: 'beauty', label: 'Beauté' },
    { value: 'home', label: 'Maison' },
    { value: 'other', label: 'Autre' }
  ];

  const filteredObjects = objects.filter(obj => {
    const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obj.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || obj.category === selectedCategory;
    return matchesSearch && matchesCategory;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Objets à partager
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez des objets donnés par notre communauté et trouvez ce dont vous avez besoin
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
                  placeholder="Rechercher un objet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Filtre par catégorie */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input pl-10 pr-10 appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton d'ajout */}
              {isAuthenticated && (
                <Link
                  to="/objects/create"
                  className="btn-primary btn-lg flex items-center space-x-2"
                >
                  <span>Ajouter un objet</span>
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
              onClick={loadObjects}
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
              {filteredObjects.length} objet{filteredObjects.length > 1 ? 's' : ''} trouvé{filteredObjects.length > 1 ? 's' : ''}
            </p>
            <button 
              onClick={loadObjects}
              className="text-sm text-primary-600 hover:text-primary-800 underline"
            >
              Rafraîchir
            </button>
          </div>
        )}

        {/* Grille d'objets */}
        {!loading && filteredObjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObjects.map((obj, index) => (
              <motion.div
                key={obj.id || `object-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="object-card"
              >
                <Link to={`/objects/${obj.id}`}>
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-xl overflow-hidden">
                    <img
                      src={obj.image}
                      alt={obj.title}
                      className="image-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`badge ${
                        obj.condition === 'excellent' ? 'badge-success' :
                        obj.condition === 'good' ? 'badge-primary' :
                        obj.condition === 'fair' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {obj.condition === 'excellent' ? 'Excellent' :
                         obj.condition === 'good' ? 'Bon' :
                         obj.condition === 'fair' ? 'Correct' : 'Usé'}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {obj.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {obj.description}
                    </p>

                    {/* Informations */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {typeof obj.location === 'string' 
                            ? obj.location 
                            : `${obj.location.city}, ${obj.location.postalCode}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatDate(obj.createdAt)}</span>
                      </div>
                    </div>

                    {/* Propriétaire et interactions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {obj.owner?.firstName?.[0] || '?'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {obj.owner?.firstName && obj.owner?.lastName 
                            ? `${obj.owner.firstName} ${obj.owner.lastName}`
                            : 'Utilisateur inconnu'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{obj.interactions.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{obj.interactions.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Points de récompense */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Points de récompense</span>
                        <span className="text-sm font-semibold text-primary-600">
                          +{obj.pointsReward} pts
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
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun objet trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou ajoutez le premier objet !
            </p>
            {isAuthenticated && (
              <Link
                to="/objects/create"
                className="btn-primary btn-lg"
              >
                Ajouter un objet
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectsPage;
