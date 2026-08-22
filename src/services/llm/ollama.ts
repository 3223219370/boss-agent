// Ollama 本地模型客户端：GET /api/tags 拉模型，POST /api/chat 对话

import type { LlmClient } from './types';
import type { LlmChatMessage } from '~src/constant/types';
import { normalizeBaseUrl } from '~src/utils/normalize-base-url';

/** GET /api/tags 响应结构 */
interface OllamaTagsResponse {
  /** 模型列表 */
  models?: Array<{
    /** 模型名 */
    name: string;
  }>;
}

/** POST /api/chat 响应结构 */
interface OllamaChatResponse {
  /** 聊天消息 */
  message?: {
    /** 模型输出内容 */
    content?: string;
  };
}

/**
 * 创建 Ollama 客户端
 * @param baseUrl Ollama 服务地址，如 http://localhost:11434
 * @param model 模型名（如 qwen2.5:7b）
 * @returns 统一的 LlmClient 实例
 */
export function createOllamaClient(baseUrl: string, model: string): LlmClient {
  const base = normalizeBaseUrl(baseUrl);

  /** 拉取本地模型列表 */
  async function listModels(): Promise<string[]> {
    const res = await fetch(`${base}/api/tags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as OllamaTagsResponse;
    return (data.models ?? []).map((m) => m.name);
  }

  /** 发起对话（format: json 强制模型输出 JSON，think: false 关闭思考输出） */
  async function chat(messages: LlmChatMessage[]): Promise<string> {
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false, format: 'json', think: false }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as OllamaChatResponse;
    return data.message?.content ?? '';
  }

  /** 测试连接：拉取模型列表验证服务可达 */
  async function testConnection() {
    const names = await listModels();
    return names.length > 0
      ? { ok: true, message: `连接成功，检测到 ${names.length} 个模型` }
      : { ok: false, message: '连接成功，但未检测到模型' };
  }

  return { listModels, chat, testConnection };
}
