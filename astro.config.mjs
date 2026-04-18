import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://username.github.io',
  base: '/personal-blog',
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});
