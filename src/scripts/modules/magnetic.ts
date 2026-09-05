/**
 * magnetic.ts — data-magnetic. El hijo [data-magnetic-inner] sigue al
 * cursor con un desfase del 25 % (el contenedor, un 10 %) y vuelve con
 * un elastic. Solo escritorio con puntero fino.
 * data-magnetic="0.4" cambia la fuerza.
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-magnetic]',
  init(el, ctx) {
    if (ctx.isMobile || ctx.reducedMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const strength = parseFloat(el.dataset.magnetic ?? '') || 0.25;
    const targets: HTMLElement[] = inner ? [el, inner] : [el];

    const move = (event: PointerEvent): void => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - rect.left) / rect.width - 0.5;
      const dy = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        x: dx * rect.width * strength * 0.4,
        y: dy * rect.height * strength * 0.4,
        duration: 1,
        ease: 'power3.out',
      });
      if (inner) {
        gsap.to(inner, {
          x: dx * rect.width * strength,
          y: dy * rect.height * strength,
          duration: 1.2,
          ease: 'power3.out',
        });
      }
    };
    const leave = (): void => {
      gsap.to(targets, { x: 0, y: 0, duration: 1.6, ease: 'elastic.out(1, 0.3)', overwrite: true });
    };

    el.addEventListener('pointermove', move, { signal: ctx.signal });
    el.addEventListener('pointerleave', leave, { signal: ctx.signal });

    return () => {
      gsap.killTweensOf(targets);
      gsap.set(targets, { clearProps: 'transform' });
    };
  },
});
