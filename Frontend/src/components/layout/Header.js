import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  Heart, 
  Plus, 
  LogOut,
  Settings,
  BarChart3,
  MapPin,
  Leaf,
  FileText
} from '../icons/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Objets', href: '/objects' },
    { name: 'Aliments', href: '/foods' },
    { name: 'Associations', href: '/associations' },
    { name: 'Communauté', href: '/posts' },
  ];

  const userNavigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: BarChart3 },
    { name: 'Mes contrats', href: '/contracts', icon: FileText },
    { name: 'Mon profil', href: '/dashboard/profile', icon: User },
    { name: 'Ma wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Mes livraisons', href: '/dashboard/deliveries', icon: MapPin },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <header className="bg-white shadow-soft sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ECOSHARE</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Bouton de recherche */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Search className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <>
                {/* Bouton d'ajout */}
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    to="/objects/create"
                    className="btn-primary btn-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </Link>
                </div>

                {/* Menu utilisateur */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.firstName}
                    </span>
                    {user?.points && (
                      <span className="hidden sm:block text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                        {user.points} pts
                      </span>
                    )}
                  </button>

                  {/* Dropdown menu utilisateur */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-strong border border-gray-100 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                          {user?.level && (
                            <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full level-${user.level.toLowerCase()}`}>
                              {user.level}
                            </span>
                          )}
                        </div>
                        
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/register"
                  className="btn-primary btn-sm"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4"
            >
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                      location.pathname === item.href
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-100 my-2"></div>
                    <Link
                      to="/objects/create"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Ajouter un objet</span>
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
