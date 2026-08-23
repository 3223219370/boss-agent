// 分析历史记录存储服务：chrome.storage.local 单键存数组（最新在前），超出上限自动淘汰最旧
// 独立于配置存储（storage/），避免 getAppConfig 全量读取时把历史数组读进配置

import type { AnalysisRecord, GreetOutcome } from '~src/constant/types';
import { STORAGE_KEYS } from '~src/constant/storage-keys';
import { HISTORY_LIMIT } from '~src/constant/history';

/** 生成记录 ID（crypto.randomUUID，不可用时回退时间戳+随机数） */
export function generateRecordId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 读取全部分析记录（按 analyzedAt 倒序，最新在前；无记录或数据损坏时返回空数组）
 * @returns 分析记录数组
 */
export async function getAnalysisRecords(): Promise<AnalysisRecord[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.analysisHistory);
  const list = stored[STORAGE_KEYS.analysisHistory];
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => b.analyzedAt - a.analyzedAt);
}

/**
 * 保存一条分析记录（最新在前；超出 HISTORY_LIMIT 时截断淘汰最旧）
 * @param record 完整分析记录
 */
export async function saveAnalysisRecord(record: AnalysisRecord): Promise<void> {
  const list = await getAnalysisRecords();
  list.unshift(record);
  if (list.length > HISTORY_LIMIT) list.length = HISTORY_LIMIT;
  await chrome.storage.local.set({ [STORAGE_KEYS.analysisHistory]: list });
}

/**
 * 补写指定记录的打招呼结果（幂等）
 * 仅当记录存在、result.match 为 true 且当前 greetOutcome 为 'none'（未定稿）时生效，
 * 避免 'failed' 被后续 'manual' 补写覆盖
 * @param id 记录 ID
 * @param outcome 打招呼结果
 */
export async function updateGreetOutcome(
  id: string,
  outcome: GreetOutcome
): Promise<void> {
  const list = await getAnalysisRecords();
  const index = list.findIndex((record) => record.id === id);
  if (index < 0) return;
  const record = list[index];
  if (!record.result.match || record.greetOutcome !== 'none') return;
  list[index] = { ...record, greetOutcome: outcome };
  await chrome.storage.local.set({ [STORAGE_KEYS.analysisHistory]: list });
}

/** 清空全部分析记录 */
export async function clearAnalysisRecords(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.analysisHistory);
}
