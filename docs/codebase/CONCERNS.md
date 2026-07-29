# 代码库关注点

## 核心部分

### 1）主要风险（按优先级）

| 严重度 | 关注点 | 证据 | 影响 | 建议动作 |
|--------|--------|------|------|----------|
| 高 | 双语路由无自动测试，且默认英文、显式 `/en/` 独立页、无前缀中文旧链接并存 | `_config.yml`、`themes/next/scripts/helpers/engine.js`、`scripts/localized-taxonomy.js` | 小改动可能产生跨语言跳转或 404 | 建立 URL 矩阵测试并在 CI 中检查生成结果 |
| 中 | 本地 CMS 是大型单体模块 | `tools/local-cms.js`（约 4,857 行）、`tools/local-cms/app.js`（约 4,836 行） | 文件、图片、LLM、命令与日志修改互相影响 | 按内容、媒体、LLM、命令执行拆分模块并补测试 |
| 中 | CI 对 `main` 直接发布，但没有 lint、测试或链接检查 | `.github/workflows/deploy.yml`、`package.json` | 构建可通过，行为错误仍会上线 | 在 deploy 前加入 lint、路由冒烟和链接检查 |
| 中 | 图片源约 423 个文件、275 MB，存在多组 2–3 MB 图片和重复素材 | `source/images/` | 仓库、构建、页面下载和 Pages 流量持续增大 | 对发布图做尺寸/格式预算，检测重复哈希并按需生成缩略图 |
| 中 | `/admin/` 被部署，但当前仓库/Pages 链路没有提供 Netlify Identity/Git Gateway | `source/admin/`、`.github/workflows/deploy.yml` | 入口存在但不代表在线 CMS 可登录或写回 | 决定启用 Netlify 配套能力，或移除/隐藏未启用入口 |
| 低 | 根依赖包含未被选用的 `hexo-theme-landscape` | `package.json`、`_config.yml` | 增加依赖面和维护噪音 | 确认无回退用途后移除 |

### 2）技术债

| 债务项 | 形成原因 | 位置 | 不处理的风险 | 建议修复 |
|--------|----------|------|--------------|----------|
| 语言逻辑跨层分散 | 在 NexT/Hexo 默认能力上逐步扩展 | `_config.yml`、`scripts/`、`themes/next/scripts/`、页面 front matter | 改默认语言时需要人工记住所有入口 | 建一份机器可执行的路由契约 |
| 主题直接 vendoring | 为深度定制 helper/layout | `themes/next/` | 上游升级难合并 | 记录本地 patch 清单，逐步迁移到站点 data/inject 能力 |
| CMS 前后端单文件过大 | 功能持续叠加 | `tools/local-cms.js`、`tools/local-cms/app.js`、`tools/local-cms/app.css` | 回归范围难判断 | 按领域拆分并为纯函数加单测 |
| 文档与实现可能漂移 | 功能快速演进 | `docs/local-cms-guide.md` 与 CMS 代码 | 使用者会按过时边界操作 | 在功能变更 PR/commit 中同步文档并加入检查清单 |
| 中文分类页标题拼写为 `Catagories` | 历史内容错误 | `source/categories/index.md` | 浏览器标题/SEO 文案不专业 | 改为 `Categories` 或中文标题 |

### 3）安全关注

| 风险 | OWASP 类别 | 证据 | 当前缓解 | 缺口 |
|------|-------------|------|----------|------|
| 本地 CMS 提供文件写入、删除和命令执行 API | A01 访问控制 | `tools/local-cms.js` | 默认只监听 `127.0.0.1` | 不应改为公网监听；代码内没有用户认证 |
| 外部 CMS/CDN 脚本缺少固定完整性校验 | A08 软件与数据完整性 | `source/admin/index.html`、`themes/next/layout/_scripts/vendors.swig` | HTTPS | Decap 使用 `@^3.0.0` 浮动版本，未设置 SRI |
| LLM key 为本机明文配置 | N/A | `.env.example`、`tools/local-cms.js` | `.gitignore` 排除 `.env` | 无系统钥匙串、轮换或泄漏扫描 |
| 本地 CMS 把异常 message 返回前端 | A05 安全配置 | `tools/local-cms.js` | 服务仅限本机 | 若未来上线会泄露内部路径/上游错误细节 |

### 4）性能和扩展关注

| 关注点 | 证据 | 当前表现 | 扩展风险 | 建议改进 |
|--------|------|----------|----------|----------|
| 大量原图直接进入静态站点 | `source/images/` 约 275 MB，最大单图约 2.9 MB | 构建和首次图片加载成本高 | 相册继续增长后部署与带宽压力上升 | 生成 WebP/AVIF 和缩略图，原图按需外置 |
| Gallery 构建时为每种语言/相册输出 JSON | `gallery_data` generator | 28 个相册规模可接受 | 语言和相册数量相乘增长 | 保持按相册拆分并缓存；监控总输出体积 |
| 本地 CMS 多处同步文件扫描 | `tools/local-cms.js` 的图片引用/项目文件遍历 | 当前仓库可用 | 图片和 Markdown 增长后操作变慢 | 建索引或限定扫描范围，耗时操作异步化 |
| 第三方统计/CDN | 不蒜子与 jsDelivr 模板 | 依赖外部网络 | 阻塞或失败影响部分体验 | 保持非关键异步加载并准备无脚本降级 |

### 5）脆弱/高变更区域

| 区域 | 脆弱原因 | 近期变更信号（最近 90 天） | 安全修改策略 |
|------|----------|----------------------------|--------------|
| `tools/local-cms*` | 单体、文件写入面广 | server 10 次、app 12 次、HTML 9 次、CSS 7 次 | 每次改动后做 CRUD、图片、命令和 LLM 冒烟 |
| `themes/next/scripts/helpers/engine.js` | 路由、taxonomy、画廊、导航集中 | 4 次 | 用固定双语路由矩阵检查生成 HTML |
| `source/_data/styles.styl` | 多类页面共享覆盖 | 5 次 | 对首页、About、Gallery、文章页做响应式检查 |
| GPT Image 2 双语文章与图片 | 内容和图片引用频繁联动 | 中英文文章分别 14/13 次 | 改名/删图前运行引用检查，双语同步验证 |

### 6）`[ASK USER]` 问题

1. [ASK USER] `/admin/` 是准备真正启用为线上 CMS，还是只保留本地 CMS？这决定要接入 Netlify Identity/Git Gateway，还是隐藏当前未启用入口。
2. [ASK USER] 是否把现有英文 `/en/...` 与中文无前缀永久链接视为必须长期兼容的公开 URL？若是，应先建立不可破坏的路由测试。
3. [ASK USER] 未来作品集是作为 About 旁边的双语静态页面，还是作为类似 Gallery 的结构化数据模块？前者更快，后者更适合持续增加案例。

### 7）证据

- `_config.yml`
- `.github/workflows/deploy.yml`
- `package.json`
- `source/admin/index.html`
- `source/categories/index.md`
- `source/images/`
- `tools/local-cms.js`
- `themes/next/scripts/helpers/engine.js`
- `scripts/localized-taxonomy.js`
