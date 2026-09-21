/**
 * estratos.ts — data-estratos: la bajada. Sección fijada varias pantallas
 * en la que un número enorme retrocede en el tiempo mientras bajas (2026
 * → 1928 → 1872 → 1856 → hace 100 millones de años → hace 200), con un
 * índice de paradas a la derecha, la nota de cada parada y el fondo que se
 * oscurece con la profundidad. Las líneas de estrato suben a contracorriente.
 *
 * El número salta de parada en parada; nunca muestra valores intermedios,
 * que no significan nada, y cambia a la vez que la etiqueta, la nota y el
 * índice, para que los tres digan siempre lo mismo.
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
  return unit === 'year' ? String(v) : `${v} M`;
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

    /* Una parada por tramo de scroll. El número grande, la etiqueta, la nota
       y el índice cambian a la vez y siempre coinciden: antes el valor se
       interpolaba y enseñaba años que no existen (1981 entre 2026 y 1928)
       mientras el texto seguía en la parada anterior. */
    const setActive = (i: number): void => {
      if (i === active) return;
      const previo = active;
      active = i;
      const s = data[i];
      if (!s) return;
      stops.forEach((node, k) => {
        node.classList.toggle('is-active', k === i);
        node.classList.toggle('is-past', k < i);
      });
      if (label) label.textContent = s.label;
      if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
      if (prefix) prefix.textContent = s.unit === 'year' ? 'Año' : 'Hace';
      if (suffix) suffix.textContent = s.unit === 'year' ? '' : 'millones de años';

      const texto = fmt(s.value, s.unit);
      const bajando = i > previo;
      if (ctx.reducedMotion || previo < 0) {
        value.textContent = texto;
        if (note) note.textContent = s.note;
        return;
      }
      /* el número sale por donde va el scroll y entra el nuevo por el otro lado */
      gsap.to(value, {
        yPercent: bajando ? -30 : 30,
        autoAlpha: 0,
        duration: 0.22,
        ease: 'era',
        overwrite: true,
        onComplete: () => {
          value.textContent = texto;
          gsap.fromTo(value, { yPercent: bajando ? 30 : -30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'eraOut' });
        },
      });
      if (note) {
        gsap.to(note, {
          autoAlpha: 0,
          y: -8,
          duration: 0.22,
          ease: 'era',
          overwrite: true,
          onComplete: () => {
            note.textContent = s.note;
            gsap.fromTo(note, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'era' });
          },
        });
      }
    };

    const show = (p: number): void => {
      /* n tramos iguales: dentro de cada uno, la parada no cambia */
      setActive(Math.min(n - 1, Math.floor(p * n * 0.999)));
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
