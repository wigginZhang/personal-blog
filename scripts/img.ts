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

function copyToClipboard(text: string): void {
  execSync(`echo '${text}' | pbcopy`);
}

registerCommand('paste', 'Paste image from clipboard', async () => {
  if (!hasImageInClipboard()) {
    console.error('No image in clipboard');
    return;
  }

  const filename = await saveImageFromClipboard();
  const url = `/images/${filename}`;
  copyToClipboard(url);
  console.log(`Saved: ${filename}`);
  console.log(`URL: ${url}`);
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
