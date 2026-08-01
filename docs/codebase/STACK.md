# 技术栈

## 核心部分

### 1）运行时概览

| 领域 | 当前值 | 证据 |
|------|--------|------|
| 主要语言 | JavaScript；内容与配置使用 Markdown/YAML，模板使用 Nunjucks 兼容的 `.swig`，样式使用 Stylus | `package.json`、`source/`、`themes/next/scripts/renderer.js`、`source/_data/styles.styl` |
| 构建运行时 | CI 固定 Node.js `20.19`；仓库没有 `.nvmrc`、`.node-version` 或根级 `engines` | `.github/workflows/deploy.yml`、`.github/workflows/quality.yml`、`package.json` |
| 包管理器 | npm，lockfileVersion 3 | `package-lock.json` |
| 模块系统 | 根工具和主题逻辑主要使用 CommonJS；浏览器端使用全局脚本 | `tools/local-cms.js`、`themes/next/source/js/next-boot.js` |
| 站点生成器 | Hexo `7.3.0` | `package.json`、`package-lock.json` |
| 生产形态 | GitHub Pages 上的静态 HTML/CSS/JS，无常驻应用服务器 | `.github/workflows/deploy.yml`、`_config.yml` |

2026-07-30 的终端核验结果：本机为 Node.js `25.2.1` / npm `11.12.1`，与 CI 不一致；`npm outdated --json` 显示 Hexo 最新版本为 `8.1.2`、HTML Validate 最新版本为 `11.6.0`。

### 2）生产框架和高影响依赖

| 依赖 | 声明/内置版本 | 系统职责 | 证据 |
|------|---------------|----------|------|
| `hexo` | `^7.3.0` | 读取内容、运行扩展点并输出静态站点 | `package.json` |
| 仓库内置 NexT | `7.8.0` | 页面布局、主题 helper、浏览器脚本和基础样式 | `themes/next/package.json`、`_config.yml` |
| `hexo-generator-index-i18n` | `^0.2.1` | 按语言生成首页与分页 | `package.json`、`_config.yml` |
| archive/category/tag generators | `^2.0.0` | 生成归档、分类和标签页面 | `package.json` |
| `hexo-generator-feed` | `^4.0.0` | 生成 Atom feed | `package.json`、`_config.yml` |
| `hexo-generator-searchdb` | `^1.5.0` | 生成浏览器本地搜索数据 | `package.json`、`themes/next/_config.yml` |
| EJS/Marked/Stylus renderers | `^2.0.0` / `^7.0.0` / `^3.0.1` | 渲染 EJS、Markdown 和 Stylus | `package.json` |
| `hexo-deployer-git` | `^4.0.0` | 支持本地 `hexo deploy` | `package.json`、`_config.yml` |
| `js-yaml` | 传递依赖 | 本地 CMS 与画廊工具读写 YAML | `tools/local-cms.js`、`tools/gallery-sync.js`、`package-lock.json` |

`hexo-theme-landscape` 已安装但未启用；实际主题为仓库内的 `themes/next/`。

### 3）开发和质量工具链

| 工具 | 用途 | 证据 |
|------|------|------|
| Node.js `node:test` | 生成结果契约、本地 CMS 安全边界和作品集断言 | `test/*.test.js`、`package.json` |
| Playwright `1.62.0` | Chromium/Firefox/WebKit、桌面/移动端 E2E 与视觉回归 | `playwright.config.js`、`test/e2e/` |
| axe-core | WCAG A/AA 自动无障碍检查 | `test/e2e/accessibility.spec.js` |
| HTML Validate `10.17.0` | 生成 HTML 结构校验 | `.htmlvalidate.json`、`package.json` |
| Lighthouse CI `0.15.1` | 性能、无障碍、最佳实践和 SEO 预算 | `lighthouserc.js` |
| Lychee | 每周外链检查 | `.github/workflows/scheduled-quality.yml` |
| Dependabot / npm audit | 依赖更新和高危漏洞门禁 | `.github/dependabot.yml`、`package.json` |
| 自制本地 CMS | 编辑 Markdown/YAML/图片、调用 LLM、执行固定 Hexo 命令 | `tools/local-cms.js`、`tools/local-cms/` |
| 画廊工具 | Markdown 画廊源与 YAML 构建数据之间的同步 | `tools/gallery-sync.js`、`tools/gallery-cli.js` |
| Gulp/ESLint/Stylint | 旧 NexT 子项目保留的检查；根级 CI 未调用 | `themes/next/package.json`、`themes/next/gulpfile.js` |

根项目没有统一的 formatter、JavaScript linter 或 TypeScript 配置。

### 4）关键命令

```bash
npm ci
npm run server
npm run build
npm run cms:local
npm run gallery:sync

npm test
npm run test:html
npm run test:e2e
npm run test:e2e:cross-browser
npm run test:visual
npm run test:lighthouse
npm run test:quality
npm run test:security

npm run deploy
```

### 5）环境与配置

- 站点配置：`_config.yml`
- 主题配置：`themes/next/_config.yml`
- 浏览器测试：`playwright.config.js`
- Lighthouse：`lighthouserc.js`
- HTML 校验：`.htmlvalidate.json`
- 本地 CMS 可选配置：`.env`，模板为 `.env.example`
- 构建必需环境变量：无
- 可选 LLM 变量：`LOCAL_CMS_LLM_ENDPOINT`、`LOCAL_CMS_LLM_API_KEY`、`LOCAL_CMS_LLM_MODEL`、`LOCAL_CMS_LLM_TEMPERATURE` 和 prompt 变量
- 本地 CMS 默认只监听 `127.0.0.1:4010`；线上不运行该进程
- 无 Docker、容器编排或数据库运行时

### 6）证据

- `package.json`
- `package-lock.json`
- `_config.yml`
- `.env.example`
- `.github/workflows/deploy.yml`
- `.github/workflows/quality.yml`
- `.github/workflows/scheduled-quality.yml`
- `playwright.config.js`
- `lighthouserc.js`
- `themes/next/package.json`
