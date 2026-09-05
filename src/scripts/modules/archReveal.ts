/**
 * archReveal.ts — data-arch. La sección entrante lleva un .arch-section de
 * su color de fondo anclado a su borde superior (bottom: 100 %); crece
 * con scrub desde scale(0) hasta cubrir el viewport mientras la sección
 * entra, de modo que emerge con silueta de arco sobre la anterior.
 * Geometría en base.css (.section > .arch-section).
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-arch]',
  init(el, ctx) {
    const arch = el.querySelector<HTMLElement>(':scope > .arch-section');
    if (!arch || ctx.reducedMotion) return;

    const tween = gsap.fromTo(
      arch,
      { scale: 0.001, transformOrigin: 'bottom center' },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'top 20%',
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(arch, { clearProps: 'transform' });
    };
  },
});
