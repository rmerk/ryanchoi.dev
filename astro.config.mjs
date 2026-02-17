import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ryanchoi.dev',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
