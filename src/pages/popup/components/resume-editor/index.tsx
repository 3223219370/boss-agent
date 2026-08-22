// 简历编辑区：粘贴简历文本，保存到 storage / 清空

import { useEffect, useState } from 'react';
import { Button, Input } from 'antd';

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

/**
 * 简历编辑器：编辑内容本地暂存，点「保存」才写入 storage（避免误操作清空已存简历）
 */
function ResumeEditor({ savedText, onSave, onClear }: ResumeEditorProps) {
  /** 编辑中的草稿文本（未保存状态） */
  const [draft, setDraft] = useState(savedText);

  // 外部变化（如清空成功）同步到草稿
  useEffect(() => {
    setDraft(savedText);
  }, [savedText]);

  const hasSaved = savedText.length > 0;

  return (
    <div>
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
          保存
        </Button>
        <Button size="small" onClick={onClear}>
          清空
        </Button>
        {hasSaved && <span className={styles.savedHint}>已保存 {savedText.length} 字符</span>}
      </div>
    </div>
  );
}

export default ResumeEditor;
