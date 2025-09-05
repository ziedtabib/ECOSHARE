import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  X, 
  AlertCircle,
  CheckCircle,
  Users,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { associationService } from '../services/api';

const CreateAssociationPage = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  const associationTypes = [
    { value: 'food_bank', label: 'Banque alimentaire' },
    { value: 'clothing', label: 'Vêtements' },
    { value: 'furniture', label: 'Meubles' },
    { value: 'books', label: 'Livres' },
    { value: 'toys', label: 'Jouets' },
    { value: 'electronics', label: 'Électronique' },
    { value: 'general', label: 'Généraliste' },
    { value: 'environmental', label: 'Environnementale' },
    { value: 'social', label: 'Sociale' },
    { value: 'other', label: 'Autre' }
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

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Préparer les données de l'association
      const associationData = {
        name: data.name,
        description: data.description,
        type: data.type, // Utiliser 'type' au lieu de 'category'
        address: {
          street: data.street,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country || 'France'
        },
        contact: {
          phone: data.phone,
          email: data.email,
          website: data.website,
          socialMedia: {
            facebook: data.facebook,
            instagram: data.instagram,
            twitter: data.twitter
          }
        },
        mission: data.mission,
        targetAudience: data.targetAudience,
        needs: data.needs ? data.needs.split(',').map(need => ({
          category: 'other',
          description: need.trim(),
          priority: 'medium',
          quantity: 1,
          unit: 'pièce'
        })) : [],
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };

      // Créer l'association via l'API
      const logoFile = images.length > 0 ? images[0].file : null;
      const result = await associationService.createAssociation(associationData, logoFile);
      
      if (result.success) {
        setIsSuccess(true);
        
        // Rediriger vers la page des associations après 2 secondes
        setTimeout(() => {
          navigate('/associations');
        }, 2000);
      } else {
        setError('root', { message: result.message || 'Erreur lors de la création de l\'association' });
      }
      
    } catch (error) {
      console.error('Erreur création association:', error);
      setError('root', { 
        message: error.response?.data?.message || 'Erreur lors de la création de l\'association' 
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
          className="bg-white rounded-xl shadow-soft p-8 text-center max-w-md w-full mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Association créée !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre association a été créée avec succès et est maintenant visible par la communauté.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Créer une association
              </h1>
              <p className="text-gray-600 mt-2">
                Partagez votre mission avec la communauté ECOSHARE
              </p>
            </div>
            <button
              onClick={() => navigate('/associations')}
              className="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Informations générales */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-green-500" />
                Informations générales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'association *
                  </label>
                  <input
                    {...register('name', { required: 'Le nom est requis' })}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: Les Restos du Cœur"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'association *
                  </label>
                  <select
                    {...register('type', { required: 'Le type est requis' })}
                    className="input w-full"
                  >
                    <option value="">Sélectionner un type</option>
                    {associationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <input
                    {...register('category')}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: Solidarité alimentaire"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register('description', { required: 'La description est requise' })}
                    rows={4}
                    className="input w-full"
                    placeholder="Décrivez votre association, ses objectifs et ses activités..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mission
                  </label>
                  <textarea
                    {...register('mission')}
                    rows={3}
                    className="input w-full"
                    placeholder="Quelle est la mission principale de votre association ?"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public cible
                  </label>
                  <input
                    {...register('targetAudience')}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: Familles en difficulté, personnes âgées, enfants..."
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-500" />
                Adresse
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    {...register('street', { required: 'L\'adresse est requise' })}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: 10 Rue de la Solidarité"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    {...register('city', { required: 'La ville est requise' })}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: Paris"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    {...register('postalCode', { required: 'Le code postal est requis' })}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: 75012"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: France"
                    defaultValue="France"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-500" />
                Contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input w-full"
                    placeholder="Ex: +33 1 42 36 36 36"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email', { 
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide'
                      }
                    })}
                    type="email"
                    className="input w-full"
                    placeholder="Ex: contact@association.org"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    {...register('website')}
                    type="url"
                    className="input w-full"
                    placeholder="Ex: https://www.association.org"
                  />
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-green-500" />
                Réseaux sociaux
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    {...register('facebook')}
                    type="url"
                    className="input w-full"
                    placeholder="https://facebook.com/association"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    {...register('instagram')}
                    type="url"
                    className="input w-full"
                    placeholder="https://instagram.com/association"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    {...register('twitter')}
                    type="url"
                    className="input w-full"
                    placeholder="https://twitter.com/association"
                  />
                </div>
              </div>
            </div>

            {/* Besoins et tags */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-green-500" />
                Besoins et tags
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Besoins (séparés par des virgules)
                  </label>
                  <input
                    {...register('needs')}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: bénévoles, dons alimentaires, matériel..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="input w-full"
                    placeholder="Ex: solidarité, environnement, éducation..."
                  />
                </div>
              </div>
            </div>

            {/* Erreur générale */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{errors.root.message}</p>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/associations')}
                className="btn-secondary"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </div>
                ) : (
                  'Créer l\'association'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAssociationPage;
