// popup 配置面板核心 hook：配置读写（改动即保存）、模型拉取、连接测试、消息发送

import { useCallback, useEffect, useState } from 'react';

import type { AppConfig, GreetingMode, LlmConfig } from '~src/constant/types';
import type { BoosAgentMessageType } from '~src/constant/messages';
import { MESSAGE_TYPES } from '~src/constant/messages';
import { createLlmClient } from '~src/services/llm';
import {
  clearResumeText,
  DEFAULT_APP_CONFIG,
  getAppConfig,
  saveGreetingMode,
  saveLlmConfig,
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

  /** 更新配置并立即持久化（改动即保存） */
  const updateConfig = useCallback((partial: Partial<LlmConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    void saveLlmConfig(partial).catch((err: unknown) => {
      setStatus({ text: `保存失败：${getErrorMessage(err)}`, isError: true });
    });
  }, []);

  /** 拉取模型列表并回填已选模型（未保存模型时默认选第一个） */
  const refreshModels = useCallback(
    async (cfg: LlmConfig) => {
      if (cfg.provider === 'openai' && !cfg.apiKey.trim()) {
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
    if (cfg.provider === 'openai' && !cfg.apiKey.trim()) {
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

  /** 清空已保存的简历 */
  const clearResume = useCallback(async () => {
    await clearResumeText();
    setConfig((prev) => ({ ...prev, resumeText: '' }));
    setStatus({ text: '简历已清空', isError: false });
  }, []);

  /** 向当前 BOSS 直聘页面的 content script 发送消息 */
  const sendToContent = useCallback(async (type: BoosAgentMessageType) => {
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

  // 打开 popup：读取已保存配置 + 自动刷新模型列表
  useEffect(() => {
    getAppConfig().then((saved) => {
      setConfig(saved);
      void refreshModels(saved);
    });
  }, [refreshModels]);

  return {
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
  };
}
