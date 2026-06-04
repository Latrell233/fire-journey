# Fire Journey · 项目上下文

## 终端代理

当 `git push` 或其他网络操作遇到超时时，先执行 `proxy_on` 打开终端代理：

```bash
proxy_on
```

## 跨 SPA 导航

此项目使用单域名 + 路径前缀路由（`/` landing，`/oracle/`，`/sandbox/` 等），各子产品是独立的 React SPA。**跨 SPA 跳转必须用 `<a href>`，不能用 React Router `<Link>`**，否则客户端路由无法匹配目标应用。

## 技术栈

- Monorepo: pnpm workspace + Turborepo
- 前端: React 18 + Vite 5 + Tailwind CSS 3
- 状态: Zustand
- 动效: Framer Motion
- 部署: Vercel（单项目 + 构建聚合脚本）
