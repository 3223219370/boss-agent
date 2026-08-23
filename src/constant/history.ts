// 分析历史记录保留策略配置

/** 分析历史保留条数上限，超出自动淘汰最旧记录（storage.local 配额有限，靠上限控制容量） */
export const HISTORY_LIMIT = 500;
