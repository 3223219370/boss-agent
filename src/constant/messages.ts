// popup ↔ content script 消息协议：类型定义与常量（双方共享）

/** 消息类型 */
export const MESSAGE_TYPES = {
  /** 开始自动分析 */
  START: 'boos-agent-start',
  /** 停止自动分析 */
  STOP: 'boos-agent-stop',
} as const;

/** 消息类型联合 */
export type BoosAgentMessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

/** popup 发给 content script 的消息 */
export interface BoosAgentMessage {
  /** 消息类型 */
  type: BoosAgentMessageType;
}
