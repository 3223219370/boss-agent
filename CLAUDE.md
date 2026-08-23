# CLAUDE.md

本文件提供 Claude Code 在此仓库中工作时的指导。

## 项目简介

Boos Agent —— BOSS 直聘岗位 AI 匹配分析助手（Chrome MV3 扩展）。

用户在 BOSS 直聘岗位列表页批量浏览岗位时，扩展自动循环分析每个岗位：用大模型（Ollama / DeepSeek / 千问等 OpenAI 兼容 API）判断岗位与简历的匹配度——不匹配自动滚动到下一个；匹配则触发提醒（面板高亮 + 提示音），并按「打招呼模式」处理：**自动模式（默认）**自动点击「立即沟通」发送打招呼后继续下一个岗位；**手动模式**暂停展示 AI 生成的打招呼语供一键复制，等用户确认后继续。

popup 可查看**分析记录历史**：岗位名称 / 岗位详情 / 匹配结论 / AI 理由 / 打招呼状态（上限 500 条自动淘汰最旧，见坑位 13）。

技术栈：Plasmo 0.90.5 + React 18 + TypeScript + CSS Modules + SCSS + antd 6（popup 直接使用；content 浮层经 `StyleProvider` 注入 shadow root，见坑位 3）。

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发构建（watch，输出 `build/chrome-mv3-dev`，加载到 chrome://extensions） |
| `pnpm build` | 生产构建（输出 `build/chrome-mv3-prod`） |
| `pnpm package` | 打包发布产物 |
| `pnpm typecheck` | TypeScript 类型检查（Parcel 不 typecheck，改完代码必须跑） |

> Ollama 场景需设置环境变量 `OLLAMA_ORIGINS=chrome-extension://<扩展ID>` 并重启 Ollama（CORS），详见 README。

## 架构

```
src/popup.tsx (入口薄壳) ──> src/pages/popup/        antd 配置面板：服务/模型/APIKey/简历/打招呼模式/启停
src/contents/boos-agent.tsx (CSUI 入口) ──> src/pages/content/  页面右下角 Shadow DOM 浮层
        │ chrome.runtime.onMessage（boos-agent-start / boos-agent-stop）
        ▼
src/services/
├── llm/           多 provider 统一客户端（ollama / openai 兼容），工厂 createLlmClient
├── zhipin/        BOSS 直聘 DOM 抓取（scraper + 反爬 sanitize）
├── analysis/      分析引擎 createAnalyzer（命令式状态机 + 事件驱动）
├── storage/       chrome.storage.local 类型安全封装（AppConfig）
└── history/       分析记录历史（单键存数组 + 500 条上限淘汰 + 打招呼结果补写）
```

- **状态机**：IDLE → RUNNING →（不匹配继续循环）→ DONE；匹配时按 greetingMode 分支：auto 自动打招呼后继续 / manual 暂停（MATCHED）等用户点「继续分析」；任意时刻可 STOP；页面刷新即重置
- **打招呼闭环**：点击「立即沟通」（`.job-detail-op .op-btn-chat`）→ 确认弹窗为**点击后动态渲染**，必须轮询等待出现（200ms 间隔 / 5s 超时）→ 点「留在此页」（`.greet-boss-dialog .cancel-btn`）关闭；自动发送失败降级为手动暂停防漏发
- **数据流**：popup 配置改动即保存到 storage → content 引擎 start 时快照配置（循环期间不重读）→ 抓取（卡片 → 详情）→ buildPrompt（含 few-shot 示例）→ LLM chat（format json）→ parseLlmResponse → emit 事件 → reducer 更新 UI；analyzer 额外 emit `setPhase`（idle/grabbing/analyzing/done）与 `setPrompt`，驱动浮层 Steps 步骤状态与 loading（见坑位 12）
- **历史数据流**：分析闭环终点 analyzer 立即写历史记录（仅解析成功）→ 打招呼决策点补写打招呼结果 → popup 历史 Tab 读 storage + `onChanged` 实时刷新（见坑位 13）

## 目录说明

- `src/popup.tsx`、`src/contents/`：Plasmo 入口（**0.90.5 从 src/ 目录扫描入口，项目根目录不识别**）
- `src/pages/popup/`、`src/pages/content/`：两个页面；组件按 kebab-case 文件夹组织（index.tsx + index.module.scss）
- `src/services/`：按业务域拆分（llm / zhipin / analysis / storage / history）
- `src/utils/`：纯函数（prompt / parse-llm / normalize-base-url / error-message / play-chime）
- `src/constant/`：全局类型（types.ts）、LLM 服务预设（llm-providers）、**zhipin 反爬选择器**（zhipin-selectors）、循环配置（loop）、历史上限（history）、storage 键、消息协议（messages）
- `src/styles/global.scss`：仅 popup 全局样式（固定 360px 宽，防宽度抖动）

## 关键实现约定（坑位备忘）

1. **content 浮层样式注入**：自定义 `getRootContainer` 时 Plasmo **不会调用 getStyle**——必须在 getRootContainer 内手动 `shadow.appendChild(style)`；纯 CSS Modules 组件样式经 `panel-styles.ts` 用 `data-text:*.module.scss` 聚合注入；antd 组件样式不走聚合（cssinjs 经 `StyleProvider container={shadowRoot}` 直接注入，见坑位 3）
2. **浮层定位**：面板自身 `position: fixed` 右下角（Plasmo overlay 容器是 absolute + 文档坐标，随滚动会漂移出视口）
3. **antd 在 content 浮层中的用法**：popup 直接用 antd；content 浮层必须用 `StyleProvider container={ShadowRoot}`（antd cssinjs 默认注入 document.head，进不了 shadow root），并通过 `ConfigProvider getPopupContainer={() => shadowRoot}` 挂载 Popover 等弹层（antd 6 已支持返回 ShadowRoot），同时 `wave={{ disabled: true }}` 禁用按钮波纹（wave 样式同样注入 document.head）；ShadowRoot 由根节点 `getRootNode()` 获取，样式容器就绪前不渲染 antd 内容
4. **反爬选择器集中管理**：站点改版只改 `src/constant/zhipin-selectors.ts`
5. **页面行为三原则**（抓取依赖）：滚动页面本身（非模拟点击）触发懒加载；点击卡片 `.job-info` 触发右侧详情加载；详情面板岗位名与卡片岗位名一致才算加载完成（防竞态）
6. **引擎与 UI 解耦**：analyzer 命令式 + emit 事件；事件形状与 UI reducer 的 action 一致，React 侧直接 `createAnalyzer(dispatch)` 零映射
7. **popup 改动即保存**：防 popup 关闭时异步写入丢失；配置在引擎 start 时快照缓存
8. **防风控 2.5s 分析间隔**等参数集中在 `src/constant/loop.ts`
9. **类型陷阱**：组件函数名与导入类型同名会导致 verbatimModuleSyntax 下导出解析混淆（TS1485），类型导入需用别名；tsconfig 已配 `jsx: react-jsx`（无需手动 import React）
10. **dev 构建注意**：多个 plasmo dev 实例会互相覆盖产物（启动前先清理）；改动 package.json 的 manifest 字段后需重启 dev
11. **content 浮层 z-index 分层**：shadow host 保持 `2147483647`（盖住页面）；面板 `.panel`/`.minimBtn` 为 `9999`；antd 弹层基准 `zIndexPopupBase: 10000`（实际 = 基准 + 70，如 Popover 为 10070）。弹层必须高于面板，否则 Popover 内容被面板遮挡（曾踩坑：面板 2147483647 盖住弹层 1070）
12. **浮层 Steps 状态派生**：UI 状态含 `phase`（idle/grabbing/analyzing/done）与 `prompt` 字段；步骤状态 = phase 驱动 loading + job/result 存在性驱动 finish/wait；手动分析失败需在 catch 中重置 phase 为 idle，否则步骤条卡在 loading；打招呼模式提示经 `useGreetingMode` hook 读取配置 + `chrome.storage.onChanged` 实时同步
13. **分析记录历史**（`src/services/history/`）：chrome.storage.local **单键存数组**（键 `analysisHistory`，最新在前）；该键**不进 `ALL_STORAGE_KEYS`**（getAppConfig 全量读取会污染配置——该数组已显式化，**新增配置键必须同步加入**）。写入模式 = `analyzeWithLlm` 立即写初始记录（仅 `result.ok` 入库，失败静默不阻塞分析）+ 打招呼决策点 `finalizeGreet` 补写 `GreetOutcome`（sent 自动发送成功 / failed 自动发送失败降级 / manual 手动模式未代发 / none 不匹配）；补写幂等守卫：仅 match 且当前为 none 时生效（防 failed 被 manual 覆盖）；上限 `HISTORY_LIMIT=500`（`src/constant/history.ts`）超限自动淘汰最旧；popup 侧 `useAnalysisHistory` hook 读取 + `onChanged` 实时刷新

## 规范引用

- 强制遵守 `.claude/rules/通用开发规范.md`（文件组织 / 命名 / 样式 / TypeScript / 控制流）
- antd 组件使用注意点（v6 API 差异 / pnpm 严格模式依赖）见 @.claude/rules/antd组件使用规范.md
- 开发完代码**禁止自动 git 提交**，保持原样等待用户审查
