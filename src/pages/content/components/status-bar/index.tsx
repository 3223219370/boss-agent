// 状态条：antd Alert 展示当前状态（错误红 / 成功绿 / 信息蓝），filled 变体 + 图标提升可见性

import { Alert } from 'antd';
import type { AlertProps } from 'antd';

import type { LoopStatus } from '~src/constant/types';
import styles from './index.module.scss';

/** StatusBar 组件 Props */
interface StatusBarProps {
  /** 状态文本 */
  text: string;
  /** 是否错误态（红色展示） */
  isError?: boolean;
  /** 循环状态机状态（成功态派生绿色） */
  status: LoopStatus;
}

/** 成功态：匹配暂停等待操作 / 循环分析完成 */
const SUCCESS_STATUSES = new Set<LoopStatus>(['MATCHED', 'DONE']);

/** 状态条（面板顶部反馈横幅） */
function StatusBar({ text, isError = false, status }: StatusBarProps) {
  /** 状态类型：错误优先，其次成功态，其余为信息态 */
  const type: AlertProps['type'] = isError ? 'error' : SUCCESS_STATUSES.has(status) ? 'success' : 'info';

  return <Alert type={type} variant="filled" showIcon title={text} className={styles.alert} />;
}

export default StatusBar;
