/**
 * arcText.ts — data-arc-text: texto en media luna, sobre el borde del arco
 * de sección. Un <textPath> en un círculo grande (solo se ve el tramo alto)
 * cuyas letras se abren con el scroll (textLength + lengthAdjust="spacing")
 * mientras aparece, atado al progreso de la sección, que es el mismo que
 * gobierna el arco. Así el texto solo se ve cuando el arco ya lo envuelve.
 *
 *   [data-arc-text="1150"]       longitud final del texto en unidades del viewBox
 *     svg > text > textPath      con el atributo textLength inicial
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-arc-text]',
  init(el, ctx) {
    const tp = el.querySelector<SVGTextPathElement>('textPath');
    const text = el.querySelector<SVGTextElement>('text');
    if (!tp || !text) return;
    const to = parseFloat(el.dataset.arcText ?? '') || 1100;
    const from = parseFloat(tp.getAttribute('textLength') ?? '') || to * 0.7;
    const section = el.closest<HTMLElement>('.section') ?? el;
    if (ctx.reducedMotion) {
      tp.setAttribute('textLength', String(to));
      return;
    }
    gsap.set(text, { autoAlpha: 0 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top 64%', end: 'top 22%', scrub: 0.3 },
    });
    tl.fromTo(tp, { attr: { textLength: from } }, { attr: { textLength: to } }, 0).fromTo(text, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.15);
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set(text, { clearProps: 'all' });
      tp.setAttribute('textLength', String(from));
    };
  },
});
