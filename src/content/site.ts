/**
 * site.ts — brief, navegación y datos del hero.
 * Único lugar con textos de marca; los componentes no llevan copy literal.
 * Fuentes: asfaltokia.eus y nota de prensa de inauguración (30/07/2026).
 */

export type Theme = 'light' | 'sky' | 'dark' | 'plum';

export const site = {
  brand: {
    /** Nombre del destino (brief) */
    name: 'Álava',
    /** Producto turístico: el sujeto del wordmark del hero */
    product: 'Paisajes Mineros',
    /** Región: el subtítulo en script */
    region: 'Montaña Alavesa',
    /** Nombre largo, para metadatos */
    full: 'Paisajes Mineros de Asfaltos Naturales de Montaña Alavesa',
    /** Centro de interpretación */
    center: 'Asfaltokia',
    claim: 'Ruta de los paisajes mineros',
    domain: 'https://asfaltokia.eus',
    lang: 'es',
    altLang: 'eu',
  },

  seo: {
    titleTemplate: '%s — Paisajes Mineros de Álava',
    description:
      'Asfaltokia, Mina Lucía y la Ruta de los Asfaltos Naturales: los paisajes mineros de Montaña Alavesa, en Álava. Un fenómeno geológico único que se visita despacio.',
  },

  cta: {
    primary: { label: 'Planifica tu visita', lines: ['Planifica', 'tu visita'] as const, href: '/contacto' },
    secondary: { label: 'Quiero saber más', href: '/descubrir' },
  },

  nav: {
    primary: { label: 'Planifica tu visita', lines: ['Planifica', 'tu visita'] as const, href: '/contacto' },
    secondary: [
      { label: 'Descubrir', href: '/descubrir' },
      { label: 'Contacto', href: '/contacto' },
    ],
  },

  preloader: {
    display: 'Álava',
    script: 'Montaña Alavesa',
    label: 'Paisajes mineros de asfaltos naturales',
  },

  hero: {
    /** Display en dos líneas; el script se monta sobre la segunda */
    display: ['Paisajes', 'Mineros'] as const,
    script: 'Montaña Alavesa',
    /** Claim repartido a los lados del conmutador día / noche */
    claim: { left: 'Un paisaje para recorrer', right: 'y volver a recorrer' },
    tabs: {
      day: {
        label: 'De día',
        alt: 'Paisaje minero de asfaltos naturales en Montaña Alavesa, de día',
      },
      night: {
        label: 'De noche',
        alt: 'Paisaje minero de asfaltos naturales en Montaña Alavesa, de noche',
      },
    },
    description: 'Ruta de los paisajes mineros · Asfaltos naturales de Montaña Alavesa',
    /** Puntos de interés: posición en % sobre la imagen. Semilla de los POIs del mapa. */
    pois: [
      { id: 'asfaltokia', label: 'Asfaltokia · Centro de Interpretación', x: 57, y: 47 },
      { id: 'mina-lucia', label: 'Mina Lucía · Atauri', x: 36, y: 58 },
      { id: 'ruta', label: 'Ruta de los Asfaltos Naturales · 39 km', x: 72, y: 66 },
      { id: 'diapiro', label: 'Diapiro de Maeztu', x: 22, y: 41 },
    ],
  },

  footer: {
    place: 'Antigua estación del ferrocarril vasco-navarro · Atauri, Montaña Alavesa',
    hours: ['Sábados 10:00 – 18:00', 'Domingos y festivos 10:00 – 14:30'],
    legal: [
      { label: 'Aviso legal', href: '#' },
      { label: 'Privacidad', href: '#' },
    ],
  },
} as const;

export type Site = typeof site;
