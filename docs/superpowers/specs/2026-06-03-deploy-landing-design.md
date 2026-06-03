# Fire Journey · 部署与 Landing Page 设计文档

> 版本：v1.0
> 日期：2026-06-03
> 状态：设计定稿，待实施

---

## 一、目标

1. 将 Fire Journey monorepo 推送到 GitHub 做版本管理
2. 部署到 Vercel，绑定自有域名 `fire-journey.chengsen.xyz`
3. 创建品牌 Landing Page 置于根路径 `/`
4. 以路径前缀方式路由到三个子产品

---

## 二、路由架构

```
fire-journey.chengsen.xyz/
├── /                    → 品牌 Landing Page
├── /oracle/*            → 财务基因解码 (Wealth DNA) — ✅ 已有
├── /sandbox/*           → 人生推演沙盘 (Life Sandbox) — 📋 预留
└── /compass/*           → 资产罗盘 (Asset Compass) — 📋 预留
```

- 单一域名，路径前缀路由
- 每个子产品是独立的 SPA，Vite `base` 配置为对应路径前缀
- 各子产品内部路由（如 `/oracle/quiz`、`/oracle/result`）由各自 React Router 处理

---

## 三、GitHub 仓库

| 项 | 值 |
|---|---|
| 平台 | GitHub |
| 仓库名 | `fire-journey` |
| 可见性 | 私有（后续可改为公开） |
| 分支策略 | `main` 主分支，功能分支按需创建 |

`.gitignore` 已配置：
```
node_modules/
dist/
.turbo/
.superpowers/
*.local
.env
```

---

## 四、Vercel 部署策略

### 4.1 方案：单项目 + 构建聚合

一个 Vercel 项目绑定 GitHub 仓库，统一构建所有 app，聚合输出到单个目录。

| 配置项 | 值 |
|---|---|
| 框架 | Vite（通过 Vercel 自动检测或手动指定） |
| 根目录 | `/`（仓库根目录） |
| 构建命令 | `pnpm build && node scripts/aggregate.mjs` |
| 输出目录 | `dist/` |
| 安装命令 | `pnpm install` |

### 4.2 构建聚合脚本 (`scripts/aggregate.mjs`)

功能：
1. 运行 `turbo build` 构建所有 app
2. 将 `apps/landing/dist/` 复制到根 `dist/`
3. 将 `apps/oracle/dist/` 复制到 `dist/oracle/`
4. 将 `apps/sandbox/dist/` 复制到 `dist/sandbox/`（未来）
5. 将 `apps/compass/dist/` 复制到 `dist/compass/`（未来）

### 4.3 SPA Fallback

Vercel 配置中为每个子路径添加 SPA fallback：
- `/oracle/*` → `/oracle/index.html`
- `/sandbox/*` → `/sandbox/index.html`
- `/compass/*` → `/compass/index.html`

### 4.4 域名绑定

在 Vercel 项目 Settings → Domains 中添加 `fire-journey.chengsen.xyz`。
DNS 配置：在 `chengsen.xyz` 的 DNS 管理中添加 CNAME 记录指向 Vercel。

---

## 五、Monorepo 结构（更新后）

```
fire-journey/
├── apps/
│   ├── landing/           ← 🆕 品牌 Landing Page
│   ├── oracle/            ← ✅ 财务基因解码
│   ├── sandbox/           ← 📋 人生推演沙盘（预留）
│   └── compass/           ← 📋 资产罗盘（预留）
├── packages/
│   ├── engine-core/       ← 共享算法引擎
│   └── design-tokens/     ← 共享设计 Token
├── scripts/
│   └── aggregate.mjs      ← 🆕 构建聚合脚本
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── vercel.json            ← 🆕 Vercel 配置（可选）
```

---

## 六、Landing Page 设计

### 6.1 技术选型

| 项 | 值 |
|---|---|
| 位置 | `apps/landing/` |
| 框架 | React 18 + Vite 5 |
| 样式 | Tailwind CSS 3，复用 `@fj/design-tokens` |
| 动效 | Framer Motion（Hero 入场、卡片渐显） |
| 路由 | 无（单页） |
| 依赖 | 仅 `react`, `react-dom`, `framer-motion` |

### 6.2 页面结构

```
┌──────────────────────────┐
│  Hero 品牌区              │
│  · 品牌名 + Slogan         │
│  · 品牌理念一句话           │
│  · 深色渐变背景            │
│  · 入场动效                │
├──────────────────────────┤
│  Product Cards (3)       │
│                          │
│  🥇 Oracle 财务基因解码    │
│     "开始测试" CTA        │
│     左侧金色边框           │
│                          │
│  🥈 Sandbox 人生推演沙盘   │
│     "即将上线" 置灰        │
│     左侧蓝色边框           │
│                          │
│  🥉 Compass 资产罗盘      │
│     "即将上线" 置灰        │
│     左侧棕色边框           │
├──────────────────────────┤
│  Footer                  │
│  © 2026 The FIRE Journey │
└──────────────────────────┘
```

### 6.3 设计基准

- **移动端优先**：375px 设计宽度，最大 480px
- **品牌色系**：暖铜棕 `#c8a882`，深墨灰 `#2c2c2c`，暖杏白 `#f9f6f0`
- **产品卡片**: 各产品使用对应流派色做左边框颜色标识
- **CTA 按钮**: 仅 Oracle 卡片显示"开始测试"，其余显示"即将上线"置灰态
- **Vite base**: `/`（根路径）

### 6.4 组件清单

| 组件 | 说明 |
|---|---|
| `App.tsx` | 主入口，串联各区块 |
| `HeroSection` | 品牌 Hero，深色渐变背景 + 动效文字 |
| `ProductCard` | 可配置产品卡片（标题、描述、颜色、状态） |
| `Footer` | 版权信息 |

---

## 七、子产品 Vite base 调整

为支持路径路由，各子产品的 Vite 配置需设置 `base`：

| 产品 | Vite `base` | React Router `basename` |
|---|---|---|
| Oracle | `/oracle/` | `/oracle` |
| Sandbox | `/sandbox/` | `/sandbox`（未来） |
| Compass | `/compass/` | `/compass`（未来） |

Oracle 现有路由需调整：React Router 添加 `basename="/oracle"`，Vite 配置 `base: '/oracle/'`。

---

## 八、实施步骤（概要）

1. **Git 初始化** — `git init`，创建 `.gitignore`，首次提交
2. **创建 Landing Page** — `apps/landing/` 项目搭建 + 页面实现
3. **调整 Oracle 路由** — 添加 `base: '/oracle/'` 和 Router `basename`
4. **构建聚合脚本** — `scripts/aggregate.mjs`
5. **Vercel 配置** — 创建 `vercel.json`（如需要）
6. **推送到 GitHub** — 创建远程仓库，推送代码
7. **Vercel 连接部署** — 导入 GitHub 项目，配置构建参数
8. **域名绑定** — Vercel Domains + DNS CNAME 记录
9. **验证** — 确认所有路径可访问

---

## 九、自检清单

- [x] 路由架构明确（单域名 + 路径前缀）
- [x] 部署策略明确（单 Vercel 项目 + 聚合构建）
- [x] Landing Page 技术栈与 Oracle 一致
- [x] 页面结构和组件清单完整
- [x] 子产品 Vite/Router 配置调整方案明确
- [x] 实施步骤可执行
- [x] 无 TBD、TODO、占位符
