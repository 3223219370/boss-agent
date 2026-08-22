// 步骤 4 内容：打招呼语（复制按钮；不匹配时置灰占位）

import { Button } from 'antd';

import { EMPTY_PLACEHOLDER } from '../../../constant';
import styles from './index.module.scss';

/** StepGreeting 组件 Props */
interface StepGreetingProps {
  /** 是否匹配（不匹配置灰占位） */
  matched: boolean;
  /** AI 生成的打招呼语 */
  greeting: string;
  /** 手动模式匹配暂停中（提示用户操作） */
  waitingUser: boolean;
  /** 是否当前进行中步骤（内容卡激活态） */
  active: boolean;
  /** 复制回调 */
  onCopy: (greeting: string) => void;
  /** 是否已复制（按钮反馈） */
  copied: boolean;
}

/** 步骤 4：打招呼语内容 */
function StepGreeting({ matched, greeting, waitingUser, active, onCopy, copied }: StepGreetingProps) {
  // 不匹配：步骤置灰占位，无复制入口
  if (!matched) {
    return <div className={styles.emptyMuted}>无打招呼语</div>;
  }

  return (
    <div className={`${styles.greeting} ${active ? styles.greetingActive : ''}`}>
      <div className={styles.text}>{greeting || EMPTY_PLACEHOLDER}</div>
      <div className={styles.actions}>
        <Button
          size="small"
          type="primary"
          disabled={!greeting}
          onClick={() => onCopy(greeting)}
        >
          {copied ? '已复制 ✓' : '复制打招呼语'}
        </Button>
        {waitingUser && <span className={styles.hint}>发送后点「继续分析」</span>}
      </div>
    </div>
  );
}

export default StepGreeting;
