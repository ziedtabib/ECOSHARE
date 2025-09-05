import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  MapPin, 
  MessageCircle, 
  Camera, 
  X, 
  AlertCircle,
  CheckCircle,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { postService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CreatePostPage = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const postTypes = [
    { value: 'help_request', label: 'Demande d\'aide' },
    { value: 'announcement', label: 'Annonce' },
    { value: 'success_story', label: 'Histoire de succès' },
    { value: 'tip', label: 'Conseil' },
    { value: 'event', label: 'Événement' },
    { value: 'general', label: 'Général' }
  ];

  const postCategories = [
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

  const urgencyLevels = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyen' },
    { value: 'high', label: 'Élevé' },
    { value: 'critical', label: 'Critique' }
  ];

  const selectedType = watch('type');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Préparer les données du post
      const postData = {
        title: data.title,
        content: data.content,
        type: data.type,
        category: data.category,
        location: {
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          radius: data.radius || 10
        },
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        details: {}
      };

      // Ajouter les détails spécifiques selon le type
      if (data.type === 'help_request') {
        postData.details.helpRequest = {
          urgency: data.urgency || 'medium',
          targetQuantity: data.targetQuantity || 1,
          unit: data.unit || 'items',
          deadline: data.deadline ? new Date(data.deadline) : null
        };
      } else if (data.type === 'event') {
        postData.details.event = {
          date: data.eventDate ? new Date(data.eventDate) : null,
          maxParticipants: data.maxParticipants || null,
          registrationRequired: data.registrationRequired || false
        };
      }

      // Créer le post via l'API
      const result = await postService.createPost(postData);
      
      if (result.success) {
        setIsSuccess(true);
        
        // Rediriger vers la page des posts après 2 secondes
        setTimeout(() => {
          navigate('/posts');
        }, 2000);
      } else {
        setError('root', { message: result.message || 'Erreur lors de la création du post' });
      }
      
    } catch (error) {
      console.error('Erreur création post:', error);
      setError('root', { 
        message: error.response?.data?.message || 'Erreur lors de la création du post' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-strong p-8 text-center max-w-md w-full mx-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Post créé avec succès !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre post a été publié et est maintenant visible par la communauté.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/posts')}
              className="btn-primary btn flex-1"
            >
              Voir les posts
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary btn flex-1"
            >
              Tableau de bord
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Créer un post
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Partagez une demande d'aide, un événement ou une actualité avec la communauté
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Erreur générale */}
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{errors.root.message}</p>
              </motion.div>
            )}

            {/* Upload d'images */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Images (optionnel)
              </h2>
              
              {/* Zone d'upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Camera className="h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="text-primary-600 font-medium">Cliquez pour ajouter des photos</span>
                    <br />
                    ou glissez-déposez vos images ici
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG jusqu'à 10MB
                  </div>
                </label>
              </div>

              {/* Aperçu des images */}
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt="Aperçu"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Informations de base */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations de base
              </h2>
              
              <div className="space-y-6">
                {/* Titre */}
                <div className="form-group">
                  <label htmlFor="title" className="label">
                    Titre du post *
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Ex: Collecte de jouets pour l'hôpital"
                    {...register('title', {
                      required: 'Le titre est requis',
                      minLength: {
                        value: 5,
                        message: 'Le titre doit contenir au moins 5 caractères'
                      },
                      maxLength: {
                        value: 200,
                        message: 'Le titre ne peut pas dépasser 200 caractères'
                      }
                    })}
                  />
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>

                {/* Contenu */}
                <div className="form-group">
                  <label htmlFor="content" className="label">
                    Contenu *
                  </label>
                  <textarea
                    id="content"
                    rows={6}
                    className={`input ${errors.content ? 'input-error' : ''}`}
                    placeholder="Décrivez votre demande, événement ou actualité..."
                    {...register('content', {
                      required: 'Le contenu est requis',
                      minLength: {
                        value: 20,
                        message: 'Le contenu doit contenir au moins 20 caractères'
                      },
                      maxLength: {
                        value: 2000,
                        message: 'Le contenu ne peut pas dépasser 2000 caractères'
                      }
                    })}
                  />
                  {errors.content && (
                    <p className="form-error">{errors.content.message}</p>
                  )}
                </div>

                {/* Type et catégorie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="type" className="label">
                      Type de post *
                    </label>
                    <select
                      id="type"
                      className={`input ${errors.type ? 'input-error' : ''}`}
                      {...register('type', {
                        required: 'Le type de post est requis'
                      })}
                    >
                      <option value="">Sélectionnez un type</option>
                      {postTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="form-error">{errors.type.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="category" className="label">
                      Catégorie *
                    </label>
                    <select
                      id="category"
                      className={`input ${errors.category ? 'input-error' : ''}`}
                      {...register('category', {
                        required: 'La catégorie est requise'
                      })}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {postCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="form-error">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                {/* Détails spécifiques pour les demandes d'aide */}
                {selectedType === 'help_request' && (
                  <div className="bg-red-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-medium text-red-900">
                      <AlertTriangle className="h-5 w-5 inline mr-2" />
                      Détails de la demande d'aide
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="urgency" className="label">
                          Niveau d'urgence *
                        </label>
                        <select
                          id="urgency"
                          className={`input ${errors.urgency ? 'input-error' : ''}`}
                          {...register('urgency', {
                            required: 'Le niveau d\'urgence est requis'
                          })}
                        >
                          <option value="">Sélectionnez l'urgence</option>
                          {urgencyLevels.map(level => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                        {errors.urgency && (
                          <p className="form-error">{errors.urgency.message}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="targetQuantity" className="label">
                          Quantité cible
                        </label>
                        <input
                          id="targetQuantity"
                          type="number"
                          className={`input ${errors.targetQuantity ? 'input-error' : ''}`}
                          placeholder="Ex: 50"
                          {...register('targetQuantity')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="unit" className="label">
                          Unité
                        </label>
                        <input
                          id="unit"
                          type="text"
                          className={`input ${errors.unit ? 'input-error' : ''}`}
                          placeholder="Ex: jouets, vêtements"
                          {...register('unit')}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="deadline" className="label">
                          Date limite
                        </label>
                        <input
                          id="deadline"
                          type="date"
                          className={`input ${errors.deadline ? 'input-error' : ''}`}
                          {...register('deadline')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Détails spécifiques pour les événements */}
                {selectedType === 'event' && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-medium text-blue-900">
                      <Users className="h-5 w-5 inline mr-2" />
                      Détails de l'événement
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="startDate" className="label">
                          Date de début *
                        </label>
                        <input
                          id="startDate"
                          type="datetime-local"
                          className={`input ${errors.startDate ? 'input-error' : ''}`}
                          {...register('startDate', {
                            required: 'La date de début est requise'
                          })}
                        />
                        {errors.startDate && (
                          <p className="form-error">{errors.startDate.message}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="endDate" className="label">
                          Date de fin
                        </label>
                        <input
                          id="endDate"
                          type="datetime-local"
                          className={`input ${errors.endDate ? 'input-error' : ''}`}
                          {...register('endDate')}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="maxParticipants" className="label">
                        Nombre maximum de participants
                      </label>
                      <input
                        id="maxParticipants"
                        type="number"
                        className={`input ${errors.maxParticipants ? 'input-error' : ''}`}
                        placeholder="Ex: 20"
                        {...register('maxParticipants')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <MapPin className="h-5 w-5 inline mr-2" />
                Localisation
              </h2>
              
              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="address" className="label">
                    Adresse *
                  </label>
                  <input
                    id="address"
                    type="text"
                    className={`input ${errors.address ? 'input-error' : ''}`}
                    placeholder="Ex: 123 Rue de la Paix"
                    {...register('address', {
                      required: 'L\'adresse est requise'
                    })}
                  />
                  {errors.address && (
                    <p className="form-error">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="city" className="label">
                      Ville *
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={`input ${errors.city ? 'input-error' : ''}`}
                      placeholder="Ex: Paris"
                      {...register('city', {
                        required: 'La ville est requise'
                      })}
                    />
                    {errors.city && (
                      <p className="form-error">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="postalCode" className="label">
                      Code postal *
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      className={`input ${errors.postalCode ? 'input-error' : ''}`}
                      placeholder="Ex: 75001"
                      {...register('postalCode', {
                        required: 'Le code postal est requis',
                        pattern: {
                          value: /^[0-9]{5}$/,
                          message: 'Code postal invalide'
                        }
                      })}
                    />
                    {errors.postalCode && (
                      <p className="form-error">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="radius" className="label">
                    Rayon de visibilité (km)
                  </label>
                  <input
                    id="radius"
                    type="number"
                    min="1"
                    max="100"
                    className={`input ${errors.radius ? 'input-error' : ''}`}
                    placeholder="Ex: 10"
                    defaultValue="10"
                    {...register('radius')}
                  />
                  <p className="form-help">
                    Détermine dans quelle zone votre post sera visible
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary btn-lg flex-1 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    <span>Publier le post</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/posts')}
                className="btn-secondary btn-lg flex-1"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
