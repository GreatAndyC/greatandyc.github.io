# 架构

## 核心部分

### 1）架构风格

- 主要风格：内容驱动的静态站点生成（SSG），外加一个只在本地运行的文件型 CMS。
- 判断依据：文章和页面存放为 Markdown/YAML；Hexo 在构建期运行生成器与 NexT 模板；GitHub Pages 只托管 `public/` 静态产物。
- 主要约束：
  - 线上无常驻后端、数据库或服务端会话。
  - 多语言不是两个独立站点，而是同一 Hexo 内容集合在生成期按 `lang` 分流。
  - 主题已直接放进仓库并修改，站点行为与 NexT 上游实现耦合。

### 2）系统流

主发布链路：

```text
Markdown/YAML/图片
  -> Hexo 读取 source/
  -> 站点生成器按语言构造首页、标签、分类和画廊 JSON
  -> NexT Swig/helper/Stylus 渲染
  -> public/ 静态文件
  -> GitHub Actions
  -> gh-pages + caoyueyang.org
```

具体步骤：

1. 作者直接编辑 `source/`，或通过 `tools/local-cms.js` 写回 Markdown、YAML 和图片。
2. 画廊也可以先写入 `content/gallery/*.md`，再由 `tools/gallery-sync.js` 汇总到 `source/_data/gallery.yml`。
3. Hexo 读取所有文章；`hexo-generator-index-i18n` 生成语言首页，`scripts/localized-taxonomy.js` 按 `lang` 生成标签和分类详情。
4. `themes/next/scripts/helpers/engine.js` 提供语言感知菜单、语言切换、同语言文章导航和画廊渲染 helper，并为每个相册输出按语言区分的 JSON。
5. `themes/next/layout/` 生成 HTML；`source/_data/styles.styl` 和主题资源生成 CSS/JS。
6. `main` 分支 push 触发 GitHub Actions，Node.js 20 环境执行干净构建并把 `public/` 发布到 `gh-pages`。

双语路由的关键形态：

```text
英文首页 /                  中文首页 /zh-CN/
英文独立页 /en/about/       中文独立页 /about/
英文文章 /en/YYYY/...       中文文章 /YYYY/...
```

英文是默认语言，但英文独立页仍物理存放在 `source/en/`。`localized_path` 会优先检测显式语言路由是否存在，因此菜单不会因为“英文默认”而错误落到中文基础路径。

### 3）层/模块职责

| 层或模块 | 负责 | 不负责 | 证据 |
|----------|------|--------|------|
| 内容层 | 文章、页面、图片、画廊源数据 | 路由算法和部署 | `source/`、`content/gallery/` |
| 站点配置层 | 域名、语言、永久链接、生成和部署参数 | 具体页面 HTML | `_config.yml` |
| 生成层 | 读取集合、语言过滤、生成 taxonomy 和画廊 JSON | 浏览器事件交互 | `scripts/localized-taxonomy.js`、`themes/next/scripts/helpers/engine.js` |
| 展示层 | Swig 布局、Stylus 样式、画廊和搜索的浏览器交互 | 内容持久化 | `themes/next/layout/`、`themes/next/source/`、`source/_data/styles.styl` |
| 本地创作层 | 文件 CRUD、图片管理、LLM 辅助、调用 Hexo 命令 | 线上请求处理 | `tools/local-cms.js`、`tools/local-cms/` |
| CI/CD 层 | 干净安装、构建、发布到 Pages | 内容编辑 | `.github/workflows/deploy.yml` |

### 4）重复使用的模式

| 模式 | 出现位置 | 目的 |
|------|----------|------|
| Hexo 扩展点 | `scripts/`、`themes/next/scripts/` | 用 generator/helper/filter 扩展构建过程 |
| 双语文件对 | `source/_posts/*.en.md` 与 `*.zh-CN.md` | 用同一基名配对翻译稿 |
| 构建期适配器 | `content/gallery/*.md` -> `source/_data/gallery.yml` -> `gallery-data/<lang>/*.json` | 把易编辑格式转换为前台高效消费格式 |
| 路由存在性检测与回退 | `localizedRoutePath`、`i18n_path` | 在特殊页、taxonomy 和语言切换间保持可达 |
| 文件型持久化 | `tools/local-cms.js` | 不引入数据库，直接让 Git 成为内容审计记录 |
| 渐进加载 | `gallery-loader.js` | 相册详情打开时再读取 JSON，并按窗口加载缩略图 |

### 5）已知架构风险

- 双语逻辑同时分布在插件、站点生成器、主题 helper、页面目录和 front matter，改默认语言或 URL 规则时需要成组验证。
- `tools/local-cms.js` 和其前端文件体积较大且职责集中，内容、图片、LLM、命令执行和审计共处一个模块。
- 仓库内置主题已被直接修改，升级 NexT 时容易与本地 helper/layout 改动冲突。
- 线上 `/admin/` 只是 Decap/Netlify 配置入口；当前 GitHub Pages 部署本身不提供 Identity 或 Git Gateway。

### 6）证据

- `_config.yml`
- `package.json`
- `.github/workflows/deploy.yml`
- `scripts/localized-taxonomy.js`
- `themes/next/scripts/helpers/engine.js`
- `themes/next/layout/page.swig`
- `tools/local-cms.js`
- `tools/gallery-sync.js`
