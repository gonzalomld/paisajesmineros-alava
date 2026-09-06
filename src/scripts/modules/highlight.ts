/**
 * highlight.ts — data-highlight: una lista en display en la que cada línea
 * se enciende al pasar por el centro de la pantalla (y al pasar el ratón,
 * por CSS). Con reduced motion, todas encendidas.
 *
 *   [data-highlight] > …[data-highlight-item]
 */
import { defineModule } from '../core/registry';
import { ScrollTrigger } from '../core/gsap';

export default defineModule({
  selector: '[data-highlight]',
  init(el, ctx) {
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-highlight-item]'));
    if (ctx.reducedMotion) {
      items.forEach((it) => it.classList.add('is-lit'));
      return;
    }
    const triggers = items.map((it) =>
      ScrollTrigger.create({
        trigger: it,
        start: 'top 62%',
        end: 'bottom 38%',
        toggleClass: { targets: it, className: 'is-lit' },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  },
});
