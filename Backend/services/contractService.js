const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class ContractService {
  constructor() {
    this.templatesPath = path.join(__dirname, '../templates/contracts');
    this.outputPath = path.join(__dirname, '../public/contracts');
  }

  // Générer un contrat PDF
  async generateContractPDF(contract) {
    try {
      // Créer un nouveau document PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();

      // Charger les polices
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Titre
      page.drawText(contract.content.title, {
        x: 50,
        y: height - 50,
        size: 18,
        font: boldFont,
        color: rgb(0, 0.5, 0)
      });

      // Informations du contrat
      page.drawText(`ID du contrat: ${contract.metadata.contractId}`, {
        x: 50,
        y: height - 80,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      });

      page.drawText(`Date de création: ${contract.dates.created.toLocaleDateString('fr-FR')}`, {
        x: 50,
        y: height - 100,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      });

      // Description
      if (contract.content.description) {
        page.drawText('Description:', {
          x: 50,
          y: height - 130,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0)
        });

        const descriptionLines = this.wrapText(contract.content.description, 80);
        let yPos = height - 150;
        for (const line of descriptionLines) {
          page.drawText(line, {
            x: 50,
            y: yPos,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          });
          yPos -= 15;
        }
      }

      // Termes et conditions
      let currentY = yPos - 20;
      page.drawText('Termes et conditions:', {
        x: 50,
        y: currentY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      currentY -= 20;
      for (const term of contract.content.terms) {
        page.drawText(`${term.clause}:`, {
          x: 50,
          y: currentY,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
        currentY -= 15;

        const termLines = this.wrapText(term.description, 80);
        for (const line of termLines) {
          page.drawText(`  ${line}`, {
            x: 50,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          });
          currentY -= 15;
        }
        currentY -= 5;
      }

      // Conditions supplémentaires
      if (contract.content.conditions && contract.content.conditions.length > 0) {
        currentY -= 10;
        page.drawText('Conditions supplémentaires:', {
          x: 50,
          y: currentY,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0)
        });

        currentY -= 20;
        for (const condition of contract.content.conditions) {
          page.drawText(`• ${condition}`, {
            x: 50,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          });
          currentY -= 15;
        }
      }

      // Modalités de livraison
      if (contract.content.deliveryTerms) {
        currentY -= 10;
        page.drawText('Modalités de livraison:', {
          x: 50,
          y: currentY,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0)
        });

        currentY -= 20;
        page.drawText(`Méthode: ${contract.content.deliveryTerms.method}`, {
          x: 50,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        });
        currentY -= 15;

        if (contract.content.deliveryTerms.location) {
          page.drawText(`Lieu: ${contract.content.deliveryTerms.location}`, {
            x: 50,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          });
          currentY -= 15;
        }

        if (contract.content.deliveryTerms.scheduledDate) {
          page.drawText(`Date prévue: ${new Date(contract.content.deliveryTerms.scheduledDate).toLocaleDateString('fr-FR')}`, {
            x: 50,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          });
          currentY -= 15;
        }
      }

      // Espace pour les signatures
      currentY -= 30;
      page.drawText('Signatures:', {
        x: 50,
        y: currentY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      currentY -= 40;
      for (const participant of contract.participants) {
        const roleText = participant.role === 'giver' ? 'Donneur' : 
                        participant.role === 'receiver' ? 'Receveur' : 'Témoin';
        
        page.drawText(`${roleText}:`, {
          x: 50,
          y: currentY,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0)
        });

        // Ligne pour la signature
        page.drawLine({
          start: { x: 200, y: currentY - 5 },
          end: { x: 400, y: currentY - 5 },
          thickness: 1,
          color: rgb(0, 0, 0)
        });

        if (participant.signed) {
          page.drawText('Signé', {
            x: 420,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0.5, 0)
          });

          page.drawText(`le ${participant.signedAt.toLocaleDateString('fr-FR')}`, {
            x: 420,
            y: currentY - 15,
            size: 8,
            font: font,
            color: rgb(0, 0.5, 0)
          });
        } else {
          page.drawText('En attente de signature', {
            x: 420,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0.8, 0.4, 0)
          });
        }

        currentY -= 40;
      }

      // Pied de page
      page.drawText('ECOSHARE - Plateforme de partage éco-responsable', {
        x: 50,
        y: 50,
        size: 8,
        font: font,
        color: rgb(0, 0.5, 0)
      });

      page.drawText(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, {
        x: 50,
        y: 35,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });

      // Sauvegarder le PDF
      const pdfBytes = await pdfDoc.save();
      const fileName = `contract_${contract.metadata.contractId}.pdf`;
      const filePath = path.join(this.outputPath, fileName);

      // Créer le dossier s'il n'existe pas
      await fs.mkdir(this.outputPath, { recursive: true });
      await fs.writeFile(filePath, pdfBytes);

      return {
        fileName,
        filePath,
        url: `/contracts/${fileName}`
      };
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }

  // Ajouter une signature au PDF
  async addSignatureToPDF(contract, participantId, signatureData) {
    try {
      const fileName = `contract_${contract.metadata.contractId}.pdf`;
      const filePath = path.join(this.outputPath, fileName);

      // Lire le PDF existant
      const existingPdfBytes = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const page = pages[0];

      // Trouver le participant
      const participant = contract.participants.find(p => p.user.toString() === participantId.toString());
      if (!participant) {
        throw new Error('Participant non trouvé');
      }

      // Calculer la position de la signature
      const signatureY = this.getSignaturePosition(participant.role, contract.participants.length);

      // Ajouter la signature (simulation - en production, utiliser une vraie signature)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText('✓ Signé électroniquement', {
        x: 200,
        y: signatureY,
        size: 10,
        font: font,
        color: rgb(0, 0.5, 0)
      });

      // Sauvegarder le PDF mis à jour
      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return {
        fileName,
        filePath,
        url: `/contracts/${fileName}`
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la signature:', error);
      throw error;
    }
  }

  // Calculer la position de la signature
  getSignaturePosition(role, totalParticipants) {
    const baseY = 200; // Position de base
    const spacing = 40; // Espacement entre signatures
    
    if (role === 'giver') return baseY;
    if (role === 'receiver') return baseY - spacing;
    if (role === 'witness') return baseY - (spacing * 2);
    
    return baseY;
  }

  // Envelopper le texte
  wrapText(text, maxLength) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  // Générer un hash de sécurité pour le contrat
  generateContractHash(contract) {
    const data = {
      contractId: contract.metadata.contractId,
      participants: contract.participants.map(p => ({
        user: p.user.toString(),
        role: p.role,
        signed: p.signed,
        signedAt: p.signedAt
      })),
      content: contract.content,
      dates: contract.dates
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Valider l'intégrité du contrat
  validateContractIntegrity(contract, expectedHash) {
    const currentHash = this.generateContractHash(contract);
    return currentHash === expectedHash;
  }

  // Créer un template de contrat
  async createContractTemplate(type, templateData) {
    try {
      const template = {
      type,
      ...templateData,
      createdAt: new Date(),
      version: '1.0'
    };

    const templatePath = path.join(this.templatesPath, `${type}_template.json`);
    await fs.mkdir(this.templatesPath, { recursive: true });
    await fs.writeFile(templatePath, JSON.stringify(template, null, 2));

    return template;
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      throw error;
    }
  }

  // Charger un template de contrat
  async loadContractTemplate(type) {
    try {
      const templatePath = path.join(this.templatesPath, `${type}_template.json`);
      const templateData = await fs.readFile(templatePath, 'utf8');
      return JSON.parse(templateData);
    } catch (error) {
      console.error('Erreur lors du chargement du template:', error);
      return null;
    }
  }
}

module.exports = new ContractService();
