// chrome.storage.local 存储键集中管理：popup 与 content 统一走该键名

export const STORAGE_KEYS = {
  /** LLM 提供商类型 */
  provider: 'provider',
  /** 服务基础地址 */
  baseUrl: 'baseUrl',
  /** 云端 API 密钥（DeepSeek / 千问；Ollama 场景为空） */
  apiKey: 'apiKey',
  /** 已选模型名 */
  model: 'model',
  /** 简历文本 */
  resumeText: 'resumeText',
  /** 打招呼模式（auto 自动 / manual 手动） */
  greetingMode: 'greetingMode',
  /** 分析历史记录数组（JSON 序列化，最新在前，上限 500 条） */
  analysisHistory: 'analysisHistory',
} as const;

// 配置存储键（不含 history）：getAppConfig 全量读取用，避免把整个历史数组读进配置
// 注意：新增配置键必须同步加进来；history 键不走此数组（见 src/services/history）
export const ALL_STORAGE_KEYS: string[] = [
  STORAGE_KEYS.provider,
  STORAGE_KEYS.baseUrl,
  STORAGE_KEYS.apiKey,
  STORAGE_KEYS.model,
  STORAGE_KEYS.resumeText,
  STORAGE_KEYS.greetingMode,
];
