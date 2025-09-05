import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, Users, Leaf, Heart, TrendingUp } from 'lucide-react';

const LeaderboardPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('');

  // Données de test (à remplacer par des vraies données de l'API)
  const mockUsers = [
    {
      id: 1,
      firstName: 'Sophie',
      lastName: 'Chen',
      points: 1250,
      level: 'Platinum',
      stats: {
        objectsShared: 45,
        objectsReceived: 12,
        foodsShared: 23,
        foodsReceived: 8,
        totalExchanges: 88
      },
      avatar: null
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Dubois',
      points: 890,
      level: 'Gold',
      stats: {
        objectsShared: 32,
        objectsReceived: 15,
        foodsShared: 18,
        foodsReceived: 6,
        totalExchanges: 71
      },
      avatar: null
    },
    {
      id: 3,
      firstName: 'Pierre',
      lastName: 'Martin',
      points: 650,
      level: 'Gold',
      stats: {
        objectsShared: 28,
        objectsReceived: 9,
        foodsShared: 15,
        foodsReceived: 4,
        totalExchanges: 56
      },
      avatar: null
    },
    {
      id: 4,
      firstName: 'Emma',
      lastName: 'Leroy',
      points: 420,
      level: 'Silver',
      stats: {
        objectsShared: 22,
        objectsReceived: 7,
        foodsShared: 12,
        foodsReceived: 3,
        totalExchanges: 44
      },
      avatar: null
    },
    {
      id: 5,
      firstName: 'Lucas',
      lastName: 'Moreau',
      points: 280,
      level: 'Silver',
      stats: {
        objectsShared: 18,
        objectsReceived: 5,
        foodsShared: 8,
        foodsReceived: 2,
        totalExchanges: 33
      },
      avatar: null
    }
  ];

  const levels = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'Bronze', label: 'Bronze' },
    { value: 'Silver', label: 'Argent' },
    { value: 'Gold', label: 'Or' },
    { value: 'Platinum', label: 'Platine' }
  ];

  const filteredUsers = selectedLevel 
    ? mockUsers.filter(user => user.level === selectedLevel)
    : mockUsers;

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Platinum': return <Trophy className="h-5 w-5 text-purple-600" />;
      case 'Gold': return <Medal className="h-5 w-5 text-yellow-500" />;
      case 'Silver': return <Award className="h-5 w-5 text-gray-400" />;
      case 'Bronze': return <Star className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Platinum': return 'text-purple-600';
      case 'Gold': return 'text-yellow-500';
      case 'Silver': return 'text-gray-400';
      case 'Bronze': return 'text-amber-600';
      default: return 'text-gray-400';
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 1: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 2: return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-soft">
        <div className="container-custom py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Classement des utilisateurs
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les membres les plus actifs de notre communauté
            </p>
          </div>

          {/* Filtres */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="input w-full appearance-none bg-white"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-custom py-8">
        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {mockUsers.length}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {mockUsers.reduce((sum, user) => sum + user.stats.objectsShared, 0)}
            </div>
            <div className="text-sm text-gray-600">Objets partagés</div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {mockUsers.reduce((sum, user) => sum + user.stats.foodsShared, 0)}
            </div>
            <div className="text-sm text-gray-600">Aliments partagés</div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {mockUsers.reduce((sum, user) => sum + user.stats.totalExchanges, 0)}
            </div>
            <div className="text-sm text-gray-600">Échanges totaux</div>
          </div>
        </div>

        {/* Classement */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Top {filteredUsers.length} utilisateurs
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  {/* Rang */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankColor(index)}`}>
                    {getRankIcon(index)}
                  </div>

                  {/* Avatar */}
                  <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary-600">
                        {user.firstName[0]}
                      </span>
                    )}
                  </div>

                  {/* Informations utilisateur */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className={`flex items-center space-x-1 ${getLevelColor(user.level)}`}>
                        {getLevelIcon(user.level)}
                        <span className="text-sm font-medium">{user.level}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary-600 mb-2">
                      {user.points.toLocaleString()} points
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{user.stats.objectsShared}</span> objets partagés
                      </div>
                      <div>
                        <span className="font-medium">{user.stats.objectsReceived}</span> objets reçus
                      </div>
                      <div>
                        <span className="font-medium">{user.stats.foodsShared}</span> aliments partagés
                      </div>
                      <div>
                        <span className="font-medium">{user.stats.totalExchanges}</span> échanges totaux
                      </div>
                    </div>
                  </div>

                  {/* Badge de performance */}
                  {index < 3 && (
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                        index === 0 ? 'bg-yellow-100' :
                        index === 1 ? 'bg-gray-100' :
                        'bg-amber-100'
                      }`}>
                        {index === 0 && <Trophy className="h-8 w-8 text-yellow-600" />}
                        {index === 1 && <Medal className="h-8 w-8 text-gray-600" />}
                        {index === 2 && <Award className="h-8 w-8 text-amber-600" />}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {index === 0 ? 'Champion' :
                         index === 1 ? 'Vice-champion' :
                         '3ème place'}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Informations sur les niveaux */}
        <div className="mt-8 bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comment gagner des points ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Partager un objet
              </div>
              <div className="text-sm text-gray-600">
                +10 à +20 points
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-3">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Partager un aliment
              </div>
              <div className="text-sm text-gray-600">
                +15 à +25 points
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Finaliser un échange
              </div>
              <div className="text-sm text-gray-600">
                +5 points bonus
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Activité communautaire
              </div>
              <div className="text-sm text-gray-600">
                +5 à +10 points
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
