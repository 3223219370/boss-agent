// 错误对象 → 可读文本：catch 到的 unknown 统一提取 message

/**
 * 提取错误信息文本（兼容 Error 实例与任意抛出值）
 * @param err catch 捕获的未知错误
 * @returns 可展示的错误文案
 */
export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
