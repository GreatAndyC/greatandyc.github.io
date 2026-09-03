# 代码库关注点

## 核心部分

### 1）主要风险（按优先级）

| 严重度 | 关注点 | 证据 | 影响 | 建议动作 |
|--------|--------|------|------|----------|
| 高 | CI 固定 Node.js `20.19`，仓库未声明统一运行时版本 | 三个 workflow、`package.json` | 本地与 CI 已出现 Node 25 vs 20 的漂移；依赖升级后可能突然不兼容 | 统一到受支持的 LTS，并添加 `.nvmrc`/`.node-version` 与 `engines` |
| 高 | 仓库内置 NexT `7.8.0` 并直接修改模板/helper | `themes/next/package.json`、`themes/next/layout/`、`themes/next/scripts/helpers/engine.js` | 主题升级需要同时处理上游大版本和本地定制 | 先列出本地 patch，迁到站点插件/自定义注入，再决定升级 NexT 或迁移框架 |
| 中 | 站点样式集中在 2,341 行全局 Stylus 覆盖 | `source/_data/styles.styl` | 高特异性选择器和跨页面规则使小改动影响范围难预测 | 按 shell/feed/gallery/about/work 拆分，建立 tokens 与低特异性层 |
| 中 | 本地 CMS 是大型前后端单体 | `tools/local-cms.js`（4,934 行）、`tools/local-cms/app.js`（4,836 行）、`app.css`（1,838 行） | 文件、图片、LLM、命令和日志修改互相影响 | 保持 loopback 边界，按 domain/service/router/component 拆分并补 fixture 测试 |
| 中 | 图片事实源约 276 MB，68 个文件大于 1 MB | `source/images/` | 仓库、部署、页面下载和 Pages 流量随画廊增长 | 构建响应式 WebP/AVIF/缩略图，保留原图策略与体积预算 |
| 中 | 多语言公开 URL 规则特殊且跨层 | `_config.yml`、`scripts/localized-taxonomy.js`、`themes/next/scripts/helpers/engine.js` | 框架/主题迁移容易改变永久链接、canonical 或语言切换目标 | 把现有生成路由导出为迁移契约，逐 URL 对比新旧构建 |
| 低 | 根项目没有 lint/format/type check | `package.json` | 风格漂移和部分错误只能到构建/E2E 阶段发现 | 引入 ESLint/Biome、Prettier 或等价工具；新代码优先 TypeScript |
| 低 | 安装了未启用的 `hexo-theme-landscape` | `package.json`、`_config.yml` | 增加依赖面和维护噪音 | 确认无回退用途后移除 |

2026-07-30 的 `npm outdated --json` 还显示 Hexo 可从 `7.3.0` 升到 `8.1.2`，HTML Validate 可从 `10.17.0` 升到 `11.6.0`；这应作为独立小步验证，不与主题/框架迁移一次完成。

### 2）技术债

| 债务项 | 形成原因 | 位置 | 不处理的风险 | 建议修复 |
|--------|----------|------|-----------------|----------|
| 语言逻辑跨层分散 | 在 Hexo/NexT 默认能力上逐步扩展 | `_config.yml`、`scripts/`、`themes/next/scripts/`、页面 front matter | 默认语言、taxonomy 或路由修改需要人工记忆多个入口 | 抽出单一 locale/route manifest，并由测试消费 |
| 主题直接 vendoring | 为路由、画廊和布局做深度定制 | `themes/next/` | 无法通过普通 npm update 安全升级 | 把站点专属逻辑移出主题；主题只保留可替换展示层 |
| 全局 CSS 单文件 | 页面功能持续叠加 | `source/_data/styles.styl` | 选择器耦合、重复媒体查询、难以删除旧规则 | 以组件/页面拆分，使用 CSS variables、layers 和 scoped styles |
| CMS 前后端单文件过大 | 功能持续增加且无模块边界 | `tools/local-cms*` | 回归定位困难，未来改用 ESM/TypeScript 成本上升 | 先抽纯函数和文件适配器，再拆 HTTP/LLM/媒体/命令模块 |
| 画廊存在双编辑入口 | 本地文档同步和线上 Decap 均可改数据 | `content/gallery/`、`source/_data/gallery.yml`、`source/admin/config.yml` | 两个入口可能互相覆盖 | 明确唯一事实源；若保留 Decap，让它编辑画廊文档或自动回写 |
| 依赖 `js-yaml` 传递安装 | 工具直接 `require('js-yaml')` 但根依赖未声明 | `tools/local-cms.js`、`tools/gallery-sync.js`、`package.json` | 上游依赖树调整会导致工具启动失败 | 把直接使用的包声明为直接依赖 |
| 文档曾与实现漂移 | 功能和测试快速演进 | `docs/codebase/TESTING.md`（本次修订前） | 维护者会依据错误现状决策 | 架构/测试变化时同步文档，定期跑代码库扫描 |

### 3）安全关注

| 风险 | OWASP 类别 | 证据 | 当前缓解 | 缺口 |
|------|-------------|------|----------|------|
| 本地 CMS 提供文件写入、删除和部署命令 | A01 访问控制 | `tools/local-cms.js` | loopback 绑定、Host/Origin/Fetch-Site、路径边界、CSP、安全头、命令 allowlist，并有安全测试 | 没有用户认证；不得改为公网监听 |
| 第三方浏览器脚本无 SRI | A08 软件与数据完整性 | `source/admin/index.html`、`themes/next/layout/_scripts/vendors.swig` | HTTPS；Decap 固定到 `3.15.1` | Identity 与部分主题 CDN 仍依赖远程供应链，未固定完整 hash |
| LLM key 和配置存本机明文 | N/A | `.env.example`、`tools/local-cms.js` | `.gitignore` 排除 `.env`，服务仅本机 | 无系统钥匙串、轮换流程或自动 secret scan |
| LLM/音乐外部请求无 timeout | A10/可靠性 | `tools/local-cms.js` | HTTP 状态与错误包装 | 请求可能长时间挂起；无 AbortController/retry |
| 本地审计/调试日志无留存策略 | A09 日志监控 | `tools/local-cms.js`、`.gitignore` | 不提交到 Git | 可能长期保留内容或上游错误详情 |

`npm audit --omit=dev --audit-level=high` 在 2026-09-04 为 0 个已知生产依赖漏洞；全量审计仍会报告 Lighthouse 工具链中的 `extract-zip` 和 `qs` 等开发依赖问题。这不覆盖远程 CDN、主题 vendoring 或业务安全边界。

### 4）性能和扩展关注

| 关注点 | 证据 | 当前表现 | 扩展风险 | 建议改进 |
|--------|------|----------|----------|----------|
| 原图直接复制 | `source/images/` 约 276 MB、68 个 >1 MB | 构建快，但访客可能下载远大于显示尺寸的图片 | Gallery/文章继续增长后带宽和 LCP 恶化 | 生成 `srcset`、WebP/AVIF 和缩略图，记录宽高避免 CLS |
| 全站 CSS 单包 | `public/css/main.css` 约 166 KB | 当前 Lighthouse 预算通过 | Work/Gallery 专属样式也进入其他页 | 分页/组件拆包，清理不再使用的旧主题规则 |
| 前台脚本为全局静态资源 | `themes/next/source/js/`、`public/js/` 约 137 KB（不含 CDN） | 当前交互和 E2E 正常 | 依赖顺序和全局状态随功能增加变脆 | 迁到 ESM，按交互区域加载，保留静态 HTML fallback |
| Gallery 按语言/相册输出 JSON | `gallery_data` generator | 29 个相册规模合理 | 相册 × 语言线性增长 | 保持按相册拆分，增加缓存头/内容 hash |
| CMS 同步文件扫描和同步 I/O | `tools/local-cms.js` | 当前内容规模可接受 | 图片/文章增长后操作阻塞 | 索引常用数据，耗时操作异步化并显示进度 |

2026-07-30 本地质量门禁全部通过；Lighthouse 性能约为首页 0.72、Work 0.91、About 0.93、Gallery 0.97、Archives 0.99。当前最值得优先优化的是首页资源和图片管线，而不是引入 SSR。

### 5）脆弱/高变更区域

| 区域 | 脆弱原因 | 最近 90 天变更信号 | 安全修改策略 |
|------|----------|--------------------|--------------|
| `source/_posts/2026-05-03-gpt-image2-practice.*` | 双语内容和大量图片引用联动 | 中文 15 次、英文 14 次 | 改名/删图前跑站内引用与图片解码检查 |
| `source/_data/styles.styl` | 多页面共享的全局覆盖 | 11 次 | 每次修改跑完整 E2E；拆分后保留视觉基线 |
| `tools/local-cms/app.js` / `tools/local-cms.js` | 单体、文件写入和外部 API 面广 | 10 / 9 次 | 先补 fixture/路由测试，再按模块抽离 |
| `_config.yml` | 路由、语言、资源版本和生成设置集中 | 9 次 | 改动后必须干净构建并跑全路由矩阵 |
| `source/work/index.md` / `source/en/work/index.md` | 双语内容、图片和专属交互 | 各 8 次 | 双语成对审阅并跑作品集契约/视觉测试 |
| `test/portfolio-build.test.js` | 作品集 DOM 契约较具体 | 8 次 | 区分真正产品契约与实现细节，避免测试阻碍合理重构 |

### 6）迁移准备度

| 迁移部分 | 难度 | 原因 | 可复用资产 |
|----------|------|------|------------|
| Markdown 文章/页面 | 低 | 48 篇、front matter 明确 | 双语文件对、写作规范 |
| 图片 | 中 | 路径清晰但体积大、同图多处引用 | `source/images/`、引用完整性测试 |
| 双语路由/taxonomy | 中高 | 默认语言与显式/无前缀路径并存 | Node 路由契约、Playwright 路由矩阵 |
| NexT 页面外观 | 高 | 旧主题模板 + 2,341 行全局覆盖 | 视觉基线、HTML/作品集断言 |
| Gallery/Work 交互 | 中 | 逻辑独立但依赖现有 DOM class | 浏览器 E2E、按相册 JSON 数据 |
| 本地 CMS | 低（保留）/高（重写） | 可继续写同一 Markdown；若同步重写则近万行 JS | 现有文件协议、安全测试和操作文档 |
| CI/CD | 低 | 静态输出和质量门禁框架可复用 | 三个 GitHub Actions workflow |

### 7）`[ASK USER]` 问题

1. [ASK USER] 现有英文 `/en/...`、中文无前缀文章路径和 `/zh-CN/` 集合页是否都必须永久兼容？这决定迁移是“原 URL 复刻”还是允许 redirect/canonical 收敛。
2. [ASK USER] `/admin/` 是否要真正启用为线上 Decap CMS？如果只使用本地 CMS，应减少这条未启用的供应链与双事实源。
3. [ASK USER] 架构升级的首要目标是最低维护成本、最先进的组件开发体验，还是完全保持当前视觉？三者会分别偏向“Hexo 8 + NexT 8”“Astro 7”或“原主题渐进整理”。

### 8）证据

- `_config.yml`
- `package.json`
- `.github/workflows/deploy.yml`
- `.github/workflows/quality.yml`
- `.github/workflows/scheduled-quality.yml`
- `source/admin/index.html`
- `source/admin/config.yml`
- `source/_data/styles.styl`
- `source/images/`
- `tools/local-cms.js`
- `tools/local-cms/app.js`
- `themes/next/package.json`
- `themes/next/scripts/helpers/engine.js`
- `scripts/localized-taxonomy.js`
- `test/portfolio-build.test.js`
- `test/e2e/site.spec.js`
