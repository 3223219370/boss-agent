// 步骤 2 内容：AI 分析（输入 Prompt 与模型输出，hover Popover 查看全文）

import { Popover } from 'antd';

import styles from './index.module.scss';

/** StepAi 组件 Props */
interface StepAiProps {
  /** 输入给大模型的 prompt 全文 */
  prompt: string;
  /** LLM 原始输出文本 */
  rawText: string;
  /** 是否分析中（loading 提示） */
  analyzing: boolean;
  /** 是否当前进行中步骤（内容卡激活态） */
  active: boolean;
}

/** 步骤 2：AI 分析内容 */
function StepAi({ prompt, rawText, analyzing, active }: StepAiProps) {
  return (
    <div className={`${styles.ai} ${active ? styles.aiActive : ''}`}>
      {analyzing && <div className={styles.loading}>AI 正在阅读岗位与简历…</div>}
      <div className={styles.row}>
        <span className={styles.label}>输入 Prompt</span>
        <Popover
          title="输入给大模型的内容"
          placement="left"
          trigger="hover"
          content={<pre className={styles.code}>{prompt || '暂无'}</pre>}
        >
          <span className={styles.link}>{prompt ? '查看' : '—'}</span>
        </Popover>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>模型输出</span>
        <Popover
          title="大模型原始输出"
          placement="left"
          trigger="hover"
          content={<pre className={styles.code}>{rawText || '暂无'}</pre>}
        >
          <span className={styles.link}>{rawText ? '查看' : '—'}</span>
        </Popover>
      </div>
    </div>
  );
}

export default StepAi;
