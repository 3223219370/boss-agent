// LLM 客户端工厂：ollama 走本地客户端，云端供应商（DeepSeek / 千问）走 OpenAI 兼容客户端

import type { LlmClient } from './types';
import type { LlmConfig } from '~src/constant/types';
import { createOllamaClient, createOpenAiClient } from './client';

/**
 * 按配置创建 LLM 客户端
 * @param config LLM 配置（provider/baseUrl/apiKey/model）
 * @returns 统一的 LlmClient 实例
 */
export function createLlmClient(config: LlmConfig): LlmClient {
  if (config.provider === 'ollama') {
    return createOllamaClient(config.baseUrl, config.model);
  }
  return createOpenAiClient(config.baseUrl, config.apiKey, config.model);
}
