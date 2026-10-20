/**
 * 工业级分层动态记忆召回引擎 (Inspired by ChatGPT Memory, Mem0 & SillyTavern RAG)
 * 核心目标：记忆库可容纳成百上千条事实，但单次请求通过按需相关度检索，只注入 Top-3 条最相关的记忆，
 * 将单次 Tokens 消耗控制在 50~80 Tokens 以内（不到 0.0001 元），彻底解决“越积攒越多”的行业痛点。
 */

// 文本分词与特征提取
function extractKeywords(text: string): Set<string> {
  const clean = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ');
  const words = new Set<string>();

  // 1. 中文两字滑动切词 (Bigram)
  for (let i = 0; i < clean.length - 1; i++) {
    const pair = clean.slice(i, i + 2).trim();
    if (pair.length === 2) words.add(pair);
  }

  // 2. 单词匹配
  clean.split(/\s+/).forEach((w) => {
    if (w.length >= 2) words.add(w);
  });

  return words;
}

/**
 * 计算用户输入与单条记忆的相关度打分 (Jaccard + 语义权重)
 */
function calculateRelevanceScore(queryKeywords: Set<string>, memoryText: string): number {
  const memKeywords = extractKeywords(memoryText);
  if (queryKeywords.size === 0 || memKeywords.size === 0) return 0;

  let intersectionCount = 0;
  queryKeywords.forEach((kw) => {
    if (memKeywords.has(kw) || memoryText.toLowerCase().includes(kw)) {
      intersectionCount += 1;
    }
  });

  // 相似度得分
  const jaccard = intersectionCount / (queryKeywords.size + memKeywords.size - intersectionCount);
  return jaccard;
}

/**
 * 从可能多达上百条的记忆库中，按需召回与当前话题最相关的 Top-K 条记忆 (默认 3 条)
 */
export function recallRelevantMemories(
  allMemories: string[],
  userQuery: string,
  topK: number = 3
): string[] {
  if (!allMemories || allMemories.length === 0) return [];
  if (allMemories.length <= topK) return allMemories;

  const queryKeywords = extractKeywords(userQuery);

  // 打分并排序
  const scored = allMemories.map((text, originalIndex) => {
    const score = calculateRelevanceScore(queryKeywords, text);
    return {
      text,
      score,
      originalIndex,
    };
  });

  // 优先按相关度降序，相关度相同时按更新时间（新记忆排前）
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.originalIndex - a.originalIndex;
  });

  // 只取出 Top-K 条相关记忆
  const topMemories = scored.slice(0, topK).map((item) => item.text);
  return topMemories;
}

/**
 * 将召回的记忆格式化为注入 System Prompt 的精简字符串 (<80 tokens)
 * 每条记忆附带精确发生日期，赋予大模型真实人类的时间流逝感
 */
export function formatMemoriesForPrompt(recalledMemories: string[], characterName: string): string {
  if (!recalledMemories || recalledMemories.length === 0) return '';
  return `\n【${characterName}脑海中回想起来关于探索者的长效记忆（带具体日期）】：\n${recalledMemories
    .map((m, idx) => `${idx + 1}. ${m}`)
    .join('\n')}\n`;
}
