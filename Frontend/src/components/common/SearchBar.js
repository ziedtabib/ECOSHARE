import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  Filter,
  MapPin,
  Tag
} from 'lucide-react';

const SearchBar = ({ 
  placeholder = "Rechercher des objets, aliments, associations...",
  onSearch,
  showFilters = true,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    priceRange: '',
    condition: '',
    type: 'all' // all, objects, foods, associations, posts
  });
  
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // Données de test pour les suggestions
  const mockSuggestions = [
    { id: 1, text: 'vélo', type: 'object', category: 'sports' },
    { id: 2, text: 'légumes bio', type: 'food', category: 'vegetables' },
    { id: 3, text: 'restos du cœur', type: 'association', category: 'food_bank' },
    { id: 4, text: 'meubles', type: 'object', category: 'furniture' },
    { id: 5, text: 'fruits', type: 'food', category: 'fruits' },
    { id: 6, text: 'livres', type: 'object', category: 'books' },
    { id: 7, text: 'bénévolat', type: 'post', category: 'announcement' },
    { id: 8, text: 'électronique', type: 'object', category: 'electronics' }
  ];

  const mockTrendingSearches = [
    'vélo électrique',
    'légumes bio',
    'meubles vintage',
    'bénévolat',
    'livres gratuits'
  ];

  useEffect(() => {
    // Charger les recherches récentes depuis le localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Ajouter à l'historique des recherches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Construire l'URL de recherche
    const searchParams = new URLSearchParams({
      q: searchQuery,
      ...filters
    });

    // Navigation vers la page de résultats
    if (filters.type === 'all') {
      navigate(`/search?${searchParams.toString()}`);
    } else {
      navigate(`/${filters.type}?${searchParams.toString()}`);
    }

    // Appeler la fonction de callback si fournie
    if (onSearch) {
      onSearch(searchQuery, filters);
    }

    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setFilters(prev => ({
      ...prev,
      type: suggestion.type === 'object' ? 'objects' : 
            suggestion.type === 'food' ? 'foods' :
            suggestion.type === 'association' ? 'associations' :
            suggestion.type === 'post' ? 'posts' : 'all'
    }));
    handleSearch(suggestion.text);
  };

  const handleRecentSearchClick = (search) => {
    setQuery(search);
    handleSearch(search);
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const getFilteredSuggestions = () => {
    if (!query.trim()) return [];
    
    return mockSuggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'object': return '📦';
      case 'food': return '🍎';
      case 'association': return '🏢';
      case 'post': return '📝';
      default: return '🔍';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'object': return 'Objet';
      case 'food': return 'Aliment';
      case 'association': return 'Association';
      case 'post': return 'Publication';
      default: return 'Tout';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Barre de recherche principale */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Bouton de recherche */}
        <button
          onClick={() => handleSearch()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Rechercher
        </button>
      </div>

      {/* Filtres rapides */}
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tout</option>
            <option value="objects">Objets</option>
            <option value="foods">Aliments</option>
            <option value="associations">Associations</option>
            <option value="posts">Publications</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Toutes catégories</option>
            <option value="electronics">Électronique</option>
            <option value="furniture">Mobilier</option>
            <option value="clothing">Vêtements</option>
            <option value="books">Livres</option>
            <option value="sports">Sport</option>
            <option value="vegetables">Légumes</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Produits laitiers</option>
          </select>
          
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Localisation"
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Suggestions et historique */}
      <AnimatePresence>
        {showSuggestions && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Recherches récentes */}
            {recentSearches.length > 0 && !query && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Recherches récentes</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions basées sur la recherche */}
            {query && getFilteredSuggestions().length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Suggestions</span>
                </div>
                <div className="space-y-1">
                  {getFilteredSuggestions().map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3"
                    >
                      <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{suggestion.text}</div>
                        <div className="text-xs text-gray-500">{getTypeLabel(suggestion.type)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recherches tendances */}
            {!query && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Tendances</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockTrendingSearches.map((trend, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(trend)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Aucun résultat */}
            {query && getFilteredSuggestions().length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune suggestion trouvée</p>
                <p className="text-xs text-gray-400 mt-1">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
