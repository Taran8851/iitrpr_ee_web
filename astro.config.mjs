// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  integrations: [icon(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
});
