// 简历文件解析：md / docx / pdf 转纯文本（popup 上传简历用）

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

import mammoth from 'mammoth/mammoth.browser.js';

// pdfjs worker 资源经 Parcel new URL 静态打包进扩展产物，popup 内按扩展协议直接加载
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/** 支持上传的简历文件扩展名（小写、含点） */
export const RESUME_FILE_TYPES = ['.md', '.docx', '.pdf'] as const;

/** 简历文件大小上限（5MB） */
export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024;

/** 合法扩展名集合（避免 includes 与联合类型冲突） */
const SUPPORTED_EXT_SET = new Set<string>(RESUME_FILE_TYPES);

/** 各扩展名对应的解析函数 */
const parsers: Record<string, (file: File) => Promise<string>> = {
  '.md': readPlainText,
  '.docx': parseDocx,
  '.pdf': parsePdf,
};

/** 从文件名提取小写扩展名（含点）；无扩展名返回空串 */
function getFileExt(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : '';
}

/**
 * 校验简历文件：扩展名合法 + 未超大小上限
 * @param file 待校验文件
 * @returns 错误信息；合法时返回 null
 */
export function validateResumeFile(file: File): string | null {
  if (!SUPPORTED_EXT_SET.has(getFileExt(file.name))) {
    return `仅支持 ${RESUME_FILE_TYPES.join(' / ')} 格式的文件`;
  }
  if (file.size > MAX_RESUME_FILE_SIZE) {
    return '文件超过 5MB 大小上限';
  }
  return null;
}

/**
 * 解析简历文件为纯文本（按扩展名分发）
 * @param file 已通过 validateResumeFile 校验的文件
 * @returns 简历纯文本（docx 取正文文字，pdf 逐页拼接）
 */
export async function parseResumeFile(file: File): Promise<string> {
  const parse = parsers[getFileExt(file.name)];
  if (!parse) {
    throw new Error(`不支持的文件格式：${file.name}`);
  }
  return await parse(file);
}

/** md：按 UTF-8 直接读取文本 */
async function readPlainText(file: File): Promise<string> {
  return await file.text();
}

/** docx：mammoth 提取纯文本（忽略图片与样式，仅正文文字） */
async function parseDocx(file: File): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

/** pdf：逐页提取文本项（项间空格分隔避免单词粘连），页间换行拼接 */
async function parsePdf(file: File): Promise<string> {
  const loadingTask = getDocument({ data: await file.arrayBuffer() });
  try {
    const pdf = await loadingTask.promise;
    const pageTexts: string[] = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      const line = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pageTexts.push(line);
    }
    return pageTexts.join('\n');
  } finally {
    await loadingTask.destroy();
  }
}
