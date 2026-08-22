// 操作按钮组：抓取/分析（手动态）、开始/继续/停止（循环态），按状态派生显隐

import styles from './index.module.scss';

/** ActionBar 组件 Props */
interface ActionBarProps {
  /** 循环是否激活（运行中或匹配暂停，激活时隐藏手动按钮） */
  isLoopActive: boolean;
  /** 是否匹配暂停（显示继续按钮） */
  isMatched: boolean;
  /** 抓取当前岗位 */
  onGrab: () => void;
  /** 手动分析当前岗位 */
  onAnalyze: () => void;
  /** 开始自动循环 */
  onStart: () => void;
  /** 匹配暂停后继续 */
  onResume: () => void;
  /** 停止循环 */
  onStop: () => void;
}

/** 操作按钮组 */
function ActionBar({ isLoopActive, isMatched, onGrab, onAnalyze, onStart, onResume, onStop }: ActionBarProps) {
  return (
    <>
      {!isLoopActive && (
        <div className={styles.foot}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onGrab}>
            抓取岗位
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onAnalyze}>
            分析岗位
          </button>
        </div>
      )}
      {isLoopActive ? (
        <>
          {isMatched && (
            <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`} onClick={onResume}>
              继续分析
            </button>
          )}
          <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnFull}`} onClick={onStop}>
            停止分析
          </button>
        </>
      ) : (
        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`} onClick={onStart}>
          开始分析
        </button>
      )}
    </>
  );
}

export default ActionBar;
