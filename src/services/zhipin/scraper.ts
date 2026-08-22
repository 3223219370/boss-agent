// BOSS 直聘页面 DOM 抓取服务：卡片定位 / 信息提取 / 点击加载 / 防竞态等待 / 懒加载滚动
// 选择器全部来自 src/constant/zhipin-selectors.ts（站点改版只改那一处）

import { LOOP_CONFIG } from '~src/constant/loop';
import { ZHIPIN_SELECTORS } from '~src/constant/zhipin-selectors';
import type { JobCardInfo, JobDetailInfo } from '~src/constant/types';
import { sanitizeDesc } from './sanitize';

/**
 * 定位当前选中卡片：active 态卡片优先，回退列表第一张
 * @returns 卡片元素；页面无卡片时返回 null
 */
export function findCurrentCard(): HTMLElement | null {
  const active = document.querySelector<HTMLElement>(ZHIPIN_SELECTORS.activeCard);
  if (active) return active;
  return document.querySelector<HTMLElement>(ZHIPIN_SELECTORS.anyCard);
}

/**
 * 提取卡片信息（岗位名/标签/公司/地点/href）
 * @param cardEl 卡片元素
 * @returns 卡片结构化信息
 */
export function extractCardInfo(cardEl: Element): JobCardInfo {
  const nameEl = cardEl.querySelector<HTMLElement>(ZHIPIN_SELECTORS.jobName);
  return {
    title: nameEl?.textContent?.trim() ?? '',
    tags: Array.from(cardEl.querySelectorAll(ZHIPIN_SELECTORS.tagList)).map(
      (li) => li.textContent?.trim() ?? '',
    ),
    company: cardEl.querySelector<HTMLElement>(ZHIPIN_SELECTORS.bossName)?.textContent?.trim() ?? '',
    location:
      cardEl.querySelector<HTMLElement>(ZHIPIN_SELECTORS.companyLocation)?.textContent?.trim() ?? '',
    href: nameEl?.getAttribute('href') ?? '',
  };
}

/**
 * 模拟点击卡片：点击卡片的 .job-info 区域触发右侧详情面板加载
 * @param cardEl 卡片元素
 */
export function clickCard(cardEl: Element): void {
  const jobInfoDiv = cardEl.querySelector<HTMLElement>(ZHIPIN_SELECTORS.clickTarget);
  jobInfoDiv?.click();
}

/**
 * 防竞态等待详情加载：轮询详情面板岗位名，与卡片岗位名一致后 resolve
 * @param title 卡片岗位名
 * @param timeoutMs 超时时间（默认取 LOOP_CONFIG）
 * @returns Promise；超时 reject（Error「等待详情加载超时」）
 */
export function waitForDetail(
  title: string,
  timeoutMs: number = LOOP_CONFIG.waitDetailTimeoutMs,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const detailTitle = document.querySelector<HTMLElement>(ZHIPIN_SELECTORS.detailJobName);
      if (detailTitle && detailTitle.textContent?.trim() === title.trim()) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('等待详情加载超时'));
        return;
      }
      setTimeout(tick, LOOP_CONFIG.waitDetailIntervalMs);
    };
    tick();
  });
}

/**
 * 提取详情信息：岗位描述（反爬清理后）+ 公司名（"·" 前部分）
 * @returns 详情结构化信息
 */
export function extractDetailInfo(): JobDetailInfo {
  const descEl = document.querySelector<HTMLElement>(ZHIPIN_SELECTORS.jdDesc);
  const companyEl = document.querySelector<HTMLElement>(ZHIPIN_SELECTORS.bossInfoAttr);
  return {
    description: descEl ? sanitizeDesc(descEl) : '',
    company: companyEl ? (companyEl.textContent?.replace(/·.*/, '').trim() ?? '') : '',
  };
}

/**
 * 按索引定位推荐列表中的卡片（自动循环用）
 * @param index 卡片索引
 * @returns 卡片元素；索引越界返回 null
 */
export function currentCart(index: number): Element | null {
  return Array.from(document.querySelectorAll(ZHIPIN_SELECTORS.cardArea))[index] ?? null;
}

/**
 * 滚动到目标卡片并点击（滚动触发列表懒加载重建后需重新定位）
 * @param index 卡片索引
 */
export function scrollAndClick(index: number): void {
  const card = currentCart(index);
  if (!card) return;
  card.scrollIntoView({ block: 'center' });
  clickCard(card);
}

/** 滚动页面本身到底部，触发列表懒加载（自动循环列表到底时用） */
export function scrollToBottom(): void {
  window.scrollTo(0, document.documentElement.scrollHeight);
}

/**
 * 调研辅助：扫描页面上含「打招呼」文本的元素（Step 7 自动打招呼按钮选择器定位用）
 * @returns 候选元素数组（文本 + 可读的选择器），空数组表示页面无打招呼按钮
 */
export function findGreetingButtons(): Array<{ text: string; selector: string }> {
  const candidates = Array.from(document.querySelectorAll('button, a, div')).filter(
    (el) => el.textContent?.includes('打招呼'),
  );
  return candidates.map((el) => {
    const cls = typeof el.className === 'string' ? el.className.split(' ')[0] : '';
    return {
      text: el.textContent?.trim() ?? '',
      selector: `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`,
    };
  });
}
