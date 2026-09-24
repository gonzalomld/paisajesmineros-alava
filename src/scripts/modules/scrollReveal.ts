/**
 * scrollReveal.ts — reveals declarativos.
 *
 *   data-reveal="h"       SplitText por caracteres, entrada desde abajo con máscara
 *   data-reveal="line"    SplitText por líneas, cada línea con su máscara
 *                         (re-parte al redimensionar, al cargar las fuentes
 *                         y si detecta que una línea ha acabado ocupando dos)
 *   data-reveal="p"       fade + 12px de subida
 *   data-reveal="ctn"     contenedor completo: escala 1.04 → 1 con máscara
 *   data-reveal="slide"   imagen que entra desde la derecha con clip-path (el hijo escala 1.5 → 1)
 *   data-reveal-first     dispara al terminar la cortina (ctx.ready) en vez de con scroll
 *   data-reveal-delay     retardo en segundos
 *   data-reveal-duration  duración en segundos
 *   data-reveal-start     punto de disparo de ScrollTrigger (por defecto "top 92%")
 *   data-reveal-start-mobile  el mismo, solo en móvil (si se omite, hereda)
 *
 * Las animaciones viven en core/anim.ts; aquí solo se decide cuándo.
 */
import { defineModule } from '../core/registry';
import { gsap, ScrollTrigger, SplitText, DUR, STAGGER } from '../core/gsap';
import { animate, clear, type Kind } from '../core/anim';

interface Reveal {
  play: () => void;
  kill: () => void;
}

const isKind = (v: string | undefined): v is Kind =>
  v === 'h' || v === 'line' || v === 'p' || v === 'ctn' || v === 'slide';

/* Las líneas se re-parten al redimensionar (autoSplit): caso aparte. */
function lines(el: HTMLElement, delay: number, duration: number, signal: AbortSignal): Reveal {
  let played = false;
  let current: gsap.core.Tween | undefined;
  const vars: SplitText.Vars = { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true };
  const split = SplitText.create(el, {
    ...vars,
    onSplit: (self) => {
      current = gsap.fromTo(
        self.lines,
        { yPercent: 115 },
        { yPercent: 0, duration, delay: played ? 0 : delay, stagger: STAGGER.line, ease: 'eraOut', paused: !played },
      );
      if (played) current.progress(1);
      return current;
    },
  });

  /* Red de seguridad. SplitText mide el texto, lo trocea en una línea por
     div y a partir de ahí cada div envuelve por su cuenta: si el texto se
     midió con una tipografía y se pinta con otra (o el dispositivo escala
     el cuerpo), la última palabra de cada línea ya no cabe y cae sola a
     una segunda línea. El resultado es una columna llena de huérfanas.
     GSAP re-parte al cargar las fuentes y al redimensionar, pero no
     cuando la medida y el pintado discrepan por cualquier otro motivo, y
     eso es justo lo que se ve en algún móvil. Así que se comprueba: si
     alguna línea ocupa más de una, se vuelve a partir sobre lo que hay
     pintado ahora. Tres intentos; si a la tercera sigue, no es un
     problema de medida y repetir no lo arreglaría. */
  let intentos = 0;
  const revisar = (): void => {
    if (signal.aborted || intentos >= 3) return;
    const alto = parseFloat(getComputedStyle(el).lineHeight);
    if (!alto || !split.lines.length) return;
    const parteAlguna = split.lines.some((l) => l.getBoundingClientRect().height > alto * 1.4);
    if (!parteAlguna) return;
    intentos += 1;
    split.split(vars);
  };
  /* Al montar, al asentarse el primer pintado y cuando estén las fuentes. */
  requestAnimationFrame(revisar);
  const t = window.setTimeout(revisar, 900);
  void document.fonts.ready.then(() => requestAnimationFrame(revisar));

  return {
    play: () => {
      played = true;
      current?.play();
      requestAnimationFrame(revisar);
    },
    kill: () => {
      window.clearTimeout(t);
      current?.kill();
      split.revert();
    },
  };
}

function generic(kind: Kind, el: HTMLElement, delay: number, duration: number): Reveal {
  animate(kind, el, 'initial');
  return {
    play: () => {
      animate(kind, el, 'reveal', { delay, duration });
    },
    kill: () => clear(kind, el),
  };
}

export default defineModule({
  selector: '[data-reveal], [data-reveal-first]',
  init(el, ctx) {
    const kind: Kind = isKind(el.dataset.reveal) ? el.dataset.reveal : 'p';
    const first = el.hasAttribute('data-reveal-first');
    const delay = parseFloat(el.dataset.revealDelay ?? '') || 0;
    const duration = parseFloat(el.dataset.revealDuration ?? '') || DUR.el;
    const start = (ctx.isMobile ? el.dataset.revealStartMobile : undefined) ?? el.dataset.revealStart ?? 'top 92%';

    if (ctx.reducedMotion) {
      el.classList.add('is-ready');
      return;
    }

    const reveal = kind === 'line' ? lines(el, delay, duration, ctx.signal) : generic(kind, el, delay, duration);
    el.classList.add('is-ready');

    let trigger: ScrollTrigger | undefined;
    if (first) {
      void ctx.ready.then(() => {
        if (!ctx.signal.aborted) reveal.play();
      });
    } else {
      trigger = ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => reveal.play() });
    }

    return () => {
      trigger?.kill();
      reveal.kill();
    };
  },
});
