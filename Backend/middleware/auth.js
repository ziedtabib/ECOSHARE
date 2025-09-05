const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token manquant.'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoshare_dev_secret_change_in_production');
    
    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide. Utilisateur non trouvé.'
      });
    }

    // Vérifier que le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé.'
      });
    }

    // Ajouter l'ID de l'utilisateur à la requête
    req.userId = user._id;
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré.'
      });
    } else {
      console.error('Erreur d\'authentification:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de l\'authentification.'
      });
    }
  }
};

// Middleware d'autorisation (optionnel)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    next();
  };
};

// Middleware pour vérifier la propriété d'une ressource
const checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée.'
        });
      }

      // Vérifier si l'utilisateur est le propriétaire
      const ownerField = resource.owner || resource.author;
      if (ownerField.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette ressource.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Erreur lors de la vérification de propriété:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur.'
      });
    }
  };
};

// Middleware pour vérifier si l'utilisateur peut accéder à une ressource
const checkAccess = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée.'
        });
      }

      // Vérifier les conditions d'accès selon le type de ressource
      if (resource.visibility === 'private') {
        const ownerField = resource.owner || resource.author;
        if (ownerField.toString() !== req.userId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Accès refusé. Cette ressource est privée.'
          });
        }
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur.'
      });
    }
  };
};

module.exports = {
  auth,
  authorize,
  checkOwnership,
  checkAccess
};
