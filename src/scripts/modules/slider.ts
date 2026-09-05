/**
 * slider.ts — data-slider. Pila de diapositivas con transición por partes.
 *
 *   [data-slider data-slider-auto="6"]   raíz (autoplay opcional, segundos)
 *     [data-slide]                        cada diapositiva
 *       [data-part="h|line|p|ctn|slide"]  lo que entra y sale (core/anim.ts)
 *     [data-slider-prev] [data-slider-next]
 *     [data-slider-current] [data-slider-total] [data-slider-progress]
 *
 * La diapositiva activa está en flujo (define la altura); las demás,
 * ocultas. Durante el cambio, la entrante se apila encima en absoluto.
 * Autoplay solo mientras el slider está en pantalla; pausa en hover y foco.
 */
import { defineModule } from '../core/registry';
import { gsap, DUR } from '../core/gsap';
import { animate, clear, type Kind } from '../core/anim';

const KINDS: Kind[] = ['h', 'line', 'p', 'ctn', 'slide'];

function parts(slide: HTMLElement, kind: Kind): HTMLElement[] {
  return Array.from(slide.querySelectorAll<HTMLElement>(`[data-part="${kind}"]`));
}

export default defineModule({
  selector: '[data-slider]',
  init(el, ctx) {
    const slides = Array.from(el.querySelectorAll<HTMLElement>('[data-slide]'));
    if (slides.length < 2) return;

    const prev = el.querySelector<HTMLButtonElement>('[data-slider-prev]');
    const next = el.querySelector<HTMLButtonElement>('[data-slider-next]');
    const current = el.querySelector<HTMLElement>('[data-slider-current]');
    const total = el.querySelector<HTMLElement>('[data-slider-total]');
    const progress = el.querySelector<HTMLElement>('[data-slider-progress]');
    const auto = parseFloat(el.dataset.sliderAuto ?? '') || 0;

    let index = 0;
    let busy = false;
    let timer = 0;
    let visible = false;
    let bar: gsap.core.Tween | undefined;

    const pad = (n: number): string => String(n).padStart(2, '0');
    const counter = (): void => {
      if (current) current.textContent = pad(index + 1);
      if (total) total.textContent = pad(slides.length);
    };

    const setInitial = (slide: HTMLElement): void => {
      for (const kind of KINDS) parts(slide, kind).forEach((p) => animate(kind, p, 'initial'));
    };
    const play = (slide: HTMLElement, mode: 'reveal' | 'hide', delay = 0): void => {
      for (const kind of KINDS) {
        parts(slide, kind).forEach((p, i) => animate(kind, p, mode, { delay: delay + (mode === 'reveal' ? i * 0.05 : 0) }));
      }
    };

    /* estado inicial: solo la primera en flujo */
    slides.forEach((s, i) => {
      s.hidden = i !== 0;
      s.setAttribute('aria-hidden', String(i !== 0));
      s.classList.toggle('is-active', i === 0);
    });
    counter();

    const go = (to: number): void => {
      if (busy || to === index) return;
      const from = slides[index];
      const into = slides[to];
      if (!from || !into) return;
      busy = true;
      index = to;
      counter();

      if (ctx.reducedMotion) {
        from.hidden = true;
        into.hidden = false;
        from.classList.remove('is-active');
        into.classList.add('is-active');
        from.setAttribute('aria-hidden', 'true');
        into.setAttribute('aria-hidden', 'false');
        busy = false;
        return;
      }

      into.hidden = false;
      into.setAttribute('aria-hidden', 'false');
      gsap.set(into, { position: 'relative', zIndex: 2 });
      gsap.set(from, { position: 'absolute', inset: 0, zIndex: 1 });
      setInitial(into);
      play(from, 'hide');
      play(into, 'reveal', DUR.micro);
      window.setTimeout(() => {
        from.hidden = true;
        from.setAttribute('aria-hidden', 'true');
        from.classList.remove('is-active');
        into.classList.add('is-active');
        gsap.set([from, into], { clearProps: 'position,inset,zIndex' });
        busy = false;
      }, (DUR.section + DUR.micro) * 1000);
    };

    /* autoplay */
    const stop = (): void => {
      window.clearInterval(timer);
      timer = 0;
      bar?.kill();
      if (progress) gsap.set(progress, { scaleX: 0 });
    };
    const start = (): void => {
      if (!auto || ctx.reducedMotion || timer || !visible) return;
      const run = (): void => {
        bar?.kill();
        if (progress) bar = gsap.fromTo(progress, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: auto, ease: 'none' });
      };
      run();
      timer = window.setInterval(() => {
        go((index + 1) % slides.length);
        run();
      }, auto * 1000);
    };
    const restart = (): void => {
      stop();
      start();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) start();
        else stop();
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    prev?.addEventListener('click', () => { go((index - 1 + slides.length) % slides.length); restart(); }, { signal: ctx.signal });
    next?.addEventListener('click', () => { go((index + 1) % slides.length); restart(); }, { signal: ctx.signal });
    el.addEventListener('mouseenter', stop, { signal: ctx.signal });
    el.addEventListener('mouseleave', start, { signal: ctx.signal });
    el.addEventListener('focusin', stop, { signal: ctx.signal });
    el.addEventListener('focusout', start, { signal: ctx.signal });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()), { signal: ctx.signal });

    return () => {
      stop();
      io.disconnect();
      slides.forEach((s) => {
        for (const kind of KINDS) parts(s, kind).forEach((p) => clear(kind, p));
        gsap.set(s, { clearProps: 'all' });
        s.hidden = false;
        s.removeAttribute('aria-hidden');
      });
    };
  },
});
