/**
 * scrollReveal.ts — reveals declarativos.
 *
 *   data-reveal="h"     SplitText por caracteres, entrada desde abajo con máscara, stagger 0.04
 *   data-reveal="line"  SplitText por líneas, cada línea con su propia máscara
 *   data-reveal="p"     fade + 12px de subida
 *   data-reveal="ctn"   contenedor completo: escala 1.04 → 1 con máscara
 *   data-reveal-first   igual, pero dispara al terminar la cortina (ctx.ready) en vez de con scroll
 *   data-reveal-delay   retardo en segundos (opcional)
 *   data-reveal-duration duración en segundos (opcional)
 *
 * Accesibilidad: SplitText (aria: "auto") deja aria-label en el contenedor
 * y aria-hidden en los fragmentos; al desmontar se restaura el DOM.
 */
import { defineModule } from '../core/registry';
import { gsap, ScrollTrigger, SplitText, DUR, STAGGER } from '../core/gsap';
import { designPx } from '../core/dom';

type Kind = 'h' | 'line' | 'p' | 'ctn';

interface Reveal {
  play: () => void;
  kill: () => void;
}

const isKind = (v: string | undefined): v is Kind =>
  v === 'h' || v === 'line' || v === 'p' || v === 'ctn';

function chars(el: HTMLElement, delay: number, duration: number): Reveal {
  const split = SplitText.create(el, {
    type: 'words,chars',
    mask: 'chars',
    wordsClass: 'split-word',
    charsClass: 'split-char',
  });
  gsap.set(split.chars, { yPercent: 120 });
  let tween: gsap.core.Tween | undefined;
  return {
    play: () => {
      tween = gsap.to(split.chars, {
        yPercent: 0,
        duration,
        delay,
        stagger: STAGGER.char,
        ease: 'eraOut',
      });
    },
    kill: () => {
      tween?.kill();
      split.revert();
    },
  };
}

function lines(el: HTMLElement, delay: number, duration: number): Reveal {
  let played = false;
  let current: gsap.core.Tween | undefined;
  const split = SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit: (self) => {
      current = gsap.fromTo(
        self.lines,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration,
          delay: played ? 0 : delay,
          stagger: STAGGER.line,
          ease: 'eraOut',
          paused: !played,
        },
      );
      if (played) current.progress(1);
      return current;
    },
  });
  return {
    play: () => {
      played = true;
      current?.play();
    },
    kill: () => {
      current?.kill();
      split.revert();
    },
  };
}

function fade(el: HTMLElement, delay: number, duration: number): Reveal {
  gsap.set(el, { autoAlpha: 0, y: designPx(12) });
  let tween: gsap.core.Tween | undefined;
  return {
    play: () => {
      tween = gsap.to(el, { autoAlpha: 1, y: 0, duration, delay, ease: 'eraOut' });
    },
    kill: () => {
      tween?.kill();
      gsap.set(el, { clearProps: 'opacity,visibility,transform' });
    },
  };
}

function container(el: HTMLElement, delay: number, duration: number): Reveal {
  gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.04, transformOrigin: 'center center' });
  let tween: gsap.core.Tween | undefined;
  return {
    play: () => {
      tween = gsap.to(el, {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        duration: Math.max(duration, DUR.section),
        delay,
        ease: 'eraOut',
      });
    },
    kill: () => {
      tween?.kill();
      gsap.set(el, { clearProps: 'clipPath,transform' });
    },
  };
}

const builders: Record<Kind, (el: HTMLElement, delay: number, duration: number) => Reveal> = {
  h: chars,
  line: lines,
  p: fade,
  ctn: container,
};

export default defineModule({
  selector: '[data-reveal], [data-reveal-first]',
  init(el, ctx) {
    const kind: Kind = isKind(el.dataset.reveal) ? el.dataset.reveal : 'p';
    const first = el.hasAttribute('data-reveal-first');
    const delay = parseFloat(el.dataset.revealDelay ?? '') || 0;
    const duration = parseFloat(el.dataset.revealDuration ?? '') || DUR.el;

    if (ctx.reducedMotion) {
      el.classList.add('is-ready');
      return;
    }

    const reveal = builders[kind](el, delay, duration);
    el.classList.add('is-ready');

    let trigger: ScrollTrigger | undefined;
    if (first) {
      void ctx.ready.then(() => {
        if (!ctx.signal.aborted) reveal.play();
      });
    } else {
      trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () => reveal.play(),
      });
    }

    return () => {
      trigger?.kill();
      reveal.kill();
    };
  },
});
