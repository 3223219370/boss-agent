// popup 页面局部常量

import { LLM_SERVICE_PRESETS } from '~src/constant/llm-providers';

// 服务类型下拉选项：直接复用全局服务预设（ollama / deepseek / qwen）
export const SERVICE_OPTIONS = LLM_SERVICE_PRESETS.map((p) => ({ label: p.label, value: p.id }));
