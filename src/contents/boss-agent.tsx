// content script 入口（CSUI）：注入 BOSS 直聘页面，渲染 Shadow DOM 浮层
// 关键约定：自定义 getRootContainer 时 Plasmo 不会调用 getStyle，样式必须在 getRootContainer 内手动注入

import type { PlasmoCSConfig, PlasmoGetRootContainer } from 'plasmo';

import ContentApp from '~src/pages/content';
import { PANEL_STYLES } from '~src/pages/content/panel-styles';

/**
 * 注入范围：仅 BOSS 直聘岗位列表类页面（其他路由无岗位列表结构，浮层无意义）
 * - query 参数不参与 match pattern 的 path 匹配，带 ?ka= / ?query= 等参数的 URL 同样注入
 * - 精确路径匹配避免误伤详情页 /web/geek/job/xxx.html 等非列表页
 */
export const config: PlasmoCSConfig = {
  matches: [
    'https://www.zhipin.com/web/geek/jobs', // 职位推荐列表页
    'https://www.zhipin.com/web/geek/job', // 搜索结果列表页
  ],
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
