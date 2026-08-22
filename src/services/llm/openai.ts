// OpenAI 兼容 API 客户端（千问 DashScope / DeepSeek 等）：GET /models 拉模型，POST /chat/completions 对话

import type { LlmClient, LlmChatResult } from './types';
import type { LlmChatMessage } from '~src/constant/types';
import { normalizeBaseUrl } from '~src/utils/normalize-base-url';

/** GET /models 响应结构 */
interface OpenAiModelsResponse {
  /** 模型列表 */
  data?: Array<{
    /** 模型 id */
    id: string;
  }>;
}

/** POST /chat/completions 响应结构 */
interface OpenAiChatResponse {
  /** 候选结果列表 */
  choices?: Array<{
    /** 消息 */
    message?: {
      /** 模型输出内容 */
      content?: string;
    };
  }>;
  /** token 用量统计（部分兼容 API 可能不返回） */
  usage?: {
    /** 输入 token 数 */
    prompt_tokens?: number;
    /** 输出 token 数 */
    completion_tokens?: number;
  };
}

/**
 * 创建 OpenAI 兼容 API 客户端
 * @param baseUrl 基础地址，如 https://api.deepseek.com 或 https://dashscope.aliyuncs.com/compatible-mode/v1
 * @param apiKey API 密钥（Authorization: Bearer）
 * @param model 模型名（如 deepseek-chat、qwen-plus）
 * @returns 统一的 LlmClient 实例
 */
export function createOpenAiClient(baseUrl: string, apiKey: string, model: string): LlmClient {
  const base = normalizeBaseUrl(baseUrl);
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };

  /** 拉取可用模型列表 */
  async function listModels(): Promise<string[]> {
    const res = await fetch(`${base}/models`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as OpenAiModelsResponse;
    return (data.data ?? []).map((m) => m.id);
  }

  /** 发起对话（response_format json_object 强制模型输出 JSON） */
  async function chat(messages: LlmChatMessage[]): Promise<LlmChatResult> {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as OpenAiChatResponse;
    return {
      text: data.choices?.[0]?.message?.content ?? '',
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
    };
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
