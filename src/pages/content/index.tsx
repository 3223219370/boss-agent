// 页面浮层根组件：面板整体布局与状态接线（自动循环状态机在下一步接入）

import { useCallback, useEffect, useState } from 'react';

import type { BoosAgentMessage, BoosAgentMessageType } from '~src/constant/messages';
import { MESSAGE_TYPES } from '~src/constant/messages';
import { useAutoAnalysis } from './hooks/use-auto-analysis';
import { playMatchChime } from '~src/utils/play-chime';
import PanelHeader from './components/panel-header';
import StatusBar from './components/status-bar';
import JobInfo from './components/job-info';
import JdSection from './components/jd-section';
import AiResult from './components/ai-result';
import ActionBar from './components/action-bar';
import { MINIM_BUTTON_TEXT } from './constant';
import styles from './index.module.scss';

/**
 * 页面浮层根组件（注入 BOSS 直聘列表页右下角）
 * - 关闭后收起为悬浮圆钮，点击重新打开
 * - 操作按钮显隐由循环状态派生
 */
function ContentApp() {
  const { ui, isLoopActive, grab, analyze, start, resume, stop, close, reopen } = useAutoAnalysis();

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
    <div className={`${styles.panel} ${isMatched ? styles.panelMatch : ''}`}>
      <PanelHeader onClose={close} />
      <StatusBar text={ui.statusText} isError={ui.isError} />
      <JobInfo job={ui.job} />
      <JdSection description={ui.detail?.description} />
      <AiResult result={ui.result} rawText={ui.rawText} onCopy={handleCopy} copied={copied} />
      <ActionBar
        isLoopActive={isLoopActive}
        isMatched={ui.status === 'MATCHED'}
        onGrab={grab}
        onAnalyze={analyze}
        onStart={start}
        onResume={resume}
        onStop={stop}
      />
    </div>
  );
}

export default ContentApp;
