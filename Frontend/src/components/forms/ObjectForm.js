import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  MapPin, 
  Tag, 
  DollarSign, 
  FileText,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  Brain,
  Loader2,
  CheckCircle
} from 'lucide-react';

const ObjectForm = ({ onSubmit, initialData = {}, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    condition: initialData.condition || 'good',
    price: initialData.price || '',
    location: initialData.location || '',
    tags: initialData.tags || [],
    images: initialData.images || [],
    isFree: initialData.isFree || false,
    availability: initialData.availability || 'available',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiClassification, setAiClassification] = useState(null);
  const [showAiResults, setShowAiResults] = useState(false);

  const categories = [
    { value: 'electronics', label: 'Électronique' },
    { value: 'furniture', label: 'Mobilier' },
    { value: 'clothing', label: 'Vêtements' },
    { value: 'books', label: 'Livres' },
    { value: 'sports', label: 'Sport' },
    { value: 'home', label: 'Maison & Jardin' },
    { value: 'tools', label: 'Outils' },
    { value: 'toys', label: 'Jouets' },
    { value: 'other', label: 'Autre' }
  ];

  const conditions = [
    { value: 'new', label: 'Neuf' },
    { value: 'like_new', label: 'Comme neuf' },
    { value: 'good', label: 'Bon état' },
    { value: 'fair', label: 'État correct' },
    { value: 'poor', label: 'Mauvais état' }
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'reserved', label: 'Réservé' },
    { value: 'sold', label: 'Vendu' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Fonction pour analyser l'image avec l'IA
  const analyzeImageWithAI = async (imageFile) => {
    setIsAnalyzing(true);
    try {
      // Simuler l'appel à l'API IA (à remplacer par le vrai appel)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Données simulées de l'IA
      const mockAiResult = {
        category: 'electronics',
        subcategory: 'transport',
        condition: 'good',
        confidence: 0.92,
        tags: ['vélo', 'transport', 'vintage', 'écologique'],
        estimatedValue: 150,
        isRecyclable: true,
        recyclingInstructions: 'Peut être réparé et réutilisé. Les pièces métalliques sont recyclables.'
      };
      
      setAiClassification(mockAiResult);
      setShowAiResults(true);
      
      // Auto-remplir le formulaire avec les résultats de l'IA
      setFormData(prev => ({
        ...prev,
        category: mockAiResult.category,
        condition: mockAiResult.condition,
        tags: [...new Set([...prev.tags, ...mockAiResult.tags])],
        price: mockAiResult.estimatedValue?.toString() || prev.price
      }));
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      alert('Erreur lors de l\'analyse de l\'image. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiResults = () => {
    if (aiClassification) {
      setFormData(prev => ({
        ...prev,
        category: aiClassification.category,
        condition: aiClassification.condition,
        tags: [...new Set([...prev.tags, ...aiClassification.tags])],
        price: aiClassification.estimatedValue?.toString() || prev.price
      }));
      setShowAiResults(false);
    }
  };

  const dismissAiResults = () => {
    setShowAiResults(false);
    setAiClassification(null);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));

    // Analyser la première image avec l'IA si c'est la première image
    if (files.length > 0 && formData.images.length === 0) {
      analyzeImageWithAI(files[0]);
    }
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Date.now() + Math.random()
      }));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    if (!formData.isFree && !formData.price) {
      newErrors.price = 'Le prix est requis pour les objets payants';
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Le prix doit être un nombre valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Titre de l'objet *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`input ${errors.title ? 'input-error' : ''}`}
          placeholder="Ex: Vélo de ville en bon état"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          className={`input ${errors.description ? 'input-error' : ''}`}
          placeholder="Décrivez votre objet en détail..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Catégorie et État */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`input ${errors.category ? 'input-error' : ''}`}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.category}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
            État
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            className="input"
          >
            {conditions.map(condition => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prix et Disponibilité */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              id="isFree"
              name="isFree"
              checked={formData.isFree}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
              Offrir gratuitement
            </label>
          </div>
          
          {!formData.isFree && (
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`input pl-10 ${errors.price ? 'input-error' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
            Disponibilité
          </label>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleInputChange}
            className="input"
          >
            {availabilityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Localisation */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-1" />
          Localisation *
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className={`input ${errors.location ? 'input-error' : ''}`}
          placeholder="Ex: Paris 11ème, France"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.location}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="h-4 w-4 inline mr-1" />
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 h-4 w-4 text-primary-600 hover:text-primary-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddTag} className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="input flex-1"
            placeholder="Ajouter un tag"
          />
          <button
            type="submit"
            className="btn-secondary btn-sm"
          >
            Ajouter
          </button>
        </form>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Camera className="h-4 w-4 inline mr-1" />
          Photos
        </label>
        
        {/* Zone de téléchargement */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Glissez-déposez vos images ici ou
          </p>
          <label htmlFor="images" className="btn-secondary btn-sm cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Parcourir
          </label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Aperçu des images */}
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Indicateur d'analyse IA */}
        {isAnalyzing && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Analyse de l'image en cours...
                </p>
                <p className="text-xs text-blue-700">
                  L'IA détecte et classe votre objet automatiquement
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Résultats de l'analyse IA */}
        {showAiResults && aiClassification && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-green-600" />
                <h4 className="text-sm font-medium text-green-900">
                  Analyse IA terminée
                </h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {Math.round(aiClassification.confidence * 100)}% de confiance
                </span>
              </div>
              <button
                type="button"
                onClick={dismissAiResults}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Catégorie détectée:</span>
                <span className="font-medium text-green-900">
                  {categories.find(c => c.value === aiClassification.category)?.label || aiClassification.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">État estimé:</span>
                <span className="font-medium text-green-900">
                  {conditions.find(c => c.value === aiClassification.condition)?.label || aiClassification.condition}
                </span>
              </div>
              {aiClassification.estimatedValue && (
                <div className="flex justify-between">
                  <span className="text-green-700">Valeur estimée:</span>
                  <span className="font-medium text-green-900">
                    {aiClassification.estimatedValue}€
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-green-700">Tags détectés:</span>
                <div className="flex flex-wrap gap-1">
                  {aiClassification.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <button
                type="button"
                onClick={applyAiResults}
                className="btn-primary btn-sm flex items-center space-x-1"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Appliquer les suggestions</span>
              </button>
              <button
                type="button"
                onClick={dismissAiResults}
                className="btn-secondary btn-sm"
              >
                Ignorer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          className="btn-secondary btn"
          onClick={() => window.history.back()}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Publication...' : 'Publier l\'objet'}
        </button>
      </div>
    </form>
  );
};

export default ObjectForm;
