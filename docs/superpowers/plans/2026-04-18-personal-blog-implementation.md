# Personal Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a personal blog with Astro, Markdown support, GitHub Pages deployment, and creative Blue-Cyan gradient UI.

**Architecture:** Astro-based static site with Markdown content, component-based UI, CSS variables for theming, GitHub Actions for CI/CD deployment.

**Tech Stack:** Astro, Markdown, CSS (no Tailwind), GitHub Pages, GitHub Actions

---

## File Structure

```
personal-blog/
├── src/
│   ├── components/
│   │   ├── NavBar.astro
│   │   ├── Hero.astro
│   │   ├── ArticleCard.astro
│   │   ├── Footer.astro
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── articles/
│   │       └── [...slug].astro
│   ├── content/
│   │   └── config.ts
│   └── styles/
│       └── global.css
├── public/
│   └── fonts/
├── docs/
│   └── superpowers/
│       ├── plans/
│       └── specs/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "personal-blog",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.0.0"
  }
}
```

- [ ] **Step 2: Create astro.config.mjs**

```javascript
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
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`

- [ ] **Step 5: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json
git commit -m "feat: initialize Astro project with basic config"
```

---

## Task 2: Global Styles & CSS Variables

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create global.css with design tokens**

```css
:root {
  /* Colors - Blue-Cyan Gradient */
  --gradient-start: #0061ff;
  --gradient-end: #60efff;
  --gradient: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));

  /* Backgrounds */
  --bg-primary: #f8fafc;
  --bg-card: #ffffff;
  --bg-nav: rgba(248, 250, 252, 0.9);

  /* Text */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-inverse: #ffffff;

  /* Accents */
  --accent: #0061ff;
  --border: #e2e8f0;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Layout */
  --max-width-content: 720px;
  --max-width-listing: 1200px;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-card-hover: 0 20px 25px rgba(0, 97, 255, 0.15);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
}

code {
  font-family: var(--font-mono);
  background: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

pre {
  background: #1e1e1e;
  padding: var(--space-lg);
  border-radius: 8px;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add global styles with Blue-Cyan design tokens"
```

---

## Task 3: Base Layout Component

**Files:**
- Create: `src/components/BaseLayout.astro`

- [ ] **Step 1: Create BaseLayout.astro**

```astro
---
import NavBar from './NavBar.astro';
import Footer from './Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Personal technical blog' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content={description} />
  <title>{title} | Personal Blog</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet" />
</head>
<body>
  <NavBar />
  <main>
    <slot />
  </main>
  <Footer />
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BaseLayout.astro
git commit -m "feat: add BaseLayout component with meta tags"
```

---

## Task 4: Navigation Component

**Files:**
- Create: `src/components/NavBar.astro`

- [ ] **Step 1: Create NavBar.astro**

```astro
---
const { pathname } = Astro.url;
const isHome = pathname === '/';
---

<header class="navbar" class:list={{ scrolled: !isHome }}>
  <div class="navbar-inner">
    <a href="/" class="logo">
      <span class="logo-text">My Blog</span>
    </a>
    <nav>
      <a href="/" class:list={{ active: isHome }}>Home</a>
      <a href="/about">About</a>
      <a href="/tags">Tags</a>
    </nav>
  </div>
</header>

<style>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  transition: background var(--transition-normal), box-shadow var(--transition-normal);
}

.navbar.scrolled {
  background: var(--bg-nav);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
}

.navbar-inner {
  max-width: var(--max-width-listing);
  margin: 0 auto;
  padding: var(--space-md) var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-primary);
  text-decoration: none;
}

.logo:hover {
  text-decoration: none;
}

nav {
  display: flex;
  gap: var(--space-lg);
}

nav a {
  color: var(--text-secondary);
  font-weight: 500;
  transition: color var(--transition-fast);
}

nav a:hover,
nav a.active {
  color: var(--accent);
  text-decoration: none;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/NavBar.astro
git commit -m "feat: add NavBar component with scroll effect"
```

---

## Task 5: Footer Component

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create Footer.astro**

```astro
---
const year = new Date().getFullYear();
---

<footer class="footer">
  <div class="footer-inner">
    <p class="copyright">&copy; {year} Personal Blog</p>
    <div class="social-links">
      <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
      <a href="https://twitter.com" target="_blank" rel="noopener">Twitter</a>
    </div>
  </div>
</footer>

<style>
.footer {
  margin-top: var(--space-3xl);
  padding: var(--space-xl) var(--space-lg);
  border-top: 1px solid var(--border);
}

.footer-inner {
  max-width: var(--max-width-listing);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.social-links {
  display: flex;
  gap: var(--space-md);
}

.social-links a {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.social-links a:hover {
  color: var(--accent);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: add Footer component"
```

---

## Task 6: Hero Component

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Create Hero.astro**

```astro
---
interface Props {
  title: string;
  subtitle?: string;
}

const { title, subtitle = 'Technical thoughts and learning' } = Astro.props;
---

<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <h1 class="hero-title">{title}</h1>
    <p class="hero-subtitle">{subtitle}</p>
  </div>
</section>

<style>
.hero {
  position: relative;
  padding: var(--space-3xl) var(--space-lg);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: 60px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: var(--gradient);
  opacity: 0.1;
}

.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  filter: blur(40px);
  transform: scale(1.1);
}

.hero-content {
  position: relative;
  text-align: center;
  z-index: 1;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 500px;
  margin: 0 auto;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: add Hero component with gradient"
```

---

## Task 7: Article Card Component

**Files:**
- Create: `src/components/ArticleCard.astro`

- [ ] **Step 1: Create ArticleCard.astro**

```astro
---
interface Props {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  tags?: string[];
}

const { title, excerpt, slug, date, tags = [] } = Astro.props;

const formattedDate = new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
---

<article class="card">
  <a href={`/articles/${slug}`} class="card-link">
    <div class="card-gradient"></div>
    <div class="card-content">
      <h2 class="card-title">{title}</h2>
      <p class="card-excerpt">{excerpt}</p>
      <div class="card-meta">
        <time datetime={date}>{formattedDate}</time>
        {tags.length > 0 && (
          <div class="card-tags">
            {tags.slice(0, 3).map(tag => (
              <span class="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  </a>
</article>

<style>
.card {
  position: relative;
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-gradient {
  height: 4px;
  background: var(--gradient);
}

.card-content {
  padding: var(--space-lg);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card:hover .card-title {
  color: var(--accent);
}

.card-excerpt {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--space-md);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.card-tags {
  display: flex;
  gap: var(--space-xs);
}

.tag {
  background: var(--bg-primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.card:hover .tag {
  background: rgba(0, 97, 255, 0.1);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ArticleCard.astro
git commit -m "feat: add ArticleCard component with hover effects"
```

---

## Task 8: Content Collection Setup

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/articles/hello-world.md` (sample article)

- [ ] **Step 1: Create content config.ts**

```typescript
import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  articles,
};
```

- [ ] **Step 2: Create sample article hello-world.md**

```markdown
---
title: "Getting Started with Astro"
description: "A quick introduction to building fast websites with Astro"
date: 2026-04-18
tags: ["astro", "web-dev", "tutorial"]
---

# Getting Started with Astro

Astro is an amazing framework for building content-focused websites. Here's why...

## Why Astro?

1. **Performance** - Zero JavaScript by default
2. **Content-Focused** - Built-in Markdown support
3. **Component-Based** - Use your favorite framework

## Getting Started

```bash
npm create astro@latest
```

Happy coding!
```

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts src/content/articles/hello-world.md
git commit -m "feat: add content collection config and sample article"
```

---

## Task 9: Homepage

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create homepage**

```astro
---
import BaseLayout from '../components/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import ArticleCard from '../components/ArticleCard.astro';
import { getCollection } from 'astro:content';

const articles = await getCollection('articles', ({ data }) => !data.draft);
const sortedArticles = articles.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---

<BaseLayout title="Home">
  <Hero title="My Blog" subtitle="Technical thoughts and learning" />
  <section class="articles-section">
    <div class="articles-grid">
      {sortedArticles.map(article => (
        <ArticleCard
          title={article.data.title}
          excerpt={article.data.description}
          slug={article.slug}
          date={article.data.date.toISOString()}
          tags={article.data.tags}
        />
      ))}
    </div>
    {sortedArticles.length === 0 && (
      <p class="empty-state">No articles yet. Check back soon!</p>
    )}
  </section>
</BaseLayout>

<style>
.articles-section {
  max-width: var(--max-width-listing);
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--space-3xl);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: create homepage with article grid"
```

---

## Task 10: Article Detail Page

**Files:**
- Create: `src/pages/articles/[...slug].astro`

- [ ] **Step 1: Create article detail page**

```astro
---
import BaseLayout from '../../components/BaseLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map(article => ({
    params: { slug: article.slug },
    props: { article },
  }));
}

const { article } = Astro.props;
const { Content } = await article.render();

const formattedDate = article.data.date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
---

<BaseLayout title={article.data.title} description={article.data.description}>
  <article class="article">
    <header class="article-header">
      <a href="/" class="back-link">&larr; Back to Home</a>
      <h1 class="article-title">{article.data.title}</h1>
      <div class="article-meta">
        <time datetime={article.data.date.toISOString()}>{formattedDate}</time>
        {article.data.tags.length > 0 && (
          <div class="article-tags">
            {article.data.tags.map(tag => (
              <span class="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </header>
    <div class="article-content">
      <Content />
    </div>
  </article>
</BaseLayout>

<style>
.article {
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: var(--space-3xl) var(--space-lg);
}

.article-header {
  margin-bottom: var(--space-2xl);
}

.back-link {
  display: inline-block;
  margin-bottom: var(--space-lg);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.back-link:hover {
  color: var(--accent);
  text-decoration: none;
}

.article-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
  line-height: 1.2;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.article-tags {
  display: flex;
  gap: var(--space-xs);
}

.tag {
  background: rgba(0, 97, 255, 0.1);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.article-content {
  line-height: 1.75;
}

.article-content :global(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: var(--space-2xl) 0 var(--space-md);
  color: var(--text-primary);
}

.article-content :global(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: var(--space-xl) 0 var(--space-sm);
  color: var(--text-primary);
}

.article-content :global(p) {
  margin-bottom: var(--space-md);
}

.article-content :global(ul),
.article-content :global(ol) {
  margin-bottom: var(--space-md);
  padding-left: var(--space-lg);
}

.article-content :global(li) {
  margin-bottom: var(--space-xs);
}

.article-content :global(blockquote) {
  border-left: 4px solid var(--accent);
  padding-left: var(--space-lg);
  margin: var(--space-lg) 0;
  color: var(--text-secondary);
  font-style: italic;
}

.article-content :global(img) {
  border-radius: 8px;
  margin: var(--space-lg) 0;
}

.article-content :global(a) {
  color: var(--accent);
  text-decoration: underline;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/articles/[...slug].astro
git commit -m "feat: create article detail page with prose styling"
```

---

## Task 11: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create GitHub Actions workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

## Task 12: GitHub Pages Configuration

**Files:**
- Create: `.nojekyll` (empty file for GitHub Pages)

- [ ] **Step 1: Create .nojekyll**

Run: `touch .nojekyll`

- [ ] **Step 2: Update .gitignore**

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# OS
.DS_Store

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
```

- [ ] **Step 3: Commit**

```bash
git add .nojekyll .gitignore
git commit -m "chore: add GitHub Pages config and update gitignore"
```

---

## Implementation Complete

**Run verification:**
```bash
npm run build
```

Expected: Build succeeds, no errors.

**Next Steps:**
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Create your first article in `src/content/articles/`

---

## Self-Review Checklist

- [ ] All components created and independently testable
- [ ] CSS variables match design spec
- [ ] Content collection schema validated
- [ ] GitHub Actions workflow complete
- [ ] No placeholders or TODOs in code
