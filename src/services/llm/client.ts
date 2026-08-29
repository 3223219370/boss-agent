// 通用 LLM HTTP 客户端：Ollama 与 OpenAI 兼容 API 共用同一套请求骨架，
// 两者在 endpoint、认证、请求体构造、响应解析上的差异由 LlmProviderSpec 参数化

import type { LlmChatMessage } from '~src/constant/types';
import { normalizeBaseUrl } from '~src/utils/normalize-base-url';
import type { LlmChatOptions, LlmChatResult, LlmClient, LlmOutputFormat } from './types';

/**
 * provider 差异描述：Ollama 与 OpenAI 兼容 API 的差异点统一由该对象参数化，
 * 新增 provider 只需组装一个 spec 即可复用全部请求骨架
 */
export interface LlmProviderSpec {
  /** 请求头（OpenAI 兼容 API 需 Bearer 认证，Ollama 本地无认证不传） */
  headers?: Record<string, string>;
  /** 拉取模型列表的路径（Ollama: /api/tags；OpenAI 兼容: /models） */
  modelsPath: string;
  /** 对话路径（Ollama: /api/chat；OpenAI 兼容: /chat/completions） */
  chatPath: string;
  /** 解析模型列表响应 → 模型名数组 */
  parseModels(data: unknown): string[];
  /** 构造对话请求体（format 为 json 时强制结构化输出，text 时让模型自由输出） */
  buildChatBody(model: string, messages: LlmChatMessage[], format: LlmOutputFormat): Record<string, unknown>;
  /** 解析对话响应 → 归一化 LlmChatResult（Ollama 在此抛截断错误） */
  parseChatResponse(data: unknown): LlmChatResult;
}

/**
 * 创建通用 HTTP 聊天客户端
 * @param baseUrl LLM 服务地址
 * @param model 模型名
 * @param spec provider 差异描述
 * @returns 统一的 LlmClient 实例
 */
export function createChatClient(baseUrl: string, model: string, spec: LlmProviderSpec): LlmClient {
  const base = normalizeBaseUrl(baseUrl);

  /** 拉取模型列表 */
  async function listModels(): Promise<string[]> {
    const res = await fetch(`${base}${spec.modelsPath}`, { headers: spec.headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return spec.parseModels(await res.json());
  }

  /** 发起对话（默认 format: json 强制输出 JSON；text 场景让模型自由输出） */
  async function chat(
    messages: LlmChatMessage[],
    options?: LlmChatOptions
  ): Promise<LlmChatResult> {
    const { format = 'json' } = options ?? {};
    const res = await fetch(`${base}${spec.chatPath}`, {
      method: 'POST',
      headers: spec.headers,
      body: JSON.stringify(spec.buildChatBody(model, messages, format)),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return spec.parseChatResponse(await res.json());
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

// ---- Ollama 本地模型客户端 ----

/** 上下文窗口大小（token 数）。Ollama 默认仅 2048/4096，简历+岗位描述这类长输入会
 * 挤占窗口导致输出截断，必须显式调大；注意不要超过模型自身上限（qwen2.5 系列为 32768） */
const NUM_CTX = 32000;

/** 输出 token 上限：匹配分析 JSON（reason 100 字 + greeting 50 字）几百 token 足够，防止无限生成 */
const NUM_PREDICT = 10000;

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
  /** 输入 token 数（prompt 实际消耗，含上下文拼接开销） */
  prompt_eval_count?: number;
  /** 输出 token 数 */
  eval_count?: number;
}

/** Ollama 差异描述（本地 API 无认证，无需 headers） */
const ollamaSpec: LlmProviderSpec = {
  modelsPath: '/api/tags',
  chatPath: '/api/chat',
  parseModels: (data) => (data as OllamaTagsResponse).models?.map((m) => m.name) ?? [],
  buildChatBody: (model, messages, format) => ({
    model,
    messages,
    stream: false,
    // 仅 JSON 场景强制 format: json，纯文本场景让模型自由输出
    ...(format === 'json' ? { format: 'json' } : {}),
    think: false,
    // 显式设置上下文窗口与输出上限，避免长输入挤占窗口导致输出被截断
    options: { num_ctx: NUM_CTX, num_predict: NUM_PREDICT },
  }),
  parseChatResponse: (data) => {
    const res = data as OllamaChatResponse;
    // 输出被截断时直接抛错，避免残缺 JSON 流入解析层造成误判
    if (res.done_reason && res.done_reason !== 'stop') {
      const reason =
        res.done_reason === 'load'
          ? `上下文窗口不足（输入过长），请调大 NUM_CTX（当前 ${NUM_CTX}）`
          : `达到输出长度上限，请调大 NUM_PREDICT（当前 ${NUM_PREDICT}）`;
      throw new Error(`模型输出被截断：${reason}`);
    }
    return {
      text: res.message?.content ?? '',
      promptTokens: res.prompt_eval_count,
      completionTokens: res.eval_count,
    };
  },
};

/**
 * 创建 Ollama 客户端
 * @param baseUrl Ollama 服务地址，如 http://localhost:11434
 * @param model 模型名（如 qwen2.5:7b）
 * @returns 统一的 LlmClient 实例
 */
export function createOllamaClient(baseUrl: string, model: string): LlmClient {
  return createChatClient(baseUrl, model, ollamaSpec);
}

// ---- OpenAI 兼容 API 客户端（千问 DashScope / DeepSeek 等） ----

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

/** OpenAI 兼容 API 差异描述（headers 中的 Bearer 密钥随 apiKey 动态注入） */
const openAiSpec: LlmProviderSpec = {
  modelsPath: '/models',
  chatPath: '/chat/completions',
  parseModels: (data) => (data as OpenAiModelsResponse).data?.map((m) => m.id) ?? [],
  buildChatBody: (model, messages, format) => ({
    model,
    messages,
    stream: false,
    // 仅 JSON 场景强制 response_format，纯文本场景让模型自由输出
    ...(format === 'json' ? { response_format: { type: 'json_object' } } : {}),
  }),
  parseChatResponse: (data) => {
    const res = data as OpenAiChatResponse;
    return {
      text: res.choices?.[0]?.message?.content ?? '',
      promptTokens: res.usage?.prompt_tokens,
      completionTokens: res.usage?.completion_tokens,
    };
  },
};

/**
 * 创建 OpenAI 兼容 API 客户端
 * @param baseUrl 基础地址，如 https://api.deepseek.com 或 https://dashscope.aliyuncs.com/compatible-mode/v1
 * @param apiKey API 密钥（Authorization: Bearer）
 * @param model 模型名（如 deepseek-chat、qwen-plus）
 * @returns 统一的 LlmClient 实例
 */
export function createOpenAiClient(baseUrl: string, apiKey: string, model: string): LlmClient {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
  return createChatClient(baseUrl, model, { ...openAiSpec, headers });
}
