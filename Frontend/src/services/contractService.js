import { api } from './api';

export const contractService = {
  // Créer un contrat d'échange d'objet
  createObjectExchangeContract: async (objectId, receiverId) => {
    const response = await api.post('/contracts/create-object-exchange', {
      objectId,
      receiverId
    });
    return response.data;
  },

  // Créer un contrat d'échange d'aliment
  createFoodExchangeContract: async (foodId, receiverId) => {
    const response = await api.post('/contracts/create-food-exchange', {
      foodId,
      receiverId
    });
    return response.data;
  },

  // Obtenir les contrats de l'utilisateur
  getUserContracts: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    
    const response = await api.get('/contracts', { params });
    return response.data;
  },

  // Obtenir un contrat par ID
  getContract: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  },

  // Signer un contrat
  signContract: async (contractId, signatureData) => {
    const response = await api.post(`/contracts/${contractId}/sign`, signatureData);
    return response.data;
  },

  // Marquer un contrat comme terminé
  completeContract: async (contractId) => {
    const response = await api.post(`/contracts/${contractId}/complete`);
    return response.data;
  },

  // Annuler un contrat
  cancelContract: async (contractId, reason = '') => {
    const response = await api.post(`/contracts/${contractId}/cancel`, { reason });
    return response.data;
  },

  // Télécharger le PDF du contrat
  getContractPDF: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}/pdf`);
    return response.data;
  },

  // Obtenir le hash de sécurité du contrat
  getContractHash: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}/hash`);
    return response.data;
  }
};
