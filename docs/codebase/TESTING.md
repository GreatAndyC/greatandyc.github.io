# 测试现状

## 核心部分

### 1）测试栈和命令

- 快速契约/安全测试：Node.js `node:test` + `node:assert/strict`。
- 浏览器测试：Playwright `1.62.0`。
- 无障碍：`@axe-core/playwright` `4.12.1`，规则包含 WCAG 2.0/2.1/2.2 A/AA 标签。
- HTML：HTML Validate `10.17.0`。
- 页面预算：Lighthouse CI `0.15.1`。
- 外链：Lychee GitHub Action。
- 依赖安全：`npm audit --audit-level=high`。
- mock 库：无；测试主要使用构建产物、本地 Hexo server 和受控 DOM。

```bash
npm test
npm run test:site
npm run test:html
npm run test:e2e
npm run test:e2e:cross-browser
npm run test:visual
npm run test:visual:update
npm run test:lighthouse
npm run test:security
npm run test:quality

# [TODO] 无覆盖率命令
```

### 2）测试布局

- `test/*.test.js`：生成结果、作品集契约和本地 CMS 安全边界。
- `test/e2e/*.spec.js`：真实浏览器交互、响应式、无障碍和视觉回归。
- `test/e2e/helpers.js`：统一打开页面、捕获控制台/网络问题、检查图片和横向溢出。
- `test/e2e/__screenshots__/`：已审阅的桌面/移动视觉基线。
- `playwright.config.js`：项目矩阵、server、重试和失败产物。
- `.htmlvalidate.json`、`lighthouserc.js`：结构和质量预算。
- `.github/workflows/`：PR、发布和每周质量矩阵。

### 3）测试范围矩阵

| 范围 | 是否覆盖 | 典型目标 | 说明 |
|------|----------|----------|------|
| 单元/安全边界 | 部分 | 路径包含、loopback/Host/Origin、命令脚本语法 | CMS 的主要业务函数未独立单测 |
| 生成集成 | 是 | 747 个生成文件、站内链接、语言目的地、taxonomy、HTML 结构 | 每次 PR/发布运行 |
| 页面契约 | 是 | 双语菜单、Work 内容/图片/布局、资源版本 | Node 测试直接检查生成 HTML/CSS |
| E2E | 是 | 路由、语言切换、移动导航、画廊、搜索、图片 | Chromium 桌面与 Pixel 7 为快速门禁 |
| 跨浏览器 | 是 | Chromium、Firefox、WebKit | 每周或手动运行 |
| 无障碍 | 是 | 5 条英文核心路由 | axe 自动规则，不能替代人工审阅 |
| 视觉回归 | 是/显式启用 | Work、About 桌面和移动首屏 | 默认 E2E 中跳过，需环境变量开启 |
| 性能/SEO | 是 | 首页、Work、About、Gallery、Archives | Lighthouse 有阈值，性能为 warning |
| 外链 | 是/定时 | 生成 HTML 中的站内与外部链接 | 每周运行，避免网络波动阻塞 PR |
| 线上部署后冒烟 | `[TODO]` | 正式域名和 CDN 缓存 | 发布 workflow 没有部署后请求 |

### 4）Mock 与隔离策略

- Node 契约测试先消费干净构建的 `public/`，不调用线上服务。
- Playwright 默认启动 `127.0.0.1` Hexo server；可用 `E2E_BASE_URL` 改为外部环境。
- E2E 捕获 `pageerror`、控制台错误和失败请求，测试结束统一断言。
- 无障碍只在 Chromium desktop 执行一次；浏览器无关的重复项目按测试条件跳过。
- LLM、网易云、Netlify、GitHub 写回和本地 CMS 完整 CRUD 没有自动模拟。
- 视觉差异阈值为 `maxDiffPixelRatio: 0.02`，更新基线必须显式执行。

### 5）覆盖率和质量信号

- JavaScript 行/分支覆盖率：`[TODO]`，未配置 c8/Istanbul。
- Lighthouse 最低分：性能 `0.65`（warning）、无障碍 `0.85`、最佳实践 `0.80`、SEO `0.85`。
- 2026-07-30 本地 `npm run test:quality` 实测：
  - Hexo 在约 1.9 秒生成 747 个文件。
  - 28 个 Node 测试全部通过。
  - HTML Validate 通过。
  - Playwright 快速矩阵发现 54 项：40 通过、14 按项目/视觉配置跳过。
  - 5 个 Lighthouse 页面全部满足预算；本次性能分约为首页 0.72、Work 0.91、About 0.93、Gallery 0.97、Archives 0.99，无障碍与 SEO 均为 1.00。
- `npm audit --json` 同日为 0 漏洞。

主要缺口：

1. `localized-taxonomy.js` 和主题 helper 的纯函数没有直接单测，主要靠生成结果覆盖。
2. 画廊 Markdown -> YAML 同步器没有独立输入/输出 fixture。
3. 本地 CMS 缺少文章/页面/画廊/图片 CRUD 和 LLM 请求的端到端测试。
4. 没有正式域名部署后 smoke test。
5. 无代码覆盖率趋势。

### 6）证据

- `package.json`
- `test/site-integrity.test.js`
- `test/local-cms-security.test.js`
- `test/portfolio-build.test.js`
- `test/e2e/site.spec.js`
- `test/e2e/accessibility.spec.js`
- `test/e2e/visual.spec.js`
- `playwright.config.js`
- `.htmlvalidate.json`
- `lighthouserc.js`
- `.github/workflows/deploy.yml`
- `.github/workflows/quality.yml`
- `.github/workflows/scheduled-quality.yml`
