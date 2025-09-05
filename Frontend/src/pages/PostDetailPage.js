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
  Users,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  Pin,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PostDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // Données de test (à remplacer par des vraies données de l'API)
  const mockPost = {
    id: 1,
    title: 'Recherche de bénévoles pour distribution alimentaire',
    content: `Bonjour à tous ! 

Notre association organise une grande distribution alimentaire ce samedi 15 janvier de 9h à 17h au gymnase municipal. Nous avons besoin d'aide pour :

• Accueillir les bénéficiaires
• Distribuer les denrées alimentaires
• Organiser la logistique
• Nettoyer après l'événement

C'est une expérience très enrichissante et nous serions ravis de vous accueillir ! N'hésitez pas à nous contacter si vous êtes intéressé(e).

Merci d'avance pour votre solidarité ! 🙏`,
    category: 'announcement',
    type: 'request',
    author: {
      id: 2,
      firstName: 'Marie',
      lastName: 'Dubois',
      avatar: null,
      role: 'association',
      associationName: 'Solidarité Locale',
      points: 450,
      level: 'Gold',
      isVerified: true
    },
    location: {
      address: 'Gymnase Municipal, 123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75011',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    tags: ['bénévolat', 'distribution', 'alimentaire', 'solidarité'],
    images: [
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    eventDetails: {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '17:00',
      maxParticipants: 20,
      currentParticipants: 8,
      isRecurring: false,
      requirements: ['Aucune expérience requise', 'Disponibilité toute la journée', 'Bonne humeur !']
    },
    stats: {
      views: 156,
      likes: 23,
      comments: 7,
      shares: 4,
      bookmarks: 12
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isPinned: false,
    isUrgent: true,
    urgencyLevel: 'high',
    comments: [
      {
        id: 1,
        author: {
          id: 3,
          firstName: 'Jean',
          lastName: 'Martin',
          avatar: null,
          role: 'user',
          points: 120,
          level: 'Silver'
        },
        content: 'Je suis intéressé ! J\'ai déjà participé à des distributions similaires. Comment puis-je m\'inscrire ?',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        likes: 3,
        replies: [
          {
            id: 11,
            author: {
              id: 2,
              firstName: 'Marie',
              lastName: 'Dubois',
              avatar: null,
              role: 'association'
            },
            content: 'Parfait ! Vous pouvez m\'envoyer un message privé avec vos coordonnées.',
            createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
            likes: 1
          }
        ]
      },
      {
        id: 2,
        author: {
          id: 4,
          firstName: 'Sophie',
          lastName: 'Leroy',
          avatar: null,
          role: 'user',
          points: 89,
          level: 'Bronze'
        },
        content: 'Super initiative ! Je peux venir avec mes deux enfants de 12 et 14 ans ?',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        likes: 1,
        replies: []
      },
      {
        id: 3,
        author: {
          id: 5,
          firstName: 'Pierre',
          lastName: 'Moreau',
          avatar: null,
          role: 'user',
          points: 200,
          level: 'Gold'
        },
        content: 'Je peux apporter ma camionnette pour le transport si besoin !',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        likes: 5,
        replies: []
      }
    ],
    relatedPosts: [
      {
        id: 2,
        title: 'Collecte de denrées alimentaires',
        category: 'announcement',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        stats: { likes: 15, comments: 3 }
      },
      {
        id: 3,
        title: 'Formation bénévoles accueil',
        category: 'event',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        stats: { likes: 8, comments: 2 }
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

  const getCategoryLabel = (category) => {
    const categories = {
      'announcement': 'Annonce',
      'event': 'Événement',
      'request': 'Demande',
      'offer': 'Offre',
      'question': 'Question',
      'discussion': 'Discussion'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'announcement': 'badge-info',
      'event': 'badge-primary',
      'request': 'badge-warning',
      'offer': 'badge-success',
      'question': 'badge-secondary',
      'discussion': 'badge-purple'
    };
    return colors[category] || 'badge-secondary';
  };

  const getTypeLabel = (type) => {
    const types = {
      'request': 'Demande',
      'offer': 'Offre',
      'announcement': 'Annonce',
      'question': 'Question'
    };
    return types[type] || type;
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
      case 'high': return 'Urgent';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return 'Inconnu';
    }
  };

  const isAuthor = isAuthenticated && user && user.id === mockPost.author.id;

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      // Ici, on enverrait le commentaire à l'API
      console.log('Nouveau commentaire:', newComment);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/posts"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour aux publications</span>
            </Link>
            <div className="flex items-center space-x-2">
              {mockPost.isPinned && (
                <span className="badge-warning flex items-center space-x-1">
                  <Pin className="h-3 w-3" />
                  <span>Épinglé</span>
                </span>
              )}
              {mockPost.isUrgent && (
                <span className={`badge ${getUrgencyColor(mockPost.urgencyLevel)} flex items-center space-x-1`}>
                  <AlertCircle className="h-3 w-3" />
                  <span>{getUrgencyLabel(mockPost.urgencyLevel)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Publication principale */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              {/* En-tête de la publication */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-600">
                      {mockPost.author.firstName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {mockPost.author.firstName} {mockPost.author.lastName}
                      </h3>
                      {mockPost.author.isVerified && (
                        <span className="badge-success text-xs">Vérifié</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {mockPost.author.role === 'association' && mockPost.author.associationName && (
                        <span>{mockPost.author.associationName} • </span>
                      )}
                      {mockPost.author.points} pts • {mockPost.author.level}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${getCategoryColor(mockPost.category)}`}>
                    {getCategoryLabel(mockPost.category)}
                  </span>
                  <span className="badge-secondary">
                    {getTypeLabel(mockPost.type)}
                  </span>
                </div>
              </div>

              {/* Titre et contenu */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {mockPost.title}
              </h1>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">
                  {mockPost.content}
                </p>
              </div>

              {/* Images */}
              {mockPost.images && mockPost.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockPost.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {mockPost.tags && mockPost.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {mockPost.tags.map((tag, index) => (
                      <span key={index} className="badge-secondary flex items-center space-x-1">
                        <Tag className="h-3 w-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Détails de l'événement */}
              {mockPost.eventDetails && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    <Calendar className="h-5 w-5 inline mr-2" />
                    Détails de l'événement
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Date:</span>
                      <span className="ml-2 text-blue-700">
                        {mockPost.eventDetails.date.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Heure:</span>
                      <span className="ml-2 text-blue-700">
                        {mockPost.eventDetails.startTime} - {mockPost.eventDetails.endTime}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Lieu:</span>
                      <span className="ml-2 text-blue-700">
                        {mockPost.location.address}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Participants:</span>
                      <span className="ml-2 text-blue-700">
                        {mockPost.eventDetails.currentParticipants}/{mockPost.eventDetails.maxParticipants}
                      </span>
                    </div>
                  </div>
                  {mockPost.eventDetails.requirements && mockPost.eventDetails.requirements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-blue-800 mb-2">Prérequis:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {mockPost.eventDetails.requirements.map((req, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions et métadonnées */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(mockPost.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{mockPost.location.city}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                      isLiked 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{mockPost.stats.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{mockPost.stats.comments}</span>
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                      isBookmarked 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span>{mockPost.stats.bookmarks + (isBookmarked ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200">
                    <Share2 className="h-4 w-4" />
                    <span>{mockPost.stats.shares}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Commentaires */}
            {showComments && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Commentaires ({mockPost.comments.length})
                </h2>
                
                {/* Formulaire de commentaire */}
                {isAuthenticated && (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {user.firstName[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Ajouter un commentaire..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          rows="3"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Commenter
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Liste des commentaires */}
                <div className="space-y-4">
                  {mockPost.comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {comment.author.firstName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {comment.author.firstName} {comment.author.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-gray-700">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{comment.likes}</span>
                            </button>
                            <button className="hover:text-gray-700">Répondre</button>
                          </div>
                          
                          {/* Réponses */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start space-x-3">
                                  <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">
                                      {reply.author.firstName[0]}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-gray-900">
                                        {reply.author.firstName} {reply.author.lastName}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 mb-2">{reply.content}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <button className="flex items-center space-x-1 hover:text-gray-700">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>{reply.likes}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {!isAuthor ? (
                  <>
                    {mockPost.eventDetails && (
                      <button className="btn-primary btn w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Participer à l'événement
                      </button>
                    )}
                    <button className="btn-secondary btn w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contacter l'auteur
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <button className="btn-secondary btn w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </button>
                    <button className="btn-danger btn w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </button>
                  </div>
                )}
                
                <button className="btn-secondary btn w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </button>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="btn-secondary btn w-full"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler
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
                  <span className="text-gray-600">Vues</span>
                  <span className="font-medium">{mockPost.stats.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">{mockPost.stats.likes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commentaires</span>
                  <span className="font-medium">{mockPost.stats.comments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partages</span>
                  <span className="font-medium">{mockPost.stats.shares}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sauvegardes</span>
                  <span className="font-medium">{mockPost.stats.bookmarks}</span>
                </div>
              </div>
            </div>

            {/* Publications similaires */}
            {mockPost.relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Publications similaires
                </h3>
                <div className="space-y-3">
                  {mockPost.relatedPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className={`badge ${getCategoryColor(post.category)} text-xs`}>
                          {getCategoryLabel(post.category)}
                        </span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.stats.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.stats.comments}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
