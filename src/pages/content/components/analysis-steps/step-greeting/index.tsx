// 步骤 4 内容：打招呼语（主按钮「打招呼并继续分析」+ 次要复制按钮；不匹配时置灰占位）

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
  /** 是否显示「打招呼并继续分析」主按钮（匹配且引擎非自动分析中） */
  showGreetContinue: boolean;
  /** 复制回调 */
  onCopy: (greeting: string) => void;
  /** 打招呼并继续分析回调 */
  onGreetContinue: () => void;
  /** 是否已复制（按钮反馈） */
  copied: boolean;
}

/** 步骤 4：打招呼语内容 */
function StepGreeting({
  matched,
  greeting,
  waitingUser,
  active,
  showGreetContinue,
  onCopy,
  onGreetContinue,
  copied,
}: StepGreetingProps) {
  // 不匹配：步骤置灰占位，无复制入口
  if (!matched) {
    return <div className={styles.emptyMuted}>无打招呼语</div>;
  }

  return (
    <div className={`${styles.greeting} ${active ? styles.greetingActive : ''}`}>
      <div className={styles.text}>{greeting || EMPTY_PLACEHOLDER}</div>
      <div className={styles.actions}>
        {showGreetContinue && (
          <Button type="primary" block onClick={onGreetContinue}>
            打招呼并继续分析
          </Button>
        )}
        <div className={styles.copyRow}>
          <Button size="small" disabled={!greeting} onClick={() => onCopy(greeting)}>
            {copied ? '已复制 ✓' : '复制打招呼语'}
          </Button>
          {waitingUser && <span className={styles.hint}>发送后点上方按钮继续</span>}
        </div>
      </div>
    </div>
  );
}

export default StepGreeting;
