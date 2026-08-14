const nodemailer = require('nodemailer');

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

// Generate formatted HTML Email Template
function generateAgendaEmailHtml(visit) {
  const visitors = visit.visitors || [];
  const agenda = visit.agenda || [];
  const topAttendees = visit.top_attendees || [];

  const refId = `TIEI-VIS-${(visit.visit_date || '').replace(/-/g, '')}-${(visit._id || visit.id || '').toString().slice(-4).toUpperCase()}`;

  const agendaRowsHtml = agenda.map((r, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${r.sort_order || i + 1}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: bold; color: #7c3aed;">${r.from_time || '—'} - ${r.to_time || '—'}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${r.duration_min || 10}m</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #1e293b;">${r.area || '—'}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #1e293b;">${r.activity_name || '—'}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${r.pic || '—'}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${r.support_attendees || '—'}</td>
    </tr>
  `).join('');

  const visitorsRowsHtml = visitors.map((v, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${i + 1}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 600;">${v.title || 'Mr'} ${v.name}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">${v.designation || '—'}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${v.company || '—'}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">${v.dept || '—'}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Plant Tour Agenda — ${visit.company_name}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a;">
  <div style="max-width: 720px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%); color: #ffffff; padding: 24px; text-align: left;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c4b5fd; font-weight: bold;">TIEI VISITOR INSTRUCTION SHEET</div>
      <h1 style="margin: 6px 0 2px; font-size: 22px; color: #ffffff;">Plant Tour & Meeting Agenda</h1>
      <div style="font-size: 12px; color: #e9d5ff;">Reference: <strong>${refId}</strong></div>
    </div>

    <!-- Overview Details -->
    <div style="padding: 20px 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px;"><strong>🏢 Company:</strong> ${visit.company_name || 'Visitor Delegation'}</td>
          <td style="padding: 6px 0; font-size: 13px;"><strong>📅 Date:</strong> ${visit.visit_date || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px;"><strong>⏰ Time Slot:</strong> ${visit.visit_start || '09:00'} - ${visit.visit_end || '17:00'}</td>
          <td style="padding: 6px 0; font-size: 13px;"><strong>👤 Visit Advisor:</strong> ${visit.visit_advisor || '—'}</td>
        </tr>
        ${visit.visit_no ? `<tr><td colspan="2" style="padding: 6px 0; font-size: 13px;"><strong>🏷️ Visit No.:</strong> ${visit.visit_no}</td></tr>` : ''}
        ${visit.visit_purpose ? `<tr><td colspan="2" style="padding: 6px 0; font-size: 12px; color: #475569;"><strong>🎯 Purpose:</strong> ${visit.visit_purpose}</td></tr>` : ''}
      </table>
    </div>

    <!-- Agenda Schedule -->
    <div style="padding: 20px 24px;">
      <h2 style="font-size: 14px; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; border-bottom: 2px solid #7c3aed; padding-bottom: 6px;">
        🗓️ Plant Tour Schedule (${agenda.length} Sessions)
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #7c3aed; color: #ffffff;">
            <th style="padding: 8px 10px; text-align: left; font-size: 11px;">#</th>
            <th style="padding: 8px 10px; text-align: left; font-size: 11px;">Time</th>
            <th style="padding: 8px 10px; text-align: left; font-size: 11px;">Duration</th>
            <th style="padding: 8px 10px; text-align: left; font-size: 11px;">Area</th>
            <th style="padding: 8px 10px; text-align: left; font-size: 11px;">Activity</th>
            <th style="padding: 8px 10px; text-align: left; font-size: 11px;">PIC</th>
            <th style="padding: 8px 10px; text-align: left; font-size: 11px;">Support / Attendees</th>
          </tr>
        </thead>
        <tbody>
          ${agendaRowsHtml}
        </tbody>
      </table>

      <!-- Visitor Attendees -->
      ${visitors.length > 0 ? `
      <h2 style="font-size: 13px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
        👥 Visitor Attendees (${visitors.length})
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #475569;">
            <th style="padding: 6px 10px; text-align: left; font-size: 10px;">#</th>
            <th style="padding: 6px 10px; text-align: left; font-size: 10px;">Name</th>
            <th style="padding: 6px 10px; text-align: left; font-size: 10px;">Designation</th>
            <th style="padding: 6px 10px; text-align: left; font-size: 10px;">Company</th>
            <th style="padding: 6px 10px; text-align: left; font-size: 10px;">Dept</th>
          </tr>
        </thead>
        <tbody>
          ${visitorsRowsHtml}
        </tbody>
      </table>
      ` : ''}

    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
      <p style="margin: 0 0 4px;">This is an automated notification from the <strong>TIEI Visitor Management System</strong>.</p>
      <p style="margin: 0;">Toyota Industries Engine India • Confidential</p>
    </div>

  </div>
</body>
</html>
  `;
}

// Function to send agenda emails to list of recipients
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

    const transporter = await getTransporter();
    const htmlContent = generateAgendaEmailHtml(visit);

    const fromAddress = process.env.SMTP_FROM || `"TIEI Visitor Management" <${process.env.SMTP_USER || 'no-reply@tiei.toyota.com'}>`;
    const subject = `Plant Tour Agenda: ${visit.company_name || 'Visitor Delegation'} (${visit.visit_date || 'Upcoming'})`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipients.join(', '),
      subject,
      html: htmlContent
    });

    console.log(`✉️ Agenda email dispatched to: ${recipients.join(', ')}`);

    return {
      success: true,
      recipients,
      messageId: info.messageId
    };
  } catch (err) {
    console.error('❌ Email dispatch failed:', err);
    return { success: false, error: err.message, recipients: [] };
  }
}

module.exports = {
  sendAgendaEmail,
  generateAgendaEmailHtml
};
