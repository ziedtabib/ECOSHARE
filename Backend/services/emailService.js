const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configuration pour Gmail (peut être adaptée pour d'autres fournisseurs)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Vérifier la configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.log('❌ Configuration email échouée:', error.message);
        console.log('📧 Service email désactivé - configurez EMAIL_USER et EMAIL_PASS');
      } else {
        console.log('✅ Service email configuré avec succès');
      }
    });
  }

  async sendEmailConfirmation(userEmail, firstName, verificationCode) {
    if (!this.transporter || !process.env.EMAIL_USER) {
      console.log('📧 Service email non configuré - email de confirmation non envoyé');
      
      // Mode développement : afficher les détails dans la console
      console.log('\n📧 ===== EMAIL DE CONFIRMATION (MODE DÉVELOPPEMENT) =====');
      console.log(`📬 Destinataire: ${userEmail}`);
      console.log(`👤 Nom: ${firstName}`);
      console.log(`🔢 Code de confirmation: ${verificationCode}`);
      console.log('📧 ======================================================\n');
      
      return { success: true, message: 'Email simulé en mode développement' };
    }

    const mailOptions = {
      from: `"ECOSHARE Tunisie" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Code de confirmation ECOSHARE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌱 ECOSHARE Tunisie</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Partagez, Réutilisez, Durable</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Bonjour ${firstName} ! 👋</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Bienvenue sur ECOSHARE ! Nous sommes ravis de vous compter parmi notre communauté 
              de partage et de durabilité.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              Pour créer votre compte et commencer à partager des objets et aliments, 
              veuillez utiliser le code de confirmation ci-dessous :
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #10B981; color: white; padding: 20px; 
                          border-radius: 12px; font-size: 32px; font-weight: bold; 
                          letter-spacing: 8px; display: inline-block; 
                          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                ${verificationCode}
              </div>
            </div>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400E; margin: 0; font-size: 14px; font-weight: bold;">
                ⏰ Ce code expire dans 10 minutes pour votre sécurité.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              Entrez ce code dans l'application ECOSHARE pour créer votre compte.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              <strong>Que pouvez-vous faire sur ECOSHARE ?</strong><br>
              • 📱 Partager des objets que vous n'utilisez plus<br>
              • 🍎 Donner des aliments pour éviter le gaspillage<br>
              • 🤝 Aider des associations caritatives<br>
              • 🌱 Contribuer à un mode de vie plus durable
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 ECOSHARE Tunisie. Tous droits réservés.
            </p>
            <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 12px;">
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de confirmation envoyé à ${userEmail}`);
      return { success: true, message: 'Email de confirmation envoyé' };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      return { success: false, message: 'Erreur lors de l\'envoi de l\'email' };
    }
  }

  async sendPasswordResetEmail(userEmail, firstName, resetCode) {
    if (!this.transporter || !process.env.EMAIL_USER) {
      console.log('📧 Service email non configuré - email de réinitialisation non envoyé');
      
      // Mode développement : afficher les détails dans la console
      console.log('\n📧 ===== EMAIL DE RÉINITIALISATION (MODE DÉVELOPPEMENT) =====');
      console.log(`📬 Destinataire: ${userEmail}`);
      console.log(`👤 Nom: ${firstName}`);
      console.log(`🔢 Code de réinitialisation: ${resetCode}`);
      console.log('📧 ========================================================\n');
      
      return { success: true, message: 'Email simulé en mode développement' };
    }

    const mailOptions = {
      from: `"ECOSHARE Tunisie" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Code de réinitialisation ECOSHARE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #EF4444, #DC2626); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔒 ECOSHARE Tunisie</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Réinitialisation de mot de passe</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Bonjour ${firstName} !</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte ECOSHARE.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              Si vous avez demandé cette réinitialisation, utilisez le code ci-dessous 
              pour créer un nouveau mot de passe :
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #EF4444; color: white; padding: 20px; 
                          border-radius: 12px; font-size: 32px; font-weight: bold; 
                          letter-spacing: 8px; display: inline-block; 
                          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                ${resetCode}
              </div>
            </div>
            
            <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #DC2626; margin: 0; font-size: 14px; font-weight: bold;">
                ⏰ Ce code expire dans 10 minutes pour votre sécurité.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              Entrez ce code dans l'application ECOSHARE pour réinitialiser votre mot de passe.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
              Votre mot de passe restera inchangé.
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 ECOSHARE Tunisie. Tous droits réservés.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de réinitialisation envoyé à ${userEmail}`);
      return { success: true, message: 'Email de réinitialisation envoyé' };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      return { success: false, message: 'Erreur lors de l\'envoi de l\'email' };
    }
  }

  async sendContractSignedEmail(contractData) {
    if (!this.transporter || !process.env.EMAIL_USER) {
      console.log('📧 Service email non configuré - email de contrat signé non envoyé');
      
      // Mode développement : afficher les détails dans la console
      console.log('\n📧 ===== EMAIL CONTRAT SIGNÉ (MODE DÉVELOPPEMENT) =====');
      console.log(`📋 Contrat ID: ${contractData.contractId}`);
      console.log(`👤 Propriétaire: ${contractData.ownerName} (${contractData.ownerEmail})`);
      console.log(`👤 Receveur: ${contractData.receiverName} (${contractData.receiverEmail})`);
      console.log(`📦 Objet: ${contractData.objectTitle}`);
      console.log(`📅 Date d'échange: ${contractData.exchangeDate}`);
      console.log(`📍 Lieu: ${contractData.exchangeLocation}`);
      console.log('📧 ====================================================\n');
      
      return { success: true, message: 'Email simulé en mode développement' };
    }

    const mailOptions = {
      from: `"ECOSHARE Tunisie" <${process.env.EMAIL_USER}>`,
      to: [contractData.ownerEmail, contractData.receiverEmail],
      subject: `✅ Contrat signé - ${contractData.objectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ ECOSHARE Tunisie</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Contrat signé avec succès</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">🎉 Félicitations !</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Votre contrat d'échange a été signé avec succès par toutes les parties. 
              L'échange peut maintenant avoir lieu selon les conditions convenues.
            </p>
            
            <div style="background: #ECFDF5; border: 1px solid #10B981; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #065F46; margin: 0 0 15px 0; font-size: 18px;">📋 Détails du contrat</h3>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">ID du contrat:</strong>
                <span style="color: #6b7280; font-family: monospace;">${contractData.contractId}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">Objet:</strong>
                <span style="color: #6b7280;">${contractData.objectTitle}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">Propriétaire:</strong>
                <span style="color: #6b7280;">${contractData.ownerName}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">Receveur:</strong>
                <span style="color: #6b7280;">${contractData.receiverName}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">Date d'échange:</strong>
                <span style="color: #6b7280;">${new Date(contractData.exchangeDate).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">Lieu:</strong>
                <span style="color: #6b7280;">${contractData.exchangeLocation}</span>
              </div>
              
              <div>
                <strong style="color: #374151;">Méthode:</strong>
                <span style="color: #6b7280;">${contractData.deliveryMethod === 'pickup' ? 'Récupération' : 
                  contractData.deliveryMethod === 'delivery' ? 'Livraison' : 'Rencontre'}</span>
              </div>
            </div>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400E; margin: 0; font-size: 14px; font-weight: bold;">
                📝 Prochaines étapes
              </p>
              <ul style="color: #92400E; margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
                <li>Contactez l'autre partie pour organiser l'échange</li>
                <li>Respectez la date et le lieu convenus</li>
                <li>Confirmez l'échange dans l'application après la remise</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/contracts/${contractData.contractId}" 
                 style="background: #10B981; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                📄 Voir le contrat
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              Ce contrat est légalement contraignant. En cas de problème, contactez notre support.
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 ECOSHARE Tunisie. Tous droits réservés.
            </p>
            <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 12px;">
              ID du contrat: ${contractData.contractId}
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de contrat signé envoyé pour le contrat ${contractData.contractId}`);
      return { success: true, message: 'Email de contrat signé envoyé' };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de contrat:', error);
      return { success: false, message: 'Erreur lors de l\'envoi de l\'email de contrat' };
    }
  }

  async sendContractNotificationEmail(contractData, recipientType) {
    if (!this.transporter || !process.env.EMAIL_USER) {
      console.log('📧 Service email non configuré - notification de contrat non envoyée');
      
      // Mode développement : afficher les détails dans la console
      console.log('\n📧 ===== NOTIFICATION CONTRAT (MODE DÉVELOPPEMENT) =====');
      console.log(`📋 Contrat ID: ${contractData.contractId}`);
      console.log(`👤 Type de destinataire: ${recipientType}`);
      console.log(`📦 Objet: ${contractData.objectTitle}`);
      console.log('📧 ====================================================\n');
      
      return { success: true, message: 'Email simulé en mode développement' };
    }

    const isOwner = recipientType === 'owner';
    const recipientEmail = isOwner ? contractData.ownerEmail : contractData.receiverEmail;
    const recipientName = isOwner ? contractData.ownerName : contractData.receiverName;
    const otherPartyName = isOwner ? contractData.receiverName : contractData.ownerName;

    const mailOptions = {
      from: `"ECOSHARE Tunisie" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `📝 Contrat à signer - ${contractData.objectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📝 ECOSHARE Tunisie</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Action requise sur votre contrat</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Bonjour ${recipientName} !</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              ${otherPartyName} a ${isOwner ? 'créé' : 'signé'} un contrat d'échange pour l'objet 
              <strong>"${contractData.objectTitle}"</strong>. 
              ${isOwner ? 'Votre signature est maintenant requise.' : 'Votre signature est maintenant requise.'}
            </p>
            
            <div style="background: #EFF6FF; border: 1px solid #3B82F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1E40AF; margin: 0 0 15px 0; font-size: 18px;">📋 Détails du contrat</h3>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">ID du contrat:</strong>
                <span style="color: #6b7280; font-family: monospace;">${contractData.contractId}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">Objet:</strong>
                <span style="color: #6b7280;">${contractData.objectTitle}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">Date d'échange:</strong>
                <span style="color: #6b7280;">${new Date(contractData.exchangeDate).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #374151;">Lieu:</strong>
                <span style="color: #6b7280;">${contractData.exchangeLocation}</span>
              </div>
            </div>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400E; margin: 0; font-size: 14px; font-weight: bold;">
                ⚡ Action requise
              </p>
              <p style="color: #92400E; margin: 10px 0 0 0; font-size: 14px;">
                Veuillez vous connecter à votre compte ECOSHARE pour signer ce contrat et finaliser l'échange.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/contracts/${contractData.contractId}" 
                 style="background: #3B82F6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                ✍️ Signer le contrat
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              Une fois signé par toutes les parties, vous recevrez une confirmation par email.
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 ECOSHARE Tunisie. Tous droits réservés.
            </p>
            <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 12px;">
              ID du contrat: ${contractData.contractId}
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de notification de contrat envoyé à ${recipientEmail}`);
      return { success: true, message: 'Email de notification envoyé' };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de notification:', error);
      return { success: false, message: 'Erreur lors de l\'envoi de l\'email de notification' };
    }
  }
}

module.exports = new EmailService();
