// 打招呼模式选择：自动（匹配后自动发送并继续下一个）/ 手动（暂停等确认）

import { Segmented } from 'antd';

import type { GreetingMode } from '~src/constant/types';
import styles from './index.module.scss';

/** GreetingModeSelector 组件 Props */
interface GreetingModeSelectorProps {
  /** 当前模式 */
  value: GreetingMode;
  /** 模式变更回调（改动即保存） */
  onChange: (mode: GreetingMode) => void;
}

/** 打招呼模式选择器（运行控制区） */
function GreetingModeSelector({ value, onChange }: GreetingModeSelectorProps) {
  return (
    <div className={styles.mode}>
      <Segmented<GreetingMode>
        size="small"
        block
        value={value}
        onChange={onChange}
        options={[
          { label: '自动打招呼', value: 'auto' },
          { label: '手动确认', value: 'manual' },
        ]}
      />
      <span className={styles.hint}>
        {value === 'auto'
          ? '匹配后自动发送招呼语并继续下一个岗位'
          : '匹配后暂停，等你复制招呼语后点继续'}
      </span>
    </div>
  );
}

export default GreetingModeSelector;
