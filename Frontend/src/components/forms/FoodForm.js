import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  MapPin, 
  Tag, 
  Clock, 
  FileText,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  Calendar,
  ChefHat,
  Leaf
} from 'lucide-react';

const FoodForm = ({ onSubmit, initialData = {}, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    foodType: initialData.foodType || '',
    condition: initialData.condition || 'fresh',
    location: initialData.location || '',
    tags: initialData.tags || [],
    images: initialData.images || [],
    ingredients: initialData.ingredients || [],
    expirationDate: initialData.expirationDate || '',
    quantity: initialData.quantity || '',
    storageInstructions: initialData.storageInstructions || '',
    allergens: initialData.allergens || [],
    isEdible: initialData.isEdible !== undefined ? initialData.isEdible : true,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [newIngredient, setNewIngredient] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const foodTypes = [
    { value: 'vegetables', label: 'Légumes' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'dairy', label: 'Produits laitiers' },
    { value: 'meat', label: 'Viande' },
    { value: 'fish', label: 'Poisson' },
    { value: 'grains', label: 'Céréales' },
    { value: 'baked_goods', label: 'Pâtisseries' },
    { value: 'prepared_meals', label: 'Plats préparés' },
    { value: 'beverages', label: 'Boissons' },
    { value: 'other', label: 'Autre' }
  ];

  const conditions = [
    { value: 'fresh', label: 'Frais' },
    { value: 'good', label: 'Bon état' },
    { value: 'fair', label: 'État correct' },
    { value: 'expired', label: 'Expiré' }
  ];

  const commonAllergens = [
    'Gluten', 'Lactose', 'Œufs', 'Arachides', 'Fruits à coque',
    'Soja', 'Poisson', 'Crustacés', 'Mollusques', 'Céleri',
    'Moutarde', 'Graines de sésame', 'Sulfites', 'Lupin'
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

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (newIngredient.trim() && !formData.ingredients.includes(newIngredient.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient !== ingredientToRemove)
    }));
  };

  const handleAddAllergen = (e) => {
    e.preventDefault();
    if (newAllergen.trim() && !formData.allergens.includes(newAllergen.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, newAllergen.trim()]
      }));
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (allergenToRemove) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(allergen => allergen !== allergenToRemove)
    }));
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

    if (!formData.foodType) {
      newErrors.foodType = 'Le type d\'aliment est requis';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    if (!formData.expirationDate) {
      newErrors.expirationDate = 'La date d\'expiration est requise';
    }

    if (formData.expirationDate && new Date(formData.expirationDate) < new Date()) {
      newErrors.expirationDate = 'La date d\'expiration ne peut pas être dans le passé';
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
          Titre de l'aliment *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`input ${errors.title ? 'input-error' : ''}`}
          placeholder="Ex: Légumes bio du jardin"
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
          placeholder="Décrivez votre aliment en détail..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Type d'aliment et État */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 mb-2">
            <ChefHat className="h-4 w-4 inline mr-1" />
            Type d'aliment *
          </label>
          <select
            id="foodType"
            name="foodType"
            value={formData.foodType}
            onChange={handleInputChange}
            className={`input ${errors.foodType ? 'input-error' : ''}`}
          >
            <option value="">Sélectionner un type</option>
            {foodTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.foodType && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.foodType}
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

      {/* Date d'expiration et Quantité */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Date d'expiration *
          </label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleInputChange}
            className={`input ${errors.expirationDate ? 'input-error' : ''}`}
          />
          {errors.expirationDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.expirationDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Quantité
          </label>
          <input
            type="text"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            className="input"
            placeholder="Ex: 2kg, 5 pièces, 1 boîte"
          />
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

      {/* Ingrédients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Leaf className="h-4 w-4 inline mr-1" />
          Ingrédients
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => handleRemoveIngredient(ingredient)}
                className="ml-2 h-4 w-4 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddIngredient} className="flex space-x-2">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            className="input flex-1"
            placeholder="Ajouter un ingrédient"
          />
          <button
            type="submit"
            className="btn-secondary btn-sm"
          >
            Ajouter
          </button>
        </form>
      </div>

      {/* Allergènes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allergènes
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.allergens.map((allergen, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
            >
              {allergen}
              <button
                type="button"
                onClick={() => handleRemoveAllergen(allergen)}
                className="ml-2 h-4 w-4 text-red-600 hover:text-red-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddAllergen} className="flex space-x-2">
          <input
            type="text"
            value={newAllergen}
            onChange={(e) => setNewAllergen(e.target.value)}
            className="input flex-1"
            placeholder="Ajouter un allergène"
          />
          <button
            type="submit"
            className="btn-secondary btn-sm"
          >
            Ajouter
          </button>
        </form>
        
        {/* Allergènes courants */}
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Allergènes courants :</p>
          <div className="flex flex-wrap gap-2">
            {commonAllergens.map(allergen => (
              <button
                key={allergen}
                type="button"
                onClick={() => {
                  if (!formData.allergens.includes(allergen)) {
                    setFormData(prev => ({
                      ...prev,
                      allergens: [...prev.allergens, allergen]
                    }));
                  }
                }}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
              >
                {allergen}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions de stockage */}
      <div>
        <label htmlFor="storageInstructions" className="block text-sm font-medium text-gray-700 mb-2">
          Instructions de stockage
        </label>
        <textarea
          id="storageInstructions"
          name="storageInstructions"
          value={formData.storageInstructions}
          onChange={handleInputChange}
          rows="3"
          className="input"
          placeholder="Ex: Conserver au réfrigérateur, consommer dans les 3 jours..."
        />
      </div>

      {/* Comestibilité */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isEdible"
          name="isEdible"
          checked={formData.isEdible}
          onChange={handleInputChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isEdible" className="text-sm font-medium text-gray-700">
          Cet aliment est comestible
        </label>
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
          {isLoading ? 'Publication...' : 'Publier l\'aliment'}
        </button>
      </div>
    </form>
  );
};

export default FoodForm;
