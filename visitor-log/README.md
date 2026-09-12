# 访问日志 Worker

这个目录提供一个独立的 Cloudflare Worker + D1 访问日志接口。博客本身继续部署到 GitHub Pages；浏览器只上报一次页面访问，不会把图片、CSS 或 JS 请求全部记下来。Worker 还提供只含聚合数量的公开 `/counts` 接口，供首页按真实浏览量排序。

## 部署

需要先在 Cloudflare 登录，并在 `visitor-log/` 目录执行：

```bash
npx wrangler login --device
npx wrangler d1 create caoyueyang-visitor-log
cp wrangler.toml.example wrangler.toml
```

把 `wrangler d1 create` 返回的 `database_id` 写入 `wrangler.toml`，然后初始化数据库：

```bash
npx wrangler d1 execute caoyueyang-visitor-log --remote --file=schema.sql
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put VISITOR_LOG_ADMIN_TOKEN
npx wrangler deploy
```

## 每日邮件

Worker 已配置每天 03:00 UTC（香港时间 11:00）执行一次日报任务。当前先使用 Resend 的测试发件地址，只能发送到 Resend 账号对应的邮箱；因此请用日报收件地址注册 Resend。之后把 Resend API Key 写入 Worker Secret：

```bash
npx wrangler secret put RESEND_API_KEY
```

收件地址和发件地址配置在 `wrangler.toml` 的 `REPORT_TO_EMAIL` 与 `REPORT_FROM_EMAIL` 中。日报只包含最近 24 小时的访问时间、IP、页面、国家/地区和来源，最多展示 200 条；API Key 不要写入仓库。

如果以后要发送到其他收件人，或希望显示 `@caoyueyang.org` 的发件地址，需要先在 Resend 验证自己的域名，并把 `REPORT_FROM_EMAIL` 改成该域名下的地址。

当前 Worker 使用 Cloudflare 自动分配的 `workers.dev` 地址：

```text
https://caoyueyang-visitor-log.andy-caoyueyang.workers.dev
```

部署成功后，先检查：

```bash
curl https://caoyueyang-visitor-log.andy-caoyueyang.workers.dev/health
```

首页排序使用的聚合浏览量接口为：

```text
https://caoyueyang-visitor-log.andy-caoyueyang.workers.dev/counts
```

该接口只返回按路径聚合后的浏览次数，不返回 IP、来源或 User-Agent；`/en/` 和 `/zh-CN/` 前缀会在聚合时去掉，因此同一篇文章的中英文浏览量会合并。

## 启用博客上报

确认 `/health` 返回 `ok` 后，把根目录 `_config.yml` 中的：

```yaml
visitor_log:
  enable: false
```

改成：

```yaml
visitor_log:
  enable: true
  endpoint: https://caoyueyang-visitor-log.andy-caoyueyang.workers.dev/visit
  counts_endpoint: https://caoyueyang-visitor-log.andy-caoyueyang.workers.dev/counts
```

然后重新构建并发布博客。

## 查询日志

管理令牌只保存在 Cloudflare Worker Secret 中，不要写入仓库：

```bash
curl \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "https://caoyueyang-visitor-log.andy-caoyueyang.workers.dev/logs?limit=50"
```

日志字段包括访问时间、完整 IP、路径、来源页、页面标题、语言、国家和 User-Agent。Worker 每天自动删除 30 天以前的记录。

## 手动发送日报

如果不想等每天香港时间 11:00 的自动任务，可以在自己的电脑终端手动发送最近 24 小时的日报：

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "https://caoyueyang-visitor-log.andy-caoyueyang.workers.dev/admin/report"
```

这个接口只接受 `POST` 请求，并要求 `VISITOR_LOG_ADMIN_TOKEN`。发送成功后会返回日报日期和记录数量；Token 不要写进仓库或发给别人。

## 费用与边界

小型个人博客通常可使用 Cloudflare Workers Free 和 D1 Free 额度。免费额度耗尽后，D1 写入会失败直到额度重置；不会因为这份配置自动升级到付费计划。Worker 只记录页面上报事件，不等同于完整的服务器访问日志；禁用 JavaScript 的浏览器、爬虫或被拦截的上报可能不会出现在这里。

完整 IP 属于个人信息。上线前应确认你的隐私政策覆盖访问日志，并只在有明确需要时保留完整 IP。
