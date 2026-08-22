// 浮层面板头部：品牌标识 + 关闭按钮

import styles from './index.module.scss';

/** PanelHeader 组件 Props */
interface PanelHeaderProps {
  /** 关闭面板回调 */
  onClose: () => void;
}

/** 面板头部（品牌 + 关闭） */
function PanelHeader({ onClose }: PanelHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logoDot} />
        <span className={styles.brandName}>Boos Agent</span>
      </div>
      <button className={styles.closeBtn} title="关闭" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default PanelHeader;
