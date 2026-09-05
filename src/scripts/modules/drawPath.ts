/**
 * drawPath.ts — data-draw. Dibuja los <path data-draw-path> de un SVG
 * (DrawSVGPlugin) al entrar en pantalla y hace aparecer las etiquetas
 * [data-draw-label] escalonadas de izquierda a derecha.
 */
import { defineModule } from '../core/registry';
import { gsap, ScrollTrigger, DUR } from '../core/gsap';
import { designPx } from '../core/dom';

export default defineModule({
  selector: '[data-draw]',
  init(el, ctx) {
    const paths = Array.from(el.querySelectorAll<SVGPathElement>('[data-draw-path]'));
    const labels = Array.from(el.querySelectorAll<HTMLElement>('[data-draw-label]'));
    if (!paths.length) return;

    if (ctx.reducedMotion) return;

    gsap.set(paths, { drawSVG: '0%' });
    gsap.set(labels, { autoAlpha: 0, y: designPx(12) });

    const tl = gsap.timeline({ paused: true });
    tl.to(paths, { drawSVG: '100%', duration: 2.6, ease: 'era' }, 0);
    tl.to(labels, { autoAlpha: 1, y: 0, duration: DUR.el, stagger: 0.14, ease: 'eraOut' }, 0.5);

    const trigger = ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => tl.play() });

    return () => {
      trigger.kill();
      tl.kill();
      gsap.set(paths, { clearProps: 'all' });
      gsap.set(labels, { clearProps: 'all' });
    };
  },
});
