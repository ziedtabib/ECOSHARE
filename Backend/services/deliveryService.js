const axios = require('axios');
const Delivery = require('../models/Delivery');

class DeliveryService {
  constructor() {
    this.mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    this.baseUrl = 'https://api.mapbox.com';
  }

  // Calculer l'itinéraire entre deux points
  async calculateRoute(startCoordinates, endCoordinates, profile = 'driving') {
    try {
      const url = `${this.baseUrl}/directions/v5/mapbox/${profile}/${startCoordinates.lng},${startCoordinates.lat};${endCoordinates.lng},${endCoordinates.lat}`;
      
      const response = await axios.get(url, {
        params: {
          access_token: this.mapboxToken,
          geometries: 'polyline6',
          overview: 'full',
          steps: true,
          annotations: ['distance', 'duration']
        }
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          distance: route.distance, // en mètres
          duration: route.duration, // en secondes
          polyline: route.geometry,
          steps: route.legs[0].steps
        };
      }

      throw new Error('Aucun itinéraire trouvé');
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
      throw error;
    }
  }

  // Géocoder une adresse
  async geocodeAddress(address) {
    try {
      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
      
      const response = await axios.get(url, {
        params: {
          access_token: this.mapboxToken,
          country: 'FR',
          limit: 1
        }
      });

      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        return {
          coordinates: {
            lat: feature.center[1],
            lng: feature.center[0]
          },
          address: feature.place_name,
          accuracy: feature.relevance
        };
      }

      throw new Error('Adresse non trouvée');
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      throw error;
    }
  }

  // Géocoder inverse (coordonnées vers adresse)
  async reverseGeocode(coordinates) {
    try {
      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json`;
      
      const response = await axios.get(url, {
        params: {
          access_token: this.mapboxToken,
          types: 'address'
        }
      });

      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        return {
          address: feature.place_name,
          accuracy: feature.relevance
        };
      }

      return {
        address: 'Adresse non trouvée',
        accuracy: 0
      };
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      return {
        address: 'Adresse non trouvée',
        accuracy: 0
      };
    }
  }

  // Calculer le coût de livraison
  calculateDeliveryCost(distance, duration, deliveryType, packageInfo = {}) {
    let basePrice = 0;
    let distanceRate = 0;
    let timeRate = 0;

    // Tarifs de base selon le type de livraison
    switch (deliveryType) {
      case 'pickup':
        basePrice = 0; // Gratuit pour le retrait
        break;
      case 'delivery':
        basePrice = 5; // 5€ de base
        distanceRate = 0.5; // 0.5€ par km
        timeRate = 0.1; // 0.1€ par minute
        break;
      case 'meeting':
        basePrice = 2; // 2€ de base pour un rendez-vous
        distanceRate = 0.3; // 0.3€ par km
        timeRate = 0.05; // 0.05€ par minute
        break;
    }

    // Supplément pour colis fragile
    if (packageInfo.fragile) {
      basePrice += 2;
    }

    // Supplément pour colis lourd (>10kg)
    if (packageInfo.weight > 10) {
      basePrice += 3;
    }

    const distanceFee = (distance / 1000) * distanceRate; // Convertir en km
    const timeFee = (duration / 60) * timeRate; // Convertir en minutes
    const totalCost = basePrice + distanceFee + timeFee;

    return {
      basePrice,
      distanceFee: Math.round(distanceFee * 100) / 100,
      timeFee: Math.round(timeFee * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100
    };
  }

  // Trouver les livreurs disponibles
  async findAvailableDeliveryPersons(coordinates, radius = 10000, scheduledDate) {
    try {
      // En production, vous auriez un modèle DeliveryPerson
      // Pour l'instant, on simule avec des utilisateurs
      const User = require('../models/User');
      
      const availableUsers = await User.find({
        'address.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [coordinates.lng, coordinates.lat]
            },
            $maxDistance: radius
          }
        },
        role: 'delivery_person', // Supposons qu'il y a un rôle livreur
        isActive: true
      });

      // Filtrer les livreurs disponibles à la date demandée
      const availableDeliveryPersons = [];
      
      for (const user of availableUsers) {
        const hasConflict = await this.checkDeliveryConflict(user._id, scheduledDate);
        if (!hasConflict) {
          availableDeliveryPersons.push(user);
        }
      }

      return availableDeliveryPersons;
    } catch (error) {
      console.error('Erreur lors de la recherche de livreurs:', error);
      return [];
    }
  }

  // Vérifier les conflits de livraison
  async checkDeliveryConflict(deliveryPersonId, scheduledDate) {
    try {
      const startOfDay = new Date(scheduledDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(scheduledDate);
      endOfDay.setHours(23, 59, 59, 999);

      const conflictingDeliveries = await Delivery.find({
        'participants.deliveryPerson': deliveryPersonId,
        'schedule.scheduledDate': {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['assigned', 'picked_up', 'in_transit'] }
      });

      return conflictingDeliveries.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits:', error);
      return true; // En cas d'erreur, considérer comme conflictuel
    }
  }

  // Assigner automatiquement un livreur
  async autoAssignDeliveryPerson(deliveryId) {
    try {
      const delivery = await Delivery.findById(deliveryId)
        .populate('participants.sender participants.receiver');

      if (!delivery) {
        throw new Error('Livraison non trouvée');
      }

      // Trouver les livreurs disponibles
      const availableDeliveryPersons = await this.findAvailableDeliveryPersons(
        delivery.addresses.pickup.coordinates,
        10000, // 10km de rayon
        delivery.schedule.scheduledDate
      );

      if (availableDeliveryPersons.length === 0) {
        throw new Error('Aucun livreur disponible');
      }

      // Assigner le livreur le plus proche
      const closestDeliveryPerson = availableDeliveryPersons[0];
      await delivery.assignDeliveryPerson(closestDeliveryPerson._id);

      return closestDeliveryPerson;
    } catch (error) {
      console.error('Erreur lors de l\'assignation automatique:', error);
      throw error;
    }
  }

  // Envoyer des notifications de livraison
  async sendDeliveryNotification(deliveryId, notificationType, customMessage = null) {
    try {
      const delivery = await Delivery.findById(deliveryId)
        .populate('participants.sender participants.receiver participants.deliveryPerson');

      if (!delivery) {
        throw new Error('Livraison non trouvée');
      }

      const messages = {
        assigned: 'Un livreur a été assigné à votre livraison',
        picked_up: 'Votre colis a été récupéré et est en cours de livraison',
        in_transit: 'Votre colis est en cours de livraison',
        near_destination: 'Votre colis arrive bientôt à destination',
        delivered: 'Votre colis a été livré avec succès',
        failed: 'La livraison a échoué. Veuillez contacter le support',
        delayed: 'Votre livraison est retardée'
      };

      const message = customMessage || messages[notificationType] || 'Mise à jour de votre livraison';

      // Notifier l'expéditeur
      if (delivery.participants.sender) {
        await this.sendNotificationToUser(
          delivery.participants.sender._id,
          notificationType,
          message,
          delivery
        );
      }

      // Notifier le destinataire
      if (delivery.participants.receiver) {
        await this.sendNotificationToUser(
          delivery.participants.receiver._id,
          notificationType,
          message,
          delivery
        );
      }

      // Ajouter la notification à l'historique
      delivery.notifications.push({
        type: notificationType,
        message: message,
        sentAt: new Date()
      });

      await delivery.save();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification:', error);
      throw error;
    }
  }

  // Envoyer une notification à un utilisateur
  async sendNotificationToUser(userId, type, message, delivery) {
    try {
      // En production, vous utiliseriez un service de notifications
      // (email, push, SMS, etc.)
      console.log(`Notification pour utilisateur ${userId}: ${message}`);
      
      // Ici, vous pourriez intégrer avec:
      // - Service d'email (Nodemailer)
      // - Service de push notifications (Firebase, OneSignal)
      // - Service SMS (Twilio)
      // - Socket.io pour les notifications en temps réel
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification utilisateur:', error);
      return false;
    }
  }

  // Obtenir les statistiques de livraison
  async getDeliveryStats(deliveryPersonId = null, dateRange = {}) {
    try {
      let query = {};
      
      if (deliveryPersonId) {
        query['participants.deliveryPerson'] = deliveryPersonId;
      }

      if (dateRange.start && dateRange.end) {
        query['schedule.scheduledDate'] = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const stats = await Delivery.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgDuration: { $avg: '$schedule.actualEndTime' },
            totalDistance: { $sum: '$tracking.route.distance' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return [];
    }
  }

  // Optimiser les routes de livraison
  async optimizeDeliveryRoutes(deliveries) {
    try {
      // Algorithme simple d'optimisation de route
      // En production, vous utiliseriez un algorithme plus sophistiqué comme TSP
      
      const optimizedRoutes = [];
      const unassignedDeliveries = [...deliveries];

      while (unassignedDeliveries.length > 0) {
        const route = [];
        let currentLocation = null;

        // Prendre la première livraison comme point de départ
        const firstDelivery = unassignedDeliveries.shift();
        route.push(firstDelivery);
        currentLocation = firstDelivery.addresses.pickup.coordinates;

        // Trouver les livraisons les plus proches
        while (unassignedDeliveries.length > 0 && route.length < 5) { // Max 5 livraisons par route
          let closestDelivery = null;
          let closestDistance = Infinity;
          let closestIndex = -1;

          for (let i = 0; i < unassignedDeliveries.length; i++) {
            const delivery = unassignedDeliveries[i];
            const distance = this.calculateDistanceBetweenPoints(
              currentLocation,
              delivery.addresses.pickup.coordinates
            );

            if (distance < closestDistance) {
              closestDistance = distance;
              closestDelivery = delivery;
              closestIndex = i;
            }
          }

          if (closestDelivery) {
            route.push(closestDelivery);
            unassignedDeliveries.splice(closestIndex, 1);
            currentLocation = closestDelivery.addresses.delivery.coordinates;
          } else {
            break;
          }
        }

        optimizedRoutes.push(route);
      }

      return optimizedRoutes;
    } catch (error) {
      console.error('Erreur lors de l\'optimisation des routes:', error);
      return deliveries.map(delivery => [delivery]); // Retourner chaque livraison individuellement
    }
  }

  // Calculer la distance entre deux points (méthode utilitaire)
  calculateDistanceBetweenPoints(point1, point2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance en mètres
  }
}

module.exports = new DeliveryService();
