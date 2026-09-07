/**
 * vimeo.ts — data-vimeo: reproductor de Vimeo que no carga nada hasta que
 * se pide. El póster es nuestro; al pulsar se inyecta el iframe con
 * autoplay, sin cookies de seguimiento (dnt=1) y con la interfaz mínima.
 *
 * El estado visible lo lleva la clase .is-playing en el CSS del
 * componente, no un tween: el botón es magnético y magnetic.ts
 * sobrescribe los tweens del elemento al salir el puntero, así que un
 * fundido con GSAP se quedaba a medias y el botón se veía sobre el vídeo.
 *
 * Se sale con el botón de cerrar o con Escape, y el vídeo se pausa solo
 * al salir de pantalla: quitar el iframe pararía la reproducción, pero
 * también perdería el minuto por el que iba, así que se pausa con la API
 * de mensajes del reproductor y se retira al cerrar. Al volver no arranca
 * solo, que sería intrusivo para quien lo había pausado a mano.
 *
 * Mientras dura, la cabecera pasa a tema oscuro (como ya hace el menú al
 * abrirse): el vídeo cubre la sección y el color claro no se leería.
 *
 *   [data-vimeo="ID" data-vimeo-hash="h"]
 *     [data-vimeo-play]      botón
 *     [data-vimeo-frame]     donde va el iframe
 *     [data-vimeo-close]     salida
 */
import { defineModule } from '../core/registry';

const ORIGIN = 'https://player.vimeo.com';

export default defineModule({
  selector: '[data-vimeo]',
  init(el, ctx) {
    const id = el.dataset.vimeo;
    const hash = el.dataset.vimeoHash;
    const play = el.querySelector<HTMLButtonElement>('[data-vimeo-play]');
    const frame = el.querySelector<HTMLElement>('[data-vimeo-frame]');
    const close = el.querySelector<HTMLButtonElement>('[data-vimeo-close]');
    if (!id || !play || !frame) return;
    const header = document.querySelector<HTMLElement>('[data-header]');
    let iframe: HTMLIFrameElement | undefined;
    let headerTheme: string | undefined;

    /** Orden al reproductor: pausar cuando el vídeo deja la pantalla. */
    const pause = (): void => {
      iframe?.contentWindow?.postMessage(JSON.stringify({ method: 'pause' }), ORIGIN);
    };

    const open = (): void => {
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
      iframe.src = `${ORIGIN}/video/${id}?${params.toString()}`;
      iframe.title = el.dataset.vimeoTitle ?? 'Vídeo';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.appendChild(iframe);
      el.classList.add('is-playing');
      if (header) {
        headerTheme = header.dataset.theme;
        header.dataset.theme = 'dark';
      }
      play.setAttribute('aria-hidden', 'true');
      play.tabIndex = -1;
      if (close) {
        close.removeAttribute('aria-hidden');
        close.tabIndex = 0;
        close.focus({ preventScroll: true });
      }
    };

    const shut = (): void => {
      if (!iframe) return;
      iframe.remove();
      iframe = undefined;
      el.classList.remove('is-playing');
      /* Solo se devuelve el tema si nadie lo ha cambiado entretanto. */
      if (header && header.dataset.theme === 'dark' && headerTheme) header.dataset.theme = headerTheme;
      play.removeAttribute('aria-hidden');
      play.tabIndex = 0;
      if (close) {
        close.setAttribute('aria-hidden', 'true');
        close.tabIndex = -1;
      }
      play.focus({ preventScroll: true });
    };

    play.addEventListener('click', open, { signal: ctx.signal });
    close?.addEventListener('click', shut, { signal: ctx.signal });
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' && iframe) shut();
      },
      { signal: ctx.signal },
    );

    /* Fuera de pantalla el vídeo se calla. No se reanuda solo al volver:
       quien lo pausó a mano no querría que arrancara de nuevo. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (iframe && !entry?.isIntersecting) pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (iframe) shut();
    };
  },
});
