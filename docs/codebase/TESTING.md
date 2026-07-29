# 测试现状

## 核心部分

### 1）测试栈和命令

- 根项目主要测试框架：无。
- 断言/mock 工具：无。
- 当前实际质量门禁：Hexo 干净构建。
- 内置 NexT 主题包含 Gulp + ESLint + YAML 校验任务，但未接入根项目脚本或 CI。

```bash
npm run clean
npm run build

# [TODO] 无根项目 unit test 命令
# [TODO] 无 integration/e2e test 命令
# [TODO] 无 coverage 命令
```

### 2）测试布局

- 根项目没有 `tests/`、`test/`、`__tests__/` 或测试命名文件。
- 主题子目录没有测试用例目录，只有 lint 和 YAML 配置校验任务。
- CI 仅执行依赖安装与静态构建。

### 3）测试范围矩阵

| 范围 | 是否覆盖 | 典型目标 | 说明 |
|------|----------|----------|------|
| 单元测试 | 否 | 双语路由 helper、front matter 解析、画廊同步 | 这些逻辑目前没有自动断言 |
| 集成测试 | 部分 | 完整 Hexo 生成 | `npm run build` 能发现部分配置/渲染错误，但不验证链接语义 |
| E2E | 否 | 中英文菜单、语言切换、Gallery、本地 CMS CRUD | 当前依赖人工浏览器检查 |
| 部署冒烟 | 部分 | GitHub Pages 发布 | Actions 能确认部署任务成功，不确认线上页面内容 |

### 4）Mock 与隔离策略

- 没有自动测试，因此没有既定 mock 方案。
- LLM、网易云、CDN 和 GitHub/Netlify 均未在测试中隔离。
- 常见失败模式：构建成功但菜单落到错误语言、语言切换回退到错误入口、生成页面缺少预期内容。

### 5）覆盖率和质量信号

- 覆盖率工具与阈值：`[TODO]`。
- 当前报告覆盖率：`[TODO]`。
- GitHub Actions 的唯一硬性质量信号是 `hexo generate` 成功。
- 优先补测区域：
  1. `localized_path` / `i18n_path` 的路由矩阵。
  2. `localized-taxonomy.js` 的语言隔离。
  3. `gallery-sync.js` 的 Markdown -> YAML 转换。
  4. 本地 CMS 的文件路径边界、文章配对 CRUD 和图片引用替换。

### 6）证据

- `package.json`
- `.github/workflows/deploy.yml`
- `themes/next/package.json`
- `themes/next/gulpfile.js`
- `scripts/localized-taxonomy.js`
- `themes/next/scripts/helpers/engine.js`
