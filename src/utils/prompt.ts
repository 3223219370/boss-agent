// AI 分析 prompt 组装纯函数：简历 + 岗位信息 → 系统提示词
// 含 few-shot 输出示例，引导模型照格式输出，降低 JSON 格式错乱率

import type { JobInfo } from '~src/constant/types';

/** few-shot 示例（仅格式参考，模型需依据下方真实简历与岗位判断） */
const OUTPUT_EXAMPLE = [
  '【输出示例（仅格式参考，内容不要照抄）】',
  '简历：8年Java后端开发经验，本科，熟悉Spring Cloud/MySQL/Redis/Kafka，负责过电商核心交易系统。',
  '岗位：{"title":"Java后端工程师","tags":["5-10年","本科"],"company":"某科技公司","location":"北京","description":"电商平台后端开发，要求熟悉微服务与分布式事务"}',
  '输出：{"match":true,"reason":"技能与经验高度匹配：Spring Cloud/MySQL/Redis/Kafka均为核心能力，8年经验满足5-10年要求","greeting":"您好，我有8年Java后端经验，深耕Spring Cloud微服务架构，主导过日活百万电商系统，期待与您进一步沟通"}',
].join('\n');

/**
 * 组装求职顾问系统提示词，要求模型输出严格 JSON
 * @param resumeText 简历纯文本
 * @param jobInfo 岗位信息（卡片 + 详情）
 * @returns 完整系统提示词
 */
export function buildPrompt(resumeText: string, jobInfo: JobInfo): string {
  return [
    '你是我的求职顾问。我正在 BOSS 直聘上找工作，下面是我的简历和一个岗位的信息。',
    '请以"我"（求职者）的立场评估：这个岗位是否值得我主动投递和打招呼。',
    '',
    '评估要点（逐项对照，不要遗漏）：',
    '1. 技能匹配：岗位要求的技能（语言、框架、工具、方向）与我的简历的重合度；关键技能缺失一票否决',
    '2. 经验年限：岗位要求的工作年限与我简历中的实际经验是否相符',
    '3. 硬性要求：学历、证书等要求我是否满足',
    '4. 其他：工作地点、公司规模/行业、岗位职责是否符合我的职业规划',
    '',
    '判断标准：',
    '- match=true：我整体符合岗位要求（关键技能匹配、硬性要求满足、方向契合），值得主动投递',
    '- match=false：有明显不匹配（关键技能缺失、经验差距大、硬性要求不满足），投递大概率被筛掉',
    '',
    '输出要求：严格只输出 JSON，不要任何解释或多余内容：',
    '{"match": true|false, "reason": "判断理由：先给结论，再列 2-3 条关键依据，100字内", "greeting": "打招呼语：以我的口吻（第一人称，简短自然，50字内），结合岗位要求与我的简历亮点，体现主动和诚意"}',
    '',
    OUTPUT_EXAMPLE,
    '注意：示例仅供格式参考，实际输出请严格依据下方真实简历与岗位信息判断。',
    '',
    '【我的简历】',
    resumeText,
    '',
    '【岗位信息】',
    JSON.stringify(jobInfo, null, 2),
  ].join('\n');
}
