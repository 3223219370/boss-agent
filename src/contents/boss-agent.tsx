// content script 入口（CSUI）：注入 BOSS 直聘页面，渲染 Shadow DOM 浮层
// 关键约定：自定义 getRootContainer 时 Plasmo 不会调用 getStyle，样式必须在 getRootContainer 内手动注入

import type { PlasmoCSConfig, PlasmoGetRootContainer } from 'plasmo';

import ContentApp from '~src/pages/content';
import { PANEL_STYLES } from '~src/pages/content/panel-styles';

/**
 * 注入范围：整个 zhipin.com 域
 * - BOSS 直聘是 SPA：从首页/详情页站内导航（history.pushState）进入列表页不触发页面加载，
 *   若 matches 只写列表页路径，content script 永远不会注入该页面（Chrome 只在整页加载时按 URL 匹配注入一次）
 * - 是否显示浮层由运行时 URL 判断控制：useIsListPage（src/pages/content/hooks/use-is-list-page.ts）
 * - 列表页路径集合见 src/pages/content/constant.ts 的 JOB_LIST_PATHS
 */
export const config: PlasmoCSConfig = {
  matches: ['https://www.zhipin.com/*'],
};

/**
 * 创建浮层挂载点：Shadow DOM 隔离页面样式
 * - 幂等：发现旧 host 先移除（plasmo dev HMR 重载时避免重复浮层）
 * - 样式手动注入 shadow root（自定义 getRootContainer 时 getStyle 不会被调用）
 * - 面板自身的 fixed 定位见 src/pages/content/index.module.scss
 */
export const getRootContainer: PlasmoGetRootContainer = () => {
  document.getElementById('boss-agent-root')?.remove();

  const host = document.createElement('div');
  host.id = 'boss-agent-root';
  host.style.cssText = 'position: fixed; right: 20px; bottom: 20px; z-index: 2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = PANEL_STYLES;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.id = 'boss-agent-container';
  shadow.appendChild(container);
  document.documentElement.appendChild(host);
  return container;
};

export default ContentApp;
