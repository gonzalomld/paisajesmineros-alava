/**
 * make-minube-bone.mjs — variante del logotipo de minube para superficies
 * oscuras (ink y plum): la nube verde se queda como está y el texto, que
 * en el original es gris (93,93,94), pasa a bone (#F3F3EC). Sin tocar el
 * alfa, así que los bordes suavizados siguen siéndolo.
 *
 *   node tools/make-minube-bone.mjs
 *
 * Entrada:  src/assets/brand/minube-logo.png (el original, recortado)
 * Salida:   src/assets/brand/minube-logo-bone.png
 */
import sharp from 'sharp';

const SRC = 'src/assets/brand/minube-logo.png';
const OUT = 'src/assets/brand/minube-logo-bone.png';
const BONE = [243, 243, 236];

const img = sharp(SRC);
const { width, height } = await img.metadata();
const raw = await img.ensureAlpha().raw().toBuffer();

for (let i = 0; i < raw.length; i += 4) {
  const r = raw[i];
  const g = raw[i + 1];
  const b = raw[i + 2];
  const a = raw[i + 3];
  if (a === 0) continue;
  /* gris = los tres canales casi iguales; el verde de la nube no lo es */
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 24 && max < 200) {
    raw[i] = BONE[0];
    raw[i + 1] = BONE[1];
    raw[i + 2] = BONE[2];
  }
}

await sharp(raw, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);
console.log(`minube (oscuro) → ${OUT} ${width}×${height}`);
