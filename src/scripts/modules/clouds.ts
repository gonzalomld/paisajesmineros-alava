/**
 * clouds.ts — data-clouds: tiras de nubes que cruzan el cielo.
 *
 *   [data-clouds]                          la sección
 *     [data-cloud="0.6"]                   cada tira (factor de velocidad);
 *                                          dentro, dos copias de la imagen
 *                                          (200 % de ancho) para el bucle.
 *
 * Cada tira se desplaza en bucle a su velocidad; el scroll les da un
 * empujón proporcional a la velocidad (timeScale), y vuelven a su ritmo.
 * Con reduced motion no se mueven.
 */
import { defineModule } from '../core/registry';
import { gsap, ScrollTrigger } from '../core/gsap';

export default defineModule({
  selector: '[data-clouds]',
  init(el, ctx) {
    const strips = Array.from(el.querySelectorAll<HTMLElement>('[data-cloud]'));
    if (!strips.length || ctx.reducedMotion) return;

    const tweens = strips.map((strip) => {
      const factor = parseFloat(strip.dataset.cloud ?? '') || 1;
      return gsap.to(strip, { xPercent: -50, ease: 'none', duration: 140 / factor, repeat: -1 });
    });
    const boost = { v: 1 };
    let settle: gsap.core.Tween | undefined;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const k = 1 + Math.min(5, Math.abs(self.getVelocity()) / 500);
        if (k > boost.v) {
          boost.v = k;
          settle?.kill();
          for (const t of tweens) t.timeScale(k);
          settle = gsap.to(boost, {
            v: 1,
            duration: 1.4,
            ease: 'eraOut',
            onUpdate: () => {
              for (const t of tweens) t.timeScale(boost.v);
            },
          });
        }
      },
      onLeave: () => tweens.forEach((t) => t.pause()),
      onEnterBack: () => tweens.forEach((t) => t.play()),
      onLeaveBack: () => tweens.forEach((t) => t.pause()),
      onEnter: () => tweens.forEach((t) => t.play()),
    });
    tweens.forEach((t) => t.pause());

    return () => {
      trigger.kill();
      settle?.kill();
      tweens.forEach((t) => t.kill());
    };
  },
});
