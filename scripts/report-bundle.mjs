import { readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const assetsDir = join(process.cwd(), 'dist', 'assets');
const files = await readdir(assetsDir);
const rows = [];
for (const file of files) {
  const filePath = join(assetsDir, file);
  const fileStat = await stat(filePath);
  if (fileStat.isFile()) rows.push({ file, bytes: fileStat.size, kib: Number((fileStat.size / 1024).toFixed(2)) });
}
rows.sort((a, b) => b.bytes - a.bytes);
const report = { generatedAt: new Date().toISOString(), totalBytes: rows.reduce((sum, row) => sum + row.bytes, 0), assets: rows };
await writeFile(join(process.cwd(), 'qa', 'bundle-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.table(rows);
console.log(`Bundle total: ${(report.totalBytes / 1024).toFixed(2)} KiB`);
