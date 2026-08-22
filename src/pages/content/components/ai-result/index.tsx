// AI 分析结果区：匹配徽章 / 理由 / 打招呼语 / 复制按钮 / 原始返回（无结果时不渲染）

import type { LlmParseResult } from '~src/constant/types';
import { EMPTY_PLACEHOLDER } from '../../constant';
import styles from './index.module.scss';

/** AiResult 组件 Props */
interface AiResultProps {
  /** AI 分析结果（null 不渲染） */
  result: LlmParseResult | null;
  /** LLM 原始返回文本（调试展示） */
  rawText: string;
  /** 复制打招呼语回调 */
  onCopy: (greeting: string) => void;
  /** 是否已复制（按钮反馈） */
  copied: boolean;
}

/** AI 分析结果区 */
function AiResult({ result, rawText, onCopy, copied }: AiResultProps) {
  if (!result) return null;

  const { match, reason, greeting } = result;
  const verdictClass = match ? styles.verdictMatch : styles.verdictUnmatch;
  const verdictText = match ? '匹配' : '不匹配';

  return (
    <div className={styles.result}>
      <span className={`${styles.verdict} ${verdictClass}`}>{verdictText}</span>
      <div className={styles.reason}>理由：{reason || EMPTY_PLACEHOLDER}</div>
      {match && (
        <>
          <div className={styles.greetingLabel}>AI 打招呼语</div>
          <div className={styles.greeting}>{greeting || EMPTY_PLACEHOLDER}</div>
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`} onClick={() => onCopy(greeting)}>
            {copied ? '已复制 ✓' : '复制打招呼语'}
          </button>
        </>
      )}
      {rawText && (
        <details className={styles.raw}>
          <summary>AI 原始返回</summary>
          <div className={styles.rawBody}>{rawText}</div>
        </details>
      )}
    </div>
  );
}

export default AiResult;
