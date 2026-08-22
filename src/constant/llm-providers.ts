// LLM 提供商相关常量：服务预设（Ollama / DeepSeek / 千问）、默认值

import type { ProviderType } from './types';

/** 服务预设（服务类型下拉选项：ollama / deepseek / qwen） */
export const LLM_SERVICE_PRESETS = [
  {
    /** 服务标识 */
    id: 'ollama',
    /** 展示名 */
    label: 'Ollama（本地）',
    /** 提供商类型 */
    provider: 'ollama',
    /** 默认接口地址 */
    baseUrl: 'http://localhost:11434',
  },
  {
    /** 服务标识 */
    id: 'deepseek',
    /** 展示名 */
    label: 'DeepSeek',
    /** 提供商类型 */
    provider: 'deepseek',
    /** DeepSeek 开放平台基础地址 */
    baseUrl: 'https://api.deepseek.com',
  },
  {
    /** 服务标识 */
    id: 'qwen',
    /** 展示名 */
    label: '千问 DashScope',
    /** 提供商类型 */
    provider: 'qwen',
    /** 阿里云百炼 DashScope OpenAI 兼容模式基础地址 */
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
] as const satisfies readonly {
  id: string;
  label: string;
  provider: ProviderType;
  baseUrl: string;
}[];

/** 服务标识（ollama / deepseek / qwen） */
export type LlmServiceId = (typeof LLM_SERVICE_PRESETS)[number]['id'];

/** 默认 LLM 提供商 */
export const DEFAULT_PROVIDER = 'ollama' as const;

/** Ollama 默认基础地址 */
export const DEFAULT_OLLAMA_BASE = 'http://localhost:11434';

/** 需要 API Key 的云端供应商（Ollama 本地场景无需） */
export const API_KEY_PROVIDERS: ReadonlySet<ProviderType> = new Set(['deepseek', 'qwen']);

/** 云端供应商需要 API Key 的提示文案 */
export const API_KEY_REQUIRED_HINT = 'DeepSeek / 千问 需要填写 API Key';

/**
 * 根据 provider 匹配服务预设
 * @param provider 提供商类型
 * @returns 匹配的预设 id；无匹配返回 undefined（正常情况不会出现，provider 即预设之一）
 */
export function matchServicePreset(provider: ProviderType): LlmServiceId | undefined {
  return LLM_SERVICE_PRESETS.find((p) => p.provider === provider)?.id;
}
