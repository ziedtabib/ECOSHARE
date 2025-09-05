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
  X,
  Edit,
  Wrench,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DIYGenerator from '../components/DIYGenerator';
import AssociationRecommendations from '../components/AssociationRecommendations';
import ContractSystem from '../components/ContractSystem';

const ObjectDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showTakeModal, setShowTakeModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDIYGenerator, setShowDIYGenerator] = useState(false);
  const [showAssociationRecommendations, setShowAssociationRecommendations] = useState(false);
  const [showContractSystem, setShowContractSystem] = useState(false);

  // Fonctions de gestion des actions
  const handleTakeObject = () => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour prendre un objet');
      return;
    }
    setShowTakeModal(true);
  };

  const handleDeclineObject = () => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour refuser une offre');
      return;
    }
    setShowDeclineModal(true);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour ajouter à la wishlist');
      return;
    }
    setIsInWishlist(!isInWishlist);
    // Ici, on pourrait appeler l'API pour sauvegarder en base
    console.log(`${isInWishlist ? 'Retiré de' : 'Ajouté à'} la wishlist:`, mockObject.id);
  };

  const confirmTakeObject = () => {
    // Logique pour confirmer la prise de l'objet
    console.log('Objet pris:', mockObject.id);
    setShowTakeModal(false);
    setShowContractSystem(true);
  };

  const handleContractSigned = (contractData) => {
    console.log('Contrat signé:', contractData);
    setShowContractSystem(false);
    // Ici, on pourrait rediriger vers une page de confirmation ou afficher un message de succès
    alert('Contrat signé avec succès ! Vous recevrez un email de confirmation.');
  };

  const confirmDeclineObject = () => {
    // Logique pour confirmer le refus de l'objet
    console.log('Offre refusée:', mockObject.id);
    setShowDeclineModal(false);
  };

  // Données de test (à remplacer par des vraies données de l'API)
  const mockObject = {
    id: 1,
    title: 'Vélo vintage en bon état',
    description: 'Magnifique vélo vintage des années 80, parfait pour se déplacer en ville. Quelques rayures mais fonctionne parfaitement. Les freins ont été révisés récemment et les pneus sont en bon état. Idéal pour les déplacements urbains ou les balades du weekend.',
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    category: 'electronics',
    condition: 'good',
    location: {
      address: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    owner: { 
      firstName: 'Marie', 
      lastName: 'Dubois', 
      avatar: null,
      points: 150,
      level: 'Silver'
    },
    pointsReward: 20,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    interactions: { views: 45, likes: 12 },
    aiClassification: {
      category: 'electronics',
      subcategory: 'transport',
      condition: 'good',
      confidence: 0.9,
      tags: ['vélo', 'transport', 'vintage', 'écologique'],
      estimatedValue: 150,
      isRecyclable: true,
      recyclingInstructions: 'Peut être réparé et réutilisé. Les pièces métalliques sont recyclables.'
    },
    diy: {
      generated: true,
      instructions: [
        {
          title: 'Transformation en vélo électrique',
          description: 'Ajoutez un kit électrique pour moderniser ce vélo vintage',
          materials: ['Kit électrique', 'Batterie', 'Outils de base'],
          steps: [
            'Retirez l\'ancien système de pédalage',
            'Installez le moteur électrique',
            'Fixez la batterie sur le cadre',
            'Connectez le système électrique',
            'Testez le fonctionnement'
          ],
          difficulty: 'medium',
          estimatedTime: '4-6 heures'
        }
      ]
    },
    recommendedAssociations: [
      {
        association: {
          name: 'Emmaüs',
          type: 'general',
          address: '25 Rue de la Réutilisation, Paris'
        },
        reason: 'Accepte les vélos pour réparation et revente',
        priority: 4
      }
    ]
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Il y a 1 jour';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const isOwner = isAuthenticated && user && user.id === mockObject.owner.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/objects"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour aux objets</span>
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
                  src={mockObject.images[0]}
                  alt={mockObject.title}
                  className="w-full h-96 object-cover"
                />
              </div>
              {mockObject.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {mockObject.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${mockObject.title} ${index + 2}`}
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
                    {mockObject.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(mockObject.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mockObject.location.city}, {mockObject.location.postalCode}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${
                    mockObject.condition === 'excellent' ? 'badge-success' :
                    mockObject.condition === 'good' ? 'badge-primary' :
                    mockObject.condition === 'fair' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {mockObject.condition === 'excellent' ? 'Excellent' :
                     mockObject.condition === 'good' ? 'Bon' :
                     mockObject.condition === 'fair' ? 'Correct' : 'Usé'}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {mockObject.description}
              </p>

              {/* Tags IA */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {mockObject.aiClassification.tags.map((tag, index) => (
                    <span key={index} className="badge-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructions de recyclage */}
              {mockObject.aiClassification.recyclingInstructions && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">
                    ♻️ Instructions de recyclage
                  </h3>
                  <p className="text-sm text-green-800">
                    {mockObject.aiClassification.recyclingInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* DIY Instructions */}
            {mockObject.diy.generated && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  💡 Idées de réutilisation
                </h2>
                {mockObject.diy.instructions.map((instruction, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {instruction.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {instruction.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Matériaux nécessaires</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {instruction.materials.map((material, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{material}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Informations</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Difficulté: {instruction.difficulty}</div>
                          <div>Temps estimé: {instruction.estimatedTime}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Associations recommandées */}
            {mockObject.recommendedAssociations.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  🏢 Associations recommandées
                </h2>
                {mockObject.recommendedAssociations.map((rec, index) => (
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
                    {mockObject.owner.firstName[0]}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {mockObject.owner.firstName} {mockObject.owner.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {mockObject.owner.points} points • {mockObject.owner.level}
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
                    {/* Prendre l'objet */}
                    <button 
                      className="btn-primary btn w-full"
                      onClick={() => handleTakeObject()}
                    >
                      <Hand className="h-4 w-4 mr-2" />
                      Prendre cet objet
                    </button>
                    
                    {/* Refuser l'offre */}
                    <button 
                      className="btn-danger btn w-full"
                      onClick={() => handleDeclineObject()}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Refuser l'offre
                    </button>
                    
                    {/* Ajouter à la wishlist */}
                    <button
                      onClick={() => handleToggleWishlist()}
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
                    <p className="text-sm">C'est votre objet</p>
                    <button className="btn-secondary btn w-full mt-3">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </button>
                  </div>
                )}
                
                <button 
                  className="btn-secondary btn w-full"
                  onClick={() => setShowDIYGenerator(true)}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Générer des DIY
                </button>
                
                <button 
                  className="btn-secondary btn w-full"
                  onClick={() => setShowAssociationRecommendations(true)}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Associations recommandées
                </button>
                
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
                    +{mockObject.pointsReward} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vues</span>
                  <span className="font-medium">{mockObject.interactions.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">{mockObject.interactions.likes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valeur estimée</span>
                  <span className="font-medium">{mockObject.aiClassification.estimatedValue}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modale de confirmation pour prendre l'objet */}
      {showTakeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prendre cet objet
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir prendre cet objet ? Vous devrez organiser la récupération avec le propriétaire.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTakeModal(false)}
                className="btn-secondary btn flex-1"
              >
                Annuler
              </button>
              <button
                onClick={confirmTakeObject}
                className="btn-primary btn flex-1"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation pour refuser l'offre */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Refuser l'offre
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir refuser cette offre ? Cette action ne peut pas être annulée.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="btn-secondary btn flex-1"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeclineObject}
                className="btn-danger btn flex-1"
              >
                Refuser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Générateur de DIY */}
      {showDIYGenerator && (
        <DIYGenerator
          objectData={mockObject}
          onClose={() => setShowDIYGenerator(false)}
        />
      )}

      {/* Recommandations d'associations */}
      {showAssociationRecommendations && (
        <AssociationRecommendations
          objectData={mockObject}
          onClose={() => setShowAssociationRecommendations(false)}
        />
      )}

      {/* Système de contrat */}
      {showContractSystem && (
        <ContractSystem
          objectData={mockObject}
          userData={user}
          onClose={() => setShowContractSystem(false)}
          onContractSigned={handleContractSigned}
        />
      )}
    </div>
  );
};

export default ObjectDetailPage;
