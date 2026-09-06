/**
 * vimeo.ts — data-vimeo: reproductor de Vimeo que no carga nada hasta que
 * se pide. El póster es nuestro (una imagen del sistema); al pulsar se
 * inyecta el iframe con autoplay, sin cookies de seguimiento (dnt=1) y con
 * la interfaz mínima. Si la sección tiene nubes (data-cloud), se apagan.
 *
 *   [data-vimeo="ID" data-vimeo-hash="h"]
 *     [data-vimeo-play]      botón
 *     [data-vimeo-frame]     donde va el iframe
 */
import { defineModule } from '../core/registry';
import { gsap } from '../core/gsap';

export default defineModule({
  selector: '[data-vimeo]',
  init(el, ctx) {
    const id = el.dataset.vimeo;
    const hash = el.dataset.vimeoHash;
    const play = el.querySelector<HTMLButtonElement>('[data-vimeo-play]');
    const frame = el.querySelector<HTMLElement>('[data-vimeo-frame]');
    if (!id || !play || !frame) return;
    let iframe: HTMLIFrameElement | undefined;

    play.addEventListener(
      'click',
      () => {
        if (iframe) return;
        const params = new URLSearchParams({
          autoplay: '1',
          dnt: '1',
          title: '0',
          byline: '0',
          portrait: '0',
          color: 'B5CEDB',
          playsinline: '1',
        });
        if (hash) params.set('h', hash);
        iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${id}?${params.toString()}`;
        iframe.title = el.dataset.vimeoTitle ?? 'Vídeo';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('loading', 'eager');
        frame.appendChild(iframe);
        el.classList.add('is-playing');
        const clouds = Array.from(el.querySelectorAll<HTMLElement>('[data-cloud]'));
        gsap.to([play, ...clouds], { autoAlpha: 0, duration: ctx.reducedMotion ? 0 : 0.8, ease: 'era' });
        gsap.fromTo(frame, { autoAlpha: 0 }, { autoAlpha: 1, duration: ctx.reducedMotion ? 0 : 1, ease: 'era', delay: 0.2 });
      },
      { signal: ctx.signal },
    );

    return () => {
      iframe?.remove();
      el.classList.remove('is-playing');
      gsap.set([play, frame], { clearProps: 'all' });
    };
  },
});
