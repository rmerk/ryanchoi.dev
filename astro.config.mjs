import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import measureAssets from './integrations/measure-assets.mjs';

export default defineConfig({
  site: 'https://ryanchoi.dev',
  output: 'static',
  // measureAssets substitutes real built byte counts into /colophon after the build.
  // It only ever rewrites fixed-width tokens with equal-length values, so it cannot
  // change the sizes it just measured. See integrations/measure-assets.mjs.
  integrations: [measureAssets()],
  vite: {
    plugins: [tailwindcss()],
  },
});
