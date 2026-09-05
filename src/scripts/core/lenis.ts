/**
 * lenis.ts — instancia única de scroll suave.
 * Se crea una vez y sobrevive a las navegaciones con View Transitions.
 * Integración con GSAP tal como la hace la referencia: el raf de Lenis
 * cuelga del ticker de GSAP, Lenis avisa a ScrollTrigger en cada scroll y
 * se desactiva el lagSmoothing para que ambos relojes coincidan.
 * No hace falta scrollerProxy: Lenis desplaza window, que es el scroller
 * por defecto de ScrollTrigger.
 *
 * Táctil: sin syncTouch. En móvil el scroll es nativo (por eso va tan
 * fino) y Lenis solo suaviza rueda y trackpad.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './dom';

let instance: Lenis | null = null;

export function initLenis(): Lenis | null {
  if (instance) return instance;
  if (prefersReducedMotion()) return null;

  instance = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  instance.on('scroll', () => ScrollTrigger.update());
  gsap.ticker.add((time) => {
    instance?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return instance;
}

export const getLenis = (): Lenis | null => instance;

/** Vuelve arriba sin animación (nueva página, preloader). */
export function scrollToTop(): void {
  window.scrollTo(0, 0);
  instance?.scrollTo(0, { immediate: true, force: true });
}

let locks = 0;

/** Bloquea el scroll (preloader, menú, transición). Reentrante. */
export function lockScroll(): void {
  locks += 1;
  if (locks > 1) return;
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbar}px`);
  document.documentElement.style.overflow = 'hidden';
  instance?.stop();
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  document.documentElement.style.removeProperty('--scrollbar-width');
  document.documentElement.style.overflow = '';
  instance?.start();
}
