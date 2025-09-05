import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

const DIYGenerator = ({ object, onClose, isOpen = false }) => {
  const [diyProjects, setDiyProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Fonctions utilitaires pour la difficulté
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Facile';
      case 'medium':
        return 'Moyen';
      case 'hard':
        return 'Difficile';
      default:
        return 'Inconnu';
    }
  };

  useEffect(() => {
    if (object && isOpen) {
      generateDIYProjects();
    }
  }, [object, isOpen]);

  const generateDIYProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate_diy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          category: object.aiClassification?.category,
          objectName: object.title,
          description: object.description,
          condition: object.aiClassification?.condition
        })
      });

      const data = await response.json();
      if (data.success) {
        setDiyProjects(data.diy_projects || []);
      } else {
        // Fallback avec des projets prédéfinis
        setDiyProjects(getFallbackProjects(object.aiClassification?.category));
      }
    } catch (error) {
      console.error('Erreur lors de la génération DIY:', error);
      setDiyProjects(getFallbackProjects(object.aiClassification?.category));
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackProjects = (category) => {
    const fallbackProjects = {
      electronics: [
        {
          id: 1,
          title: 'Station de charge DIY',
          description: 'Transformez votre ancien appareil en station de charge élégante',
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
          skillLevel: 'Intermédiaire'
        },
        {
          id: 2,
          title: 'Lampe LED recyclée',
          description: 'Créez une lampe unique à partir d\'anciens composants électroniques',
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
          skillLevel: 'Avancé'
        }
      ],
      clothing: [
        {
          id: 3,
          title: 'Sac réutilisable en tissu',
          description: 'Créez un sac à partir de vêtements usagés',
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
          skillLevel: 'Débutant'
        },
        {
          id: 4,
          title: 'Coussin décoratif',
          description: 'Transformez un vieux t-shirt en coussin coloré',
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
          skillLevel: 'Débutant'
        }
      ],
      furniture: [
        {
          id: 5,
          title: 'Relooking de meuble',
          description: 'Donnez une nouvelle vie à vos meubles anciens',
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
          skillLevel: 'Intermédiaire'
        },
        {
          id: 6,
          title: 'Étagère murale',
          description: 'Créez une étagère unique à partir de planches récupérées',
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
          skillLevel: 'Intermédiaire'
        }
      ],
      books: [
        {
          id: 7,
          title: 'Cache-pot en livres',
          description: 'Transformez de vieux livres en cache-pots originaux',
          difficulty: 'easy',
          estimatedTime: '1 heure',
          materials: ['Vieux livres', 'Colle forte', 'Cutter', 'Plastique étanche', 'Plante'],
          steps: [
            'Choisissez des livres de même taille',
            'Collez les pages ensemble',
            'Découpez un espace pour la plante',
            'Ajoutez une protection étanche',
            'Plantez votre végétal'
          ],
          tips: ['Utilisez des livres sans valeur', 'Testez l\'étanchéité'],
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          ecoImpact: 'Réutilise les livres non lus',
          skillLevel: 'Débutant'
        }
      ],
      toys: [
        {
          id: 8,
          title: 'Jouet éducatif',
          description: 'Créez un jouet éducatif à partir d\'anciens objets',
          difficulty: 'easy',
          estimatedTime: '2 heures',
          materials: ['Objets divers', 'Colle', 'Peinture non-toxique', 'Éléments décoratifs'],
          steps: [
            'Nettoyez soigneusement les objets',
            'Concevez le jouet éducatif',
            'Assemblez les pièces',
            'Décorez avec des couleurs vives',
            'Testez la sécurité'
          ],
          tips: ['Vérifiez l\'absence de pièces dangereuses', 'Utilisez des matériaux non-toxiques'],
          image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          ecoImpact: 'Donne une seconde vie aux jouets',
          skillLevel: 'Débutant'
        }
      ],
      sports: [
        {
          id: 9,
          title: 'Équipement de sport personnalisé',
          description: 'Personnalisez votre équipement de sport',
          difficulty: 'medium',
          estimatedTime: '2-3 heures',
          materials: ['Équipement de sport', 'Peinture spéciale', 'Adhésifs', 'Outils de personnalisation'],
          steps: [
            'Nettoyez l\'équipement',
            'Préparez les surfaces',
            'Appliquez la personnalisation',
            'Laissez sécher',
            'Testez la durabilité'
          ],
          tips: ['Utilisez des produits adaptés au sport', 'Vérifiez les réglementations'],
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          ecoImpact: 'Évite le remplacement prématuré',
          skillLevel: 'Intermédiaire'
        }
      ],
      beauty: [
        {
          id: 10,
          title: 'Organisateur de maquillage',
          description: 'Créez un organisateur à partir de boîtes récupérées',
          difficulty: 'easy',
          estimatedTime: '1 heure',
          materials: ['Boîtes en carton', 'Papier décoratif', 'Colle', 'Ciseaux', 'Règle'],
          steps: [
            'Choisissez des boîtes de tailles variées',
            'Découpez selon vos besoins',
            'Décorez avec du papier',
            'Assemblez les compartiments',
            'Organisez vos produits'
          ],
          tips: ['Adaptez les compartiments à vos produits', 'Utilisez des matériaux résistants'],
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          ecoImpact: 'Réutilise les emballages',
          skillLevel: 'Débutant'
        }
      ],
      home: [
        {
          id: 11,
          title: 'Décorations murales',
          description: 'Créez des décorations uniques pour votre intérieur',
          difficulty: 'easy',
          estimatedTime: '1-2 heures',
          materials: ['Objets divers', 'Peinture', 'Pinceaux', 'Colle', 'Cadres'],
          steps: [
            'Sélectionnez les objets à décorer',
            'Nettoyez et préparez les surfaces',
            'Appliquez la décoration',
            'Assemblez si nécessaire',
            'Accrochez ou posez'
          ],
          tips: ['Harmonisez avec votre décoration', 'Testez l\'équilibre visuel'],
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          ecoImpact: 'Personnalise sans acheter neuf',
          skillLevel: 'Débutant'
        }
      ]
    };

    return fallbackProjects[category] || [
      {
        id: 4,
        title: 'Projet créatif général',
        description: 'Laissez libre cours à votre créativité',
        difficulty: 'easy',
        estimatedTime: 'Variable',
        materials: ['Matériaux de base', 'Outils'],
        steps: [
          'Analysez l\'objet',
          'Imaginez une nouvelle fonction',
          'Planifiez la transformation',
          'Réalisez votre projet'
        ],
        tips: ['Soyez créatif', 'Testez vos idées'],
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ecoImpact: 'Réduit les déchets',
        skillLevel: 'Débutant'
      }
    ];
  };

  const toggleFavorite = (projectId) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const startProject = (project) => {
    setSelectedProject(project);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const nextStep = () => {
    if (currentStep < selectedProject.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleStepCompletion = (stepIndex) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex)
        ? prev.filter(step => step !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Générateur DIY
                </h2>
                <p className="text-sm text-gray-600">
                  Transformez "{object?.title}" en quelque chose d'utile
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Génération de projets DIY...</p>
              </div>
            </div>
          ) : selectedProject ? (
            <ProjectDetail 
              project={selectedProject}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onBack={() => setSelectedProject(null)}
              onNextStep={nextStep}
              onPreviousStep={previousStep}
              onToggleStepCompletion={toggleStepCompletion}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              getDifficultyColor={getDifficultyColor}
              getDifficultyLabel={getDifficultyLabel}
            />
          ) : (
            <ProjectsList 
              projects={diyProjects}
              favorites={favorites}
              onSelectProject={startProject}
              onToggleFavorite={toggleFavorite}
              getDifficultyColor={getDifficultyColor}
              getDifficultyLabel={getDifficultyLabel}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ProjectsList = ({ projects, favorites, onSelectProject, onToggleFavorite, getDifficultyColor, getDifficultyLabel }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Projets DIY suggérés
        </h3>
        <p className="text-gray-600">
          Choisissez un projet qui vous inspire et transformez votre objet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => onToggleFavorite(project.id)}
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
            <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{project.estimatedTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Leaf className="h-4 w-4" />
                <span>{project.ecoImpact}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectProject(project)}
              className="w-full btn btn-primary flex items-center justify-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Commencer le projet</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
  );
};

const ProjectDetail = ({ 
  project, 
  currentStep, 
  completedSteps, 
  onBack, 
  onNextStep, 
  onPreviousStep, 
  onToggleStepCompletion,
  isPlaying,
  onTogglePlay,
  getDifficultyColor,
  getDifficultyLabel
}) => {
  return (
    <div className="space-y-6">
      {/* En-tête du projet */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span>Retour aux projets</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onTogglePlay}
            className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations du projet */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Difficulté</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                  {getDifficultyLabel(project.difficulty)}
                </span>
              </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Temps estimé</span>
              <span className="text-sm font-medium">{project.estimatedTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Niveau</span>
              <span className="text-sm font-medium">{project.skillLevel}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <span>Impact écologique</span>
          </h3>
          <p className="text-sm text-green-700">{project.ecoImpact}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span>Matériaux nécessaires</span>
          </h3>
          <ul className="space-y-2">
            {project.materials.map((material, index) => (
              <li key={index} className="text-sm text-blue-700 flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>{material}</span>
              </li>
            ))}
          </ul>
        </div>

        {project.tips && project.tips.length > 0 && (
          <div className="bg-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <span>Conseils</span>
            </h3>
            <ul className="space-y-2">
              {project.tips.map((tip, index) => (
                <li key={index} className="text-sm text-yellow-700 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Étapes du projet */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Étapes du projet
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {currentStep + 1} / {project.steps.length}
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / project.steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {project.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  index === currentStep
                    ? 'border-yellow-500 bg-yellow-50'
                    : completedSteps.includes(index)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    completedSteps.includes(index)
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {completedSteps.includes(index) ? (
                      <span>✓</span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      index === currentStep ? 'text-yellow-900' : 'text-gray-900'
                    }`}>
                      {step}
                    </p>
                  </div>
                  {index === currentStep && (
                    <button
                      onClick={() => onToggleStepCompletion(index)}
                      className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={onPreviousStep}
              disabled={currentStep === 0}
              className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Précédent</span>
            </button>

            <button
              onClick={() => onToggleStepCompletion(currentStep)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                completedSteps.includes(currentStep)
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              {completedSteps.includes(currentStep) ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
            </button>

            <button
              onClick={onNextStep}
              disabled={currentStep === project.steps.length - 1}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default DIYGenerator;