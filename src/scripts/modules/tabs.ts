/**
 * tabs.ts — conmutador declarativo (día / noche del hero).
 *
 *   [data-tabs]                 contenedor (recibe data-active="nombre")
 *   [data-tab-trigger="x"]      botón (role="tab")
 *   [data-tab-content="x"]      panel; los inactivos llevan `hidden`
 *
 * El panel entrante entra con un clip-path que barre desde el centro
 * (1.2 s, era). El barrido se gobierna con la variable --tab-reveal (50 → 0)
 * porque Chrome serializa inset(0 50% 0 50%) como inset(0 50%) y GSAP no
 * puede interpolar dos cadenas con distinto número de valores.
 * Teclado: flechas, Home, End.
 */
import { defineModule } from '../core/registry';
import { gsap, DUR } from '../core/gsap';

export default defineModule({
  selector: '[data-tabs]',
  init(el, ctx) {
    const triggers = Array.from(el.querySelectorAll<HTMLElement>('[data-tab-trigger]'));
    const panels = Array.from(el.querySelectorAll<HTMLElement>('[data-tab-content]'));
    if (triggers.length < 2) return;

    const panelFor = (name: string | undefined): HTMLElement | undefined =>
      panels.find((p) => p.dataset.tabContent === name);

    let current = Math.max(
      0,
      triggers.findIndex((t) => t.getAttribute('aria-selected') === 'true'),
    );
    let busy = false;

    const setActive = (index: number): void => {
      triggers.forEach((t, k) => {
        const on = k === index;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('is-active', on);
      });
      const name = triggers[index]?.dataset.tabTrigger;
      if (name) el.dataset.active = name;
    };

    const go = (index: number): void => {
      if (index === current || busy) return;
      const from = panelFor(triggers[current]?.dataset.tabTrigger);
      const to = panelFor(triggers[index]?.dataset.tabTrigger);
      if (!from || !to) return;

      setActive(index);
      current = index;

      if (ctx.reducedMotion) {
        from.hidden = true;
        to.hidden = false;
        return;
      }

      busy = true;
      to.hidden = false;
      gsap.set(to, { zIndex: 2, '--tab-reveal': 50 });
      gsap.set(from, { zIndex: 1 });
      gsap.to(to, {
        '--tab-reveal': 0,
        duration: DUR.section,
        ease: 'era',
        onComplete: () => {
          from.hidden = true;
          gsap.set([to, from], { clearProps: '--tab-reveal,zIndex' });
          busy = false;
        },
      });
    };

    triggers.forEach((t, i) => {
      t.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          go(i);
        },
        { signal: ctx.signal },
      );
      t.addEventListener(
        'keydown',
        (event) => {
          const map: Record<string, number> = {
            ArrowRight: (i + 1) % triggers.length,
            ArrowDown: (i + 1) % triggers.length,
            ArrowLeft: (i - 1 + triggers.length) % triggers.length,
            ArrowUp: (i - 1 + triggers.length) % triggers.length,
            Home: 0,
            End: triggers.length - 1,
          };
          const next = map[event.key];
          if (next === undefined) return;
          event.preventDefault();
          triggers[next]?.focus();
          go(next);
        },
        { signal: ctx.signal },
      );
    });

    setActive(current);

    return () => {
      gsap.killTweensOf(panels);
      gsap.set(panels, { clearProps: '--tab-reveal,zIndex' });
    };
  },
});
