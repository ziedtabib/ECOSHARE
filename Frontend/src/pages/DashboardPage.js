import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Package, 
  Heart, 
  Users, 
  TrendingUp, 
  MapPin, 
  Clock,
  Star,
  Eye,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  // Utiliser les vraies données de l'utilisateur
  const userStats = {
    objectsShared: user?.stats?.objectsShared || 0,
    objectsReceived: user?.stats?.objectsReceived || 0,
    foodsShared: user?.stats?.foodsShared || 0,
    foodsReceived: user?.stats?.foodsReceived || 0,
    totalExchanges: user?.stats?.totalExchanges || 0,
    points: user?.points || 0,
    level: user?.level || 'Bronze'
  };

  const mockRecentActivity = [
    {
      id: 1,
      type: 'object_shared',
      title: 'Vélo vintage',
      description: 'Vous avez partagé un vélo vintage',
      points: 20,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures
      status: 'available'
    },
    {
      id: 2,
      type: 'food_received',
      title: 'Légumes bio',
      description: 'Vous avez reçu des légumes bio de Sophie',
      points: 15,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour
      status: 'completed'
    },
    {
      id: 3,
      type: 'exchange_completed',
      title: 'Livres de cuisine',
      description: 'Échange finalisé avec Pierre',
      points: 5,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours
      status: 'completed'
    }
  ];

  const mockMyObjects = [
    {
      id: 1,
      title: 'Vélo vintage',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      status: 'available',
      views: 45,
      likes: 12,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      title: 'Livres de cuisine',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      status: 'reserved',
      views: 23,
      likes: 8,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Il y a 1 jour';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'object_shared': return <Package className="h-5 w-5 text-green-600" />;
      case 'food_shared': return <Heart className="h-5 w-5 text-red-600" />;
      case 'object_received': return <Package className="h-5 w-5 text-blue-600" />;
      case 'food_received': return <Heart className="h-5 w-5 text-pink-600" />;
      case 'exchange_completed': return <Star className="h-5 w-5 text-yellow-600" />;
      default: return <TrendingUp className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'badge-success';
      case 'reserved': return 'badge-warning';
      case 'exchanged': return 'badge-secondary';
      case 'completed': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'reserved': return 'Réservé';
      case 'exchanged': return 'Échangé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bonjour {user?.firstName} ! 👋
              </h1>
              <p className="text-gray-600">
                Voici un aperçu de votre activité sur ECOSHARE
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {userStats.points} pts
                </div>
                <div className="text-sm text-gray-500">
                  Niveau {userStats.level}
                </div>
              </div>
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-primary-600">
                    {user?.firstName?.[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-soft p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {userStats.objectsShared}
                </div>
                <div className="text-sm text-gray-600">Objets partagés</div>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-3">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {userStats.foodsShared}
                </div>
                <div className="text-sm text-gray-600">Aliments partagés</div>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {userStats.totalExchanges}
                </div>
                <div className="text-sm text-gray-600">Échanges totaux</div>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mb-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {userStats.points}
                </div>
                <div className="text-sm text-gray-600">Points totaux</div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Actions rapides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/objects/create"
                  className="btn-primary btn-lg flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Ajouter un objet</span>
                </Link>
                <Link
                  to="/foods/create"
                  className="btn-success btn-lg flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Ajouter un aliment</span>
                </Link>
                <Link
                  to="/posts/create"
                  className="btn-secondary btn-lg flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Créer un post</span>
                </Link>
              </div>
            </div>

            {/* Mes objets récents */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes objets récents
                </h2>
                <Link
                  to="/objects"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Voir tout
                </Link>
              </div>
              <div className="space-y-4">
                {mockMyObjects.map((obj) => (
                  <div key={obj.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={obj.image}
                      alt={obj.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{obj.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className={`badge ${getStatusColor(obj.status)}`}>
                          {getStatusLabel(obj.status)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{obj.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{obj.likes}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(obj.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activité récente */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activité récente
              </h3>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-primary-600 font-medium">
                          +{activity.points} pts
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liens utiles */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Liens utiles
              </h3>
              <div className="space-y-3">
                <Link
                  to="/dashboard/wishlist"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-900">Ma wishlist</span>
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Mon profil</span>
                </Link>
                <Link
                  to="/leaderboard"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-900">Classement</span>
                </Link>
                <Link
                  to="/posts"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Communauté</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
