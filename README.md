# AndyCao's Blog

[![Hexo](https://img.shields.io/badge/Framework-Hexo-blue.svg)](https://hexo.io/)
[![Theme](https://img.shields.io/badge/Theme-NexT-green.svg)](https://github.com/theme-next/hexo-theme-next)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 Hexo + NexT 搭建的个人博客源码仓库，由 [AndyCao](https://github.com/GreatAndyC) 维护。

在线地址：[caoyueyang.org](https://caoyueyang.org)

## 项目概览

- 框架：Hexo 7
- 主题：NexT
- 部署：GitHub Pages
- 文章格式：Markdown
- 当前多语言：`zh-CN`、`en`
- 根首页策略：`/` 跟随默认语言首页，当前默认为中文

这份仓库不只是博客内容，也包含站点样式、自定义多语言适配逻辑和部分 NexT 模板改造。

详细维护说明见：[docs/site-maintenance-guide.md](/Users/andycao/Documents/Project/greatandyc.github.io/docs/site-maintenance-guide.md:1)

## 内容后台

如果你想在浏览器里维护画廊数据，可以直接访问：

- `https://caoyueyang.org/admin/`

仓库里已经加入了 Decap CMS 的后台入口和配置文件，当前按“只给自己登录”的思路预留成 Git Gateway + Invite only。后续只需要在 Netlify 上启用 Identity，并把自己邀请进去，就可以直接在后台编辑 `source/_data/gallery.yml`。

更完整的操作步骤和发布前的安全检查，见：[docs/site-maintenance-guide.md](/Users/andycao/Documents/Project/greatandyc.github.io/docs/site-maintenance-guide.md:1)

如果你不想依赖第三方登录，当前也支持本地“文档驱动”方式维护画廊：

1. 编辑 `content/gallery/*.md`
2. 运行 `npm run gallery:sync`
3. 自动生成 `source/_data/gallery.yml`

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动本地预览

```bash
npm run server
```

默认访问地址：

- `http://localhost:4000/`
- `http://localhost:4000/zh-CN/`
- `http://localhost:4000/en/`

### 3. 构建静态文件

```bash
npm run build
```

### 4. 清理缓存

```bash
npm run clean
```

### 5. 部署

```bash
npm run deploy
```

一键本地生成并部署：

```bash
npm run pub
```

## 写作与发布流程

### 新建文章

```bash
npx hexo new "文章标题"
```

当前 `new_post_name` 规则为：

```text
:year-:month-:day-:title.md
```

也就是新文章会生成到 `source/_posts/`，文件名带日期前缀。

### Front-matter 约定

推荐至少包含以下字段：

```yaml
---
title: 文章标题
date: 2026-04-19 10:00:00
lang: zh-CN
description: 30 字以内的一句话概括
photos:
  - /images/xxx/example.png
tags:
  - 标签A
categories:
  - 分类A
---
```

说明：

- `lang` 必须明确写，尤其是多语言文章，否则会污染首页、归档、标签、分类和上一篇/下一篇导航。
- 中文文章统一使用 `lang: zh-CN`
- 英文文章统一使用 `lang: en`
- 标签和分类本身不自动翻译，应直接使用该语言对应的内容
- 分类映射优先读取 `_config.yml` 的 `category_map`；即使新增分类尚未配置映射，语言切换也会自动匹配并兜底
- `description` 用于首页瀑布流的一句话概括，建议严格控制在 30 字以内
- `photos` 用于首页封面图，建议只放一张最有代表性的图
- 封面图建议统一用 `3:2` 比例，推荐 `1200x800`，主体尽量居中，四边留出 `8% ~ 12%` 的安全区
- `slug` 统一用英文，中文和英文成对文章尽量保持同一个 `slug`
- `<!-- more -->` 用于正文分界；如果是翻译稿，翻译提示放在 `<!-- more -->` 后面，并写明模型和时间
- 正文里的一句话概括建议直接加粗成一行，比如 `**30 字以内的一句话概括。**`
- 有图注时优先使用 `figure` + `figcaption`
- 纯插图时再使用 `![](...)`，不要在图片括号里写 alt 文本或备注

示例：

- 中文文章：`categories: [教程]`、`tags: [学习, Hexo]`
- 英文文章：`categories: [Essay]`、`tags: [Learning, Hexo]`

### 本地检查建议

在提交或部署前，建议至少检查：

1. `npm run build` 是否通过
2. 中文页是否只显示中文内容
3. 英文页是否只显示英文内容
4. 菜单、侧边栏、上一篇/下一篇是否仍停留在当前语言路由下

## 多语言规则

当前站点采用“语言严格隔离”策略。

### 首页规则

- `/`：默认语言首页，当前等同于中文首页
- `/zh-CN/`：中文首页，只显示 `lang: zh-CN` 的文章
- `/en/`：英文首页，只显示 `lang: en` 的文章

### 特殊页面规则

当前已配置：

- 中文：
  - `/about/`
  - `/tags/`
  - `/categories/`
  - `/archives/`
- 英文：
  - `/en/about/`
  - `/en/tags/`
  - `/en/categories/`
  - `/en/archives/`

### 标签、分类、归档规则

- 中文标签页、分类页、归档页只显示中文文章数据
- 英文标签页、分类页、归档页只显示英文文章数据
- 英文标签详情页例如 `/en/tags/Hexo/` 只列英文文章
- 中文标签详情页例如 `/tags/Hexo/` 只列中文文章
- 语言切换并非硬编码分类名：会先尝试目标语言同路径，再自动匹配目标语言已存在的 taxonomy 路由
- 若目标语言不存在对应 taxonomy 详情页，会回退到目标语言入口页（如 `/en/categories/`、`/en/tags/`、`/en/archives/`）

### 文章页导航规则

上一篇 / 下一篇只在同语言文章集合中导航，不跨语言跳转。

### 菜单与侧边栏规则

英文页面中的：

- `Home`
- `About`
- `Tags`
- `Categories`
- `Archives`

都应跳到英文路由，而不是回到中文页。

## 如何新增更多语言

当前方案支持继续扩展更多语言，例如 `ja`、`fr`。

建议步骤：

1. 在 [_config.yml](/Users/andycao/Documents/Project/greatandyc.github.io/_config.yml:1) 的 `language` 数组里加入新语言
2. 新文章写明对应 `lang`
3. 为该语言补齐特殊页面：
   - `source/<lang>/about/index.md`
   - `source/<lang>/tags/index.md`
   - `source/<lang>/categories/index.md`
   - `source/<lang>/archives/index.md`
4. 如需站点描述、友情链接等本地化，继续补充对应语言文案
5. 如主题语言包不存在，则补充 `themes/next/languages/<lang>.yml`

注意：

- 根首页 `/` 永远跟随 `language` 数组里的第一个语言
- 如果以后想让 `/` 变成英文首页，把 `en` 放到第一位即可

## 目录结构

```text
.
├── _config.yml
├── languages/                  # 站点级语言文案
├── package.json
├── scaffolds/                  # 新文章模板
├── scripts/                    # 自定义 Hexo 生成逻辑
├── source/
│   ├── _data/                  # 自定义样式等覆盖文件
│   ├── _posts/                 # 所有文章正文
│   ├── about/                  # 中文 About
│   ├── categories/             # 中文分类页
│   ├── tags/                   # 中文标签页
│   ├── en/                     # 英文特殊页
│   └── images/                 # 站点图片资源
├── themes/
│   └── next/                   # NexT 主题与局部模板改造
└── public/                     # 构建产物
```

## 关键文件

- [_config.yml](/Users/andycao/Documents/Project/greatandyc.github.io/_config.yml:1)
  站点配置、默认语言顺序、首页生成策略

- [scaffolds/post.md](/Users/andycao/Documents/Project/greatandyc.github.io/scaffolds/post.md:1)
  新文章模板

- [source/_data/styles.styl](/Users/andycao/Documents/Project/greatandyc.github.io/source/_data/styles.styl:1)
  首页瀑布流卡片样式等自定义样式

- [scripts/localized-taxonomy.js](/Users/andycao/Documents/Project/greatandyc.github.io/scripts/localized-taxonomy.js:1)
  多语言标签 / 分类详情页生成逻辑

- [themes/next/scripts/helpers/engine.js](/Users/andycao/Documents/Project/greatandyc.github.io/themes/next/scripts/helpers/engine.js:1)
  路由本地化、同语言上一篇/下一篇、局部多语言 helper

## 维护注意事项

- 不要把英文文章放到 `source/en/_posts/`，Hexo 默认不会把它识别成正式文章。
- 所有文章正文统一放在 `source/_posts/`，通过 `lang` 区分语言。
- 如果只新增了英文文章，但没补英文 `tags/categories/archives/about` 页面，菜单会回退到中文或公共页。
- 修改主题模板后，优先执行一次：

```bash
npx hexo clean && npm run build
```

避免缓存或旧路由干扰判断。

## Git 约定

本仓库约定：

- commit message 使用中文
- commit message 需要详细说明改动内容

## 版权说明

- 代码部分：MIT
- 文章内容与图片：默认归作者所有，转载请注明出处
