# 代码库结构

## 核心部分

### 1）顶层目录图

| 路径 | 职责 | 证据 |
|------|------|------|
| `_config.yml` | Hexo 站点、URL、语言顺序、生成器和部署配置 | `_config.yml` |
| `source/` | Hexo 的直接输入：文章、独立页面、数据和图片 | `_config.yml`、`source/` |
| `content/gallery/` | 人工维护的画廊 Markdown 源数据 | `tools/gallery-sync.js` |
| `scripts/` | Hexo 启动时自动加载的站点级生成器 | `scripts/localized-taxonomy.js` |
| `themes/next/` | 仓库内置且已定制的 NexT 主题、模板、helper 和浏览器脚本 | `themes/next/package.json`、`themes/next/scripts/helpers/engine.js` |
| `tools/` | 本地 CMS、画廊同步、画廊 CLI 和图片命名工具 | `package.json`、`tools/` |
| `languages/` | 站点级英文与中文文案覆盖 | `languages/en.yml`、`languages/zh-CN.yml` |
| `scaffolds/` | Hexo 新建文章、页面和草稿的模板 | `scaffolds/` |
| `.github/workflows/` | 自动构建与 GitHub Pages 发布 | `.github/workflows/deploy.yml` |
| `docs/` | 写作、本地 CMS、维护和代码库说明 | `docs/` |
| `public/` | 构建产物，不是编辑源 | `_config.yml`、`.gitignore` |
| `.deploy_git/` | 本地部署缓存，不是编辑源 | `.gitignore` |

`source/` 内的重要边界：

- `source/_posts/`：所有中英文文章，共用一个目录，以 `lang` 和文件后缀区分。
- `source/about/`、`source/gallery/`、`source/tags/`、`source/categories/`：中文独立页。
- `source/en/`：英文独立页。
- `source/_data/gallery.yml`：Hexo/主题实际消费的画廊数据。
- `source/_data/styles.styl`：站点级样式覆盖。
- `source/images/`：文章、画廊、头像等静态图片。
- `source/admin/`：Decap CMS 的线上入口与配置壳。

### 2）入口点

- 主构建入口：`package.json` 的 `build` / `server` / `deploy` 脚本调用 Hexo CLI。
- Hexo 站点扩展入口：`scripts/localized-taxonomy.js`。
- 主题扩展入口：`themes/next/scripts/helpers/engine.js` 及 `themes/next/scripts/filters/`。
- 本地管理入口：`tools/local-cms.js`，由 `npm run cms:local` 启动。
- 画廊同步入口：`tools/gallery-sync.js`，由 `npm run gallery:sync` 启动。
- 浏览器画廊入口：`themes/next/source/js/gallery-loader.js`。
- 线上不存在 Node.js 应用入口；部署后只有静态资源。

### 3）模块边界

| 边界 | 应放内容 | 不应放内容 |
|------|----------|------------|
| `source/` | 可发布内容和静态资源 | 生成器逻辑、密钥 |
| `content/gallery/` | 可人工维护的画廊记录 | 最终前台渲染逻辑 |
| `scripts/` | 站点级 Hexo 生成器 | 页面样式和文章正文 |
| `themes/next/` | 页面模板、主题 helper、客户端交互 | 原始文章和个人密钥 |
| `tools/` | 只在本机运行的内容管理与同步工具 | 线上必须存在的 API |
| `public/` / `.deploy_git/` | 生成输出和部署缓存 | 手工维护的源文件 |

### 4）命名和组织规则

- 双语文章：`<date>-<slug>.zh-CN.md` 与 `<date>-<slug>.en.md` 成对存在。
- 文章永久链接由 front matter 明确区分；英文通常为 `en/...`，中文保留无语言前缀的旧 URL。
- 英文独立页使用 `source/en/<page>/index.md`，中文独立页使用 `source/<page>/index.md`。
- JavaScript 文件以 kebab-case 为主，函数和变量使用 camelCase，常量使用 UPPER_SNAKE_CASE。
- 项目没有 TypeScript 路径别名；Node.js 脚本使用 CommonJS `require` 和相对路径。
- `public/` 和 `.deploy_git/` 属于生成内容，分析和改动时应排除。

### 5）证据

- `README.md`
- `_config.yml`
- `package.json`
- `scripts/localized-taxonomy.js`
- `tools/local-cms.js`
- `tools/gallery-sync.js`
- `themes/next/layout/page.swig`
