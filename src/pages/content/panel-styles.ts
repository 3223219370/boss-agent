// 面板样式聚合：data-text: 批量导入各组件 module.scss 文本，经 getStyle 注入 shadow root
// 注意：content 浮层不能用普通 import（CSS 会被抽到页面文档层，进不了 shadow root），必须走 data-text:
// antd 组件样式不走这里（cssinjs 经 StyleProvider 注入 shadow root），此处仅聚合纯 CSS Modules 组件

import panel from 'data-text:./index.module.scss';
import panelHeader from 'data-text:./components/panel-header/index.module.scss';
import statusBar from 'data-text:./components/status-bar/index.module.scss';
import analysisSteps from 'data-text:./components/analysis-steps/index.module.scss';
import stepJob from 'data-text:./components/analysis-steps/step-job/index.module.scss';
import stepAi from 'data-text:./components/analysis-steps/step-ai/index.module.scss';
import stepResult from 'data-text:./components/analysis-steps/step-result/index.module.scss';
import stepGreeting from 'data-text:./components/analysis-steps/step-greeting/index.module.scss';
import actionBar from 'data-text:./components/action-bar/index.module.scss';

/** 全部面板样式的拼接文本（注入 shadow root 的 <style> 内容） */
export const PANEL_STYLES = [
  panel,
  panelHeader,
  statusBar,
  analysisSteps,
  stepJob,
  stepAi,
  stepResult,
  stepGreeting,
  actionBar,
].join('\n');
