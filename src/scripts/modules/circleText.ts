/**
 * circleText.ts — data-circle-text. Texto en textPath alrededor de un
 * círculo que gira con el scroll (scrub) mientras su sección cruza el viewport.
 * data-circle-text="60" cambia los grados totales de giro.
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-circle-text]',
  init(el, ctx) {
    const ring = el.querySelector<SVGGElement>('[data-circle-ring]');
    if (!ring || ctx.reducedMotion) return;
    const degrees = parseFloat(el.dataset.circleText ?? '') || 60;
    const tween = gsap.fromTo(
      ring,
      { rotation: -degrees / 2, transformOrigin: 'center center' },
      {
        rotation: degrees / 2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(ring, { clearProps: 'transform' });
    };
  },
});
