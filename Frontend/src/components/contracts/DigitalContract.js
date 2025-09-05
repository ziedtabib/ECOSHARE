import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  PenTool, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  MapPin,
  Package,
  X,
  Download,
  Send
} from 'lucide-react';

const DigitalContract = ({ 
  contract, 
  onSign, 
  onClose, 
  isOwner = false, 
  isReceiver = false 
}) => {
  const [signature, setSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (contract) {
      setIsValid(contract.status === 'pending' && 
        ((isOwner && !contract.ownerSigned) || (isReceiver && !contract.receiverSigned)));
    }
  }, [contract, isOwner, isReceiver]);

  const handleSignature = (signatureData) => {
    setSignatureData(signatureData);
    setSignature(signatureData);
  };

  const handleSignContract = async () => {
    if (!signatureData) return;
    
    setIsSigning(true);
    try {
      await onSign({
        signature: signatureData,
        signedAt: new Date().toISOString(),
        signerType: isOwner ? 'owner' : 'receiver'
      });
    } catch (error) {
      console.error('Erreur lors de la signature:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const downloadContract = () => {
    const element = document.createElement('a');
    const file = new Blob([generateContractPDF()], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = `contrat-ecoshare-${contract.id}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateContractPDF = () => {
    // Simulation de génération PDF
    return `
CONTRAT D'ÉCHANGE ECOSHARE
==========================

Objet: ${contract.objectTitle}
Date: ${new Date(contract.createdAt).toLocaleDateString('fr-FR')}
ID Contrat: ${contract.id}

DONNEUR:
- Nom: ${contract.ownerName}
- Email: ${contract.ownerEmail}
- Signature: ${contract.ownerSigned ? 'Signé' : 'Non signé'}

RECEVEUR:
- Nom: ${contract.receiverName}
- Email: ${contract.receiverEmail}
- Signature: ${contract.receiverSigned ? 'Signé' : 'Non signé'}

CONDITIONS:
1. L'objet est donné gratuitement
2. L'état de l'objet est tel que décrit
3. L'échange est définitif
4. Aucun retour n'est possible

LIEU D'ÉCHANGE: ${contract.exchangeLocation}
DATE D'ÉCHANGE: ${contract.exchangeDate}

Signature électronique valide selon la loi française.
    `;
  };

  if (!contract) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Contrat d'Échange ECOSHARE
                </h2>
                <p className="text-sm text-gray-600">
                  ID: {contract.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadContract}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Télécharger le contrat"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu du contrat */}
        <div className="p-6 space-y-6">
          {/* Statut du contrat */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {contract.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-medium text-gray-900">
                  Statut: {contract.status === 'completed' ? 'Signé' : 'En attente de signature'}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                Créé le {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>

          {/* Détails de l'objet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Objet de l'échange</span>
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{contract.objectTitle}</h4>
                <p className="text-sm text-gray-600 mt-1">{contract.objectDescription}</p>
                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Catégorie: {contract.objectCategory}</span>
                  <span>État: {contract.objectCondition}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Détails de l'échange</span>
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Date: {new Date(contract.exchangeDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Lieu: {contract.exchangeLocation}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Méthode: {contract.deliveryMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parties du contrat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donneur */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Donneur</span>
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{contract.ownerName}</p>
                    <p className="text-sm text-gray-600">{contract.ownerEmail}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contract.ownerSigned ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {contract.ownerSigned ? 'Signé' : 'En attente'}
                    </span>
                  </div>
                </div>
                {contract.ownerSignedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Signé le {new Date(contract.ownerSignedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

            {/* Receveur */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Receveur</span>
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{contract.receiverName}</p>
                    <p className="text-sm text-gray-600">{contract.receiverEmail}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contract.receiverSigned ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {contract.receiverSigned ? 'Signé' : 'En attente'}
                    </span>
                  </div>
                </div>
                {contract.receiverSignedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Signé le {new Date(contract.receiverSignedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Conditions du contrat */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Conditions du contrat</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>L'objet est donné gratuitement et sans contrepartie financière</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>L'état de l'objet est tel que décrit dans l'annonce</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>L'échange est définitif et irréversible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Aucun retour ou remboursement n'est possible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Les deux parties s'engagent à respecter les conditions d'échange</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Zone de signature */}
          {isValid && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <PenTool className="h-5 w-5" />
                <span>Signature électronique</span>
              </h3>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
                <SignaturePad 
                  onSignature={handleSignature}
                  width={400}
                  height={150}
                />
                {signatureData && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleSignContract}
                      disabled={isSigning}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSigning ? 'Signature en cours...' : 'Signer le contrat'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message de confirmation */}
          {contract.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">
                  Contrat signé et validé
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Ce contrat a été signé par les deux parties et est maintenant légalement valide.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Composant de signature
const SignaturePad = ({ onSignature, width = 400, height = 150 }) => {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configuration du canvas
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

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
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);
      
      // Générer la signature en base64
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();
      onSignature(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignature(null);
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Signez dans la zone ci-dessous
        </p>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-300 rounded cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      {hasSignature && (
        <div className="flex justify-center">
          <button
            onClick={clearSignature}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Effacer la signature
          </button>
        </div>
      )}
    </div>
  );
};

export default DigitalContract;
