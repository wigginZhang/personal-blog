#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
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
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const filename = generateImageFilename();
  const filepath = path.join(IMAGES_DIR, filename);

  // Simply use pngpaste directly - it's installed and working
  execSync(`pngpaste "${filepath}"`);

  return filename;
}

function copyToClipboard(text: string): void {
  execSync(`echo '${text}' | pbcopy`);
}

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

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

function insertImageToArticle(filepath: string, imageFilename: string): void {
  const content = fs.readFileSync(filepath, 'utf-8');
  const imagePath = `/personal-blog/images/${imageFilename}`;
  const markdownImage = `![image](${imagePath})`;

  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const matches = Array.from(content.matchAll(imageRegex));

  let newContent: string;
  if (matches.length === 0) {
    newContent = content.trim() + '\n\n' + markdownImage + '\n';
  } else {
    const lastMatch = matches[matches.length - 1];
    const lastIndex = content.lastIndexOf(lastMatch[0]) + lastMatch[0].length;
    newContent = content.slice(0, lastIndex) + '\n' + markdownImage + content.slice(lastIndex);
  }

  fs.writeFileSync(filepath, newContent, 'utf-8');
}

registerCommand('paste', 'Paste image from clipboard and copy link', async (args) => {
  const customPath = args[0];

  if (!hasImageInClipboard()) {
    console.log('No image in clipboard.');
    return;
  }

  const filename = await saveImageFromClipboard();
  const relativePath = customPath || `/personal-blog/images/${filename}`;
  const markdown = `![image](${relativePath})`;

  copyToClipboard(markdown);

  console.log(`📷 Saved: public/images/${filename}`);
  console.log(`🔗 Copied: ${markdown}`);
});

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

registerCommand('add', 'Add image to existing article', async (args) => {
  const targetSlug = args[0];

  const articles = getArticleFiles();
  if (articles.length === 0) {
    console.log('No articles found.');
    return;
  }

  let targetFile: string;

  if (targetSlug) {
    const article = articles.find(a => a.slug === targetSlug);
    if (!article) {
      console.error(`Article not found: ${targetSlug}`);
      return;
    }
    targetFile = article.filepath;
    console.log(`📚 Adding to: ${targetSlug}`);
  } else {
    console.log('📚 选择文章：\n');
    articles.forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.slug}`);
    });
    console.log('\n(Interactive selection not implemented yet - use: img add <slug>)');
    return;
  }

  // Multi-image support: auto-detect and upload all images from clipboard
  console.log('📷 请 paste 图片（自动检测并上传），完成后输入 "done"\n');
  let imageIndex = 0;

  while (true) {
    if (!hasImageInClipboard()) {
      const answer = await askQuestion('> paste 图片 (或输入 "done" 结束): ');
      if (answer.toLowerCase() === 'done') break;
      console.log('  ⚠️ 剪贴板无图片，请先复制图片');
      continue;
    }

    const filename = await saveImageFromClipboard();
    insertImageToArticle(targetFile, filename);
    imageIndex++;

    const imagePath = `/personal-blog/images/${filename}`;
    const markdown = `![image](${imagePath})`;
    copyToClipboard(markdown);

    console.log(`  ✅ 第 ${imageIndex} 张已保存: ${filename}`);
  }

  if (imageIndex > 0) {
    console.log(`\n🔗 已插入 ${imageIndex} 张图片到文章`);
  } else {
    console.log('\n📷 未上传任何图片');
  }
});

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
