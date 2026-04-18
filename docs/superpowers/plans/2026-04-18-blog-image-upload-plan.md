# 博客图片上传实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现博客图片上传功能，支持润色时粘贴图片和保存后追加图片

**Architecture:**
- 统一图片工具 `img.ts`，支持 paste/add/list/rm 子命令
- 润色脚本 `polish-article.ts` 集成剪贴板图片检测
- 图片存储在 `public/images/`，时间戳命名
- 使用 macOS 原生工具（osascript、pbcopy）处理剪贴板

**Tech Stack:** TypeScript, Node.js, simple-git, osascript, pbcopy

---

## 文件结构

```
personal-blog/
├── scripts/
│   ├── img.ts                    # 图片工具主文件
│   └── polish-article.ts         # 修改：集成图片功能
├── public/
│   └── images/                   # 图片存储目录（自动创建）
├── package.json                  # 修改：添加 img 命令
└── docs/superpowers/plans/       # 本计划
```

---

## Task 1: 创建 img.ts 基础结构和 paste 功能

**Files:**
- Create: `scripts/img.ts`

- [ ] **Step 1: 创建 img.ts 基础结构**

```typescript
#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

interface ImageCommand {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<void>;
}

const commands: ImageCommand[] = [];

function registerCommand(name: string, description: string, execute: (args: string[]) => Promise<void>) {
  commands.push({ name, description, execute });
}

async function main() {
  const args = process.argv.slice(2);
  const commandName = args[0] || 'help';

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const command = commands.find(c => c.name === commandName);
  if (!command) {
    console.log('Available commands:');
    commands.forEach(c => {
      console.log(`  img ${c.name} - ${c.description}`);
    });
    return;
  }

  try {
    await command.execute(args.slice(1));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().catch(console.error);
```

- [ ] **Step 2: 添加剪贴板检测函数**

```typescript
function hasImageInClipboard(): boolean {
  try {
    const result = execSync('osascript -e "try" -e "clipboard info" -e "end try"', { encoding: 'utf-8' });
    return result.includes('PNG') || result.includes('TIFF');
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: 添加保存图片函数**

```typescript
function generateImageFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 15);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.png`;
}

async function saveImageFromClipboard(): Promise<string> {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const filename = generateImageFilename();
  const filepath = path.join(IMAGES_DIR, filename);

  const script = `
    set thePath to (POSIX file "${filepath}") as text
    try
      do shell script "pngpaste " & thePath
    on error
      do shell script "osascript -e 'set the clipboard to (read (POSIX file \\"${filepath}\\") as PNG)'"
    end try
  `;

  execSync(`osascript -e '${script}'`);

  return filename;
}
```

- [ ] **Step 4: 添加复制链接函数**

```typescript
function copyToClipboard(text: string): void {
  execSync(`echo '${text}' | pbcopy`);
}
```

- [ ] **Step 5: 添加 list 命令**

```typescript
registerCommand('list', 'List all images', async () => {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('No images yet.');
    return;
  }

  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('No images yet.');
    return;
  }

  console.log(`Found ${files.length} image(s):\n`);
  files.forEach((file, i) => {
    const filepath = path.join(IMAGES_DIR, file);
    const stats = fs.statSync(filepath);
    const date = stats.mtime.toISOString().slice(0, 16);
    console.log(`  ${i + 1}. ${file} (${date})`);
  });
});
```

- [ ] **Step 6: 添加 rm 命令**

```typescript
registerCommand('rm', 'Remove an image', async (args) => {
  const filename = args[0];
  if (!filename) {
    console.error('Usage: img rm <filename>');
    return;
  }

  const filepath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`Image not found: ${filename}`);
    return;
  }

  fs.unlinkSync(filepath);
  console.log(`Removed: ${filename}`);
});
```

- [ ] **Step 7: 提交**

```bash
cd ~/projects/personal-blog
git add scripts/img.ts
git commit -m "feat(img): create img.ts with paste/list/rm commands"
```

---

## Task 2: 实现 paste 功能

**Files:**
- Modify: `scripts/img.ts`

- [ ] **Step 1: 添加 paste 命令注册和实现**

```typescript
registerCommand('paste', 'Paste image from clipboard and copy link', async (args) => {
  const customPath = args[0];

  if (!hasImageInClipboard()) {
    console.log('No image in clipboard.');
    return;
  }

  const filename = await saveImageFromClipboard();
  const relativePath = customPath || `./images/${filename}`;
  const markdown = `![image](${relativePath})`;

  copyToClipboard(markdown);

  console.log(`📷 Saved: public/images/${filename}`);
  console.log(`🔗 Copied: ${markdown}`);
});
```

- [ ] **Step 2: 测试 paste 功能**

```bash
# 复制一张图片到剪贴板，然后运行
cd ~/projects/personal-blog
npx tsx scripts/img.ts paste

# 预期输出：
# 📷 Saved: public/images/2026-04-18-143052-abc123.png
# 🔗 Copied: ![image](./images/2026-04-18-143052-abc123.png)
```

- [ ] **Step 3: 提交**

```bash
git add scripts/img.ts
git commit -m "feat(img): implement paste command with clipboard support"
```

---

## Task 3: 实现 add 命令（添加到已有文章）

**Files:**
- Modify: `scripts/img.ts`

- [ ] **Step 1: 添加文章列表函数**

```typescript
function getArticleFiles(): { slug: string; filepath: string }[] {
  const articlesDir = path.join(process.cwd(), 'src', 'content', 'articles');
  if (!fs.existsSync(articlesDir)) {
    return [];
  }

  return fs.readdirSync(articlesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      slug: f.replace('.md', ''),
      filepath: path.join(articlesDir, f)
    }));
}
```

- [ ] **Step 2: 添加插入图片到文章的函数**

```typescript
function insertImageToArticle(filepath: string, imageFilename: string): void {
  const content = fs.readFileSync(filepath, 'utf-8');
  const imagePath = `./images/${imageFilename}`;
  const markdownImage = `![image](${imagePath})`;

  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const matches = [...content.matchAll(imageRegex)];

  let newContent: string;
  if (matches.length === 0) {
    // 没有图片链接，追加到末尾
    newContent = content.trim() + '\n\n' + markdownImage + '\n';
  } else {
    // 有图片链接，插入到最后一个图片链接后面
    const lastMatch = matches[matches.length - 1];
    const lastIndex = content.lastIndexOf(lastMatch[0]) + lastMatch[0].length;
    newContent = content.slice(0, lastIndex) + '\n' + markdownImage + content.slice(lastIndex);
  }

  fs.writeFileSync(filepath, newContent, 'utf-8');
}
```

- [ ] **Step 3: 添加 add 命令实现**

```typescript
registerCommand('add', 'Add image to existing article', async (args) => {
  const targetSlug = args[0];

  if (!hasImageInClipboard()) {
    console.log('📷 No image in clipboard. Paste an image first.');
    return;
  }

  const articles = getArticleFiles();
  if (articles.length === 0) {
    console.log('No articles found.');
    return;
  }

  let targetFile: string;

  if (targetSlug) {
    // 直接指定文章
    const article = articles.find(a => a.slug === targetSlug);
    if (!article) {
      console.error(`Article not found: ${targetSlug}`);
      return;
    }
    targetFile = article.filepath;
    console.log(`📚 Adding to: ${targetSlug}`);
  } else {
    // 交互式选择
    console.log('📚 选择文章：\n');
    articles.forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.slug}`);
    });
    console.log('\n(Interactive selection not implemented yet - use: img add <slug>)');
    return;
  }

  const filename = await saveImageFromClipboard();
  insertImageToArticle(targetFile, filename);

  const imagePath = `./images/${filename}`;
  const markdown = `![image](${imagePath})`;
  copyToClipboard(markdown);

  console.log(`📷 Saved: public/images/${filename}`);
  console.log(`🔗 Inserted into article`);
  console.log(`🔗 Copied: ${markdown}`);
});
```

- [ ] **Step 4: 提交**

```bash
git add scripts/img.ts
git commit -m "feat(img): implement add command for existing articles"
```

---

## Task 4: 集成到 polish-article.ts

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: 添加图片处理相关函数（在文件顶部）**

```typescript
// === 图片处理函数 ===
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

function ensureImagesDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

function hasImageInClipboard(): boolean {
  try {
    const result = execSync('osascript -e "try" -e "clipboard info" -e "end try"', { encoding: 'utf-8' });
    return result.includes('PNG') || result.includes('TIFF');
  } catch {
    return false;
  }
}

function generateImageFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 15);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.png`;
}

async function saveImageFromClipboard(): Promise<string> {
  ensureImagesDir();
  const filename = generateImageFilename();
  const filepath = path.join(IMAGES_DIR, filename);
  execSync(`osascript -e 'do shell script "pngpaste " & (POSIX file "${filepath}") as text'`);
  return filename;
}

function copyToClipboard(text: string): void {
  execSync(`printf '%s' "${text}" | pbcopy`);
}

function replaceImageMarkers(content: string, imageFilenames: string[]): { content: string; imagesUsed: number } {
  let imagesUsed = 0;
  let result = content;

  // 按顺序替换  需要图1、 需要图2 等标记
  imageFilenames.forEach((filename, index) => {
    const marker = `需要图${index + 1}`;
    const imageMarkdown = `![image](./images/${filename})`;

    if (result.includes(marker)) {
      result = result.replace(marker, imageMarkdown);
      imagesUsed++;
    }
  });

  // 处理无序的"需要图"标记（如果上面没替换完）
  if (imagesUsed < imageFilenames.length) {
    const remaining = imageFilenames.slice(imagesUsed);
    remaining.forEach(filename => {
      const imageMarkdown = `![image](./images/${filename})`;
      result = result.replace(/需要图/, imageMarkdown);
      imagesUsed++;
    });
  }

  return { content: result, imagesUsed };
}

function appendImagesToEnd(content: string, imageFilenames: string[]): string {
  if (imageFilenames.length === 0) return content;

  const imagesMarkdown = imageFilenames
    .map(f => `![image](./images/${f})`)
    .join('\n');

  return content.trim() + '\n\n' + imagesMarkdown + '\n';
}

function processContentWithImages(
  rawText: string,
  polishedContent: string,
  imageFilenames: string[]
): { finalContent: string; imagesUsed: number } {
  if (imageFilenames.length === 0) {
    return { finalContent: polishedContent, imagesUsed: 0 };
  }

  // 检查原文是否包含标记
  const hasMarkers = /需要图\d/.test(rawText);

  if (hasMarkers) {
    const { content, imagesUsed } = replaceImageMarkers(polishedContent, imageFilenames);
    return { finalContent: content, imagesUsed };
  } else {
    // 无标记，追加到末尾
    const finalContent = appendImagesToEnd(polishedContent, imageFilenames);
    return { finalContent, imagesUsed: imageFilenames.length };
  }
}
```

- [ ] **Step 2: 修改 main 函数中的润色流程**

找到 main 函数中 `polished` 获取后的处理逻辑，修改为：

```typescript
// 在 try 块内，获取 polished 后：
const polished = await polishText(rawText, apiKey);
const { filename, content: polishedContent } = parsePolishedOutput(polished);

// 检测剪贴板图片
const clipboardHasImage = hasImageInClipboard();
const imageFilenames: string[] = [];

if (clipboardHasImage) {
  console.log('\n📷 检测到剪贴板有图片，正在保存...');
  // 支持多张图片：循环检测并保存（这里先实现单张）
  const imgFilename = await saveImageFromClipboard();
  imageFilenames.push(imgFilename);
}

// 处理图片插入
const { finalContent, imagesUsed } = processContentWithImages(
  rawText,
  polishedContent,
  imageFilenames
);

// 更新显示和后续使用的 content
const content = finalContent;
```

- [ ] **Step 3: 在显示润色结果后添加图片信息**

找到 `console.log(content);` 后面，添加：

```typescript
console.log(content);

if (imagesUsed > 0) {
  console.log('\n📷 检测到' + imagesUsed + '张图片，已保存到 public/images/');
  // 复制第一张图片链接到剪贴板（如果有）
  if (imageFilenames.length > 0) {
    const link = `![image](./images/${imageFilenames[0]})`;
    copyToClipboard(link);
    console.log('🔗 已复制图片链接到剪贴板');
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add scripts/polish-article.ts
git commit -m "feat(polish): integrate clipboard image paste support"
```

---

## Task 5: 添加 npm script 支持

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 添加 img 命令**

```json
{
  "scripts": {
    "polish": "npx tsx scripts/polish-article.ts",
    "img": "npx tsx scripts/img.ts",
    "img:add": "npx tsx scripts/img.ts add",
    "img:list": "npx tsx scripts/img.ts list",
    "img:paste": "npx tsx scripts/img.ts paste"
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add package.json
git commit -m "feat: add npm scripts for img command"
```

---

## Task 6: 测试完整流程

- [ ] **Step 1: 测试场景1 - 润色时粘贴图片**

```bash
# 1. 复制一张图片到剪贴板
# 2. 运行润色工具
cd ~/projects/personal-blog
MINIMAX_API_KEY=your-key npm run polish

# 3. 输入测试文字（包含或不包含标记）
[旺柴]这是一个测试-需要图1-

# 4. 确认图片被保存和链接被复制
```

- [ ] **Step 2: 测试场景2 - 保存后添加图片**

```bash
# 1. 运行 img add
npm run img:add hello-world

# 2. 复制图片到剪贴板
# 3. 确认图片插入到文章
```

- [ ] **Step 3: 测试 list 和 rm**

```bash
npm run img:list
npm run img:paste
```

---

## 后续可能的优化（非必需）

1. **交互式选择文章** - 使用 readline 实现数字选择
2. **多张图片粘贴** - 循环检测剪贴板，保存多张
3. **自定义图片命名格式** - 添加配置选项
4. **图片压缩** - 添加图片压缩功能
5. **自动上传到图床** - 可选的云存储支持

---

## 验证清单

- [ ] `img paste` 保存图片到 public/images/
- [ ] `img paste` 复制 Markdown 链接到剪贴板
- [ ] `img list` 列出所有图片
- [ ] `img rm` 删除指定图片
- [ ] `img add <slug>` 添加图片到指定文章
- [ ] polish 时检测剪贴板图片并保存
- [ ] polish 时替换 `需要图1` 等标记
- [ ] polish 时无标记则追加到末尾
- [ ] polish 时复制图片链接到剪贴板
- [ ] npm script 命令正常工作
