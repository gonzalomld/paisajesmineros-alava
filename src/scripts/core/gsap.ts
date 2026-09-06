/**
 * gsap.ts — registro de plugins y eases del sistema.
 * Es el único sitio que importa gsap: los módulos importan de aquí para
 * garantizar que los plugins están registrados y las eases creadas.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, DrawSVGPlugin, Draggable, InertiaPlugin);

/* Menos trabajo por frame: callbacks solo en cambios relevantes y sin
   refresh por el resize de la barra de direcciones en móvil. */
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

/* Las mismas curvas que --ease-era / --ease-era-out en tokens.css */
CustomEase.create('era', '0.65, 0, 0.35, 1');
CustomEase.create('eraOut', '0.16, 1, 0.3, 1');

/** Duraciones del sistema (segundos). Espejo de --d-* en tokens.css. */
export const DUR = {
  micro: 0.3,
  el: 0.8,
  section: 1.2,
  page: 1.6,
} as const;

/** Staggers por defecto. Espejo de --stagger-* en tokens.css. */
export const STAGGER = {
  char: 0.04,
  line: 0.08,
} as const;

export { gsap, ScrollTrigger, SplitText, CustomEase, DrawSVGPlugin, Draggable, InertiaPlugin };
