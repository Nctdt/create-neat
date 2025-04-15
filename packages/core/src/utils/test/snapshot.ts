// src/utils/test/snapshot.ts

import fs from "fs";
import path from "path";

/**
 * 保存数据快照
 * @param name 快照名称
 * @param data 要保存的数据
 */
export function saveSnapshot(name: string, data: any) {
  // 确保快照目录存在
  const snapshotDir = path.join(process.cwd(), "__snapshots__");
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  // 生成文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${name}_${timestamp}.json`;

  // 保存数据
  fs.writeFileSync(path.join(snapshotDir, fileName), JSON.stringify(data, null, 2));
}
