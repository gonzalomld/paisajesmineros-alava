/**
 * lifecycle.ts — punto de entrada del cliente (lo importa Base.astro una
 * sola vez). Arranca Lenis, registra los módulos, gestiona el ciclo
 * init / destroy en cada navegación con View Transitions y coordina el
 * preloader con la transición de página a través de `ready`.
 *
 *   carga inicial      boot() → mountAll() → preloader → markReady()
 *   astro:before-swap  destroyAll()
 *   astro:after-swap   restaurar <html>, scroll arriba, mountAll(), refresh
 *   astro:page-load    transición sale → markReady()
 */
import { ScrollTrigger } from './gsap';
import { initLenis, getLenis, scrollToTop } from './lenis';
import { register, mountAll, destroyAll, markReady, summary } from './registry';
import { initPageTransitions } from './transitions';
import { runPreloader } from '../modules/preloader';

import themeSwitch from '../modules/themeSwitch';
import scrollReveal from '../modules/scrollReveal';
import parallax from '../modules/parallax';
import magnetic from '../modules/magnetic';
import marquee from '../modules/marquee';
import textSwap from '../modules/textSwap';
import tabs from '../modules/tabs';
import scrollProgress from '../modules/scrollProgress';
import archReveal from '../modules/archReveal';
import hero from '../modules/hero';
import header from '../modules/header';

const REVEAL_GUARD_MS = 5000;

function setViewportUnit(): void {
  document.documentElement.style.setProperty('--vh-real', `${window.innerHeight}px`);
}

/**
 * Astro copia los atributos de <html> del documento nuevo en cada
 * navegación: se pierden las clases (js, lenis, is-visited) y el estilo
 * inline con --vh-real. Se restauran aquí, antes del primer pintado.
 */
let preloaderDone = false;

function restoreRoot(): void {
  const root = document.documentElement;
  root.classList.add('js');
  if (preloaderDone) root.classList.add('is-visited');
  if (getLenis()) root.classList.add('lenis', 'lenis-smooth');
  setViewportUnit();
}

function registerModules(): void {
  register('themeSwitch', themeSwitch);
  register('scrollReveal', scrollReveal);
  register('parallax', parallax);
  register('magnetic', magnetic);
  register('marquee', marquee);
  register('textSwap', textSwap);
  register('tabs', tabs);
  register('scrollProgress', scrollProgress);
  register('archReveal', archReveal);
  register('hero', hero);
  register('header', header);
}

/** Si un módulo no llegara a montar, nada se queda oculto. */
function revealGuard(): void {
  window.setTimeout(() => {
    document
      .querySelectorAll('[data-reveal]:not(.is-ready), [data-reveal-first]:not(.is-ready)')
      .forEach((el) => el.classList.add('is-ready'));
  }, REVEAL_GUARD_MS);
}

/** Ctrl+G (o ⌘G) muestra la rejilla de depuración. */
function initGridOverlay(): void {
  window.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'g') return;
    event.preventDefault();
    document.querySelector('[data-grid-overlay]')?.classList.toggle('is-on');
  });
}

function initResize(): void {
  let timer = 0;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      /* --vh-real solo cambia con el ancho (o la orientación): así la
         barra de direcciones móvil no provoca saltos al ocultarse. */
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        setViewportUnit();
      }
      ScrollTrigger.refresh(true);
    }, 40);
  });
  window.screen.orientation?.addEventListener('change', () => {
    window.setTimeout(setViewportUnit, 60);
  });
}

function boot(): void {
  history.scrollRestoration = 'manual';
  document.documentElement.classList.add('js');
  setViewportUnit();

  initLenis();
  restoreRoot();
  registerModules();
  initGridOverlay();
  initResize();

  let initialLoad = true;
  initPageTransitions({
    onRevealed: () => {
      if (initialLoad) return;
      markReady();
    },
  });

  mountAll();
  revealGuard();
  if (import.meta.env.DEV) console.debug('[asfaltokia] módulos', summary());

  void runPreloader(() => {
    initialLoad = false;
    markReady();
  }).then(() => {
    preloaderDone = true;
    initialLoad = false;
    markReady();
  });

  document.addEventListener('astro:before-swap', () => {
    destroyAll();
  });

  document.addEventListener('astro:after-swap', () => {
    restoreRoot();
    scrollToTop();
    mountAll();
    ScrollTrigger.refresh();
    revealGuard();
    if (import.meta.env.DEV) console.debug('[asfaltokia] módulos', summary());
  });
}

boot();
