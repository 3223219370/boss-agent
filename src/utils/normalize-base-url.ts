// URL 规范化纯函数：去除末尾斜杠（ollama 与 openai 客户端共用）

/**
 * 去除基础地址末尾的斜杠，保证拼接路径时不会出现双斜杠
 * @param url 原始基础地址，如 "http://localhost:11434/" 或 "http://localhost:11434//"
 * @returns 规范化地址，如 "http://localhost:11434"
 */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}
