// 大模型配置区：服务类型（含预设联动）/ 接口地址 / API Key / 模型选择与连接测试

import { Button, Input, Select } from 'antd';

// 类型导入用别名，避免与组件函数名 LlmConfig 同名冲突（verbatimModuleSyntax 下导出解析会混淆）
import type { LlmConfig as LlmConfigType } from '~src/constant/types';
import {
  CUSTOM_SERVICE_ID,
  LLM_SERVICE_PRESETS,
  matchServicePreset,
} from '~src/constant/llm-providers';
import type { LlmServiceId } from '~src/constant/llm-providers';
import { SERVICE_OPTIONS } from '../../constant';
import styles from './index.module.scss';

/** LlmConfig 组件 Props */
interface LlmConfigProps {
  /** LLM 配置（provider/baseUrl/apiKey/model） */
  config: LlmConfigType;
  /** 可用模型列表 */
  models: string[];
  /** 获取模型中 */
  isFetchingModels: boolean;
  /** 测试连接中 */
  isTesting: boolean;
  /** 配置变更回调（改动即保存） */
  onConfigChange: (partial: Partial<LlmConfigType>) => void;
  /** 服务类型切换回调（切换预设时自动写入对应接口地址并刷新模型） */
  onServiceChange: (serviceId: LlmServiceId) => void;
  /** 刷新模型回调 */
  onRefreshModels: () => void;
  /** 测试连接回调 */
  onTestConnection: () => void;
}

/**
 * 大模型配置表单：配置修改即保存；服务类型下拉直接选择 Ollama / DeepSeek / 千问预设，
 * 接口地址与预设联动回显；OpenAI 兼容场景显示 API Key
 */
function LlmConfig({
  config,
  models,
  isFetchingModels,
  isTesting,
  onConfigChange,
  onServiceChange,
  onRefreshModels,
  onTestConnection,
}: LlmConfigProps) {
  // 当前配置匹配的服务预设（地址与预设不匹配时显示「自定义」）
  const serviceId = matchServicePreset(config.provider, config.baseUrl);
  const isOpenAi = config.provider === 'openai';

  return (
    <div className={styles.config}>
      <div className={styles.field}>
        <span className={styles.label}>服务类型</span>
        <Select<LlmServiceId>
          size="small"
          value={serviceId}
          onChange={onServiceChange}
          options={SERVICE_OPTIONS}
          className={styles.fullWidth}
        />
      </div>
      <div className={styles.field}>
        <span className={styles.label}>接口地址</span>
        <Input
          size="small"
          value={config.baseUrl}
          placeholder="http://localhost:11434"
          onChange={(e) => onConfigChange({ baseUrl: e.target.value })}
          className={styles.fullWidth}
        />
      </div>
      {isOpenAi && (
        <div className={styles.field}>
          <span className={styles.label}>API Key</span>
          <Input.Password
            size="small"
            value={config.apiKey}
            placeholder="sk-…"
            onChange={(e) => onConfigChange({ apiKey: e.target.value })}
            className={styles.fullWidth}
          />
        </div>
      )}
      <div className={styles.field}>
        <span className={styles.label}>模型</span>
        <div className={styles.modelRow}>
          <Select<string>
            size="small"
            showSearch
            value={config.model || undefined}
            placeholder="获取模型后选择"
            loading={isFetchingModels}
            options={models.map((m) => ({ label: m, value: m }))}
            optionFilterProp="label"
            onChange={(value) => onConfigChange({ model: value })}
            className={styles.modelSelect}
          />
          <Button size="small" loading={isFetchingModels} onClick={onRefreshModels}>
            获取
          </Button>
          <Button size="small" loading={isTesting} onClick={onTestConnection}>
            测试连接
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LlmConfig;
