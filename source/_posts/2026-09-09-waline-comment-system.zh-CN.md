---
title: "给博客接入 Waline 评论系统：从零部署到关闭公共注册"
date: 2026-09-09 18:00:00
lang: zh-CN
slug: waline-comment-system
permalink: 2026/09/09/waline-comment-system/
description: 记录给个人博客接入 Waline、Neon、Turnstile 与 Zoho Mail 的完整过程。
photos:
  - /images/posts/waline-comment-system/01-architecture.svg
tags:
  - Waline
  - Vercel
  - Neon
  - Cloudflare
  - Zoho Mail
categories:
  - 技术
toc: true
---

**用一个低成本、可自主管理的方案，为静态博客补上评论、反滥用和邮件通知。**

<figure class="post-figure post-figure--diagram">
  <img src="/images/posts/waline-comment-system/01-architecture.svg" alt="Waline 评论系统服务架构示意图" width="2400" height="1350" loading="eager">
  <figcaption>评论请求从博客前端出发，经过 Turnstile 验证后进入 Waline，再分别连接 Neon 和 Zoho Mail。</figcaption>
</figure>

<!-- more -->

这次给博客增加评论功能，目标并不是搭建一个复杂的社区，而是让读者能够低门槛留言，同时让站长能收到通知、审核内容，并尽量减少机器人提交。

本文把实际过程整理成一份可复用的记录。为了保护隐私，文中的域名统一使用 `blog.example.com` 和 `comments.example.com`，邮箱统一使用 `owner@example.com`，所有 Site Key、Secret、SMTP 密码、数据库连接串和后台数据都只写成占位符。

## 1. 先把需求拆清楚

最终需要的是五件事：

- 博客文章页底部显示评论区。
- 读者填写昵称、邮箱和评论，网站字段可选。
- 用 Cloudflare Turnstile 做常见的人机验证，降低机器人滥用。
- 新评论通过 Zoho Mail 通知站长。
- 只有站长保留后台管理权限，之后不再允许陌生人注册 Waline 账号。

这里有一个容易混淆的点：邮箱必填不等于邮箱身份认证。读者可以填写一个并不属于自己的地址，昵称和网站也都可以冒充。因此，这套方案解决的是“联系和通知”，不是实名验证。要验证邮箱确实属于提交者，需要额外做邮箱验证码或魔法链接流程。

## 2. 五个服务各自负责什么

这套方案的关键不是把所有功能塞进一个平台，而是让每个服务只做自己擅长的事情：

| 服务 | 作用 |
| --- | --- |
| GitHub | 保存博客和 Waline 后端代码，作为部署入口 |
| Vercel | 运行 Waline API，并提供自动部署 |
| Neon | 提供 PostgreSQL，保存评论、用户、审核状态和点赞数据 |
| Cloudflare | 托管 DNS，并提供 Turnstile 人机验证 |
| Zoho Mail | 通过 SMTP 发送新评论通知 |

其中，Zoho Mail 不是给每位读者注册邮箱，也不是评论账号系统。它只是 Waline 发通知邮件时使用的发件服务；读者提交评论后，邮件会到站长自己的收件箱。

## 3. 部署 Waline 后端

Waline 的前端只是评论组件，评论数据需要一个服务端入口。最省事的方式是使用 Waline 官方的 Vercel 服务端模板：

1. 在 GitHub 创建一个独立的 Waline 后端仓库。
2. 在 Vercel 导入这个仓库，项目名称可以叫 `blog-comments`。
3. 把自定义域名绑定到这个项目，例如 `comments.example.com`。
4. 在 Vercel 的 Production 环境变量中填写数据库、邮件和 Turnstile 的服务端配置。
5. 访问 `https://comments.example.com/ui`，确认 Waline 管理界面可以打开。

后端仓库和博客仓库分开比较稳妥。博客可以继续作为静态站点部署，评论服务独立升级或回滚，不会因为一次博客主题改动而把评论系统一起弄坏。

## 4. 用 Neon 保存评论数据

Neon 提供托管 PostgreSQL，并且有适合个人项目的低成本方案。创建数据库后，Waline 需要的不是一张简单的评论表，而是一组包括评论、计数和用户的表。

典型结构包括：

- `wl_comment`：评论正文、昵称、邮箱、网站、文章路径、父评论和审核状态。
- `wl_counter`：文章评论数和其他计数。
- `wl_users`：后台用户、管理员类型和登录凭据。

把数据库连接信息放在 Vercel 的环境变量里，不要写入 GitHub。SQL 建表脚本可以提交，但数据库密码、连接串和后台账号密码绝不能提交。

数据库字段也会影响前端体验。例如旧评论的 `like` 字段可能是 `NULL`，而新评论可能显示为 `0`。排序或展示点赞数时应该统一按 `COALESCE("like", 0)` 处理，否则“按热度”看起来可能没有变化，或者页面直接显示 `null`。

## 5. 配置 Cloudflare Turnstile

Turnstile 是评论表单上的人机验证组件，作用类似“请确认你是真人”的常见按钮，但不要求把整站流量切到 Cloudflare 代理。

配置时需要区分两种 Key：

- Site Key：放在博客前端，可以被浏览器看到。
- Secret Key：只放在 Waline 后端环境变量中，不能出现在博客代码、截图或 GitHub。

在 Cloudflare 创建 Turnstile 小组件时，域名填写博客实际使用的域名。小组件模式可以选择“托管”，让 Cloudflare 根据风险决定是否显示交互式验证。验证框有时会显示加载状态，有时会显示“成功”，外观也可能因为容器宽度、语言和 Cloudflare 版本出现差异。

<figure class="post-figure post-figure--diagram">
  <img src="/images/posts/waline-comment-system/02-comment-flow.svg" alt="Waline 评论提交流程示意图" width="2400" height="1050" loading="lazy">
  <figcaption>评论表单的提交链路：先完成 Turnstile，再由 Waline 决定保存和审核方式。</figcaption>
</figure>

如果验证框挤到右边、变成很窄的矩形，通常不是密钥错误，而是组件外层宽度或缩放样式的问题。不要直接修改 Cloudflare iframe 内部的样式；应该给外层容器设置稳定的宽度、最大宽度和对齐方式，让 iframe 按官方尺寸显示。

## 6. 把 Waline 接进博客

博客前端需要传入 Waline 服务地址和 Site Key。示意配置如下，真实值仍然使用环境变量或部署平台配置：

```js
new Waline({
  el: '#waline',
  serverURL: 'https://comments.example.com',
  turnstileKey: 'TURNSTILE_SITE_KEY_PLACEHOLDER',
  requiredMeta: ['nick', 'mail'],
  anonymous: true,
  imageUploader: false,
});
```

这里保留邮箱必填，昵称也作为公开显示名称；网站字段可以让读者自行选择是否填写。评论区不开放图片上传，减少垃圾内容、外链和隐私风险。

评论表单还可以根据博客自己的视觉语言调整：输入框边框、圆角、字体、按钮颜色、评论头像和移动端布局都属于前端样式，不需要修改 Waline 数据库。头像使用固定的站点企鹅图案时，也应该从博客自己的静态资源加载，而不是把真实用户邮箱交给第三方头像服务。

## 7. 用 Zoho Mail 接收评论通知

Zoho Mail 在这里扮演 SMTP 发件人的角色。Waline 保存一条新评论后，通过 Zoho 的 SMTP 服务把通知发给站长配置的收件地址。

配置时要注意三点：

- SMTP 用户名使用你准备好的域名邮箱。
- SMTP 密码不要直接使用网页登录密码，优先使用 Zoho 后台生成的应用专用密码。
- 收件地址可以与发件地址相同，也可以设置成另一个内部别名。

一封评论通知通常包含评论者昵称、评论内容和文章地址。邮箱不会公开显示在评论列表里；它只是保存在 Waline 数据库中，用于通知、回复或必要时的管理操作。

完成后做一次双向测试：先从测试邮箱发一条评论，确认文章中能看到；再检查 Zoho 收件箱是否收到通知。如果评论开启了人工审核，通知可能先到达，而评论要等站长在管理后台通过后才公开。

## 8. 开启人工审核，再关闭公共注册

人工审核和禁止注册是两个不同的开关：

- 评论审核决定新评论是直接公开，还是先进入“待审核”。
- 登录/注册设置决定谁能创建 Waline 后台用户。

开启审核后，旧评论或新评论的 `status` 可能处于待审核状态，因此前台看不到并不一定代表数据被删除。排查时应该先去后台的“待审核”列表，再到数据库检查 `status`，不要直接删除数据。

Waline 的管理界面可以关闭部分登录入口，但不同版本不一定提供一个可靠的“关闭公共注册”按钮。最终我在后端仓库增加了一个很小的中间件，只拦截创建用户的接口：

```js
const isRegistrationRequest =
  process.env.DISABLE_USER_REGISTER === 'true' &&
  ctx.method === 'POST' &&
  /^\/api\/user\/?$/iu.test(ctx.path);

if (isRegistrationRequest) {
  ctx.status = 403;
  ctx.body = {
    errno: 403,
    errmsg: '管理员已关闭新用户注册',
  };
  return;
}
```

这样做的好处是范围很窄：只拒绝 `POST /api/user`，不会误伤管理员登录、读取评论、发表评论或点赞。Vercel 中再添加：

```text
DISABLE_USER_REGISTER=true
```

保存环境变量后必须重新部署。关闭注册后，`/ui/register` 页面本身可能仍能打开；真正的注册提交会收到 403。页面隐藏属于另外一层的路由控制，不应该和后端权限开关混为一谈。

<figure class="post-figure post-figure--diagram">
  <img src="/images/posts/waline-comment-system/03-registration-lock.svg" alt="关闭 Waline 公共注册的后端拦截示意图" width="2400" height="1080" loading="lazy">
  <figcaption>注册页面可以存在，但后端只拦截创建用户的 POST 请求，其他评论相关接口继续工作。</figcaption>
</figure>

## 9. 部署后的验证顺序

每次修改后，我会按下面的顺序验证，避免把“前端显示问题”“后端配置问题”和“数据库状态问题”混在一起：

1. 在博客文章页确认评论组件成功加载。
2. 用无痕窗口填写昵称、测试邮箱和评论，确认 Turnstile 能完成验证。
3. 检查 Neon 是否新增一条记录，并确认 `status` 符合审核设置。
4. 如果开启审核，在 Waline 后台通过评论，再刷新文章页。
5. 检查 Zoho Mail 是否收到通知。
6. 用另一个无痕窗口访问注册页面并尝试提交，确认注册被拒绝。
7. 用管理员账号登录，确认评论审核、删除和回复功能仍然正常。

这套顺序能够快速定位问题：

- 组件不显示：先看博客前端配置和浏览器控制台。
- Turnstile 不通过：检查域名、Site Key 和后端 Secret Key 是否配对。
- 评论写入但不显示：检查审核状态和前端筛选。
- 邮件没有到达：检查 Zoho SMTP、应用专用密码和垃圾邮件文件夹。
- 新用户仍能注册：检查 Vercel 是否把变量加到了 Production，并且是否在加变量后重新部署。

## 10. 这套方案的边界

这不是一个完整的身份认证系统，而是一套适合个人博客的评论基础设施：

- Turnstile 降低机器人滥用，但不能阻止所有真人垃圾评论。
- 邮箱字段方便联系和通知，但不证明评论者身份。
- 人工审核给站长最后决定权，但需要定期查看后台。
- 禁止公共注册可以保持后台账号封闭，但不会删除已有普通用户。
- Neon 和 Vercel 依赖第三方服务，正式使用前要保留数据库备份和迁移方案。

对个人博客来说，这个取舍比较平衡：博客前端保持轻量，评论数据由独立服务管理，Cloudflare 负责反滥用，Zoho Mail 负责通知，站长只需要维护一个管理员账号和一组敏感环境变量。

## 参考资料

- [Waline 服务端环境变量](https://waline.js.org/reference/server/env.html)
- [Waline 服务端插件与中间件](https://waline.js.org/reference/server/plugin.html)
- [Vercel 管理部署](https://vercel.com/docs/deployments/managing-deployments)
