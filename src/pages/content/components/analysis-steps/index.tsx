// 分析流程步骤条：antd Steps 纵向展示 4 阶段（岗位获取 → AI 分析 → 结果 → 打招呼语）
// 步骤状态由 UI 数据派生：phase 驱动 loading，job/result 数据存在性驱动 finish/wait

import { Spin, Steps } from 'antd';
import type { StepsProps } from 'antd';

import type { AnalysisUiState } from '../../types';
import StepJob from './step-job';
import StepAi from './step-ai';
import StepResult from './step-result';
import StepGreeting from './step-greeting';
import styles from './index.module.scss';

/** AnalysisSteps 组件 Props */
interface AnalysisStepsProps {
  /** 浮层 UI 状态（步骤状态派生来源） */
  ui: AnalysisUiState;
  /** 复制打招呼语回调 */
  onCopy: (greeting: string) => void;
  /** 是否已复制（按钮反馈） */
  copied: boolean;
  /** 打招呼并继续分析回调 */
  onGreetContinue: () => void;
  /** 分析下一个岗位回调 */
  onAnalyzeNext: () => void;
}

/** 分析流程步骤条 */
function AnalysisSteps({ ui, onCopy, copied, onGreetContinue, onAnalyzeNext }: AnalysisStepsProps) {
  const { phase, job, detail, result } = ui;

  const hasJob = !!job;
  const hasResult = !!result;
  const matched = result?.match ?? false;
  /** 手动模式匹配暂停：等待用户复制发送（打招呼步骤高亮为当前步骤） */
  const waitingUser = ui.status === 'MATCHED';
  /** 匹配且暂停/空闲：显示「打招呼并继续分析」主按钮（引擎 RUNNING 自动分析中不显示） */
  const showGreetContinue = matched && (waitingUser || ui.status === 'IDLE');
  /** 手动分析不匹配且引擎未在自动循环中：显示「分析下一个」按钮（RUNNING 中引擎自动切换） */
  const showAnalyzeNext = !!result && result.ok && !matched && ui.status === 'IDLE';

  /** 抓取中：步骤 1 进行中；分析中：步骤 2 进行中（icon 换 Spin） */
  const step1Active = phase === 'grabbing';
  const step2Active = phase === 'analyzing';

  const items: StepsProps['items'] = [
    {
      title: '岗位获取',
      status: step1Active ? 'process' : hasJob ? 'finish' : 'wait',
      content: (
        <StepJob job={job} description={detail?.description} active={step1Active} />
      ),
    },
    {
      title: 'AI 分析',
      status: step2Active ? 'process' : hasResult ? 'finish' : 'wait',
      icon: step2Active ? <Spin size="small" /> : undefined,
      content: (
        <StepAi
          prompt={ui.prompt}
          rawText={ui.rawText}
          promptTokens={ui.promptTokens}
          completionTokens={ui.completionTokens}
          analyzing={step2Active}
          active={step2Active}
        />
      ),
    },
    {
      title: '结果',
      status: hasResult ? 'finish' : 'wait',
      content: (
        <StepResult
          result={result}
          showAnalyzeNext={showAnalyzeNext}
          onAnalyzeNext={onAnalyzeNext}
        />
      ),
    },
    {
      title: '打招呼语',
      status: hasResult && matched ? (waitingUser ? 'process' : 'finish') : 'wait',
      content: (
        <StepGreeting
          matched={matched}
          greeting={result?.greeting ?? ''}
          waitingUser={waitingUser}
          active={hasResult && matched && waitingUser}
          showGreetContinue={showGreetContinue}
          onCopy={onCopy}
          onGreetContinue={onGreetContinue}
          copied={copied}
        />
      ),
    },
  ];

  return <Steps size="small" orientation="vertical" className={styles.steps} items={items} />;
}

export default AnalysisSteps;
