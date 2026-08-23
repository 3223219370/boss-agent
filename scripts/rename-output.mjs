import { existsSync, renameSync, rmSync } from "node:fs";

// plasmo 固定输出 `{target}-{tag}` 命名的目录与 zip（chrome-mv3-prod / chrome-mv3-prod.zip），
// 构建/打包完成后统一重命名为项目名 boss-agent
const targets = [
  { src: "build/chrome-mv3-prod", dest: "build/boss-agent" },
  { src: "build/chrome-mv3-prod.zip", dest: "build/boss-agent.zip" },
];

for (const { src, dest } of targets) {
  if (!existsSync(src)) continue;
  // 旧文件若存在先清空，避免重复构建时 rename 冲突
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  renameSync(src, dest);
  console.log(`✔ ${src} → ${dest}`);
}
