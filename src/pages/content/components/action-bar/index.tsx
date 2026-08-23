// 操作按钮组：非循环态（分析当前岗位 / 自动分析 + 打招呼模式提示）、循环态（停止）
// 注：匹配暂停后的「继续」操作由打招呼卡主按钮「打招呼并继续分析」承担，这里只保留停止

import { Button } from 'antd';

import type { GreetingMode } from '~src/constant/types';
import styles from './index.module.scss';

/** ActionBar 组件 Props */
interface ActionBarProps {
  /** 循环是否激活（运行中或匹配暂停，激活时显示停止按钮） */
  isLoopActive: boolean;
  /** 当前打招呼模式（自动 / 手动，展示在自动分析按钮下方） */
  greetingMode: GreetingMode;
  /** 分析当前岗位（抓取 + 分析一次） */
  onAnalyze: () => void;
  /** 开始自动循环分析 */
  onStart: () => void;
  /** 停止循环 */
  onStop: () => void;
}

/** 打招呼模式提示文案 */
const MODE_HINTS: Record<GreetingMode, string> = {
  auto: '自动打招呼 · 匹配后自动发送',
  manual: '手动打招呼 · 匹配后暂停确认',
};

/** 操作按钮组 */
function ActionBar({ isLoopActive, greetingMode, onAnalyze, onStart, onStop }: ActionBarProps) {
  // 循环激活：只显示停止（匹配暂停的继续入口在打招呼卡主按钮）
  if (isLoopActive) {
    return (
      <div className={styles.foot}>
        <Button block onClick={onStop}>
          停止分析
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.foot}>
      <Button type="primary" block onClick={onAnalyze}>
        分析当前岗位
      </Button>
      <Button block onClick={onStart}>
        自动分析
      </Button>
      <div className={styles.modeHint}>{MODE_HINTS[greetingMode]}</div>
    </div>
  );
}

export default ActionBar;
