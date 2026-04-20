---
title: NotebookLM + Gemini + Nanobanana 制作哆啦 A 梦漫画工作流
date: 2025-12-22 13:00:00
lang: zh-CN
slug: notebooklm-doraemon-workflow
permalink: 2025/12/22/notebooklm-doraemon-workflow/
description: 整理一套用 NotebookLM、Gemini 和 Nanobanana Pro 生成漫画内容的 AI 工作流。
photos:
  - /images/feishu-migration/notebooklm-doraemon-workflow/doraemon_manga_generated_1.png
tags:
  - NotebookLM
  - Gemini
  - AI工作流
categories:
  - 教程
toc: true
---
## 前置条件
- [ ] 拥有稳定的 VPN 连接
- [ ] 有一个谷歌账号
- [ ] 有 **Nanobanana Pro** 的 Quota
- [ ] 有 **Gemini** 或者其他 AI 工具的访问权限

---

<!-- more -->

## 核心步骤

### Step 1: 获得原始材料
在 Zlib ([z-library.sk](https://z-library.sk/)) 上下载书籍：
- 《Python 编程实战：妙趣横生的项目之旅》 ([美] 李·沃恩 (Lee Vaughan))

### Step 2: 文件录入 NotebookLM
将 PDF 文件上传至 [NotebookLM](https://notebooklm.google.com/)（请注意 VPN 选择支持访问的国家）。

### Step 3: 生成漫画脚本建议
在 NotebookLM 里面输入 Prompt：
> 让大雄和哆啦A梦为主人公，以漫画形式，带领读者由浅入深地学习并了解这本书。

### Step 4: 规划页面结构
继续提问：
> 请基于以上讨论，分析并告知这个漫画学习读本要划分为多少页比较合适，每页内容是什么？

### Step 5: 使用 AI 生图（Nanobanana Pro）
将得到的内容输入给 Gemini：
> 请基于以上讨论，使用 **nano banana pro** 生成学习漫画第一页的图像（页面分辨率统一为竖屏 2:3，语言是中文）。

### Step 6: 迭代生成
根据规划，一张张顺序生成后续页面即可。

---

## 输出结果展示

<figure class="post-figure">
  <img src="/images/feishu-migration/notebooklm-doraemon-workflow/doraemon_manga_generated_1.png" alt="">
  <figcaption>哆啦 A 梦漫画生成结果</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/notebooklm-doraemon-workflow/workflow_checklist_summary.png" alt="">
  <figcaption>工作流总结清单</figcaption>
</figure>

## 参考链接
1. [X.com 原始链接](https://x.com/Tz_2022/status/1993033135068790831)
