# Boos Agent

BOSS 直聘岗位 AI 匹配分析助手（Chrome MV3 扩展）。

在 BOSS 直聘（zhipin.com）岗位列表页上自动循环分析每个岗位：用本地大模型（Ollama / 千问 / DeepSeek 等 OpenAI 兼容 API）判断岗位与简历的匹配度——不匹配自动滚动到下一个，匹配则展示 AI 生成的打招呼语（可一键复制），支持自动 / 手动两种打招呼模式。

技术栈：Plasmo + React 18 + TypeScript + CSS Modules + SCSS + antd。

## 本地开发

```bash
pnpm install
pnpm dev
```

浏览器打开 `chrome://extensions/`，开启开发者模式，加载 `build/chrome-mv3-dev` 目录。

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发模式（watch 构建到 `build/chrome-mv3-dev`） |
| `pnpm build` | 生产构建（输出到 `build/chrome-mv3-prod`） |
| `pnpm package` | 打包发布产物 |
| `pnpm test` | 纯函数单元测试（tsx + node:test） |
| `pnpm typecheck` | TypeScript 类型检查 |

## 使用步骤

1. 在 popup 中配置大模型：
   - **Ollama**：选择「Ollama」，默认地址 `http://localhost:11434`，点「获取模型」拉取本地模型列表
   - **OpenAI 兼容 API**（千问 / DeepSeek 等）：选择「OpenAI 兼容」，可从预设中选择千问 / DeepSeek 一键填充地址，填写 API Key，点「获取模型」
2. 点「测试连接」确认服务可达
3. 粘贴简历文本并保存
4. 选择打招呼模式：**自动打招呼**（匹配后自动发送并继续下一个，默认）/ **手动确认**（匹配后暂停等你复制）
5. 打开 BOSS 直聘岗位列表页（需登录），点「开始分析」

> 自动打招呼发送的内容是 BOSS 直聘账号的默认招呼语（可在 BOSS 的「消息通知-设置招呼语」中修改）；AI 生成的打招呼语在手动模式下供一键复制。

## Ollama CORS 配置（必读）

Chrome 扩展的请求来源是 `chrome-extension://<扩展ID>`，Ollama 默认不允许跨源访问，
必须设置环境变量后重启 Ollama：

1. 在 `chrome://extensions/` 找到本扩展，点「查看详情」复制扩展 ID（形如 `abcdefgh...`）
2. 设置环境变量 `OLLAMA_ORIGINS=chrome-extension://<扩展ID>`
   - Windows 用户：系统设置 → 环境变量 → 新建，变量名 `OLLAMA_ORIGINS`，
     变量值填上述 chrome-extension:// 地址
3. 重启 Ollama 服务（若 Ollama 正在运行需完全退出后重新启动）
4. 若已添加历史环境变量（旧名 `OLLAMA_ORIGINS` 或 `OLLAMA_HOST`），以系统设置界面显示为准

验证：打开插件 popup → 点「获取模型」→ 能看到本地模型列表即成功。

## 目录结构

```
popup.tsx                  popup 入口（薄壳）
contents/boos-agent.tsx    content script 入口（CSUI，注入 zhipin.com）
src/
├── pages/popup/           配置面板（antd）
├── pages/content/         页面浮层（Shadow DOM + CSS Modules）
├── services/              llm（多 provider）/ zhipin（DOM 抓取）/ analysis（状态机）/ storage
├── utils/                 纯函数（node:test 可测）
├── constant/              类型、选择器、LLM 预设、消息协议等共享常量
└── styles/global.scss     popup 全局样式
tests/                     node:test 单元测试
```

详细架构说明见 `CLAUDE.md`。
