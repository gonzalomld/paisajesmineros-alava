/**
 * marquee.ts — data-marquee con un [data-marquee-track] dentro.
 * Duplica el track (aria-hidden) y anima ambos con translateX infinito.
 * Pausa en hover y al recibir foco. data-marquee-speed en px/s (60).
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-marquee]',
  init(el, ctx) {
    const track = el.querySelector<HTMLElement>('[data-marquee-track]');
    if (!track) return;

    const clone = track.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button').forEach((node) => node.setAttribute('tabindex', '-1'));
    el.appendChild(clone);

    if (ctx.reducedMotion) {
      return () => clone.remove();
    }

    const speed = parseFloat(el.dataset.marqueeSpeed ?? '') || 60;
    const tracks = [track, clone];
    const build = (): gsap.core.Tween =>
      gsap.to(tracks, {
        xPercent: -100,
        ease: 'none',
        duration: Math.max(4, track.offsetWidth / speed),
        repeat: -1,
      });
    let tween = build();

    let timer = 0;
    const onResize = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        tween.kill();
        gsap.set(tracks, { xPercent: 0 });
        tween = build();
      }, 80);
    };

    const pause = (): void => {
      tween.pause();
    };
    const play = (): void => {
      tween.play();
    };

    el.addEventListener('mouseenter', pause, { signal: ctx.signal });
    el.addEventListener('mouseleave', play, { signal: ctx.signal });
    el.addEventListener('focusin', pause, { signal: ctx.signal });
    el.addEventListener('focusout', play, { signal: ctx.signal });
    window.addEventListener('resize', onResize, { signal: ctx.signal });

    return () => {
      window.clearTimeout(timer);
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
      clone.remove();
    };
  },
});
