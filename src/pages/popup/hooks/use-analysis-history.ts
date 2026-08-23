// popup 分析记录状态 hook：打开时读取已存记录，content 侧分析写入后通过 storage 监听实时同步

import { useCallback, useEffect, useState } from 'react';

import type { AnalysisRecord } from '~src/constant/types';
import { STORAGE_KEYS } from '~src/constant/storage-keys';
import { clearAnalysisRecords, getAnalysisRecords } from '~src/services/history';

/**
 * popup 分析记录状态
 * - 初始读取已存记录；content 侧写入新记录后实时同步
 * - popup 每次打开都是全新实例，mount 时重新读取保证首帧数据正确
 * @returns 记录数组（按 analyzedAt 倒序）与清空操作
 */
export function useAnalysisHistory(): {
  /** 分析记录数组（最新在前） */
  records: AnalysisRecord[];
  /** 清空全部分析记录 */
  clear: () => Promise<void>;
} {
  /** 分析记录数组（最新在前） */
  const [records, setRecords] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    // 打开时读取已存记录
    void getAnalysisRecords().then(setRecords);

    // content 侧写入/清空记录时实时同步
    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEYS.analysisHistory]) {
        setRecords(changes[STORAGE_KEYS.analysisHistory].newValue ?? []);
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  /** 清空全部分析记录 */
  const clear = useCallback(async () => {
    await clearAnalysisRecords();
  }, []);

  return { records, clear };
}
