import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Leaf, 
  Users, 
  Heart, 
  Recycle, 
  MapPin,
  Star,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Leaf,
      title: 'Partagez vos objets',
      description: 'Donnez une seconde vie à vos objets inutilisés et réduisez les déchets.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Heart,
      title: 'Aidez votre communauté',
      description: 'Connectez-vous avec des associations et des personnes dans le besoin.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      icon: Recycle,
      title: 'Générez des DIY',
      description: 'L\'IA vous propose des idées créatives pour réutiliser vos objets.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Users,
      title: 'Créez des liens',
      description: 'Rejoignez une communauté engagée pour la durabilité.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const stats = [
    { label: 'Objets partagés', value: '2,500+', icon: Leaf },
    { label: 'Utilisateurs actifs', value: '1,200+', icon: Users },
    { label: 'Associations partenaires', value: '45+', icon: Heart },
    { label: 'Kg de CO₂ économisés', value: '12,000+', icon: Recycle },
  ];

  const testimonials = [
    {
      name: 'Fatma Ben Ali',
      role: 'Membre depuis 6 mois',
      content: 'ECOSHARE m\'a permis de donner une seconde vie à mes objets tout en aidant des familles dans le besoin. C\'est génial !',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      rating: 5,
    },
    {
      name: 'Ahmed Trabelsi',
      role: 'Association locale',
      content: 'Grâce à ECOSHARE, nous recevons régulièrement des dons qui nous permettent d\'aider plus de familles.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 5,
    },
    {
      name: 'Amina Khelil',
      role: 'Membre depuis 1 an',
      content: 'L\'IA qui génère des recettes à partir de mes aliments est incroyable ! J\'ai découvert de nouveaux plats.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Partagez,{' '}
                  <span className="text-gradient">Réutilisez</span>,{' '}
                  <span className="text-primary-600">Durable</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Rejoignez ECOSHARE et transformez vos objets inutilisés en opportunités 
                  pour votre communauté. Ensemble, créons un monde plus durable.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/objects/create"
                      className="btn-primary btn-xl flex items-center justify-center space-x-2"
                    >
                      <span>Ajouter un objet</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/objects"
                      className="btn-secondary btn-xl"
                    >
                      Explorer les objets
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/register"
                      className="btn-primary btn-xl flex items-center justify-center space-x-2"
                    >
                      <span>Commencer gratuitement</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/auth/login"
                      className="btn-secondary btn-xl"
                    >
                      Se connecter
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>100% Sécurisé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span>Gratuit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Communauté active</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="bg-white rounded-3xl shadow-strong p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Vélo vintage</h3>
                        <p className="text-sm text-gray-500">Disponible à Paris</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Heart className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Légumes bio</h3>
                        <p className="text-sm text-gray-500">À récupérer aujourd'hui</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Collecte jouets</h3>
                        <p className="text-sm text-gray-500">Pour l'hôpital local</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Éléments décoratifs */}
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-primary-200 rounded-full opacity-20 animate-float"></div>
              <div className="absolute -bottom-4 -left-4 h-32 w-32 bg-secondary-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir ECOSHARE ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre plateforme combine technologie et communauté pour créer 
              un écosystème durable et solidaire.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-hover p-6 text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des milliers de personnes qui transforment déjà leur communauté
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à faire la différence ?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Rejoignez notre communauté et commencez à partager dès aujourd'hui. 
              Chaque geste compte pour notre planète.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/objects/create"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 btn-xl"
                >
                  Ajouter mon premier objet
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth/register"
                    className="btn bg-white text-primary-600 hover:bg-gray-100 btn-xl"
                  >
                    Créer mon compte
                  </Link>
                  <Link
                    to="/objects"
                    className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-xl"
                  >
                    Explorer la plateforme
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
