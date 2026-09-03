# 网站测试策略

这套测试的目标不是追求“测试数量”，而是把这个 Hexo 站点最容易复发的问题变成可重复执行的质量门禁：双语路由、菜单完整性、生成资源、真实浏览器交互、响应式布局、无障碍、外链和发布质量。

## 1. 测试分层

| 层级 | 工具 | 覆盖内容 | 执行时机 |
| --- | --- | --- | --- |
| 依赖安全 | `npm audit --omit=dev --audit-level=high` | 生产依赖中的已知高危漏洞 | PR、部署 |
| 生成结果契约 | Node `node:test` | 双语路由、菜单、图片、Work 页面结构、本地 CMS 边界、生成链接 | 每次 PR、部署 |
| HTML 结构 | HTML Validate | 重复 ID、非法嵌套、缺失必填属性、错误标题结构 | 每次 PR、部署 |
| 浏览器验收 | Playwright | 中英文导航、语言切换、Work 菜单、Gallery、搜索、图片加载、横向溢出 | 每次 PR、部署 |
| 无障碍 | axe-core + Playwright | WCAG A/AA 自动规则、名称、对比度、交互嵌套 | 每次 PR、部署 |
| 页面质量预算 | Lighthouse CI | 性能、无障碍、最佳实践、SEO | 每次 PR、部署 |
| 跨浏览器 | Playwright Chromium / Firefox / WebKit | 桌面和移动端兼容性 | 每周、手动 |
| 外链 | Lychee | 站内与外部链接可达性 | 每周、手动 |
| 视觉回归 | Playwright Screenshot | Work、About 的桌面与移动端关键首屏 | 设计调整后人工更新并审阅 |

这里刻意把快速、确定性的检查放在前面，把较慢或容易受外部网络影响的检查放到后面。这样日常提交能快速失败，外链波动也不会阻塞每一次部署。

## 2. 本地命令

首次安装浏览器：

```bash
npx playwright install chromium
```

日常完整质量门禁：

```bash
npm run test:quality
```

它依次执行：

```bash
npm run test:site
npm run test:html
npm run test:e2e
npm run test:lighthouse
```

其他常用命令：

```bash
# 依赖漏洞
npm run test:security

# Chromium 桌面与 Pixel 7 响应式验收
npm run test:e2e

# Chromium、Firefox、WebKit 全矩阵
npm run test:e2e:cross-browser

# 对照已经审阅的视觉基线
npm run test:visual

# 确认页面改版合理后，显式更新视觉基线
npm run test:visual:update
```

Lighthouse 在 CI 中通过本地 HTTP 服务审计生成目录，因此“是否使用 HTTPS”一项天然扣分；生产站点仍由 `https://caoyueyang.org` 提供 HTTPS。最佳实践门槛据此设为 `0.80`，而不是把本地协议差异伪装成代码缺陷。

## 3. 自动化工作流

- `.github/workflows/quality.yml`：Pull Request 和手动触发；运行依赖审计、构建、生成结果测试、HTML、Chromium 响应式/无障碍和 Lighthouse。
- `.github/workflows/deploy.yml`：正式部署前重复关键门禁；任一关键检查失败就不发布。
- `.github/workflows/scheduled-quality.yml`：每周运行 Firefox/WebKit 跨浏览器测试和 Lychee 外链检查。

视觉基线不在普通 CI 中自动更新。截图变化必须由人确认“这是设计调整，不是布局回归”后，再执行 `npm run test:visual:update`。

## 4. 新 Bug 的处理方式

1. 先写一个能稳定复现问题的最小测试。
2. 确认测试在修复前会失败。
3. 只修改足以解决问题的实现。
4. 运行最小相关测试，再运行 `npm run test:quality`。
5. 如果涉及页面观感，再查看桌面和移动端截图，不能只依赖像素差异分数。

例如，`/archives/` 的语言切换问题应该先写成“从英文归档选择中文后，最终 URL 和 `<html lang>` 都正确”的浏览器验收测试。菜单消失问题则测试每个核心页面都保留 Home、About、Work 和 Gallery，而不是只测试首页。

## 5. 与 Uncle Bob 测试观点的对应

Robert C. Martin 长期强调三件事：

- 用测试先表达可执行规格，并保持 Red → Green → Refactor 的短反馈循环；
- 单元测试、验收测试和人工测试不是互相替代，而是不同反馈层；
- 测试代码本身也必须清晰、可维护，不能成为另一套难以理解的系统。

他近期描述的 Agent 工作流更进一步：先把需求转成 Gherkin 验收规格，再写验收测试、单元测试与生产代码，随后补属性测试和变异测试，最后仍由人做抽查与探索性测试。

本仓库采用了其中适合静态站点的部分：

- 把双语路由和页面行为写成验收测试；
- 用快速生成结果测试承担“单元级”反馈；
- 用真实浏览器、无障碍和视觉审阅补足模板/CSS 边界；
- 保留人工探索性检查，尤其是排版、图片顺序和移动端观感。

暂时不把变异测试设成部署门禁。这个仓库的大部分内容是 Markdown、模板和 CSS，盲目变异会产生大量低价值噪音。以后如果本地 CMS、语言路由引擎或 Gallery 状态逻辑继续复杂化，可以只对这些纯 JavaScript 模块引入 Stryker，并先验证变异结果是否真的揭示断言缺口。

参考：

- [The Cycles of TDD](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html)
- [Test First](https://blog.cleancoder.com/uncle-bob/2013/09/23/Test-first.html)
- [When TDD Does Not Work](https://blog.cleancoder.com/uncle-bob/2014/04/30/When-tdd-does-not-work.html)
- [Mutation Testing](https://blog.cleancoder.com/uncle-bob/2016/06/10/MutationTesting.html)
- [近期 Agent 测试流程（X）](https://x.com/unclebobmartin/status/2061482997610610863)
