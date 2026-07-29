# 编码与内容约定

## 核心部分

### 1）命名规则

| 项目 | 规则 | 示例 | 证据 |
|------|------|------|------|
| 文章文件 | 日期 + slug + 语言后缀 | `2026-05-15-manus-trial.en.md` | `source/_posts/` |
| 独立页 | 语言目录 + 页面目录 + `index.md` | `source/en/about/index.md` | `source/en/` |
| 工具脚本 | kebab-case | `gallery-sync.js`、`localized-taxonomy.js` | `tools/`、`scripts/` |
| 函数/变量 | camelCase | `localizedRoutePath`、`syncGalleryDataFile` | `themes/next/scripts/helpers/engine.js`、`tools/local-cms.js` |
| 常量/环境变量 | UPPER_SNAKE_CASE | `GALLERY_DATA_DIR`、`LOCAL_CMS_LLM_API_KEY` | `themes/next/scripts/helpers/engine.js`、`.env.example` |
| 类型/接口 | 不适用：根项目为 JavaScript，无 TypeScript 类型层 | `[TODO]` | `package.json` |

内容 front matter 的实际约定：

- 明确设置 `lang: en` 或 `lang: zh-CN`。
- 中英文成对文章尽量共享 slug 和日期，但永久链接分别保持英文 `/en/...` 与中文旧路径。
- 分类名通过 `_config.yml#category_map` 映射；标签不会自动翻译。
- 图片使用站点绝对路径，例如 `/images/...`。

### 2）格式化和 lint

- 根项目 formatter：未配置。
- 根项目 linter：未配置。
- 根项目可执行命令：只有构建可作为语法与渲染校验，`npm run build`。
- 内置 NexT 主题保留 `.eslintrc.json` 与 Gulp lint/config 校验，但根 `package.json` 和部署工作流没有调用主题的 `npm test`。
- 最相关的现实规则来自现有源码：CommonJS、`'use strict'`、分号、两空格缩进；Markdown/YAML 写作规则见 `docs/writing-style-guide.md`。

### 3）导入和模块约定

- Node.js 工具使用 CommonJS `require`。
- 没有路径别名或 barrel export；模块通过相对路径和 Node 内置模块引用。
- 根 `scripts/*.js` 依赖 Hexo 自动加载，不从应用入口手工 import。
- 主题通过 `hexo.extend.generator/helper/filter.register` 暴露能力给 Swig 模板。

### 4）错误和日志约定

- CLI 工具打印错误并以非零状态退出，例如 `tools/gallery-sync.js#fail`。
- 本地 CMS 顶层路由捕获异常并返回 `{ "error": "<message>" }` 和 HTTP 500。
- 本地 CMS 的文章/图片 CRUD 写入 `.local-cms-audit.log`；命令状态保存在内存并回传前端。
- LLM 调试日志写入 `.local-cms-llm-debug.log`；`.gitignore` 忽略 `*.log`、`.env` 和 `.local-cms.json`。
- API key 从本机 `.env` 读取，不应进入 Markdown、前端 bundle 或 Git。

### 5）测试约定

- 根项目没有测试文件命名或 mock 规范。
- 当前发布前最小检查是干净构建，以及人工检查中文/英文首页、菜单、taxonomy、文章导航和语言切换。
- 覆盖率要求：`[TODO]`。

### 6）证据

- `source/_posts/`
- `scaffolds/post.md`
- `docs/writing-style-guide.md`
- `.gitignore`
- `tools/gallery-sync.js`
- `tools/local-cms.js`
- `themes/next/.eslintrc.json`
- `themes/next/gulpfile.js`
