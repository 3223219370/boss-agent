// 操作按钮组：非循环态（分析当前岗位 / 自动分析 + 打招呼模式提示）、循环态（继续 / 停止）

import { Button } from 'antd';

import type { GreetingMode } from '~src/constant/types';
import styles from './index.module.scss';

/** ActionBar 组件 Props */
interface ActionBarProps {
  /** 循环是否激活（运行中或匹配暂停，激活时显示循环态按钮） */
  isLoopActive: boolean;
  /** 是否匹配暂停（显示继续按钮） */
  isMatched: boolean;
  /** 当前打招呼模式（自动 / 手动，展示在自动分析按钮下方） */
  greetingMode: GreetingMode;
  /** 分析当前岗位（抓取 + 分析一次） */
  onAnalyze: () => void;
  /** 开始自动循环分析 */
  onStart: () => void;
  /** 匹配暂停后继续分析 */
  onResume: () => void;
  /** 停止循环 */
  onStop: () => void;
}

/** 打招呼模式提示文案 */
const MODE_HINTS: Record<GreetingMode, string> = {
  auto: '自动打招呼 · 匹配后自动发送',
  manual: '手动打招呼 · 匹配后暂停确认',
};

/** 操作按钮组 */
function ActionBar({ isLoopActive, isMatched, greetingMode, onAnalyze, onStart, onResume, onStop }: ActionBarProps) {
  // 循环激活：按匹配暂停状态显示 继续分析 + 停止分析
  if (isLoopActive) {
    return (
      <div className={styles.foot}>
        {isMatched && (
          <Button type="primary" block onClick={onResume}>
            继续分析
          </Button>
        )}
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
