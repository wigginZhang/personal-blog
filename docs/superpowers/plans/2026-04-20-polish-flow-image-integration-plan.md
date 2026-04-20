# 博客发布流程优化 - 图片粘贴集成

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 polish-article.ts 润色流程中集成图片粘贴功能，使用【图】作为占位符

**Architecture:**
- 修改 `polish-article.ts`，在润色后、确认前插入图片粘贴交互
- 使用【图】作为占位符，自动按顺序替换
- 复用已有的 `saveImageFromClipboard` 和 `copyToClipboard` 函数

**Tech Stack:** TypeScript, Node.js, readline, pngpaste

---

## 文件结构

```
scripts/
└── polish-article.ts   # 修改：添加图片粘贴交互流程
```

---

## Task 1: 分析当前 polish-article.ts 结构

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: 阅读当前 polish-article.ts 代码，找到关键位置**

运行：`head -100 scripts/polish-article.ts`

关注：
- 润色完成后显示结果的代码位置
- `getUserChoice` 函数位置
- `saveArticle` 函数位置

- [ ] **Step 2: 提交（无需）**

这是调研步骤，直接进入下一步。

---

## Task 2: 添加图片粘贴交互函数

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: 在文件顶部添加新函数（在 ensureImagesDir 函数后）**

```typescript
async function pasteImagesInteractive(content: string): Promise<{ content: string; imagesUsed: number }> {
  const marker = '【图】';
  const markerCount = (content.match(/【图】/g) || []).length;

  if (markerCount === 0) {
    console.log('\n📷 文章中无【图】标记，如需插入图片请手动添加');
    return { content, imagesUsed: 0 };
  }

  console.log(`\n📷 检测到 ${markerCount} 个【图】标记`);
  console.log('请依次 paste 图片（自动按顺序替换【图】），完成后输入 "done"\n');

  let imageIndex = 0;
  let currentContent = content;

  while (true) {
    const answer = await askQuestion('> paste 图片 (或输入 "done" 结束): ');

    if (answer.toLowerCase() === 'done') {
      break;
    }

    if (!hasImageInClipboard()) {
      console.log('  ⚠️ 剪贴板无图片，请先复制图片');
      continue;
    }

    // 找到下一个未替换的【图】
    const nextMarkerIndex = currentContent.indexOf(marker);
    if (nextMarkerIndex === -1) {
      console.log('  ⚠️ 所有【图】已替换完毕');
      break;
    }

    // 保存图片
    const filename = await saveImageFromClipboard();
    const imageMarkdown = `![image](/personal-blog/images/${filename})`;

    // 替换第一个【图】
    currentContent = currentContent.replace(marker, imageMarkdown);
    imageIndex++;

    // 复制链接
    copyToClipboard(imageMarkdown);
    console.log(`  ✅ 第 ${imageIndex} 张已插入: ${filename}`);
  }

  // 清理未替换的【图】
  if (currentContent.includes(marker)) {
    console.log('\n⚠️ 还有未替换的【图】，已移除');
    currentContent = currentContent.replace(/【图】/g, '');
  }

  return { content: currentContent, imagesUsed: imageIndex };
}
```

- [ ] **Step 2: 在 getUserChoice 函数后添加 askForImages 函数**

```typescript
async function askForImages(content: string): Promise<string> {
  const hasMarkers = content.includes('【图】');

  if (!hasMarkers) {
    return content;
  }

  const markerCount = (content.match(/【图】/g) || []).length;
  console.log(`\n📷 检测到 ${markerCount} 个【图】标记`);

  const answer = await askQuestion('是否粘贴图片？(y/n): ');

  if (answer.toLowerCase() === 'y' || answer === '') {
    console.log('请依次 paste 图片，完成后输入 "done"\n');
    const { content: newContent } = await pasteImagesInteractive(content);
    return newContent;
  }

  return content;
}
```

- [ ] **Step 3: 提交**

```bash
git add scripts/polish-article.ts
git commit -m "feat(polish): add interactive image paste with 【图】 marker"
```

---

## Task 3: 集成到润色流程

**Files:**
- Modify: `scripts/polish-article.ts`

- [ ] **Step 1: 找到润色结果显示位置并集成**

找到显示润色结果的位置（约在 `console.log(content);` 附近），修改为：

```typescript
// 润色完成后
const polished = await polishText(rawText, apiKey);
const { filename, content: polishedContent } = parsePolishedOutput(polished);

// 检测剪贴板图片（旧逻辑，可能不再需要）
const clipboardHasImage = hasImageInClipboard();
const imageFilenames: string[] = [];

if (clipboardHasImage) {
  console.log('\n📷 检测到剪贴板有图片，正在保存...');
  const imgFilename = await saveImageFromClipboard();
  imageFilenames.push(imgFilename);
}

// 处理旧版标记（兼容）
const { finalContent, imagesUsed } = processContentWithImages(
  rawText,
  polishedContent,
  imageFilenames
);

// 新流程：询问是否粘贴图片（使用【图】标记）
const contentAfterImages = await askForImages(finalContent);

console.log('\n=== Polished Result ===\n');
console.log(`Suggested filename: ${filename}`);
console.log('\n--- Content ---\n');
console.log(contentAfterImages);
```

- [ ] **Step 2: 调整后续使用 content 的变量**

将后面使用 `content` 的地方改为使用 `contentAfterImages`，或者直接让 `content = contentAfterImages`。

- [ ] **Step 3: 提交**

```bash
git add scripts/polish-article.ts
git commit -m "feat(polish): integrate 【图】 marker paste flow after polishing"
```

---

## Task 4: 测试完整流程

- [ ] **Step 1: 测试无【图】标记的情况**

```bash
# 输入不含【图】的文字
echo "这是一段测试文字" | MINIMAX_API_KEY=your-key npm run polish
# 预期：跳过图片粘贴环节
```

- [ ] **Step 2: 测试有【图】标记的情况**

```bash
# 输入含【图】的文字
echo "这是【图】测试" | MINIMAX_API_KEY=your-key npm run polish
# 预期：询问是否粘贴图片
```

- [ ] **Step 3: 测试发布流程**

确保正常发布到 GitHub

- [ ] **Step 4: 提交测试结果（如有修改）**

---

## 验证清单

- [ ] 无【图】标记时，不询问图片
- [ ] 有【图】标记时，询问是否粘贴图片
- [ ] 输入 y 后，可以依次 paste 图片
- [ ] 每 paste 一张，自动替换一个【图】
- [ ] 输入 done 后，清理未替换的【图】
- [ ] 图片链接正确（/personal-blog/images/xxx.png）
- [ ] 链接已复制到剪贴板
- [ ] 发布流程正常
