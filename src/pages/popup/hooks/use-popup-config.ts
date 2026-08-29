// popup 配置面板核心 hook：配置读写（改动即保存）、模型拉取、连接测试、消息发送

import { useCallback, useEffect, useRef, useState } from 'react';

import type { AppConfig, GreetingMode, LlmConfig } from '~src/constant/types';
import type { BossAgentMessageType } from '~src/constant/messages';
import { MESSAGE_TYPES } from '~src/constant/messages';
import { createLlmClient } from '~src/services/llm';
import { API_KEY_PROVIDERS, LLM_SERVICE_PRESETS, matchServicePreset } from '~src/constant/llm-providers';
import type { LlmPresets, LlmServiceId } from '~src/constant/llm-providers';
import {
  clearResumeSummaryText,
  clearResumeText,
  DEFAULT_APP_CONFIG,
  getAppConfig,
  getLlmPresets,
  saveGreetingMode,
  saveLlmConfig,
  saveLlmPresets,
  saveResumeSummaryText,
  saveResumeText,
} from '~src/services/storage';
import { getErrorMessage } from '~src/utils/error-message';
import type { PopupStatus } from '../types';

/** 默认就绪状态 */
const IDLE_STATUS: PopupStatus = { text: '就绪', isError: false };

/**
 * popup 配置面板状态与操作
 * - 打开时自动读取已保存配置并刷新模型列表
 * - 配置修改即保存（防 popup 关闭丢失写入）
 */
export function usePopupConfig() {
  /** 当前完整配置（表单受控数据源） */
  const [config, setConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  /** 可用模型列表 */
  const [models, setModels] = useState<string[]>([]);
  /** 获取模型中 */
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  /** 测试连接中 */
  const [isTesting, setIsTesting] = useState(false);
  /** 状态条 */
  const [status, setStatus] = useState<PopupStatus>(IDLE_STATUS);

  /** 当前配置同步镜像：updateConfig 合并预设时计算目标服务用（setConfig 异步时序下保证一致性） */
  const configRef = useRef<AppConfig>(DEFAULT_APP_CONFIG);
  /** 各服务已保存的配置预设镜像：updateConfig 合并、切换服务回填用（预设不渲染 UI，无需 state） */
  const presetsRef = useRef<LlmPresets>({});

  /** 更新配置并立即持久化（改动即保存；同步快照写回当前服务的预设，切换回该服务时自动回填） */
  const updateConfig = useCallback((partial: Partial<LlmConfig>) => {
    const next = { ...configRef.current, ...partial };
    // 当前服务预设快照写回（完整配置，保证预设不缺键）
    const serviceId = matchServicePreset(next.provider);
    if (serviceId) {
      const nextPresets: LlmPresets = {
        ...presetsRef.current,
        [serviceId]: {
          provider: next.provider,
          baseUrl: next.baseUrl,
          apiKey: next.apiKey,
          model: next.model,
        },
      };
      presetsRef.current = nextPresets;
      void saveLlmPresets(nextPresets).catch((err: unknown) => {
        setStatus({ text: `保存失败：${getErrorMessage(err)}`, isError: true });
      });
    }
    configRef.current = next;
    setConfig(next);
    void saveLlmConfig(partial).catch((err: unknown) => {
      setStatus({ text: `保存失败：${getErrorMessage(err)}`, isError: true });
    });
  }, []);

  /** 拉取模型列表并回填已选模型（未保存模型时默认选第一个） */
  const refreshModels = useCallback(
    async (cfg: LlmConfig) => {
      if (API_KEY_PROVIDERS.has(cfg.provider) && !cfg.apiKey.trim()) {
        setStatus({ text: '请先填写 API Key', isError: true });
        return;
      }
      const client = createLlmClient(cfg);
      setIsFetchingModels(true);
      setStatus({ text: '正在获取模型…', isError: false });
      try {
        const names = await client.listModels();
        setModels(names);
        const keep = cfg.model && names.includes(cfg.model) ? cfg.model : (names[0] ?? '');
        if (keep !== cfg.model) {
          updateConfig({ model: keep });
          setStatus({ text: `已自动选择模型：${keep}`, isError: false });
        } else {
          setStatus({ text: `获取成功：${names.length} 个模型`, isError: false });
        }
      } catch (err) {
        setStatus({ text: `获取模型失败：${getErrorMessage(err)}`, isError: true });
        setModels([]);
      } finally {
        setIsFetchingModels(false);
      }
    },
    [updateConfig],
  );

  /** 测试连接（拉取模型列表验证服务可达） */
  const testConnection = useCallback(async (cfg: LlmConfig) => {
    if (API_KEY_PROVIDERS.has(cfg.provider) && !cfg.apiKey.trim()) {
      setStatus({ text: '请先填写 API Key', isError: true });
      return;
    }
    const client = createLlmClient(cfg);
    setIsTesting(true);
    setStatus({ text: '正在测试连接…', isError: false });
    try {
      const result = await client.testConnection();
      setStatus({ text: result.message, isError: !result.ok });
    } catch (err) {
      setStatus({ text: `连接失败：${getErrorMessage(err)}`, isError: true });
    } finally {
      setIsTesting(false);
    }
  }, []);

  /**
   * 切换服务类型：有已存预设则自动回填并拉取模型列表 + 测试连接；
   * 无预设则写入预设默认地址、清空 API Key 与模型，仅拉取模型列表（无内容可测）
   */
  const switchService = useCallback(
    (serviceId: LlmServiceId) => {
      const preset = LLM_SERVICE_PRESETS.find((p) => p.id === serviceId);
      if (!preset) return;
      const saved = presetsRef.current[serviceId];
      const next: LlmConfig = saved ?? {
        provider: preset.provider,
        baseUrl: preset.baseUrl,
        apiKey: '',
        model: '',
      };
      updateConfig(next);
      void refreshModels(next);
      // 自动回填场景自动测试连接（首次使用无预设时不测，避免空配置误报）
      if (saved) {
        void testConnection(next);
      }
    },
    [refreshModels, testConnection, updateConfig],
  );

  /** 保存简历文本 */
  const saveResume = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus({ text: '简历内容为空，未保存', isError: true });
      return;
    }
    await saveResumeText(trimmed);
    setConfig((prev) => ({ ...prev, resumeText: trimmed }));
    setStatus({ text: `简历已保存（${trimmed.length} 字符）`, isError: false });
  }, []);

  /** 更新打招呼模式并立即保存 */
  const updateGreetingMode = useCallback((mode: GreetingMode) => {
    setConfig((prev) => ({ ...prev, greetingMode: mode }));
    void saveGreetingMode(mode).catch((err: unknown) => {
      setStatus({ text: `保存失败：${getErrorMessage(err)}`, isError: true });
    });
  }, []);

  /** 保存简化简历文本（AI 提取的招聘相关信息） */
  const saveResumeSummary = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus({ text: '简化简历内容为空，未保存', isError: true });
      return;
    }
    await saveResumeSummaryText(trimmed);
    setConfig((prev) => ({ ...prev, resumeSummary: trimmed }));
    setStatus({ text: `简化简历已保存（${trimmed.length} 字符）`, isError: false });
  }, []);

  /** 清空已保存的简历（简化简历联动一并清空） */
  const clearResume = useCallback(async () => {
    await clearResumeText();
    await clearResumeSummaryText();
    setConfig((prev) => ({ ...prev, resumeText: '', resumeSummary: '' }));
    setStatus({ text: '简历已清空', isError: false });
  }, []);

  /** 向当前 BOSS 直聘页面的 content script 发送消息 */
  const sendToContent = useCallback(async (type: BossAgentMessageType) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id || !tab.url?.includes('zhipin.com')) {
      setStatus({ text: '请先打开 BOSS 直聘页面', isError: true });
      return;
    }
    try {
      await chrome.tabs.sendMessage(tab.id, { type });
      setStatus({
        text: type === MESSAGE_TYPES.START ? '已发送开始指令' : '已发送停止指令',
        isError: false,
      });
    } catch {
      setStatus({ text: '页面未加载扩展脚本，请刷新 BOSS 页面', isError: true });
    }
  }, []);

  // 打开 popup：读取已保存配置 + 自动刷新模型列表；同步加载各服务预设镜像
  useEffect(() => {
    getAppConfig().then((saved) => {
      configRef.current = saved;
      setConfig(saved);
      void refreshModels(saved);
    });
    getLlmPresets().then((presets) => {
      presetsRef.current = presets;
    });
  }, [refreshModels]);

  return {
    config,
    models,
    status,
    isFetchingModels,
    isTesting,
    updateConfig,
    switchService,
    refreshModels,
    testConnection,
    saveResume,
    saveResumeSummary,
    clearResume,
    updateGreetingMode,
    sendToContent,
  };
}
