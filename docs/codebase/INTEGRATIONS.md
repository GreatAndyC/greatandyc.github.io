# 外部集成

## 核心部分

### 1）集成清单

| 系统 | 类型 | 用途 | 认证方式 | 关键性 | 证据 |
|------|------|------|----------|--------|------|
| GitHub Pages | 静态托管 | 托管 `gh-pages` 构建产物和自定义域名 | GitHub 仓库权限 | 高 | `.github/workflows/deploy.yml`、`source/CNAME` |
| GitHub Actions | CI/CD | `main` push 后安装、构建、发布 | 自动提供的 `GITHUB_TOKEN` | 高 | `.github/workflows/deploy.yml` |
| Git over SSH | 本地部署通道 | `npm run deploy` 推送 `gh-pages` | 本机 SSH 凭据 | 中 | `_config.yml` |
| Netlify Identity + Git Gateway | 预留的在线 CMS 认证/写回 | `/admin/` 的 Decap CMS 登录和 Git 写回 | Invite-only 由 Netlify 侧配置；仓库内未完成启用证明 | 低（当前） | `source/admin/index.html`、`source/admin/config.yml` |
| Decap CMS CDN | 浏览器 CMS | 加载在线管理 UI | 依赖 Git Gateway | 低（当前） | `source/admin/index.html` |
| LLM 兼容 API | 本地可选 API | 中文排版、翻译、双语改写、相册翻译 | 本机 `.env` API key | 中（创作辅助） | `.env.example`、`tools/local-cms.js` |
| 网易云音乐 | 本地可选 HTTP API/页面 | 插入音乐前检查歌曲与外链播放器状态 | 无 | 低 | `tools/local-cms.js` |
| jsDelivr | 公共 CDN | FancyBox/jQuery 等前台资源 | 无 | 中 | `themes/next/layout/_scripts/vendors.swig` |
| 不蒜子 | 公共统计脚本 | 页面和站点浏览计数 | 无 | 低 | `themes/next/_config.yml`、`themes/next/layout/_third-party/statistics/busuanzi-counter.swig` |

### 2）数据存储

| 存储 | 角色 | 访问层 | 主要风险 | 证据 |
|------|------|--------|----------|------|
| Git 仓库中的 Markdown/YAML | 内容事实源 | Hexo、本地 CMS、画廊工具 | 并发编辑时可能产生 Git 冲突 | `source/`、`content/gallery/` |
| `source/images/` | 媒体事实源 | Hexo 静态复制、本地 CMS 图片 API | 体积增长和重复文件 | `source/images/`、`tools/local-cms.js` |
| 浏览器 `localStorage` | 本地 CMS 未保存草稿 | `tools/local-cms/app.js` | 仅当前浏览器可用、不可跨设备同步 | `docs/local-cms-guide.md`、`tools/local-cms/app.js` |
| `.env` / `.local-cms.json` | 本地 CMS 设置 | `tools/local-cms.js` | 本机明文；依赖 `.gitignore` 防止提交 | `.gitignore`、`tools/local-cms.js` |
| 日志文件 | 本地审计和 LLM 调试 | `tools/local-cms.js` | 本机容量和敏感内容留存 | `.gitignore`、`tools/local-cms.js` |

没有数据库、缓存服务、消息队列或线上 API 服务。

### 3）密钥和凭据处理

- LLM 凭据从根目录 `.env` 读取；`.env.example` 只包含空占位。
- `.gitignore` 排除 `.env`、`.env.*`（保留 `.env.example`）、日志和旧版 `.local-cms.json`。
- GitHub Actions 使用仓库自动注入的 `secrets.GITHUB_TOKEN`。
- Decap CMS 的 Netlify Identity/Git Gateway 凭据不在仓库中，需要在 Netlify 侧配置。
- 凭据轮换流程：`[TODO]`，仓库没有制度文档。

### 4）可靠性与失败行为

- GitHub Actions 使用 `concurrency`，同组新部署会取消旧部署。
- LLM 与网易云请求会检查 HTTP 状态并返回具体错误，但未实现超时、重试或熔断。
- 前台画廊加载失败会显示语言化错误文案。
- GitHub Pages/第三方 CDN/统计脚本没有仓库内定义的降级 SLA。

### 5）可观测性

- 部署过程可从 GitHub Actions 日志查看。
- 本地 CMS 提供 CRUD 审计日志、命令日志和 LLM 调试日志。
- 线上只有不蒜子展示型计数；没有应用日志、错误收集、APM 或 tracing。
- 缺口：无法从仓库内统一观察客户端脚本错误、外部 CDN 失败或 `/admin/` 登录失败。

### 6）证据

- `.github/workflows/deploy.yml`
- `_config.yml`
- `.env.example`
- `.gitignore`
- `source/admin/index.html`
- `source/admin/config.yml`
- `tools/local-cms.js`
- `themes/next/layout/_scripts/vendors.swig`
