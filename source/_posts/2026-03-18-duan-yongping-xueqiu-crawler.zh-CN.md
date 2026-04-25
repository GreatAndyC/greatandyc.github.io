---
title: 段永平雪球网评论爬取过程
date: 2026-03-18 12:00:00
lang: zh-CN
slug: duan-yongping-xueqiu-crawler
permalink: 2026/03/18/duan-yongping-xueqiu-crawler/
description: 记录一次围绕段永平雪球评论的爬取实践，包括技术路线选择、问题排查和结果导出。
photos:
  - /images/posts/feishu-migration/duan-yongping-xueqiu-crawler/duan-buffett-cover.png
tags:
  - 爬虫
  - 雪球
  - 数据分析
categories:
  - 教程
toc: true
---
## 1. 背景
偶然在雪球网上看到段永平（雪球 ID：**大道无形我有型**）指点江山，因为刚好做了一个用 Python + AI 语义分析的关于 ChatGPT 的分析报告，所以打算用同样的方式来对段永平在雪球网上的发言进行分析，看看能否挖掘出有价值的内容，例如他的投资心得、投资风格等。

## 2. 工具
使用工具为 **Google AI Studio** 的免费 **Gemini 2.0 Flash** 模型。

---

<!-- more -->

## 3. 具体步骤

### 3.1 确定技术结构
首先通过多轮询问，确定技术架构。

> **我的提问：**  
> 现在我需要爬取雪球网站上某个用户个人主页的所有帖子，例子如同截图所示。我想要保存这个页面的用户 id、日期、评论内容、评论对象为 csv 文件，我应该怎么做呢？

> **Gemini 回复使用的 Python 库和对应的代码框架：**  
> 你可以使用 Python 的 `requests` 库来获取网页内容，`BeautifulSoup4` 库来解析 HTML，以及 `csv` 库来写入 CSV 文件。

### 3.2 问题排查
在运行给出的代码之后发现，没多久便触发了网站的反爬机制，会出现验证码的情况，频率大约是每 50 条就出现一次。

再经过多轮反复对话：

> **后续对话过程：**  
> - 实际上我已经进行了尝试，发现这个网站会有反爬机制，好像是 JS 混淆技术吧，我懒得突破这个了，我觉得用 Selenium 登录我的账号，然后自动一页页修改哪个 page 的页码，每次修改之后单独保存 json 文件就行了。
> - Selenium 保持登录，然后自动获取当前浏览器页面的 json 上面的文本内容，保存到本地，然后重复，我的重点是自动化后面的步骤，不通过 api，有没有别的方法？
> - 非常好，我成功爬取了前两页的内容，接下来我打算爬前 10 页的剩下 8 页，这里我需要设置时间间隔吗？防止我被 ban。
> - 打印每一页的耗时和总耗时。
> - 把判断是否有验证码出现的逻辑改成每运行 60 次自动暂停，然后我来检查。
> - 这次不到 60 次就触发了验证码，而且我发现你的代码对于采集失败没有暂停功能。

---

## 4. 结果产出
最后通过半自动的方式，成功爬取了段永平从 **2011-03-24** 到 **2025-01-05** 日发表于雪球网上的所有公开评论。

**统计数据：** 458 页（每页 20 条）共计 **9151 条** 评论内容。作为一个小的数据金库，有待后续分析。

<figure class="post-figure">
  <img src="/images/posts/feishu-migration/duan-yongping-xueqiu-crawler/xueqiu_crawler_output_csv.png" alt="">
  <figcaption>雪球评论导出结果表</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/posts/feishu-migration/duan-yongping-xueqiu-crawler/duan_yongping_comment_sample.png" alt="">
  <figcaption>段永平评论样本</figcaption>
</figure>
