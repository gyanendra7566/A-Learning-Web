const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (certificateData) => {
  const {
    studentName,
    courseName,
    completionDate,
    certificateId,
    grade,
    verificationUrl
  } = certificateData;

  return new Promise(async (resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Certificate dimensions
      const width = doc.page.width;
      const height = doc.page.height;

      // Decorative border
      doc.lineWidth(10);
      doc.strokeColor('#4f46e5'); // Primary color
      doc.rect(30, 30, width - 60, height - 60).stroke();

      doc.lineWidth(3);
      doc.strokeColor('#6366f1');
      doc.rect(40, 40, width - 80, height - 80).stroke();

      // Header - Certificate Title
      doc.fontSize(48)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text('Certificate of Completion', 0, 100, {
           width: width,
           align: 'center'
         });

      // Decorative line
      doc.moveTo(width * 0.3, 170)
         .lineTo(width * 0.7, 170)
         .strokeColor('#6366f1')
         .lineWidth(2)
         .stroke();

      // "This is to certify that"
      doc.fontSize(16)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('This is to certify that', 0, 200, {
           width: width,
           align: 'center'
         });

      // Student Name
      doc.fontSize(36)
         .fillColor('#4f46e5')
         .font('Helvetica-Bold')
         .text(studentName, 0, 240, {
           width: width,
           align: 'center'
         });

      // Completion text
      doc.fontSize(16)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('has successfully completed the course', 0, 300, {
           width: width,
           align: 'center'
         });

      // Course Name
      doc.fontSize(28)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(courseName, 0, 340, {
           width: width,
           align: 'center'
         });

      // Grade (if applicable)
      if (grade && grade !== 'Pass') {
        doc.fontSize(18)
           .fillColor('#059669')
           .font('Helvetica-Bold')
           .text(`Grade: ${grade}`, 0, 390, {
             width: width,
             align: 'center'
           });
      }

      // Date
      const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(14)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text(`Issued on ${formattedDate}`, 0, grade && grade !== 'Pass' ? 430 : 410, {
           width: width,
           align: 'center'
         });

      // Certificate ID
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .font('Helvetica')
         .text(`Certificate ID: ${certificateId}`, 0, height - 120, {
           width: width,
           align: 'center'
         });

      // Generate QR Code for verification
      if (verificationUrl) {
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
            width: 100,
            margin: 1,
            color: {
              dark: '#4f46e5',
              light: '#ffffff'
            }
          });

          // Convert data URL to buffer
          const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
          
          // Add QR code to PDF (bottom right)
          doc.image(qrBuffer, width - 130, height - 130, {
            width: 80,
            height: 80
          });

          // QR Code label
          doc.fontSize(8)
             .fillColor('#6b7280')
             .text('Scan to verify', width - 130, height - 40, {
               width: 80,
               align: 'center'
             });
        } catch (qrError) {
          console.error('QR Code generation error:', qrError);
        }
      }

      // Footer - Platform name
      doc.fontSize(12)
         .fillColor('#4f46e5')
         .font('Helvetica-Bold')
         .text('ELearning Platform', 0, height - 80, {
           width: width,
           align: 'center'
         });

      doc.fontSize(10)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('https://elearning.com', 0, height - 65, {
           width: width,
           align: 'center'
         });

      // Signature line (left side)
      const signatureY = height - 150;
      doc.moveTo(120, signatureY)
         .lineTo(280, signatureY)
         .strokeColor('#9ca3af')
         .lineWidth(1)
         .stroke();

      doc.fontSize(10)
         .fillColor('#6b7280')
         .text('Instructor Signature', 120, signatureY + 10, {
           width: 160,
           align: 'center'
         });

      // Signature line (right side)
      doc.moveTo(width - 280, signatureY)
         .lineTo(width - 120, signatureY)
         .strokeColor('#9ca3af')
         .lineWidth(1)
         .stroke();

      doc.fontSize(10)
         .fillColor('#6b7280')
         .text('Director Signature', width - 280, signatureY + 10, {
           width: 160,
           align: 'center'
         });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateCertificate;
