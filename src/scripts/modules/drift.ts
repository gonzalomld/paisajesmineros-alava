/**
 * drift.ts — data-drift: un elemento (los «cantos» de roca) que deriva
 * con el scroll de su sección: se desplaza y gira un poco, scrub.
 *
 *   [data-drift data-drift-y="120" data-drift-x="-40" data-drift-r="8"]
 *
 * Valores en píxeles de diseño (se escalan con --u) y grados: el elemento
 * va de −valor a +valor mientras la sección recorre el viewport. La
 * sección es el [data-drift-scope] más cercano o el .section.
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';
import { designPx } from '../core/dom';

export default defineModule({
  selector: '[data-drift]',
  init(el, ctx) {
    if (ctx.reducedMotion) return;
    const scope = el.closest<HTMLElement>('[data-drift-scope], .section') ?? el;
    const y = parseFloat(el.dataset.driftY ?? '') || 0;
    const x = parseFloat(el.dataset.driftX ?? '') || 0;
    const r = parseFloat(el.dataset.driftR ?? '') || 0;
    const k = ctx.isMobile ? 0.5 : 1;
    const tween = gsap.fromTo(
      el,
      { y: designPx(y * k), x: designPx(x * k), rotation: -r },
      {
        y: designPx(-y * k),
        x: designPx(-x * k),
        rotation: r,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  },
});
