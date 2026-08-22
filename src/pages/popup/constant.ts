// popup 页面局部常量

import { CUSTOM_SERVICE_ID, LLM_SERVICE_PRESETS } from '~src/constant/llm-providers';

// 服务类型下拉选项：直接复用全局服务预设，另加「自定义」选项（接口地址与预设不匹配时回显）
export const SERVICE_OPTIONS = [
  ...LLM_SERVICE_PRESETS.map((p) => ({ label: p.label, value: p.id })),
  { label: '自定义', value: CUSTOM_SERVICE_ID },
];
