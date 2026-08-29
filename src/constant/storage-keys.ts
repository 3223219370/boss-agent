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
  /** 各服务已保存的配置预设（JSON 序列化 Record，键为服务标识；切换服务自动回填） */
  llmPresets: 'llmPresets',
  /** 简历文本 */
  resumeText: 'resumeText',
  /** 简化后简历（AI 提取招聘相关信息，为空时分析回退完整简历） */
  resumeSummary: 'resumeSummary',
  /** 打招呼模式（auto 自动 / manual 手动） */
  greetingMode: 'greetingMode',
  /** 分析历史记录数组（JSON 序列化，最新在前，上限 500 条） */
  analysisHistory: 'analysisHistory',
} as const;

// 配置存储键（不含 history / llmPresets）：getAppConfig 全量读取用，避免把整个历史数组/预设表读进配置
// 注意：新增配置键必须同步加进来；history / llmPresets 为独立存储键，不走此数组（见 src/services/history、src/services/storage）
export const ALL_STORAGE_KEYS: string[] = [
  STORAGE_KEYS.provider,
  STORAGE_KEYS.baseUrl,
  STORAGE_KEYS.apiKey,
  STORAGE_KEYS.model,
  STORAGE_KEYS.resumeText,
  STORAGE_KEYS.resumeSummary,
  STORAGE_KEYS.greetingMode,
];
