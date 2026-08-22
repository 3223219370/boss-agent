// LLM 提供商相关常量：服务预设（Ollama / OpenAI 兼容）、默认值

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
    provider: 'openai',
    /** DeepSeek 开放平台基础地址 */
    baseUrl: 'https://api.deepseek.com',
  },
  {
    /** 服务标识 */
    id: 'qwen',
    /** 展示名 */
    label: '千问 DashScope',
    /** 提供商类型 */
    provider: 'openai',
    /** 阿里云百炼 DashScope OpenAI 兼容模式基础地址 */
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
] as const satisfies readonly {
  id: string;
  label: string;
  provider: ProviderType;
  baseUrl: string;
}[];

/** 服务标识（含自定义） */
export type LlmServiceId = (typeof LLM_SERVICE_PRESETS)[number]['id'] | 'custom';

/** 自定义服务标识（接口地址与任何预设均不匹配时使用） */
export const CUSTOM_SERVICE_ID = 'custom';

/** 默认 LLM 提供商 */
export const DEFAULT_PROVIDER = 'ollama' as const;

/** Ollama 默认基础地址 */
export const DEFAULT_OLLAMA_BASE = 'http://localhost:11434';

/** OpenAI 兼容 provider 需要 API Key 的提示文案 */
export const API_KEY_REQUIRED_HINT = 'OpenAI 兼容 API 需要填写 API Key';

/**
 * 根据 provider 与 baseUrl 匹配服务预设
 * @param provider 提供商类型
 * @param baseUrl 当前接口地址
 * @returns 匹配的预设 id；无匹配返回自定义标识 CUSTOM_SERVICE_ID
 */
export function matchServicePreset(provider: ProviderType, baseUrl: string): LlmServiceId {
  const hit = LLM_SERVICE_PRESETS.find((p) => p.provider === provider && p.baseUrl === baseUrl);
  return hit ? hit.id : CUSTOM_SERVICE_ID;
}
