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
| 测试文件 | `<area>.test.js` 或 `test/e2e/<area>.spec.js` | `local-cms-security.test.js`、`site.spec.js` | `test/` |
| 类型/接口 | `[TODO]` 根项目没有 TypeScript 类型层 | 不适用 | `package.json` |

内容 front matter 的实际约定：

- 明确设置 `lang: en` 或 `lang: zh-CN`。
- 中英文成对文章共享基名，通常共享 slug 和主题语义。
- 英文 permalink 使用 `/en/...`；中文文章保留无语言前缀的公开路径。
- 分类通过 `_config.yml#category_map` 映射；标签由文章直接声明。
- 图片使用站点绝对路径，例如 `/images/...`。
- 写作和翻译规范见 `docs/writing-style-guide.md`。

### 2）格式化和 lint

- 根 formatter：未配置。
- 根 JavaScript/CSS linter：未配置。
- 根项目通过 `node --check` 测试所有被 Git 跟踪的 JavaScript，但不执行风格规则。
- 旧 NexT 子项目保留 ESLint/Gulp/Stylint；根 CI 未调用它们。
- 现有 JavaScript多数采用 CommonJS、分号、两空格缩进和单引号；`tools/gallery-sync.js` 等文件存在双引号风格，说明规则未统一。
- Stylus 子项目规则要求 lowercase-dash，但站点级 `source/_data/styles.styl` 没有被根 lint 明确覆盖。

相关命令：

```bash
npm test
npm run test:html
npm run test:quality

# [TODO] 无根级 lint/format 命令
```

### 3）导入和模块约定

- Node.js 工具和测试使用 CommonJS `require`。
- 无路径别名或 barrel export；内部模块使用相对路径。
- 根 `scripts/*.js` 由 Hexo 自动加载，不从单一应用入口 import。
- 主题通过 `hexo.extend.generator/helper/filter/renderer.register` 暴露构建能力。
- 浏览器脚本以全局 `NexT` 对象、DOM 查询和事件监听协作，不使用 npm 前端组件模块。

### 4）错误和日志约定

- CLI 工具输出可读错误并以非零状态退出。
- 本地 CMS API 捕获异常并返回 JSON 错误；仅绑定 loopback，检查 Host、Origin、`Sec-Fetch-Site` 和路径边界。
- 可执行命令限定在 `clean`、`build`、`deploy`、`server` 四个 npm script，不接受任意 shell 文本。
- 内容/图片 CRUD 追加写入 `.local-cms-audit.log`；LLM 调试写入 `.local-cms-llm-debug.log`。
- `.gitignore` 排除 `.env`、旧设置文件、日志和测试报告。
- API key 只应存在于本机 `.env`，不得写入 Markdown、浏览器 bundle 或 Git。
- 外部 LLM/音乐请求会包装 HTTP 错误，但没有统一 timeout/retry 约定。

### 5）测试约定

- 快速契约和安全边界放在 `test/*.test.js`，使用 `node:test` + `node:assert/strict`。
- 真实浏览器测试放在 `test/e2e/*.spec.js`，共享操作放在 `test/e2e/helpers.js`。
- E2E 默认并行；CI 重试一次并保留失败 trace/screenshot/video。
- 视觉回归必须显式设置 `RUN_VISUAL_REGRESSION=1`；更新基线需要独立命令。
- 外部链接不阻塞每次 PR，而由每周 Lychee 工作流检查。
- 覆盖率工具和最低行/分支阈值：`[TODO]`。

### 6）仓库约定

- commit message 使用中文。
- commit message 需要详细说明具体改动。
- 生成目录 `public/`、`.deploy_git/` 和报告目录不应手工编辑或提交。

### 7）证据

- `README.md`
- `source/_posts/`
- `scaffolds/post.md`
- `docs/writing-style-guide.md`
- `.gitignore`
- `package.json`
- `tools/gallery-sync.js`
- `tools/local-cms.js`
- `themes/next/.eslintrc.json`
- `themes/next/.stylintrc`
- `test/site-integrity.test.js`
- `playwright.config.js`
