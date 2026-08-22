// 自动循环分析配置：延时与超时参数

export const LOOP_CONFIG = {
  /** 相邻两次分析之间的延时（ms），避免触发 BOSS 风控 */
  delayMs: 500,
  /** 点击卡片后等待详情加载的超时（ms） */
  waitDetailTimeoutMs: 8000,
  /** 详情加载轮询间隔（ms） */
  waitDetailIntervalMs: 1000,
  /** 列表到底后滚动触发懒加载的重试等待（ms） */
  lazyLoadRetryDelayMs: 1500,
  /** 点击打招呼按钮后等待确认弹窗出现的超时（ms） */
  greetDialogTimeoutMs: 5000,
  /** 打招呼确认弹窗轮询间隔（ms） */
  greetDialogIntervalMs: 200,
} as const;
