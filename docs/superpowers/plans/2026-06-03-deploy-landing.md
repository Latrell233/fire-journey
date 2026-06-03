# Fire Journey · 部署与 Landing Page 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目推送到 GitHub，创建品牌 Landing Page，配置 Vercel 部署到 fire-journey.chengsen.xyz

**Architecture:** monorepo 单 Vercel 项目 + 构建聚合脚本。Landing Page 是独立 React + Vite 应用，Oracle 调整为 `/oracle/` base 路径。所有 app 构建后聚合到根 `dist/` 目录部署。

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, Framer Motion, pnpm workspace + Turborepo

---

## 文件结构总览

```
fire-journey/
├── apps/
│   ├── landing/                    ← 🆕 创建
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── index.css
│   │       ├── components/
│   │       │   ├── HeroSection.tsx
│   │       │   ├── ProductCard.tsx
│   │       │   └── Footer.tsx
│   │       └── data/
│   │           └── products.ts
│   └── oracle/                     ← ✏️ 修改
│       ├── vite.config.ts          ← base: '/oracle/'
│       └── src/
│           └── main.tsx            ← BrowserRouter basename="/oracle"
├── scripts/
│   └── aggregate.mjs               ← 🆕 创建
├── vercel.json                     ← 🆕 创建
└── .gitignore                      ← ✏️ 补充
```

---

### Task 1: Git 初始化

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: 补充 `.gitignore`**

`.gitignore` 当前内容：
```
node_modules/
dist/
.turbo/
.superpowers/
*.local
.env
```

追加以下内容：

```
# 当前 .gitignore 已包含 node_modules/ dist/ .turbo/ .superpowers/ *.local .env
# 追加以下：
.DS_Store
*.log
```

用 Edit 工具追加：
```
.DS_Store
*.log
```

- [ ] **Step 2: 初始化 Git 仓库并提交**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey
git init
git add -A
git status
```

检查 `git status` 确认没有敏感文件（node_modules、.env 等被忽略）。

```bash
git commit -m "init: Fire Journey monorepo — Oracle MVP + shared packages"
```

---

### Task 2: 创建 Landing Page 项目骨架

**Files:**
- Create: `apps/landing/package.json`
- Create: `apps/landing/index.html`
- Create: `apps/landing/vite.config.ts`
- Create: `apps/landing/tailwind.config.ts`
- Create: `apps/landing/postcss.config.js`
- Create: `apps/landing/tsconfig.json`

- [ ] **Step 1: 创建 `apps/landing/package.json`**

```json
{
  "name": "@fj/landing",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3001",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@fj/design-tokens": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: 创建 `apps/landing/index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="description" content="The FIRE Journey 财富自由之旅 — 从财务认知觉醒到掌控真实资产" />

    <meta property="og:title" content="The FIRE Journey · 财富自由之旅" />
    <meta property="og:description" content="从财务认知觉醒，到人生沙盘推演，最终掌控真实资产。" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_CN" />

    <title>The FIRE Journey · 财富自由之旅</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔥</text></svg>" />
  </head>
  <body class="bg-surface text-text antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: 创建 `apps/landing/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { port: 3001, host: true },
});
```

- [ ] **Step 4: 创建 `apps/landing/tailwind.config.ts`**

与 Oracle 完全相同的 tailwind 配置，复用 design-tokens 色板：

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#c8a882',
        'primary-hover': '#b8976e',
        'primary-light': '#f6f1eb',
        surface: '#f9f6f0',
        muted: '#f0ebe4',
        danger: '#c27b6b',
        positive: 'var(--color-positive)',
        negative: 'var(--color-negative)',
        faction: { fe: '#d4a04a', fo: '#7a9ca8', ve: '#8b5a4a', vo: '#6b7a5c' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', '"Roboto Mono"', 'monospace'],
      },
      borderRadius: { card: '16px', btn: '12px', input: '8px' },
      animation: {
        'fade-up': 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 5: 创建 `apps/landing/postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: 创建 `apps/landing/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 7: 安装依赖**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey
pnpm install
```

- [ ] **Step 8: 验证项目可启动**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey/apps/landing
pnpm dev
```

打开 `http://localhost:3001`，确认 Vite 启动成功（空白页正常）。

---

### Task 3: Landing Page 数据与组件

**Files:**
- Create: `apps/landing/src/data/products.ts`
- Create: `apps/landing/src/components/HeroSection.tsx`
- Create: `apps/landing/src/components/ProductCard.tsx`
- Create: `apps/landing/src/components/Footer.tsx`
- Create: `apps/landing/src/index.css`

- [ ] **Step 1: 创建产品数据 `apps/landing/src/data/products.ts`**

```typescript
export interface Product {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  path: string;
  available: boolean;
}

export const products: Product[] = [
  {
    id: 'oracle',
    step: 1,
    title: '财务基因解码',
    subtitle: '觉醒',
    description: '48题沉浸式人格测试，挖掘你的财务潜意识，输出专属4位DNA代码与人格报告。',
    color: '#d4a04a',
    path: '/oracle',
    available: true,
  },
  {
    id: 'sandbox',
    step: 2,
    title: '人生推演沙盘',
    subtitle: '推演',
    description: '带着你的DNA，在回合制文字冒险中推演30年财富曲线，体验不同选择下的平行人生。',
    color: '#7a9ca8',
    path: '/sandbox',
    available: false,
  },
  {
    id: 'compass',
    step: 3,
    title: '资产罗盘',
    subtitle: '掌控',
    description: '将沙盘推演转化为现实行动。真实的资产追踪、复盘与财富自由路线校准。',
    color: '#8b5a4a',
    path: '/compass',
    available: false,
  },
];
```

- [ ] **Step 2: 创建 `apps/landing/src/components/HeroSection.tsx`**

```tsx
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2c2c2c] via-[#3a3028] to-[#4a4035] text-white px-6 pt-16 pb-14 text-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #c8a882 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-[11px] tracking-[0.25em] text-primary uppercase mb-4 font-medium">
          The FIRE Journey
        </p>
        <h1 className="text-[32px] font-bold leading-tight mb-3">
          财富自由之旅
        </h1>
        <p className="text-sm text-[#d4c8b8] leading-relaxed max-w-[280px] mx-auto">
          从财务认知觉醒，到人生沙盘推演，<br />最终掌控真实资产
        </p>
      </motion.div>

      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-[#f9f6f0]" />
    </section>
  );
}
```

- [ ] **Step 3: 创建 `apps/landing/src/components/ProductCard.tsx`**

```tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Product } from '../data/products';

interface Props {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: Props) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white rounded-card p-5 shadow-sm ${product.available ? 'active:scale-[0.98] transition-transform' : 'opacity-60'}`}
      style={{ borderLeft: `4px solid ${product.color}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
          style={{ color: product.color, background: `${product.color}15` }}
        >
          STEP {product.step} · {product.subtitle}
        </span>
      </div>
      <h3 className="text-lg font-bold text-text mb-1.5">{product.title}</h3>
      <p className="text-[13px] text-[#8a7a6a] leading-relaxed">{product.description}</p>

      <div className="mt-3">
        {product.available ? (
          <span className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: product.color }}
          >
            开始测试 →
          </span>
        ) : (
          <span className="inline-block px-5 py-2 rounded-full text-sm font-medium text-[#8a7a6a] bg-muted">
            即将上线
          </span>
        )}
      </div>
    </motion.div>
  );

  if (product.available) {
    return <Link to={product.path} className="block">{card}</Link>;
  }
  return card;
}
```

- [ ] **Step 4: 创建 `apps/landing/src/components/Footer.tsx`**

```tsx
export default function Footer() {
  return (
    <footer className="text-center py-8 px-4 border-t border-muted">
      <p className="text-[11px] text-[#8a7a6a]">
        © 2026 The FIRE Journey · 财富自由之旅
      </p>
    </footer>
  );
}
```

- [ ] **Step 5: 创建 `apps/landing/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { -webkit-tap-highlight-color: transparent; }
html { scroll-behavior: smooth; }
body { min-height: 100dvh; }
#root { min-height: 100dvh; }

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  .pt-safe { padding-top: env(safe-area-inset-top); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### Task 4: Landing Page 入口文件

**Files:**
- Create: `apps/landing/src/main.tsx`
- Create: `apps/landing/src/App.tsx`

- [ ] **Step 1: 创建 `apps/landing/src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@fj/design-tokens/colors.css';
import '@fj/design-tokens/typography.css';
import '@fj/design-tokens/spacing.css';
import '@fj/design-tokens/animations.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 2: 创建 `apps/landing/src/App.tsx`**

```tsx
import HeroSection from './components/HeroSection';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import { products } from './data/products';

export default function App() {
  return (
    <div className="mx-auto max-w-[480px] min-h-screen bg-surface md:shadow-sm">
      <HeroSection />
      <main className="px-4 py-6 flex flex-col gap-3">
        <p className="text-[13px] text-[#8a7a6a] text-center mb-1">选择你的起点</p>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: 验证 Landing Page 构建**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey/apps/landing
pnpm build
```

确认 `apps/landing/dist/` 生成成功，无 TypeScript 错误。

---

### Task 5: 调整 Oracle 路由 base

**Files:**
- Modify: `apps/oracle/vite.config.ts`
- Modify: `apps/oracle/src/main.tsx`
- Modify: `apps/oracle/index.html`（og:url）

- [ ] **Step 1: 修改 `apps/oracle/vite.config.ts` — 添加 base**

当前内容：
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true },
});
```

修改为：
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/oracle/',
  server: { port: 3000, host: true },
});
```

- [ ] **Step 2: 修改 `apps/oracle/src/main.tsx` — 添加 basename**

当前 `<BrowserRouter>` 改为 `<BrowserRouter basename="/oracle">`：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@fj/design-tokens/colors.css';
import '@fj/design-tokens/typography.css';
import '@fj/design-tokens/spacing.css';
import '@fj/design-tokens/animations.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/oracle">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 3: 修改 `apps/oracle/index.html` — 更新 og:url**

将 `<meta property="og:url" content="https://fire-journey.vercel.app" />` 改为：

```html
<meta property="og:url" content="https://fire-journey.chengsen.xyz/oracle" />
```

- [ ] **Step 4: 验证 Oracle 构建无错误**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey/apps/oracle
pnpm build
```

确认 `apps/oracle/dist/` 生成成功，`dist/index.html` 中资源路径以 `/oracle/` 开头。

---

### Task 6: 构建聚合脚本

**Files:**
- Create: `scripts/aggregate.mjs`

- [ ] **Step 1: 创建 `scripts/aggregate.mjs`**

```javascript
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
}

main().catch((err) => {
  console.error('❌ 聚合失败:', err);
  process.exit(1);
});
```

- [ ] **Step 2: 本地测试聚合脚本**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey
pnpm build                # turbo 构建所有 app
node scripts/aggregate.mjs  # 聚合到 dist/
```

验证 `dist/` 结构：
```
dist/
├── index.html            ← landing
├── assets/               ← landing 资源
├── oracle/
│   ├── index.html        ← oracle
│   └── assets/           ← oracle 资源
```

---

### Task 7: Vercel 配置

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: 创建 `vercel.json`**

```json
{
  "buildCommand": "pnpm build && node scripts/aggregate.mjs",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "rewrites": [
    { "source": "/oracle", "destination": "/oracle/index.html" },
    { "source": "/oracle/:path*", "destination": "/oracle/index.html" }
  ]
}
```

> 注：Root `/` 的 SPA fallback 由 Vercel 默认行为处理。`/oracle` 的重写确保 Oracle SPA 内部路由正确回退。

- [ ] **Step 2: 验证 `vercel.json` 语法**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey
node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8')); console.log('✅ JSON valid')"
```

---

### Task 8: 推送 GitHub

- [ ] **Step 1: 确保所有变更已提交**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey
git status
git add -A
git commit -m "feat: add landing page, oracle route prefix, aggregate build script"
```

- [ ] **Step 2: 创建 GitHub 远程仓库并推送**

用户登录 GitHub 后，在 github.com 创建新仓库 `fire-journey`（不勾选 README/gitignore/license，因为已有内容）。

```bash
git remote add origin https://github.com/<username>/fire-journey.git
git branch -M main
git push -u origin main
```

> 注意：`<username>` 需替换为用户实际 GitHub 用户名。`git remote add` 前确认远程仓库 URL。

---

### Task 9: Vercel 部署与域名

- [ ] **Step 1: 在 Vercel 导入项目**

1. 打开 [vercel.com/new](https://vercel.com/new)
2. 导入 `fire-journey` GitHub 仓库
3. Vercel 会自动识别为 monorepo 项目
4. **关键配置**（覆盖自动检测）：
   - Framework: **Vite**
   - Root Directory: **`./`**（仓库根目录）
   - Build Command: **`pnpm build && node scripts/aggregate.mjs`**
   - Output Directory: **`dist`**
   - Install Command: **`pnpm install`**
5. 点击 Deploy

- [ ] **Step 2: 验证部署**

部署完成后，访问 Vercel 提供的预览 URL（如 `fire-journey-xxx.vercel.app`）：
- `/` → Landing Page
- `/oracle` → Oracle 首页
- `/oracle/quiz` → 答题页（刷新不 404）

- [ ] **Step 3: 绑定自定义域名**

1. Vercel 项目 → Settings → Domains
2. 添加 `fire-journey.chengsen.xyz`
3. Vercel 会提示需要配置的 DNS 记录

- [ ] **Step 4: 配置 DNS**

在 `chengsen.xyz` 的 DNS 管理后台：
- 添加 **CNAME 记录**：
  - 主机记录: `fire-journey`
  - 记录类型: `CNAME`
  - 记录值: `cname.vercel-dns.com`（Vercel 提供的值）

- [ ] **Step 5: 等待 SSL 证书签发**

Vercel 自动为 `fire-journey.chengsen.xyz` 申请 Let's Encrypt SSL 证书，通常 1-2 分钟。

- [ ] **Step 6: 最终验证**

访问：
- `https://fire-journey.chengsen.xyz/` → Landing Page ✅
- `https://fire-journey.chengsen.xyz/oracle` → Oracle 首页 ✅
- `https://fire-journey.chengsen.xyz/oracle/quiz` → 答题页（刷新不 404）✅

---

### Task 10: 提交最终变更

- [ ] **Step 1: Git 提交并推送**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey
git add -A
git commit -m "chore: add vercel config, finalize deployment setup"
git push
```
