import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Heart, Eye, Clock, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { postService } from '../services/api';

const PostsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [selectedType, selectedCategory, searchTerm]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedType) filters.type = selectedType;
      if (selectedCategory) filters.category = selectedCategory;
      if (searchTerm) filters.q = searchTerm;
      
      const result = await postService.getPosts(filters);
      if (result.success) {
        setPosts(result.data || []);
      } else {
        setError(result.message || 'Erreur lors du chargement des posts');
      }
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      setError('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  // Données de test (à remplacer par des vraies données de l'API)
  const mockPosts = [
    {
      id: 1,
      title: 'Collecte de jouets pour l\'hôpital',
      content: 'Bonjour à tous ! Nous organisons une collecte de jouets pour égayer les journées des enfants hospitalisés. Tous les jouets en bon état sont les bienvenus : peluches, jeux de société, livres, etc. Merci pour votre générosité !',
      type: 'help_request',
      category: 'toy_donation',
      location: {
        address: 'Hôpital Necker',
        city: 'Paris',
        postalCode: '75015',
        radius: 20
      },
      author: { firstName: 'Marie', lastName: 'Dubois', avatar: null },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      interactions: { views: 89, likes: 23, comments: 8 },
      participants: 12,
      details: {
        helpRequest: {
          urgency: 'medium',
          targetQuantity: 50,
          unit: 'jouets',
          deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        }
      },
      tags: ['jouets', 'hôpital', 'enfants', 'solidarité']
    },
    {
      id: 2,
      title: 'Événement : Nettoyage du parc',
      content: 'Rejoignez-nous ce samedi pour nettoyer le parc de notre quartier ! Nous fournirons les gants et les sacs. C\'est l\'occasion de rencontrer vos voisins tout en prenant soin de notre environnement.',
      type: 'event',
      category: 'community_event',
      location: {
        address: 'Parc des Buttes-Chaumont',
        city: 'Paris',
        postalCode: '75019',
        radius: 5
      },
      author: { firstName: 'Pierre', lastName: 'Martin', avatar: null },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      interactions: { views: 156, likes: 45, comments: 12 },
      participants: 8,
      details: {
        event: {
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          maxParticipants: 20,
          currentParticipants: 8
        }
      },
      tags: ['environnement', 'nettoyage', 'communauté', 'événement']
    }
  ];

  const postTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'help_request', label: 'Demande d\'aide' },
    { value: 'announcement', label: 'Annonce' },
    { value: 'success_story', label: 'Histoire de succès' },
    { value: 'tip', label: 'Conseil' },
    { value: 'event', label: 'Événement' },
    { value: 'general', label: 'Général' }
  ];

  const postCategories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'food_collection', label: 'Collecte de nourriture' },
    { value: 'clothing_drive', label: 'Collecte de vêtements' },
    { value: 'toy_donation', label: 'Don de jouets' },
    { value: 'furniture_pickup', label: 'Récupération de meubles' },
    { value: 'book_donation', label: 'Don de livres' },
    { value: 'electronics_recycling', label: 'Recyclage électronique' },
    { value: 'community_event', label: 'Événement communautaire' },
    { value: 'volunteer_help', label: 'Aide bénévole' },
    { value: 'emergency_help', label: 'Aide d\'urgence' },
    { value: 'other', label: 'Autre' }
  ];

  // Les posts sont déjà filtrés côté serveur, on utilise directement la liste
  const displayPosts = posts;

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Il y a 1 jour';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      'help_request': 'Demande d\'aide',
      'announcement': 'Annonce',
      'success_story': 'Histoire de succès',
      'tip': 'Conseil',
      'event': 'Événement',
      'general': 'Général'
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type) => {
    const colorMap = {
      'help_request': 'badge-danger',
      'announcement': 'badge-primary',
      'success_story': 'badge-success',
      'tip': 'badge-warning',
      'event': 'badge-secondary',
      'general': 'badge-secondary'
    };
    return colorMap[type] || 'badge-secondary';
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
              Communauté
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les demandes d'aide, événements et actualités de notre communauté
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
                  placeholder="Rechercher dans la communauté..."
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
                  {postTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par catégorie */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input pl-10 pr-10 appearance-none bg-white"
                >
                  {postCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton d'ajout */}
              {isAuthenticated && (
                <Link
                  to="/posts/create"
                  className="btn-primary btn-lg flex items-center space-x-2"
                >
                  <span>Créer un post</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-custom py-8">
        {/* Résultats */}
        <div className="mb-6">
          <p className="text-gray-600">
            {displayPosts.length} post{displayPosts.length > 1 ? 's' : ''} trouvé{displayPosts.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Grille de posts */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={loadPosts}
              className="btn-primary"
            >
              Réessayer
            </button>
          </div>
        ) : displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-hover"
              >
                <Link to={`/posts/${post.id}`}>
                  <div className="p-6">
                    {/* En-tête du post */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`badge ${getTypeColor(post.type)}`}>
                            {getTypeLabel(post.type)}
                          </span>
                          {post.details.helpRequest && (
                            <span className={`badge ${getUrgencyColor(post.details.helpRequest.urgency)}`}>
                              {getUrgencyLabel(post.details.helpRequest.urgency)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                      </div>
                    </div>

                    {/* Contenu */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="badge-secondary text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Informations */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {typeof post.location === 'string' 
                            ? post.location 
                            : `${post.location.address}, ${post.location.city}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>

                    {/* Détails spécifiques */}
                    {post.details.helpRequest && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg">
                        <div className="text-sm text-red-800">
                          <strong>Objectif :</strong> {post.details.helpRequest.targetQuantity} {post.details.helpRequest.unit}
                        </div>
                        <div className="text-sm text-red-600">
                          <strong>Échéance :</strong> {formatDate(post.details.helpRequest.deadline)}
                        </div>
                      </div>
                    )}

                    {post.details.event && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>Date :</strong> {formatDate(post.details.event.startDate)}
                        </div>
                        <div className="text-sm text-blue-600">
                          <strong>Participants :</strong> {post.details.event.currentParticipants}/{post.details.event.maxParticipants}
                        </div>
                      </div>
                    )}

                    {/* Auteur et interactions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {post.author.firstName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {post.author.firstName} {post.author.lastName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.interactions.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.interactions.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{post.participants}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun post trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou créez le premier post !
            </p>
            {isAuthenticated && (
              <Link
                to="/posts/create"
                className="btn-primary btn-lg"
              >
                Créer un post
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
