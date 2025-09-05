import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import config from '../config/config';
import { 
  MapPin, 
  Package, 
  Camera, 
  X, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAuthToken } from '../services/api';

const CreateObjectPage = () => {
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
    setValue
  } = useForm();

  const categories = [
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

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Bon' },
    { value: 'fair', label: 'Correct' },
    { value: 'poor', label: 'Usé' }
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

      const response = await fetch(`${config.api.baseURL}/ai/classify-object`, {
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
        setValue('category', classification.category || '');
        setValue('condition', classification.condition || '');
        
        // Afficher les résultats de l'analyse
        alert(`Analyse IA terminée !\n\nCatégorie: ${classification.category}\nÉtat: ${classification.condition}\nValeur estimée: ${classification.estimatedValue}€\nRecyclable: ${classification.isRecyclable ? 'Oui' : 'Non'}`);
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
      
      // Créer l'objet dans le format attendu par le backend
      const newObject = {
        title: data.title,
        description: data.description,
        category: data.category,
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
          category: data.category || 'other',
          condition: data.condition || 'good',
          confidence: 0.8
        },
        isFree: true,
        availability: 'available'
      };
      
      // Envoyer à l'API backend
      const token = getAuthToken();
      const response = await fetch(`${config.api.baseURL}/objects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newObject)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la création de l\'objet');
      }
      
      console.log('Objet créé via API:', result);
      
      setIsSuccess(true);
      
      // Recharger les données utilisateur pour mettre à jour les points
      await loadUser();
      
      // Rediriger vers la page des objets après 2 secondes
      setTimeout(() => {
        navigate('/objects');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'objet:', error);
      setError('root', { message: 'Erreur lors de la création de l\'objet' });
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
            Objet créé avec succès !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre objet a été publié et est maintenant visible par la communauté.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/objects')}
              className="btn-primary btn flex-1"
            >
              Voir les objets
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
              Ajouter un objet
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Partagez un objet que vous n'utilisez plus et donnez-lui une seconde vie
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
                Photos de l'objet
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
                    Titre de l'objet *
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Ex: Vélo vintage en bon état"
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
                    placeholder="Décrivez l'objet, son état, son histoire..."
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

                {/* Catégorie et état */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="form-error">{errors.category.message}</p>
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
                className="btn-primary btn-lg flex-1 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Package className="h-5 w-5" />
                    <span>Publier l'objet</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/objects')}
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

export default CreateObjectPage;
