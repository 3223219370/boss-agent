// 简历简化服务：调用 LLM 从完整简历中提取招聘相关信息（技术栈/项目经验等）
// 输出紧凑纯文本（非 JSON），供岗位分析 prompt 使用，节省 token

import type { LlmConfig } from "~src/constant/types"
import { createLlmClient } from "~src/services/llm"

/** 简历简化任务说明（追加在真实简历前） */
const SUMMARIZE_PROMPT = `# Role: 资深HR简历解析与结构化专家

## Goal
你的任务是将冗长、非结构化的原始简历，转化为**高度精简、信息密度极高、大模型极易理解**的结构化摘要。该摘要将作为后续“岗位匹配度分析”的唯一上下文输入，必须在大幅压缩Token的同时，零丢失核心事实。

## Context
- **受众**：下游的“岗位匹配度分析 Agent”。
- **痛点**：原始简历通常包含大量客套话、冗余的日常工作描述和无意义的排版，导致Token浪费。
- **核心原则**：大模型不需要看“抒情”和“套话”，只需要看“硬指标”、“核心技能”和“量化成果”。

## Instructions
请严格按照以下步骤处理输入的原始简历：

1. **信息清洗**：剔除所有主观评价（如“性格开朗”、“抗压能力强”）、冗长的自我介绍、无意义的排版符号和无关的早期经历。
2. **核心要素提取**：识别并提取以下关键维度：
   - 基础信息（姓名、最高学历、总工作年限、求职意向）
   - 核心技能栈（按熟练度或相关性排序，提取具体技术名词）
   - 核心工作/项目经历（仅保留最近2-3段，或最核心的2-3个项目）
3. **经历重构（STAR法则压缩）**：将提取的经历转化为“动作 + 场景 + 量化结果”的极简句式。例如，将“负责日常用户运营，策划活动，提高了用户活跃度”压缩为“策划3场促活活动，使MAU提升15%”。
4. **结构化输出**：按照指定的【Output Format】输出，使用Markdown标签进行严格隔离。

## Constraints
- **绝对防幻觉**：仅基于提供的原始简历内容进行提炼。**严禁**推断、联想或添加原文中未明确提及的技能、学历或项目经验。如果原文未提及某项信息，请标注“未提及”。
- **禁止废话**：不要输出“好的，这是为您精简的简历”等过渡语，直接输出结构化结果。
- **量化优先**：如果原文有数据，必须保留数据；如果原文无数据，保留核心动作即可，不要自己编造数据。
- **Token 极简**：能用词语表达的绝不用句子，能用列表的绝不用段落。

## Output Format
请严格使用以下 Markdown 模板输出：

###  基础信息
- **姓名**：[姓名] | **学历**：[学校]-[专业]-[学历] | **经验**：[X]年
- **核心标签**：[标签1]、[标签2]、[标签3]（基于经历提炼的3个核心定位）

### ️ 核心技能栈
- **精通/熟练**：[技能A], [技能B], [技能C]
- **掌握/了解**：[技能D], [技能E]

###  核心经历摘要
**[公司名称] | [职位名称] | [起止时间]**
- [动词] + [核心任务] + [量化结果/业务价值]
- [动词] + [核心任务] + [量化结果/业务价值]

**[项目名称] | [项目角色] | [项目时间]**
- [动词] + [解决的核心问题] + [最终交付成果/数据]

###  教育背景
- [时间段] | [学校] | [专业] | [学历]
`

/**
 * 调用 LLM 简化简历：只提取招聘相关信息，返回精简纯文本
 * @param config LLM 配置（provider/baseUrl/apiKey/model）
 * @param resumeText 完整简历文本
 * @returns 简化后的简历文本（非空校验通过）；模型未返回内容时抛错
 */
export async function summarizeResume(
  config: LlmConfig,
  resumeText: string
): Promise<string> {
  const client = createLlmClient(config)
  const prompt = `我的完整简历如下：\n\n${resumeText}`
  // format: 'text'：跳过默认的 JSON 强制输出，让模型自由输出纯文本简化简历
  const result = await client.chat(
    [
      { role: "system", content: SUMMARIZE_PROMPT },
      { role: "user", content: prompt }
    ],
    {
      format: "text"
    }
  )
  console.log("简化结果---->", { result })
  const summary = result.text.trim()
  if (!summary) throw new Error("模型未返回简化结果，请重试")
  return summary
}
