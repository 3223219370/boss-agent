# antd 组件使用规范（v6.6.1）

## antd 6 API 注意点（与 v5 的差异）

| 组件 | 注意点 |
|------|--------|
| Steps | 方向用 `orientation="vertical"`（`direction` 已废弃）；`items` 定义步骤，`StepItem` 支持显式 `status` 覆盖 `current`（无需传 `current` 即可逐步骤控态） |
| Button | `size` 取值为 `large \| medium \| small`（**无 middle**）；`block` 属性仍可用 |
| Alert | `message` 已废弃改用 `title`；v6.4 新增 `variant`（`outlined` / `filled`）；`variant="filled"` 视觉 = **浅色底无边框 + icon 主色**（不是实色深底） |
| Popover / Tooltip | `classNames` / `styles` 语义化定制（5.23+）；子节点需支持 `onMouseEnter/onMouseLeave/onFocus/onClick` 事件 |
| ConfigProvider | `getPopupContainer` 支持返回 `ShadowRoot`（content 浮层挂弹层用）；`wave={{ disabled: true }}` 可禁用按钮波纹（波纹样式注入 document.head，shadow root 内禁用） |
| List | **v6 已废弃**（官方标记将移除，替代品 Listy 6.6.0+）；简单「列表 + 展开详情」直接用 `Collapse items`（label=摘要行、children=详情，配 `size="small"` + `bordered={false}`） |
| Typography | 多行省略用 `ellipsis={{ rows, expandable: 'collapsible', symbol: (expanded) => (expanded ? '收起' : '展开') }}`（'collapsible' 与 symbol 函数 5.16+）；flex 容器内需给文本容器 `flex: 1` + `min-width: 0` 约束宽度才生效 |
| Popconfirm | `okButtonProps={{ danger: true }}` 红色确认按钮；`okText / cancelText / description` 直接可用 |

## 弹层 z-index

- antd 弹层 z-index 由全局 token `zIndexPopupBase` 派生（实际 = 基准 + 70，如 Popover 为 `zIndexPopupBase + 70`）
- 若自定义浮层与弹层共存（如 content 浮层面板），必须保证面板 z-index < 弹层 z-index，否则 Popover 内容被面板遮挡；本项目分层见 CLAUDE.md 坑位 11

## pnpm 严格模式依赖

- antd 的传递依赖（如 `@ant-design/cssinjs`、`@ant-design/icons`）**不能直接 import**，必须显式 `pnpm add` 声明后使用
- 本项目已显式声明：`@ant-design/cssinjs@^2.1.2`（content 浮层 `StyleProvider` 注入 shadow root 用）
- 尽量避免引入 `@ant-design/icons`：无图标需求时用文字/符号（如 ✓ ✕）替代，减少依赖
