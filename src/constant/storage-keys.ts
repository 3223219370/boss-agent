// chrome.storage.local 存储键集中管理：popup 与 content 统一走该键名

export const STORAGE_KEYS = {
  /** LLM 提供商类型 */
  provider: 'provider',
  /** 服务基础地址 */
  baseUrl: 'baseUrl',
  /** OpenAI 兼容 API 密钥 */
  apiKey: 'apiKey',
  /** 已选模型名 */
  model: 'model',
  /** 简历文本 */
  resumeText: 'resumeText',
  /** 打招呼模式（auto 自动 / manual 手动） */
  greetingMode: 'greetingMode',
} as const;

/** 全部存储键（一次性读取全部配置用） */
export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS);
