import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://gideontigelaar.com',
  build: {
    inlineStylesheets: 'always',
  },
  image: {
    domains: ['avatars.githubusercontent.com'],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        avif: { effort: 2 },
      },
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      weights: ['500 700'],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssTarget: ['chrome111', 'edge111', 'firefox128', 'safari16.4', 'ios16.4'],
    },
  },
});