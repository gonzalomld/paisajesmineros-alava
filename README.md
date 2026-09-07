# Paisajes Mineros de Álava — sitio de marca

Astro 5 + TypeScript strict · CSS nativo con `@layer` y tokens fluidos · GSAP 3.15 (ScrollTrigger, SplitText, CustomEase) · Lenis 1.3 · View Transitions de Astro.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + build estático en dist/
npm run preview
```

Páginas: `/` (hero + espaciador de prueba), `/descubrir` y `/contacto` (placeholders para validar la transición), `/_kit` (sistema de diseño, fuera del sitemap). `Ctrl+G` muestra la rejilla.

## El sistema de unidades fluidas

Todo el layout y la tipografía escalan en proporción al ancho del viewport, sin `clamp()` ni puntos de corte intermedios. La mecánica, en `src/styles/tokens.css`:

```css
html { font-size: 1vw; }                 /* 1rem = 1 % del ancho de viewport   */
:root { --scale-ratio: 16; }             /* ancho de referencia 1600px → 16     */
@media (max-width: 991px) {
  :root { --scale-ratio: 4.16; }         /* ancho de referencia 416px → 4.16    */
}
:root { --u: calc(1rem / var(--scale-ratio)); }   /* un píxel de diseño */
:root { --sp-48: calc(48 * var(--u)); }           /* 48px a 1600 · 103px a 3440 · 48px a 416 */
```

Cómo leerlo: **el número de un token son píxeles al ancho de referencia** (1600px en escritorio, 416px en móvil). `--sp-48` mide exactamente 48px a 1600 y escala linealmente a partir de ahí. Lo mismo para la tipografía (`--fs-h1: calc(192 * var(--u))`), la rejilla (`--col`, `--gap`, `--margin`, `--row`) y cualquier medida nueva.

Reglas:

- Ni un `px` en layout ni en tipografía. Solo tokens. Excepciones: bordes de 1px (`--hairline`), outline de foco y sombras.
- `--vh-real` en lugar de `100vh` (la fija `lifecycle.ts` con `window.innerHeight`).
- El override de `--scale-ratio` vive en `:root`, en el mismo elemento donde se declara `--u`: un custom property se resuelve donde se declara, así que un override en `body` no llegaría a los tokens.
- En JS, `designPx(n)` (`src/scripts/core/dom.ts`) devuelve el valor real de `n` píxeles de diseño.
- CSS de terceros va en la capa `vendor` (`src/styles/vendor.css`): como `html` está a 1vw, cualquier `rem` ajeno se descoloca y se neutraliza ahí.

Orden de la cascada (`src/styles/main.css`): `vendor, reset, tokens, themes, base, components, utilities`. Cada fichero envuelve su contenido en su propia capa; los componentes `.astro` ponen su `<style>` en `@layer components`.

Los cuatro temas (`.theme-light`, `.theme-sky`, `.theme-dark`, `.theme-plum`) redefinen los semánticos `--bg`, `--fg`, `--fg-muted`, `--fg-disabled`, `--line`, `--bg-subtle` (y los canales `--fg-rgb`, `--bg-rgb` para componer alfas). Los componentes solo consumen esos.

## Cómo añadir un módulo al registro

Cada comportamiento se declara en el HTML con un `data-attribute` y se implementa en `src/scripts/modules/`. El registro (`src/scripts/core/registry.ts`) lo monta si el atributo existe en la página y lo destruye al navegar.

1. Crea `src/scripts/modules/miModulo.ts`:

```ts
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-mi-modulo]',
  init(el, ctx) {
    if (ctx.reducedMotion) return;                       // estado final, sin animar

    el.addEventListener('click', onClick, { signal: ctx.signal }); // se quita solo al navegar
    const tween = gsap.to(el, { x: 10 });

    void ctx.ready.then(() => { /* la cortina (preloader / transición) ya se abrió */ });

    return () => tween.kill();                            // lo que no sea un listener
  },
});
```

2. Regístralo en `src/scripts/core/lifecycle.ts`:

```ts
import miModulo from '../modules/miModulo';
register('miModulo', miModulo);
```

3. Úsalo en cualquier `.astro`: `<div data-mi-modulo>…</div>`.

El contexto `ctx` trae `reducedMotion`, `signal` (un `AbortSignal` que se aborta en `destroyAll()`), `ready` (promesa resuelta cuando termina el preloader o la transición de página) e `isMobile` (por debajo de `--bp-mobile`). Un módulo puede declarar `order` para montar antes o después que los demás.

Módulos de la Fase 01: `scrollReveal` (`data-reveal="h|line|p|ctn"`, `data-reveal-first`), `parallax` (`data-parallax="w|img"`), `themeSwitch` (`data-theme-trigger` + `data-bg`), `magnetic`, `marquee`, `textSwap`, `tabs`, `scrollProgress`, `archReveal` (`data-arch`), `hero`, `header`. El preloader es una función (`runPreloader`) que llama `lifecycle.ts`.

## Estructura

```
src/
  layouts/Base.astro          html, meta, fuentes, ClientRouter, globales
  components/global/          Preloader, Header, Footer, PageTransition, RotateDevice
  components/ui/              ButtonPill, ButtonCircle, Marquee, ArchMask, ScrollProgress
  components/sections/        Hero, Puertas, Cita, Concepto, Ubicacion, Llegar, Cielo, MapaVivo,
                              Experiencias, Estratos, QueVeras, ArcoTexto, Estacion, Galeria,
                              Asfalto, Miradores, Cierre
  components/ui/Canto.astro   fragmento de roca con máscara irregular (el «decorado»)
  components/ui/Vimeo.astro   reproductor de Vimeo perezoso (iframe solo al pulsar)
  components/ui/Minube.astro  logotipo del editor; conmuta color/bone según el tema
  styles/                     vendor, reset, tokens, themes, base, typography, components,
                              utilities, main; mapbox.css (subconjunto vendor de Mapbox GL)
  scripts/core/               gsap, lenis, registry, lifecycle, transitions, dom, anim
  scripts/modules/            un fichero por data-attribute
  content/site.ts             brief, navegación, hero, contacto, footer
  content/home.ts             textos de cada escena de la home
  content/map.ts              token de Mapbox, estilo base, puntos de interés
  data/routes/*.json          las dos rutas (GeoJSON simplificado + perfil + estadísticas)
  assets/photos, assets/brand fotografías y marca (origen y estado en CREDITS.md)
  assets/decor/               nubes con alfa y máscaras de canto, generadas (tools/)
public/gpx/                   los GPX originales, descargables desde el mapa
tools/gpx-to-geojson.mjs      GPX → src/data/routes (node tools/gpx-to-geojson.mjs)
tools/make-clouds.mjs         tiras de nubes con alfa por ruido fractal (node tools/make-clouds.mjs)
tools/make-cantos.mjs         máscaras de borde irregular para los cantos (node tools/make-cantos.mjs)
tools/make-minube-bone.mjs    variante del logotipo de minube para fondos oscuros
```

Módulos de scroll añadidos en la Fase 03: `horizontal` (sección fijada que
se recorre en horizontal, con `containerAnimation` para lo que hay dentro),
`estratos` (la bajada en el tiempo), `arcText` (texto en media luna sobre el
arco), `highlight` (líneas que se encienden), `carousel` (galería con
inercia), `asfalto` (la secuencia de la palabra), `clouds`, `drift` y `vimeo`.

## Rendimiento del scroll

Lo más caro de la página es el mapa. Medido con una traza de Chromium (CPU
×4) recorriendo la home con la rueda: fuera del mapa, los frames se mantienen
por debajo de los 50 ms bajo esa penalización (≈ 12 ms reales); en el mapa,
la creación y el render por frame dominan. Por eso el mapa:

- se crea en un hueco de inactividad (`requestIdleCallback`) cuando la
  sección se acerca, no en mitad de un gesto de scroll;
- dibuja la ruta con `line-trim-offset` (un uniform) y no con un
  `line-gradient` nuevo por frame (que regenera una textura);
- mueve la cámara como mucho a 30 fps y solo si el progreso cambió;
- activa el terreno 3D solo en equipos con margen (≥ 8 núcleos, ≥ 8 GB, sin
  ahorro de datos) y limita el canvas a `devicePixelRatio` 1.5;
- apaga las capas que no aportan (edificios, portales).

ScrollTrigger va con `limitCallbacks` e `ignoreMobileResize`, y vuelve a
medir cuando llegan las fuentes. Para repetir la medición:
`node scratchpad/perf.mjs` (Playwright + CDP; ver el script).

## Medios en movimiento, sin vídeo

Las nubes del cielo y los cantos de roca del concepto y de «Asfalto» no son
vídeo: son imágenes con alfa generadas en el repositorio y movidas con GSAP
(marquee con empujón por velocidad de scroll, deriva con scrub, secuencia
fijada). Pesan poco, se recorren hacia atrás y no dependen de un códec.
Cuando haya dron o capas alfa reales, entran por el mismo sitio.

## El mapa vivo (Mapbox)

`[data-map]` (scripts/modules/map.ts) fija la sección tres pantallas y dibuja la
ruta con el scroll sobre un estilo `light-v11` recoloreado al sistema (base ink,
relieve insinuado, un solo acento). Mapbox GL se importa en diferido cuando la
sección está a una pantalla; su CSS es un subconjunto propio en la capa `vendor`
(styles/mapbox.css), porque el CSS completo sin capa pisaba el contenedor.

El token es público (`pk.`) y va restringido por URL en la cuenta de Mapbox:
solo sirve teselas a los dominios dados de alta. Vive en `src/content/map.ts`
y se puede sobrescribir con la variable `PUBLIC_MAPBOX_TOKEN` (Vercel o `.env`).
Para desarrollar en local, añade `http://localhost:4321` a las restricciones
del token (Mapbox → Tokens → URL restrictions).

Para regenerar las rutas a partir de nuevos GPX: déjalos en `public/gpx/` y
ejecuta `node tools/gpx-to-geojson.mjs`.
