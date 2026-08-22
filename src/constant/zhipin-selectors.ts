// BOSS 直聘页面 DOM 选择器集中管理：站点改版时只改这一个文件
// 注意：选择器基于 zhipin.com 列表页真实 DOM 结构实测确认

export const ZHIPIN_SELECTORS = {
  /** 当前选中卡片（active 态），找不到时回退任意卡片 */
  activeCard: '.job-card-wrap.active .job-card-box',
  /** 列表页任意岗位卡片 */
  anyCard: '.job-card-box',
  /** 卡片内岗位名称链接 */
  jobName: '.job-name',
  /** 卡片内标签列表项（年限/学历等） */
  tagList: '.tag-list li',
  /** 卡片内公司名称 */
  bossName: '.boss-name',
  /** 卡片内工作地点 */
  companyLocation: '.company-location',
  /** 卡片内可点击触发详情加载的元素 */
  clickTarget: '.job-info',
  /** 推荐列表区域（自动循环按索引定位卡片用） */
  cardArea: '.rec-job-list .card-area',
  /** 详情面板岗位名称（防竞态比对用） */
  detailJobName: '.job-detail-box .job-name',
  /** 详情面板岗位描述容器（含反爬混淆 span） */
  jdDesc: '.job-detail-body .desc',
  /** 详情面板公司信息（取 "·" 前部分） */
  bossInfoAttr: '.job-boss-info .boss-info-attr',
  /** 打招呼按钮（「立即沟通」，点击后发送打招呼并弹出确认弹窗） */
  greetButton: '.job-detail-op .op-btn-chat',
  /** 打招呼成功弹窗（动态渲染，点击后需轮询等待出现） */
  greetDialog: '.greet-boss-dialog',
  /** 弹窗内「留在此页」关闭按钮 */
  greetDialogStay: '.greet-boss-dialog .cancel-btn',
} as const;
