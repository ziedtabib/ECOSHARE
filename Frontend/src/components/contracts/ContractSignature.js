import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Eye,
  PenTool,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contractService } from '../../services/api';

const ContractSignature = ({ contract, onContractUpdate, onClose }) => {
  const { user } = useAuth();
  const [isSigning, setIsSigning] = useState(false);
  const [signature, setSignature] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Vérifier si l'utilisateur peut signer
  const canSign = contract.participants.find(p => 
    p.user._id === user.id && !p.signed
  );

  // Vérifier si l'utilisateur a déjà signé
  const userSignature = contract.participants.find(p => 
    p.user._id === user.id
  );

  const isFullySigned = contract.status === 'signed';
  const isCompleted = contract.status === 'completed';

  useEffect(() => {
    if (showSignaturePad && canvasRef.current) {
    const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Configuration du canvas
      ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    }
  }, [showSignaturePad]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
      setIsDrawing(false);
    setHasSignature(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureData = () => {
    const canvas = canvasRef.current;
    return canvas.toDataURL('image/png');
  };

  const handleSign = async () => {
    if (!hasSignature) {
      setError('Veuillez signer le contrat');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signatureData = getSignatureData();
      const response = await contractService.signContract(contract._id, signatureData);
      
      setSuccess('Contrat signé avec succès !');
      onContractUpdate(response.contract);
      
      // Fermer le pad de signature après 2 secondes
      setTimeout(() => {
        setShowSignaturePad(false);
        setSuccess(null);
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la signature');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contractService.completeContract(contract._id);
      setSuccess('Contrat marqué comme terminé !');
      onContractUpdate(response.contract);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la finalisation');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadContract = async () => {
    try {
      const response = await contractService.downloadContract(contract._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrat_${contract.metadata.contractId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Erreur lors du téléchargement');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'pending_signatures': return 'text-yellow-600 bg-yellow-100';
      case 'signed': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'pending_signatures': return <Clock className="w-4 h-4" />;
      case 'signed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {contract.content.title}
            </h2>
              <p className="text-sm text-gray-500">
              ID: {contract.metadata.contractId}
            </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(contract.status)}`}>
              {getStatusIcon(contract.status)}
              <span>{contract.status.replace('_', ' ').toUpperCase()}</span>
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu du contrat */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {contract.content.description && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{contract.content.description}</p>
            </div>
          )}

          {/* Participants */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Participants</h3>
            <div className="space-y-3">
              {contract.participants.map((participant, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {participant.user.firstName[0]}{participant.user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {participant.user.firstName} {participant.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{participant.user.email}</p>
                      <p className="text-sm text-blue-600 capitalize">{participant.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {participant.signed ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Signé</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-medium">En attente</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Termes du contrat */}
          {contract.content.terms && contract.content.terms.length > 0 && (
          <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Termes du contrat</h3>
            <div className="space-y-3">
              {contract.content.terms.map((term, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{term.clause}</h4>
                    <p className="text-gray-700">{term.description}</p>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Conditions */}
          {contract.content.conditions && contract.content.conditions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Conditions</h3>
              <ul className="space-y-2">
                {contract.content.conditions.map((condition, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modalités de livraison */}
          {contract.content.deliveryTerms && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Modalités de livraison</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><span className="font-medium">Méthode:</span> {contract.content.deliveryTerms.method}</p>
                  {contract.content.deliveryTerms.location && (
                  <p><span className="font-medium">Lieu:</span> {contract.content.deliveryTerms.location}</p>
                  )}
                  {contract.content.deliveryTerms.scheduledDate && (
                  <p><span className="font-medium">Date prévue:</span> {new Date(contract.content.deliveryTerms.scheduledDate).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>
          )}

          {/* Dates importantes */}
            <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Dates importantes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Créé le</p>
                <p className="font-medium">{new Date(contract.dates.created).toLocaleDateString('fr-FR')}</p>
              </div>
              {contract.dates.expiresAt && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Expire le</p>
                  <p className="font-medium">{new Date(contract.dates.expiresAt).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {contract.dates.fullySigned && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Entièrement signé le</p>
                  <p className="font-medium">{new Date(contract.dates.fullySigned).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadContract}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger PDF</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {canSign && (
              <button
                onClick={() => setShowSignaturePad(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PenTool className="w-4 h-4" />
                <span>Signer le contrat</span>
              </button>
            )}

            {isFullySigned && !isCompleted && (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isLoading ? 'Finalisation...' : 'Finaliser le contrat'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Messages d'erreur et de succès */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pad de signature */}
      <AnimatePresence>
        {showSignaturePad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Signature électronique</h3>
                <button
                  onClick={() => setShowSignaturePad(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Signez dans la zone ci-dessous :
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="border border-gray-200 rounded cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={clearSignature}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Effacer
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSignaturePad(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={!hasSignature || isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Signature...' : 'Signer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContractSignature;
