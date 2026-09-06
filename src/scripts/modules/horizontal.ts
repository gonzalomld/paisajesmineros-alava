/**
 * horizontal.ts — data-horizontal: una sección que, fijada en pantalla,
 * se recorre en horizontal con el scroll vertical.
 *
 *   [data-horizontal]
 *     [data-horizontal-screen]        lo que se fija (100vh, recorta)
 *       [data-horizontal-track]       la pista (display flex, ancho libre)
 *         …[data-hreveal]             entra (fade + y) al llegar por la derecha
 *         …[data-horizontal-parallax] se desplaza a contracorriente (±8 %)
 *
 * La pista se traslada -(anchoPista - anchoPantalla) con scrub. Los
 * disparadores interiores usan containerAnimation, como manda ScrollTrigger
 * para contenedores que se mueven en horizontal. Con reduced motion no se
 * fija: los paneles quedan en columna (base.css).
 */
import { defineModule } from '../core/registry';
import { gsap, ScrollTrigger, DUR } from '../core/gsap';

export default defineModule({
  selector: '[data-horizontal]',
  init(el, ctx) {
    const screen = el.querySelector<HTMLElement>('[data-horizontal-screen]');
    const track = el.querySelector<HTMLElement>('[data-horizontal-track]');
    if (!screen || !track) return;
    const reveals = Array.from(track.querySelectorAll<HTMLElement>('[data-hreveal]'));
    const parallax = Array.from(track.querySelectorAll<HTMLElement>('[data-horizontal-parallax]'));
    if (ctx.reducedMotion) {
      el.classList.add('is-static');
      return;
    }
    const distance = (): number => Math.max(0, track.scrollWidth - screen.clientWidth);

    const move = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: screen,
        pinSpacing: true,
        scrub: 0.4,
        invalidateOnRefresh: true,
        refreshPriority: 1,
      },
    });

    const inner: gsap.core.Tween[] = [];
    for (const node of reveals) {
      inner.push(
        gsap.fromTo(
          node,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: DUR.el,
            ease: 'era',
            scrollTrigger: { trigger: node, containerAnimation: move, start: 'left 88%', toggleActions: 'play none none reverse' },
          },
        ),
      );
    }
    for (const node of parallax) {
      inner.push(
        gsap.fromTo(
          node,
          { xPercent: -8 },
          {
            xPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: node.parentElement ?? node, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
          },
        ),
      );
    }
    /* el primer panel ya está en pantalla al fijar: se revela solo */
    ScrollTrigger.refresh();

    return () => {
      for (const t of inner) {
        t.scrollTrigger?.kill();
        t.kill();
      }
      move.scrollTrigger?.kill();
      move.kill();
      gsap.set([track, ...reveals, ...parallax], { clearProps: 'all' });
    };
  },
});
