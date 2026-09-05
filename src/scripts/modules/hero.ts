/**
 * hero.ts — data-hero.
 *   Entrada: la imagen arranca en scale(1.08) y se asienta en 1 durante
 *   1.8 s cuando la cortina termina (ctx.ready). Los textos los lleva
 *   scrollReveal con data-reveal-first.
 *   Scroll: al salir del hero, el bloque de imagen se desplaza hacia
 *   arriba a media velocidad y se escala de 1 a 1.12, scrub anclado al
 *   alto del hero; la tipografía sube a velocidad completa (en flujo).
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-hero]',
  init(el, ctx) {
    const media = el.querySelector<HTMLElement>('[data-hero-media]');
    const scale = el.querySelector<HTMLElement>('[data-hero-scale]');
    if (!media || !scale) return;
    if (ctx.reducedMotion) {
      el.querySelectorAll<HTMLImageElement>('[data-tab-content][hidden] img').forEach((img) => {
        img.loading = 'eager';
      });
      return;
    }

    gsap.set(scale, { scale: 1.08, transformOrigin: 'center center' });
    let entrance: gsap.core.Tween | undefined;
    void ctx.ready.then(() => {
      if (ctx.signal.aborted) return;
      entrance = gsap.to(scale, { scale: 1, duration: 1.8, ease: 'eraOut' });
      /* La versión nocturna es lazy y está oculta: se pide ahora, con la
         cortina abierta, para que el conmutador día / noche sea instantáneo. */
      el.querySelectorAll<HTMLImageElement>('[data-tab-content][hidden] img').forEach((img) => {
        img.loading = 'eager';
      });
    });

    const exit = gsap.to(media, {
      yPercent: 50,
      scale: 1.12,
      transformOrigin: 'center top',
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      entrance?.kill();
      exit.scrollTrigger?.kill();
      exit.kill();
      gsap.set([media, scale], { clearProps: 'transform' });
    };
  },
});
