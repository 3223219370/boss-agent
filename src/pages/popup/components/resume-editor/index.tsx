// 简历编辑区：上传文件自动解析保存 / 粘贴编辑手动保存 / 未保存修改提醒

import { useEffect, useState } from 'react';
import { Button, Input } from 'antd';

import FileDropzone from './file-dropzone';
import styles from './index.module.scss';

/** ResumeEditor 组件 Props */
interface ResumeEditorProps {
  /** 已保存的简历文本 */
  savedText: string;
  /** 保存回调 */
  onSave: (text: string) => void;
  /** 清空回调 */
  onClear: () => void;
}

/** 已保存对勾图标 */
function CheckIcon() {
  return (
    <svg
      className={styles.savedIcon}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 未保存警示图标（三角形感叹号） */
function WarnIcon() {
  return (
    <svg
      className={styles.dirtyIcon}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M8 2.8 14.8 13.2H1.2L8 2.8Z" strokeLinejoin="round" />
      <path d="M8 7v3.2" strokeLinecap="round" />
      <circle cx="8" cy="12.2" r="0.5" fill="currentColor" />
    </svg>
  );
}

/**
 * 简历编辑器
 * - 上传 md/docx/pdf 自动解析并保存，解析结果回填编辑区
 * - 亦可手动粘贴编辑后点「保存」写入 storage（避免误操作清空已存简历）
 * - 草稿与已保存内容不一致时显示「未保存修改」提醒
 */
function ResumeEditor({ savedText, onSave, onClear }: ResumeEditorProps) {
  /** 编辑中的草稿文本（未保存状态） */
  const [draft, setDraft] = useState(savedText);

  // 外部变化（如清空成功）同步到草稿
  useEffect(() => {
    setDraft(savedText);
  }, [savedText]);

  /** 草稿与已保存内容不一致（trim 比较，保存时会 trim，避免仅空格差永远 dirty） */
  const isDirty = draft.trim() !== savedText;
  const hasSaved = savedText.length > 0;

  /**
   * 文件解析成功：等自动保存落盘后由 savedText 同步回填草稿（避免 dirty 中间态闪屏）
   * 解析结果为空时 onSave 内部兜底提示「内容为空」，草稿保持不变
   */
  const handleParsed = async (text: string) => {
    await onSave(text);
  };

  return (
    <div className={styles.container}>
      <FileDropzone onParsed={handleParsed} />
      <Input.TextArea
        rows={4}
        size="small"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="粘贴简历文本…"
        className={styles.textarea}
      />
      <div className={styles.actions}>
        <Button size="small" type="primary" onClick={() => onSave(draft)}>
          {isDirty ? '保存修改' : '保存'}
        </Button>
        <Button size="small" onClick={onClear}>
          清空
        </Button>
        {isDirty ? (
          <span className={styles.dirtyHint}>
            <WarnIcon />
            有未保存的修改
          </span>
        ) : (
          hasSaved && (
            <span className={styles.savedHint}>
              <CheckIcon />
              已保存 · {savedText.length} 字符
            </span>
          )
        )}
      </div>
    </div>
  );
}

export default ResumeEditor;
