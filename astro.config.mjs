import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wigginzhang.github.io',
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});
