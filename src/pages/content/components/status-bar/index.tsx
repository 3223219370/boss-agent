// 状态条：状态点 + 状态文本（错误态红色展示）

import styles from './index.module.scss';

/** StatusBar 组件 Props */
interface StatusBarProps {
  /** 状态文本 */
  text: string;
  /** 是否错误态 */
  isError?: boolean;
}

/** 状态条（顶部状态指示） */
function StatusBar({ text, isError = false }: StatusBarProps) {
  return (
    <div className={styles.statusRow}>
      <span className={`${styles.statusDot} ${isError ? styles.dotError : ''}`} />
      <span className={`${styles.status} ${isError ? styles.textError : ''}`}>{text}</span>
    </div>
  );
}

export default StatusBar;
