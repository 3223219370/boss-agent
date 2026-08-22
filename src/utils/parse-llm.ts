// LLM 返回文本解析纯函数：兼容 ```json 代码块包裹，失败返回 ok=false

import type { LlmParseResult } from '~src/constant/types';

/** 解析失败时的兜底结果 */
const PARSE_FAILED_RESULT: LlmParseResult = {
  ok: false,
  match: false,
  reason: 'AI 返回了无法解析的内容，请重试',
  greeting: '',
};

/**
 * 解析 LLM 返回的 JSON 文本（兼容 ```json 代码块包裹）
 * @param text LLM 原始返回文本
 * @returns 解析结果；失败时 ok=false 并携带提示文案
 */
export function parseLlmResponse(text: string): LlmParseResult {
  try {
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    const data = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      ok: true,
      match: data.match === true,
      reason: typeof data.reason === 'string' ? data.reason : '',
      greeting: typeof data.greeting === 'string' ? data.greeting : '',
    };
  } catch {
    return PARSE_FAILED_RESULT;
  }
}
