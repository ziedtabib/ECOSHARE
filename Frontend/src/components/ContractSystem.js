import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  X, 
  Clock, 
  MapPin, 
  Truck,
  Users,
  Download,
  Send
} from 'lucide-react';

const ContractSystem = ({ objectData, userData, onClose, onContractSigned }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [contractData, setContractData] = useState({
    deliveryMethod: 'pickup',
    deliveryDate: '',
    deliveryTime: '',
    deliveryAddress: '',
    specialInstructions: '',
    agreedToTerms: false,
    agreedToPrivacy: false
  });
  const [isSigning, setIsSigning] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);

  const steps = [
    { id: 1, title: 'Méthode de livraison', description: 'Choisissez comment récupérer l\'objet' },
    { id: 2, title: 'Détails de livraison', description: 'Planifiez la récupération' },
    { id: 3, title: 'Conditions du contrat', description: 'Lisez et acceptez les conditions' },
    { id: 4, title: 'Signature', description: 'Signez le contrat électronique' }
  ];

  const deliveryMethods = [
    {
      id: 'pickup',
      title: 'Récupération sur place',
      description: 'Vous récupérez l\'objet chez le propriétaire',
      icon: <MapPin className="h-6 w-6" />,
      estimatedTime: '15-30 min'
    },
    {
      id: 'delivery',
      title: 'Livraison à domicile',
      description: 'L\'objet vous est livré à votre adresse',
      icon: <Truck className="h-6 w-6" />,
      estimatedTime: '1-3 jours'
    },
    {
      id: 'meeting',
      title: 'Rendez-vous',
      description: 'Rencontre dans un lieu public',
      icon: <Users className="h-6 w-6" />,
      estimatedTime: '30-60 min'
    }
  ];

  const handleInputChange = (field, value) => {
    setContractData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignContract = async () => {
    setIsSigning(true);
    try {
      // Simuler la signature du contrat
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setContractSigned(true);
      
      // Appeler la fonction de callback
      if (onContractSigned) {
        onContractSigned({
          ...contractData,
          signedAt: new Date().toISOString(),
          contractId: `CONTRACT-${Date.now()}`,
          objectId: objectData.id,
          giverId: objectData.owner.id,
          receiverId: userData.id
        });
      }
    } catch (error) {
      console.error('Erreur lors de la signature:', error);
      alert('Erreur lors de la signature du contrat. Veuillez réessayer.');
    } finally {
      setIsSigning(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choisissez votre méthode de livraison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deliveryMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleInputChange('deliveryMethod', method.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    contractData.deliveryMethod === method.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      contractData.deliveryMethod === method.id
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{method.title}</h4>
                      <p className="text-sm text-gray-500">{method.estimatedTime}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Détails de la livraison
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de récupération
                </label>
                <input
                  type="date"
                  value={contractData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure préférée
                </label>
                <select
                  value={contractData.deliveryTime}
                  onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                  className="input w-full"
                >
                  <option value="">Sélectionnez une heure</option>
                  <option value="09:00">09:00 - 10:00</option>
                  <option value="10:00">10:00 - 11:00</option>
                  <option value="11:00">11:00 - 12:00</option>
                  <option value="14:00">14:00 - 15:00</option>
                  <option value="15:00">15:00 - 16:00</option>
                  <option value="16:00">16:00 - 17:00</option>
                  <option value="17:00">17:00 - 18:00</option>
                </select>
              </div>
            </div>

            {contractData.deliveryMethod === 'delivery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de livraison
                </label>
                <textarea
                  value={contractData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  placeholder="Entrez votre adresse complète..."
                  className="input w-full h-20"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions spéciales (optionnel)
              </label>
              <textarea
                value={contractData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="Ajoutez des instructions particulières..."
                className="input w-full h-20"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Conditions du contrat
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Objet du contrat</h4>
                <p className="text-sm text-gray-600">
                  Le présent contrat concerne le don de l'objet "{objectData.title}" 
                  par {objectData.owner.firstName} {objectData.owner.lastName} 
                  à {userData.firstName} {userData.lastName}.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Conditions générales</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• L'objet est donné en l'état, sans garantie</li>
                  <li>• Le donateur confirme être le propriétaire légitime</li>
                  <li>• Le receveur s'engage à utiliser l'objet de manière responsable</li>
                  <li>• Aucun remboursement ne sera effectué</li>
                  <li>• Les deux parties s'engagent à respecter les modalités de livraison</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Modalités de livraison</h4>
                <p className="text-sm text-gray-600">
                  Méthode: {deliveryMethods.find(m => m.id === contractData.deliveryMethod)?.title}
                  {contractData.deliveryDate && ` - Date: ${contractData.deliveryDate}`}
                  {contractData.deliveryTime && ` - Heure: ${contractData.deliveryTime}`}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={contractData.agreedToTerms}
                  onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  J'accepte les conditions générales du contrat de don
                </span>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={contractData.agreedToPrivacy}
                  onChange={(e) => handleInputChange('agreedToPrivacy', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  J'accepte que mes données personnelles soient utilisées pour finaliser cette transaction
                </span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Signature du contrat
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">
                  Contrat de don ECOSHARE
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Contrat #{`CONTRACT-${Date.now()}`}
                </p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Objet:</span>
                  <span className="font-medium">{objectData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Donateur:</span>
                  <span className="font-medium">{objectData.owner.firstName} {objectData.owner.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Receveur:</span>
                  <span className="font-medium">{userData.firstName} {userData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleSignContract}
                disabled={isSigning || !contractData.agreedToTerms || !contractData.agreedToPrivacy}
                className="btn-primary btn-lg flex items-center space-x-2"
              >
                {isSigning ? (
                  <>
                    <Clock className="h-5 w-5 animate-spin" />
                    <span>Signature en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Signer le contrat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (contractSigned) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl max-w-md w-full p-6 text-center"
        >
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Contrat signé avec succès !
          </h3>
          <p className="text-gray-600 mb-6">
            Votre contrat de don a été signé et enregistré. 
            Vous recevrez un email de confirmation sous peu.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => onClose()}
              className="btn-primary btn flex-1"
            >
              Fermer
            </button>
            <button
              onClick={() => {/* Télécharger le contrat */}}
              className="btn-secondary btn flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Télécharger</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Contrat de don
                </h2>
                <p className="text-sm text-gray-600">
                  {objectData?.title || 'Objet'} - Étape {currentStep} sur {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 w-16 mx-2 ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                {steps[currentStep - 1]?.title}
              </p>
              <p className="text-xs text-gray-600">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Boutons de navigation */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="btn-secondary btn"
            >
              Précédent
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !contractData.deliveryMethod) ||
                  (currentStep === 2 && (!contractData.deliveryDate || !contractData.deliveryTime)) ||
                  (currentStep === 3 && (!contractData.agreedToTerms || !contractData.agreedToPrivacy))
                }
                className="btn-primary btn"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSignContract}
                disabled={isSigning || !contractData.agreedToTerms || !contractData.agreedToPrivacy}
                className="btn-primary btn"
              >
                {isSigning ? 'Signature...' : 'Signer le contrat'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContractSystem;
