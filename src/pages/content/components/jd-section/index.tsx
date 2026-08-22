// 岗位描述折叠区：JD 文本（未抓取时显示占位）

import { EMPTY_PLACEHOLDER } from '../../constant';
import styles from './index.module.scss';

/** JdSection 组件 Props */
interface JdSectionProps {
  /** 岗位描述文本（undefined 显示占位） */
  description?: string;
}

/** 岗位描述折叠区 */
function JdSection({ description }: JdSectionProps) {
  return (
    <details className={styles.jd} open>
      <summary>岗位描述</summary>
      <div className={styles.jdBody}>{description ?? EMPTY_PLACEHOLDER}</div>
    </details>
  );
}

export default JdSection;
