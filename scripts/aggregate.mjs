import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

const APPS = [
  { name: 'landing', src: 'apps/landing/dist', dest: '' },
  { name: 'oracle', src: 'apps/oracle/dist', dest: 'oracle' },
  // 未来添加:
  // { name: 'sandbox', src: 'apps/sandbox/dist', dest: 'sandbox' },
  // { name: 'compass', src: 'apps/compass/dist', dest: 'compass' },
];

async function main() {
  // 清理旧输出
  await rm(dist, { recursive: true, force: true });

  // 复制各 app 构建产物
  for (const app of APPS) {
    const src = resolve(root, app.src);
    const dest = resolve(dist, app.dest);

    await cp(src, dest, { recursive: true });
    console.log(`✅ ${app.name} → dist/${app.dest || '(root)'}`);
  }

  console.log('✅ 构建聚合完成');
  console.log('');
  console.log('dist/');
  for (const app of APPS) {
    if (app.dest) {
      console.log(`├── ${app.dest}/`);
      console.log(`│   ├── index.html`);
      console.log(`│   └── assets/`);
    } else {
      console.log(`├── index.html`);
      console.log(`└── assets/`);
    }
  }
}

main().catch((err) => {
  console.error('❌ 聚合失败:', err);
  process.exit(1);
});
