/**
 * anim.ts — las animaciones de texto y contenedor del sistema, en un solo
 * sitio. Las usan scrollReveal (con scroll o al abrir la cortina) y el
 * slider (al cambiar de diapositiva). Cada función acepta tres modos:
 *   initial  fija el estado de partida sin animar
 *   reveal   entra
 *   hide     sale (más rápido, hacia el lado contrario)
 */
import { gsap, SplitText, DUR, STAGGER } from './gsap';
import { designPx } from './dom';

export type Mode = 'initial' | 'reveal' | 'hide';
export type Kind = 'h' | 'line' | 'p' | 'ctn' | 'slide';
export interface AnimOpts {
  delay?: number;
  duration?: number;
}

const splits = new WeakMap<HTMLElement, SplitText>();

function split(el: HTMLElement, kind: 'chars' | 'lines'): SplitText {
  let s = splits.get(el);
  if (!s) {
    s =
      kind === 'chars'
        ? SplitText.create(el, { type: 'words,chars', mask: 'chars', wordsClass: 'split-word', charsClass: 'split-char' })
        : SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    splits.set(el, s);
  }
  return s;
}

/** Restaura el DOM original (aria incluido). Llamar al desmontar. */
export function revertSplit(el: HTMLElement): void {
  splits.get(el)?.revert();
  splits.delete(el);
}

const SLIDE_START = 'polygon(100% 0%, 100% 0%, 101% 100%, 125% 100%)';
const SLIDE_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const SLIDE_END = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';

export function textH(el: HTMLElement, mode: Mode, o: AnimOpts = {}): gsap.core.Tween | undefined {
  const chars = split(el, 'chars').chars;
  if (mode === 'initial') {
    gsap.set(chars, { yPercent: 120 });
    return undefined;
  }
  if (mode === 'reveal') {
    /* En textos largos el stagger se comprime para que la entrada dure como mucho 1.2 s más que un carácter. */
    const stagger = Math.min(STAGGER.char, 1.2 / Math.max(1, chars.length));
    return gsap.to(chars, { yPercent: 0, duration: o.duration ?? DUR.el, delay: o.delay ?? 0, stagger, ease: 'eraOut', overwrite: true });
  }
  return gsap.to(chars, { yPercent: -120, duration: DUR.micro + 0.1, delay: o.delay ?? 0, stagger: STAGGER.char / 2, ease: 'era', overwrite: true });
}

export function textLines(el: HTMLElement, mode: Mode, o: AnimOpts = {}): gsap.core.Tween | undefined {
  const lines = split(el, 'lines').lines;
  if (mode === 'initial') {
    gsap.set(lines, { yPercent: 115 });
    return undefined;
  }
  if (mode === 'reveal') {
    return gsap.to(lines, { yPercent: 0, duration: o.duration ?? DUR.el, delay: o.delay ?? 0, stagger: STAGGER.line, ease: 'eraOut', overwrite: true });
  }
  return gsap.to(lines, { yPercent: -115, duration: DUR.micro + 0.1, delay: o.delay ?? 0, stagger: STAGGER.line / 2, ease: 'era', overwrite: true });
}

export function fade(el: HTMLElement | HTMLElement[], mode: Mode, o: AnimOpts = {}): gsap.core.Tween | undefined {
  if (mode === 'initial') {
    gsap.set(el, { autoAlpha: 0, y: designPx(12) });
    return undefined;
  }
  if (mode === 'reveal') {
    return gsap.to(el, { autoAlpha: 1, y: 0, duration: o.duration ?? DUR.el, delay: o.delay ?? 0, stagger: 0.08, ease: 'eraOut', overwrite: true });
  }
  return gsap.to(el, { autoAlpha: 0, y: -designPx(12), duration: DUR.micro, delay: o.delay ?? 0, ease: 'era', overwrite: true });
}

export function ctn(el: HTMLElement, mode: Mode, o: AnimOpts = {}): gsap.core.Tween | undefined {
  if (mode === 'initial') {
    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.04, transformOrigin: 'center center' });
    return undefined;
  }
  if (mode === 'reveal') {
    return gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: Math.max(o.duration ?? 0, DUR.section), delay: o.delay ?? 0, ease: 'eraOut', overwrite: true });
  }
  return gsap.to(el, { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.02, duration: DUR.micro + 0.2, delay: o.delay ?? 0, ease: 'era', overwrite: true });
}

/** Imagen que entra deslizándose desde la derecha: clip en polígono + escala del hijo. */
export function slide(el: HTMLElement, mode: Mode, o: AnimOpts = {}): gsap.core.Tween | undefined {
  const inner = el.firstElementChild as HTMLElement | null;
  if (mode === 'initial') {
    gsap.set(el, { clipPath: SLIDE_START });
    if (inner) gsap.set(inner, { scale: 1.5, xPercent: 25, transformOrigin: 'center center' });
    return undefined;
  }
  if (mode === 'reveal') {
    if (inner) gsap.to(inner, { scale: 1, xPercent: 0, duration: DUR.section, delay: o.delay ?? 0, ease: 'era', overwrite: true });
    return gsap.to(el, { clipPath: SLIDE_FULL, duration: DUR.section, delay: o.delay ?? 0, ease: 'era', overwrite: true });
  }
  if (inner) gsap.to(inner, { scale: 1.5, xPercent: -25, duration: DUR.section, delay: o.delay ?? 0, ease: 'era', overwrite: true });
  return gsap.to(el, { clipPath: SLIDE_END, duration: DUR.section, delay: o.delay ?? 0, ease: 'era', overwrite: true });
}

export function animate(kind: Kind, el: HTMLElement, mode: Mode, o: AnimOpts = {}): gsap.core.Tween | undefined {
  switch (kind) {
    case 'h':
      return textH(el, mode, o);
    case 'line':
      return textLines(el, mode, o);
    case 'p':
      return fade(el, mode, o);
    case 'ctn':
      return ctn(el, mode, o);
    case 'slide':
      return slide(el, mode, o);
  }
}

/** Limpia todo lo que anim.ts pudo dejar en un elemento. */
export function clear(kind: Kind, el: HTMLElement): void {
  gsap.killTweensOf(el);
  if (kind === 'h' || kind === 'line') {
    revertSplit(el);
    return;
  }
  gsap.set(el, { clearProps: 'all' });
  const inner = el.firstElementChild as HTMLElement | null;
  if (kind === 'slide' && inner) gsap.set(inner, { clearProps: 'all' });
}
