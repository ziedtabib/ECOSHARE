import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Twitter, 
  Instagram,
  Github,
  Heart
} from '../icons/SimpleIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Comment ça marche', href: '/how-it-works' },
      { name: 'Objets', href: '/objects' },
      { name: 'Aliments', href: '/foods' },
      { name: 'Associations', href: '/associations' },
      { name: 'Communauté', href: '/posts' },
    ],
    support: [
      { name: 'Centre d\'aide', href: '/help' },
      { name: 'Contact', href: '/contact' },
      { name: 'Signaler un problème', href: '/report' },
      { name: 'FAQ', href: '/faq' },
    ],
    legal: [
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Mentions légales', href: '/legal' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: MessageCircle },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'GitHub', href: '#', icon: Github },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom">
        {/* Contenu principal */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ECOSHARE</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-sm">
              Plateforme de partage d'objets et d'aliments pour promouvoir la durabilité 
              et créer une communauté d'entraide.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contact@ecoshare.tn</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+216 71 123 456</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Tunis, Tunisie</span>
              </div>
            </div>
          </div>

          {/* Liens Plateforme */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Plateforme</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens Légaux */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Restez informé</h3>
            <p className="text-gray-300 text-sm mb-4">
              Recevez nos dernières actualités et conseils éco-responsables
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Bas de page */}
        <div className="py-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-300 text-sm mb-4 md:mb-0">
            <span>© {currentYear} ECOSHARE. Fait avec</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>pour la planète</span>
          </div>
          
          {/* Réseaux sociaux */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
