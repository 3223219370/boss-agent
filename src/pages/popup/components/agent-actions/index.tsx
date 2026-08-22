// 运行控制区：向 BOSS 直聘页面的 content script 发送开始 / 停止指令

import { Button } from 'antd';

import styles from './index.module.scss';

/** AgentActions 组件 Props */
interface AgentActionsProps {
  /** 开始分析回调 */
  onStart: () => void;
  /** 停止分析回调 */
  onStop: () => void;
}

/** 运行控制按钮组 */
function AgentActions({ onStart, onStop }: AgentActionsProps) {
  return (
    <div className={styles.row}>
      <Button type="primary" block onClick={onStart}>
        开始分析
      </Button>
      <Button danger block onClick={onStop}>
        停止分析
      </Button>
    </div>
  );
}

export default AgentActions;
