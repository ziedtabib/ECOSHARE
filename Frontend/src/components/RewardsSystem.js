import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Trophy, 
  Leaf, 
  Zap, 
  Heart, 
  Target,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';

const RewardsSystem = ({ user, onClose }) => {
  const [userStats, setUserStats] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    setIsLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées
      const mockUserStats = {
        totalPoints: 1250,
        currentLevel: 3,
        levelName: 'Éco-Warrior',
        nextLevelPoints: 1500,
        pointsToNextLevel: 250,
        totalObjectsDonated: 8,
        totalObjectsReceived: 5,
        totalFoodDonated: 3,
        totalAssociationsHelped: 2,
        streakDays: 12,
        achievements: [
          { id: 1, name: 'Premier don', description: 'Votre premier objet donné', earned: true, earnedAt: '2024-01-15' },
          { id: 2, name: 'Donateur régulier', description: '5 objets donnés', earned: true, earnedAt: '2024-02-20' },
          { id: 3, name: 'Éco-citoyen', description: '10 objets donnés', earned: false, earnedAt: null },
          { id: 4, name: 'Ami des associations', description: 'Aider 3 associations', earned: false, earnedAt: null }
        ]
      };

      const mockAvailableRewards = [
        {
          id: 1,
          name: 'Plante verte',
          description: 'Une belle plante verte pour votre bureau',
          pointsRequired: 500,
          category: 'plants',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          sponsor: 'GreenLife',
          isEcoFriendly: true
        },
        {
          id: 2,
          name: 'Tote bag écologique',
          description: 'Sac en coton bio pour vos courses',
          pointsRequired: 300,
          category: 'accessories',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          sponsor: 'EcoBag',
          isEcoFriendly: true
        },
        {
          id: 3,
          name: 'Gourde en inox',
          description: 'Gourde réutilisable pour réduire le plastique',
          pointsRequired: 400,
          category: 'accessories',
          image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          sponsor: 'HydroLife',
          isEcoFriendly: true
        },
        {
          id: 4,
          name: 'Kit de graines',
          description: 'Kit pour cultiver vos propres herbes aromatiques',
          pointsRequired: 600,
          category: 'gardening',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          sponsor: 'GardenPro',
          isEcoFriendly: true
        }
      ];

      const mockUserRewards = [
        {
          id: 1,
          rewardId: 1,
          name: 'Plante verte',
          redeemedAt: '2024-01-20',
          status: 'shipped',
          trackingNumber: 'TRK123456789'
        },
        {
          id: 2,
          rewardId: 2,
          name: 'Tote bag écologique',
          redeemedAt: '2024-02-10',
          status: 'delivered',
          trackingNumber: 'TRK987654321'
        }
      ];
      
      setUserStats(mockUserStats);
      setAvailableRewards(mockAvailableRewards);
      setUserRewards(mockUserRewards);
    } catch (error) {
      console.error('Erreur lors du chargement des récompenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemReward = async (reward) => {
    try {
      // Simuler la rédemption
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ajouter à la liste des récompenses de l'utilisateur
      const newUserReward = {
        id: Date.now(),
        rewardId: reward.id,
        name: reward.name,
        redeemedAt: new Date().toISOString(),
        status: 'pending',
        trackingNumber: null
      };
      
      setUserRewards(prev => [...prev, newUserReward]);
      
      // Mettre à jour les points de l'utilisateur
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints - reward.pointsRequired
      }));
      
      alert(`Récompense "${reward.name}" réclamée avec succès !`);
    } catch (error) {
      console.error('Erreur lors de la rédemption:', error);
      alert('Erreur lors de la rédemption de la récompense. Veuillez réessayer.');
    }
  };

  const getLevelIcon = (level) => {
    if (level >= 5) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (level >= 3) return <Award className="h-6 w-6 text-blue-500" />;
    if (level >= 1) return <Star className="h-6 w-6 text-green-500" />;
    return <Target className="h-6 w-6 text-gray-500" />;
  };

  const getLevelColor = (level) => {
    if (level >= 5) return 'bg-yellow-100 text-yellow-800';
    if (level >= 3) return 'bg-blue-100 text-blue-800';
    if (level >= 1) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'shipped':
        return 'Expédié';
      case 'delivered':
        return 'Livré';
      default:
        return 'Inconnu';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des récompenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Système de récompenses
                </h2>
                <p className="text-sm text-gray-600">
                  Vos points et récompenses éco-friendly
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-8">
          {/* Statistiques utilisateur */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {getLevelIcon(userStats.currentLevel)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Niveau {userStats.currentLevel} - {userStats.levelName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {userStats.totalPoints} points au total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Prochain niveau</p>
                <p className="text-lg font-semibold text-gray-900">
                  {userStats.pointsToNextLevel} points
                </p>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progression vers le niveau {userStats.currentLevel + 1}</span>
                <span>{Math.round((userStats.totalPoints / userStats.nextLevelPoints) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(userStats.totalPoints / userStats.nextLevelPoints) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.totalObjectsDonated}</div>
                <div className="text-sm text-gray-600">Objets donnés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalObjectsReceived}</div>
                <div className="text-sm text-gray-600">Objets reçus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{userStats.totalFoodDonated}</div>
                <div className="text-sm text-gray-600">Aliments donnés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userStats.streakDays}</div>
                <div className="text-sm text-gray-600">Jours de série</div>
              </div>
            </div>
          </div>

          {/* Récompenses disponibles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span>Récompenses disponibles</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="relative mb-4">
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {reward.isEcoFriendly && (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Leaf className="h-3 w-3" />
                        <span>Éco</span>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{reward.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {reward.pointsRequired} points
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">par {reward.sponsor}</span>
                  </div>
                  
                  <button
                    onClick={() => handleRedeemReward(reward)}
                    disabled={userStats.totalPoints < reward.pointsRequired}
                    className={`w-full btn ${
                      userStats.totalPoints >= reward.pointsRequired
                        ? 'btn-primary'
                        : 'btn-secondary opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {userStats.totalPoints >= reward.pointsRequired ? 'Réclamer' : 'Points insuffisants'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Récompenses de l'utilisateur */}
          {userRewards.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Mes récompenses</span>
              </h3>
              <div className="space-y-4">
                {userRewards.map((reward) => (
                  <div key={reward.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Gift className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                          <p className="text-sm text-gray-600">
                            Réclamé le {new Date(reward.redeemedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reward.status)}`}>
                          {getStatusLabel(reward.status)}
                        </span>
                        {reward.trackingNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            Suivi: {reward.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Succès */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Succès</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userStats.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 ${
                    achievement.earned
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {achievement.earned ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        achievement.earned ? 'text-green-900' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <p className="text-xs text-green-600 mt-1">
                          Obtenu le {new Date(achievement.earnedAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RewardsSystem;
