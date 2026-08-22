// 岗位信息展示：岗位名 / 标签 / 公司 / 地点（未抓取时显示占位）

import type { JobCardInfo } from '~src/constant/types';
import { EMPTY_PLACEHOLDER } from '../../constant';
import styles from './index.module.scss';

/** JobInfo 组件 Props */
interface JobInfoProps {
  /** 岗位卡片信息（null 显示占位） */
  job: JobCardInfo | null;
}

/** 岗位信息区 */
function JobInfo({ job }: JobInfoProps) {
  const title = job?.title ?? EMPTY_PLACEHOLDER;
  const tags = job?.tags.length ? job.tags.join(' / ') : EMPTY_PLACEHOLDER;
  const company = job?.company ?? EMPTY_PLACEHOLDER;
  const location = job?.location ?? EMPTY_PLACEHOLDER;

  return (
    <div>
      <div className={styles.title}>{title}</div>
      <div className={styles.tags}>{tags}</div>
      <div className={styles.meta}>
        <span>{company}</span>
        <span className={styles.sep}>·</span>
        <span>{location}</span>
      </div>
    </div>
  );
}

export default JobInfo;
