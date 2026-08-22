// 全局环境类型声明（被 tsconfig include 的 ./**/*.ts 覆盖）
// - Plasmo 的 plasmo.d.ts 仅声明 *.module.*（CSS Modules）模式，非 module 的全局样式
//   （如 src/styles/global.scss）副作用导入需在此声明，否则 TS 语言服务报「找不到模块」
// - 显式引用 @types/chrome，确保 Chrome 扩展 API 全局命名空间在任何项目配置下可用

/// <reference types="chrome" />

declare module '*.scss';
declare module '*.css';
