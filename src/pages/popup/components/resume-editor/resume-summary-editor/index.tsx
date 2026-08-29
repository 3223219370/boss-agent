// 简化简历编辑区：AI 从完整简历中提取招聘相关信息（技术栈/项目经验等），生成可编辑的紧凑文本并保存

import { useCallback, useEffect, useState } from 'react';
import { Button, Input } from 'antd';

import type { LlmConfig } from '~src/constant/types';
import { summarizeResume } from '~src/services/resume-summary';
import { getErrorMessage } from '~src/utils/error-message';

import styles from './index.module.scss';

/** ResumeSummaryEditor 组件 Props */
interface ResumeSummaryEditorProps {
  /** LLM 配置（provider/baseUrl/apiKey/model） */
  llmConfig: LlmConfig;
  /** 完整简历文本（简化输入源） */
  resumeText: string;
  /** 已保存的简化简历文本 */
  summaryText: string;
  /** 简化简历保存回调（AI 生成后自动保存；用户编辑微调后点「保存」） */
  onSave: (text: string) => void;
  /** 上传完成信号：值变化触发一次自动生成（初始 0，上传成功后 +1） */
  autoTriggerSignal: number;
}

/**
 * 简化简历编辑区
 * - 上传完整简历后自动调用 LLM 提取招聘相关信息，也可点「重新生成」手动再生成
 * - 生成结果自动保存落盘，用户可编辑微调后点「保存」
 * - 校验/生成失败在组件内就近展示，不打扰全局状态条
 */
function ResumeSummaryEditor({
  llmConfig,
  resumeText,
  summaryText,
  onSave,
  autoTriggerSignal,
}: ResumeSummaryEditorProps) {
  /** 编辑中的草稿文本（未保存状态） */
  const [draft, setDraft] = useState(summaryText);
  /** AI 生成中 */
  const [isGenerating, setIsGenerating] = useState(false);
  /** 校验或生成错误信息 */
  const [error, setError] = useState('');

  // 外部变化（保存/清空成功）同步到草稿
  useEffect(() => {
    setDraft(summaryText);
  }, [summaryText]);

  /** 草稿与已保存内容不一致 */
  const isDirty = draft.trim() !== summaryText;
  const hasSummary = summaryText.length > 0;

  /** 调用 LLM 简化简历：校验 → 生成 → 自动保存；失败组件内展示错误 */
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;
    if (!resumeText.trim()) {
      setError('请先在上方粘贴或上传完整简历');
      return;
    }
    if (!llmConfig.model) {
      setError('请先在大模型配置 Tab 中选择模型');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const summary = await summarizeResume(llmConfig, resumeText);
      await onSave(summary);
    } catch (err) {
      setError(`简化失败：${getErrorMessage(err)}`);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, resumeText, llmConfig, onSave]);

  // 上传完整简历成功后自动生成一次（初始信号为 0 时跳过）
  useEffect(() => {
    if (autoTriggerSignal === 0) return;
    void handleGenerate();
  }, [autoTriggerSignal, handleGenerate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>简化简历</span>
        <span className={styles.hint}>
          AI 提取招聘相关信息（技术栈 / 项目经验等），分析岗位时优先使用，节省 token
        </span>
      </div>
      <Input.TextArea
        rows={4}
        size="small"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="点击「生成简化简历」由 AI 从完整简历中提取招聘相关信息…"
        className={styles.textarea}
      />
      <div className={styles.actions}>
        <Button
          size="small"
          type="primary"
          loading={isGenerating}
          onClick={() => void handleGenerate()}
        >
          {hasSummary ? '重新生成' : '生成简化简历'}
        </Button>
        {isDirty && (
          <Button size="small" onClick={() => onSave(draft)}>
            保存
          </Button>
        )}
        {!isGenerating && !isDirty && hasSummary && (
          <span className={styles.savedHint}>
            ✓ 已生成并保存 · {summaryText.length} 字符
          </span>
        )}
      </div>
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}

export default ResumeSummaryEditor;
