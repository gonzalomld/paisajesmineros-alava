/**
 * indexCounter.ts — data-index. Numera sus [data-index-item] como
 * "1.0 · 2.0 · 3.0": el índice tipográfico de la referencia.
 */
import { defineModule } from '../core/registry';

export default defineModule({
  selector: '[data-index]',
  init(el) {
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-index-item]'));
    items.forEach((item, i) => {
      item.textContent = `${i + 1}.0`;
    });
  },
});
