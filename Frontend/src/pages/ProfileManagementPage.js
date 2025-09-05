import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Settings, 
  Camera, 
  Trash2, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  Upload,
  X,
  Check,
  AlertCircle,
  Star,
  TrendingUp,
  Calendar,
  Shield
} from '../../components/icons/SimpleIcons';
import { profileService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import NotificationToast from '../../components/common/NotificationToast';

const ProfileManagementPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [notification, setNotification] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  // Charger le profil
  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await profileService.getProfile();
      if (response.success) {
        setProfile(response.profile);
        reset(response.profile);
        setAvatarPreview(response.profile.avatar);
      }
    } catch (error) {
      showNotification('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Mettre à jour le profil
  const onUpdateProfile = async (data) => {
    setSaving(true);
    try {
      // Nettoyer et valider les données avant envoi
      const cleanedData = cleanProfileData(data);
      
      const response = await profileService.updateProfile(cleanedData);
      
      if (response.success) {
        setProfile(response.profile);
        showNotification('Profil mis à jour avec succès');
      } else {
        showNotification(response.message || 'Erreur lors de la mise à jour du profil', 'error');
      }
    } catch (error) {
      let errorMessage = 'Erreur lors de la mise à jour du profil';
      
      if (error.response?.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          // Afficher les erreurs de validation
          const validationErrors = error.response.data.errors.map(err => err.message).join(', ');
          errorMessage = `Erreurs de validation: ${validationErrors}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Nettoyer les données du profil
  const cleanProfileData = (data) => {
    const cleaned = {};
    
    // Nettoyer les champs de base
    if (data.firstName && data.firstName.trim()) {
      cleaned.firstName = data.firstName.trim();
    }
    if (data.lastName && data.lastName.trim()) {
      cleaned.lastName = data.lastName.trim();
    }
    if (data.phone && data.phone.trim()) {
      cleaned.phone = data.phone.trim();
    }
    
    // Nettoyer l'adresse
    if (data.address) {
      cleaned.address = {};
      if (data.address.street && data.address.street.trim()) {
        cleaned.address.street = data.address.street.trim();
      }
      if (data.address.city && data.address.city.trim()) {
        cleaned.address.city = data.address.city.trim();
      }
      if (data.address.postalCode && data.address.postalCode.trim()) {
        cleaned.address.postalCode = data.address.postalCode.trim();
      }
      if (data.address.country && data.address.country.trim()) {
        cleaned.address.country = data.address.country.trim();
      }
    }
    
    // Nettoyer les préférences
    if (data.preferences) {
      cleaned.preferences = {};
      
      if (data.preferences.radius !== undefined && data.preferences.radius !== null) {
        cleaned.preferences.radius = parseInt(data.preferences.radius);
      }
      
      if (data.preferences.categories && Array.isArray(data.preferences.categories)) {
        cleaned.preferences.categories = data.preferences.categories;
      }
      
      if (data.preferences.notifications) {
        cleaned.preferences.notifications = {};
        if (data.preferences.notifications.email !== undefined) {
          cleaned.preferences.notifications.email = Boolean(data.preferences.notifications.email);
        }
        if (data.preferences.notifications.push !== undefined) {
          cleaned.preferences.notifications.push = Boolean(data.preferences.notifications.push);
        }
        if (data.preferences.notifications.sms !== undefined) {
          cleaned.preferences.notifications.sms = Boolean(data.preferences.notifications.sms);
        }
      }
    }
    
    return cleaned;
  };

  // Uploader un avatar
  const onUploadAvatar = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier la taille du fichier (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
      return;
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Type de fichier non supporté', 'error');
      return;
    }

    try {
      const response = await profileService.uploadAvatar(file);
      if (response.success) {
        setProfile(prev => ({ ...prev, avatar: response.avatar }));
        setAvatarPreview(response.avatar);
        showNotification('Avatar mis à jour avec succès');
      }
    } catch (error) {
      showNotification('Erreur lors de l\'upload de l\'avatar', 'error');
    }
  };

  // Supprimer l'avatar
  const onDeleteAvatar = async () => {
    try {
      const response = await profileService.deleteAvatar();
      if (response.success) {
        setProfile(prev => ({ ...prev, avatar: null }));
        setAvatarPreview(null);
        showNotification('Avatar supprimé avec succès');
      }
    } catch (error) {
      showNotification('Erreur lors de la suppression de l\'avatar', 'error');
    }
  };

  // Changer le mot de passe
  const onChangePassword = async (data) => {
    try {
      const response = await profileService.changePassword(data);
      if (response.success) {
        showNotification('Mot de passe modifié avec succès');
        setShowPasswordForm(false);
        reset();
      }
    } catch (error) {
      showNotification('Erreur lors du changement de mot de passe', 'error');
    }
  };

  // Supprimer le compte
  const onDeleteAccount = async (data) => {
    try {
      const response = await profileService.deleteAccount(data);
      if (response.success) {
        showNotification('Compte supprimé avec succès');
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
    } catch (error) {
      showNotification('Erreur lors de la suppression du compte', 'error');
    }
  };

  // Mettre à jour les préférences
  const onUpdatePreferences = async (data) => {
    try {
      const response = await profileService.updatePreferences(data);
      if (response.success) {
        setProfile(prev => ({ ...prev, preferences: response.preferences }));
        showNotification('Préférences mises à jour avec succès');
      }
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des préférences', 'error');
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      Bronze: 'text-amber-600 bg-amber-100',
      Silver: 'text-gray-600 bg-gray-100',
      Gold: 'text-yellow-600 bg-yellow-100',
      Platinum: 'text-purple-600 bg-purple-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onUploadAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-gray-600">{profile?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(profile?.level)}`}>
                    {profile?.level}
                  </span>
                  <span className="text-sm text-gray-500">{profile?.points} points</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {profile?.avatar && (
                <button
                  onClick={onDeleteAvatar}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer l'avatar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'general', label: 'Informations générales', icon: User },
              { id: 'preferences', label: 'Préférences', icon: Settings },
              { id: 'security', label: 'Sécurité', icon: Lock },
              { id: 'stats', label: 'Statistiques', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Onglet Informations générales */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations générales</h2>
              <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      {...register('firstName', { required: 'Le prénom est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      {...register('lastName', { required: 'Le nom est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      {...register('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Adresse</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rue
                      </label>
                      <input
                        {...register('address.street')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        {...register('address.city')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        {...register('address.postalCode')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? <LoadingSpinner /> : <Save className="w-5 h-5" />}
                    <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Onglet Préférences */}
          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Préférences</h2>
              <form onSubmit={handleSubmit(onUpdatePreferences)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rayon de recherche (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    {...register('radius', { valueAsNumber: true })}
                    defaultValue={profile?.preferences?.radius || 10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('notifications.email')}
                        defaultChecked={profile?.preferences?.notifications?.email}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Notifications par email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('notifications.push')}
                        defaultChecked={profile?.preferences?.notifications?.push}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Notifications push</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('notifications.sms')}
                        defaultChecked={profile?.preferences?.notifications?.sms}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Notifications SMS</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>Sauvegarder</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Sécurité</h2>
              
              {/* Changer le mot de passe */}
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Changer le mot de passe</span>
                  </button>
                ) : (
                  <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          {...register('currentPassword', { required: 'Le mot de passe actuel est requis' })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          {...register('newPassword', { 
                            required: 'Le nouveau mot de passe est requis',
                            minLength: { value: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
                          })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          {...register('confirmPassword', { 
                            required: 'La confirmation est requise',
                            validate: value => value === watch('newPassword') || 'Les mots de passe ne correspondent pas'
                          })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                        <span>Confirmer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          reset();
                        }}
                        className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Supprimer le compte */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-red-600 mb-4">Zone dangereuse</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Une fois votre compte supprimé, toutes vos données seront définitivement effacées. 
                  Cette action est irréversible.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Supprimer le compte</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Onglet Statistiques */}
          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Statistiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Points</p>
                      <p className="text-2xl font-bold text-blue-900">{profile?.points || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Membre depuis</p>
                      <p className="text-sm font-bold text-green-900">
                        {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Niveau</p>
                      <p className="text-lg font-bold text-purple-900">{profile?.level || 'Bronze'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Échanges</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {profile?.stats?.totalExchanges || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-medium text-gray-900">Supprimer le compte</h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit(onDeleteAccount)} className="mt-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        {...register('password', { required: 'Le mot de passe est requis' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Entrez votre mot de passe"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer la suppression
                      </label>
                      <input
                        type="text"
                        {...register('confirmDelete', { 
                          required: 'La confirmation est requise',
                          validate: value => value === 'SUPPRIMER' || 'Vous devez taper "SUPPRIMER"'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Tapez SUPPRIMER"
                      />
                      {errors.confirmDelete && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmDelete.message}</p>
                      )}
                    </div>
                    <div className="flex justify-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Supprimer définitivement
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ProfileManagementPage;
