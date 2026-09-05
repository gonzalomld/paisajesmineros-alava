/**
 * header.ts — data-header.
 *   1. Insignia circular: el anillo de texto gira 30 s por vuelta; al
 *      hacer scroll, la velocidad se acopla a la velocidad de Lenis y
 *      sigue su sentido; al parar vuelve a la base con un eraOut.
 *   2. Menú móvil: overlay a pantalla completa con revelado en arco,
 *      foco atrapado, Escape para cerrar, scroll bloqueado.
 */
import type Lenis from 'lenis';
import { defineModule } from '../core/registry';
import { gsap, DUR } from '../core/gsap';
import { getLenis, lockScroll, unlockScroll } from '../core/lenis';
import { designPx } from '../core/dom';

const BASE_SPEED = 360 / 30; // grados por segundo → 30 s por vuelta
const MAX_SPEED = 360;

function badge(el: HTMLElement, signal: AbortSignal, reduced: boolean): (() => void) | undefined {
  const ring = el.querySelector<SVGElement>('[data-badge-ring]');
  if (!ring || reduced) return undefined;

  const speed = { v: BASE_SPEED };
  let angle = 0;
  let dir = 1;
  let idle = 0;

  const tick = (_time: number, deltaTime: number): void => {
    angle = (angle + (speed.v * Math.min(deltaTime, 100)) / 1000) % 360;
    gsap.set(ring, { rotation: angle, transformOrigin: 'center center' });
  };
  gsap.ticker.add(tick);

  const lenis = getLenis();
  const onScroll = (instance: Lenis): void => {
    const v = instance.velocity;
    if (v !== 0) dir = v > 0 ? 1 : -1;
    const target = dir * Math.min(MAX_SPEED, BASE_SPEED + Math.abs(v) * 4);
    gsap.to(speed, { v: target, duration: 0.3, ease: 'eraOut', overwrite: true });
    window.clearTimeout(idle);
    idle = window.setTimeout(() => {
      gsap.to(speed, { v: dir * BASE_SPEED, duration: DUR.section, ease: 'eraOut', overwrite: true });
    }, 120);
  };
  lenis?.on('scroll', onScroll);

  signal.addEventListener('abort', () => window.clearTimeout(idle));

  return () => {
    gsap.ticker.remove(tick);
    lenis?.off('scroll', onScroll);
    gsap.killTweensOf(speed);
  };
}

function menu(el: HTMLElement, signal: AbortSignal, reduced: boolean): (() => void) | undefined {
  const button = el.querySelector<HTMLButtonElement>('[data-menu-btn]');
  const overlay = document.querySelector<HTMLElement>('[data-menu]');
  if (!button || !overlay) return undefined;

  const arch = overlay.querySelector<HTMLElement>('[data-menu-arch]');
  const items = Array.from(overlay.querySelectorAll<HTMLElement>('[data-menu-item]'));
  const focusables = (): HTMLElement[] =>
    Array.from(
      overlay.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'),
    );

  let open = false;
  let previousTheme = '';
  let timeline: gsap.core.Timeline | undefined;

  const openMenu = (): void => {
    if (open) return;
    open = true;
    button.setAttribute('aria-expanded', 'true');
    previousTheme = el.dataset.theme ?? 'light';
    el.dataset.theme = 'plum';
    el.classList.add('is-menu-open');
    overlay.hidden = false;
    lockScroll();

    timeline?.kill();
    if (reduced || !arch) {
      gsap.set(items, { clearProps: 'all' });
    } else {
      timeline = gsap
        .timeline()
        .fromTo(arch, { scale: 0.001, yPercent: 0 }, { scale: 1, duration: DUR.el, ease: 'era' })
        .fromTo(
          items,
          { autoAlpha: 0, y: designPx(32) },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'eraOut' },
          '-=0.35',
        );
    }
    focusables()[0]?.focus({ preventScroll: true });
  };

  const closeMenu = (restoreFocus = true): void => {
    if (!open) return;
    open = false;
    button.setAttribute('aria-expanded', 'false');
    el.dataset.theme = previousTheme;
    el.classList.remove('is-menu-open');

    const finish = (): void => {
      overlay.hidden = true;
      unlockScroll();
      if (restoreFocus) button.focus({ preventScroll: true });
    };

    timeline?.kill();
    if (reduced || !arch) {
      finish();
      return;
    }
    timeline = gsap
      .timeline({ onComplete: finish })
      .to(items, { autoAlpha: 0, y: -designPx(16), duration: 0.3, stagger: 0.03, ease: 'era' })
      .to(arch, { yPercent: -125, duration: 0.6, ease: 'eraOut' }, '<0.1');
  };

  button.addEventListener('click', () => (open ? closeMenu() : openMenu()), { signal });
  overlay.querySelectorAll<HTMLElement>('[data-menu-close]').forEach((node) => {
    node.addEventListener('click', () => closeMenu(), { signal });
  });
  overlay.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    link.addEventListener('click', () => closeMenu(false), { signal });
  });
  document.addEventListener(
    'keydown',
    (event) => {
      if (!open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = focusables();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    { signal },
  );

  return () => {
    timeline?.kill();
    if (open) {
      open = false;
      overlay.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      el.classList.remove('is-menu-open');
      unlockScroll();
    }
    gsap.set(items, { clearProps: 'all' });
    if (arch) gsap.set(arch, { clearProps: 'transform' });
  };
}

export default defineModule({
  selector: '[data-header]',
  init(el, ctx) {
    const cleanups = [badge(el, ctx.signal, ctx.reducedMotion), menu(el, ctx.signal, ctx.reducedMotion)];
    return () => cleanups.forEach((fn) => fn?.());
  },
});
