import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Heart, 
  Share2, 
  MessageCircle, 
  User, 
  Star,
  ArrowLeft,
  Calendar,
  Truck,
  Hand,
  AlertTriangle,
  Utensils
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FoodDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);

  // Données de test (à remplacer par des vraies données de l'API)
  const mockFood = {
    id: 1,
    title: 'Légumes bio du jardin',
    description: 'Tomates, courgettes et aubergines de mon jardin bio. Récoltés ce matin, parfaits pour une ratatouille ! Tous les légumes sont cultivés sans pesticides et sont parfaitement frais.',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    foodType: 'vegetables',
    condition: 'fresh',
    location: {
      address: '789 Boulevard Saint-Germain',
      city: 'Paris',
      postalCode: '75006',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    owner: { 
      firstName: 'Sophie', 
      lastName: 'Chen', 
      avatar: null,
      points: 300,
      level: 'Gold'
    },
    pointsReward: 25,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    interactions: { views: 32, likes: 15 },
    urgency: 'medium',
    expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    ingredients: ['tomates', 'courgettes', 'aubergines'],
    aiClassification: {
      foodType: 'vegetables',
      ingredients: ['tomates', 'courgettes', 'aubergines'],
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      condition: 'fresh',
      confidence: 0.9,
      nutritionalInfo: {
        calories: 25,
        protein: 1,
        carbs: 5,
        fat: 0
      },
      allergens: [],
      isEdible: true
    },
    recipes: [
      {
        title: 'Ratatouille provençale',
        description: 'Une délicieuse ratatouille avec vos légumes frais',
        ingredients: ['tomates', 'courgettes', 'aubergines', 'oignons', 'ail', 'herbes de Provence'],
        instructions: [
          'Coupez tous les légumes en dés',
          'Faites revenir les oignons et l\'ail',
          'Ajoutez les aubergines et laissez cuire 10 min',
          'Ajoutez les courgettes et les tomates',
          'Assaisonnez avec les herbes de Provence',
          'Laissez mijoter 30 minutes'
        ],
        prepTime: '20 min',
        cookTime: '45 min',
        servings: 4,
        difficulty: 'easy',
        nutritionalInfo: {
          calories: 120,
          protein: 3,
          carbs: 25,
          fat: 2
        },
        tags: ['végétarien', 'sain', 'provençal'],
        isGenerated: true
      }
    ],
    recommendedAssociations: [
      {
        association: {
          name: 'Restos du Cœur',
          type: 'food_bank',
          address: '10 Rue de la Solidarité, Paris'
        },
        reason: 'Accepte les légumes frais pour les repas',
        priority: 5,
        isFoodBank: true
      }
    ],
    recyclingInstructions: {
      canCompost: true,
      compostInstructions: 'Les légumes peuvent être compostés directement',
      canRecycle: false,
      recycleInstructions: null,
      disposalMethod: 'compost'
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Il y a 1 jour';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
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

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'fresh': return 'badge-success';
      case 'good': return 'badge-primary';
      case 'fair': return 'badge-warning';
      case 'expired': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'fresh': return 'Frais';
      case 'good': return 'Bon';
      case 'fair': return 'Correct';
      case 'expired': return 'Expiré';
      default: return condition;
    }
  };

  const isOwner = isAuthenticated && user && user.id === mockFood.owner.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/foods"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour aux aliments</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galerie d'images */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={mockFood.images[0]}
                  alt={mockFood.title}
                  className="w-full h-96 object-cover"
                />
              </div>
              {mockFood.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {mockFood.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${mockFood.title} ${index + 2}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity duration-200"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Informations de base */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {mockFood.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(mockFood.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mockFood.location.city}, {mockFood.location.postalCode}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${getConditionColor(mockFood.condition)}`}>
                    {getConditionLabel(mockFood.condition)}
                  </span>
                  <span className={`badge ${getUrgencyColor(mockFood.urgency)}`}>
                    {getUrgencyLabel(mockFood.urgency)}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {mockFood.description}
              </p>

              {/* Ingrédients */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Ingrédients</h3>
                <div className="flex flex-wrap gap-2">
                  {mockFood.ingredients.map((ingredient, index) => (
                    <span key={index} className="badge-secondary">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Informations nutritionnelles */}
              {mockFood.aiClassification.nutritionalInfo && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">
                    🥗 Informations nutritionnelles (par 100g)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Calories:</span>
                      <span className="ml-1 text-green-700">{mockFood.aiClassification.nutritionalInfo.calories}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Protéines:</span>
                      <span className="ml-1 text-green-700">{mockFood.aiClassification.nutritionalInfo.protein}g</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Glucides:</span>
                      <span className="ml-1 text-green-700">{mockFood.aiClassification.nutritionalInfo.carbs}g</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Lipides:</span>
                      <span className="ml-1 text-green-700">{mockFood.aiClassification.nutritionalInfo.fat}g</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions de recyclage/compostage */}
              {mockFood.recyclingInstructions && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">
                    ♻️ Instructions de recyclage
                  </h3>
                  <p className="text-sm text-green-800">
                    {mockFood.recyclingInstructions.compostInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Recettes générées */}
            {mockFood.recipes && mockFood.recipes.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  <Utensils className="h-6 w-6 inline mr-2" />
                  Recettes suggérées
                </h2>
                {mockFood.recipes.map((recipe, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {recipe.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Ingrédients nécessaires</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {recipe.ingredients.map((ingredient, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Informations</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Préparation: {recipe.prepTime}</div>
                          <div>Cuisson: {recipe.cookTime}</div>
                          <div>Portions: {recipe.servings}</div>
                          <div>Difficulté: {recipe.difficulty}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        {recipe.instructions.map((instruction, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="font-medium text-primary-600">{i + 1}.</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Associations recommandées */}
            {mockFood.recommendedAssociations.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  🏢 Associations recommandées
                </h2>
                {mockFood.recommendedAssociations.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {rec.association.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {rec.association.address}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {rec.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rec.priority ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {rec.isFoodBank && (
                        <span className="text-xs text-green-600 font-medium">Banque alimentaire</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Propriétaire */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Propriétaire
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-600">
                    {mockFood.owner.firstName[0]}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {mockFood.owner.firstName} {mockFood.owner.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {mockFood.owner.points} points • {mockFood.owner.level}
                  </div>
                </div>
              </div>
              <button className="btn-secondary btn w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contacter
              </button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {!isOwner ? (
                  <>
                    <button className="btn-success btn w-full">
                      <Hand className="h-4 w-4 mr-2" />
                      Réserver cet aliment
                    </button>
                    <button
                      onClick={() => setIsInWishlist(!isInWishlist)}
                      className={`btn w-full flex items-center justify-center space-x-2 ${
                        isInWishlist ? 'btn-success' : 'btn-secondary'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                      <span>{isInWishlist ? 'Dans la wishlist' : 'Ajouter à la wishlist'}</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">C'est votre aliment</p>
                  </div>
                )}
                
                <button className="btn-secondary btn w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </button>
              </div>
            </div>

            {/* Informations */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Points de récompense</span>
                  <span className="font-medium text-primary-600">
                    +{mockFood.pointsReward} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vues</span>
                  <span className="font-medium">{mockFood.interactions.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">{mockFood.interactions.likes}</span>
                </div>
                {mockFood.expirationDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expire le</span>
                    <span className="font-medium">
                      {mockFood.expirationDate.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailPage;
