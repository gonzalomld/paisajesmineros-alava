/**
 * asfalto.ts — data-asfalto: la secuencia de la palabra.
 *
 * Sección fijada tres pantallas. Con el scroll: dos fotografías entran
 * deslizándose mientras los cantos de roca derivan por los lados; la
 * segunda crece hasta ocupar la pantalla; la palabra la atraviesa letra
 * a letra; y remata la frase con su crédito. Todo con scrub, así que se
 * puede recorrer hacia atrás.
 *
 *   [data-asfalto]
 *     [data-asfalto-stage]     lo que se fija (100vh)
 *     [data-asfalto-a]         primera fotografía (se va)
 *     [data-asfalto-b]         segunda fotografía (crece a sangre)
 *     [data-asfalto-canto] …   cantos
 *     [data-asfalto-word]      la palabra (SplitText por caracteres)
 *     [data-asfalto-text] …    frase y crédito
 */
import { defineModule } from '../core/registry';
import { gsap, SplitText } from '../core/gsap';

const SLIDE_START = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';
const SLIDE_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

export default defineModule({
  selector: '[data-asfalto]',
  init(el, ctx) {
    const stage = el.querySelector<HTMLElement>('[data-asfalto-stage]');
    const figA = el.querySelector<HTMLElement>('[data-asfalto-a]');
    const figB = el.querySelector<HTMLElement>('[data-asfalto-b]');
    const word = el.querySelector<HTMLElement>('[data-asfalto-word]');
    const cantos = Array.from(el.querySelectorAll<HTMLElement>('[data-asfalto-canto]'));
    const texts = Array.from(el.querySelectorAll<HTMLElement>('[data-asfalto-text]'));
    if (!stage || !figA || !figB || !word) return;

    if (ctx.reducedMotion) {
      /* estado final, legible, sin fijar */
      gsap.set([figA, ...cantos], { autoAlpha: 0 });
      return;
    }

    const split = new SplitText(word, { type: 'chars', charsClass: 'split-char' });
    const chars = split.chars as HTMLElement[];
    const inner = (fig: HTMLElement): HTMLElement | null => fig.firstElementChild as HTMLElement | null;

    /* Cuánto tiene que escalar B para cubrir la pantalla, desde su caja.
       Medidas de layout (offset*), que ignoran el transform en curso. */
    const cover = (): { scale: number; x: number; y: number } => {
      const w = figB.offsetWidth;
      const h = figB.offsetHeight;
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      const scale = Math.max(sw / w, sh / h) * 1.02;
      const x = sw / 2 - (figB.offsetLeft + w / 2);
      const y = sh / 2 - (figB.offsetTop + h / 2);
      return { scale, x, y };
    };
    const side = (i: number): number => (i % 2 ? 1 : -1);

    gsap.set([figA, figB], { clipPath: SLIDE_START });
    gsap.set([inner(figA), inner(figB)], { scale: 1.3, yPercent: 12 });
    gsap.set(chars, { xPercent: 130, autoAlpha: 0 });
    gsap.set(texts, { autoAlpha: 0, y: 24 });
    gsap.set(cantos, { autoAlpha: 0 });

    /* Todo con fromTo y valores por función: al hacer refresh (cambio de
       viewport) ScrollTrigger invalida la línea y recalcula sin perder el
       punto de partida de cada tween. */
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=320%',
        pin: stage,
        pinSpacing: true,
        scrub: 0.5,
        refreshPriority: 1,
        invalidateOnRefresh: true,
      },
    });
    /* 1 · entran las fotos y los cantos */
    tl.fromTo(figA, { clipPath: SLIDE_START }, { clipPath: SLIDE_FULL, duration: 1.2 }, 0)
      .fromTo(inner(figA), { scale: 1.3, yPercent: 12 }, { scale: 1, yPercent: 0, duration: 1.2 }, 0)
      .fromTo(figB, { clipPath: SLIDE_START }, { clipPath: SLIDE_FULL, duration: 1.2 }, 0.35)
      .fromTo(inner(figB), { scale: 1.3, yPercent: 12 }, { scale: 1, yPercent: 0, duration: 1.2 }, 0.35)
      .fromTo(cantos, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.15 }, 0.4)
      .fromTo(
        cantos,
        { x: (i: number) => side(i) * 260, y: 160, rotation: (i: number) => side(i) * 18 },
        { x: 0, y: 0, rotation: 0, duration: 1.6, stagger: 0.15 },
        0.2,
      );
    /* 2 · B crece a sangre; A y los cantos se retiran */
    tl.fromTo(
      figB,
      { scale: 1, x: 0, y: 0 },
      { scale: () => cover().scale, x: () => cover().x, y: () => cover().y, duration: 1.6, ease: 'power1.inOut' },
      2.0,
    )
      .fromTo(figA, { xPercent: 0, autoAlpha: 1 }, { xPercent: -30, autoAlpha: 0, duration: 1.0 }, 2.0)
      .to(cantos, { autoAlpha: 0, y: -120, duration: 0.8 }, 2.1);
    /* 3 · la palabra atraviesa */
    tl.fromTo(chars, { xPercent: 130, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.4, stagger: 0.12, ease: 'power2.out' }, 3.3);
    /* 4 · la frase */
    tl.fromTo(texts, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.15 }, 4.4);
    tl.to({}, { duration: 0.6 });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      split.revert();
      gsap.set([figA, figB, inner(figA), inner(figB), ...cantos, ...texts], { clearProps: 'all' });
    };
  },
});
