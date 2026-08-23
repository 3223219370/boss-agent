// 分析记录 Tab：历史列表（Collapse 可展开单条详情）+ 统计/清空工具行 + 空态

import { Button, Collapse, Empty, Popconfirm, Typography } from 'antd';

import { HISTORY_LIMIT } from '~src/constant/history';
import { useAnalysisHistory } from '../../hooks/use-analysis-history';
import { HistoryItemBody, HistoryItemHeader } from './history-item';
import styles from './index.module.scss';

/** 分析记录列表页（popup 第 4 个 Tab） */
function HistoryTab() {
  /** 分析记录（最新在前）与清空操作 */
  const { records, clear } = useAnalysisHistory();

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Typography.Text type="secondary" className={styles.count}>
          共 {records.length} 条 · 最多保留 {HISTORY_LIMIT} 条
        </Typography.Text>
        {records.length > 0 && (
          <Popconfirm
            title="清空全部分析记录？"
            description="此操作不可恢复"
            okText="清空"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void clear()}
          >
            <Button size="small" danger>
              清空历史
            </Button>
          </Popconfirm>
        )}
      </div>
      {records.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无分析记录，在 BOSS 页面完成岗位分析后自动生成"
        />
      ) : (
        <Collapse
          size="small"
          bordered={false}
          items={records.map((record) => ({
            key: record.id,
            label: <HistoryItemHeader record={record} />,
            children: <HistoryItemBody record={record} />,
          }))}
        />
      )}
    </div>
  );
}

export default HistoryTab;
