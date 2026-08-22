// 全局共享领域类型：popup 与 content 两侧共用的类型定义

/** LLM 提供商类型：ollama 本地模型 / deepseek / qwen（千问）云端 API */
export type ProviderType = 'ollama' | 'deepseek' | 'qwen';

/** LLM 配置（不包含简历，简历单独管理） */
export interface LlmConfig {
  /** LLM 提供商类型 */
  provider: ProviderType;
  /** 服务基础地址（Ollama 默认 http://localhost:11434），已去除末尾斜杠 */
  baseUrl: string;
  /** 云端 API 密钥（DeepSeek / 千问；Ollama 场景为空字符串） */
  apiKey: string;
  /** 已选模型名 */
  model: string;
}

/** 应用完整配置：LLM 配置 + 简历文本 + 打招呼模式 */
export interface AppConfig extends LlmConfig {
  /** 简历文本（纯文本，来自 popup 粘贴框） */
  resumeText: string;
  /** 打招呼模式：auto 匹配后自动发送并继续下一个 / manual 匹配后暂停等用户确认 */
  greetingMode: GreetingMode;
}

/** 岗位卡片信息（列表页左侧卡片，未点击前的信息） */
export interface JobCardInfo {
  /** 岗位名称 */
  title: string;
  /** 薪资文本，如 "20-35K" */
  salary: string;
  /** 标签数组（年限/学历/方向等） */
  tags: string[];
  /** 公司名称 */
  company: string;
  /** 工作地点 */
  location: string;
  /** 岗位详情链接 href（用于去重） */
  href: string;
}

/** 岗位详情信息（点击卡片后右侧详情面板） */
export interface JobDetailInfo {
  /** 岗位描述文本（已做反爬清理） */
  description: string;
  /** 公司名称（详情面板中的完整公司名） */
  company: string;
}

/** 组合后的完整岗位信息（卡片 + 详情），用于 prompt 组装 */
export interface JobInfo {
  /** 岗位名称 */
  title: string;
  /** 薪资文本 */
  salary: string;
  /** 标签数组 */
  tags: string[];
  /** 公司名称 */
  company: string;
  /** 工作地点 */
  location: string;
  /** 岗位描述（反爬清理后） */
  description: string;
}

/** LLM 分析结果（解析后的结构化输出） */
export interface LlmResult {
  /** 是否匹配（AI 判定） */
  match: boolean;
  /** 匹配判断理由（100 字内） */
  reason: string;
  /** AI 生成的打招呼语（50 字内） */
  greeting: string;
}

/** LLM 解析结果：ok=false 表示 AI 返回了无法解析的内容 */
export interface LlmParseResult extends LlmResult {
  /** 解析是否成功 */
  ok: boolean;
}

/** 分析循环状态机状态 */
export type LoopStatus = 'IDLE' | 'RUNNING' | 'MATCHED' | 'DONE';

/** 打招呼模式：auto 自动发送后继续下一个 / manual 暂停等用户手动复制发送 */
export type GreetingMode = 'auto' | 'manual';

/** LLM 对话消息 */
export interface LlmChatMessage {
  /** 消息角色 */
  role: 'system' | 'user' | 'assistant';
  /** 消息内容 */
  content: string;
}
