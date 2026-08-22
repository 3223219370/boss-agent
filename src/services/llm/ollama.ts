// Ollama 本地模型客户端：GET /api/tags 拉模型，POST /api/chat 对话

import type { LlmClient } from './types';
import type { LlmChatMessage } from '~src/constant/types';
import { normalizeBaseUrl } from '~src/utils/normalize-base-url';

/**
 * 上下文窗口大小（token 数）。Ollama 默认仅 2048/4096，简历+岗位描述这类长输入会
 * 挤占窗口导致输出截断，必须显式调大；注意不要超过模型自身上限（qwen2.5 系列为 32768）
 */
const NUM_CTX = 16384;

/** 输出 token 上限：匹配分析 JSON（reason 100 字 + greeting 50 字）几百 token 足够，防止无限生成 */
const NUM_PREDICT = 1024;

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
  /** 生成结束原因：stop 正常完成 / length 达到输出上限 / load 上下文窗口不足被截断 */
  done_reason?: 'stop' | 'length' | 'load';
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
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        format: 'json',
        think: false,
        // 显式设置上下文窗口与输出上限，避免长输入挤占窗口导致输出被截断
        options: { num_ctx: NUM_CTX, num_predict: NUM_PREDICT },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as OllamaChatResponse;
    // 输出被截断时直接抛错，避免残缺 JSON 流入解析层造成误判
    if (data.done_reason && data.done_reason !== 'stop') {
      const reason =
        data.done_reason === 'load'
          ? `上下文窗口不足（输入过长），请调大 NUM_CTX（当前 ${NUM_CTX}）`
          : `达到输出长度上限，请调大 NUM_PREDICT（当前 ${NUM_PREDICT}）`;
      throw new Error(`模型输出被截断：${reason}`);
    }
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
