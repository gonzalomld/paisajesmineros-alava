/**
 * map.ts — configuración del mapa vivo.
 *
 * TOKEN: es un token público de Mapbox (pk) restringido por URL al dominio
 * del sitio; fuera de ese origen Mapbox responde 403. Por eso puede viajar
 * en el código del cliente. Se puede sobrescribir con PUBLIC_MAPBOX_TOKEN.
 * Para desarrollo local hay que añadir http://localhost:4321 a las URL
 * permitidas del token en la cuenta de Mapbox.
 */
export const MAPBOX_TOKEN =
  import.meta.env.PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiZ21vcmVubzM5IiwiYSI6ImNtdG92MmFsMzA0c2IyenNkMmUyNDl2NG0ifQ.IWNAivym-fB3Xuva-9NhoQ';

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v11';

export interface Poi {
  id: string;
  name: string;
  detail: string;
  /** [lon, lat] */
  coords: readonly [number, number];
}

/* Coordenadas: geocoding de Mapbox. Mina Lucía es aproximada: está en la
   subida de Atauri hacia San Ildefonso, dentro del Parque Natural de Izki. */
export const pois: readonly Poi[] = [
  { id: 'antonana', name: 'Antoñana', detail: 'Inicio · Centro del Ferrocarril Vasco-Navarro', coords: [-2.3961, 42.6938] },
  { id: 'atauri', name: 'Atauri', detail: 'Asfaltokia · Centro de Interpretación', coords: [-2.4268, 42.7271] },
  { id: 'mina-lucia', name: 'Mina Lucía', detail: 'Visitas guiadas · desde 1872', coords: [-2.4325, 42.7195] },
  { id: 'korres', name: 'Korres', detail: 'Centro del Parque Natural de Izki', coords: [-2.4345, 42.699] },
  { id: 'maeztu', name: 'Maeztu', detail: 'El diapiro · Compañía de Asfaltos', coords: [-2.448, 42.7386] },
];
