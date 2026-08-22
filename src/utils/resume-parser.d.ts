// mammoth 浏览器版（UMD bundle）类型声明
// 包主入口是 Node 版（lib/index.js），浏览器场景需显式导入 mammoth.browser.js，该文件无自带类型

declare module 'mammoth/mammoth.browser.js' {
  /** extractRawText 解析结果 */
  interface MammothRawTextResult {
    /** 提取出的纯文本 */
    value: string;
    /** 解析过程的提示消息（如图片忽略） */
    messages: unknown[];
  }

  /** 仅声明本项目用到的 API 子集 */
  const mammoth: {
    /** 从 docx 二进制中提取纯文本（忽略图片与样式） */
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<MammothRawTextResult>;
  };

  export default mammoth;
}
