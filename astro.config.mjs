import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wigginzhang.github.io/personal-blog',
  base: '/personal-blog/',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});
