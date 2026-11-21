// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://noviq-as3.pages.dev',
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !/^\/(?:admin(?:\/|$)|404(?:\.html|\/?$))/.test(pathname);
      },
    }),
  ],
});
