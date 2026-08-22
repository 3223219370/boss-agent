// 面板样式聚合：data-text: 批量导入各组件 module.scss 文本，经 getStyle 注入 shadow root
// 注意：content 浮层不能用普通 import（CSS 会被抽到页面文档层，进不了 shadow root），必须走 data-text:

import panel from 'data-text:./index.module.scss';
import panelHeader from 'data-text:./components/panel-header/index.module.scss';
import statusBar from 'data-text:./components/status-bar/index.module.scss';
import jobInfo from 'data-text:./components/job-info/index.module.scss';
import jdSection from 'data-text:./components/jd-section/index.module.scss';
import aiResult from 'data-text:./components/ai-result/index.module.scss';
import actionBar from 'data-text:./components/action-bar/index.module.scss';

/** 全部面板样式的拼接文本（注入 shadow root 的 <style> 内容） */
export const PANEL_STYLES = [
  panel,
  panelHeader,
  statusBar,
  jobInfo,
  jdSection,
  aiResult,
  actionBar,
].join('\n');
