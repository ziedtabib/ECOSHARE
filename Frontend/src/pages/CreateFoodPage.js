import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import config from '../config/config';
import { 
  Upload, 
  MapPin, 
  Heart, 
  Camera, 
  X, 
  AlertCircle,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAuthToken } from '../services/api';

const CreateFoodPage = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch
  } = useForm();

  const foodTypes = [
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

  const conditions = [
    { value: 'fresh', label: 'Frais' },
    { value: 'good', label: 'Bon' },
    { value: 'fair', label: 'Correct' },
    { value: 'expired', label: 'Expiré' }
  ];

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

  const handleAIAnalysis = async () => {
    if (images.length === 0) {
      setError('images', { message: 'Veuillez d\'abord ajouter des images' });
      return;
    }

    setIsLoading(true);
    try {
      // Prendre la première image pour l'analyse
      const firstImage = images[0];
      const formData = new FormData();
      formData.append('image', firstImage.file);

      // Récupérer le token d'authentification
      const token = getAuthToken();

      if (!token) {
        throw new Error('Vous devez être connecté pour utiliser cette fonctionnalité');
      }

      const response = await fetch(`${config.api.baseURL}/ai/classify-food`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success && data.classification) {
        const classification = data.classification;
        
        // Remplir automatiquement les champs avec les résultats de l'IA
        setValue('foodType', classification.foodType || '');
        setValue('condition', classification.condition || '');
        
        // Afficher les résultats de l'analyse
        alert(`Analyse IA terminée !\n\nType d'aliment: ${classification.foodType}\nÉtat: ${classification.condition}\nComestible: ${classification.isEdible ? 'Oui' : 'Non'}\nDate d'expiration: ${classification.expirationDate || 'Non détectée'}`);
      } else {
        throw new Error('Erreur lors de l\'analyse IA');
      }
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      setError('root', { message: 'Erreur lors de l\'analyse IA. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      setError('images', { message: 'Au moins une image est requise' });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Données du formulaire:', data);
      console.log('Images:', images);
      
      // Créer l'aliment dans le format attendu par le backend
      const newFood = {
        title: data.title,
        description: data.description,
        foodType: data.foodType,
        condition: data.condition,
        location: {
          address: data.address,
          city: data.city,
          postalCode: data.postalCode
        },
        images: images.map(img => ({
          url: img.preview,
          alt: data.title
        })),
        aiClassification: {
          foodType: data.foodType || 'other',
          ingredients: data.ingredients ? data.ingredients.split(',').map(ing => ing.trim()) : [],
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        urgency: data.urgency || 'medium',
        expirationDate: data.expirationDate ? new Date(data.expirationDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ingredients: data.ingredients ? data.ingredients.split(',').map(ing => ing.trim()) : []
      };
      
      // Envoyer à l'API backend
      const token = getAuthToken();
      const response = await fetch(`${config.api.baseURL}/foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newFood)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la création de l\'aliment');
      }
      
      console.log('Aliment créé via API:', result);
      
      setIsSuccess(true);
      
      // Recharger les données utilisateur pour mettre à jour les points
      await loadUser();
      
      // Rediriger vers la page des aliments après 2 secondes
      setTimeout(() => {
        navigate('/foods');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'aliment:', error);
      setError('root', { message: 'Erreur lors de la création de l\'aliment' });
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
            Aliment créé avec succès !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre aliment a été publié et est maintenant visible par la communauté.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/foods')}
              className="btn-primary btn flex-1"
            >
              Voir les aliments
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
              Ajouter un aliment
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Partagez des aliments frais et réduisez le gaspillage alimentaire
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
                Photos de l'aliment
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
                  
                  {/* Bouton d'analyse IA */}
                  {user && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={handleAIAnalysis}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Package className="h-4 w-4" />
                        <span>Analyser avec l'IA</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {errors.images && (
                <p className="form-error mt-2">{errors.images.message}</p>
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
                    Titre de l'aliment *
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Ex: Légumes bio du jardin"
                    {...register('title', {
                      required: 'Le titre est requis',
                      minLength: {
                        value: 3,
                        message: 'Le titre doit contenir au moins 3 caractères'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Le titre ne peut pas dépasser 100 caractères'
                      }
                    })}
                  />
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description" className="label">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className={`input ${errors.description ? 'input-error' : ''}`}
                    placeholder="Décrivez l'aliment, sa fraîcheur, sa provenance..."
                    {...register('description', {
                      required: 'La description est requise',
                      minLength: {
                        value: 10,
                        message: 'La description doit contenir au moins 10 caractères'
                      },
                      maxLength: {
                        value: 500,
                        message: 'La description ne peut pas dépasser 500 caractères'
                      }
                    })}
                  />
                  {errors.description && (
                    <p className="form-error">{errors.description.message}</p>
                  )}
                </div>

                {/* Type et état */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="foodType" className="label">
                      Type d'aliment *
                    </label>
                    <select
                      id="foodType"
                      className={`input ${errors.foodType ? 'input-error' : ''}`}
                      {...register('foodType', {
                        required: 'Le type d\'aliment est requis'
                      })}
                    >
                      <option value="">Sélectionnez un type</option>
                      {foodTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.foodType && (
                      <p className="form-error">{errors.foodType.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="condition" className="label">
                      État *
                    </label>
                    <select
                      id="condition"
                      className={`input ${errors.condition ? 'input-error' : ''}`}
                      {...register('condition', {
                        required: 'L\'état est requis'
                      })}
                    >
                      <option value="">Sélectionnez l'état</option>
                      {conditions.map(condition => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                    {errors.condition && (
                      <p className="form-error">{errors.condition.message}</p>
                    )}
                  </div>
                </div>

                {/* Date d'expiration */}
                <div className="form-group">
                  <label htmlFor="expirationDate" className="label">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Date d'expiration
                  </label>
                  <input
                    id="expirationDate"
                    type="date"
                    className={`input ${errors.expirationDate ? 'input-error' : ''}`}
                    {...register('expirationDate')}
                  />
                  <p className="form-help">
                    Facultatif - Aide à déterminer l'urgence de l'aliment
                  </p>
                </div>

                {/* Ingrédients */}
                <div className="form-group">
                  <label htmlFor="ingredients" className="label">
                    Ingrédients principaux
                  </label>
                  <input
                    id="ingredients"
                    type="text"
                    className={`input ${errors.ingredients ? 'input-error' : ''}`}
                    placeholder="Ex: tomates, courgettes, aubergines (séparés par des virgules)"
                    {...register('ingredients')}
                  />
                  <p className="form-help">
                    Facultatif - Liste des ingrédients principaux
                  </p>
                </div>
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
                    placeholder="Ex: Avenue Habib Bourguiba"
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
                      placeholder="Ex: Tunis"
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
                      placeholder="Ex: 1000"
                      {...register('postalCode', {
                        required: 'Le code postal est requis',
                        pattern: {
                          value: /^[0-9]{4}$/,
                          message: 'Code postal tunisien invalide (4 chiffres)'
                        },
                        validate: {
                          validRange: (value) => {
                            const code = parseInt(value);
                            return (code >= 1000 && code <= 8199) || 'Code postal tunisien invalide (1000-8199)';
                          }
                        }
                      })}
                    />
                    {errors.postalCode && (
                      <p className="form-error">{errors.postalCode.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Format tunisien : 4 chiffres (ex: 1000 pour Tunis)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-success btn-lg flex-1 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    <span>Publier l'aliment</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/foods')}
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

export default CreateFoodPage;
