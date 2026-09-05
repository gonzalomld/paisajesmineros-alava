/**
 * make-cantos.mjs — máscaras de «canto» (fragmento de roca) con borde
 * irregular y suavizado, para recortar fotografías en CSS (mask-image).
 *   node tools/make-cantos.mjs
 * Salida: src/assets/decor/canto-1..3.png (el alfa es la máscara), 800×1000.
 */
import sharp from 'sharp';

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blob(seed, W, H) {
  const rnd = mulberry(seed);
  const n = 18;
  const pts = [];
  /* radio irregular: suma de dos armónicos + ruido */
  const a1 = 0.10 + rnd() * 0.08, a2 = 0.05 + rnd() * 0.05, p1 = rnd() * 6.28, p2 = rnd() * 6.28;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = 0.78 + a1 * Math.sin(2 * t + p1) + a2 * Math.sin(5 * t + p2) + (rnd() - 0.5) * 0.06;
    pts.push([W / 2 + Math.cos(t) * r * (W / 2) * 0.92, H / 2 + Math.sin(t) * r * (H / 2) * 0.92]);
  }
  /* curva suave por Catmull-Rom → Bézier */
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1_ = pts[i], p2_ = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1_[0] + (p2_[0] - p0[0]) / 6, p1_[1] + (p2_[1] - p0[1]) / 6];
    const c2 = [p2_[0] - (p3[0] - p1_[0]) / 6, p2_[1] - (p3[1] - p1_[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2_[0].toFixed(1)} ${p2_[1].toFixed(1)}`;
  }
  return d + ' Z';
}

const W = 800, H = 1000;
for (const [i, seed] of [[1, 3], [2, 17], [3, 42]]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <filter id="s" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
    <path d="${blob(seed, W, H)}" fill="white" filter="url(#s)"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`src/assets/decor/canto-${i}.png`);
}
console.log('cantos generados');
