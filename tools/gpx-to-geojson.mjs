/**
 * gpx-to-geojson.mjs — convierte los GPX de public/gpx/ en GeoJSON listos
 * para el mapa vivo: LineString simplificada (Douglas-Peucker), distancia
 * acumulada, perfil de elevación y estadísticas.
 *
 *   node tools/gpx-to-geojson.mjs
 *
 * Salida: src/data/routes/<slug>.json
 *   { slug, name, stats:{ km, gain, min, max, points }, bbox,
 *     line:[[lon,lat],…], cum:[m,…], profile:[[m, ele],…] }
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ROUTES = [
  { file: 'public/gpx/ruta-asfaltos-a-pie.gpx', slug: 'a-pie', name: 'A pie', mode: 'walking' },
  { file: 'public/gpx/ruta-asfaltos-en-bici.gpx', slug: 'en-bici', name: 'En bici', mode: 'cycling' },
];
const TOLERANCE_M = 6;      // simplificación: metros de desviación admitidos
const PROFILE_POINTS = 160; // puntos del perfil de elevación

const R = 6371000;
const hav = (a, b) => {
  const [lon1, lat1] = a.map((v) => (v * Math.PI) / 180);
  const [lon2, lat2] = b.map((v) => (v * Math.PI) / 180);
  const x = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

function parse(gpx) {
  const pts = [];
  const re = /<trkpt\s+lat="([-\d.]+)"\s+lon="([-\d.]+)"[^>]*>([\s\S]*?)<\/trkpt>/g;
  let m;
  while ((m = re.exec(gpx))) {
    const ele = /<ele>([-\d.]+)<\/ele>/.exec(m[3]);
    pts.push([parseFloat(m[2]), parseFloat(m[1]), ele ? parseFloat(ele[1]) : null]);
  }
  return pts;
}

/* Douglas-Peucker sobre coordenadas proyectadas localmente a metros. */
function simplify(pts, tol) {
  const lat0 = (pts[0][1] * Math.PI) / 180;
  const proj = (p) => [((p[0] * Math.PI) / 180) * R * Math.cos(lat0), ((p[1] * Math.PI) / 180) * R];
  const P = pts.map(proj);
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let maxD = 0, idx = -1;
    const [ax, ay] = P[a], [bx, by] = P[b];
    const len = Math.hypot(bx - ax, by - ay) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = P[i];
      const d = Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx > 0) { keep[idx] = true; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

for (const r of ROUTES) {
  const raw = parse(readFileSync(r.file, 'utf8'));
  const pts = simplify(raw, TOLERANCE_M);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + hav(pts[i - 1], pts[i]));
  const total = cum[cum.length - 1];
  let gain = 0;
  for (let i = 1; i < raw.length; i++) { const d = (raw[i][2] ?? 0) - (raw[i - 1][2] ?? 0); if (d > 0) gain += d; }
  const eles = raw.map((p) => p[2]).filter((e) => e !== null);
  const profile = [];
  for (let k = 0; k < PROFILE_POINTS; k++) {
    const target = (total * k) / (PROFILE_POINTS - 1);
    let i = cum.findIndex((c) => c >= target); if (i < 0) i = cum.length - 1;
    profile.push([Math.round(target), Math.round(pts[Math.max(0, i)][2] ?? 0)]);
  }
  const lons = pts.map((p) => p[0]), lats = pts.map((p) => p[1]);
  const out = {
    slug: r.slug, name: r.name, mode: r.mode,
    stats: { km: Math.round(total / 100) / 10, gain: Math.round(gain), min: Math.round(Math.min(...eles)), max: Math.round(Math.max(...eles)), points: pts.length },
    bbox: [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)],
    line: pts.map((p) => [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]),
    cum: cum.map((c) => Math.round(c)),
    profile,
  };
  writeFileSync(`src/data/routes/${r.slug}.json`, JSON.stringify(out));
  console.log(`${r.slug}: ${raw.length} → ${pts.length} puntos · ${out.stats.km} km · +${out.stats.gain} m · ${out.stats.min}–${out.stats.max} m`);
}
