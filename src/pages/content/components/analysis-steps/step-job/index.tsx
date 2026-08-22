// 步骤 1 内容：岗位获取（岗位名 / 公司 / 地点 / 标签，hover 查看岗位描述）

import { Popover } from 'antd';

import type { JobCardInfo } from '~src/constant/types';
import { EMPTY_PLACEHOLDER } from '../../../constant';
import styles from './index.module.scss';

/** StepJob 组件 Props */
interface StepJobProps {
  /** 岗位卡片信息（null 显示空态引导） */
  job: JobCardInfo | null;
  /** 岗位描述文本（Popover 展示） */
  description?: string;
  /** 是否当前进行中步骤（内容卡激活态） */
  active: boolean;
}

/** 步骤 1：岗位获取内容 */
function StepJob({ job, description, active }: StepJobProps) {
  if (!job) {
    return <div className={styles.empty}>点击「分析当前岗位」开始分析</div>;
  }

  const tags = job.tags.length ? job.tags.join(' · ') : EMPTY_PLACEHOLDER;

  return (
    <div className={`${styles.job} ${active ? styles.jobActive : ''}`}>
      <span className={styles.title} title={job.title}>
        {job.title}
      </span>
      <div className={styles.meta}>
        <span className={styles.company}>{job.company}</span>
        <span className={styles.sep}>·</span>
        <span>{job.location}</span>
      </div>
      <div className={styles.tags}>{tags}</div>
      <Popover
        title="岗位描述"
        placement="left"
        trigger="hover"
        content={<div className={styles.jd}>{description || EMPTY_PLACEHOLDER}</div>}
      >
        <span className={styles.jdLink}>查看岗位描述</span>
      </Popover>
    </div>
  );
}

export default StepJob;
