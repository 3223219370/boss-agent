// 步骤 2 内容：AI 分析（输入 Prompt 与模型输出，hover Popover 查看全文；Statistic 展示 token 用量）

import { Popover, Statistic } from 'antd';

import styles from './index.module.scss';

/** StepAi 组件 Props */
interface StepAiProps {
  /** 输入给大模型的 prompt 全文 */
  prompt: string;
  /** LLM 原始输出文本 */
  rawText: string;
  /** 输入 token 数（API 未返回时为 undefined，不展示） */
  promptTokens?: number;
  /** 输出 token 数（API 未返回时为 undefined，不展示） */
  completionTokens?: number;
  /** 是否分析中（loading 提示） */
  analyzing: boolean;
  /** 是否当前进行中步骤（内容卡激活态） */
  active: boolean;
}

/**
 * token 数展示：Statistic 自带千分位，与 12px 正文协调
 * @param value token 数
 * @returns Statistic 节点（undefined 时不渲染）
 */
function renderTokens(value: number | undefined) {
  if (value == null) return null;
  return (
    <Statistic
      value={value}
      suffix="tokens"
      // valueStyle 在 v6 已废弃，改用语义化 styles.content 压小字号
      styles={{ content: { fontSize: 12, color: '#6b7280' } }}
    />
  );
}

/** 步骤 2：AI 分析内容 */
function StepAi({ prompt, rawText, promptTokens, completionTokens, analyzing, active }: StepAiProps) {
  return (
    <div className={`${styles.ai} ${active ? styles.aiActive : ''}`}>
      {analyzing && <div className={styles.loading}>AI 正在阅读岗位与简历…</div>}
      <div className={styles.row}>
        <span className={styles.label}>输入 Prompt</span>
        <div className={styles.actions}>
          {renderTokens(promptTokens)}
          <Popover
            title="输入给大模型的内容"
            placement="left"
            trigger="hover"
            content={<pre className={styles.code}>{prompt || '暂无'}</pre>}
          >
            <span className={styles.link}>{prompt ? '查看' : '—'}</span>
          </Popover>
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>模型输出</span>
        <div className={styles.actions}>
          {renderTokens(completionTokens)}
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
    </div>
  );
}

export default StepAi;
