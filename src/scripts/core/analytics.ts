/**
 * analytics.ts — la analítica de Vercel.
 *
 * El componente <Analytics /> de @vercel/analytics/astro no vale aquí: su
 * <script> vive dentro de node_modules y Astro no empaqueta los scripts de
 * los componentes de una dependencia, así que el elemento acababa en el
 * HTML sin nadie que lo definiera y no se registraba ni una visita. Se
 * llama a inject() desde nuestro propio código, que es exactamente lo que
 * ese componente hace por dentro.
 *
 * El seguimiento de navegaciones queda en manos del script de Vercel, que
 * escucha el history: las View Transitions navegan con pushState, así que
 * las cuenta igual. Sin cookies y sin datos personales.
 */
import { inject } from '@vercel/analytics';

export function initAnalytics(): void {
  inject({ framework: 'astro' });
}
