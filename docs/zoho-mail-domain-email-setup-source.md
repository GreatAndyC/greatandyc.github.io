# Zoho Mail 域名邮箱配置：原始记录与截图观察

这份笔记整理自 2026-09-08 浏览器中的 ChatGPT 对话，只保留与 `example.com`、Zoho Mail 和 Cloudflare DNS 相关的内容。名片设计等无关对话没有纳入。

## 配置背景

- 域名注册商：Spaceship
- DNS 托管：Cloudflare
- 邮箱服务：Zoho Mail
- 个人 Gmail：继续作为私人邮箱、账号恢复邮箱和 Google 服务入口
- 工作室域名：`example.com`
- 计划使用的公开邮箱：`hello@example.com`

## 对话摘录

### 1. 先比较方案和价格

对话中比较了 Google Workspace、Zoho Mail 和 Cloudflare Email Routing，最后选择 Zoho Mail 作为成本更低的完整域名邮箱方案。

截图中的 Zoho 套餐页显示：

- Mail Lite：5 GB，US$1 / 用户 / 月，按年计费
- Mail Lite：10 GB，US$1.25 / 用户 / 月，按年计费
- Mail Premium：50 GB，US$4 / 用户 / 月
- Workplace：30 GB 或 100 GB 方案

对话后来确认：Free 方案即使存在，也只在部分数据中心或地区提供；Free 可以使用 Zoho 网页版和官方手机 App，但不提供 IMAP、POP 和 ActiveSync。当前注册流程没有显示 Free 时，应以账号实际显示的方案为准，不要为了省小额费用伪造地区或反复删除组织重注册。

### 2. 填写组织地址

截图显示 Zoho 注册流程要求填写：

- 详细地址
- 省市
- 城市
- 邮政编码

对话中的处理原则是：地址应按真实、可对应当前地区的资料填写，不要乱填。香港通常没有统一邮政编码；如果页面允许，应留空；如果页面强制要求数字，应根据 Zoho 当前页面或付款资料的要求处理，不要随意编造一个看似真实的香港邮编。

为保护隐私，本笔记不保存截图中的具体住址、室号或楼层。

### 3. 验证域名所有权

Zoho 验证页提供三种方式：TXT、CNAME、HTML。对话选择了 TXT，因为它只需要在 DNS 中增加一条验证文本，不需要修改网站文件或增加子域名。

Zoho 的验证逻辑是：

1. Zoho 生成一串唯一验证值。
2. 在真正托管 DNS 的平台中，把验证值添加为域名的 TXT 记录。
3. Zoho 查询公开 DNS。
4. 查询到这串值后，确认操作者拥有域名 DNS 控制权。

### 4. 在 Cloudflare 添加 TXT

对话确认这不是 A 记录，而是新增 TXT 记录。Cloudflare 中的填写关系是：

| Cloudflare 字段 | 填写内容 |
| --- | --- |
| Type | `TXT` |
| Name | 以 Zoho 显示的 Host 为准，常见为 `@` |
| Content | 完整粘贴 Zoho 当前生成的验证字符串 |
| TTL | `Auto` |

保存后回到 Zoho 点击验证。新增 TXT 不会影响网站，只要不删除或修改已有的 A、CNAME 记录。

### 5. 自动添加 MX、SPF、DMARC

Cloudflare 截图显示域名当时已有 8 条 DNS 记录，结构包括：

- A：网站
- CNAME：`www` 等网站入口
- 3 条 MX：Zoho 收件服务器
- TXT：域名验证或 SPF 相关记录
- `_dmarc` TXT：DMARC 记录

截图中的 Cloudflare 状态是 DNS only。对话特别强调：

- MX、TXT、SPF、DKIM、DMARC 都不能开启 Cloudflare 代理。
- Zoho 自动写入 SPF 后，不要再手动添加第二条 SPF；重复 SPF 会导致认证错误。
- 不要重新创建已有的 MX，也不要为了配置邮箱修改网站的 A/CNAME。
- 实际 MX、SPF 和验证字符串必须复制 Zoho 当前页面的值；原始截图中的具体值不固化保存。

之后用户确认 Zoho 已自动添加 MX、SPF、DMARC。对话建议回 Zoho Mail Admin Console 检查它们是否显示为已验证或绿色。

### 6. 配置 DKIM

DKIM 截图显示当时页面仍是未开启状态：状态开关关闭，TXT 主机记录列表为空。

对话给出的后续操作是：

1. Zoho Mail Admin Console → DKIM。
2. 点击“添加”。
3. Selector 使用 `zoho`。
4. Zoho 生成 TXT 主机记录和一长串 TXT 值。
5. Cloudflare 新增 TXT：Name 为 `zoho._domainkey`，Content 粘贴 Zoho 生成的完整值，TTL 使用 `Auto`。
6. 回 Zoho 验证，验证成功后启用 DKIM。

`v=DKIM1; k=rsa; p=...` 只是格式示例，不能直接复制。真正的 DKIM 公钥必须使用 Zoho 当前生成的内容。

### 7. 配置 DMARC

截图中的 Zoho DMARC 生成器字段包括：失败动作、聚合报告地址、取证报告地址、子域名失败动作、策略百分比、SPF 比对和 DKIM 比对。

对话建议初始化阶段使用：

- 失败动作：不采取任何操作，即 `p=none`
- 聚合报告地址：`dmarc@example.com`
- 取证报告地址：`dmarc@example.com`
- 子域名失败动作：不采取任何操作，即 `sp=none`
- 策略百分比：`100`
- SPF 比对：放松 / Relaxed
- DKIM 比对：放松 / Relaxed

Cloudflare 截图中已经存在 `_dmarc` TXT，因此正确动作是编辑现有记录，不要新增第二条：

1. 在 Zoho 点击生成。
2. 复制 Zoho 实际生成的完整 DMARC 字符串。
3. Cloudflare 找到 `_dmarc` TXT。
4. 只替换 Content，Name 保持 `_dmarc`，TTL 保持 `Auto`。
5. 保存后回 Zoho 验证。

初始化时使用 `p=none` 是为了先观察，不要误伤网站表单、预约系统或其他未来可能代表域名发信的服务。确认所有合法发信来源后，再考虑逐步升级到 `p=quarantine` 或 `p=reject`。

### 8. 用户、别名与实际收发

对话最终建议的账号结构是：

- 真正的主用户：`owner@example.com`
- 对外公开别名：`hello@example.com`
- 预约别名：`booking@example.com`
- DMARC 报告别名：`dmarc@example.com`

这些别名共用同一个收件箱，不需要各自占用独立用户。以后 Lisa 如果需要独立登录、独立密码和独立收件箱，再通过 Admin Console → Users → Add User 创建真正的 `lisa@example.com` 用户。

最后用私人 Gmail 发信到 `hello@example.com`，再从 Zoho 用 `hello@example.com` 回复，检查收件、发件人显示、垃圾邮件和是否出现明显的 `via` 或认证异常。

## 截图清单与内容

以下是对话中与配置直接相关的截图内容。3 张不含具体凭据的截图已经保存到 `source/images/posts/zoho-mail-domain-email-setup/`，并嵌入对应的中英文文章；含域名的验证和 Cloudflare 提示截图已移除，地址表单截图没有复制到仓库：

1. Zoho 套餐页：Mail Lite US$1、Mail Premium US$4、Workplace US$3 / US$6。本地文件：`01-zoho-pricing.png`。
2. Zoho 地址页：详细地址、省市、城市、邮政编码四个输入框。
2. Zoho DMARC 页：初始化参数使用 `p=none`、报告地址、100% 和 Relaxed 比对。本地文件：`05-zoho-dmarc-generator.png`。
3. Zoho DKIM 页：状态关闭，暂无 TXT 主机记录，下一步需要添加 selector。本地文件：`06-zoho-dkim-settings.png`。

## 需要以当前页面为准的内容

这份原始记录不保存以下容易变化或具备敏感性的具体值：付款地址、域名验证 token、MX 目标、SPF 字符串、DKIM 公钥和 Zoho 生成的完整 DMARC 字符串。重新配置时，一律从 Zoho 当前页面复制，再粘贴到当前 DNS 托管平台。
