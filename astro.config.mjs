// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  /* El dominio de esta pieza, que es de minube; asfaltokia.eus es la web
     del cliente, adonde enlazamos. Cuando haya dominio definitivo, basta
     con darlo en SITE_URL (variable de entorno en Vercel). */
  site: process.env.SITE_URL ?? 'https://paisajesmineros.vercel.app',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    // /_kit es una página interna de sistema de diseño: fuera del sitemap.
    sitemap({ filter: (page) => !page.includes('/_kit') }),
  ],
  build: {
    // Cada página lleva su CSS inline si es pequeño; evita un request extra antes del LCP.
    inlineStylesheets: 'auto',
  },
});
