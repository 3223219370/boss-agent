// 状态条：操作反馈（成功 / 错误）

import { Alert } from 'antd';

import type { PopupStatus } from '../../types';
import styles from './index.module.scss';

/** StatusLine 组件 Props */
interface StatusLineProps {
  /** 状态内容 */
  status: PopupStatus;
}

/** 底部状态反馈条 */
function StatusLine({ status }: StatusLineProps) {
  return (
    <Alert
      type={status.isError ? 'error' : 'success'}
      message={status.text}
      showIcon={false}
      className={styles.alert}
    />
  );
}

export default StatusLine;
