/**
 * home.ts — copy y datos de las escenas de la home (Fase 02).
 * Fuentes: asfaltokia.eus (centro, mina, ruta, geología, historia, entorno)
 * y datos de visita facilitados por el cliente. Tono: sereno, editorial,
 * pensado para inspirar a quien viaja. Las imágenes se asignan en cada
 * componente; aquí solo hay texto y datos.
 */

export interface Puerta {
  id: 'asfaltokia' | 'mina' | 'ruta';
  display: readonly string[];
  label: string;
  text: string;
}

export interface Experiencia {
  id: string;
  display: readonly string[];
  specs: ReadonlyArray<readonly [string, string]>;
  text: string;
  cta: { label: string; href: string };
}

export const home = {
  puertas: {
    ring: 'Tres puertas al asfalto · ',
    eyebrow: 'Un centro, una mina, una ruta',
    items: [
      {
        id: 'asfaltokia',
        display: ['Asfaltokia'],
        label: 'Un centro en una estación de 1928',
        text: 'En la antigua estación del ferrocarril Vasco-Navarro, en Atauri, un centro de interpretación cuenta cómo una roca negra cambió la vida de un valle. Tres plantas, un vuelo virtual sobre la comarca y tres miradores hacia Izki.',
      },
      {
        id: 'mina',
        display: ['Mina', 'Lucía'],
        label: 'Una mina que se visita con casco',
        text: 'Explotada desde 1872, sus galerías guardan vetas de asfalto a la vista. Tres turnos de visita guiada los sábados y los domingos, con reserva previa.',
      },
      {
        id: 'ruta',
        display: ['La', 'ruta'],
        label: '39 kilómetros entre tres centros',
        text: 'Un itinerario interpretativo une el centro del ferrocarril en Antoñana, el del Parque Natural de Izki en Korres y Asfaltokia en Atauri. A pie o en bici, casi siete kilómetros discurren bajo el bosque.',
      },
    ] as const satisfies readonly Puerta[],
  },

  cita: {
    text: 'Aquí la roca es negra y brilla. El asfalto impregna la caliza a la vista, como hace siglo y medio, y el bosque guarda el silencio de las galerías.',
    where: 'Mina Lucía · Atauri · Parque Natural de Izki',
  },

  concepto: {
    eyebrow: 'Una geología singular',
    statement: 'Bajo estas montañas, una roca menos densa empujó durante millones de años hacia la superficie. En su borde se quedó el asfalto.',
    text: 'Se llama diapiro de Maeztu. Del griego diapeirein, perforar: una pared de sal que asciende, deforma y atraviesa las capas de roca de la antigua Cuenca Vasco-Cantábrica. A su alrededor se acumularon los hidrocarburos que hacen de Mina Lucía un lugar único en Europa.',
  },

  ubicacion: {
    display: ['Montaña', 'Alavesa'],
    tag: 'Álava · Euskadi',
    sub: 'Entre el Parque Natural de Izki y la Vía Verde del Vasco-Navarro',
    text: 'En el sudeste de Álava, la menos poblada de las siete cuadrillas guarda villas medievales como Antoñana, Peñacerrada o Lagrán, robledales y humedales protegidos desde 1998, y el trazado del trenico, el ferrocarril que entre 1889 y 1967 unió pueblos del País Vasco y Navarra.',
  },

  llegar: {
    display: 'A una hora de todo',
    script: 'y lejos de todo',
    from: 'Tiempos en coche desde Atauri',
    /* Calculados con la API de direcciones de Mapbox desde la estación de Atauri. */
    places: [
      { name: 'Vitoria-Gasteiz', time: '32 min' },
      { name: 'Estella-Lizarra', time: '42 min' },
      { name: 'Logroño', time: '51 min' },
      { name: 'Bilbao', time: '1 h 05' },
      { name: 'Pamplona', time: '1 h 10' },
      { name: 'Donostia', time: '1 h 30' },
    ],
  },

  mapa: {
    eyebrow: 'La Ruta de los Asfaltos Naturales',
    display: ['La ruta,', 'paso a paso'],
    text: 'Dos bucles salen de Antoñana y vuelven a Antoñana. Los dos pasan por Atauri, junto a Asfaltokia y Mina Lucía, y cruzan el bosque de Izki.',
    tabs: { 'a-pie': 'A pie', 'en-bici': 'En bici' },
    download: 'Descargar GPX',
  },

  experiencias: {
    eyebrow: 'Planifica',
    items: [
      {
        id: 'asfaltokia',
        display: ['Asfaltokia'],
        specs: [
          ['Dónde', 'Antigua estación de Atauri'],
          ['Sábados', '10:00 – 18:00'],
          ['Domingos y festivos', '10:00 – 14:30'],
        ],
        text: 'Un vuelo virtual sobre las minas y el diapiro, una planta que es un libro abierto sobre el asfalto natural y tres miradores hacia el Parque Natural de Izki.',
        cta: { label: 'Planifica tu visita', href: '/contacto' },
      },
      {
        id: 'mina',
        display: ['Mina', 'Lucía'],
        specs: [
          ['Visitas guiadas', 'Sábados y domingos'],
          ['Turnos', '10:00 · 11:15 · 12:30'],
          ['Reserva previa', '945 405 424'],
        ],
        text: 'Las visitas guiadas nos reencuentran con el pasado y con unos modos de vida desconocidos para la mayoría. Con el casco puesto, la galería explica sola siglo y medio de trabajo.',
        cta: { label: 'Reservar visita', href: 'tel:+34945405424' },
      },
      {
        id: 'ruta',
        display: ['La', 'ruta'],
        specs: [
          ['Distancia', '39 km en total'],
          ['Centros', 'Antoñana · Korres · Atauri'],
          ['Cómo', 'A pie o en bici'],
        ],
        text: 'Por la Vía Verde del Vasco-Navarro y bajo el bosque de Izki, con paradas en la fábrica de Leorza, el poblado de San Ildefonso y las minas de San Román.',
        cta: { label: 'Ver el mapa', href: '#mapa' },
      },
    ] as const satisfies readonly Experiencia[],
  },

  cifras: {
    statement: 'Desde 1855 se extrajo aquí asfalto natural. Hoy, 39 kilómetros de ruta unen tres centros de interpretación y una estación de 1928.',
    items: ['1855 · Primera explotación, en Loza', '1872 · Se abre Mina Lucía', '1928 · Estación de Atauri', '39 km · La ruta'],
  },

  arco: {
    display: 'Un lugar para',
    script: 'volver',
  },

  estacion: {
    eyebrow: 'Asfaltokia · Atauri',
    statement: 'La estación de 1928 vuelve a abrir sus puertas',
    text: 'El edificio del ferrocarril Vasco-Navarro se ha rehabilitado como Centro de Interpretación de los Asfaltos Naturales de Montaña Alavesa. Un nuevo itinerario ciclista y peatonal lo une con el Centro del Parque Natural de Izki y con la vía verde.',
    floors: [
      ['Planta baja', 'Recepción y realidad virtual: un vuelo sobre la comarca, las minas, las antiguas fábricas y el diapiro.'],
      ['Primera planta', 'Un libro abierto sobre el asfalto natural: geología, usos, curiosidades, fábricas y cronología.'],
      ['Última planta', 'Sala Alejandro Mendizábal, el ingeniero de las estaciones del Vasco-Navarro. Un espacio para conferencias y encuentros.'],
    ],
    extra: 'Tres miradores exteriores hacia el Parque Natural de Izki.',
    cta: { label: 'Planifica tu visita', href: '/contacto' },
  },

  cierre: {
    display: ['Nos vemos', 'en Atauri'],
    script: 'Montaña Alavesa',
    lines: [
      'Antigua estación del Vasco-Navarro · Atauri, Álava',
      'Sábados 10:00 – 18:00 · Domingos y festivos 10:00 – 14:30',
    ],
    phoneLabel: 'Visitas a Mina Lucía',
    phone: '945 405 424',
    phoneHref: 'tel:+34945405424',
  },
} as const;
