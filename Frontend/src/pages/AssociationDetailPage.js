import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Heart, 
  Share2, 
  MessageCircle, 
  Users, 
  Star,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Globe,
  Award,
  Target,
  HeartHandshake,
  Building2,
  Map
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AssociationDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Données de test (à remplacer par des vraies données de l'API)
  const mockAssociation = {
    id: 1,
    name: 'Les Restos du Cœur',
    description: 'Association caritative française créée en 1985 par Coluche. Nous luttons contre la pauvreté et l\'exclusion en distribuant des repas gratuits aux plus démunis. Notre mission est de venir en aide aux personnes en situation de précarité alimentaire.',
    logo: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    images: [
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    type: 'food_bank',
    category: 'social',
    address: {
      street: '10 Rue de la Solidarité',
      city: 'Paris',
      postalCode: '75012',
      country: 'France',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    contact: {
      phone: '+33 1 42 36 36 36',
      email: 'contact@restosducoeur.org',
      website: 'https://www.restosducoeur.org'
    },
    socialMedia: {
      facebook: 'https://facebook.com/restosducoeur',
      twitter: 'https://twitter.com/restosducoeur',
      instagram: 'https://instagram.com/restosducoeur'
    },
    mission: 'Lutter contre la pauvreté et l\'exclusion en distribuant des repas gratuits aux plus démunis',
    activities: [
      'Distribution de repas chauds',
      'Collecte de denrées alimentaires',
      'Accompagnement social',
      'Formation professionnelle',
      'Aide au logement'
    ],
    needs: [
      'Denrées alimentaires non périssables',
      'Légumes frais',
      'Produits d\'hygiène',
      'Vêtements chauds',
      'Bénévoles pour la distribution'
    ],
    stats: {
      members: 1500,
      volunteers: 450,
      beneficiaries: 12000,
      mealsServed: 50000,
      rating: 4.8,
      reviews: 1250
    },
    verification: {
      isVerified: true,
      verifiedAt: new Date('2020-01-15'),
      documents: ['statuts', 'agrément', 'comptes_annuels']
    },
    availability: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '10:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false }
    },
    events: [
      {
        id: 1,
        title: 'Collecte de denrées alimentaires',
        description: 'Grande collecte annuelle de denrées non périssables',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Place de la République',
        type: 'collecte',
        maxParticipants: 100,
        currentParticipants: 45
      },
      {
        id: 2,
        title: 'Formation bénévoles',
        description: 'Formation pour nouveaux bénévoles sur l\'accueil et l\'accompagnement',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'Siège de l\'association',
        type: 'formation',
        maxParticipants: 20,
        currentParticipants: 12
      }
    ],
    recentPosts: [
      {
        id: 1,
        title: 'Merci pour votre générosité !',
        content: 'Grâce à vos dons, nous avons pu servir 500 repas supplémentaires cette semaine.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        likes: 45,
        comments: 12
      },
      {
        id: 2,
        title: 'Nouvelle campagne de collecte',
        content: 'Nous lançons une nouvelle campagne pour collecter des produits d\'hygiène.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        likes: 32,
        comments: 8
      }
    ],
    partnerships: [
      {
        name: 'Carrefour',
        type: 'partenaire',
        description: 'Dons réguliers de denrées alimentaires'
      },
      {
        name: 'Mairie de Paris',
        type: 'institutionnel',
        description: 'Soutien logistique et financier'
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

  const getTypeLabel = (type) => {
    const types = {
      'food_bank': 'Banque alimentaire',
      'shelter': 'Hébergement',
      'education': 'Éducation',
      'health': 'Santé',
      'environment': 'Environnement',
      'social': 'Social'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'food_bank': 'badge-success',
      'shelter': 'badge-primary',
      'education': 'badge-info',
      'health': 'badge-danger',
      'environment': 'badge-success',
      'social': 'badge-warning'
    };
    return colors[type] || 'badge-secondary';
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'social': 'Social',
      'environmental': 'Environnemental',
      'educational': 'Éducatif',
      'health': 'Santé',
      'cultural': 'Culturel',
      'sport': 'Sport'
    };
    return categories[category] || category;
  };

  const isOwner = isAuthenticated && user && user.role === 'association' && user.associationId === mockAssociation.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/associations"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour aux associations</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* En-tête de l'association */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-start space-x-6">
                <div className="h-24 w-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={mockAssociation.logo}
                    alt={mockAssociation.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {mockAssociation.name}
                      </h1>
                      <div className="flex items-center space-x-4 mb-3">
                        <span className={`badge ${getTypeColor(mockAssociation.type)}`}>
                          {getTypeLabel(mockAssociation.type)}
                        </span>
                        <span className="badge-secondary">
                          {getCategoryLabel(mockAssociation.category)}
                        </span>
                        {mockAssociation.verification.isVerified && (
                          <span className="badge-success flex items-center space-x-1">
                            <Award className="h-3 w-3" />
                            <span>Vérifiée</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900">
                          {mockAssociation.stats.rating}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({mockAssociation.stats.reviews} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    {mockAssociation.description}
                  </p>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {mockAssociation.address.street}, {mockAssociation.address.city} {mockAssociation.address.postalCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission et activités */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                <Target className="h-6 w-6 inline mr-2" />
                Mission et activités
              </h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notre mission</h3>
                <p className="text-gray-700 mb-4">
                  {mockAssociation.mission}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Nos activités</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockAssociation.activities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Besoins */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                <HeartHandshake className="h-6 w-6 inline mr-2" />
                Nos besoins
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockAssociation.needs.map((need, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">{need}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Événements à venir */}
            {mockAssociation.events.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  <Calendar className="h-6 w-6 inline mr-2" />
                  Événements à venir
                </h2>
                <div className="space-y-4">
                  {mockAssociation.events.map((event) => (
                    <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <span className="badge-secondary text-xs">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{event.date.toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {event.currentParticipants}/{event.maxParticipants} participants
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-primary-500 h-2 rounded-full" 
                              style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publications récentes */}
            {mockAssociation.recentPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Publications récentes
                </h2>
                <div className="space-y-4">
                  {mockAssociation.recentPosts.map((post) => (
                    <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(post.createdAt)}</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partenaires */}
            {mockAssociation.partnerships.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  <Building2 className="h-6 w-6 inline mr-2" />
                  Nos partenaires
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAssociation.partnerships.map((partnership, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {partnership.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {partnership.description}
                      </p>
                      <span className="badge-secondary text-xs">
                        {partnership.type}
                      </span>
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
                {!isOwner ? (
                  <>
                    <button className="btn-primary btn w-full">
                      <HeartHandshake className="h-4 w-4 mr-2" />
                      Faire un don
                    </button>
                    <button className="btn-secondary btn w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Devenir bénévole
                    </button>
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`btn w-full flex items-center justify-center space-x-2 ${
                        isFollowing ? 'btn-success' : 'btn-secondary'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                      <span>{isFollowing ? 'Suivie' : 'Suivre'}</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">C'est votre association</p>
                  </div>
                )}
                
                <button className="btn-secondary btn w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{mockAssociation.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{mockAssociation.contact.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a 
                    href={mockAssociation.contact.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Site web
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    {mockAssociation.address.street}<br />
                    {mockAssociation.address.city} {mockAssociation.address.postalCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistiques
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Membres</span>
                  <span className="font-medium">{mockAssociation.stats.members.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bénévoles</span>
                  <span className="font-medium">{mockAssociation.stats.volunteers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bénéficiaires</span>
                  <span className="font-medium">{mockAssociation.stats.beneficiaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Repas servis</span>
                  <span className="font-medium">{mockAssociation.stats.mealsServed.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Horaires d'ouverture
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(mockAssociation.availability).map(([day, schedule]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{day}</span>
                    <span className={`font-medium ${schedule.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                      {schedule.isOpen ? `${schedule.open} - ${schedule.close}` : 'Fermé'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssociationDetailPage;
