/**
 * estratos.ts — data-estratos: la bajada. Sección fijada varias pantallas
 * en la que un número enorme retrocede en el tiempo mientras bajas (2026
 * → 1928 → 1872 → 1855 → hace 100 millones de años → hace 200), con un
 * índice de paradas a la derecha, la nota de cada parada y el fondo que se
 * oscurece con la profundidad. Las líneas de estrato suben a contracorriente.
 *
 *   [data-estratos]                      la sección (lleva el JSON de paradas)
 *     [data-estratos-stage]              lo que se fija
 *     [data-estratos-value]              el número
 *     [data-estratos-prefix] / -suffix   «Año» / «Hace» … «millones de años»
 *     [data-estratos-label] / -note      parada activa y su nota
 *     [data-estratos-stop] …             índice (uno por parada)
 *     [data-estratos-count]              «01 / 06»
 *     [data-estratos-line] …             líneas de estrato
 *     [data-estratos-depth]              barra de profundidad
 */
import { defineModule } from '../core/registry';
import { gsap, ScrollTrigger } from '../core/gsap';

interface Stop {
  label: string;
  value: number;
  unit: 'year' | 'ma';
  note: string;
}

const DEEP = '#0A1225';

function fmt(v: number, unit: Stop['unit']): string {
  if (unit === 'year') return String(Math.round(v));
  const m = Math.abs(v);
  return `${(m < 10 ? m.toFixed(1) : String(Math.round(m))).replace('.', ',')} M`;
}

export default defineModule({
  selector: '[data-estratos]',
  init(el, ctx) {
    const stage = el.querySelector<HTMLElement>('[data-estratos-stage]');
    const value = el.querySelector<HTMLElement>('[data-estratos-value]');
    const prefix = el.querySelector<HTMLElement>('[data-estratos-prefix]');
    const suffix = el.querySelector<HTMLElement>('[data-estratos-suffix]');
    const label = el.querySelector<HTMLElement>('[data-estratos-label]');
    const note = el.querySelector<HTMLElement>('[data-estratos-note]');
    const count = el.querySelector<HTMLElement>('[data-estratos-count]');
    const depth = el.querySelector<HTMLElement>('[data-estratos-depth]');
    const stops = Array.from(el.querySelectorAll<HTMLElement>('[data-estratos-stop]'));
    const lines = Array.from(el.querySelectorAll<HTMLElement>('[data-estratos-line]'));
    const dataNode = el.querySelector<HTMLScriptElement>('[data-estratos-data]');
    if (!stage || !value || !dataNode) return;
    let data: Stop[];
    try {
      data = JSON.parse(dataNode.textContent ?? '[]') as Stop[];
    } catch {
      return;
    }
    const n = data.length;
    if (n < 2) return;

    let active = -1;
    let lastText = '';
    const setActive = (i: number): void => {
      if (i === active) return;
      active = i;
      const s = data[i];
      if (!s) return;
      stops.forEach((node, k) => {
        node.classList.toggle('is-active', k === i);
        node.classList.toggle('is-past', k < i);
      });
      if (label) label.textContent = s.label;
      if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
      if (note) {
        if (ctx.reducedMotion) note.textContent = s.note;
        else {
          gsap.to(note, {
            autoAlpha: 0,
            y: -8,
            duration: 0.25,
            ease: 'era',
            overwrite: true,
            onComplete: () => {
              note.textContent = s.note;
              gsap.fromTo(note, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'era' });
            },
          });
        }
      }
    };
    const show = (p: number): void => {
      const t = p * (n - 1);
      const seg = Math.min(n - 2, Math.floor(t));
      const k = t - seg;
      const a = data[seg];
      const b = data[seg + 1];
      if (!a || !b) return;
      let text: string;
      let pre: string;
      let suf: string;
      if (a.unit === 'year' && b.unit === 'year') {
        text = fmt(a.value + (b.value - a.value) * k, 'year');
        pre = 'Año';
        suf = '';
      } else if (a.unit === 'year') {
        /* de 1855 a hace 100 millones: cuenta millones desde cero */
        const m = b.value * k;
        text = k < 0.02 ? fmt(a.value, 'year') : fmt(m, 'ma');
        pre = k < 0.02 ? 'Año' : 'Hace';
        suf = k < 0.02 ? '' : 'millones de años';
      } else {
        text = fmt(a.value + (b.value - a.value) * k, 'ma');
        pre = 'Hace';
        suf = 'millones de años';
      }
      if (text !== lastText) {
        lastText = text;
        value.textContent = text;
        if (prefix) prefix.textContent = pre;
        if (suffix) suffix.textContent = suf;
      }
      setActive(Math.round(t));
      if (depth) depth.style.transform = `scaleY(${p})`;
    };

    if (ctx.reducedMotion) {
      show(0);
      return;
    }

    const bg = gsap.fromTo(el, { backgroundColor: getComputedStyle(el).backgroundColor }, { backgroundColor: DEEP, ease: 'none', paused: true });
    const lineTweens = lines.map((line, i) =>
      gsap.fromTo(line, { yPercent: 0 }, { yPercent: -60 - i * 10, ease: 'none', paused: true }),
    );
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: `+=${(n - 1) * 70}%`,
      pin: stage,
      pinSpacing: true,
      scrub: 0.4,
      refreshPriority: 1,
      onUpdate: (self) => {
        show(self.progress);
        bg.progress(self.progress);
        for (const t of lineTweens) t.progress(self.progress);
      },
    });
    show(0);

    return () => {
      trigger.kill();
      bg.kill();
      lineTweens.forEach((t) => t.kill());
      gsap.set([el, note, ...lines], { clearProps: 'all' });
    };
  },
});
