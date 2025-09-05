import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Camera,
  Star,
  Package,
  Heart,
  Users,
  TrendingUp,
  Gift
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RewardsSystem from '../components/RewardsSystem';

const ProfilePage = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRewardsSystem, setShowRewardsSystem] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      postalCode: user?.address?.postalCode || ''
    }
  });

  // Synchroniser les données du formulaire avec l'utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          postalCode: user.address?.postalCode || ''
        }
      });
    }
  }, [user]);

  // Vérifier l'authentification
  if (!isAuthenticated) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        postalCode: user?.address?.postalCode || ''
      }
    });
    setIsEditing(false);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Platinum': return 'text-purple-600';
      case 'Gold': return 'text-yellow-500';
      case 'Silver': return 'text-gray-400';
      case 'Bronze': return 'text-amber-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du profil */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {user?.firstName?.[0]}
                  </span>
                )}
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors duration-200">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Informations de base */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <span className={`text-lg font-medium ${getLevelColor(userStats.level)}`}>
                  {userStats.level}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Membre depuis {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {userStats.points}
                  </div>
                  <div className="text-sm text-gray-500">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {userStats.totalExchanges}
                  </div>
                  <div className="text-sm text-gray-500">Échanges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {userStats.objectsShared + userStats.foodsShared}
                  </div>
                  <div className="text-sm text-gray-500">Partages</div>
                </div>
              </div>
            </div>

            {/* Bouton d'édition */}
            <div>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-primary btn flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Sauvegarder</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary btn flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Annuler</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary btn flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations personnelles */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informations personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <div className="form-group">
                  <label className="label">
                    <User className="h-4 w-4 inline mr-2" />
                    Prénom
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user?.firstName}</p>
                  )}
                </div>

                {/* Nom */}
                <div className="form-group">
                  <label className="label">
                    <User className="h-4 w-4 inline mr-2" />
                    Nom
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user?.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="label">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </label>
                  <p className="text-gray-900 py-2">{user?.email}</p>
                  <p className="form-help">L'email ne peut pas être modifié</p>
                </div>

                {/* Téléphone */}
                <div className="form-group">
                  <label className="label">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Téléphone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="+33 1 23 45 67 89"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user?.phone || 'Non renseigné'}</p>
                  )}
                </div>

                {/* Adresse */}
                <div className="form-group md:col-span-2">
                  <label className="label">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Adresse
                  </label>
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Rue et numéro"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Ville"
                        />
                        <input
                          type="text"
                          name="address.postalCode"
                          value={formData.address.postalCode}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Code postal"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900 py-2">
                      {user?.address?.street ? (
                        <>
                          {user.address.street}<br />
                          {user.address.postalCode} {user.address.city}
                        </>
                      ) : (
                        'Non renseignée'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Statistiques détaillées
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {userStats.objectsShared}
                  </div>
                  <div className="text-sm text-gray-600">Objets partagés</div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-3">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {userStats.foodsShared}
                  </div>
                  <div className="text-sm text-gray-600">Aliments partagés</div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {userStats.objectsReceived + userStats.foodsReceived}
                  </div>
                  <div className="text-sm text-gray-600">Objets reçus</div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mb-3">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {userStats.totalExchanges}
                  </div>
                  <div className="text-sm text-gray-600">Échanges totaux</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Niveau et progression */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Niveau actuel
              </h3>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getLevelColor(userStats.level)}`}>
                  {userStats.level}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {userStats.points} points
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${(userStats.points % 1000) / 10}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {1000 - (userStats.points % 1000)} points jusqu'au niveau suivant
                </div>
              </div>
            </div>

            {/* Badges et réalisations */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Réalisations
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Premier partage
                    </div>
                    <div className="text-xs text-gray-500">
                      Vous avez partagé votre premier objet
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Communauté active
                    </div>
                    <div className="text-xs text-gray-500">
                      10 échanges réalisés
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Niveau Argent
                    </div>
                    <div className="text-xs text-gray-500">
                      Atteint le niveau Silver
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Points et récompenses */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Points et récompenses
                </h2>
                <button
                  onClick={() => setShowRewardsSystem(true)}
                  className="btn-primary btn-sm flex items-center space-x-2"
                >
                  <Gift className="h-4 w-4" />
                  <span>Voir les récompenses</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {userStats.points}
                  </div>
                  <div className="text-sm text-gray-600">Points totaux</div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mb-3">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {userStats.level}
                  </div>
                  <div className="text-sm text-gray-600">Niveau actuel</div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                    <Gift className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    3
                  </div>
                  <div className="text-sm text-gray-600">Récompenses gagnées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Système de récompenses */}
      {showRewardsSystem && (
        <RewardsSystem
          user={user}
          onClose={() => setShowRewardsSystem(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
