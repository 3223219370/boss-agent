// popup 配置面板页面：顶部状态反馈 + 三个 Tab（大模型配置 / 简历配置 / 运行配置）

import { ConfigProvider, Tabs } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 类型导入用别名，避免与组件 LlmConfig 同名
import type { LlmConfig as LlmConfigType } from '~src/constant/types';
import { MESSAGE_TYPES } from '~src/constant/messages';
import { LLM_SERVICE_PRESETS } from '~src/constant/llm-providers';
import type { LlmServiceId } from '~src/constant/llm-providers';
import { usePopupConfig } from './hooks/use-popup-config';
import LlmConfig from './components/llm-config';
import ResumeEditor from './components/resume-editor';
import AgentActions from './components/agent-actions';
import GreetingModeSelector from './components/greeting-mode';
import HistoryTab from './components/history-tab';
import StatusLine from './components/status-line';
import styles from './index.module.scss';

/**
 * popup 配置面板页根组件
 * - 顶部状态条吸顶展示操作反馈；下方 Tab 承载三类配置
 * - 打开时自动加载已保存配置并刷新模型列表
 * - 配置改动即保存
 */
function PopupPage() {
  const {
    config,
    models,
    status,
    isFetchingModels,
    isTesting,
    updateConfig,
    refreshModels,
    testConnection,
    saveResume,
    saveResumeSummary,
    clearResume,
    updateGreetingMode,
    sendToContent,
  } = usePopupConfig();

  /** 切换服务预设：写入对应 provider 与接口地址，并自动刷新模型列表 */
  const handleServiceChange = (serviceId: LlmServiceId) => {
    const preset = LLM_SERVICE_PRESETS.find((p) => p.id === serviceId);
    if (!preset) return;
    const next: Partial<LlmConfigType> = { provider: preset.provider, baseUrl: preset.baseUrl, apiKey: '', model: '' };
    updateConfig(next);
    void refreshModels({ ...config, ...next });
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div className={styles.page}>
        <header className={styles.brand}>
          <span className={styles.logoDot} />
          <span className={styles.brandName}>Boss Agent</span>
        </header>

        <StatusLine status={status} />

        <Tabs
          size="small"
          className={styles.tabs}
          items={[
            {
              key: 'llm',
              label: '大模型配置',
              children: (
                <section className={styles.section}>
                  <LlmConfig
                    config={config}
                    models={models}
                    isFetchingModels={isFetchingModels}
                    isTesting={isTesting}
                    onConfigChange={updateConfig}
                    onServiceChange={handleServiceChange}
                    onRefreshModels={() => refreshModels(config)}
                    onTestConnection={() => testConnection(config)}
                  />
                </section>
              ),
            },
            {
              key: 'resume',
              label: '简历配置',
              children: (
                <section className={styles.section}>
                  <ResumeEditor
                    savedText={config.resumeText}
                    onSave={saveResume}
                    onClear={clearResume}
                    llmConfig={config}
                    summaryText={config.resumeSummary}
                    onSummarySave={saveResumeSummary}
                  />
                </section>
              ),
            },
            {
              key: 'run',
              label: '运行配置',
              children: (
                <section className={styles.section}>
                  <GreetingModeSelector value={config.greetingMode} onChange={updateGreetingMode} />
                  {/* <AgentActions
                    onStart={() => sendToContent(MESSAGE_TYPES.START)}
                    onStop={() => sendToContent(MESSAGE_TYPES.STOP)}
                  /> */}
                </section>
              ),
            },
            {
              key: 'history',
              label: '分析记录',
              children: (
                <section className={styles.section}>
                  <HistoryTab />
                </section>
              ),
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
}

export default PopupPage;
