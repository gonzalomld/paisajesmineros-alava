/**
 * make-clouds.mjs — genera tiras de nubes con canal alfa (PNG RGBA) por
 * ruido fractal periódico en horizontal, para el marquee de cielo.
 *   node tools/make-clouds.mjs
 * Salida: src/assets/decor/nubes-1.png, nubes-2.png (2048×640, tileables en x).
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const W = 2048;
const H = 640;

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
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);

/** Ruido de valor periódico en x (periodo = px celdas) */
function valueNoise(seed, px, py) {
  const rnd = mulberry(seed);
  const grid = new Float32Array(px * py);
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = fade(x - xi), yf = fade(y - yi);
    const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px;
    const y0 = Math.min(py - 1, Math.max(0, yi)), y1 = Math.min(py - 1, y0 + 1);
    const a = grid[y0 * px + x0], b = grid[y0 * px + x1], c = grid[y1 * px + x0], d = grid[y1 * px + x1];
    return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
  };
}

function make(seed, baseCells, thresholds, topFade) {
  const octaves = [];
  let cells = baseCells;
  for (let o = 0; o < 6; o++) {
    octaves.push({ n: valueNoise(seed * 31 + o * 7, cells, Math.ceil((cells * H) / W) + 1), cells, amp: 1 / 2 ** o });
    cells *= 2;
  }
  const buf = Buffer.alloc(W * H * 4);
  const [lo, hi] = thresholds;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    /* la tira se disuelve hacia abajo; arriba queda sólida, para fundirse
       con el fondo bone de la página */
    const edge = Math.min(1, (1 - v) * 1.6) ** 1.4;
    const top = Math.max(0, 1 - v / topFade);
    for (let x = 0; x < W; x++) {
      let s = 0, norm = 0;
      for (const oc of octaves) {
        s += oc.n((x / W) * oc.cells, (y / W) * oc.cells) * oc.amp;
        norm += oc.amp;
      }
      s /= norm;
      let a = (s - lo) / (hi - lo);
      a = Math.max(0, Math.min(1, a));
      a = Math.max(a * a * (3 - 2 * a) * edge, top);
      /* sombra suave en la base de cada masa: más gris donde el ruido es justo */
      const shade = 0.86 + 0.14 * Math.min(1, (s - lo) / (hi - lo) + 0.2);
      const i = (y * W + x) * 4;
      buf[i] = Math.round(248 * shade);
      buf[i + 1] = Math.round(248 * shade);
      buf[i + 2] = Math.round(244 * shade);
      buf[i + 3] = Math.round(a * 255);
    }
  }
  return buf;
}

mkdirSync('src/assets/decor', { recursive: true });
await sharp(make(11, 5, [0.5, 0.68], 0.22), { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile('src/assets/decor/nubes-1.png');
await sharp(make(29, 6, [0.52, 0.72], 0.001), { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile('src/assets/decor/nubes-2.png');
console.log('nubes generadas');
