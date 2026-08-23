# 贡献指南

欢迎贡献！无论是修复 bug、改进文档，还是提交功能建议。

## 开发前

1. 环境要求：Node.js 18+、pnpm
2. 安装依赖：`pnpm install`
3. 阅读 `README.md` 了解项目结构与使用方式

## 提 Issue

- 请先搜索是否已有相同 issue
- 描述清楚：环境信息（浏览器版本 / 系统）、复现步骤、期望行为与实际行为、相关日志或截图

## 提 PR

1. 从 `main` 分支切出特性分支（如 `fix/xxx`、`feat/xxx`）
2. 确保改动通过 `pnpm typecheck`（Parcel 不做类型检查，**必跑**）
3. 保持改动聚焦：一个 PR 只解决一个问题
4. 提交信息使用简洁的动词开头，如 `feat: 支持自定义模型地址` / `fix: 修复分析偶发卡死`
5. 改动涉及 BOSS 直聘页面结构时，同步更新 `src/constant/zhipin-selectors.ts` 的注释说明

## 开发规范

- 本项目遵循仓库内 `.claude/rules/` 的开发规范（文件组织 / 命名 / 样式 / TypeScript / 控制流）
- 组件使用 CSS Modules（`index.module.scss`），类名 camelCase
- TypeScript 禁用 `any`，类型必须完整；`interface` / `type` 属性需带 JSDoc 注释
- 新增共享常量优先放到 `src/constant/`；新增配置项需同步 `src/constant/storage-keys.ts` 的 `ALL_STORAGE_KEYS`
- 分析引擎 / 页面抓取等核心逻辑改动，请同时在 PR 描述中说明改动理由

## 行为准则

保持友善与尊重，对事不对人。商业用途请遵循 [LICENSE](./LICENSE)（MIT）条款。
