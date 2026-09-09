const PDFDocument = require('pdfkit');

function generateAgendaPdfBuffer(visit) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const primaryColor = '#7C3AED';
      const darkColor = '#0F172A';
      const mutedColor = '#64748B';
      const lightBg = '#F8FAFC';

      const visitors = visit.visitors || [];
      const agenda = visit.agenda || [];
      const refId = `TIEI-VIS-${(visit.visit_date || '').replace(/-/g, '')}-${(visit._id || visit.id || '').toString().slice(-4).toUpperCase()}`;

      // ── Header Banner ──
      doc.rect(30, 30, 535, 54).fill('#1E1B4B');
      
      doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('TOYOTA INDUSTRIES ENGINE INDIA', 42, 40);
      doc.fontSize(10).font('Helvetica').text('VISITOR INSTRUCTION SHEET & PLANT TOUR AGENDA', 42, 60);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#C4B5FD').text(`Ref: ${refId}`, 400, 48, { align: 'right', width: 150 });

      let y = 96;

      // ── Overview Details Box ──
      doc.rect(30, y, 535, 66).fill(lightBg).stroke('#E2E8F0');
      
      doc.fillColor(darkColor).fontSize(9).font('Helvetica-Bold');
      doc.text('Company:', 42, y + 10);
      doc.font('Helvetica').text(visit.company_name || '—', 95, y + 10);

      doc.font('Helvetica-Bold').text('Date:', 320, y + 10);
      doc.font('Helvetica').text(visit.visit_date || '—', 355, y + 10);

      doc.font('Helvetica-Bold').text('Time Slot:', 42, y + 28);
      doc.font('Helvetica').text(`${visit.visit_start || '09:00'} - ${visit.visit_end || '17:00'}`, 95, y + 28);

      doc.font('Helvetica-Bold').text('Visit Advisor:', 320, y + 28);
      doc.font('Helvetica').text(visit.visit_advisor || '—', 390, y + 28);

      doc.font('Helvetica-Bold').text('Visit No.:', 42, y + 46);
      doc.font('Helvetica').text(visit.visit_no || '1st', 95, y + 46);

      doc.font('Helvetica-Bold').text('Purpose:', 200, y + 46);
      doc.font('Helvetica').text((visit.visit_purpose || '—').slice(0, 50), 250, y + 46);

      y += 82;

      // ── 1. VISITOR DELEGATION LIST (NOW TOP) ──
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text(`VISITOR DELEGATION LIST (${visitors.length})`, 30, y);
      y += 16;

      const vColX = [30, 55, 175, 305, 435];
      const vColW = [25, 120, 130, 130, 130];

      doc.rect(30, y, 535, 18).fill('#4C1D95');
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
      
      const vHeaders = ['#', 'Name & Title', 'Designation', 'Company', 'Department'];
      vHeaders.forEach((h, i) => {
        doc.text(h, vColX[i] + 3, y + 5, { width: vColW[i] - 6 });
      });

      y += 18;

      if (visitors.length === 0) {
        doc.rect(30, y, 535, 18).fill('#FFFFFF').stroke('#E2E8F0');
        doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text('No visitor attendees recorded', 35, y + 5);
        y += 18;
      } else {
        visitors.forEach((v, idx) => {
          if (y > 730) {
            doc.addPage();
            y = 40;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          doc.rect(30, y, 535, 18).fill(bg).stroke('#E2E8F0');

          doc.fillColor(darkColor).fontSize(8).font('Helvetica');
          doc.text(String(idx + 1), vColX[0] + 3, y + 5, { width: vColW[0] - 6 });
          
          doc.font('Helvetica-Bold');
          doc.text(`${v.title || 'Mr'} ${v.name || '—'}`, vColX[1] + 3, y + 5, { width: vColW[1] - 6 });
          
          doc.font('Helvetica');
          doc.text(v.designation || '—', vColX[2] + 3, y + 5, { width: vColW[2] - 6 });
          doc.text(v.company || '—', vColX[3] + 3, y + 5, { width: vColW[3] - 6 });
          doc.text(v.dept || '—', vColX[4] + 3, y + 5, { width: vColW[4] - 6 });

          y += 18;
        });
      }

      y += 20;

      // ── 2. PLANT TOUR SCHEDULE TABLE (NOW SECOND) ──
      if (y > 660) {
        doc.addPage();
        y = 40;
      }

      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('PLANT TOUR SCHEDULE', 30, y);
      y += 16;

      // Table Headers
      const colX = [30, 52, 115, 155, 235, 365, 450];
      const colW = [22, 63, 40, 80, 130, 85, 115];

      doc.rect(30, y, 535, 18).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
      
      const headers = ['#', 'Time', 'Min', 'Area', 'Activity', 'PIC / Presenter', 'Support / Attendees'];
      headers.forEach((h, i) => {
        doc.text(h, colX[i] + 3, y + 5, { width: colW[i] - 6, align: i === 2 ? 'center' : 'left' });
      });

      y += 18;

      // Table Rows
      if (agenda.length === 0) {
        doc.rect(30, y, 535, 18).fill('#FFFFFF').stroke('#E2E8F0');
        doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text('No agenda items recorded', 35, y + 5);
        y += 18;
      } else {
        agenda.forEach((r, idx) => {
          if (y > 720) {
            doc.addPage();
            y = 40;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          doc.rect(30, y, 535, 20).fill(bg).stroke('#E2E8F0');

          doc.fillColor(darkColor).fontSize(8).font('Helvetica');
          doc.text(String(idx + 1), colX[0] + 3, y + 5, { width: colW[0] - 6 });
          
          doc.font('Helvetica-Bold').fillColor(primaryColor);
          doc.text(`${r.from_time || '—'} - ${r.to_time || '—'}`, colX[1] + 3, y + 5, { width: colW[1] - 6 });
          
          doc.font('Helvetica').fillColor(darkColor);
          doc.text(`${r.duration_min || 10}m`, colX[2] + 3, y + 5, { width: colW[2] - 6, align: 'center' });
          
          doc.font('Helvetica-Bold');
          doc.text((r.area || '—').slice(0, 16), colX[3] + 3, y + 5, { width: colW[3] - 6 });
          
          doc.font('Helvetica');
          doc.text((r.activity_name || '—').slice(0, 28), colX[4] + 3, y + 5, { width: colW[4] - 6 });
          
          doc.text((r.pic || '—').slice(0, 18), colX[5] + 3, y + 5, { width: colW[5] - 6 });
          
          doc.fillColor('#475569');
          doc.text((r.support_attendees || '—').slice(0, 24), colX[6] + 3, y + 5, { width: colW[6] - 6 });

          y += 20;
        });
      }

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#94A3B8').text(
        'Generated by TIEI Visitor Management System • Toyota Industries Engine India • Confidential',
        30, 780, { align: 'center', width: 535 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateAgendaPdfBuffer
};
