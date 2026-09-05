/**
 * parallax.ts — data-parallax="img" dentro de data-parallax="w".
 * yPercent −8 → 8 según el progreso del wrapper por el viewport, scrub.
 * El wrapper recorta y la imagen sobra un 8 % (base.css).
 * data-mob="off" en el wrapper lo desactiva en móvil.
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-parallax="img"]',
  init(el, ctx) {
    const wrapper = el.closest<HTMLElement>('[data-parallax="w"]');
    if (!wrapper || ctx.reducedMotion) return;
    if (ctx.isMobile && wrapper.dataset.mob === 'off') return;

    const tween = gsap.fromTo(
      el,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  },
});
