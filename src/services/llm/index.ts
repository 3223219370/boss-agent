// LLM 客户端工厂：按 provider 类型创建对应的客户端实例

import type { LlmClient } from './types';
import type { LlmConfig } from '~src/constant/types';
import { createOllamaClient } from './ollama';
import { createOpenAiClient } from './openai';

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
