# 安全策略

## 报告安全漏洞

请**不要**通过公开 issue 报告安全漏洞，以免影响其他用户。

请将漏洞详情通过邮件发送至仓库所有者的公开邮箱（见 GitHub 仓库主页），或通过 GitHub 的 [Private vulnerability reporting](https://github.com/3223219370/boss-agent/security/advisories/new) 功能私下提交。

报告中请尽量包含：

- 漏洞类型与影响范围
- 复现步骤（或最小复现示例）
- 受影响版本
- 修复建议（可选）

我们会尽快确认并回复处理进展。修复发布前，请对漏洞细节保密。

## 本项目的安全边界

- 简历、配置、分析历史均存储在浏览器本地（`chrome.storage.local`），**不会**上传至任何第三方服务器
- 扩展仅将简历与岗位信息发送给你自行配置的模型服务（Ollama / OpenAI 兼容 API），请确保你使用的 API 服务可信
- 扩展的 `host_permissions` 仅包含 `http://localhost:11434/*`（Ollama 本地服务），不读取其他网站数据
