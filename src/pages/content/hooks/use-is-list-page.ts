// 岗位列表页判断 hook：content script 注入全站后，运行时判断当前 URL 是否为列表页，
// 并监听 SPA 路由变化（BOSS 直聘站内导航走 history.pushState，不触发页面加载）

import { useEffect, useState } from 'react';

import { JOB_LIST_PATHS } from '../constant';

/** 当前 pathname 是否为岗位列表页（精确匹配，避免误伤详情页 /web/geek/job/xxx.html） */
export function isJobListPath(pathname: string): boolean {
  return JOB_LIST_PATHS.has(pathname);
}

/**
 * 监听 SPA 路由变化并同步 isListPage 状态
 * - history.pushState/replaceState 不触发 popstate，需手动 patch 补发事件
 * - popstate 覆盖浏览器前进/后退
 * - 页面整页加载时由 useState 初始值兜底
 */
function useIsListPage() {
  const [isListPage, setIsListPage] = useState(() => isJobListPath(location.pathname));

  useEffect(() => {
    const update = () => setIsListPage(isJobListPath(location.pathname));
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<History['pushState']>) => {
      originalPushState(...args);
      window.dispatchEvent(new Event('pushstate'));
    };
    history.replaceState = (...args: Parameters<History['replaceState']>) => {
      originalReplaceState(...args);
      window.dispatchEvent(new Event('replacestate'));
    };

    window.addEventListener('pushstate', update);
    window.addEventListener('replacestate', update);
    window.addEventListener('popstate', update);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('pushstate', update);
      window.removeEventListener('replacestate', update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  return isListPage;
}

export default useIsListPage;
