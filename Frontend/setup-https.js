const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration HTTPS pour le développement...');

try {
  // Vérifier si mkcert est installé
  execSync('mkcert -version', { stdio: 'ignore' });
  console.log('✅ mkcert est déjà installé');
} catch (error) {
  console.log('📦 Installation de mkcert...');
  // Sur Windows, utiliser chocolatey ou télécharger depuis GitHub
  console.log('Veuillez installer mkcert manuellement:');
  console.log('1. Téléchargez depuis: https://github.com/FiloSottile/mkcert/releases');
  console.log('2. Ou utilisez chocolatey: choco install mkcert');
  process.exit(1);
}

try {
  // Créer le dossier certs s'il n'existe pas
  const certsDir = path.join(__dirname, 'certs');
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
  }

  // Générer le certificat pour localhost
  console.log('🔐 Génération du certificat pour localhost...');
  execSync('mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1', {
    stdio: 'inherit',
    cwd: __dirname
  });

  console.log('✅ Certificat généré avec succès !');
  console.log('🚀 Vous pouvez maintenant utiliser HTTPS en développement');
  
} catch (error) {
  console.error('❌ Erreur lors de la génération du certificat:', error.message);
  process.exit(1);
}
