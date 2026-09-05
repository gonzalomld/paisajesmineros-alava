/**
 * preloader.ts — primera visita de la sesión.
 *
 * · Contador 00 → 100 ligado a la carga real: document.fonts.ready, las
 *   tres familias y la imagen del hero (decode). Nada de temporizadores.
 * · Al llegar a 100: el contenido sube y se desvanece, y la ventana en
 *   arco (máscara CSS controlada por --arch-w / --arch-y) se abre hacia
 *   arriba descubriendo el hero. 1.6 s con eraOut.
 * · onOpen se llama cuando la ventana empieza a abrirse: es el momento
 *   de resolver ctx.ready para que el hero revele mientras se descubre.
 * · Solo en la primera visita (sessionStorage). Con reduced motion, 0 s.
 */
import { gsap, SplitText, DUR, STAGGER } from '../core/gsap';
import { lockScroll, unlockScroll, scrollToTop } from '../core/lenis';
import { designPx, imageReady, prefersReducedMotion, session, wait } from '../core/dom';

const KEY = 'asfaltokia:visited';
const MIN_TIME = 1400; // ms: que la entrada del wordmark termine aunque todo cargue al instante

export async function runPreloader(onOpen: () => void): Promise<void> {
  const el = document.querySelector<HTMLElement>('[data-preloader]');
  if (!el) return;

  const visited = session.get(KEY) !== null;
  session.set(KEY, '1');
  if (visited || prefersReducedMotion() || document.documentElement.classList.contains('is-visited')) {
    el.remove();
    return;
  }

  const q = (sel: string): HTMLElement | null => el.querySelector<HTMLElement>(sel);
  const ctn = q('[data-preloader-ctn]');
  const word = q('[data-preloader-word]');
  const script = q('[data-preloader-script]');
  const label = q('[data-preloader-label]');
  const meta = q('[data-preloader-meta]');
  const counter = q('[data-preloader-counter]');
  const fill = q('[data-preloader-fill]');
  if (!ctn || !word || !script || !counter || !fill) {
    el.remove();
    return;
  }

  lockScroll();
  scrollToTop();

  /* ---- progreso real ------------------------------------------------ */
  const heroImg = document.querySelector<HTMLImageElement>('[data-hero-img]');
  const fontLoad = (family: string): Promise<void> =>
    document.fonts.load(`1em "${family}"`).then(
      () => undefined,
      () => undefined,
    );
  const tasks: Promise<unknown>[] = [
    document.fonts.ready,
    fontLoad('Bodoni Moda'),
    fontLoad('Mrs Saint Delafield'),
    fontLoad('Archivo'),
    imageReady(heroImg),
  ];

  const state = { p: 0 };
  let done = 0;
  const render = (): void => {
    counter.textContent = String(Math.min(100, Math.round(state.p))).padStart(2, '0');
    fill.style.transform = `scaleX(${state.p / 100})`;
  };
  const advance = (): void => {
    done += 1;
    gsap.to(state, {
      p: (done / tasks.length) * 99,
      duration: 0.8,
      ease: 'eraOut',
      onUpdate: render,
      overwrite: true,
    });
  };
  render();
  for (const task of tasks) task.then(advance, advance);

  /* ---- entrada del contenido --------------------------------------- */
  const split = SplitText.create(word, { type: 'chars', mask: 'chars', charsClass: 'split-char' });
  const secondary = [label, meta].filter((n): n is HTMLElement => n !== null);
  const intro = gsap
    .timeline()
    .fromTo(
      split.chars,
      { yPercent: 120 },
      { yPercent: 0, duration: DUR.el, stagger: STAGGER.char, ease: 'eraOut' },
      0.1,
    )
    .fromTo(
      script,
      { autoAlpha: 0, y: designPx(24) },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'eraOut' },
      0.5,
    )
    .fromTo(
      secondary,
      { autoAlpha: 0, y: designPx(12) },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'eraOut' },
      0.7,
    );

  await Promise.all([Promise.allSettled(tasks), intro.then(), wait(MIN_TIME)]);
  await gsap.to(state, { p: 100, duration: 0.4, ease: 'eraOut', onUpdate: render, overwrite: true }).then();

  /* ---- salida: 1.6 s ------------------------------------------------ */
  const mobile = window.innerWidth < 992;
  const midW = mobile ? '80vw' : '36vw';
  const endW = mobile ? '220vw' : '130vw';

  await gsap
    .timeline()
    .to(ctn, { y: -designPx(48), autoAlpha: 0, duration: 0.6, ease: 'era' }, 0)
    .to(secondary, { autoAlpha: 0, duration: 0.4, ease: 'era' }, 0)
    .to(el, { '--arch-y': '20vh', '--arch-w': midW, duration: 0.7, ease: 'era' }, 0.15)
    .add(onOpen, 0.6)
    .to(el, { '--arch-y': '-150vh', '--arch-w': endW, duration: 0.85, ease: 'eraOut' }, 0.75)
    .then();

  split.revert();
  el.remove();
  unlockScroll();
}
