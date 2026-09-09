const nodemailer = require('nodemailer');
const { generateAgendaPdfBuffer } = require('./pdfService');

// Helper to create transport
async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });
  }

  // Fallback: Test account for dev/preview
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    // Basic fallback transporter
    return nodemailer.createTransport({
      jsonTransport: true
    });
  }
}

// Generate Email Body HTML (Professional Cover Note with PDF Notification)
function generateEmailCoverHtml(visit) {
  const refId = `TIEI-VIS-${(visit.visit_date || '').replace(/-/g, '')}-${(visit._id || visit.id || '').toString().slice(-4).toUpperCase()}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Plant Tour Agenda PDF — ${visit.company_name}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%); color: #ffffff; padding: 24px; text-align: left;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c4b5fd; font-weight: bold;">TIEI VISITOR MANAGEMENT SYSTEM</div>
      <h1 style="margin: 6px 0 2px; font-size: 20px; color: #ffffff;">Visitor Instruction Sheet & Plant Tour Agenda</h1>
      <div style="font-size: 12px; color: #e9d5ff;">Reference ID: <strong>${refId}</strong></div>
    </div>

    <!-- Message Content -->
    <div style="padding: 24px; background-color: #ffffff;">
      <p style="font-size: 14px; margin-top: 0; color: #1e293b;">Dear Attendee,</p>
      <p style="font-size: 13.5px; color: #334155; line-height: 1.5;">
        Please find attached the official <strong>Visitor Instruction Sheet & Plant Tour Agenda (PDF)</strong> for the upcoming visit of <strong>${visit.company_name || 'Visitor Delegation'}</strong>.
      </p>

      <!-- Overview Details Box -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 5px 0; color: #64748b; width: 120px;">🏢 <strong>Company:</strong></td>
            <td style="padding: 5px 0; color: #0f172a; font-weight: 600;">${visit.company_name || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">📅 <strong>Visit Date:</strong></td>
            <td style="padding: 5px 0; color: #0f172a; font-weight: 600;">${visit.visit_date || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">⏰ <strong>Time Slot:</strong></td>
            <td style="padding: 5px 0; color: #7c3aed; font-weight: 700;">${visit.visit_start || '09:00'} – ${visit.visit_end || '17:00'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">👤 <strong>Visit Advisor:</strong></td>
            <td style="padding: 5px 0; color: #0f172a;">${visit.visit_advisor || '—'}</td>
          </tr>
          ${visit.visit_no ? `<tr><td style="padding: 5px 0; color: #64748b;">🏷️ <strong>Visit No.:</strong></td><td style="padding: 5px 0; color: #0f172a;">${visit.visit_no}</td></tr>` : ''}
          ${visit.visit_purpose ? `<tr><td style="padding: 5px 0; color: #64748b;">🎯 <strong>Purpose:</strong></td><td style="padding: 5px 0; color: #334155;">${visit.visit_purpose}</td></tr>` : ''}
        </table>
      </div>

      <!-- Attachment Banner -->
      <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 14px 16px; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">📄</span>
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #6d28d9;">Attached Document</div>
          <div style="font-size: 11px; color: #7c3aed;">TIEI_Visitor_Agenda_${(visit.visit_date || '').replace(/-/g, '')}.pdf</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
      <p style="margin: 0 0 4px;">This is an automated mail <strong>DO NOT REPLY</strong>.</p>
      <p style="margin: 0;">Toyota Industries Engine India</p>
    </div>

  </div>
</body>
</html>
  `;
}

// Function to send agenda emails with PDF attachment to list of recipients
async function sendAgendaEmail(visit, customRecipients = null) {
  try {
    const recipients = [];

    if (customRecipients && Array.isArray(customRecipients)) {
      recipients.push(...customRecipients.filter(Boolean));
    } else {
      // Gather emails from top_attendees
      (visit.top_attendees || []).forEach(a => {
        if (a.email && a.email.trim() && a.email.includes('@')) {
          recipients.push(a.email.trim());
        }
      });
    }

    if (recipients.length === 0) {
      return { success: false, message: 'No valid recipient email addresses found.', recipients: [] };
    }

    // 1. Generate PDF Buffer
    console.log(`📄 Generating PDF document for visit: ${visit.company_name || 'Visitor'}...`);
    const pdfBuffer = await generateAgendaPdfBuffer(visit);

    // 2. Setup Transporter
    const transporter = await getTransporter();
    const htmlContent = generateEmailCoverHtml(visit);

    const fromAddress = process.env.SMTP_FROM || `"TIEI Visitor Management" <${process.env.SMTP_USER || 'no-reply@tiei.toyota.com'}>`;
    const subject = `Plant Tour Agenda (PDF Attachment): ${visit.company_name || 'Visitor Delegation'} (${visit.visit_date || 'Upcoming'})`;

    const pdfFileName = `TIEI_Visitor_Agenda_${(visit.visit_date || 'Agenda').replace(/-/g, '')}.pdf`;

    // 3. Send Email with PDF Attachment
    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipients.join(', '),
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: pdfFileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log(`✉️ Agenda email with PDF attachment (${pdfBuffer.length} bytes) dispatched to: ${recipients.join(', ')}`);

    return {
      success: true,
      recipients,
      messageId: info.messageId,
      pdfSize: pdfBuffer.length
    };
  } catch (err) {
    console.error('❌ Email dispatch failed:', err);
    return { success: false, error: err.message, recipients: [] };
  }
}

module.exports = {
  sendAgendaEmail,
  generateEmailCoverHtml
};
