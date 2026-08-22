// content 浮层页面局部类型定义

import type { JobCardInfo, JobDetailInfo, LlmParseResult, LoopStatus } from '~src/constant/types';

/** 浮层 UI 状态（由 use-auto-analysis 的 reducer 维护） */
export interface AnalysisUiState {
  /** 分析循环状态机状态 */
  status: LoopStatus;
  /** 状态条文本 */
  statusText: string;
  /** 是否错误态（状态条红色展示） */
  isError: boolean;
  /** 当前岗位卡片信息（null 表示未抓取） */
  job: JobCardInfo | null;
  /** 当前岗位详情（null 表示未抓取） */
  detail: JobDetailInfo | null;
  /** AI 分析结果（null 表示尚未分析） */
  result: LlmParseResult | null;
  /** LLM 原始返回文本（调试展示用） */
  rawText: string;
  /** 面板是否已关闭（关闭后收起为悬浮按钮） */
  closed: boolean;
}

/** UI 状态变更动作 */
export type AnalysisAction =
  | { type: 'setStatus'; text: string; isError?: boolean }
  | { type: 'setJob'; job: JobCardInfo; detail: JobDetailInfo }
  | { type: 'setResult'; result: LlmParseResult; rawText: string }
  | { type: 'setLoopStatus'; status: LoopStatus; text: string; isError?: boolean }
  | { type: 'resetResult' }
  | { type: 'close' }
  | { type: 'reopen' };
