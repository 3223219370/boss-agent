// 页面浮层根组件：antd 接入 shadow root + 面板整体布局与状态接线
// 关键：antd cssinjs 样式默认注入 document.head，必须用 StyleProvider container=ShadowRoot 注入浮层

import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { StyleProvider } from '@ant-design/cssinjs';
import type { ThemeConfig } from 'antd';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { BoosAgentMessage, BoosAgentMessageType } from '~src/constant/messages';
import { MESSAGE_TYPES } from '~src/constant/messages';
import { useAutoAnalysis } from './hooks/use-auto-analysis';
import { useGreetingMode } from './hooks/use-greeting-mode';
import { playMatchChime } from '~src/utils/play-chime';
import PanelHeader from './components/panel-header';
import StatusBar from './components/status-bar';
import AnalysisSteps from './components/analysis-steps';
import ActionBar from './components/action-bar';
import { MINIM_BUTTON_TEXT } from './constant';
import styles from './index.module.scss';

/** antd 主题：品牌青 #00B8B0 贯穿（步骤激活/匹配/主按钮），墨色正文 + 低饱和描边 */
const THEME: ThemeConfig = {
  token: {
    colorPrimary: '#00B8B0',
    colorInfo: '#00B8B0',
    colorSuccess: '#00B8B0',
    colorError: '#F04438',
    colorTextBase: '#1F2329',
    colorBorder: '#E6E9ED',
    borderRadius: 8,
    fontSize: 13,
    fontFamily:
      "-apple-system, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif",
    // 弹层 z-index 基准：面板 .panel 为 9999，弹层实际为 zIndexPopupBase + 70，
    // 必须高于面板才能浮在面板之上（Popover 展示内容不被面板遮挡）
    zIndexPopupBase: 10000,
  },
};

/**
 * 页面浮层根组件（注入 BOSS 直聘列表页右下角）
 * - 挂载后通过 getRootNode 拿到 ShadowRoot，作为 antd 样式注入与弹层挂载容器
 * - 关闭后收起为悬浮圆钮，点击重新打开
 */
function ContentApp() {
  const { ui, isLoopActive, analyze, start, resume, stop, close, reopen } = useAutoAnalysis();
  /** 浮层根节点引用（getRootNode 取 ShadowRoot） */
  const panelRef = useRef<HTMLDivElement>(null);
  /** antd 样式注入容器（ShadowRoot，就绪后渲染 antd 内容） */
  const [styleContainer, setStyleContainer] = useState<ShadowRoot | null>(null);
  /** 打招呼模式（从配置读取，popup 改动实时同步） */
  const greetingMode = useGreetingMode();

  // 挂载后取 ShadowRoot：panelRef 挂载在 shadow root 内，getRootNode 返回该 ShadowRoot
  useLayoutEffect(() => {
    const rootNode = panelRef.current?.getRootNode();
    if (rootNode instanceof ShadowRoot) {
      setStyleContainer(rootNode);
    }
  }, []);

  /** 打招呼语是否已复制（按钮反馈文案切换） */
  const [copied, setCopied] = useState(false);

  /** 复制打招呼语到剪贴板 */
  const handleCopy = useCallback(async (greeting: string) => {
    if (!greeting) return;
    await navigator.clipboard.writeText(greeting);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  // 新分析结果且匹配：播放提示音（需求 4：匹配提醒增强）
  useEffect(() => {
    if (ui.result?.match) {
      playMatchChime();
    }
  }, [ui.result]);

  // 监听 popup 的开始/停止指令，转发到引擎动作
  useEffect(() => {
    const handlers: Record<BoosAgentMessageType, () => void> = {
      [MESSAGE_TYPES.START]: start,
      [MESSAGE_TYPES.STOP]: stop,
    };
    const listener = (message: BoosAgentMessage) => handlers[message.type]?.();
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [start, stop]);

  /** 当前结果是否匹配（控制面板高亮呼吸动画） */
  const isMatched = ui.result?.match ?? false;

  // 面板已关闭：显示悬浮圆钮
  if (ui.closed) {
    return (
      <button className={styles.minimBtn} title="打开 Boos Agent" onClick={reopen}>
        {MINIM_BUTTON_TEXT}
      </button>
    );
  }

  return (
    <div ref={panelRef} className={`${styles.panel} ${isMatched ? styles.panelMatch : ''}`}>
      {styleContainer && (
        <StyleProvider container={styleContainer}>
          <ConfigProvider
            locale={zhCN}
            theme={THEME}
            getPopupContainer={() => styleContainer}
            // wave 特效样式注入 document.head，进不了 shadow root，禁用避免样式泄漏
            wave={{ disabled: true }}
          >
            <PanelHeader onClose={close} />
            <StatusBar text={ui.statusText} isError={ui.isError} status={ui.status} />
            <AnalysisSteps ui={ui} onCopy={handleCopy} copied={copied} />
            <ActionBar
              isLoopActive={isLoopActive}
              isMatched={ui.status === 'MATCHED'}
              greetingMode={greetingMode}
              onAnalyze={analyze}
              onStart={start}
              onResume={resume}
              onStop={stop}
            />
          </ConfigProvider>
        </StyleProvider>
      )}
    </div>
  );
}

export default ContentApp;
