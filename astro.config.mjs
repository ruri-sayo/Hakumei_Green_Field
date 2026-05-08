import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://hakumei-greenfield.pages.dev',
  vite: {
    server: {
      watch: {
        ignored: ['**/_workspace/**'],
      },
    },
  },
});
