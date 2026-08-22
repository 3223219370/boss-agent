// 自动分析状态 hook：UI 状态 reducer + 操作动作（抓取/手动分析已接入，自动循环在下一步接入）

import { useCallback, useMemo, useReducer } from 'react';

import type { Analyzer } from '~src/services/analysis/analyzer';
import { createAnalyzer } from '~src/services/analysis/analyzer';
import { getErrorMessage } from '~src/utils/error-message';
import type { AnalysisAction, AnalysisUiState } from '../types';
import { IDLE_STATUS_TEXT } from '../constant';

/** UI 初始状态 */
const INITIAL_UI: AnalysisUiState = {
  status: 'IDLE',
  phase: 'idle',
  statusText: IDLE_STATUS_TEXT,
  isError: false,
  job: null,
  detail: null,
  result: null,
  rawText: '',
  prompt: '',
  closed: false,
};

/** UI 状态 reducer：状态机事件 → UI 状态 */
function uiReducer(state: AnalysisUiState, action: AnalysisAction): AnalysisUiState {
  switch (action.type) {
    case 'setStatus':
      return { ...state, statusText: action.text, isError: action.isError ?? false };
    case 'setJob':
      return { ...state, job: action.job, detail: action.detail };
    case 'setResult':
      return {
        ...state,
        result: action.result,
        rawText: action.rawText,
        promptTokens: action.promptTokens,
        completionTokens: action.completionTokens,
      };
    case 'setLoopStatus':
      return { ...state, status: action.status, statusText: action.text, isError: action.isError ?? false };
    case 'setPhase':
      return { ...state, phase: action.phase };
    case 'setPrompt':
      return { ...state, prompt: action.prompt };
    case 'resetResult':
      return { ...state, result: null, rawText: '', prompt: '', promptTokens: undefined, completionTokens: undefined };
    case 'close':
      return { ...state, closed: true };
    case 'reopen':
      return { ...state, closed: false };
    default:
      return state;
  }
}

/**
 * 浮层 UI 状态与操作
 * - 抓取已接入真实 DOM 抓取；分析/自动循环将在后续步骤接入 analyzer 引擎
 * - 按钮显隐由状态派生（loopActive = RUNNING | MATCHED）
 */
export function useAutoAnalysis() {
  const [ui, dispatch] = useReducer(uiReducer, INITIAL_UI);

  /** 分析引擎：事件直接 dispatch 到 UI reducer（事件形状与 action 一致） */
  const analyzer = useMemo<Analyzer>(() => createAnalyzer(dispatch), []);

  /** 循环是否激活（运行中或匹配暂停） */
  const isLoopActive = ui.status === 'RUNNING' || ui.status === 'MATCHED';

  /** 手动分析当前岗位：完整闭环（抓取 → prompt → LLM → 解析 → 渲染），失败显示错误状态 */
  const analyze = useCallback(async () => {
    try {
      await analyzer.analyzeOnce();
    } catch (err) {
      // 重置阶段，避免步骤条停留在抓取/分析的 loading 态
      dispatch({ type: 'setPhase', phase: 'idle' });
      dispatch({ type: 'setStatus', text: `分析失败：${getErrorMessage(err)}`, isError: true });
    }
  }, [analyzer]);

  /** 开始自动循环分析（引擎内校验配置，失败在状态条提示） */
  const start = useCallback(() => {
    void analyzer.start();
  }, [analyzer]);

  /** 匹配暂停后继续分析 */
  const resume = useCallback(() => {
    analyzer.resume();
  }, [analyzer]);

  /** 停止分析 */
  const stop = useCallback(() => {
    analyzer.stop();
  }, [analyzer]);

  /** 关闭面板（收起为悬浮按钮） */
  const close = useCallback(() => dispatch({ type: 'close' }), []);

  /** 重新打开面板 */
  const reopen = useCallback(() => dispatch({ type: 'reopen' }), []);

  return { ui, isLoopActive, analyze, start, resume, stop, close, reopen };
}
