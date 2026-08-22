// BOSS 直聘详情描述反爬清理：删除 display:none 的混淆 span 后取文本
// 依赖 DOM，不可 node 单测，浏览器实测（原版逻辑原样迁移）

/**
 * 清理岗位描述容器内的反爬混淆元素（display:none 的 span 与 style 标签）后取文本
 * @param containerEl 详情描述容器（.job-detail-body .desc）
 * @returns 清理后的纯文本（空白折叠为单空格）
 */
export function sanitizeDesc(containerEl: Element): string {
  const clone = containerEl.cloneNode(true) as Element;
  const hidden = clone.querySelectorAll<HTMLElement>('span, style');
  for (const el of hidden) {
    if (el.tagName === 'STYLE' || el.style.display === 'none') {
      el.remove();
    }
  }
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}
