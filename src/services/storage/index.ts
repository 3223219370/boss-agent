// chrome.storage.local 类型安全封装：popup 与 content 统一入口，杜绝散落的魔法字符串

import type { AppConfig, GreetingMode, LlmConfig } from '~src/constant/types';
import { ALL_STORAGE_KEYS, STORAGE_KEYS } from '~src/constant/storage-keys';
import type { LlmPresets } from '~src/constant/llm-providers';
import { DEFAULT_OLLAMA_BASE, DEFAULT_PROVIDER } from '~src/constant/llm-providers';

/** 未保存时的默认配置（popup 初始表单值也用此默认值） */
export const DEFAULT_APP_CONFIG: AppConfig = {
  provider: DEFAULT_PROVIDER,
  baseUrl: DEFAULT_OLLAMA_BASE,
  apiKey: '',
  model: '',
  resumeText: '',
  resumeSummary: '',
  greetingMode: 'auto',
};

/**
 * 读取完整应用配置；缺失的键回填默认值
 * @returns 完整 AppConfig（永不缺键）
 */
export async function getAppConfig(): Promise<AppConfig> {
  const stored = (await chrome.storage.local.get(ALL_STORAGE_KEYS)) as Partial<AppConfig>;
  return { ...DEFAULT_APP_CONFIG, ...stored };
}

/**
 * 保存 LLM 配置（provider/baseUrl/apiKey/model 的任意子集）
 * @param partial 需要更新的配置项
 */
export async function saveLlmConfig(partial: Partial<LlmConfig>): Promise<void> {
  await chrome.storage.local.set(partial);
}

/**
 * 读取各服务已保存的配置预设（键为服务标识；未配置过的服务不在表中）
 * @returns 预设表（空对象兜底）
 */
export async function getLlmPresets(): Promise<LlmPresets> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.llmPresets);
  return (stored[STORAGE_KEYS.llmPresets] ?? {}) as LlmPresets;
}

/**
 * 保存完整预设表（调用方保证合并后整表写入）
 * @param presets 预设表（键为服务标识，值为该服务完整 LLM 配置）
 */
export async function saveLlmPresets(presets: LlmPresets): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.llmPresets]: presets });
}

/**
 * 保存简历文本
 * @param text 简历纯文本
 */
export async function saveResumeText(text: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.resumeText]: text });
}

/** 清空已保存的简历文本 */
export async function clearResumeText(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.resumeText);
}

/**
 * 保存简化后简历（AI 提取的招聘相关信息）
 * @param text 简化简历纯文本
 */
export async function saveResumeSummaryText(text: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.resumeSummary]: text });
}

/** 清空已保存的简化后简历 */
export async function clearResumeSummaryText(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.resumeSummary);
}

/**
 * 保存打招呼模式
 * @param mode auto 自动 / manual 手动
 */
export async function saveGreetingMode(mode: GreetingMode): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.greetingMode]: mode });
}
