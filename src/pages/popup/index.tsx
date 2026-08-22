// popup 配置面板页面：大模型配置 / 简历 / 运行控制 / 状态反馈

import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 类型导入用别名，避免与组件 LlmConfig 同名
import type { LlmConfig as LlmConfigType } from '~src/constant/types';
import { MESSAGE_TYPES } from '~src/constant/messages';
import { LLM_SERVICE_PRESETS } from '~src/constant/llm-providers';
import type { LlmServiceId } from '~src/constant/llm-providers';
import { usePopupConfig } from './hooks/use-popup-config';
import LlmConfig from './components/llm-config';
import ResumeEditor from './components/resume-editor';
import GreetingModeSelector from './components/greeting-mode';
import AgentActions from './components/agent-actions';
import StatusLine from './components/status-line';
import styles from './index.module.scss';

/**
 * popup 配置面板页根组件
 * - 打开时自动加载已保存配置并刷新模型列表
 * - 配置改动即保存，操作反馈显示在底部状态条
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
    clearResume,
    updateGreetingMode,
    sendToContent,
  } = usePopupConfig();

  /** 切换服务预设：写入对应 provider 与接口地址，并自动刷新模型列表 */
  const handleServiceChange = (serviceId: LlmServiceId) => {
    const preset = LLM_SERVICE_PRESETS.find((p) => p.id === serviceId);
    if (!preset) return;
    const next: Partial<LlmConfigType> = { provider: preset.provider, baseUrl: preset.baseUrl };
    updateConfig(next);
    void refreshModels({ ...config, ...next });
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div className={styles.page}>
        <header className={styles.brand}>
          <span className={styles.logoDot} />
          <span className={styles.brandName}>Boos Agent</span>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>大模型配置</h2>
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

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>简历</h2>
          <ResumeEditor savedText={config.resumeText} onSave={saveResume} onClear={clearResume} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>运行控制</h2>
          <GreetingModeSelector value={config.greetingMode} onChange={updateGreetingMode} />
          <AgentActions
            onStart={() => sendToContent(MESSAGE_TYPES.START)}
            onStop={() => sendToContent(MESSAGE_TYPES.STOP)}
          />
        </section>

        <StatusLine status={status} />
      </div>
    </ConfigProvider>
  );
}

export default PopupPage;
