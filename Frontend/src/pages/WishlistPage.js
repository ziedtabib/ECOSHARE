import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Eye, 
  MapPin, 
  Clock, 
  User, 
  Package,
  Trash2,
  Search,
  Filter
} from 'lucide-react';

const WishlistPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Données de test (à remplacer par des vraies données de l'API)
  const mockWishlist = [
    {
      id: 1,
      type: 'object',
      title: 'Vélo vintage en bon état',
      description: 'Magnifique vélo vintage des années 80, parfait pour se déplacer en ville.',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'electronics',
      condition: 'good',
      location: 'Paris, 75001',
      owner: { firstName: 'Marie', lastName: 'Dubois', avatar: null },
      pointsReward: 20,
      addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      interactions: { views: 45, likes: 12 }
    },
    {
      id: 2,
      type: 'food',
      title: 'Légumes bio du jardin',
      description: 'Tomates, courgettes et aubergines de mon jardin bio. Récoltés ce matin.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'vegetables',
      condition: 'fresh',
      location: 'Paris, 75006',
      owner: { firstName: 'Sophie', lastName: 'Chen', avatar: null },
      pointsReward: 25,
      addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      interactions: { views: 32, likes: 15 },
      urgency: 'medium'
    },
    {
      id: 3,
      type: 'object',
      title: 'Livres de cuisine',
      description: 'Collection de 5 livres de cuisine française et internationale.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'books',
      condition: 'excellent',
      location: 'Paris, 75008',
      owner: { firstName: 'Pierre', lastName: 'Martin', avatar: null },
      pointsReward: 15,
      addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      interactions: { views: 23, likes: 8 }
    }
  ];

  const types = [
    { value: '', label: 'Tous les types' },
    { value: 'object', label: 'Objets' },
    { value: 'food', label: 'Aliments' }
  ];

  const filteredWishlist = mockWishlist.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Il y a 1 jour';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getTypeIcon = (type) => {
    return type === 'food' ? <Heart className="h-5 w-5 text-red-600" /> : <Package className="h-5 w-5 text-green-600" />;
  };

  const getTypeLabel = (type) => {
    return type === 'food' ? 'Aliment' : 'Objet';
  };

  const getTypeColor = (type) => {
    return type === 'food' ? 'badge-danger' : 'badge-success';
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'badge-success';
      case 'good': return 'badge-primary';
      case 'fair': return 'badge-warning';
      case 'fresh': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Bon';
      case 'fair': return 'Correct';
      case 'fresh': return 'Frais';
      default: return condition;
    }
  };

  const handleRemoveFromWishlist = (itemId) => {
    // TODO: Implémenter la suppression de la wishlist
    console.log('Supprimer de la wishlist:', itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ma wishlist
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Vos objets et aliments favoris que vous souhaitez récupérer
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
                  placeholder="Rechercher dans votre wishlist..."
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
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input pl-10 pr-10 appearance-none bg-white"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-custom py-8">
        {/* Résultats */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredWishlist.length} élément{filteredWishlist.length > 1 ? 's' : ''} dans votre wishlist
          </p>
        </div>

        {/* Grille de la wishlist */}
        {filteredWishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="object-card relative"
              >
                <Link to={`/${item.type}s/${item.id}`}>
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-xl overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="image-cover"
                    />
                    <div className="absolute top-3 right-3 flex flex-col space-y-2">
                      <span className={`badge ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        <span className="ml-1">{getTypeLabel(item.type)}</span>
                      </span>
                      <span className={`badge ${getConditionColor(item.condition)}`}>
                        {getConditionLabel(item.condition)}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Informations */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {typeof item.location === 'string' 
                            ? item.location 
                            : `${item.location.city}, ${item.location.postalCode}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Ajouté {formatDate(item.addedAt)}</span>
                      </div>
                    </div>

                    {/* Propriétaire et interactions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {item.owner.firstName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {item.owner.firstName} {item.owner.lastName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{item.interactions.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{item.interactions.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Points de récompense */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Points de récompense</span>
                        <span className="text-sm font-semibold text-primary-600">
                          +{item.pointsReward} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Bouton de suppression */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFromWishlist(item.id);
                  }}
                  className="absolute top-4 right-4 h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Votre wishlist est vide
            </h3>
            <p className="text-gray-600 mb-6">
              Ajoutez des objets et aliments à votre wishlist pour les retrouver facilement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/objects"
                className="btn-primary btn-lg"
              >
                Explorer les objets
              </Link>
              <Link
                to="/foods"
                className="btn-success btn-lg"
              >
                Explorer les aliments
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
