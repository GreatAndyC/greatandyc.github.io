# 技术栈

## 核心部分

### 1）运行时概览

| 领域 | 当前值 | 证据 |
|------|--------|------|
| 主要语言 | JavaScript（构建脚本、本地 CMS、浏览器脚本）+ Markdown/YAML/Swig/Stylus（内容与展示） | `package.json`、`scripts/`、`tools/`、`source/`、`themes/next/` |
| 构建运行时 | CI 固定 Node.js 20；本地 Node 版本未在 `.nvmrc` 或 `package.json#engines` 中锁定 | `.github/workflows/deploy.yml`、`package.json` |
| 包管理器 | npm，lockfileVersion 3 | `package-lock.json` |
| 站点生成器 | Hexo 7.3.0 | `package.json` |
| 生产运行形态 | GitHub Pages 上的静态 HTML/CSS/JS，无常驻应用服务器 | `.github/workflows/deploy.yml`、`_config.yml` |

### 2）生产框架和高影响依赖

| 依赖 | 版本 | 系统职责 | 证据 |
|------|------|----------|------|
| `hexo` | `^7.3.0` | 读取内容、运行生成器、渲染并输出静态站点 | `package.json` |
| NexT | `7.8.0`（仓库内置） | Swig 页面模板、主题脚本、样式和前台组件 | `themes/next/package.json`、`_config.yml` |
| `hexo-generator-index-i18n` | `^0.2.1` | 按语言生成首页和分页 | `package.json`、`_config.yml` |
| archive/category/tag generators | `^2.0.0` | 生成归档、分类和标签入口 | `package.json` |
| `hexo-generator-feed` | `^4.0.0` | 生成 `atom.xml` | `package.json`、`_config.yml` |
| `hexo-generator-searchdb` | `^1.5.0` | 生成浏览器端本地搜索数据 | `package.json`、`themes/next/_config.yml` |
| EJS/Marked/Stylus renderers | `^2.0.0` / `^7.0.0` / `^3.0.1` | 渲染模板、Markdown 和 Stylus | `package.json` |
| `hexo-deployer-git` | `^4.0.0` | 支持本地 `hexo deploy` 到 `gh-pages` | `package.json`、`_config.yml` |
| `js-yaml` | 由 Hexo 依赖树提供 | 本地 CMS 与画廊工具读写 YAML | `tools/local-cms.js`、`tools/gallery-sync.js`、`package-lock.json` |

`hexo-theme-landscape` 虽在根依赖中，但 `_config.yml` 实际选择的是仓库内的 `themes/next/`。

### 3）开发工具链

| 工具 | 用途 | 证据 |
|------|------|------|
| Hexo CLI | 清理、生成、预览和部署 | `package.json` |
| 自制 Node.js 本地 CMS | 编辑文章、独立页面、分类、画廊和图片；可调用 LLM | `tools/local-cms.js`、`tools/local-cms/` |
| 画廊 CLI/同步器 | 把 `content/gallery/*.md` 汇总为 `source/_data/gallery.yml` | `tools/gallery-sync.js`、`tools/gallery-cli.js` |
| GitHub Actions | `main` 更新后构建并发布 `gh-pages` | `.github/workflows/deploy.yml` |
| ESLint/Gulp/Stylint | 仅在内置 NexT 主题子目录声明，根项目未接入这些检查 | `themes/next/package.json`、`themes/next/gulpfile.js` |

### 4）关键命令

```bash
npm ci
npm run server
npm run build
npm run clean
npm run cms:local
npm run gallery:sync
npm run deploy

# [TODO] 根项目没有 test 或 lint script
```

### 5）环境与配置

- 站点配置：`_config.yml`
- 主题配置：`themes/next/_config.yml`
- 本地 CMS 可选配置：`.env`，模板为 `.env.example`
- 构建必需环境变量：无
- 可选 LLM 变量：`LOCAL_CMS_LLM_ENDPOINT`、`LOCAL_CMS_LLM_API_KEY`、`LOCAL_CMS_LLM_MODEL`、`LOCAL_CMS_LLM_TEMPERATURE`、两类 prompt
- 本地 CMS 默认监听 `127.0.0.1:4010`；线上 GitHub Pages 不运行它
- CI 使用 Node.js 20、`npm ci`、`hexo clean`、`hexo generate`

### 6）证据

- `package.json`
- `package-lock.json`
- `_config.yml`
- `.env.example`
- `.github/workflows/deploy.yml`
- `themes/next/package.json`
