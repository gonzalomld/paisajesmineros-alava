/**
 * map.ts — data-map: el mapa vivo.
 *
 * Un mapa Mapbox a sangre, fijado en pantalla durante tres alturas de
 * scroll. La ruta se dibuja con el scroll (line-gradient sobre
 * line-progress), un punto avanza por la cabeza del trazado y la cámara lo
 * sigue con inclinación y un giro lento. El conmutador (data-tabs) cambia
 * de ruta y reinicia el dibujo. Los datos viajan en un <script type=
 * "application/json" data-map-data> dentro de la sección.
 *
 * Mapbox GL se importa en diferido cuando la sección está a una pantalla
 * de distancia: hasta entonces no cuesta ni un byte ni una carga de mapa.
 * Su CSS es un subconjunto propio en la capa vendor (styles/mapbox.css).
 */
import type { Map as MapboxMap, Marker, LngLatLike } from 'mapbox-gl';
import '../../styles/mapbox.css';
import { defineModule } from '../core/registry';
import { gsap, ScrollTrigger } from '../core/gsap';

interface RouteData {
  slug: string;
  name: string;
  stats: { km: number; gain: number; min: number; max: number; points: number };
  bbox: [number, number, number, number];
  line: [number, number][];
  cum: number[];
  profile: [number, number][];
}
interface PoiData {
  id: string;
  name: string;
  detail: string;
  coords: [number, number];
}
interface MapData {
  token: string;
  style: string;
  routes: RouteData[];
  pois: PoiData[];
  labels: { start: string };
}

const INK = '#17233B';
const BONE = '#F3F3EC';
const SKY = '#B5CEDB';


/** Punto de la línea a una distancia acumulada (interpolación lineal). */
function pointAt(route: RouteData, meters: number): [number, number] {
  const { cum, line } = route;
  const last = line.length - 1;
  if (meters <= 0) return line[0] ?? [0, 0];
  if (meters >= (cum[last] ?? 0)) return line[last] ?? [0, 0];
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((cum[mid] ?? 0) <= meters) lo = mid;
    else hi = mid;
  }
  const a = line[lo] ?? [0, 0];
  const b = line[hi] ?? a;
  const span = (cum[hi] ?? 0) - (cum[lo] ?? 0) || 1;
  const t = (meters - (cum[lo] ?? 0)) / span;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

const LAND = '#1B2A46';
const LAND_SOFT = '#1E2E4B';
const WATER = '#101B31';

/** Recolorea el estilo light de Mapbox al tratamiento oscuro del sistema:
 *  base ink, relieve insinuado, un solo acento (sky) para ruta y puntos y
 *  etiquetas en bone muy contenidas. Todo lo que hace ruido, fuera. */
function restyle(map: MapboxMap): void {
  const style = map.getStyle();
  for (const layer of style?.layers ?? []) {
    const id = layer.id;
    try {
      switch (layer.type) {
        case 'background':
          map.setPaintProperty(id, 'background-color', INK);
          break;
        case 'fill':
          if (/water/.test(id)) map.setPaintProperty(id, 'fill-color', WATER);
          else if (/park|landcover|landuse|national|wetland|wood|forest/.test(id)) map.setPaintProperty(id, 'fill-color', LAND_SOFT);
          else if (/building/.test(id)) map.setPaintProperty(id, 'fill-color', LAND);
          else map.setPaintProperty(id, 'fill-color', INK);
          if ('fill-outline-color' in (layer.paint ?? {})) map.setPaintProperty(id, 'fill-outline-color', 'rgba(243,243,236,0.05)');
          break;
        case 'line':
          if (/water/.test(id)) map.setPaintProperty(id, 'line-color', 'rgba(181,206,219,0.35)');
          else if (/admin|boundary/.test(id)) map.setPaintProperty(id, 'line-color', 'rgba(243,243,236,0.14)');
          else if (/rail|ferry/.test(id)) map.setPaintProperty(id, 'line-color', 'rgba(243,243,236,0.22)');
          else if (/path|pedestrian|steps/.test(id)) map.setPaintProperty(id, 'line-color', 'rgba(243,243,236,0.10)');
          else map.setPaintProperty(id, 'line-color', 'rgba(243,243,236,0.12)');
          break;
        case 'symbol':
          if (/poi|transit|airport|natural|water-point|water-line|housenum|road-number|shield|road-label|path-label|golf|ferry/.test(id)) {
            map.setLayoutProperty(id, 'visibility', 'none');
          } else {
            map.setPaintProperty(id, 'text-color', 'rgba(243,243,236,0.62)');
            map.setPaintProperty(id, 'text-halo-color', INK);
            map.setPaintProperty(id, 'text-halo-width', 1.4);
            map.setLayoutProperty(id, 'text-field', ['coalesce', ['get', 'name_es'], ['get', 'name']]);
            map.setLayoutProperty(id, 'text-transform', 'uppercase');
            map.setLayoutProperty(id, 'text-letter-spacing', 0.22);
            map.setLayoutProperty(id, 'text-font', ['DIN Pro Medium', 'Arial Unicode MS Regular']);
          }
          break;
        case 'hillshade':
          map.setPaintProperty(id, 'hillshade-shadow-color', '#0A1225');
          map.setPaintProperty(id, 'hillshade-highlight-color', '#33456B');
          map.setPaintProperty(id, 'hillshade-accent-color', '#1B2A46');
          map.setPaintProperty(id, 'hillshade-exaggeration', 0.42);
          break;
        case 'fill-extrusion':
          map.setLayoutProperty(id, 'visibility', 'none');
          break;
        default:
          break;
      }
    } catch {
      /* alguna capa no admite la propiedad: se ignora */
    }
  }
}

export default defineModule({
  selector: '[data-map]',
  init(el, ctx) {
    const stage = el.querySelector<HTMLElement>('[data-map-stage]');
    const canvas = el.querySelector<HTMLElement>('[data-map-canvas]');
    const dataNode = el.querySelector<HTMLScriptElement>('[data-map-data]');
    const head = el.querySelector<HTMLElement>('[data-map-head]');
    const profileClips = Array.from(el.querySelectorAll<HTMLElement>('[data-map-profile-clip]'));
    const kmOut = el.querySelector<HTMLElement>('[data-map-km]');
    const eleOut = el.querySelector<HTMLElement>('[data-map-ele]');
    const tabsRoot = el.querySelector<HTMLElement>('[data-tabs]');
    if (!stage || !canvas || !dataNode) return;

    let data: MapData;
    try {
      data = JSON.parse(dataNode.textContent ?? '') as MapData;
    } catch {
      return;
    }
    const first = data.routes[0];
    if (!first) return;
    let route: RouteData = first;

    let map: MapboxMap | undefined;
    let markers: Marker[] = [];
    let headMarker: Marker | undefined;
    let progress = 0;
    let frame = 0;
    let destroyed = false;
    const reduced = ctx.reducedMotion;
    const zoom = ctx.isMobile ? 12.6 : 13.3;

    const total = (): number => route.cum[route.cum.length - 1] ?? 1;

    /* ---- render por frame: línea, cabeza, cámara, perfil ---- */
    const render = (): void => {
      frame = 0;
      const p = reduced ? 1 : progress;
      const meters = total() * p;
      const at = pointAt(route, meters);
      if (map?.getLayer('route-line')) {
        const stop = Math.min(0.9999, Math.max(0.0001, p));
        map.setPaintProperty('route-line', 'line-gradient', ['step', ['line-progress'], SKY, stop, 'rgba(181,206,219,0)']);
      }
      headMarker?.setLngLat(at as LngLatLike);
      if (map && !reduced) {
        map.jumpTo({ center: at as LngLatLike, zoom, pitch: 52, bearing: -18 + p * 46 });
      }
      el.classList.toggle('is-moving', p > 0.06);
      for (const clip of profileClips) clip.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
      if (kmOut) kmOut.textContent = (meters / 1000).toFixed(1).replace('.', ',');
      if (eleOut) {
        const idx = Math.min(route.profile.length - 1, Math.round(p * (route.profile.length - 1)));
        eleOut.textContent = String(route.profile[idx]?.[1] ?? '');
      }
      for (const m of markers) {
        const ll = m.getLngLat();
        const d = Math.hypot((ll.lng - at[0]) * 80000, (ll.lat - at[1]) * 111000);
        m.getElement().classList.toggle('is-near', d < 450);
      }
    };
    const schedule = (): void => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    /* ---- fuente de la ruta ---- */
    const setRoute = (next: RouteData): void => {
      route = next;
      if (!map) return;
      const src = map.getSource('route');
      const geo = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.line } } as const;
      if (src && 'setData' in src) (src as { setData: (d: unknown) => void }).setData(geo);
      if (reduced) map.fitBounds(route.bbox, { padding: 80, duration: 0 });
      schedule();
    };

    /* ---- creación en diferido ---- */
    const create = async (): Promise<void> => {
      const mapboxgl = (await import('mapbox-gl')).default;
      if (destroyed) return;
      mapboxgl.accessToken = data.token;
      map = new mapboxgl.Map({
        container: canvas,
        style: data.style,
        center: pointAt(route, 0) as LngLatLike,
        zoom: reduced ? 12 : zoom,
        pitch: reduced ? 0 : 52,
        bearing: reduced ? 0 : -18,
        interactive: false,
        attributionControl: false,
        logoPosition: 'bottom-right',
        antialias: false,
        fadeDuration: 0,
        language: 'es',
      });
      /* Atribución siempre desplegada (sin el botón del modo compacto). */
      map.addControl(new mapboxgl.AttributionControl({ compact: false }), 'bottom-right');
      map.on('load', () => {
        if (!map || destroyed) return;
        map.resize();
        restyle(map);
        if (!ctx.isMobile && !reduced) {
          map.addSource('dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
          map.setTerrain({ source: 'dem', exaggeration: 1.35 });
        }
        map.addSource('route', {
          type: 'geojson',
          lineMetrics: true,
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.line } },
        });
        map.addLayer({
          id: 'route-ghost',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': BONE, 'line-opacity': 0.16, 'line-width': 1.5 },
        });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-width': 3, 'line-gradient': ['step', ['line-progress'], SKY, 0.0001, 'rgba(181,206,219,0)'] },
        });
        /* POIs: el mismo marcador del hero */
        markers = data.pois.map((poi) => {
          const node = document.createElement('div');
          node.className = 'map-poi';
          node.innerHTML = `<span class="map-poi__dot"><span class="map-poi__ring"></span><span class="map-poi__ring"></span></span><span class="map-poi__label"><strong class="l2">${poi.name}</strong><span class="p2">${poi.detail}</span></span>`;
          return new mapboxgl.Marker({ element: node, anchor: 'center' }).setLngLat(poi.coords as LngLatLike).addTo(map as MapboxMap);
        });
        if (head) {
          headMarker = new mapboxgl.Marker({ element: head, anchor: 'center' }).setLngLat(pointAt(route, 0) as LngLatLike).addTo(map);
        }
        el.classList.add('is-map-ready');
        if (reduced) map.fitBounds(route.bbox, { padding: 80, duration: 0 });
        schedule();
      });
    };

    /* Crea el mapa cuando la sección se acerca (una pantalla). */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          io.disconnect();
          void create();
        }
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);

    /* ---- scroll: sección fijada, progreso con scrub ---- */
    let trigger: ScrollTrigger | undefined;
    const proxy = { p: 0 };
    if (!reduced) {
      trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=300%',
        pin: stage,
        pinSpacing: true,
        refreshPriority: 1,
        scrub: 0.6,
        onUpdate: (self) => {
          proxy.p = self.progress;
          progress = self.progress;
          schedule();
        },
      });
    }

    /* ---- conmutador de ruta ---- */
    tabsRoot?.addEventListener(
      'tabs:change',
      (event) => {
        const slug = (event as CustomEvent<string>).detail;
        const next = data.routes.find((r) => r.slug === slug);
        if (next) setRoute(next);
      },
      { signal: ctx.signal },
    );

    return () => {
      destroyed = true;
      io.disconnect();
      trigger?.kill();
      if (frame) window.cancelAnimationFrame(frame);
      markers.forEach((m) => m.remove());
      headMarker?.remove();
      map?.remove();
      gsap.killTweensOf(proxy);
    };
  },
});
