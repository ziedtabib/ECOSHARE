import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  DollarSign,
  Star,
  Calendar,
  Tag,
  Users,
  Heart
} from 'lucide-react';

const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onClose,
  type = 'all' // all, objects, foods, associations, posts
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    location: true,
    price: true,
    condition: true,
    other: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterName, value) => {
    onFiltersChange({
      ...filters,
      [filterName]: value
    });
  };

  const handleMultiSelectChange = (filterName, value, checked) => {
    const currentValues = filters[filterName] || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [filterName]: newValues
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && (Array.isArray(value) ? value.length > 0 : value !== '')
    ).length;
  };

  // Options de filtres selon le type
  const getFilterOptions = () => {
    const baseOptions = {
      categories: {
        objects: [
          { value: 'electronics', label: 'Électronique' },
          { value: 'furniture', label: 'Mobilier' },
          { value: 'clothing', label: 'Vêtements' },
          { value: 'books', label: 'Livres' },
          { value: 'sports', label: 'Sport' },
          { value: 'home', label: 'Maison & Jardin' },
          { value: 'tools', label: 'Outils' },
          { value: 'toys', label: 'Jouets' },
          { value: 'other', label: 'Autre' }
        ],
        foods: [
          { value: 'vegetables', label: 'Légumes' },
          { value: 'fruits', label: 'Fruits' },
          { value: 'dairy', label: 'Produits laitiers' },
          { value: 'meat', label: 'Viande' },
          { value: 'fish', label: 'Poisson' },
          { value: 'grains', label: 'Céréales' },
          { value: 'baked_goods', label: 'Pâtisseries' },
          { value: 'prepared_meals', label: 'Plats préparés' },
          { value: 'beverages', label: 'Boissons' },
          { value: 'other', label: 'Autre' }
        ],
        associations: [
          { value: 'food_bank', label: 'Banque alimentaire' },
          { value: 'shelter', label: 'Hébergement' },
          { value: 'education', label: 'Éducation' },
          { value: 'health', label: 'Santé' },
          { value: 'environment', label: 'Environnement' },
          { value: 'social', label: 'Social' }
        ],
        posts: [
          { value: 'announcement', label: 'Annonce' },
          { value: 'event', label: 'Événement' },
          { value: 'request', label: 'Demande' },
          { value: 'offer', label: 'Offre' },
          { value: 'question', label: 'Question' },
          { value: 'discussion', label: 'Discussion' }
        ]
      },
      conditions: {
        objects: [
          { value: 'new', label: 'Neuf' },
          { value: 'like_new', label: 'Comme neuf' },
          { value: 'good', label: 'Bon état' },
          { value: 'fair', label: 'État correct' },
          { value: 'poor', label: 'Mauvais état' }
        ],
        foods: [
          { value: 'fresh', label: 'Frais' },
          { value: 'good', label: 'Bon état' },
          { value: 'fair', label: 'État correct' },
          { value: 'expired', label: 'Expiré' }
        ]
      },
      priceRanges: [
        { value: 'free', label: 'Gratuit' },
        { value: '0-10', label: '0€ - 10€' },
        { value: '10-25', label: '10€ - 25€' },
        { value: '25-50', label: '25€ - 50€' },
        { value: '50-100', label: '50€ - 100€' },
        { value: '100+', label: 'Plus de 100€' }
      ],
      locations: [
        { value: 'paris', label: 'Paris' },
        { value: 'lyon', label: 'Lyon' },
        { value: 'marseille', label: 'Marseille' },
        { value: 'toulouse', label: 'Toulouse' },
        { value: 'nice', label: 'Nice' },
        { value: 'nantes', label: 'Nantes' },
        { value: 'montpellier', label: 'Montpellier' },
        { value: 'strasbourg', label: 'Strasbourg' }
      ],
      sortOptions: [
        { value: 'newest', label: 'Plus récent' },
        { value: 'oldest', label: 'Plus ancien' },
        { value: 'price_low', label: 'Prix croissant' },
        { value: 'price_high', label: 'Prix décroissant' },
        { value: 'distance', label: 'Distance' },
        { value: 'popularity', label: 'Popularité' }
      ]
    };

    return baseOptions;
  };

  const options = getFilterOptions();
  const categories = type === 'all' ? [] : options.categories[type] || [];
  const conditions = type === 'all' ? [] : options.conditions[type] || [];

  const FilterSection = ({ title, icon: Icon, sectionKey, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      {expandedSections[sectionKey] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );

  const CheckboxFilter = ({ options, filterName, title }) => (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={(filters[filterName] || []).includes(option.value)}
            onChange={(e) => handleMultiSelectChange(filterName, option.value, e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );

  const RadioFilter = ({ options, filterName, title }) => (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            name={filterName}
            value={option.value}
            checked={filters[filterName] === option.value}
            onChange={(e) => handleFilterChange(filterName, e.target.value)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -300, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      {/* En-tête */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            Effacer tous les filtres
          </button>
        )}
      </div>

      {/* Contenu des filtres */}
      <div className="p-4">
        {/* Tri */}
        <FilterSection title="Trier par" icon={Star} sectionKey="sort">
          <RadioFilter 
            options={options.sortOptions} 
            filterName="sort" 
          />
        </FilterSection>

        {/* Catégories */}
        {categories.length > 0 && (
          <FilterSection title="Catégorie" icon={Tag} sectionKey="category">
            <CheckboxFilter 
              options={categories} 
              filterName="categories" 
            />
          </FilterSection>
        )}

        {/* État */}
        {conditions.length > 0 && (
          <FilterSection title="État" icon={Star} sectionKey="condition">
            <CheckboxFilter 
              options={conditions} 
              filterName="conditions" 
            />
          </FilterSection>
        )}

        {/* Prix */}
        {(type === 'objects' || type === 'all') && (
          <FilterSection title="Prix" icon={DollarSign} sectionKey="price">
            <CheckboxFilter 
              options={options.priceRanges} 
              filterName="priceRanges" 
            />
          </FilterSection>
        )}

        {/* Localisation */}
        <FilterSection title="Localisation" icon={MapPin} sectionKey="location">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Ville, code postal..."
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mb-2">Villes populaires :</div>
            <CheckboxFilter 
              options={options.locations} 
              filterName="cities" 
            />
          </div>
        </FilterSection>

        {/* Autres filtres */}
        <FilterSection title="Autres" icon={Users} sectionKey="other">
          <div className="space-y-4">
            {/* Disponibilité */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Disponibilité</div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.available || false}
                    onChange={(e) => handleFilterChange('available', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Disponible maintenant</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.free || false}
                    onChange={(e) => handleFilterChange('free', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Gratuit</span>
                </label>
              </div>
            </div>

            {/* Date de publication */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Date de publication</div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="dateRange"
                    value="today"
                    checked={filters.dateRange === 'today'}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Aujourd'hui</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="dateRange"
                    value="week"
                    checked={filters.dateRange === 'week'}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Cette semaine</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="dateRange"
                    value="month"
                    checked={filters.dateRange === 'month'}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Ce mois</span>
                </label>
              </div>
            </div>

            {/* Vérification */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Vérification</div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verified || false}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Comptes vérifiés uniquement</span>
              </label>
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Boutons d'action */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <button
            onClick={clearAllFilters}
            className="flex-1 btn-secondary btn-sm"
          >
            Effacer
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn-primary btn-sm"
          >
            Appliquer
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterSidebar;
