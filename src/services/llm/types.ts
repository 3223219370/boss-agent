// LLM 客户端统一接口：Ollama 与 OpenAI 兼容 API 共用同一契约

import type { LlmChatMessage } from '~src/constant/types';

/** 连接测试结果 */
export interface ConnectionTestResult {
  /** 是否连通且正常 */
  ok: boolean;
  /** 提示文案（成功/失败原因） */
  message: string;
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
  /** 发起对话，返回模型输出文本与 token 统计（Ollama: POST /api/chat；OpenAI 兼容: POST /chat/completions） */
  chat(messages: LlmChatMessage[]): Promise<LlmChatResult>;
  /** 测试连接：拉取模型列表验证服务可达 */
  testConnection(): Promise<ConnectionTestResult>;
}
