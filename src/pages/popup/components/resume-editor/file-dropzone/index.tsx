// 简历文件上传条：点击或拖拽上传 md/docx/pdf，解析为纯文本后回调

import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

import { parseResumeFile, RESUME_FILE_TYPES, validateResumeFile } from '~src/utils/resume-parser';

import styles from './index.module.scss';

/** FileDropzone 组件 Props */
interface FileDropzoneProps {
  /** 解析成功回调（已提取纯文本） */
  onParsed: (text: string, fileName: string) => void;
}

/** 上传图标（内联 SVG，随状态变色） */
function UploadIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M8 10.5V3M5 5.5 8 2.5l3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 简历文件上传条：支持点击选择与拖拽投放
 * - 解析中显示 loading，忽略重复投放
 * - 校验/解析失败在组件内就近展示错误，不打扰全局状态条
 */
function FileDropzone({ onParsed }: FileDropzoneProps) {
  /** 隐藏的文件选择 input，点击上传条时触发选择 */
  const inputRef = useRef<HTMLInputElement>(null);
  /** 拖拽深度计数：dragenter/dragleave 成对增减，归零才取消高亮（防子元素闪烁） */
  const dragDepthRef = useRef(0);
  /** 是否拖拽悬停（高亮提示可投放） */
  const [isDragging, setIsDragging] = useState(false);
  /** 正在解析中 */
  const [isParsing, setIsParsing] = useState(false);
  /** 校验或解析错误信息 */
  const [error, setError] = useState('');

  /** 校验并解析所选文件：成功回调文本，失败组件内展示错误 */
  const handleFile = async (file: File) => {
    if (isParsing) return;
    const validateError = validateResumeFile(file);
    if (validateError) {
      setError(validateError);
      return;
    }
    setError('');
    setIsParsing(true);
    try {
      const text = await parseResumeFile(file);
      onParsed(text, file.name);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '文件解析失败，请检查文件是否损坏';
      setError(message);
    } finally {
      setIsParsing(false);
    }
  };

  /** 点击上传条：触发隐藏文件选择框（解析中忽略） */
  const handleClick = () => {
    if (!isParsing) inputRef.current?.click();
  };

  /** 文件选择框确认：解析选中文件并重置 value（允许重复选同一文件） */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  /** 拖入：计数 +1 并高亮（preventDefault 阻止浏览器直接打开文件） */
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  /** 拖出：计数 -1，归零取消高亮 */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  };

  /** 投放：取第一个文件解析 */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const dropzoneClass = [
    styles.dropzone,
    isDragging && styles.dropzoneActive,
    isParsing && styles.dropzoneBusy,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="button"
      tabIndex={0}
      className={dropzoneClass}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={RESUME_FILE_TYPES.join(',')}
        onChange={handleInputChange}
      />
      <div className={styles.mainRow}>
        {isParsing ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span className={styles.parsingText}>正在解析…</span>
          </>
        ) : (
          <>
            <UploadIcon />
            <span className={styles.mainText}>点击或拖拽上传简历文件</span>
          </>
        )}
      </div>
      <div className={error ? styles.errorText : styles.hintText}>
        {error || `支持 ${RESUME_FILE_TYPES.join(' / ')} · 单个文件不超过 5MB`}
      </div>
    </div>
  );
}

export default FileDropzone;
