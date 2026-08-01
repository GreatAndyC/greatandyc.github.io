# 架构

## 核心部分

### 1）架构风格

- 主要风格：内容驱动的静态多页站点生成（SSG/MPA），外加一个只在本地运行、直接读写文件的 CMS。
- 判断依据：Markdown/YAML/图片是事实源；Hexo 在构建期运行 generator/helper/filter 并输出 HTML/CSS/JS；GitHub Pages 只托管构建产物。
- 前端交互方式：服务端/构建期先输出完整 HTML，再由页面脚本渐进增强搜索、首页筛选、语言切换、作品集和画廊。
- 主要约束：
  - 线上无常驻后端、数据库或服务端会话。
  - 多语言是一个内容集合在生成期按 `lang` 分流，而不是两个独立应用。
  - 现有公开 URL 同时包含默认英文、显式 `/en/` 页面、`/zh-CN/` 集合页和中文无前缀兼容页。
  - NexT 主题被直接放进仓库并修改，展示和路由能力与旧主题内部结构耦合。

### 2）系统流

发布链路：

```text
Markdown / YAML / 图片
  -> Hexo 内容模型
  -> 多语言 generator + NexT helper/filter
  -> Nunjucks(Swig) 模板 + Stylus
  -> public/ 静态 HTML/CSS/JS/JSON
  -> GitHub Actions 质量门禁
  -> gh-pages + caoyueyang.org
```

1. 作者直接编辑 `source/`，或由 `tools/local-cms.js` 写回文章、页面、画廊文档和图片。
2. 画廊以 `content/gallery/*.md` 为编辑源；`tools/gallery-sync.js` 汇总为 `source/_data/gallery.yml`。
3. Hexo 读取文章集合；`hexo-generator-index-i18n` 生成语言首页，`scripts/localized-taxonomy.js` 按 `lang` 生成分类和标签详情页。
4. `themes/next/scripts/helpers/engine.js` 处理语言感知菜单、taxonomy 映射、同语言文章导航、画廊 HTML，并为每种语言/相册生成 JSON。
5. `themes/next/scripts/renderer.js` 使用 Nunjucks 渲染 `.swig`；Stylus 生成主 CSS，前台脚本以静态文件输出。
6. push/PR 工作流执行依赖审计、干净构建、生成契约、HTML、浏览器、无障碍和 Lighthouse 检查；`main` 通过后发布 `public/` 到 `gh-pages`。

浏览器画廊链路：

```text
预渲染相册卡片
  -> 用户打开相册
  -> gallery-loader.js 请求 gallery-data/<lang>/<slug>.json
  -> 创建/更新查看器 DOM
  -> 图片按交互状态加载
```

本地 CMS 链路：

```text
127.0.0.1:4010 表单
  -> tools/local-cms.js 的固定 API 路由
  -> 路径/来源边界校验
  -> Markdown/YAML/图片/.env/审计日志
  -> 可选 LLM/网易云请求或 allowlist 内的 npm script
```

### 3）层/模块职责

| 层或模块 | 负责 | 不负责 | 证据 |
|----------|------|--------|------|
| 内容层 | 文章、页面、图片和画廊事实源 | 路由算法、部署 | `source/`、`content/gallery/` |
| 配置层 | 域名、语言、永久链接、主题开关和质量预算 | 具体页面 DOM 交互 | `_config.yml`、`themes/next/_config.yml`、`lighthouserc.js` |
| 生成层 | 语言过滤、taxonomy、画廊 JSON 和模板上下文 | 浏览器事件 | `scripts/localized-taxonomy.js`、`themes/next/scripts/` |
| 展示层 | HTML 模板、全局样式、搜索/画廊/作品集交互 | 内容持久化 | `themes/next/layout/`、`themes/next/source/`、`source/_data/styles.styl` |
| 本地创作层 | 文件 CRUD、图片、LLM、命令和审计 | 公网请求处理 | `tools/local-cms.js`、`tools/local-cms/` |
| 质量层 | 构建契约、E2E、无障碍、视觉、链接和预算 | 生产请求 | `test/`、`.github/workflows/` |
| 托管层 | 静态文件与自定义域名 | SSR、数据库、鉴权 | `.github/workflows/deploy.yml` |

### 4）重复使用的模式

| 模式 | 出现位置 | 目的 |
|------|----------|------|
| Hexo 扩展点 | `scripts/`、`themes/next/scripts/` | 用 generator/helper/filter/renderer 扩展构建 |
| 双语文件对 | `source/_posts/*.en.md` 与 `*.zh-CN.md` | 以同一基名配对翻译稿 |
| 构建期适配器 | `content/gallery/*.md` -> `source/_data/gallery.yml` -> `gallery-data/<lang>/*.json` | 分离编辑格式与浏览器消费格式 |
| 路由存在性检测与回退 | `localizedRoutePath`、`i18n_path` | 保持特殊页、taxonomy 和语言切换可达 |
| 文件型持久化 | `tools/local-cms.js` | 不引入数据库，让 Git 保留内容历史 |
| 渐进增强 | `themes/next/source/js/` | 保留可读取的静态 HTML，仅为交互区域加载 JS |
| 契约式回归保护 | `test/*.test.js`、`test/e2e/` | 保护公开 URL、语言、DOM 和视觉行为 |

### 5）已知架构风险

- 多语言规则分布在插件、站点 generator、主题 helper、目录结构和 front matter 中；URL 改动必须成组迁移。
- NexT `7.8.0` 的 73 个模板文件、32 个主题脚本和本地定制共同构成升级耦合面。
- `source/_data/styles.styl` 是 2,341 行全局高特异性覆盖，页面边界不明确。
- 本地 CMS 前后端分别约 4,934 / 4,836 行，文件、图片、LLM、命令和日志职责集中。
- 线上 `/admin/` 依赖仓库外的 Netlify Identity/Git Gateway；GitHub Pages 本身不提供这些能力。
- 图片事实源约 276 MB；当前构建主要复制原图，没有统一响应式图片生成层。

### 6）证据

- `_config.yml`
- `package.json`
- `.github/workflows/deploy.yml`
- `.github/workflows/quality.yml`
- `scripts/localized-taxonomy.js`
- `themes/next/scripts/renderer.js`
- `themes/next/scripts/helpers/engine.js`
- `themes/next/source/js/gallery-loader.js`
- `tools/local-cms.js`
- `tools/gallery-sync.js`
- `test/site-integrity.test.js`
- `test/e2e/site.spec.js`
