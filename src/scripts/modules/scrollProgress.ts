/**
 * scrollProgress.ts — data-scroll-progress. Contador de dos dígitos y
 * línea que crece con el porcentaje de página recorrido (--progress).
 * Desaparece con un fade en el último 10 %. Solo escritorio.
 */
import { defineModule } from '../core/registry';
import { ScrollTrigger } from '../core/gsap';

export default defineModule({
  selector: '[data-scroll-progress]',
  init(el, ctx) {
    if (ctx.isMobile) return;
    const count = el.querySelector<HTMLElement>('[data-progress-count]');

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const p = self.progress;
        el.style.setProperty('--progress', p.toFixed(4));
        if (count) count.textContent = String(Math.round(p * 100)).padStart(2, '0');
        el.style.opacity = p > 0.9 ? Math.max(0, 1 - (p - 0.9) / 0.1).toFixed(3) : '1';
      },
    });

    return () => {
      trigger.kill();
      el.style.removeProperty('--progress');
      el.style.removeProperty('opacity');
      if (count) count.textContent = '00';
    };
  },
});
