/**
 * dom.ts — utilidades pequeñas compartidas por módulos.
 */

/** ¿El usuario pide menos movimiento? Evaluado en cada llamada. */
export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Píxeles de diseño → píxeles reales. Espejo en JS de la unidad fluida:
 * designPx(48) devuelve lo que mide --sp-48 ahora mismo (48px a 1600 de
 * ancho, 103px a 3440, 48px a 416). Útil para valores que GSAP necesita
 * en px (desplazamientos, offsets).
 */
export function designPx(n: number): number {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const ratio = parseFloat(style.getPropertyValue('--scale-ratio')) || 16;
  const rem = parseFloat(style.fontSize) || window.innerWidth / 100;
  return (n * rem) / ratio;
}

/** Lectura segura de sessionStorage (Safari en privado lanza). */
export const session = {
  get(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* sin almacenamiento: el preloader se verá en cada carga */
    }
  },
};

/** Promesa que se resuelve cuando la imagen está decodificada (o falla). */
export function imageReady(img: HTMLImageElement | null): Promise<void> {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth > 0) {
    return img.decode().catch(() => undefined);
  }
  return new Promise<void>((resolve) => {
    const done = (): void => {
      img.decode().catch(() => undefined).finally(resolve);
    };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
}

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms));
