# Oracle (Wealth DNA) · UX 交互规范文档

> 版本：v1.0
> 日期：2026-06-03
> 状态：MVP 开发规范
> 基准设备：iPhone 14 (390×844)，以 375px 为基准等比缩放
> 技术栈：React 18 + TypeScript + Tailwind CSS + Zustand + React Router v6 + Framer Motion

---

## 目录

1. [答题流程交互设计](#1-答题流程交互设计)
2. [动画编排规范](#2-动画编排规范)
3. [移动端交互规范](#3-移动端交互规范)
4. [状态管理架构](#4-状态管理架构)
5. [错误与边界状态](#5-错误与边界状态)
6. [性能优化策略](#6-性能优化策略)
7. [可访问性基础](#7-可访问性基础)
8. [组件树与数据流](#8-组件树与数据流)
9. [附录：Tailwind CSS 配置建议](#9-附录tailwind-css-配置建议)

---

## 1. 答题流程交互设计

### 1.1 核心流程状态机

```
           start_quiz
[HomePage] ──────────→ [QuizPage: answering]
                             │
                             │ answer_question
                             │ (not last)
                             ▼
                        [QuizPage: transitioning] ──300ms──→ [QuizPage: answering]
                             │
                             │ answer_question
                             │ (last)
                             ▼
                        [DNA Sequencing Animation] ──2~3s──→ [ResultPage]
                             │
                    restart │
[ResultPage] ───────────────┘
```

### 1.2 答题交互的时序规范

每个答题周期的精确时序（以毫秒为单位）：

```
用户点击选项          → t=0ms
选项高亮/选中反馈     → t=0ms (即时，利用 CSS transition)
非选中选项变灰       → t=0ms (同步)
进度条更新           → t=0ms (即时 React 状态更新)
选中选项 scale 弹跳   → t=0ms ~ t=300ms (弹跳回弹)
自动滑入下一题       → t=300ms 触发 (setTimeout)
```

**实现要点：**

- 点击后立即设置 `isLocked = true`，防止 300ms 内的重复点击
- 300ms 的等待时长经过验证：足够用户看清反馈，但不会感到拖沓
- 不使用 `requestAnimationFrame` 做延迟——浏览器可能在后台标签页暂停 RAF，导致行为不一致
- 最后一题不触发自动跳转，转而触发 DNA 测序动画

```typescript
// 答题锁的实现模板
const handleOptionClick = (optionLabel: Answer, questionId: string) => {
  if (isLocked) return; // 防止重复点击
  setIsLocked(true);

  // 记录答案
  recordAnswer(questionId, optionLabel);

  // 即时 UI 反馈
  setSelectedOption(optionLabel);

  // 300ms 后进入下一题或触发测序
  setTimeout(() => {
    if (currentIndex < totalQuestions - 1) {
      goToNext();
    } else {
      startSequencing();
    }
    setIsLocked(false);
    setSelectedOption(null); // 重置选中态
  }, 300);
};
```

### 1.3 进度条系统

**视觉规格：**

- 位置：页面顶部固定（`position: sticky; top: 0; z-index: 10`）
- 高度：4px（轨道），选中段 4px
- 颜色：`--color-primary`（暖铜棕 `#c8a882`）
- 背景轨道：`--color-muted`（羊毛色 `#f0ebe4`）
- 过渡动画：`width` 属性使用 `cubic-bezier(0.16, 1, 0.3, 1)` 400ms

**阶段标签切换规则：**

| 题目区间 | 阶段名称 | 说明 |
|---------|---------|------|
| 1-10 | 消费观捕捉 | SC 维度：你的钱往哪去 |
| 11-20 | 风险博弈测试 | IG 维度：如何承载波动 |
| 21-30 | 财富内驱色谱 | FV 维度：你为什么而战 |
| 31-40 | 人生观解码 | EO 维度：渴望何种终局 |

**阶段标签 UI 行为：**

- 切入新阶段时，标签从进度条下方以 `fade-up` 动画出现
- 标签文案伴随一个微小的脉冲（pulse）效果（仅一次，不循环）
- 字体：`Caption`（13px），颜色：`--color-text-secondary`
- 位置：进度条正下方 8px 处，水平居中

**实现注意：**

```css
/* 进度条平滑过渡 */
.progress-bar-fill {
  transition: width 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

Tailwind 配置中需要在 `transitionDuration` 和 `transitionTimingFunction` 中补充此曲线。

### 1.4 题目展示规范

**题目卡片：**

- 背景：`--color-card`（`#ffffff`）
- 圆角：`--radius-xl`（16px）
- 内边距：24px（`--space-xl`）
- 阴影：`0 2px 16px rgba(0,0,0,0.04)`（柔和低阴影，暗色模式下使用白色半透明阴影）
- 最大宽度：`min(90vw, 480px)`，水平居中

**题干文字：**

- 字号：`Body`（16px），行高 1.7
- 颜色：`--color-text`（墨灰 `#2c2c2c`）
- 字重：Regular（400）
- 题干长度适配：当题干超过 120 字时，字号自动降为 15px（通过 CSS `clamp()` 或条件 class）

**选项卡片：**

- 基础样式：`--color-muted`（羊毛色）背景，`--radius-md`（8px）圆角
- 内边距：`px-4 py-3.5`（16px 水平，14px 垂直），确保最小触摸高度 > 44px
- 间距：`gap-3`（12px）垂直排列
- 字号：`Body`（16px），行高 1.6
- hover 态（仅桌面端，移动端无 hover）：轻微背景变亮

**选项的三种视觉态：**

```
[默认态]          背景: --color-muted, 文字: --color-text
                 无阴影, 无边框

[选中态]          背景: --color-primary + 10% 透明度
                 左边框: 3px solid --color-primary
                 文字颜色加深, 字重 Semibold
                 轻微上浮阴影: 0 4px 12px rgba(200,168,130,0.15)

[非选中态]        背景保持: --color-muted
(有选项被选中时)   文字: --color-text-caption (降低对比度)
                 无其他效果
```

### 1.5 题目随机打乱算法

**要求：**

- 40 道题整体随机打乱
- 约束：同维度题不可连续出现超过 2 题
- 保证每次开始测试时使用不同的题序

**推荐实现——Fisher-Yates + 约束检查：**

```typescript
function shuffleQuestions(questions: QuestionJSON[]): QuestionJSON[] {
  const MAX_CONSECUTIVE_SAME_TYPE = 2;
  const MAX_ATTEMPTS = 100; // 防止无限循环

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const shuffled = [...questions];

    // Fisher-Yates 洗牌
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 检查约束：同维度不连续超过 2 题
    if (checkConsecutiveConstraint(shuffled, MAX_CONSECUTIVE_SAME_TYPE)) {
      return shuffled;
    }
  }

  // 兜底：100 次洗牌后仍未满足约束，对最后一次结果进行最小化修正
  return fixConsecutiveConstraint(questions);
}

function checkConsecutiveConstraint(
  questions: QuestionJSON[],
  maxConsecutive: number
): boolean {
  let consecutive = 1;
  for (let i = 1; i < questions.length; i++) {
    if (questions[i].type === questions[i - 1].type) {
      consecutive++;
      if (consecutive > maxConsecutive) return false;
    } else {
      consecutive = 1;
    }
  }
  return true;
}
```

**性能考量：** 40 题的数据量极小，洗牌在 1ms 内完成。洗牌操作应在 `startQuiz` action 中执行一次，结果存入 Zustand store。

### 1.6 最后一题后的 DNA 测序动画

**触发条件：** 用户在第 40 题（`currentIndex === 39`）点击选项后

**动画时长：** 2000-3000ms（足够传递"仪式感"，但不会让用户失去耐心）

**视觉序列：**

| 时间点 | 动画内容 |
|-------|---------|
| 0-500ms | 题目卡片缩小淡出，屏幕背景逐渐变为深色（`#f9f6f0` → `#1a1a18` 或保持当前主题色） |
| 500-1500ms | 中央出现旋转的 DNA 双螺旋动画（可使用纯 CSS animation 或 Lottie JSON） |
| 500-2000ms | 底部显示动态文字，每 600ms 切换一次：<br>"正在提取你的消费基因..."<br>"正在解码你的风险图谱..."<br>"正在绘制你的财富人格..."<br>"基因测序完成" |
| 2000-2500ms | 文字定格为"基因测序完成"，双螺旋动画停止旋转并放大 |
| 2500-3000ms | 整个动画层 fade-out，fade-in 进入结果页 |

**实现建议：**

- DNA 双螺旋动画：使用两个交错的正弦波路径（`<svg>` + CSS `@keyframes`），避免加载额外 Lottie 库
- 文字轮播：使用 `AnimatePresence` + `motion.div` 实现文字交替淡入淡出
- 整体容器：全屏覆盖层（`position: fixed; inset: 0; z-index: 50`），保证不触发其他页面交互
- 暗色模式：测序动画背景使用 `#1a1a18`（暗色主题的 surface 色）

```css
/* DNA 螺旋脉动动画（纯 CSS 实现示例） */
@keyframes dna-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dna-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.dna-helix {
  animation: dna-rotate 3s linear infinite, dna-pulse 2s ease-in-out infinite;
}
```

### 1.7 路由守卫逻辑

```typescript
// 访问 /quiz 时：检查是否有已初始化的题目数据
// 访问 /result 时：检查计算结果是否存在

// QuizPage 守卫
function QuizGuard() {
  const { questions, isComplete } = useQuizStore();

  if (questions.length === 0) {
    return <Navigate to="/" replace />;
  }

  if (isComplete) {
    return <Navigate to="/result" replace />;
  }

  return <Outlet />;
}

// ResultPage 守卫
function ResultGuard() {
  const { personalityResult } = useQuizStore();

  if (!personalityResult) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

---

## 2. 动画编排规范

### 2.1 全局动画 Token

所有动画使用 `design-tokens` 中定义的变量：

| Token | 值 | 用途 |
|-------|---|------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 选项弹跳、按钮按压反馈 |
| `--ease-fade-up` | `cubic-bezier(0.16, 1, 0.3, 1)` | 页面进入、卡片出现、元素浮现 |
| `--ease-stagger` | 每项延迟 50ms | 列表逐项出现 |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | 标准 Material Design 缓动，用于颜色/透明度过渡 |
| `--duration-fast` | 150ms | 微交互（按钮 scale、hover 反馈） |
| `--duration-normal` | 300ms | 标准过渡（选项反馈、进度条更新） |
| `--duration-slow` | 500ms | 区块出现、模态框切换 |
| `--duration-ceremony` | 2000-3000ms | 仪式感动画（基因测序） |

### 2.2 首页动画编排

所有动画在页面挂载后统一触发，使用 `staggerChildren` 实现逐层延迟。

```
时间线:
  0ms     ─ Logo + 主标题 fade-up (delay: 0ms)
  150ms   ─ 副标题 fade-up (delay: 150ms)
  300ms   ─ 描述文案 fade-up (delay: 300ms)
  450ms   ─ 开始按钮 fade-up + scale (delay: 450ms, ease: spring)
  600ms   ─ 底部分享/说明链接 fade-up (delay: 600ms)
```

**Framer Motion 实现模板：**

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // --ease-fade-up
    },
  },
};
```

### 2.3 答题页动画编排

**2.3.1 题目切换动画**

采用 Framer Motion 的 `AnimatePresence` + `mode="wait"` 模式：

```
旧题目卡片:  fade-out + slide-left (200ms)
新题目卡片:  fade-in + slide-up (300ms, 延迟 50ms 起)
```

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentQuestion.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    <QuestionCard question={currentQuestion} />
  </motion.div>
</AnimatePresence>
```

**2.3.2 选项 Stagger 入场**

每个题目第一次显示时，选项以 stagger 方式依次出现：

```tsx
const optionContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05, // 每个选项延迟 50ms
      delayChildren: 0.1,
    },
  },
};

const optionVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};
```

**关键设计决策：** stagger 入场只在"题目首次渲染"时触发。当用户通过"上一题"按钮回退时，不触发 stagger，而是直接渲染完整状态（`initial={false}` 或使用不同的 variants key）。

**2.3.3 选项点击反馈动画**

```
选中选项:
  ─ scale: 1 → 0.97 → 1 (150ms, ease: spring)
  ─ 背景色过渡: --color-muted → --color-primary (10% opacity) (200ms)
  ─ 左边框出现: 3px solid --color-primary (200ms)

非选中选项:
  ─ opacity: 1 → 0.5 (200ms)（降低对比度）
```

```tsx
const optionTapAnimation = {
  scale: [1, 0.97, 1],
  transition: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
};
```

**2.3.4 阶段标签切换动画**

```
旧标签:  fade-out + slide-up (200ms)
新标签:  fade-in + slide-up (200ms, 出自进度条正下方)
        外加一次 pulse（scale: 1 → 1.05 → 1，300ms）
```

### 2.4 结果页动画编排

结果页的各区块按"重要性递增"的顺序逐层入场，每层延迟约 200ms：

```
时间线 (进入结果页后):
  0ms       ─ 页面整体 fade-in
  200ms     ─ 流派氛围横幅（顶部大面积色块 + Slogan）fade-up
  400ms     ─ DNA 4 位代码放大展示（typewriter 逐字或 scale-up）
  600ms     ─ 流派底色介绍卡片 fade-up
  800ms     ─ 四维分析雷达/条形图 fade-up
  1000ms    ─ 一句话报告总结 fade-up
  1200ms    ─ 各维度详细解读（stagger 每项 100ms）
  1500ms    ─ 分享按钮区域 fade-up + scale bounce
  1800ms    ─ 重新测试 / 进入沙盘按钮 fade-up
```

**DNA 代码展示动画（核心仪式感）：**

```
每个字符依次出现 (typewriter 效果):
  'S' → 200ms delay
  'I' → 200ms delay
  'F' → 200ms delay
  'E' → 200ms delay

实现: 使用 motion.span + stagger 控制
或者使用 useAnimationControls + sequence
```

```tsx
const codeChars = personalityCode.split('');

// 使用 Framer Motion sequence
useEffect(() => {
  const sequence = async () => {
    for (let i = 0; i < codeChars.length; i++) {
      await controls.start(i => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
      }));
    }
  };
  sequence();
}, []);
```

**滚动触发的入场动画：**

对于"首屏以下"的内容区块（如详细的维度解读），使用 `whileInView` 触发动画：

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
  <DimensionCard />
</motion.div>
```

### 2.5 页面转场动画

使用 React Router + Framer Motion 的 `AnimatePresence` 实现整页切换：

```tsx
// App.tsx
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/" element={
      <PageTransition>
        <HomePage />
      </PageTransition>
    } />
    {/* ... */}
  </Routes>
</AnimatePresence>
```

```tsx
// PageTransition 组件
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
```

**注意：** 页面转场不要使用 `x` 位移——H5 场景下左右滑动容易被误认为浏览器手势，造成困惑。仅使用 `opacity` 淡入淡出。

---

## 3. 移动端交互规范

### 3.1 触摸区域标准

- 所有可交互元素（按钮、选项、链接）的最小触摸区域：**44×44px**（iOS HIG 标准）
- 选项卡片天然高度已超过 44px（`py-3.5` + 文字行高 = ~54px），满足要求
- 返回按钮、导航元素等小型控件的可点击区域用 padding 扩展至 44×44px
- 选项之间的间距（`gap-3` = 12px）防止误触相邻选项

### 3.2 防止 iOS Safari 特有问题

**3.2.1 橡皮筋效果（Bounce / Overscroll）干扰选项点击**

问题：用户在选项区域快速滑动时，iOS Safari 会触发页面级橡皮筋滚动，可能吞掉点击事件。

方案：在答题页面容器上阻止 body 滚动，将滚动隔离在内部容器。

```css
/* 答题页 body 锁定 */
body.quiz-active {
  position: fixed;
  width: 100%;
  overflow: hidden;
  /* 保留滚动条位置，防止布局偏移 */
  top: var(--scroll-y, 0);
}
```

```typescript
// 进入答题页时
useEffect(() => {
  const scrollY = window.scrollY;
  document.body.style.setProperty('--scroll-y', `-${scrollY}px`);
  document.body.classList.add('quiz-active');

  return () => {
    document.body.classList.remove('quiz-active');
    document.body.style.removeProperty('--scroll-y');
    window.scrollTo(0, scrollY);
  };
}, []);
```

**3.2.2 防止 iOS 自动缩放**

- 输入框字号必须 >= 16px，否则 iOS 会在聚焦时自动缩放页面。本项目无文字输入，不涉及此问题
- 全局 `<meta name="viewport">` 设置 `user-scalable=no` 可能会被 iOS 忽略（iOS 10+），建议保留 `user-scalable=yes` 但通过 CSS 防止意外缩放触发

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />
```

**3.2.3 安全区域适配（刘海屏 + 底部指示条）**

所有固定定位元素和底部按钮必须使用 `safe-area-inset-*`：

```css
/* 底部固定按钮 */
.bottom-fixed {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* 顶部固定区域（进度条等） */
.top-fixed {
  padding-top: env(safe-area-inset-top, 0px);
}

/* 水平安全区域 */
.safe-horizontal {
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
```

Tailwind 需要扩展 `padding` 工具类以支持 `env(safe-area-inset-*)`：

```css
/* 在全局 CSS 中补充 */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.pt-safe {
  padding-top: env(safe-area-inset-top, 0px);
}
```

### 3.3 手势交互规范

**3.3.1 选项区域滚动**

- 当选项总高度超过视口可用高度时，整个选项列表区域可垂直滚动
- 滚动容器设置 `-webkit-overflow-scrolling: touch` 以启用 iOS 原生惯性滚动
- 滚动区域的顶部和底部不触发页面级橡皮筋（使用上述 body 锁定方案）
- 滚动容器的 `padding-bottom` 需预留安全区域

**3.3.2 结果页长内容滚动**

- 结果页内容很可能超过一屏高度（尤其多维度详细解读）
- 使用原生页面滚动（不锁定 body），体验自然
- 各区块的入场动画使用 `whileInView`，在滚动到视口时才触发，避免首屏加载时的性能浪费
- 底部按钮（分享、重新测试）使用 `position: sticky; bottom: 0`，始终可见

### 3.4 触觉反馈（Haptics）

**仅在支持的设备上使用，作为可选增强：**

```typescript
// 选项点击时的轻微震动
if (navigator.vibrate) {
  navigator.vibrate(10); // 10ms 短震，几乎察觉不到的确认反馈
}
```

注意：iOS Safari 不支持 `navigator.vibrate`。不要依赖触觉反馈来传递关键信息。

### 3.5 微信朋友圈传播适配

**微信内置浏览器特殊处理：**

- 微信内置浏览器会对 `<title>` 标签内容做二次展示，确保 title 为分享友好文案："测测你的财务人格DNA | The FIRE Journey"
- 微信分享卡片依赖 Open Graph meta 标签：

```html
<meta property="og:title" content="测测你的财务人格DNA" />
<meta property="og:description" content="回答40道选择题，解锁专属4位财务人格代码" />
<meta property="og:image" content="https://your-cdn.com/share-card.png" />
<meta property="og:url" content="https://oracle.firejourney.app" />
```

- 微信内置浏览器可能拦截 `localStorage`（在无痕模式下）。主题偏好存储需降级处理（见 4.3 节）
- 微信 JS-SDK 分享接口：如果需要自定义分享文案，需引入微信 JS-SDK 并配置 `wx.updateAppMessageShareData`

---

## 4. 状态管理架构

### 4.1 Zustand Store 设计

```typescript
// stores/quizStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionJSON, Answer, Dimension, PersonalityResult } from '@fire-journey/engine-core';

// ---- 类型定义 ----

interface QuizState {
  // === 题库 ===
  questions: QuestionJSON[];        // 已打乱的题目列表
  originalQuestions: QuestionJSON[]; // 原始题序（用于"重来"时的重新打乱）

  // === 答题进度 ===
  currentIndex: number;             // 当前题目索引 (0-39)
  answers: Record<string, Answer>;  // { questionId: 'A'|'B'|'C'|'D' }

  // === UI 状态 ===
  isStarted: boolean;               // 是否已开始答题
  isComplete: boolean;              // 是否已完成全部40题
  selectedOption: Answer | null;    // 当前题目选中的选项（仅用于高亮显示）
  isLocked: boolean;                // 是否锁定交互（防重复点击）
  isSequencing: boolean;            // 是否正在展示测序动画

  // === 结果 ===
  personalityResult: PersonalityResult | null;

  // === Actions ===
  startQuiz: (questions: QuestionJSON[]) => void;
  recordAnswer: (questionId: string, answer: Answer) => void;
  setSelectedOption: (option: Answer | null) => void;
  setIsLocked: (locked: boolean) => void;
  goToNext: () => void;
  goToPrev: () => void;
  startSequencing: () => void;
  finishSequencing: (result: PersonalityResult) => void;
  reset: () => void;
}

// ---- 初始状态 ----

const initialState = {
  questions: [],
  originalQuestions: [],
  currentIndex: 0,
  answers: {},
  isStarted: false,
  isComplete: false,
  selectedOption: null,
  isLocked: false,
  isSequencing: false,
  personalityResult: null,
};

// ---- Store 创建 ----

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startQuiz: (questions) => set({
        questions,
        originalQuestions: questions,
        isStarted: true,
        currentIndex: 0,
        answers: {},
        isComplete: false,
        personalityResult: null,
      }),

      recordAnswer: (questionId, answer) => {
        const { answers } = get();
        set({
          answers: { ...answers, [questionId]: answer },
        });
      },

      setSelectedOption: (option) => set({ selectedOption: option }),

      setIsLocked: (locked) => set({ isLocked: locked }),

      goToNext: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
          set({
            currentIndex: currentIndex + 1,
            selectedOption: null,
            isLocked: false,
          });
        }
      },

      goToPrev: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({
            currentIndex: currentIndex - 1,
            selectedOption: null,
            isLocked: false,
          });
        }
      },

      startSequencing: () => set({
        isSequencing: true,
        isComplete: true,
      }),

      finishSequencing: (result) => set({
        personalityResult: result,
        isSequencing: false,
      }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'oracle-quiz-storage',
      // 仅持久化关键状态，不持久化 UI 锁状态
      partialize: (state) => ({
        questions: state.questions,
        originalQuestions: state.originalQuestions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        isStarted: state.isStarted,
        isComplete: state.isComplete,
        personalityResult: state.personalityResult,
      }),
    }
  )
);

// ---- Selectors (推荐) ----

export const useCurrentQuestion = () =>
  useQuizStore((s) => s.questions[s.currentIndex]);

export const useProgress = () =>
  useQuizStore((s) => ({
    current: s.currentIndex + 1,
    total: s.questions.length,
    percent: s.questions.length > 0
      ? ((s.currentIndex + 1) / s.questions.length) * 100
      : 0,
  }));

export const useCurrentStage = () =>
  useQuizStore((s) => {
    const idx = s.currentIndex;
    if (idx < 10) return { name: '消费观捕捉', color: '#c8a882' };
    if (idx < 20) return { name: '风险博弈测试', color: '#c8a882' };
    if (idx < 30) return { name: '财富内驱色谱', color: '#c8a882' };
    return { name: '人生观解码', color: '#c8a882' };
  });

export const useIsAnswered = (questionId: string) =>
  useQuizStore((s) => questionId in s.answers);
```

### 4.2 数据流总览

```
┌──────────────────────────────────────────────────────┐
│                    questions.json                     │
│              (40题, 打包在 Vite bundle)               │
└──────────────────────┬───────────────────────────────┘
                       │ import
                       ▼
┌──────────────────────────────────────────────────────┐
│  HomePage                                             │
│  ├─ 点击"开始测试"                                     │
│  └─ shuffleQuestions(questions) → startQuiz(shuffled) │
└──────────────────────┬───────────────────────────────┘
                       │ navigate('/quiz')
                       ▼
┌──────────────────────────────────────────────────────┐
│  QuizPage                                             │
│  ├─ 读取: questions[currentIndex]                     │
│  ├─ 写入: recordAnswer(qId, answer)                   │
│  └─ 最后一题 → startSequencing() / navigate('/result')│
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  DNA Sequencing (测序动画组件)                          │
│  ├─ 调用: calculatePersonality(answers, questions)     │
│  └─ 结果: finishSequencing(personalityResult)         │
└──────────────────────┬───────────────────────────────┘
                       │ navigate('/result')
                       ▼
┌──────────────────────────────────────────────────────┐
│  ResultPage                                           │
│  ├─ 读取: personalityResult                           │
│  └─ 渲染: 流派横幅 / DNA代码 / 维度分析 / 分享        │
└──────────────────────────────────────────────────────┘
```

### 4.3 状态持久化与恢复

**localStorage 策略：**

- Zustand `persist` 中间件自动同步到 localStorage
- key: `oracle-quiz-storage`
- 持久化字段（见上述 `partialize`）：答题进度、答案、结果
- **不持久化**字段：`isLocked`、`selectedOption`、`isSequencing`（这些是瞬时 UI 状态）

**恢复场景：**

| 场景 | 行为 |
|------|------|
| 用户关闭浏览器后重新打开 | 如果 URL 是 `/quiz` 且 store 中有进度，从上次位置继续 |
| 用户在答题中刷新页面 | 状态从 localStorage 恢复，回到当前题目位置 |
| 用户已完成后重新打开 | 访问 `/` → 看到"重新测试"入口；访问 `/result` → 直接看上次结果 |
| localStorage 不可用（微信无痕模式） | 降级为内存存储（不持久化），刷新后进度丢失，需重新开始 |
| 用户点击"重新测试" | 调用 `reset()`，清空 store 和 localStorage |

**localStorage 降级处理：**

```typescript
// utils/storage.ts
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// 在创建 store 时：
const storage = isStorageAvailable()
  ? undefined // 使用默认 localStorage
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
```

### 4.4 计算逻辑集成点

```typescript
// 测序动画组件内调用
import { calculatePersonality } from '@fire-journey/engine-core';

function SequencingScreen() {
  const { questions, answers, finishSequencing } = useQuizStore();

  useEffect(() => {
    // 模拟"分析"过程（实际计算是瞬时的，但为了仪式感做延迟）
    const timer = setTimeout(() => {
      const result = calculatePersonality(
        Object.entries(answers).map(([id, answer]) => ({
          questionId: id,
          answer,
        })),
        questions
      );
      finishSequencing(result);
    }, 2500); // 与动画时长对齐

    return () => clearTimeout(timer);
  }, []);
}
```

---

## 5. 错误与边界状态

### 5.1 题目数据加载失败

**加载策略：** 题目 JSON 直接通过 ES Module import 打包（`import questions from './questions.json'`），不存在运行时网络加载失败。但需处理打包错误：

```typescript
// 构建时兜底
try {
  const questions = await import('./questions.json');
  // questions is typed as QuestionJSON[]
} catch {
  // 构建时错误（JSON 格式错误等）
  console.error('题目数据加载失败，请检查 questions.json 格式');
  // 开发模式下显示详细错误
}
```

**运行时异常处理：** 如果 questions 数组意外为空或格式错误：

```typescript
// QuizPage 渲染时
if (!questions || questions.length === 0) {
  return (
    <ErrorState
      title="题库加载失败"
      description="请刷新页面重试，或联系客服"
      action="刷新页面"
      onAction={() => window.location.reload()}
    />
  );
}
```

### 5.2 边界路由访问

| 未授权路径 | 检测条件 | 行为 |
|-----------|---------|------|
| `/quiz` 但未开始测试 | `questions.length === 0` | → 重定向到 `/` |
| `/quiz` 但已完成测试 | `isComplete === true` | → 重定向到 `/result` |
| `/result` 但无计算结果 | `personalityResult === null` | → 重定向到 `/` |
| 404 路径 | 任何未定义路由 | → 重定向到 `/`（不保留 404 页，减少维护负担） |

**注意：** 重定向使用 `<Navigate replace />`（而非 `push`），避免在浏览器历史中留下无效记录。

### 5.3 浏览器后退按钮行为

| 当前页面 | 用户按"后退" | 期望行为 |
|---------|------------|---------|
| `/quiz`（答题中） | 后退到 `/` | 确认对话框："确定要退出测试吗？当前进度将保留"（利用 localStorage） |
| `/quiz`（最后一题后、测序动画中） | 后退到 `/` | 允许退出，但计算结果不会保存（因为还未触发 `finishSequencing`） |
| `/result` | 后退到 `/` | 直接返回首页，无需确认 |
| `/` | 后退 | 退出 H5（关闭页面或返回微信聊天列表） |

**实现后退拦截：**

```typescript
// QuizPage 组件内
useEffect(() => {
  if (!isComplete) {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome 需要此项
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }
}, [isComplete]);
```

对于 SPA 内的路由后退（不会触发 `beforeunload`），需要在 React Router 中监听：

```typescript
// 使用 unstable_useBlocker (React Router v6.4+)
// 或手动监听 popstate
useEffect(() => {
  const handlePopState = () => {
    if (isStarted && !isComplete) {
      const confirmed = window.confirm('确定要退出测试吗？你的答题进度会被保留。');
      if (!confirmed) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [isStarted, isComplete]);
```

### 5.4 JS 加载失败（白屏）

这是一个纯前端应用，如果 JS bundle 加载失败（CDN 不可达、网络断开），用户会看到白屏。缓解措施：

**方案 A：关键 CSS 内联 + 最小化 HTML 骨架**

```html
<!-- index.html -->
<style>
  /* 内联关键样式，在 JS 加载前展示基本 UI */
  .app-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #f9f6f0;
    color: #c8a882;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .app-loading::after {
    content: '正在进入...';
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
</style>
<div id="root">
  <div class="app-loading"></div>
</div>
```

**方案 B：资源加载失败提示（JS 中）**

```typescript
// main.tsx 入口文件顶部
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root && root.children.length === 0) {
    root.innerHTML = `
      <div style="padding:40px;text-align:center;font-family:sans-serif;">
        <p>页面加载失败，请检查网络连接后重试</p>
        <button onclick="location.reload()">重新加载</button>
      </div>
    `;
  }
});
```

### 5.5 计算结果异常处理

如果四个维度的分数都完全相同（均为 50 分，即平局），`calculatePersonality` 应返回一个明确的"均衡型"结果而非随机倾向：

```typescript
// engine-core 内处理
if (dimensions.P_SC === 50 && dimensions.P_IG === 50
    && dimensions.P_FV === 50 && dimensions.P_EO === 50) {
  return {
    code: '----',
    faction: '均衡型',
    typeName: '均衡者',
    isBalanced: true,
    // ...
  };
}
```

前端结果页需为 `isBalanced === true` 的情况准备对应的 UI 展示。

---

## 6. 性能优化策略

### 6.1 题目数据打包

- JSON 文件直接 import 会内联到 bundle 中。40 题 × 约 500 字/题 = ~20KB（gzip 后 < 5KB）
- 体积不影响性能，无需做代码分割（Code Splitting）
- 如果未来题库扩展到 200+ 题，考虑动态 `import()` 或预加载

### 6.2 首屏加载优化

**关键路径：**

```
HTML → 内联关键 CSS → JS Bundle → React 挂载 → 首页渲染
```

**优化措施：**

1. **Tailwind CSS 的 JIT 模式**（Vite 默认）：只生成使用到的 utility class，CSS 体积极小（< 10KB gzip）
2. **首页代码拆分**：`HomePage` 使用 `React.lazy` + `Suspense` 懒加载，但鉴于当前项目规模极小（3 个页面），懒加载的额外 HTTP 请求可能得不偿失。建议 **不做懒加载**，保持首页直接 import。
3. **字体不加载外部文件**：使用系统字体栈（已定义在 design-tokens 中），零额外请求。
4. **图片延迟加载**：评分图/插画使用 `loading="lazy"` 或 Framer Motion 的 `whileInView` 延迟渲染。

### 6.3 动画性能（避免 Layout Thrashing）

**核心原则：只动画 `transform` 和 `opacity`，避免动画 `width`、`height`、`top`、`left`。**

| 动画目标 | 使用属性 | 原因 |
|---------|---------|------|
| 题目卡片入场 | `opacity` + `transform: translateY()` | GPU 合成层，不触发重排 |
| 选项 stagger | `opacity` + `transform: translateX()` | 同上 |
| 进度条更新 | `transform: scaleX()` | 替代 `width` 过渡，性能更优 |
| 按钮弹跳 | `transform: scale()` | 不改变布局流 |
| 颜色切换 | `background-color`、`color` | 触发 Paint 但不触发 Layout，可接受 |

**进度条性能优化实现：**

```css
/* 不推荐：动画 width（触发 Layout） */
.progress-fill { transition: width 400ms; }

/* 推荐：使用 transform scaleX（仅触发 Composite） */
.progress-track {
  overflow: hidden;
}
.progress-fill {
  transform-origin: left center;
  transition: transform 400ms var(--ease-fade-up);
}
```

**Framer Motion 配置：**

```tsx
// 为频繁动画的元素启用 GPU 加速
<motion.div
  style={{ willChange: 'transform, opacity' }}
  animate={{ opacity: 1, y: 0 }}
  // ...
/>

// 或使用 Framer Motion 的 layout prop（注意：layout 动画较重，仅用于必要时）
<motion.div layout />
```

**避免在动画期间读取布局属性（强制同步重排）：**

- 不要在一帧内先 `getBoundingClientRect()` 再 `setState()`
- 使用 Framer Motion 的 `layout` 动画时，它内部已做批量处理

### 6.4 内存与状态

- 40 道题的答案对象（`Record<string, Answer>`）内存占用 < 2KB
- Zustand store 中的 `questions` 数组保留完整题目数据（~20KB），结果页渲染时从中读取题目原文
- 分享功能：如果动态生成分享图片，使用 `<canvas>` 而非 DOM 转图片（html2canvas 库体积较大，建议后端生成或使用预设模板）

### 6.5 骨架屏与加载态

考虑到应用体量极小，不推荐引入骨架屏库。使用简单的 loading 状态：

```tsx
// 通用的轻量 Loading
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#c8a882] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

### 6.6 预加载策略

```typescript
// 在 HomePage 中，用户看到"开始测试"按钮时，预加载 questions.json
// 但由于 questions.json 已打包进 bundle，这实际上已经预加载了

// 可选的：在用户即将完成最后一题时预渲染 ResultPage 的静态资源
// 但同样，3 页 SPA 的体量不需要预加载
```

---

## 7. 可访问性基础

### 7.1 颜色对比度

| 元素 | 前景色 | 背景色 | 对比度 | WCAG 标准 |
|------|-------|-------|--------|----------|
| 正文文字 | `#2c2c2c` | `#f9f6f0` | 12.8:1 | AAA (7:1) |
| 次要文字 | `#6b6258` | `#f9f6f0` | 5.2:1 | AA (4.5:1) |
| 辅助文字 | `#a09080` | `#f9f6f0` | 3.2:1 | 仅限大文字 (3:1) |
| 主按钮文字(白) | `#ffffff` | `#c8a882` | 2.6:1 | **不满足** |

**主按钮对比度问题：** 暖铜棕 `#c8a882` 上白色文字对比度不足。两个解决方向：

1. 将按钮文字改为 `#2c2c2c`（墨灰），对比度 4.8:1（满足 AA）
2. 加深主色至 `#b8956e`，使白字对比度达到 3:1（仍不足 AA，但可接受用于 14px 以上的加粗文字）

**建议：** 主按钮使用深色文字 `#2c2c2c`，保留暖铜棕底色。这在"温润极简"风格中反而更和谐。

### 7.2 触摸目标尺寸

所有交互元素 >= 44×44px 已在 3.1 节详述。

### 7.3 键盘导航（桌面端 Web 浏览）

虽然是 H5 优先，但桌面端用户也需要基本键盘支持：

| 按键 | 行为 |
|------|------|
| `Tab` | 在选项之间移动焦点 |
| `Enter / Space` | 选中当前聚焦的选项 |
| `1 / 2 / 3 / 4` | 快速选择第 1/2/3/4 个选项（"键盘快捷作答"） |
| `←` | 回到上一题（如果允许回退） |

**实现：**

```tsx
// 选项按钮需设置 tabIndex 和键盘事件
<button
  tabIndex={0}
  onClick={() => handleSelect('A')}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect('A');
    }
  }}
  aria-label="选项 A"
>
  {option.text}
</button>

// 全局键盘快捷选择
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (isLocked) return;
    const keyMap: Record<string, Answer> = {
      '1': 'A', '2': 'B', '3': 'C', '4': 'D',
      'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D',
    };
    const answer = keyMap[e.key.toLowerCase()];
    if (answer) handleSelect(answer);
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [isLocked, currentIndex]);
```

### 7.4 语义化 HTML 与 ARIA

```tsx
{/* 答题页 */}
<main role="main" aria-label="财务人格测试">
  <div role="progressbar"
       aria-valuenow={progress.percent}
       aria-valuemin={0}
       aria-valuemax={100}
       aria-label={`答题进度 ${progress.current}/${progress.total}`}
  >
    <div className="progress-fill" style={{ transform: `scaleX(${progress.percent}%)` }} />
  </div>

  <h2 className="sr-only">{`第 ${progress.current} 题，共 ${progress.total} 题`}</h2>

  <fieldset>
    <legend className="text-base text-[#2c2c2c] leading-relaxed mb-6">
      {currentQuestion.text}
    </legend>

    <div role="radiogroup" aria-label="选项列表">
      {currentQuestion.options.map((opt) => (
        <button
          key={opt.label}
          role="radio"
          aria-checked={selectedOption === opt.label}
          aria-label={`选项 ${opt.label}`}
          onClick={() => handleSelect(opt.label)}
        >
          {opt.text}
        </button>
      ))}
    </div>
  </fieldset>
</main>
```

### 7.5 减少动画偏好

尊重用户系统的"减少动画"设置：

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// 或在 Framer Motion 中
import { useReducedMotion } from 'framer-motion';

function QuizPage() {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
}
```

---

## 8. 组件树与数据流

### 8.1 组件层级

```
App
├── AnimatePresence (页面转场容器)
│   ├── Route "/" → HomePage
│   │   ├── HomeHero (Logo + 标题 + 副标题 + 描述)
│   │   ├── StartButton ("开始测试")
│   │   └── HomeFooter (分享入口 / 关于说明)
│   │
│   ├── Route "/quiz" → QuizPage
│   │   ├── QuizProgressBar (进度条 + 阶段标签)
│   │   ├── AnimatePresence (题目切换容器)
│   │   │   └── QuestionCard
│   │   │       ├── QuestionText (题干)
│   │   │       ├── OptionList (Stagger 容器)
│   │   │       │   └── OptionButton × 4
│   │   │       └── QuestionNumber (底部题号: "3/40")
│   │   ├── NavigationButtons (上一题 / 下一题 - 可选)
│   │   └── ExitConfirmDialog (退出确认弹窗)
│   │
│   ├── SequencingOverlay (测序动画全屏覆盖层)
│   │   ├── DnaHelixAnimation (DNA 双螺旋动画)
│   │   └── SequencingTextCarousel (文字轮播)
│   │
│   └── Route "/result" → ResultPage
│       ├── FactionBanner (流派氛围横幅: 流派色 + Slogan)
│       ├── DnaCodeDisplay (4 位 DNA 代码大字展示)
│       ├── FactionIntroCard (流派底色介绍)
│       ├── DimensionRadar (四维雷达图/条形图)
│       ├── SummaryCard (一句话报告)
│       ├── DimensionDetailList
│       │   └── DimensionDetailCard × 4 (每维度详细解读)
│       ├── ShareButtonGroup (分享按钮组)
│       └── ActionButtons (重新测试 / 进入沙盘)
```

### 8.2 关键组件的 Props 接口

```typescript
// QuestionCard
interface QuestionCardProps {
  question: QuestionJSON;
  selectedOption: Answer | null;
  isLocked: boolean;
  questionNumber: number;
  totalQuestions: number;
  onSelect: (option: Answer) => void;
}

// QuizProgressBar
interface QuizProgressBarProps {
  current: number;   // 1-based
  total: number;
  stageName: string;
}

// OptionButton
interface OptionButtonProps {
  label: Answer;     // 'A' | 'B' | 'C' | 'D'
  text: string;
  isSelected: boolean;
  isAnySelected: boolean; // 是否有任何选项被选中（用于非选中项变灰）
  isLocked: boolean;
  onSelect: (label: Answer) => void;
  animationDelay: number;  // stagger 延迟(秒)
}

// SequencingOverlay
interface SequencingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

// FactionBanner
interface FactionBannerProps {
  faction: Faction;
  slogan: string;
}

// DnaCodeDisplay
interface DnaCodeDisplayProps {
  code: string;         // "S-I-F-E"
  typeName: string;     // "远航-拓荒者"
}

// DimensionRadar
interface DimensionRadarProps {
  dimensions: {
    P_SC: number;  // 0-100
    P_IG: number;
    P_FV: number;
    P_EO: number;
  };
  labels: Record<Dimension, string>;
}
```

### 8.3 页面级组件挂载与卸载

| 页面 | 挂载时 | 卸载时 |
|------|-------|-------|
| `HomePage` | 重置页面滚动位置到顶部 | 无特殊清理 |
| `QuizPage` | 锁定 body 滚动，恢复上次答题位置（如有） | 解锁 body 滚动，恢复 window.scrollY |
| `ResultPage` | 滚动到顶部，触发入场动画序列 | 无特殊清理 |

---

## 9. 附录：Tailwind CSS 配置建议

### 9.1 tailwind.config.ts 扩展

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // 色板映射自 design-tokens
      colors: {
        primary: {
          DEFAULT: '#c8a882',   // 暖铜棕
          light: '#d4ba9a',
          dark: '#b8956e',
        },
        surface: '#f9f6f0',     // 暖杏白
        card: '#ffffff',
        muted: '#f0ebe4',       // 羊毛色
        text: {
          primary: '#2c2c2c',
          secondary: '#6b6258',
          caption: '#a09080',
        },
        // 四大流派色
        faction: {
          fe: '#d4a04a',       // 麦浪金
          fo: '#7a9ca8',       // 雾海蓝
          ve: '#8b5a4a',       // 赭石棕
          vo: '#6b7a5c',       // 深苔绿
        },
      },
      // 字体系统
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', '"Fira Mono"', '"Roboto Mono"', 'monospace'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.3', fontWeight: '700' }],
        'h1': ['24px', { lineHeight: '1.4', fontWeight: '700' }],
        'h2': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'caption': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'micro': ['11px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      // 间距系统 (4px 基准)
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      // 圆角系统
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      // 过渡曲线
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-up': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // 过渡时长
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      // 阴影系统
      boxShadow: {
        'card': '0 2px 16px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'option-selected': '0 4px 12px rgba(200, 168, 130, 0.15)',
      },
      // 容器最大宽度
      maxWidth: {
        'quiz-card': '480px',
        'content': '640px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 9.2 全局 CSS 补充

```css
/* globals.css — 补充 Tailwind 无法直接覆盖的场景 */

/* 安全区域适配 */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.pt-safe {
  padding-top: env(safe-area-inset-top, 0px);
}

/* 暗色模式基础（预留） */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #1a1a18;
    --color-card: #242320;
    --color-muted: #2a2824;
    --color-text: #e8e0d5;
    --color-text-secondary: #a09888;
    --color-text-caption: #706858;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 进度条 fill（使用 transform 实现高性能动画） */
.progress-fill {
  height: 100%;
  background: var(--color-primary, #c8a882);
  transform-origin: left center;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

/* iOS Safari 滚动优化 */
.scroll-touch {
  -webkit-overflow-scrolling: touch;
}

/* 选项区域过渡 */
.option-card {
  transition: background-color 200ms var(--ease-smooth),
              opacity 200ms var(--ease-smooth),
              box-shadow 200ms var(--ease-smooth);
}
.option-card.selected {
  background-color: rgba(200, 168, 130, 0.1);
  box-shadow: 0 4px 12px rgba(200, 168, 130, 0.15);
  border-left: 3px solid #c8a882;
}
.option-card.dimmed {
  opacity: 0.5;
}
```

### 9.3 开发建议

1. **不要覆盖 Tailwind 的默认工具类命名** — 所有自定义值通过 `extend` 添加，保留原始 utility class 可用
2. **使用 `@apply` 谨慎** — 仅在确实需要复用复杂样式组合时使用，避免过度抽象
3. **`important` 配置设为 `false`**（默认）— 让 utility class 保持最低优先级，方便在组件内覆盖
4. **移动端优先的响应式** — 默认样式为 mobile，使用 `md:`、`lg:` 前缀为更大屏幕添加增强
5. **暗色模式策略** — 使用 CSS 变量 + `prefers-color-scheme` 媒体查询，而非 Tailwind 的 `dark:` 变体（等待 design-tokens 暗色方案定稿后切换）

---

## 附录 A：答题流程关键时序图

```
用户进入 /quiz
    │
    ├── 题目卡片 stagger 入场 (~400ms)
    │
    ▼
[等待用户选择]
    │
    ├── 用户点击选项 A
    │
    ├── t=0ms:    选项 A → 选中态 (背景+左边框)
    │              选项 B/C/D → 非选中变灰
    │              记录答案到 store
    │              isLocked = true
    │
    ├── t=0~150ms: 选项 A 弹跳动画 (scale 1→0.97→1)
    │
    ├── t=0~300ms: 进度条填充动画 (transform scaleX)
    │
    ├── t=300ms:   setTimeout 触发
    │              ├── 非最后一题 → goToNext()
    │              │   ├── 旧题目 slide-left 退出 (200ms)
    │              │   ├── 新题目 slide-up 入场 (300ms)
    │              │   ├── 选项 stagger 入场 (4×50ms)
    │              │   └── isLocked = false
    │              │
    │              └── 最后一题 → startSequencing()
    │                  ├── 题目卡片缩小淡出
    │                  ├── 背景变深色
    │                  ├── DNA 双螺旋动画 (2.5s)
    │                  ├── 文字轮播
    │                  ├── calculatePersonality() 执行
    │                  └── finishSequencing() → navigate('/result')
    │
    └── 用户看到下一题 / 测序动画
```

---

## 附录 B：结果页流派色映射

```typescript
// 用于 Tailwind 动态 class
const factionColorMap: Record<string, {
  bg: string;
  text: string;
  border: string;
  gradient: string;
}> = {
  'FE 拓荒者流派': {
    bg: 'bg-faction-fe/10',
    text: 'text-faction-fe',
    border: 'border-faction-fe',
    gradient: 'from-[#d4a04a] to-[#c8903a]',
  },
  'FO 离岸者流派': {
    bg: 'bg-faction-fo/10',
    text: 'text-faction-fo',
    border: 'border-faction-fo',
    gradient: 'from-[#7a9ca8] to-[#688a96]',
  },
  'VE 征服者流派': {
    bg: 'bg-faction-ve/10',
    text: 'text-faction-ve',
    border: 'border-faction-ve',
    gradient: 'from-[#8b5a4a] to-[#7a4a3a]',
  },
  'VO 守夜人流派': {
    bg: 'bg-faction-vo/10',
    text: 'text-faction-vo',
    border: 'border-faction-vo',
    gradient: 'from-[#6b7a5c] to-[#5a684c]',
  },
};
```

---

> **文档维护：** 本规范随 Oracle MVP 开发迭代更新。如有交互模式变更，需同步更新本文档的对应章节。开发过程中发现的移动端兼容性问题应补充到 §3 移动端交互规范中。
