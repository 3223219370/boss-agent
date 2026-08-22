// 步骤 3 内容：匹配结果（结果徽章 + 结论句 / 理由分区展示）

import type { LlmParseResult } from '~src/constant/types';
import { EMPTY_PLACEHOLDER } from '../../../constant';
import styles from './index.module.scss';

/** StepResult 组件 Props */
interface StepResultProps {
  /** AI 分析结果（null 显示等待态） */
  result: LlmParseResult | null;
}

/** 步骤 3：结果内容 */
function StepResult({ result }: StepResultProps) {
  if (!result) {
    return <div className={styles.empty}>等待 AI 分析结果</div>;
  }

  // AI 返回无法解析：失败徽章 + 原因分区
  if (!result.ok) {
    return (
      <div className={`${styles.result} ${styles.resultFail}`}>
        <div className={styles.badgeRow}>
          <span className={`${styles.badge} ${styles.badgeFail}`}>解析失败</span>
          <span className={styles.summary}>AI 返回内容无法解析</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.reasonBlock}>
          <div className={styles.reasonLabel}>原因</div>
          <div className={styles.reason}>{result.reason || EMPTY_PLACEHOLDER}</div>
        </div>
      </div>
    );
  }

  const { match, reason } = result;
  return (
    <div className={`${styles.result} ${match ? styles.resultMatch : styles.resultUnmatch}`}>
      <div className={styles.badgeRow}>
        <span className={`${styles.badge} ${match ? styles.badgeMatch : styles.badgeUnmatch}`}>
          {match ? '✓ 匹配' : '✕ 不匹配'}
        </span>
        <span className={styles.summary}>
          {match ? '与你的简历高度契合，建议立即沟通' : '与你的简历匹配度不足，继续下一个岗位'}
        </span>
      </div>
      <div className={styles.divider} />
      <div className={styles.reasonBlock}>
        <div className={styles.reasonLabel}>理由</div>
        <div className={styles.reason}>{reason || EMPTY_PLACEHOLDER}</div>
      </div>
    </div>
  );
}

export default StepResult;
