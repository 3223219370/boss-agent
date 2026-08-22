// 打招呼模式读取 hook：从配置读取，popup 修改时通过 storage 监听实时同步

import { useEffect, useState } from 'react';

import type { GreetingMode } from '~src/constant/types';
import { STORAGE_KEYS } from '~src/constant/storage-keys';
import { getAppConfig } from '~src/services/storage';

/**
 * 读取当前打招呼模式（auto 自动 / manual 手动）
 * - 初始值取已保存配置；popup 改动配置后实时同步
 * @returns 当前打招呼模式
 */
export function useGreetingMode(): GreetingMode {
  const [mode, setMode] = useState<GreetingMode>('auto');

  useEffect(() => {
    void getAppConfig().then((config) => setMode(config.greetingMode));

    // popup 侧修改打招呼模式时同步刷新
    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEYS.greetingMode]) {
        setMode(changes[STORAGE_KEYS.greetingMode].newValue ?? 'auto');
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  return mode;
}
