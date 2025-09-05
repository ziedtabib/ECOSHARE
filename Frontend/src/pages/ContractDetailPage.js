import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle, 
  Clock, 
  Mail,
  Download,
  Share2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ContractDetailPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signing, setSigning] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signature, setSignature] = useState('');

  useEffect(() => {
    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contracts/${contractId}`);
      
      if (response.data.success) {
        setContract(response.data.contract);
      } else {
        setError('Contrat non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contrat:', error);
      setError('Erreur lors du chargement du contrat');
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
    if (!signature.trim()) {
      alert('Veuillez signer le contrat');
      return;
    }

    try {
      setSigning(true);
      const response = await api.post(`/contracts/${contractId}/sign`, {
        signature: signature
      });

      if (response.data.success) {
        // Recharger le contrat pour voir les mises à jour
        await loadContract();
        setShowSignatureModal(false);
        setSignature('');
        alert('Contrat signé avec succès !');
      } else {
        alert('Erreur lors de la signature du contrat');
      }
    } catch (error) {
      console.error('Erreur lors de la signature:', error);
      alert('Erreur lors de la signature du contrat');
    } finally {
      setSigning(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      const response = await api.post(`/contracts/${contractId}/resend-email`);
      if (response.data.success) {
        alert('Email renvoyé avec succès !');
      } else {
        alert('Erreur lors du renvoi de l\'email');
      }
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email:', error);
      alert('Erreur lors du renvoi de l\'email');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'signed': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente de signature';
      case 'signed': return 'Signé';
      case 'completed': return 'Complété';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contrat non trouvé</h1>
          <p className="text-gray-600 mb-6">{error || 'Ce contrat n\'existe pas ou vous n\'y avez pas accès.'}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </button>
            <Link to="/contracts" className="btn btn-primary">
              Mes contrats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canSign = contract.status === 'pending' && 
    ((contract.isOwner && !contract.ownerSigned) || 
     (contract.isReceiver && !contract.receiverSigned));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Contrat {contract.contractId}
                </h1>
                <p className="text-sm text-gray-600">{contract.objectTitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(contract.status)}`}>
                {getStatusIcon(contract.status)}
                <span>{getStatusLabel(contract.status)}</span>
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleResendEmail}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Renvoyer l'email"
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Partager">
                  <Share2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Télécharger PDF">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Détails de l'objet */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Détails de l'objet</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{contract.objectTitle}</h3>
                  <p className="text-gray-600 mt-1">{contract.objectDescription}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Catégorie</span>
                    <p className="font-medium capitalize">{contract.objectCategory || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">État</span>
                    <p className="font-medium capitalize">{contract.objectCondition || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails de l'échange */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Détails de l'échange</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Date d'échange</span>
                    <p className="font-medium">
                      {new Date(contract.exchangeDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Lieu</span>
                    <p className="font-medium">{contract.exchangeLocation}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Méthode</span>
                    <p className="font-medium capitalize">
                      {contract.deliveryMethod === 'pickup' ? 'Récupération' :
                       contract.deliveryMethod === 'delivery' ? 'Livraison' : 'Rencontre'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Signatures</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{contract.ownerName}</p>
                      <p className="text-sm text-gray-500">Propriétaire</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contract.ownerSigned ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      contract.ownerSigned ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {contract.ownerSigned ? 'Signé' : 'En attente'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{contract.receiverName}</p>
                      <p className="text-sm text-gray-500">Receveur</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contract.receiverSigned ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      contract.receiverSigned ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {contract.receiverSigned ? 'Signé' : 'En attente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                {canSign && (
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="w-full btn btn-primary"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Signer le contrat
                  </button>
                )}
                
                <button
                  onClick={handleResendEmail}
                  className="w-full btn btn-secondary"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Renvoyer l'email
                </button>
                
                <button className="w-full btn btn-secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </button>
              </div>
            </div>

            {/* Informations du contrat */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">ID du contrat</span>
                  <p className="font-mono text-sm">{contract.contractId}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Créé le</span>
                  <p className="text-sm">
                    {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Statut</span>
                  <p className="text-sm font-medium">{getStatusLabel(contract.status)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de signature */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Signer le contrat
            </h3>
            
            <p className="text-gray-600 mb-4">
              Veuillez entrer votre nom complet pour signer ce contrat.
            </p>
            
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Votre nom complet"
              className="input w-full mb-4"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleSignContract}
                disabled={signing || !signature.trim()}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {signing ? 'Signature...' : 'Signer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContractDetailPage;
