/**
 * textSwap.ts — data-text-swap. Dos copias de la etiqueta apiladas
 * (.swap > .swap__text × 2): en hover suben ambas al unísono, 0.4 s, era.
 * Si un ancestro lleva data-text-swap-trigger, el hover se escucha ahí
 * (botón circular, tarjetas). También responde al foco por teclado.
 */
import { defineModule } from '../core/registry';
import { gsap, DUR } from '../core/gsap';

export default defineModule({
  selector: '[data-text-swap]',
  init(el, ctx) {
    const texts = Array.from(el.querySelectorAll<HTMLElement>('.swap__text'));
    const base = texts[0];
    const clone = texts[1];
    if (!base || !clone) return;

    /* La copia lleva translateY(100%) en CSS para el caso sin JS; GSAP lo
       lee como `y` en px, así que se anula y se gobierna solo con yPercent. */
    gsap.set(base, { y: 0, yPercent: 0 });
    gsap.set(clone, { y: 0, yPercent: 100 });

    if (ctx.reducedMotion) return () => gsap.set(texts, { clearProps: 'transform' });

    const hoverable = !ctx.isMobile && window.matchMedia('(hover: hover)').matches;
    const trigger = el.closest<HTMLElement>('[data-text-swap-trigger]') ?? el;
    const duration = DUR.micro + 0.1;

    const up = (): void => {
      gsap.to(base, { yPercent: -100, duration, ease: 'era', overwrite: true });
      gsap.to(clone, { yPercent: 0, duration, ease: 'era', overwrite: true });
    };
    const down = (): void => {
      gsap.to(base, { yPercent: 0, duration, ease: 'era', overwrite: true });
      gsap.to(clone, { yPercent: 100, duration, ease: 'era', overwrite: true });
    };

    if (hoverable) {
      trigger.addEventListener('mouseenter', up, { signal: ctx.signal });
      trigger.addEventListener('mouseleave', down, { signal: ctx.signal });
    }
    trigger.addEventListener('focusin', up, { signal: ctx.signal });
    trigger.addEventListener('focusout', down, { signal: ctx.signal });

    return () => {
      gsap.killTweensOf(texts);
      gsap.set(texts, { clearProps: 'transform' });
    };
  },
});
