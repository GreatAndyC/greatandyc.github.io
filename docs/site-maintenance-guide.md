# Site Maintenance Guide

这份文档面向日常维护这个博客源码仓库时的实际操作，重点说明：

- 网站内容应该改哪里
- 头像、菜单、友情链接、页脚等组件由哪里控制
- 每种页面的作用是什么
- 中英文页面分别放在哪里
- 改完之后如何本地验证并发布

## 1. 先建立一个整体认识

这个项目可以粗略分成 4 层：

| 层级 | 作用 | 主要位置 |
| --- | --- | --- |
| 站点配置层 | 控制域名、语言、路由、部署方式 | `_config.yml` |
| 主题配置层 | 控制头像、菜单、侧边栏、页脚、友情链接、主题功能开关 | `themes/next/_config.yml` |
| 内容层 | 放文章、独立页面、图片、画廊数据 | `source/` |
| 模板与逻辑层 | 控制页面如何渲染、多语言如何分流、标签分类如何按语言隔离 | `themes/next/layout/`、`themes/next/scripts/`、`scripts/` |

如果只是“改内容”，大多数时候不需要动模板层。  
如果只是“改展示配置”，大多数时候不需要动文章层。  
先分清这一点，维护会轻松很多。

## 2. 最常改的文件在哪里

| 想改什么 | 改哪里 |
| --- | --- |
| 站点标题、默认语言、正式域名、部署配置 | `_config.yml` |
| 头像、菜单、侧边栏、社交链接、友情链接、页脚、favicon | `themes/next/_config.yml` |
| 自定义 CSS 样式 | `source/_data/styles.styl` |
| 所有文章正文 | `source/_posts/` |
| 中文 About 页 | `source/about/index.md` |
| 英文 About 页 | `source/en/about/index.md` |
| 中文 Tags / Categories 页面入口 | `source/zh-CN/tags/index.md`、`source/zh-CN/categories/index.md` |
| 英文 Tags / Categories / Archives / Gallery 页面入口 | `source/en/...` |
| 画廊内容数据 | `source/_data/gallery.yml` |
| 后台编辑入口 | `source/admin/` |
| 本地内容后台 | `tools/local-cms.js`、`tools/local-cms/` |
| 图片资源 | `source/images/` |
| 多语言分类/标签生成逻辑 | `scripts/localized-taxonomy.js` |
| 语言感知链接、同语言文章导航、画廊渲染逻辑 | `themes/next/scripts/helpers/engine.js` |

如果你主要是在写文章和排版，建议先看这份文档：

- [`docs/writing-style-guide.md`](/Users/andycao/Documents/Project/greatandyc.github.io/docs/writing-style-guide.md)
- [`docs/local-cms-guide.md`](/Users/andycao/Documents/Project/greatandyc.github.io/docs/local-cms-guide.md)

新文章默认模板在这里：

- [`scaffolds/post.md`](/Users/andycao/Documents/Project/greatandyc.github.io/scaffolds/post.md)

如果你想用浏览器里的后台编辑器维护画廊，入口在：

- [`source/admin/index.html`](/Users/andycao/Documents/Project/greatandyc.github.io/source/admin/index.html)
- [`source/admin/config.yml`](/Users/andycao/Documents/Project/greatandyc.github.io/source/admin/config.yml)

当前后台按“只给自己登录”的思路配置，采用 Git Gateway + Invite only 的方式；你只需要把 Netlify Identity 打开并把自己邀请进去，就能在 `/admin/` 里维护画廊数据。

如果你不想依赖远程登录，而是希望本地直接开一个图形化后台维护文章和页面，可以使用：

```bash
npm run cms:local
```

它会启动一个本地服务，直接读写仓库里的 Markdown 文件。详细说明见：

- [`docs/local-cms-guide.md`](/Users/andycao/Documents/Project/greatandyc.github.io/docs/local-cms-guide.md)

### 3.5 后台编辑器怎么开

当前这个仓库已经预留了一个浏览器后台，入口是：

- `/admin/`

后台的目标不是“再造一个 CMS”，而是把最容易手写出错的结构化内容，比如画廊数据，变成表单式编辑。

#### 推荐登录方案

只给你自己使用时，推荐走这条路：

1. 用 Netlify 的 `Identity` 做登录
2. 用 `Git Gateway` 把后台提交写回 GitHub 仓库
3. 把注册方式设成 `Invite only`
4. 只邀请你自己的邮箱

这样做的好处是：

- 不需要把仓库写权限给别人
- 不需要手改 `source/_data/gallery.yml`
- 后台内容保存后仍然是 Git 提交，便于回滚和审计

#### 具体操作步骤

1. 先把当前仓库推送到 GitHub
2. 登录 Netlify，创建一个从 GitHub 导入的站点
3. 选择这个博客仓库
4. 在站点后台打开 `Identity`
5. 把注册方式改成 `Invite only`
6. 打开 `Git Gateway`
7. 邀请你自己的邮箱
8. 访问 `https://caoyueyang.org/admin/`
9. 登录后就可以编辑画廊数据

#### 如果邀请邮件打不开后台

Netlify 的邮件模板里，跳转链接最好指向：

- `https://caoyueyang.org/admin/`

如果模板还在跳到主页，就把邮件模板里的 `{{ siteURL }}/#...` 改成 `{{ siteURL }}/admin/#...`。

#### 后台里建议优先维护什么

当前后台最适合维护的是：

- `source/_data/gallery.yml`
- 未来类似“作品集 / 资源列表 / 展示型结构数据”的文件

不建议一开始就把所有文章正文也纳入后台编辑，因为正文还是 Markdown 更顺手。

### 3.6 公开前的安全检查

推送到 GitHub 之前，建议先看一遍这些内容：

- 有没有真实的 `access token`、`api key`、`client secret`、`password`
- 有没有 `.env`、私钥、证书、cookie、session 之类敏感文件
- 有没有截图把 API key、手机号、邮箱验证码、账号信息完整拍进去
- 有没有带临时参数的链接，例如 `token=`、`code=`、`auth=` 这类查询串
- 有没有不想长期公开的个人信息，例如地址、电话、身份证、学校内部信息

当前仓库里我检查到的情况是：

- `source/admin/config.yml` 里没有写入任何真实密钥
- 主题配置里类似 `apikey`、`client_secret` 的位置目前是空值占位，不是实际密钥
- 文章里有一些教学性质的 API 页面截图和带查询参数的链接，如果你觉得这些不适合长期公开，后面可以再统一脱敏或裁掉

如果你以后新增内容时涉及账号页或支付页截图，建议先做这三步：

1. 裁掉账号名和邮箱
2. 用马赛克或纯色块遮住 key / code / token
3. 再把图放进 `source/images/`

## 3. 内容怎么改

### 3.1 文章

所有文章统一放在：

`source/_posts/`

当前文章文件名规则是成对语言后缀：

```text
2025-09-01-blog-workflow.zh-CN.md
2025-09-01-blog-workflow.en.md
```

这样做的目的：

- 中英文文章能一眼配对
- 目录更整齐
- 仍然符合 Hexo 默认只识别 `source/_posts/` 的行为

文章至少要写清这些 front matter：

```yaml
---
title: New Blog Workflow
date: 2025-09-01 17:34:26
lang: en
slug: New-Blog-Workflow
permalink: 2025/09/01/New-Blog-Workflow/
tags:
  - Markdown
  - Hexo
categories:
  - Tutorial
---
```

字段作用：

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `date` | 发布时间 |
| `lang` | 必填，用来决定文章属于中文还是英文内容集合 |
| `slug` | 文章内部标识 |
| `permalink` | 固定最终 URL，避免改文件名后链接变化 |
| `tags` | 标签 |
| `categories` | 分类 |

注意：

- 中文文章写 `lang: zh-CN`
- 英文文章写 `lang: en`
- `slug` 统一使用英文，中文和英文成对文章尽量保持同一个 `slug`
- 标签和分类不会自动翻译，要直接写目标语言内容
- 现在英文翻译稿开头统一写了 Codex 翻译说明，而且建议写明模型和时间；如果以后继续新增英文稿，建议保持这个格式

### 3.2 独立页面

独立页面不放在 `_posts`，而是放在 `source/` 对应目录中。

当前已经存在这些页面：

| 页面 | 中文路径 | 英文路径 |
| --- | --- | --- |
| About | `source/about/index.md` | `source/en/about/index.md` |
| Gallery | `source/gallery/index.md` | `source/en/gallery/index.md` |
| Tags 入口页 | `source/zh-CN/tags/index.md` | `source/en/tags/index.md` |
| Categories 入口页 | `source/zh-CN/categories/index.md` | `source/en/categories/index.md` |
| Archives 入口页 | 由主题生成 | `source/en/archives/index.md` |

它们的作用是提供页面入口和 page metadata，本体内容很多时候由模板和 Hexo 数据集合渲染出来。

### 3.3 图片

站点图片统一放在：

`source/images/`

常见用途：

- 头像：`source/images/avatar.jpg`
- 文章插图：`source/images/...`
- 画廊图片：`source/images/recap_314/...`
- favicon 或其他主题资源引用的图：也在这里

改图片时的原则：

- 文件路径尽量稳定，避免改完忘了更新引用
- 图片一旦被文章或画廊引用，最好不要随便改名

### 3.4 画廊

画廊页面不是把图片直接硬写进 Markdown，而是由数据驱动。

数据文件：

`source/_data/gallery.yml`

这里定义：

- 相册英文 slug
- 中英文标题
- 中英文描述
- 拍摄地点
- 时间范围
- 相册标签
- 每张图的路径、标题、说明、meta

如果以后要加新相册，最推荐的方式是“文档驱动”：

1. 把图片放进 `source/images/...`
2. 在 `content/gallery/*.md` 里编辑相册文档
3. 运行 `npm run gallery:sync` 自动更新 `source/_data/gallery.yml`

这样你只需要维护 Markdown，不需要手改 YAML。

当前示例文件：

- `content/gallery/heartbeat-pi-2026.md`
- `content/gallery/_template.md`

推荐命令：

```bash
npm run gallery:sync
```

如果你想继续用命令行逐条添加，也保留了旧命令：

```bash
npm run gallery:list
npm run gallery:add-album -- --slug my-album --title-zh "中文标题" --title-en "English Title"
npm run gallery:add-photo -- --album my-album --src /images/my-album/cover.jpg --title-zh "封面" --title-en "Cover"
```

## 4. 站点外观怎么改

### 4.1 头像

头像由 `themes/next/_config.yml` 控制：

```yml
avatar:
  url: /images/avatar.jpg
  rounded: true
  rotated: false
```

实际渲染位置在：

`themes/next/layout/_partials/sidebar/site-overview.swig`

所以如果你想换头像，只需要：

1. 替换 `source/images/avatar.jpg`
2. 或把 `avatar.url` 改成新的图片路径

### 4.2 菜单

顶部菜单由 `themes/next/_config.yml` 的 `menu` 控制：

```yml
menu:
  home: / || fa fa-home
  about: /about/ || fa fa-user
  gallery: /gallery/ || fa fa-camera-retro
  tags: /tags/ || fa fa-tags
  categories: /categories/ || fa fa-th
  archives: /archives/ || fa fa-archive
```

菜单文案来自语言包：

- `themes/next/languages/zh-CN.yml`
- `themes/next/languages/en.yml`

菜单渲染模板：

- `themes/next/layout/_partials/header/menu-item.swig`
- `themes/next/layout/_partials/header/brand.swig`

这里已经做过语言感知处理，所以英文页面里的 `About` 会优先跳到 `/en/about/`，不会再误回中文页。

### 4.3 侧边栏

侧边栏的大部分内容都由 `themes/next/_config.yml` 控制：

| 区块 | 配置位置 |
| --- | --- |
| 头像 | `avatar` |
| 文章/分类/标签计数 | `site_state` |
| 社交链接 | `social` |
| 友情链接 | `links_settings`、`links` |
| 目录 TOC | `toc` |

实际模板主要在：

`themes/next/layout/_partials/sidebar/site-overview.swig`

这个文件目前还承担了几件自定义工作：

- 按当前语言统计文章数量
- 按当前语言统计分类和标签数量
- 友情链接标题和链接文字按语言切换

### 4.4 页脚

页脚主要在 `themes/next/_config.yml` 的 `footer` 段里控制：

- 起始年份
- 作者名
- 心形图标
- Powered by 是否显示

### 4.5 社交链接

配置位置：

`themes/next/_config.yml` -> `social`

例如：

```yml
social:
  GitHub: https://github.com/GreatAndyC || fab fa-github
  E-Mail: mailto:andy.caoyueyang@gmail.com || fa fa-envelope
  RSS: /atom.xml || fa fa-rss
```

格式是：

`显示名: 链接 || 图标`

### 4.6 友情链接

配置位置：

`themes/next/_config.yml`

当前已经支持中英文：

```yml
links_settings:
  title:
    zh-CN: 友情链接
    en: Links

links:
  world:
    url: http://www.google.com
    title:
      zh-CN: 走向世界
      en: Explore the World
```

如果你以后继续加友链，建议继续沿用这种结构。

### 4.7 favicon 与站点图标

配置位置：

`themes/next/_config.yml` -> `favicon`

当前引用的是：

- `/images/eagle1.png`
- `/images/apple-touch-icon-next.png`
- `/images/logo.svg`

如果改品牌视觉，这里要一起改。

### 4.8 自定义样式

站点的自定义样式主要放在：

`source/_data/styles.styl`

当前这里已经负责：

- 首页文章卡片流样式
- 画廊页面样式
- 画廊卡片瀑布流布局

如果你只是想调整：

- 卡片圆角
- 阴影
- 首页瀑布流列数
- 画廊卡片间距

优先改这个文件，不要直接去改 NexT 原始主题 CSS。

## 5. 每个网页结构的作用

### 5.1 首页

首页模板核心是：

`themes/next/layout/index.swig`

它负责把文章列表交给主题文章卡片宏去渲染。  
首页的“文章长什么样”，更多是主题样式和自定义 CSS 决定的；首页“显示哪些文章”，则由 Hexo 的文章集合和语言过滤逻辑决定。

当前规则：

- `/` 跟随默认语言，当前是英文
- `/zh-CN/` 只看中文文章
- `/en/` 只看英文文章

### 5.2 文章页

文章详情页模板：

`themes/next/layout/post.swig`

文章正文内容来自 `source/_posts/*.md`。  
上一篇/下一篇是否跨语言，不是这个模板决定的，而是 `themes/next/scripts/helpers/engine.js` 里的自定义 helper 控制的。

### 5.3 普通独立页面

统一入口模板：

`themes/next/layout/page.swig`

这个文件当前会根据 `page.type` 分流：

- `tags` 页面：渲染标签云
- `categories` 页面：渲染分类列表
- `gallery` 页面：渲染画廊
- `archives` 页面：渲染归档列表
- 其他页面：直接输出 Markdown 内容

所以，如果以后再新增一个“需要特殊渲染”的页面类型，通常要从这里接进去。

### 5.4 标签页

标签入口页和标签详情页分别是：

- 入口页：`themes/next/layout/page.swig` 中的 `page.type === 'tags'`
- 标签详情页：`themes/next/layout/tag.swig`

当前站点已经做成了语言隔离：

- 中文标签页只统计中文文章
- 英文标签页只统计英文文章

### 5.5 分类页

与标签页类似：

- 入口页：`themes/next/layout/page.swig` 中的 `page.type === 'categories'`
- 分类详情页：`themes/next/layout/category.swig`

同样也是按语言隔离的。

### 5.6 归档页

归档入口：

- `themes/next/layout/page.swig` 中的 `page.type === 'archives'`
- 归档详情模板：`themes/next/layout/archive.swig`

这里也做了语言隔离，英文归档不会再混中文文章。

### 5.7 画廊页

画廊入口页面：

- `source/gallery/index.md`
- `source/en/gallery/index.md`

渲染入口：

`themes/next/layout/page.swig`

真实画廊 HTML 由 helper 生成：

`themes/next/scripts/helpers/engine.js` 里的 `render_gallery`

所以画廊不是“写死的页面”，而是“页面入口 + 数据文件 + helper + CSS”四者共同组成。

## 6. 多语言结构怎么理解

这是这个项目最容易误解的地方。

### 6.1 为什么英文页面放在 `source/en/`，但英文文章不放这里

因为 Hexo 默认会把：

`source/_posts/`

识别为文章目录。

但它不会自动把：

`source/en/_posts/`

当作正式文章目录。

所以现在的规则是：

| 内容类型 | 放哪里 |
| --- | --- |
| 所有文章，不分语言 | `source/_posts/` |
| 语言特定的独立页面 | `source/<lang>/...` |

这就是为什么文章统一放 `source/_posts/`，而 About / Gallery / Tags 这些页面可以放在 `source/en/`。

### 6.2 多语言行为由谁控制

主要是两部分：

1. `themes/next/scripts/helpers/engine.js`

这里控制：

- 当前页面语言识别
- 本地化菜单和站内链接
- 语言切换路由映射（分类页优先使用 `category_map` 和成对文章推断，再做 taxonomy 自动匹配与兜底）
- 同语言文章计数
- 同语言标签云 / 分类列表
- 画廊渲染

2. `scripts/localized-taxonomy.js`

这里控制：

- 英文标签详情页生成
- 英文分类详情页生成

没有这部分脚本，多语言 taxonomy 页面就无法完整生成。

## 7. 日常维护时最常见的改动场景

### 场景 1：改头像

1. 替换 `source/images/avatar.jpg`
2. 如果文件名变了，更新 `themes/next/_config.yml` 中的 `avatar.url`
3. 本地运行 `npm run build`

### 场景 2：新增一篇中文文章

1. 在 `source/_posts/` 新建 `*.zh-CN.md`
2. 写 `lang: zh-CN`
3. 补英文 `slug` 和 `permalink`
4. 如需英文版，再新增对应 `*.en.md`

### 场景 3：改菜单

1. 改 `themes/next/_config.yml` 的 `menu`
2. 如果是新菜单项，再补 `themes/next/languages/zh-CN.yml` 和 `en.yml`
3. 如果是站内页面，确认对应页面真实存在

### 场景 4：改友情链接

1. 改 `themes/next/_config.yml` 的 `links_settings` 和 `links`
2. 如果需要双语标题，两个语言都补上

### 场景 5：加新相册

1. 图片放到 `source/images/`
2. 在 `content/gallery/*.md` 新增或编辑相册文档
3. 运行 `npm run gallery:sync`
4. 本地检查 `/gallery/` 和 `/en/gallery/`

### 场景 6：改首页卡片或画廊样式

1. 优先改 `source/_data/styles.styl`
2. 如果样式没生效，执行 `npx hexo clean && npm run build`

## 8. 改完之后怎么验证

至少检查这些页面：

- `/`
- `/zh-CN/`
- `/en/`
- `/about/`
- `/en/about/`
- `/gallery/`
- `/en/gallery/`
- `/tags/`
- `/en/tags/`
- `/categories/`
- `/en/categories/`
- 任意中英文文章页各一篇

重点看：

- 当前语言页面有没有串到另一种语言
- 菜单和侧边栏入口是否还在当前语言路由
- 标签、分类、归档是否只显示当前语言内容
- 分类/标签详情页切换语言时是否跳到正确的目标语言 URL，尤其要检查新增分类是否能从中文跳英文、再从英文跳回中文
- 文章上一篇/下一篇是否仍然只在同语言内跳转

推荐命令：

```bash
npx hexo clean && npm run build
```

如果只做了轻量改动，也可以先用：

```bash
npm run server
```

然后在 `http://localhost:4000` 本地检查。

## 9. 发布方式

现在项目已经接入 GitHub Actions 自动部署。

流程是：

1. 本地修改源码
2. 提交并 push 到 `main`
3. GitHub Actions 自动构建
4. 自动把 `public/` 发布到 `gh-pages`
5. GitHub Pages 更新线上站点

工作流文件：

`.github/workflows/deploy.yml`

所以现在正常情况下，不需要再手动 `hexo deploy`。

## 10. 最后一个维护建议

以后如果要继续扩展功能，尽量遵守这条分层原则：

- 改内容，先看 `source/`
- 改展示配置，先看 `themes/next/_config.yml`
- 改样式，先看 `source/_data/styles.styl`
- 改页面结构和语言逻辑，才去看 `themes/next/layout/` 和 `scripts/`

这样你不会把“换头像”做成“改模板”，也不会把“加一篇文章”做成“改主题逻辑”。
