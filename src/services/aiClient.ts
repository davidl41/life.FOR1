import type { AISettings } from '../types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICallResult {
  ok: boolean;
  content: string;
  error?: string;
  httpStatus?: number;
  requestUrl: string;
  durationMs: number;
}

const DEFAULT_ENDPOINT = 'https://api.deepseek.com/v1';
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_TIMEOUT_MS = 45_000;

/**
 * 把用户填写的 Base URL 归一化成可以安全拼接 "/chat/completions" 的形式。
 *
 * 真实用户会填出这些形态，全部都要能救回来：
 *   api.deepseek.com                             -> https://api.deepseek.com/v1
 *   https://api.deepseek.com/                    -> https://api.deepseek.com/v1
 *   https://api.deepseek.com/v1/                 -> https://api.deepseek.com/v1
 *   https://api.deepseek.com/v1/chat/completions -> https://api.deepseek.com/v1
 */
export function normalizeEndpoint(raw: string): string {
  let s = (raw || '').trim().replace(/\s+/g, '');
  if (!s) return DEFAULT_ENDPOINT;

  // 用户常常直接粘贴完整接口地址，先剥掉接口路径，避免拼成 .../chat/completions/chat/completions
  s = s.replace(/\/+$/, '');
  s = s.replace(/\/chat\/completions$/i, '');
  s = s.replace(/\/+$/, '');

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = `https://${s}`;

  try {
    const u = new URL(s);
    // 只给了域名（或域名 + 根路径）时，按 OpenAI 兼容网关的通用约定补 /v1
    if (!u.pathname || u.pathname === '/') u.pathname = '/v1';
    return u.toString().replace(/\/+$/, '');
  } catch {
    return s;
  }
}

/** 是否是明文 http 地址（Android targetSdk >= 28 默认会拦截，必须提示用户） */
export function isCleartextEndpoint(raw: string): boolean {
  return /^http:\/\//i.test(normalizeEndpoint(raw));
}

function snippet(body: string, max = 300): string {
  const t = (body || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function describeHttpError(status: number, body: string): string {
  const detail = snippet(body);
  const tail = detail ? `\n服务端返回：${detail}` : '';
  switch (status) {
    case 400:
      return `请求被服务端拒绝（400）。多半是模型名称不被支持，请核对「模型名称」是否与服务商一致。${tail}`;
    case 401:
      return `API Key 无效或已过期（401）。请检查 Key 是否复制完整、首尾是否混入空格或中文引号。${tail}`;
    case 402:
      return `账户余额不足（402），请先充值后再试。${tail}`;
    case 403:
      return `无访问权限（403）。可能是 Key 权限不足、被封禁或所在地区受限。${tail}`;
    case 404:
      return `接口路径不存在（404）。请检查 Base URL：多数网关需要以 /v1 结尾，并且不要填成完整的 /v1/chat/completions。${tail}`;
    case 429:
      return `请求过于频繁，触发限流（429），请稍后再试。${tail}`;
    case 500:
    case 502:
    case 503:
    case 504:
      return `模型服务端异常（${status}），稍后重试即可。${tail}`;
    default:
      return `接口返回 HTTP ${status}。${tail}`;
  }
}

function describeNetworkError(endpoint: string): string {
  if (isCleartextEndpoint(endpoint)) {
    return (
      '网络请求被系统拦截。你填写的是 http:// 明文地址，而 Android 9 以上默认禁止明文 HTTP。\n' +
      '解决办法：把 Base URL 换成 https://，或改用支持 https 的中转地址。'
    );
  }
  return (
    '网络请求没能发出去（DNS 解析失败、无网络、被系统或安全软件拦截，或该域名在当前网络不可达）。\n' +
    '请确认手机能正常打开该地址，并检查 Base URL 域名是否拼写正确。'
  );
}

function extractContent(data: unknown): string {
  const obj = data as { choices?: Array<{ message?: { content?: unknown } }> };
  const content = obj?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : '';
}

/**
 * 统一的 OpenAI 兼容 chat/completions 调用。
 * 任何失败都会返回可读的中文 error，而不是静默吞掉，便于界面直接展示。
 */
export async function chatCompletion(params: {
  settings: AISettings;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<AICallResult> {
  const { settings, messages, temperature, maxTokens, timeoutMs = DEFAULT_TIMEOUT_MS } = params;

  const base = normalizeEndpoint(settings.endpoint);
  const requestUrl = `${base}/chat/completions`;
  const model = (settings.model || '').trim() || DEFAULT_MODEL;
  const apiKey = (settings.apiKey || '').trim();
  const startedAt = Date.now();

  if (!apiKey) {
    return {
      ok: false,
      content: '',
      error: '尚未填写 API Key。',
      requestUrl,
      durationMs: 0,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
      signal: controller.signal,
    });

    const durationMs = Date.now() - startedAt;

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      return {
        ok: false,
        content: '',
        error: describeHttpError(resp.status, body),
        httpStatus: resp.status,
        requestUrl,
        durationMs,
      };
    }

    const raw = await resp.text();
    let data: unknown = null;
    try {
      data = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        content: '',
        error: `服务端返回的不是合法 JSON，可能 Base URL 指向了网页而不是接口。\n返回内容：${snippet(raw, 200)}`,
        requestUrl,
        durationMs,
      };
    }

    const content = extractContent(data);
    if (!content) {
      return {
        ok: false,
        content: '',
        error: `响应格式不是 OpenAI 兼容格式（缺少 choices[0].message.content）。\n返回内容：${snippet(raw, 200)}`,
        requestUrl,
        durationMs,
      };
    }

    return { ok: true, content, requestUrl, durationMs };
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    return {
      ok: false,
      content: '',
      error: aborted
        ? `请求超时（${Math.round(timeoutMs / 1000)} 秒无响应）。请检查 Base URL 是否可以访问。`
        : describeNetworkError(base),
      requestUrl,
      durationMs,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** 供设置页「测试连接」使用：发一条极短的探活请求 */
export async function testConnection(settings: AISettings): Promise<AICallResult> {
  return chatCompletion({
    settings,
    messages: [{ role: 'user', content: '你好，请只回复两个字：正常' }],
    temperature: 0,
    maxTokens: 16,
    timeoutMs: 20_000,
  });
}
