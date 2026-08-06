import QRCodeLib from 'qrcode';

const QR = {
  generateSVG: (text, options = {}) => {
    const { size = 220, color = "#000000", bg = "#FFFFFF", margin = 2 } = options;
    try {
      const qr = QRCodeLib.create(text || '');
      const modSize = qr.modules.size;
      const count = modSize + margin * 2;
      let pathData = '';
      for (let r = 0; r < modSize; r++) {
        for (let c = 0; c < modSize; c++) {
          if (qr.modules.get(r, c)) {
            pathData += `M${c + margin},${r + margin}h1v1h-1z `;
          }
        }
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count} ${count}" width="${size}" height="${size}" shape-rendering="crispEdges">
        <rect width="${count}" height="${count}" fill="${bg}"/>
        <path fill="${color}" d="${pathData}"/>
      </svg>`;
    } catch (e) {
      console.error("QR generation failed", e);
      return `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><text x="10" y="50" fill="red">QR Error</text></svg>`;
    }
  },
  generateDataURL: (text, options = {}) => {
    const svg = QR.generateSVG(text, options);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
};

export default QR;
