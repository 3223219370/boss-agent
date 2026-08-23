// 单条分析历史记录展示：折叠态摘要行（岗位名/公司/匹配/打招呼 Tag）+ 展开态详情（岗位描述/匹配理由/AI 打招呼语）

import { Tag, Typography } from 'antd';

import type { AnalysisRecord, GreetOutcome } from '~src/constant/types';
import styles from './index.module.scss';

/** 打招呼结果 → 展示文案与 Tag 颜色映射 */
const GREET_OUTCOME_META: Record<GreetOutcome, { label: string; color: string }> = {
  sent: { label: '已打招呼', color: 'success' },
  failed: { label: '打招呼失败', color: 'error' },
  manual: { label: '待手动打招呼', color: 'warning' },
  none: { label: '未打招呼', color: 'default' },
};

/** 格式化时间戳：同年显示「MM-DD HH:mm」，跨年显示「YYYY-MM-DD HH:mm」 */
function formatAnalyzedAt(ts: number): string {
  const date = new Date(ts);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  if (date.getFullYear() === new Date().getFullYear()) {
    return `${mm}-${dd} ${hh}:${min}`;
  }
  return `${date.getFullYear()}-${mm}-${dd} ${hh}:${min}`;
}

/** HistoryItem 展示组件 Props（header 摘要行与 body 详情共用） */
interface HistoryItemProps {
  /** 单条分析记录 */
  record: AnalysisRecord;
}

/** 单条记录的摘要行（Collapse 折叠态 header：岗位名 + 匹配/打招呼 Tag + 公司地点标签 + 时间） */
function HistoryItemHeader({ record }: HistoryItemProps) {
  const greetMeta = GREET_OUTCOME_META[record.greetOutcome];
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <Typography.Text ellipsis className={styles.title}>
          {record.job.title}
        </Typography.Text>
        <Tag color={record.result.match ? 'success' : 'default'}>
          {record.result.match ? '匹配' : '不匹配'}
        </Tag>
        <Tag color={greetMeta.color}>{greetMeta.label}</Tag>
      </div>
      <div className={styles.subRow}>
        <Typography.Text type="secondary" ellipsis className={styles.subText}>
          {[record.job.company, record.job.location, ...record.job.tags]
            .filter(Boolean)
            .join(' · ')}
        </Typography.Text>
        <Typography.Text type="secondary" className={styles.time}>
          {formatAnalyzedAt(record.analyzedAt)}
        </Typography.Text>
      </div>
    </div>
  );
}

/** 单条记录的详情（Collapse 展开态 body：岗位描述可展开阅读 + 匹配理由 + AI 打招呼语） */
function HistoryItemBody({ record }: HistoryItemProps) {
  return (
    <div className={styles.body}>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>岗位描述</span>
        <Typography.Paragraph
          ellipsis={{
            rows: 6,
            expandable: 'collapsible',
            symbol: (expanded) => (expanded ? '收起' : '展开'),
          }}
        >
          {record.detail.description}
        </Typography.Paragraph>
      </div>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>匹配理由</span>
        <Typography.Text>{record.result.reason}</Typography.Text>
      </div>
      {record.result.greeting && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>AI 打招呼语</span>
          <Typography.Text>{record.result.greeting}</Typography.Text>
        </div>
      )}
    </div>
  );
}

export { HistoryItemHeader, HistoryItemBody };
