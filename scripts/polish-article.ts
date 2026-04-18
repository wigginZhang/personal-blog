#!/usr/bin/env node

import * as readline from 'readline';

async function main() {
  console.log('=== Blog Article Polisher ===\n');

  // Text input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const lines: string[] = [];
  let inputDone = false;

  rl.on('line', (line) => {
    if (line.trim() === '') {
      inputDone = true;
      rl.close();
    } else {
      lines.push(line);
    }
  });

  rl.on('close', () => {
    const rawText = lines.join('\n');
    console.log('\n--- Input received ---');
    console.log(`(${lines.length} lines)`);
    console.log('\nFirst 100 chars:', rawText.substring(0, 100));
  });
}

main().catch(console.error);