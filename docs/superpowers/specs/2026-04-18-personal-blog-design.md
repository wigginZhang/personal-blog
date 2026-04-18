# Personal Blog Design Specification

**Date:** 2026-04-18
**Project:** Personal Blog
**Purpose:** Technical Learning Blog

---

## 1. Concept & Vision

A creative, visually distinctive personal blog for sharing technical learning articles. The design emphasizes personality and visual impact while maintaining excellent readability. The blog should feel modern, dynamic, and memorable—standing out from typical developer blogs.

---

## 2. Design Language

### Aesthetic Direction
**Creative Individual** — Unique layouts with gradient accents, playful yet professional, combining card-based content presentation with focused reading experiences.

### Color Palette
- **Primary Gradient:** `#0061ff` → `#60efff` (Blue-Cyan)
- **Background Light:** `#f8fafc`
- **Background Card:** `#ffffff`
- **Text Primary:** `#1e293b`
- **Text Secondary:** `#64748b`
- **Accent:** `#0061ff`
- **Border:** `#e2e8f0`

### Typography
- **Headings:** Inter (Google Fonts), bold weight
- **Body:** Inter, regular weight
- **Code:** JetBrains Mono

### Spatial System
- Base unit: 8px
- Section padding: 64px vertical
- Card gap: 24px
- Max content width: 720px (reading), 1200px (listings)

### Motion Philosophy
- Subtle hover lifts on cards (transform + shadow)
- Smooth page transitions
- Gradient shimmer effects on featured elements

---

## 3. Layout & Structure

### Page Types

#### Homepage
1. **Hero Section**
   - Full-width gradient background (Blue-Cyan)
   - Blog title + tagline
   - Subtle animated gradient effect

2. **Featured Articles** (optional)
   - Large card with gradient border accent
   - Prominent placement

3. **Article Grid**
   - Responsive card grid (1-3 columns)
   - Cards with: title, excerpt, date, tags
   - Hover: lift effect + shadow

4. **Footer**
   - Minimal, social links

#### Article Page
1. **Navigation Bar**
   - Back button
   - Article title (on scroll)

2. **Article Header**
   - Title, date, reading time, tags
   - Gradient accent line

3. **Content Area**
   - Single column, max-width 720px
   - Generous line height (1.75)
   - Code blocks with syntax highlighting

4. **Footer**
   - Navigation to next/previous article

### Responsive Strategy
- Mobile: Single column, stacked navigation
- Tablet: 2-column grid
- Desktop: 3-column grid, optional sidebar

---

## 4. Features & Interactions

### Core Features
1. **Markdown Rendering**
   - Full Markdown support
   - GitHub Flavored Markdown
   - Syntax highlighted code blocks
   - Inline code styling

2. **Article Management**
   - Articles stored as .md files
   - Frontmatter for metadata (title, date, tags, excerpt)
   - Auto-generated table of contents

3. **Navigation**
   - Home link
   - Tag filtering
   - Search (optional enhancement)

4. **RSS Feed** (optional)
   - Auto-generated RSS

### Interaction Details
- **Card Hover:** translateY(-4px), box-shadow increase
- **Link Hover:** Gradient underline animation
- **Tag Click:** Filter articles by tag
- **Back Button:** Smooth scroll to top

### Edge Cases
- Empty state: "No articles yet" message
- 404: Custom not found page
- Long titles: Truncate with ellipsis on cards

---

## 5. Component Inventory

### NavBar
- Logo/site title (left)
- Navigation links (right)
- States: default, scrolled (shadow appears)

### Hero
- Gradient background
- Title + subtitle
- Animated gradient shimmer (CSS)

### ArticleCard
- Thumbnail image (optional) or gradient placeholder
- Title (max 2 lines)
- Excerpt (max 3 lines)
- Date + reading time
- Tags (max 3)
- States: default, hover (lifted)

### ArticleContent
- Prose styling
- Code blocks with copy button
- Blockquotes with accent border
- Images with captions

### Footer
- Social links
- Copyright
- Minimal design

---

## 6. Technical Approach

### Framework
**Astro** — Best for content-focused sites, excellent performance, built-in Markdown support.

### Project Structure
```
/
├── src/
│   ├── components/     # UI components
│   ├── layouts/       # Page layouts
│   ├── pages/         # Routes
│   ├── content/       # Markdown articles
│   └── styles/         # Global styles
├── public/            # Static assets
├── astro.config.mjs
└── package.json
```

### Key Dependencies
- Astro (framework)
- @astrojs/mdx (MDX support)
- Prism.js or Shiki (syntax highlighting)
- Tailwind CSS (optional, for styling)

### Deployment
- GitHub Pages
- GitHub Actions for CI/CD

### Modular UI Strategy
- All components in `src/components/`
- One component per file
- CSS scoped to components
- Easy to swap themes/colors

---

## 7. Implementation Phases

### Phase 1: Foundation
- Project setup (Astro)
- Basic page structure
- Global styles + CSS variables
- Navigation component

### Phase 2: Content System
- Markdown article rendering
- Frontmatter schema
- Article list page
- Article detail page

### Phase 3: Visual Design
- Hero section with gradient
- Article cards with hover effects
- Typography + prose styles
- Code highlighting

### Phase 4: Enhancements
- Tag filtering
- Search (optional)
- RSS feed (optional)
- SEO optimization

### Phase 5: Deployment
- GitHub Pages setup
- CI/CD pipeline
- Custom domain (optional)

---

## Status
**Waiting for user review before implementation.**
