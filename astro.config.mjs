// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://asfaltokia.eus',
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
