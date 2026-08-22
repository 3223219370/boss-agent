// 状态条：操作反馈（成功 / 错误），置于 Tab 上方吸顶展示

import { Alert } from 'antd';

import type { PopupStatus } from '../../types';
import styles from './index.module.scss';

/** StatusLine 组件 Props */
interface StatusLineProps {
  /** 状态内容 */
  status: PopupStatus;
}

/**
 * 顶部状态反馈条
 * - sticky 吸顶：滚动 Tab 内容时操作反馈始终可见
 * - key 随文本变化强制重挂载，复用 antd Alert 自带入场动画
 * - filled 无边框样式 + 类型图标，成功/错误一眼区分
 */
function StatusLine({ status }: StatusLineProps) {
  return (
    <div className={styles.wrap}>
      <Alert
        key={status.text}
        type={status.isError ? 'error' : 'success'}
        title={status.text}
        showIcon
        variant="filled"
        className={styles.alert}
      />
    </div>
  );
}

export default StatusLine;
