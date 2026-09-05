/**
 * carousel.ts — data-carousel: galería horizontal arrastrable con inercia.
 *
 *   [data-carousel]                       viewport (recorta)
 *     [data-carousel-track]               pista con los elementos
 *       [data-carousel-item] …
 *   [data-carousel-prev] [data-carousel-next]
 *   [data-carousel-current] [data-carousel-total]
 *
 * Draggable + InertiaPlugin (GSAP): se arrastra con ratón o dedo, sigue
 * con inercia y encaja en el elemento más cercano. Las flechas y el
 * teclado (← →) mueven de uno en uno. En móvil deja pasar el scroll
 * vertical. Con reduced motion, sin inercia y saltos sin animar.
 */
import { defineModule } from '../core/registry';
import { gsap, Draggable, ScrollTrigger, DUR } from '../core/gsap';

export default defineModule({
  selector: '[data-carousel]',
  init(el, ctx) {
    const track = el.querySelector<HTMLElement>('[data-carousel-track]');
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-carousel-item]'));
    if (!track || items.length < 2) return;
    const prev = el.parentElement?.querySelector<HTMLButtonElement>('[data-carousel-prev]') ?? null;
    const next = el.parentElement?.querySelector<HTMLButtonElement>('[data-carousel-next]') ?? null;
    const current = el.parentElement?.querySelector<HTMLElement>('[data-carousel-current]') ?? null;
    const total = el.parentElement?.querySelector<HTMLElement>('[data-carousel-total]') ?? null;
    const reduced = ctx.reducedMotion;

    if (total) total.textContent = String(items.length).padStart(2, '0');

    let offsets: number[] = [];
    let minX = 0;
    const measure = (): void => {
      offsets = items.map((it) => -it.offsetLeft);
      minX = Math.min(0, el.clientWidth - track.scrollWidth);
      drag?.applyBounds({ minX, maxX: 0 });
    };
    const nearest = (x: number): number => {
      let best = 0;
      let dist = Infinity;
      offsets.forEach((o, i) => {
        const d = Math.abs(Math.max(minX, o) - x);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      return best;
    };
    const setCurrent = (i: number): void => {
      if (current) current.textContent = String(i + 1).padStart(2, '0');
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = Math.max(minX, offsets[i] ?? 0) <= minX;
    };
    const update = (): void => setCurrent(nearest(Number(gsap.getProperty(track, 'x'))));

    const drag = Draggable.create(track, {
      type: 'x',
      bounds: { minX, maxX: 0 },
      edgeResistance: 0.8,
      inertia: !reduced,
      dragResistance: 0.05,
      allowNativeTouchScrolling: true,
      snap: reduced ? undefined : (x: number) => Math.max(minX, offsets[nearest(x)] ?? 0),
      onDrag: update,
      onThrowUpdate: update,
      onThrowComplete: update,
      onDragEnd: reduced ? () => goTo(nearest(Number(gsap.getProperty(track, 'x')))) : undefined,
    })[0];

    const goTo = (i: number): void => {
      const idx = Math.max(0, Math.min(items.length - 1, i));
      const x = Math.max(minX, offsets[idx] ?? 0);
      gsap.to(track, {
        x,
        duration: reduced ? 0 : DUR.el,
        ease: 'era',
        overwrite: true,
        onUpdate: () => drag?.update(),
        onComplete: () => setCurrent(idx),
      });
      setCurrent(idx);
    };
    const step = (dir: 1 | -1): void => goTo(nearest(Number(gsap.getProperty(track, 'x'))) + dir);

    prev?.addEventListener('click', () => step(-1), { signal: ctx.signal });
    next?.addEventListener('click', () => step(1), { signal: ctx.signal });
    el.addEventListener(
      'keydown',
      (ev) => {
        if (ev.key === 'ArrowRight') {
          ev.preventDefault();
          step(1);
        } else if (ev.key === 'ArrowLeft') {
          ev.preventDefault();
          step(-1);
        }
      },
      { signal: ctx.signal },
    );
    /* Un elemento enfocado dentro de la pista debe quedar a la vista. */
    track.addEventListener(
      'focusin',
      (ev) => {
        const item = (ev.target as HTMLElement).closest<HTMLElement>('[data-carousel-item]');
        if (item) goTo(items.indexOf(item));
      },
      { signal: ctx.signal },
    );

    measure();
    setCurrent(0);
    const onRefresh = (): void => {
      measure();
      update();
    };
    ScrollTrigger.addEventListener('refresh', onRefresh);

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      drag?.kill();
      gsap.killTweensOf(track);
      gsap.set(track, { clearProps: 'transform' });
    };
  },
});
