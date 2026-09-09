---
title: Zoho Mail 自定义域名邮箱配置记录
date: 2026-09-09 12:00:00
lang: zh-CN
slug: zoho-mail-domain-email-setup
permalink: 2026/09/09/zoho-mail-domain-email-setup/
description: 记录 Zoho Mail 绑定域名并在 Cloudflare 完成邮箱认证的过程。
hide_public_email: true
photos:
  - /images/posts/zoho-mail-domain-email-setup/01-zoho-pricing.png
tags:
  - Zoho Mail
  - 域名
  - Cloudflare
  - 邮箱
categories:
  - 技术
toc: true
---

**把 `example.com` 配成可收发、可验证的工作室域名邮箱。**

<!-- more -->

## 最终结构

这次配置采用的是三层分工：

| 服务 | 负责什么 |
| --- | --- |
| Spaceship | 注册和持有域名 |
| Cloudflare | 托管 DNS 记录 |
| Zoho Mail | 托管工作室邮箱 |

网站的 A/CNAME 记录和邮箱的 MX/TXT 记录可以共存。配置邮箱不等于迁移网站。

对单人 Studio，账号结构建议这样安排：

- 主用户：`owner@example.com`
- 对外别名：`hello@example.com`
- 预约别名：`booking@example.com`
- DMARC 报告别名：`dmarc@example.com`

别名共用同一个收件箱；以后 Lisa 需要独立密码和收件箱时，再创建真正的 `lisa@example.com` 用户。

## 1. 选择 Zoho 方案

昨天的注册流程没有显示 Free 方案，而是显示了 Mail Lite、Mail Premium 和 Workplace。截图中的 Mail Lite 5 GB 是 US$1 / 用户 / 月，按年计费。

<figure class="post-figure">
  <img src="/images/posts/zoho-mail-domain-email-setup/01-zoho-pricing.png" alt="Zoho Mail 套餐页，显示 Mail Lite、Mail Premium 和 Workplace">
  <figcaption>注册时看到的 Zoho Mail 套餐页：年付模式下展示 Mail Lite、Mail Premium 和 Workplace。</figcaption>
</figure>

Zoho Free 即使在某些地区可用，也主要是网页和官方 App 使用，通常不包含 IMAP、POP 和 ActiveSync。若当前账号没有 Free 入口，直接按 Zoho 实际显示的 Mail Lite 方案继续即可，不要为了寻找免费方案伪造地区或反复删除组织。

## 2. 注册组织并填写地址

在 Zoho Mail 注册企业邮箱时选择使用已有域名，填写：

```text
example.com
```

地址信息按真实资料填写，并让国家/地区、城市和付款资料保持一致。香港地址通常没有统一邮政编码；页面允许时留空，页面强制要求时按 Zoho 当前表单要求处理，不要随意编造邮编。

## 3. 用 TXT 验证域名

Zoho 会要求证明你能控制域名 DNS。验证页一般提供 TXT、CNAME 和 HTML 三种方式，这次选择 TXT：

1. 在 Zoho 域名验证页选择 `TXT`。
2. 记下 Zoho 给出的 Host/Name 和完整 Value。
3. 登录真正托管 DNS 的平台。本次是 Cloudflare，不是 Spaceship。
4. 进入 `example.com` → `DNS` → `Add record`。
5. 填写以下字段：

   | 字段 | 填写方式 |
   | --- | --- |
   | Type | `TXT` |
   | Name | 以 Zoho 显示的 Host 为准，常见为 `@` |
   | Content | 完整粘贴 Zoho 当前的验证字符串 |
   | TTL | `Auto` |

6. 保存记录，回到 Zoho 点击验证。

这一步不是添加 A 记录。A 记录把域名指向网站 IP；TXT 记录用于放验证或认证文本。新增验证 TXT 不会影响网站，但不要删除已有的 A/CNAME。

## 4. 配置 MX、SPF 和基础 DNS

域名验证通过后，在 Zoho 的 DNS 设置向导中按页面提示添加 MX、SPF 和 DMARC。昨天 Zoho 曾自动完成这几项，因此不需要再次手动重复添加。

如果需要手动添加，原则只有一个：复制 Zoho 当前页面给出的值，不要使用网上的旧教程或自己猜值。

Cloudflare 中要注意：

- MX 记录必须是 DNS only，不能开代理。
- TXT、SPF、DKIM、DMARC 也不要开代理。
- 如果已经存在 SPF TXT，不要再新增第二条 SPF；需要合并时只保留一条有效 SPF。
- 不要修改网站的 A/CNAME，也不要重新创建已经存在的 MX。

## 5. 补上 DKIM

这次记录里的 DKIM 页面当时仍显示关闭且没有 TXT 主机记录，所以需要单独完成：

<figure class="post-figure">
  <img src="/images/posts/zoho-mail-domain-email-setup/06-zoho-dkim-settings.png" alt="Zoho DKIM 设置页显示尚未启用">
  <figcaption>Zoho DKIM 设置页当时显示尚未启用、暂无可用数据，说明还需要添加 selector 和 TXT 记录。</figcaption>
</figure>

1. 打开 Zoho Mail Admin Console → `DKIM`。
2. 点击“添加”。
3. Selector 使用：

   ```text
   zoho
   ```

4. 让 Zoho 生成 TXT 主机记录和 TXT 值。
5. 在 Cloudflare 新增一条 TXT：

   | 字段 | 填写内容 |
   | --- | --- |
   | Type | `TXT` |
   | Name | `zoho._domainkey` |
   | Content | Zoho 生成的完整 DKIM TXT 值 |
   | TTL | `Auto` |

6. 回到 Zoho 点击验证，验证成功后启用 DKIM。

类似 `v=DKIM1; k=rsa; p=...` 的内容只是格式示例。真正的 DKIM 公钥很长，必须使用 Zoho 当前生成的值。

## 6. 设置 DMARC

Cloudflare 中已经有 `_dmarc` TXT 时，不要新增第二条 DMARC。先在 Zoho 的 DMARC 生成器中填写初始策略：

| Zoho 字段 | 初始化值 |
| --- | --- |
| 认证失败动作 | 不采取任何操作（`p=none`） |
| 聚合报告地址 | `dmarc@example.com` |
| 取证报告地址 | `dmarc@example.com` |
| 子域名失败动作 | 不采取任何操作（`sp=none`） |
| 策略百分比 | `100` |
| SPF 比对 | 放松 / Relaxed |
| DKIM 比对 | 放松 / Relaxed |

<figure class="post-figure">
  <img src="/images/posts/zoho-mail-domain-email-setup/05-zoho-dmarc-generator.png" alt="Zoho DMARC 生成器">
  <figcaption>Zoho DMARC 生成器：先用 p=none 观察认证结果，再根据报告逐步收紧策略。</figcaption>
</figure>

点击生成后，把 Zoho 实际生成的完整字符串复制出来，然后在 Cloudflare：

1. 找到现有的 `_dmarc` TXT。
2. 点击编辑。
3. 只替换 Content。
4. Name 保持 `_dmarc`，TTL 保持 `Auto`。
5. 保存，再回 Zoho 验证。

初始使用 `p=none` 是为了先监控认证结果，避免网站表单、预约系统或未来的 SaaS 发信因为配置不完整而被拒收。确认所有合法发信来源后，再逐步考虑 `p=quarantine` 或 `p=reject`。

## 7. 创建主用户和别名

域名验证完成后，在 Zoho Mail Admin Console → `Users` → `Add User` 创建真正的主用户：

- 邮箱：`owner@example.com`
- 显示名：`Andy Cao`

然后给这个用户添加别名：

- `hello@example.com`：名片和官网公开
- `booking@example.com`：摄影预约
- `dmarc@example.com`：接收 DMARC 报告，不对外公开

再把 `hello@example.com` 设为默认发件地址，这样客户看到的是工作室邮箱，而不是后台登录用的主地址。

以后 Lisa 需要独立使用邮箱时，创建新的用户，而不是继续添加 alias：

```text
Zoho Mail Admin Console → Users → Add User
```

## 8. 安装 Zoho Mail App 并测试

Free 或 Lite 方案都可以使用 Zoho 网页版；Free 方案还可以使用官方手机 App，只是不能通过 IMAP/POP/ActiveSync 接入 Gmail、Apple Mail 或 Outlook。

这次选择直接使用 Zoho Mail App，Gmail 继续保留为私人邮箱和 Google 服务入口。完成后做一次双向测试：

1. 从私人 Gmail 发邮件到 `hello@example.com`。
2. 确认 Zoho 能收到。
3. 从 Zoho 使用 `hello@example.com` 回复 Gmail。
4. 在 Gmail 中确认发件人显示正确、没有进入垃圾邮件、没有出现明显的 `via` 或认证异常。

## 9. 最后检查清单

完成后回 Zoho Admin Console 检查：

- [ ] 域名验证通过
- [ ] MX 已验证，邮件能进入 Zoho
- [ ] SPF 已验证
- [ ] DKIM 已生成、验证并启用
- [ ] DMARC 已验证，Cloudflare 只有一条 `_dmarc` TXT
- [ ] `hello@` 能收信并能作为发件人发送
- [ ] `dmarc@` 已作为 alias 接收报告
- [ ] 主域名网站的 A/CNAME 没有被误改

这套配置完成后，`example.com` 就不只是拥有一个邮箱地址，而是同时具备邮件投递、发件授权、数字签名和失败处理策略。
