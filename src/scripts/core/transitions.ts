/**
 * transitions.ts — transición de página sobre las View Transitions de Astro.
 *
 * Secuencia (1.6 s en total, con la carga sincronizada en el punto medio):
 *   astro:before-preparation → el panel plum entra desde abajo con silueta
 *                              de arco y aparece el wordmark en script.
 *                              El loader de Astro espera a que el panel
 *                              cubra la pantalla (Promise.all).
 *   astro:before-swap        → lifecycle destruye los módulos.
 *   astro:after-swap         → lifecycle monta los módulos de la página nueva.
 *   astro:page-load          → el panel sale hacia arriba y se resuelve
 *                              ctx.ready para los reveals iniciales.
 */
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';
import { gsap, DUR } from './gsap';
import { lockScroll, unlockScroll } from './lenis';
import { prefersReducedMotion } from './dom';

interface Panel {
  root: HTMLElement;
  arch: HTMLElement;
  word: HTMLElement;
}

function getPanel(): Panel | null {
  const root = document.querySelector<HTMLElement>('[data-page-transition]');
  const arch = root?.querySelector<HTMLElement>('[data-page-transition-arch]');
  const word = root?.querySelector<HTMLElement>('[data-page-transition-word]');
  return root && arch && word ? { root, arch, word } : null;
}

/** Mitad 1: cubrir. */
async function cover(panel: Panel): Promise<void> {
  lockScroll();
  panel.root.classList.add('is-active');
  await gsap
    .timeline()
    .set(panel.root, { autoAlpha: 1 })
    .fromTo(
      panel.arch,
      { scale: 0.001, yPercent: 0 },
      { scale: 1, duration: DUR.page / 2, ease: 'era' },
    )
    .fromTo(
      panel.word,
      { autoAlpha: 0, yPercent: 30 },
      { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: 'eraOut' },
      '-=0.35',
    )
    .then();
}

/** Mitad 2: descubrir la página nueva. */
async function uncover(panel: Panel): Promise<void> {
  await gsap
    .timeline()
    .to(panel.word, { autoAlpha: 0, yPercent: -30, duration: 0.4, ease: 'era' })
    .to(panel.arch, { yPercent: -125, duration: DUR.page / 2, ease: 'eraOut' }, '<0.1')
    .set(panel.root, { autoAlpha: 0 })
    .then();
  panel.root.classList.remove('is-active');
  unlockScroll();
}

export interface TransitionHooks {
  /** Se llama cuando la página nueva está descubierta (o al instante sin animación). */
  onRevealed: () => void;
}

export function initPageTransitions(hooks: TransitionHooks): void {
  let covering: Promise<void> | null = null;

  document.addEventListener('astro:before-preparation', (event) => {
    const ev = event as TransitionBeforePreparationEvent;
    const panel = getPanel();
    if (!panel || prefersReducedMotion()) return;

    const originalLoader = ev.loader;
    covering = cover(panel);
    ev.loader = async () => {
      await Promise.all([covering, originalLoader()]);
    };
  });

  document.addEventListener('astro:page-load', () => {
    const panel = getPanel();
    if (!covering || !panel) {
      hooks.onRevealed();
      return;
    }
    covering = null;
    void uncover(panel).then(hooks.onRevealed);
  });
}
