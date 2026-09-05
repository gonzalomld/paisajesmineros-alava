/**
 * make-placeholders.mjs — genera las imágenes provisionales del hero y del
 * espaciador con sharp (SVG → JPEG). Se sustituyen por las fotografías de
 * Dropbox en cuanto lleguen; las proporciones son las definitivas.
 *
 *   node tools/make-placeholders.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 2400;
const H = 1500;

const mountains = (fill) => `
  <path fill="${fill}" d="M0 ${H * 0.72} L ${W * 0.12} ${H * 0.55} L ${W * 0.22} ${H * 0.63} L ${W * 0.34} ${H * 0.46}
    L ${W * 0.45} ${H * 0.6} L ${W * 0.58} ${H * 0.5} L ${W * 0.7} ${H * 0.62} L ${W * 0.82} ${H * 0.52}
    L ${W * 0.93} ${H * 0.6} L ${W} ${H * 0.56} L ${W} ${H} L 0 ${H} Z"/>`;

const ridge = (fill) => `
  <path fill="${fill}" d="M0 ${H * 0.82} L ${W * 0.15} ${H * 0.74} L ${W * 0.3} ${H * 0.8} L ${W * 0.48} ${H * 0.7}
    L ${W * 0.64} ${H * 0.79} L ${W * 0.8} ${H * 0.73} L ${W} ${H * 0.78} L ${W} ${H} L 0 ${H} Z"/>`;

const day = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#B5CEDB"/><stop offset="0.6" stop-color="#E4E9E4"/><stop offset="1" stop-color="#F3F3EC"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="${W * 0.7}" cy="${H * 0.3}" r="${H * 0.08}" fill="#F3F3EC" opacity="0.9"/>
  ${mountains('#7E93A6')}
  ${ridge('#4C607A')}
  <path fill="#17233B" d="M0 ${H * 0.9} L ${W * 0.2} ${H * 0.86} L ${W * 0.5} ${H * 0.9} L ${W * 0.75} ${H * 0.85} L ${W} ${H * 0.88} L ${W} ${H} L 0 ${H} Z"/>
</svg>`;

const night = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0B1326"/><stop offset="0.7" stop-color="#17233B"/><stop offset="1" stop-color="#340C24"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${Array.from({ length: 140 }, (_, i) => {
    const x = (i * 9973) % W;
    const y = ((i * 7919) % (H * 0.6));
    const r = 1 + (i % 3);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#F3F3EC" opacity="${0.4 + (i % 5) * 0.12}"/>`;
  }).join('')}
  <circle cx="${W * 0.28}" cy="${H * 0.26}" r="${H * 0.06}" fill="#F3F3EC" opacity="0.85"/>
  ${mountains('#101A2E')}
  ${ridge('#0A1222')}
  <path fill="#050912" d="M0 ${H * 0.9} L ${W * 0.2} ${H * 0.86} L ${W * 0.5} ${H * 0.9} L ${W * 0.75} ${H * 0.85} L ${W} ${H * 0.88} L ${W} ${H} L 0 ${H} Z"/>
</svg>`;

const LW = 1600;
const LH = 1000;
const landscape = `
<svg xmlns="http://www.w3.org/2000/svg" width="${LW}" height="${LH}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F3F3EC"/><stop offset="1" stop-color="#B5CEDB"/>
    </linearGradient>
  </defs>
  <rect width="${LW}" height="${LH}" fill="url(#g)"/>
  <path fill="#17233B" opacity="0.85" d="M0 ${LH * 0.7} L ${LW * 0.2} ${LH * 0.5} L ${LW * 0.4} ${LH * 0.62} L ${LW * 0.6} ${LH * 0.44} L ${LW * 0.8} ${LH * 0.6} L ${LW} ${LH * 0.52} L ${LW} ${LH} L 0 ${LH} Z"/>
  <path fill="#340C24" opacity="0.9" d="M0 ${LH * 0.86} L ${LW * 0.3} ${LH * 0.8} L ${LW * 0.6} ${LH * 0.88} L ${LW} ${LH * 0.82} L ${LW} ${LH} L 0 ${LH} Z"/>
</svg>`;

await mkdir('src/assets/hero', { recursive: true });
await mkdir('src/assets/placeholder', { recursive: true });
await sharp(Buffer.from(day)).jpeg({ quality: 82, mozjpeg: true }).toFile('src/assets/hero/day.jpg');
await sharp(Buffer.from(night)).jpeg({ quality: 82, mozjpeg: true }).toFile('src/assets/hero/night.jpg');
await sharp(Buffer.from(landscape)).jpeg({ quality: 82, mozjpeg: true }).toFile('src/assets/placeholder/landscape.jpg');
console.log('placeholders generados: hero/day.jpg, hero/night.jpg, placeholder/landscape.jpg');
