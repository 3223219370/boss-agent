// LLM 客户端统一接口：Ollama 与 OpenAI 兼容 API 共用同一契约

import type { LlmChatMessage } from '~src/constant/types';

/** 连接测试结果 */
export interface ConnectionTestResult {
  /** 是否连通且正常 */
  ok: boolean;
  /** 提示文案（成功/失败原因） */
  message: string;
}

/** LLM 对话输出格式：json 强制模型输出 JSON / text 普通纯文本 */
export type LlmOutputFormat = 'json' | 'text';

/** LLM 对话选项 */
export interface LlmChatOptions {
  /** 输出格式（默认 json；简历简化等纯文本场景传 text） */
  format?: LlmOutputFormat;
}

/** LLM 对话结果（文本 + token 统计） */
export interface LlmChatResult {
  /** 模型输出文本 */
  text: string;
  /** 输入 token 数（Ollama: prompt_eval_count；OpenAI 兼容: usage.prompt_tokens），API 未返回时为 undefined */
  promptTokens?: number;
  /** 输出 token 数（Ollama: eval_count；OpenAI 兼容: usage.completion_tokens），API 未返回时为 undefined */
  completionTokens?: number;
}

/** LLM 客户端统一接口 */
export interface LlmClient {
  /** 拉取可用模型列表（Ollama: GET /api/tags；OpenAI 兼容: GET /models） */
  listModels(): Promise<string[]>;
  /**
   * 发起对话，返回模型输出文本与 token 统计（Ollama: POST /api/chat；OpenAI 兼容: POST /chat/completions）
   * @param messages 对话消息
   * @param options 对话选项（format 默认 json 强制结构化输出，text 时模型自由输出纯文本）
   */
  chat(messages: LlmChatMessage[], options?: LlmChatOptions): Promise<LlmChatResult>;
  /** 测试连接：拉取模型列表验证服务可达 */
  testConnection(): Promise<ConnectionTestResult>;
}
