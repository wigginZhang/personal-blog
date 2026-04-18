#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';
import simpleGit from 'simple-git';
import type { SimpleGit } from 'simple-git';

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

  imageFilenames.forEach((filename, index) => {
    const marker = `需要图${index + 1}`;
    const imageMarkdown = `![image](./images/${filename})`;

    if (result.includes(marker)) {
      result = result.replace(marker, imageMarkdown);
      imagesUsed++;
    }
  });

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

  const hasMarkers = /需要图\d/.test(rawText);

  if (hasMarkers) {
    const { content, imagesUsed } = replaceImageMarkers(polishedContent, imageFilenames);
    return { finalContent: content, imagesUsed };
  } else {
    const finalContent = appendImagesToEnd(polishedContent, imageFilenames);
    return { finalContent, imagesUsed: imageFilenames.length };
  }
}

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const MODEL_NAME = 'MiniMax-Text-01';

async function polishText(rawText: string, apiKey: string): Promise<string> {
  const prompt = `你是一位博客写手。将用户的中文原始文本润色成一篇精美的博客文章。

规则：
- 使用第一人称，对话式风格
- 添加适当的标题来组织内容结构
- 使用 Markdown 格式（粗体、斜体、列表）
- 保留代码块原样
- 保持原意和核心观点
- 添加过渡句让内容更连贯
- 修正明显的语法错误但不要过度修改
- 重要：文章必须保持中文输出

用户原始文本：
${rawText}

请用以下格式回复：
FILENAME: <slug>
---
<润色后的中文 Markdown 内容>`;

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiniMax API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from MiniMax API');
  }

  return content;
}

function parsePolishedOutput(output: string): { filename: string; content: string } {
  const match = output.match(/^FILENAME:\s*(.+?)\n+---([\s\S]*)$/);
  if (!match) {
    throw new Error('Failed to parse LLM output');
  }
  return {
    filename: match[1].trim(),
    content: match[2].trim(),
  };
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

async function getUserChoice(): Promise<'accept' | 'modify' | 'cancel'> {
  const choice = await askQuestion('Accept this? (y)es / (m)odify / (n)o: ');

  if (choice === 'y' || choice === 'yes' || choice === '') {
    return 'accept';
  } else if (choice === 'm' || choice === 'modify') {
    return 'modify';
  } else {
    return 'cancel';
  }
}

async function getModificationInstructions(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\nEnter your modification instructions: ', (instructions) => {
      rl.close();
      resolve(instructions);
    });
  });
}

function generateFrontmatter(title: string, description: string, date: Date): string {
  const dateStr = date.toISOString().split('T')[0];
  return `---
title: "${title}"
description: "${description}"
date: ${dateStr}
tags: []
---

`;
}

function saveArticle(filename: string, content: string): string {
  const articlesDir = path.join(process.cwd(), 'src', 'content', 'articles');

  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  const fullFilename = `${filename}.md`;
  const filePath = path.join(articlesDir, fullFilename);

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : filename;

  const paragraphs = content.split('\n\n').filter(p => !p.startsWith('#') && p.trim());
  const description = paragraphs[0]?.replace(/[#*`]/g, '').substring(0, 160).trim() || '';

  const frontmatter = generateFrontmatter(title, description, new Date());
  const fullContent = frontmatter + content;

  fs.writeFileSync(filePath, fullContent, 'utf-8');

  return fullFilename;
}

async function publishToGitHub(filename: string): Promise<void> {
  const git: SimpleGit = simpleGit();

  console.log('\n🚀 Publishing to GitHub...\n');

  // Git add
  await git.add(`src/content/articles/${filename}`);

  // Git commit
  await git.commit(`docs: add article - ${filename.replace('.md', '')}`);

  // Git push
  await git.push();

  console.log('✅ Published successfully!');
  console.log('\n🔗 View your article at:');
  console.log('https://wigginzhang.github.io/personal-blog/');
}

async function main() {
  console.log('=== Blog Article Polisher ===\n');
  console.log('Paste your raw text below.');
  console.log('Press Enter twice (empty line) when done.\n');

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.error('\n❌ Error: MINIMAX_API_KEY environment variable not set\n');
    console.log('Set it with:');
    console.log('  export MINIMAX_API_KEY=your-key\n');
    console.log('Or run with:');
    console.log('  MINIMAX_API_KEY=your-key npm run polish\n');
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const lines: string[] = [];
  let inputDone = false;

  rl.on('line', (line) => {
    if (inputDone) return;
    if (line.trim() === '') {
      inputDone = true;
      rl.close();
    } else {
      lines.push(line);
    }
  });

  rl.on('close', async () => {
    const rawText = lines.join('\n');

    if (!rawText.trim()) {
      console.log('No text provided. Exiting.');
      process.exit(0);
    }

    console.log('\n✍️  Polishing with AI...\n');

    try {
      const polished = await polishText(rawText, apiKey);
      const { filename, content } = parsePolishedOutput(polished);

      const clipboardHasImage = hasImageInClipboard();
      const imageFilenames: string[] = [];

      if (clipboardHasImage) {
        console.log('\n📷 检测到剪贴板有图片，正在保存...');
        const imgFilename = await saveImageFromClipboard();
        imageFilenames.push(imgFilename);
      }

      const { finalContent, imagesUsed } = processContentWithImages(
        rawText,
        content,
        imageFilenames
      );

      console.log('=== Polished Result ===\n');
      console.log(`Suggested filename: ${filename}`);
      console.log('\n--- Content ---\n');
      console.log(finalContent);

      if (imagesUsed > 0) {
        console.log('\n📷 检测到' + imagesUsed + '张图片，已保存到 public/images/');
        if (imageFilenames.length > 0) {
          const link = `![image](./images/${imageFilenames[0]})`;
          copyToClipboard(link);
          console.log('🔗 已复制图片链接到剪贴板');
        }
      }

      let currentContent = content;
      let currentFilename = filename;
      let choice = await getUserChoice();

      while (choice === 'modify') {
        console.log('\n✍️  Re-polishing with your instructions...\n');

        const instructions = await getModificationInstructions();
        const rePolishPrompt = `Previous version:
${currentContent}

User's modification instructions: ${instructions}

Please apply these modifications to the article while keeping the same FILENAME format.`;

        const rePolished = await polishText(`${rawText}\n\n${rePolishPrompt}`, apiKey);
        const parsed = parsePolishedOutput(rePolished);
        currentFilename = parsed.filename;
        currentContent = parsed.content;

        console.log('=== Modified Result ===\n');
        console.log(`Filename: ${currentFilename}`);
        console.log('\n--- Content ---\n');
        console.log(currentContent);

        choice = await getUserChoice();
      }

      if (choice === 'cancel') {
        console.log('\nCancelled. Exiting.');
        process.exit(0);
      }

      // User accepted - save file
      const savedFilename = saveArticle(currentFilename, currentContent);
      console.log(`\n📁 Saved to: src/content/articles/${savedFilename}`);

      // Ask about publishing
      const publishChoice = await askQuestion('\n🚀 Publish to GitHub? (y/n): ');

      if (publishChoice === 'y' || publishChoice === 'yes') {
        try {
          await publishToGitHub(savedFilename);
        } catch (error) {
          console.error('\n❌ Failed to publish:', error instanceof Error ? error.message : error);
          console.log('File is saved locally. You can push manually.');
        }
      } else {
        console.log('\n📝 File saved locally. Run "git push" when ready.');
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
}

main().catch(console.error);
