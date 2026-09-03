# 外部集成

## 核心部分

### 1）集成清单

| 系统 | 类型 | 用途 | 认证方式 | 关键性 | 证据 |
|------|------|------|----------|--------|------|
| GitHub Pages | 静态托管 | 托管 `gh-pages` 构建产物和自定义域名 | GitHub 仓库权限 | 高 | `.github/workflows/deploy.yml`、`source/CNAME` |
| GitHub Actions | CI/CD | PR 质量门禁、`main` 发布、每周跨浏览器/外链检查 | `GITHUB_TOKEN` | 高 | `.github/workflows/` |
| Git over SSH | 本地备用部署 | `npm run deploy` 推送 `gh-pages` | 本机 SSH 凭据 | 低 | `_config.yml` |
| Netlify Identity + Git Gateway | 预留的在线 CMS 认证/写回 | `/admin/` 登录并把修改提交到 `main` | Netlify 侧 Invite-only 配置；仓库无法证明已启用 | 低/待确认 | `source/admin/config.yml`、`docs/site-maintenance-guide.md` |
| Decap CMS | CDN 浏览器应用 | 在线编辑 `source/_data/gallery.yml` | 依赖 Git Gateway | 低/待确认 | `source/admin/index.html`、`source/admin/config.yml` |
| LLM 兼容 API | 本地可选 API | 中文排版、翻译、双语重写和相册翻译 | 本机 `.env` API key | 中（创作流程） | `.env.example`、`tools/local-cms.js` |
| 网易云音乐公开接口/播放器页 | 本地可选 HTTP | 插入音乐前检查歌曲和版权状态 | 无 | 低 | `tools/local-cms.js` |
| jsDelivr | 公共 CDN | 当前启用的 FancyBox/jQuery 前台资源 | 无 | 中 | `themes/next/layout/_scripts/vendors.swig`、`themes/next/_config.yml` |
| unpkg / Netlify Identity CDN | 公共 CDN | Decap CMS 与 Identity 脚本 | 无 | 低/待确认 | `source/admin/index.html` |
| 不蒜子 | 公共统计脚本 | 站点和文章浏览计数 | 无 | 低 | `themes/next/_config.yml`、`themes/next/layout/_third-party/statistics/busuanzi-counter.swig` |

Google Analytics、评论系统、Algolia、LeanCloud 和 Firestore 的模板仍在旧主题中，但配置为未启用，不属于当前运行集成。

### 2）数据存储

| 存储 | 角色 | 访问层 | 主要风险 | 证据 |
|------|------|--------|----------|------|
| Git 中的 Markdown/YAML | 内容事实源 | Hexo、本地 CMS、画廊工具 | 并发编辑产生 Git 冲突 | `source/`、`content/gallery/` |
| `source/images/` | 媒体事实源 | Hexo 静态复制、本地 CMS 图片 API | 体积、重复和缺少衍生尺寸 | `source/images/`、`tools/local-cms.js` |
| `source/_data/gallery.yml` | 画廊构建输入 | 同步器、CMS、主题 generator | 它是派生文件，但线上 Decap 也能直接编辑，存在双事实源风险 | `tools/gallery-sync.js`、`source/admin/config.yml` |
| 浏览器 `localStorage` | 本地 CMS 未保存草稿 | `tools/local-cms/app.js` | 仅当前浏览器可用 | `tools/local-cms/app.js` |
| `.env` / `.local-cms.json` | 本地 CMS 设置 | `tools/local-cms.js` | 本机明文 | `.gitignore`、`tools/local-cms.js` |
| 本地日志 | CRUD 审计和 LLM 调试 | `tools/local-cms.js` | 可能保留内容片段且无自动轮换 | `.gitignore`、`tools/local-cms.js` |

没有数据库、缓存服务、消息队列、线上 API 服务或服务端 session。

### 3）密钥和凭据处理

- LLM 凭据从根目录 `.env` 读取；`.env.example` 只有空占位。
- `.gitignore` 排除 `.env`、日志和旧版 `.local-cms.json`。
- GitHub Actions 使用自动注入的 `secrets.GITHUB_TOKEN`，发布 job 具有 `contents: write`。
- Decap/Netlify 凭据不在仓库中。
- `npm audit --omit=dev --audit-level=high` 在 2026-09-04 报告 0 个已知生产依赖漏洞；全量审计仍受 Lighthouse 工具链中的 `extract-zip` 和 `qs` 等开发依赖影响。
- 凭据轮换与本地日志留存周期：`[TODO]`，仓库没有制度定义。

### 4）可靠性与失败行为

- 发布和 PR 工作流设置 `concurrency`，同组新运行会取消旧运行。
- 正式发布前重复依赖审计、构建、生成契约、HTML、浏览器、无障碍和 Lighthouse 门禁。
- LLM 与网易云请求检查 HTTP 状态并返回可读错误；没有 AbortController timeout、自动重试或熔断。
- 前台画廊数据按相册拆分，失败时显示语言化错误文案。
- 本地搜索数据随构建产出，不依赖线上搜索 API。
- 第三方统计失败不影响主要内容；FancyBox CDN 失败会影响图片放大，但正文图片仍存在。

### 5）可观测性

- GitHub Actions 日志覆盖安装、构建、测试和发布。
- Playwright 在失败时保留 trace、screenshot 和 video；Lighthouse 报告写入本地报告目录。
- 本地 CMS 提供 CRUD 审计、命令日志和 LLM 调试日志。
- 线上只有不蒜子展示型计数；没有客户端错误收集、RUM、APM 或 tracing。
- 无法从仓库统一观察第三方 CDN、浏览器脚本异常和 `/admin/` 登录失败。

### 6）证据

- `.github/workflows/deploy.yml`
- `.github/workflows/quality.yml`
- `.github/workflows/scheduled-quality.yml`
- `_config.yml`
- `.env.example`
- `.gitignore`
- `source/admin/index.html`
- `source/admin/config.yml`
- `tools/local-cms.js`
- `tools/gallery-sync.js`
- `themes/next/_config.yml`
- `themes/next/layout/_scripts/vendors.swig`
