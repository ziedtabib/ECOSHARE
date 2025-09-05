import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Wrench, 
  Clock, 
  Star, 
  Heart, 
  Share2, 
  Download, 
  BookOpen,
  Scissors,
  Palette,
  Hammer,
  Zap,
  Leaf,
  Filter,
  Search,
  Plus,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DIYPage = () => {
  const [diyProjects, setDiyProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'electronics', label: 'Électronique' },
    { value: 'clothing', label: 'Vêtements' },
    { value: 'furniture', label: 'Meubles' },
    { value: 'books', label: 'Livres' },
    { value: 'toys', label: 'Jouets' },
    { value: 'sports', label: 'Sport' },
    { value: 'beauty', label: 'Beauté' },
    { value: 'home', label: 'Maison' },
    { value: 'garden', label: 'Jardinage' },
    { value: 'kitchen', label: 'Cuisine' },
    { value: 'other', label: 'Autre' }
  ];

  const difficulties = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Moyen' },
    { value: 'hard', label: 'Difficile' }
  ];

  useEffect(() => {
    loadDIYProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [diyProjects, searchTerm, selectedCategory, selectedDifficulty]);

  const loadDIYProjects = () => {
    setLoading(true);
    // Simuler un chargement
    setTimeout(() => {
      const projects = getAllDIYProjects();
      setDiyProjects(projects);
      setLoading(false);
    }, 1000);
  };

  const getAllDIYProjects = () => {
    return [
      // Électronique
      {
        id: 1,
        title: 'Station de charge DIY',
        description: 'Transformez votre ancien appareil en station de charge élégante',
        category: 'electronics',
        difficulty: 'medium',
        estimatedTime: '2-3 heures',
        materials: ['Appareil électronique', 'Câbles USB', 'Support en bois', 'Colle', 'Peinture'],
        steps: [
          'Nettoyez soigneusement l\'appareil',
          'Retirez les composants non nécessaires',
          'Préparez le support en bois',
          'Installez les câbles USB',
          'Assemblez et peignez le tout'
        ],
        tips: ['Utilisez des câbles de qualité', 'Testez avant l\'assemblage final'],
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Réduit les déchets électroniques',
        skillLevel: 'Intermédiaire',
        views: 1250,
        likes: 89,
        completed: 156,
        rating: 4.5
      },
      {
        id: 2,
        title: 'Lampe LED recyclée',
        description: 'Créez une lampe unique à partir d\'anciens composants électroniques',
        category: 'electronics',
        difficulty: 'hard',
        estimatedTime: '4-6 heures',
        materials: ['Composants électroniques', 'LED', 'Résistances', 'Câbles', 'Support', 'Interrupteur'],
        steps: [
          'Désassemblez l\'ancien appareil',
          'Récupérez les composants utiles',
          'Concevez le circuit LED',
          'Assemblez le support',
          'Installez et testez l\'éclairage'
        ],
        tips: ['Vérifiez la tension des LED', 'Utilisez un fusible de protection'],
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Réutilise les composants électroniques',
        skillLevel: 'Avancé',
        views: 890,
        likes: 67,
        completed: 45,
        rating: 4.8
      },
      // Vêtements
      {
        id: 3,
        title: 'Sac réutilisable en tissu',
        description: 'Créez un sac à partir de vêtements usagés',
        category: 'clothing',
        difficulty: 'easy',
        estimatedTime: '1-2 heures',
        materials: ['Vêtement usagé', 'Fil', 'Aiguille', 'Ciseaux', 'Ruban'],
        steps: [
          'Coupez le vêtement selon le patron',
          'Cousez les bords avec un point solide',
          'Ajoutez des poignées en ruban',
          'Décorez selon vos goûts',
          'Testez la solidité'
        ],
        tips: ['Choisissez un tissu solide', 'Renforcez les points de tension'],
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Évite l\'achat de nouveaux sacs',
        skillLevel: 'Débutant',
        views: 2100,
        likes: 145,
        completed: 320,
        rating: 4.3
      },
      {
        id: 4,
        title: 'Coussin décoratif',
        description: 'Transformez un vieux t-shirt en coussin coloré',
        category: 'clothing',
        difficulty: 'easy',
        estimatedTime: '1 heure',
        materials: ['T-shirt usagé', 'Remplissage (coton, mousse)', 'Fil', 'Aiguille', 'Ciseaux'],
        steps: [
          'Coupez le t-shirt en carré',
          'Cousez trois côtés',
          'Remplissez avec le matériau choisi',
          'Cousez le dernier côté',
          'Décorez avec des boutons ou broderie'
        ],
        tips: ['Utilisez un tissu avec un motif intéressant', 'Lavez le tissu avant de coudre'],
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Donne une seconde vie aux vêtements',
        skillLevel: 'Débutant',
        views: 1650,
        likes: 98,
        completed: 210,
        rating: 4.6
      },
      // Meubles
      {
        id: 5,
        title: 'Relooking de meuble',
        description: 'Donnez une nouvelle vie à vos meubles anciens',
        category: 'furniture',
        difficulty: 'medium',
        estimatedTime: '1-2 jours',
        materials: ['Meuble', 'Peinture', 'Pinceaux', 'Papier de verre', 'Vernis'],
        steps: [
          'Poncez le meuble pour enlever l\'ancienne finition',
          'Nettoyez et dépoussiérez',
          'Appliquez une sous-couche si nécessaire',
          'Peignez avec la couleur choisie',
          'Protégez avec du vernis'
        ],
        tips: ['Ventilez bien la pièce', 'Appliquez plusieurs couches fines'],
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Évite l\'achat de nouveaux meubles',
        skillLevel: 'Intermédiaire',
        views: 3200,
        likes: 234,
        completed: 180,
        rating: 4.7
      },
      {
        id: 6,
        title: 'Étagère murale',
        description: 'Créez une étagère unique à partir de planches récupérées',
        category: 'furniture',
        difficulty: 'medium',
        estimatedTime: '3-4 heures',
        materials: ['Planches de bois', 'Vis', 'Chevilles', 'Perceuse', 'Niveau', 'Peinture'],
        steps: [
          'Mesurez et coupez les planches',
          'Poncez les surfaces',
          'Peignez ou teintez le bois',
          'Marquez les emplacements des fixations',
          'Fixez solidement au mur'
        ],
        tips: ['Vérifiez la solidité du mur', 'Utilisez un niveau pour l\'alignement'],
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Réutilise le bois de récupération',
        skillLevel: 'Intermédiaire',
        views: 1800,
        likes: 112,
        completed: 95,
        rating: 4.4
      },
      // Jardinage
      {
        id: 7,
        title: 'Jardin vertical en bouteilles',
        description: 'Créez un jardin vertical avec des bouteilles en plastique',
        category: 'garden',
        difficulty: 'easy',
        estimatedTime: '2 heures',
        materials: ['Bouteilles en plastique', 'Corde', 'Terreau', 'Graines', 'Ciseaux'],
        steps: [
          'Coupez les bouteilles en deux',
          'Percez des trous de drainage',
          'Attachez les bouteilles avec la corde',
          'Remplissez de terreau',
          'Plantez vos graines'
        ],
        tips: ['Choisissez des plantes adaptées', 'Arrosez régulièrement'],
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Réutilise les bouteilles plastique',
        skillLevel: 'Débutant',
        views: 2500,
        likes: 189,
        completed: 280,
        rating: 4.5
      },
      // Cuisine
      {
        id: 8,
        title: 'Organisateur de cuisine',
        description: 'Organisez votre cuisine avec des boîtes récupérées',
        category: 'kitchen',
        difficulty: 'easy',
        estimatedTime: '1 heure',
        materials: ['Boîtes en carton', 'Papier décoratif', 'Colle', 'Ciseaux', 'Règle'],
        steps: [
          'Choisissez des boîtes de tailles variées',
          'Découpez selon vos besoins',
          'Décorez avec du papier',
          'Assemblez les compartiments',
          'Organisez vos ustensiles'
        ],
        tips: ['Adaptez les compartiments à vos besoins', 'Utilisez des matériaux résistants'],
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Réutilise les emballages',
        skillLevel: 'Débutant',
        views: 1400,
        likes: 87,
        completed: 120,
        rating: 4.2
      }
    ];
  };

  const filterProjects = () => {
    let filtered = diyProjects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.materials.some(material => 
          material.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(project => project.difficulty === selectedDifficulty);
    }

    setFilteredProjects(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return 'Inconnu';
    }
  };

  const toggleFavorite = (projectId) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'electronics': return <Zap className="h-5 w-5" />;
      case 'clothing': return <Scissors className="h-5 w-5" />;
      case 'furniture': return <Hammer className="h-5 w-5" />;
      case 'garden': return <Leaf className="h-5 w-5" />;
      case 'kitchen': return <Wrench className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets DIY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Projets DIY
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transformez vos objets en créations uniques et réduisez le gaspillage
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-800">{diyProjects.length}</h3>
              <p className="text-yellow-600">Projets disponibles</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-800">
                {diyProjects.reduce((sum, project) => sum + project.completed, 0)}
              </h3>
              <p className="text-green-600">Projets réalisés</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800">
                {diyProjects.reduce((sum, project) => sum + project.likes, 0)}
              </h3>
              <p className="text-blue-600">Likes totaux</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-800">
                {(diyProjects.reduce((sum, project) => sum + project.rating, 0) / diyProjects.length).toFixed(1)}
              </h3>
              <p className="text-purple-600">Note moyenne</p>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Filtre par catégorie */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input pl-10 pr-10 appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par difficulté */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="input pl-10 pr-10 appearance-none bg-white"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton d'ajout */}
              {isAuthenticated && (
                <Link
                  to="/objects"
                  className="btn-primary btn-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Créer un projet</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-custom py-8">
        {/* Résultats */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Grille de projets */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(project.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                      favorites.includes(project.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(project.id) ? 'fill-current' : ''}`} />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                      {getDifficultyLabel(project.difficulty)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-gray-500">
                      {getCategoryIcon(project.category)}
                    </div>
                    <span className="text-sm text-gray-500 capitalize">
                      {categories.find(cat => cat.value === project.category)?.label}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{project.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Leaf className="h-4 w-4" />
                      <span className="text-xs">{project.ecoImpact}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{project.completed}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{project.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{project.rating}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full btn btn-primary flex items-center justify-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Voir le projet</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DIYPage;
