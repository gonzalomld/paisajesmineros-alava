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
    arc: 'Tres puertas al asfalto',
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
    intro: 'Un centro, una mina y una ruta: tres maneras de entrar en la montaña.',
    hint: 'Sigue bajando para recorrerlas',
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
        cta: { label: 'Planifica tu visita', href: 'https://asfaltokia.eus/' },
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

  cielo: {
    caption: 'Montaña Alavesa · Parque Natural de Izki',
    alt: 'Peña del Castillo sobre los bosques del Parque Natural de Izki, bajo un cielo con nubes',
    /* Vídeo de Vimeo: «Parque Natural de Izki», Arabako Foru Aldundia (1 min 29 s). */
    video: { id: '1012453058', hash: '50956c9266', title: 'Parque Natural de Izki, vídeo de la Diputación Foral de Álava', play: ['Ver', 'el vídeo'] },
  },

  galeria: {
    eyebrow: 'Mina Lucía · fotografías de Quintas',
    display: 'Bajo tierra, con casco',
    hint: 'Arrastra',
    items: [
      { file: 'galeria-01', caption: 'La entrada, entibada en madera', alt: 'Entrada de Mina Lucía con la galería entibada en madera' },
      { file: 'galeria-02', caption: 'Galerías desde 1872', alt: 'Galería de Mina Lucía en penumbra con luces al fondo' },
      { file: 'galeria-03', caption: 'En fila, con los frontales', alt: 'Visitantes con casco recorren una galería entibada' },
      { file: 'galeria-04', caption: 'La sala grande', alt: 'Sala amplia excavada en la roca de Mina Lucía' },
      { file: 'galeria-05', caption: 'La pasarela', alt: 'Un grupo de visitantes en la pasarela de madera de la mina' },
      { file: 'galeria-06', caption: 'El grupo, a la luz de los cascos', alt: 'Grupo de visitantes con cascos en una galería' },
      { file: 'galeria-07', caption: 'El guía y la piedra', alt: 'El guía explica junto a una pila de rocas de asfalto' },
      { file: 'galeria-08', caption: 'Las vetas, de cerca', alt: 'Dos niñas observan las vetas de asfalto en la pared' },
      { file: 'galeria-09', caption: 'Una roca en las manos', alt: 'Dos niñas con casco examinan una roca de asfalto' },
      { file: 'galeria-10', caption: 'Asfalto natural', alt: 'Una niña sostiene un trozo de roca impregnada de asfalto' },
      { file: 'galeria-11', caption: 'El camino a la mina', alt: 'Camino hacia Mina Lucía con un casco en primer plano' },
      { file: 'galeria-12', caption: 'Por el bosque de Izki', alt: 'Un grupo llega a la mina por el bosque' },
    ],
  },

  asfalto: {
    word: 'Asfalto',
    statement: 'Roca impregnada de hidrocarburo, acumulada durante millones de años en el borde del diapiro de Maeztu.',
    credit: 'Mina Lucía · Atauri · Fotografía de Quintas',
  },

  estratos: {
    eyebrow: 'Cuanto más bajas, más atrás en el tiempo',
    display: 'Sigue bajando',
    hint: 'Sigue bajando',
    /* unit: year (año) · ma (millones de años, en negativo = hacia atrás) */
    stops: [
      { label: 'Hoy', value: 2026, unit: 'year', note: 'Asfaltokia abre sus puertas en la antigua estación de Atauri.' },
      { label: 'La estación', value: 1928, unit: 'year', note: 'El ferrocarril Vasco-Navarro llega a Atauri. El trenico une Vitoria con Estella.' },
      { label: 'Mina Lucía', value: 1872, unit: 'year', note: 'Se abre la mina que hoy se visita con casco, siglo y medio después.' },
      { label: 'Loza', value: 1855, unit: 'year', note: 'Primera explotación de asfalto natural en la comarca.' },
      { label: 'Las calizas', value: 100, unit: 'ma', note: 'Cretácico. Bajo un mar poco profundo se forman las rocas que hoy guardan el asfalto.' },
      { label: 'El diapiro', value: 200, unit: 'ma', note: 'Triásico. Las sales que, millones de años después, empujarán hacia la superficie y dejarán el asfalto en su borde.' },
    ],
  } as const,

  queVeras: {
    eyebrow: 'En la visita',
    items: ['Galerías entibadas de 1872', 'Vetas de asfalto en la roca', 'El diapiro de Maeztu, explicado', 'La estación de 1928, por dentro', 'Un vuelo virtual sobre Izki'],
    quote: 'Tres turnos cada sábado y domingo, con reserva previa.',
    cta: { label: 'Reservar en el 945 405 424', href: 'tel:+34945405424' },
  },

  miradores: {
    display: 'Tres miradores',
    script: 'sobre Izki',
    text: 'Desde la última planta de la estación, el Parque Natural de Izki se abre en tres ventanas: el robledal, el diapiro y la vía verde.',
    cta: { label: 'Planifica tu visita', href: 'https://asfaltokia.eus/' },
    alt: 'Mirador sobre los bosques del Parque Natural de Izki',
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
    cta: { label: 'Planifica tu visita', href: 'https://asfaltokia.eus/' },
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
