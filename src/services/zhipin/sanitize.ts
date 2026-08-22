// BOSS 直聘详情描述反爬清理：删除 style 标签与混淆元素后取文本
// 依赖 DOM，不可 node 单测，浏览器实测
// 反爬混淆两种形态：① 内联 display:none 的 span；② 容器内 style 标签定义隐藏 class（font-size:0 / visibility:hidden / display:none）的 span

/** 样式规则正则：匹配 .className{...} */
const RULE_PATTERN = /\.([\w-]+)\s*\{([^}]*)\}/g;

/** 混淆样式特征：命中任一即视为隐藏类（font-style:normal 等正常类不命中） */
const HIDDEN_STYLE_PATTERN = /display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0/i;

/**
 * 解析容器内 style 标签，收集被定义为隐藏（混淆）的 class 名集合
 * @param containerEl 详情描述容器
 * @returns 隐藏 class 集合
 */
function collectHiddenClasses(containerEl: Element): Set<string> {
  const hiddenClasses = new Set<string>();
  for (const styleTag of containerEl.querySelectorAll('style')) {
    const cssText = styleTag.textContent ?? '';
    let match: RegExpExecArray | null;
    while ((match = RULE_PATTERN.exec(cssText)) !== null) {
      if (HIDDEN_STYLE_PATTERN.test(match[2])) {
        hiddenClasses.add(match[1]);
      }
    }
  }
  return hiddenClasses;
}

/**
 * 清理岗位描述容器内的反爬混淆元素（style 标签 + 隐藏类 span + 内联 display:none 的 span）后取文本
 * @param containerEl 详情描述容器（.job-detail-body .desc）
 * @returns 清理后的纯文本（空白折叠为单空格）
 */
export function sanitizeDesc(containerEl: Element): string {
  const clone = containerEl.cloneNode(true) as Element;
  const hiddenClasses = collectHiddenClasses(clone);
  for (const el of clone.querySelectorAll<HTMLElement>('span, style')) {
    const hasHiddenClass = Array.from(el.classList).some((c) => hiddenClasses.has(c));
    if (el.tagName === 'STYLE' || hasHiddenClass || el.style.display === 'none') {
      el.remove();
    }
  }
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}
