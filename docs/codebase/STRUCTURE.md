# 代码库结构

## 核心部分

### 1）顶层目录图

| 路径 | 职责 | 证据 |
|------|------|------|
| `_config.yml` | 域名、语言顺序、永久链接、生成器和部署配置 | `_config.yml` |
| `source/` | Hexo 的直接输入：文章、页面、数据、管理入口和图片 | `_config.yml`、`source/` |
| `content/gallery/` | 人工维护的结构化画廊 Markdown 源 | `tools/gallery-sync.js` |
| `scripts/` | Hexo 启动时自动加载的站点级生成器 | `scripts/localized-taxonomy.js` |
| `themes/next/` | 仓库内置并定制的 NexT 主题、模板、helper、样式和前台脚本 | `themes/next/package.json` |
| `tools/` | 本地 CMS、画廊工具和图片命名/压缩工具 | `package.json`、`tools/` |
| `test/` | Node 契约/安全测试、Playwright E2E 和视觉基线 | `package.json`、`playwright.config.js` |
| `languages/` | 站点级英文与中文文案覆盖 | `languages/en.yml`、`languages/zh-CN.yml` |
| `scaffolds/` | Hexo 新文章、页面和草稿模板 | `scaffolds/` |
| `.github/` | CI/CD、定时质量检查和 Dependabot | `.github/workflows/`、`.github/dependabot.yml` |
| `docs/` | 写作、CMS、测试、维护和代码库说明 | `docs/` |
| `public/` | Hexo 构建输出，不是编辑源 | `_config.yml`、`.gitignore` |
| `.deploy_git/` | 本地 Hexo deploy 缓存，不是编辑源 | `.gitignore` |

`source/` 的关键边界：

- `source/_posts/`：48 篇文章；24 篇 `en`、24 篇 `zh-CN`，统一放在一个目录。
- `source/about/`、`source/gallery/`、`source/work/`：中文独立页。
- `source/en/`：英文独立页。
- `source/zh-CN/`：中文显式语言首页/taxonomy 入口。
- `source/_data/gallery.yml`：Hexo/主题消费的派生画廊数据。
- `source/_data/styles.styl`：2,341 行站点级全局样式覆盖。
- `source/images/`：447 个被 Git 跟踪的图片文件，约 276 MB。
- `source/admin/`：Decap CMS 的线上入口与配置。

### 2）入口点

- 主构建入口：`package.json` 的 `build` / `server` / `deploy` 脚本调用 Hexo CLI。
- 站点生成器：`scripts/localized-taxonomy.js`。
- 主题渲染器：`themes/next/scripts/renderer.js`，把 `.njk` 和 `.swig` 交给 Nunjucks。
- 主题扩展：`themes/next/scripts/helpers/engine.js` 及 `themes/next/scripts/filters/`。
- 本地管理服务：`tools/local-cms.js`，由 `npm run cms:local` 启动。
- 本地 CMS 前端：`tools/local-cms/index.html`、`app.js`、`app.css`。
- 画廊同步：`tools/gallery-sync.js`。
- 浏览器交互：`themes/next/source/js/` 和生成的 `js/portfolio-gallery.js`。
- 线上没有 Node.js 请求入口；部署后只有静态文件和第三方浏览器服务。

### 3）模块边界

| 边界 | 应放内容 | 不应放内容 |
|------|----------|------------|
| `source/` | 可发布内容、页面数据和静态资源 | 密钥、构建缓存、通用 Node 服务逻辑 |
| `content/gallery/` | 可编辑的画廊事实源 | 最终渲染模板 |
| `scripts/` | 站点级 Hexo generator | 页面样式和文章正文 |
| `themes/next/` | 主题模板、helper/filter 和客户端交互 | 内容事实源、私密配置 |
| `tools/` | 只在本机运行的内容管理与转换工具 | 线上必须存在的 API |
| `test/` | 生成契约、浏览器验收与基线 | 生产逻辑 |
| `public/` / `.deploy_git/` | 生成结果与部署缓存 | 手工维护的源文件 |

### 4）命名与组织规则

- 双语文章：`<date>-<slug>.zh-CN.md` 与 `<date>-<slug>.en.md` 成对。
- 工具/脚本文件以 kebab-case 为主；函数和变量为 camelCase；常量为 UPPER_SNAKE_CASE。
- 英文独立页通常为 `source/en/<page>/index.md`；中文兼容页通常为 `source/<page>/index.md`，taxonomy 另有 `source/zh-CN/` 入口。
- JavaScript 使用相对路径和 CommonJS `require`；无路径别名和 barrel exports。
- 目录按“内容、生成、主题、创作工具、测试”职责分区，不是前端组件树或传统 MVC 分层。
- `public/`、`.deploy_git/`、测试报告和 Lighthouse 输出均为生成物，应从源码分析和手工编辑中排除。

### 5）证据

- `README.md`
- `_config.yml`
- `package.json`
- `scripts/localized-taxonomy.js`
- `tools/local-cms.js`
- `tools/gallery-sync.js`
- `themes/next/scripts/renderer.js`
- `themes/next/scripts/helpers/engine.js`
- `playwright.config.js`
