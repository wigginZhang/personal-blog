# Blog Polish CLI Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a CLI tool that polishes raw text into blog-ready Markdown articles and optionally publishes to GitHub.

**Architecture:** TypeScript CLI script using readline for input, OpenAI/Anthropic API for polishing, simple-git for GitHub publishing.

**Tech Stack:** TypeScript, Node.js, OpenAI SDK, simple-git, tsx

---

## File Structure

```
~/projects/personal-blog/
├── scripts/
│   └── polish-article.ts    # Main CLI tool
├── src/
│   └── content/
│       └── articles/        # Generated articles
├── package.json             # Add dependencies + npm script
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install required packages**

Run: `npm install openai simple-git`

- [ ] **Step 2: Add npm script to package.json**

Modify `package.json` to add:

```json
{
  "scripts": {
    "polish": "tsx scripts/polish-article.ts"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add polish CLI dependencies (openai, simple-git)"
```

---

## Task 2: Create CLI Tool Skeleton

**Files:**
- Create: `scripts/polish-article.ts`

- [ ] **Step 1: Create scripts directory and polish-article.ts**

```typescript
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
```

- [ ] **Step 2: Test skeleton runs**

Run: `npm run polish`
Type some text, press Enter twice.
Expected: Shows "Input received" with line count.

- [ ] **Step 3: Commit**

```bash
git add scripts/polish-article.ts
git commit -m "feat: create polish CLI skeleton with text input"
```

---

## Task 3: Implement AI Polishing

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: Add API call function**

Replace the main function with:

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function polishText(rawText: string): Promise<string> {
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

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000,
  });

  return response.choices[0]?.message?.content ?? '';
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
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not set');
      }

      const polished = await polishText(rawText);
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
```

- [ ] **Step 2: Test with actual API call**

Run: `OPENAI_API_KEY=sk-xxx npm run polish`
Paste some test text.
Expected: Returns polished Markdown with filename.

- [ ] **Step 3: Commit**

```bash
git add scripts/polish-article.ts
git commit -m "feat: add AI polishing with OpenAI API"
```

---

## Task 4: Interactive Review

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: Add interactive review function**

Add this function before `main()`:

```typescript
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
```

- [ ] **Step 2: Modify main to use review loop**

Replace the TODO section with:

```typescript
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

        const rePolished = await polishText(`${rawText}\n\n${rePolishPrompt}`);
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

      // User accepted
      console.log('\n✅ Article accepted!');
      console.log(`Filename: ${currentFilename}`);
      console.log('\n📁 Ready to save.');

      // TODO: Add file save (Task 5)
```

- [ ] **Step 3: Test review flow**

Run: `OPENAI_API_KEY=sk-xxx npm run polish`
Test choosing 'm' for modify, then 'y' to accept.

- [ ] **Step 4: Commit**

```bash
git add scripts/polish-article.ts
git commit -m "feat: add interactive review loop (accept/modify/cancel)"
```

---

## Task 5: File Generation

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: Add file generation function**

Add before `main()`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function saveArticle(filename: string, content: string): string {
  const articlesDir = path.join(process.cwd(), 'src', 'content', 'articles');
  const fullFilename = `${filename}.md`;
  const filePath = path.join(articlesDir, fullFilename);

  // Extract title from content (first # heading)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : filename;

  // Extract description from first paragraph
  const paragraphs = content.split('\n\n').filter(p => !p.startsWith('#') && p.trim());
  const description = paragraphs[0]?.replace(/[#*`]/g, '').substring(0, 160).trim() || '';

  const frontmatter = generateFrontmatter(title, description, new Date());
  const fullContent = frontmatter + content;

  fs.writeFileSync(filePath, fullContent, 'utf-8');

  return fullFilename;
}
```

- [ ] **Step 2: Update main to save file**

Replace the `// TODO: Add file save (Task 5)` section with:

```typescript
      // User accepted - save file
      const savedFilename = saveArticle(currentFilename, currentContent);
      console.log(`\n📁 Saved to: src/content/articles/${savedFilename}`);
```

- [ ] **Step 3: Test file saving**

Run: `OPENAI_API_KEY=sk-xxx npm run polish`
Accept the result, check that file was created in `src/content/articles/`.

- [ ] **Step 4: Commit**

```bash
git add scripts/polish-article.ts
git commit -m "feat: add file generation with frontmatter"
```

---

## Task 6: GitHub Publishing

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: Add simple-git and publishing function**

Add imports at top:

```typescript
import simpleGit, { SimpleGit } from 'simple-git';
```

Add function before `main()`:

```typescript
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
```

- [ ] **Step 2: Update main to ask about publishing**

Replace the `// TODO: Add GitHub publish step (Task 6)` section with:

```typescript
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
```

- [ ] **Step 3: Test publishing flow**

Run: `OPENAI_API_KEY=sk-xxx npm run polish`
Accept, choose 'y' for GitHub publish.
Check GitHub for new commit.

- [ ] **Step 4: Commit**

```bash
git add scripts/polish-article.ts
git commit -m "feat: add GitHub publishing with git add/commit/push"
```

---

## Task 7: Add Environment Variable Check

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: Add early check for API key**

Add at the start of `main()` after the console.log:

```typescript
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('\n❌ Error: OPENAI_API_KEY environment variable not set\n');
    console.log('Set it with:');
    console.log('  export OPENAI_API_KEY=sk-your-key\n');
    console.log('Or run with:');
    console.log('  OPENAI_API_KEY=sk-your-key npm run polish\n');
    process.exit(1);
  }
```

- [ ] **Step 2: Remove duplicate check in the close handler**

Remove the `const apiKey = process.env.OPENAI_API_KEY; if (!apiKey)...` check inside the `rl.on('close', ...)` handler since we now check at the start.

- [ ] **Step 3: Commit**

```bash
git add scripts/polish-article.ts
git commit -m "feat: add early API key validation"
```

---

## Task 8: Add Shebang and Permissions

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: Ensure shebang is at top**

Verify the file starts with:

```typescript
#!/usr/bin/env node
```

If not, add it as the very first line.

- [ ] **Step 2: Make executable**

Run: `chmod +x scripts/polish-article.ts`

- [ ] **Step 3: Commit**

```bash
git add scripts/polish-article.ts
git commit -m "chore: add shebang and make script executable"
```

---

## Implementation Complete

**Run verification:**

```bash
# Check all files exist
ls -la scripts/
ls -la src/content/articles/

# Test help
npm run polish -- --help 2>&1 || echo "No --help flag (expected)"

# Test with dry run (just check it starts)
echo "" | timeout 5 npm run polish 2>&1 || true
```

**Expected result:** Script starts, shows error about missing API key (or waits for input if key is set).

---

## Final Commit

```bash
git add -A
git commit -m "feat: complete blog polish CLI tool"
git push
```

---

## Usage Summary

```bash
cd ~/projects/personal-blog

# Set API key
export OPENAI_API_KEY=sk-xxx

# Run
npm run polish

# Or inline
OPENAI_API_KEY=sk-xxx npm run polish
```

---

## Self-Review Checklist

- [ ] CLI accepts multi-line text input
- [ ] AI polishing produces Markdown output
- [ ] Parse extracts filename and content correctly
- [ ] Interactive review loop works (accept/modify/cancel)
- [ ] Modification instructions are sent back to LLM
- [ ] File saved with correct frontmatter
- [ ] GitHub publishing works (add/commit/push)
- [ ] Error handling for missing API key
- [ ] No placeholders or TODOs in code
