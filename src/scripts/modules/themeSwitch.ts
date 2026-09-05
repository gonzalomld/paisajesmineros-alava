/**
 * themeSwitch.ts — el header (y la barra de progreso) invierten su color
 * según la sección que tengan detrás.
 *
 * Cada sección con data-theme-trigger declara su superficie en data-bg
 * (light | sky | dark | plum). Un ScrollTrigger por sección dispara al
 * cruzar el centro vertical del header; al retroceder se restaura el tema
 * de la sección anterior. Los objetivos llevan data-theme-target y
 * reciben data-theme="…"; themes.css hace el resto (transición 0.4 s).
 */
import { defineModule } from '../core/registry';
import { ScrollTrigger } from '../core/gsap';

const THEMES = new Set(['light', 'sky', 'dark', 'plum']);

function apply(theme: string): void {
  document.querySelectorAll<HTMLElement>('[data-theme-target]').forEach((target) => {
    target.dataset.theme = theme;
  });
}

export default defineModule({
  selector: '[data-theme-trigger]',
  order: -10,
  init(el) {
    const theme = THEMES.has(el.dataset.bg ?? '') ? (el.dataset.bg as string) : 'light';
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-theme-trigger]'));
    const index = sections.indexOf(el);
    const previous = index > 0 ? sections[index - 1] : undefined;
    const previousTheme = previous?.dataset.bg ?? 'light';

    const header = document.querySelector<HTMLElement>('[data-header]');
    const probe = (): number => {
      if (!header) return 0;
      const rect = header.getBoundingClientRect();
      return rect.top + rect.height / 2;
    };

    /* Una sección con arco (data-arch) cubre la zona del header cuando su
       borde superior está aún al 60 % del viewport: el arco crece por
       delante. Sin arco, se dispara al cruzar el centro del header. */
    const hasArch = el.hasAttribute('data-arch');
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: () => (hasArch ? 'top 60%' : `top top+=${probe()}`),
      onEnter: () => apply(theme),
      onLeaveBack: () => apply(previousTheme),
    });

    /* La primera sección fija el tema inicial sin esperar al scroll. */
    if (index === 0) apply(theme);

    return () => trigger.kill();
  },
});
