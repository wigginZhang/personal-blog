#!/usr/bin/env node

import * as readline from 'readline';

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const MODEL_NAME = 'MiniMax-Text-01';

async function polishText(rawText: string, apiKey: string): Promise<string> {
  const prompt = `You are a blog writer. Transform the user's raw text into a polished personal blog article.

Rules:
- Write in first person, conversational tone
- Add appropriate headings to structure the content
- Use Markdown formatting (bold, italic, lists)
- Preserve any code blocks as-is
- Keep the original meaning and key points
- Add small transitions if content feels disjointed
- Remove obvious grammar mistakes but don't over-edit

User's raw text:
${rawText}

Respond with:
FILENAME: <slug>
---
<polished markdown content>`;

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

  const data = await response.json() as { choices?: Array<{ messages?: Array<{ content?: string }> }> };
  const content = data.choices?.[0]?.messages?.[0]?.content;

  if (!content) {
    throw new Error('Empty response from MiniMax API');
  }

  return content;
}

function parsePolishedOutput(output: string): { filename: string; content: string } {
  const match = output.match(/^FILENAME:\s*(.+?)\n---([\s\S]*)$/);
  if (!match) {
    throw new Error('Failed to parse LLM output');
  }
  return {
    filename: match[1].trim(),
    content: match[2].trim(),
  };
}

async function main() {
  console.log('=== Blog Article Polisher ===\n');
  console.log('Paste your raw text below.');
  console.log('Press Enter twice (empty line) when done.\n');

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
      const apiKey = process.env.MINIMAX_API_KEY;
      if (!apiKey) {
        throw new Error('MINIMAX_API_KEY environment variable not set');
      }

      const polished = await polishText(rawText, apiKey);
      const { filename, content } = parsePolishedOutput(polished);

      console.log('=== Polished Result ===\n');
      console.log(`Suggested filename: ${filename}`);
      console.log('\n--- Content ---\n');
      console.log(content);

      // TODO: Add interactive review step (Task 4)
      // TODO: Add file save step (Task 5)
      // TODO: Add GitHub publish step (Task 6)

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
}

main().catch(console.error);
