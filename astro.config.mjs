import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wigginzhang.github.io/personal-blog/',
  base: '/personal-blog',
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});
