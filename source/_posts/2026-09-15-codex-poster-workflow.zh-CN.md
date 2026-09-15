---
title: 如何用CodeX辅助制作海报
date: 2026-09-15 20:00:00
lang: zh-CN
slug: codex-poster-workflow
permalink: 2026/09/15/codex-poster-workflow/
description: 记录用 CodeX 辅助制作食光机项目宣传海报的过程。
photos:
  - /images/posts/ai-poster-workflow/ai-poster-workflow.png
tags:
  - AIGC
  - CodeX
  - Photoshop
  - 海报
categories:
  - 教程
---

## 前置条件

- 了解Photoshop基本的图层概念
- 熟悉字体、图片的缩放移动等操作
- 会基本的抠图

## 整体思路

AI阅读仓库->人工判断加上提示词微调->给出参考样例->寻找开源/AI生图素材->手动或者用Computer Use在Photoshop软件中拼接素材

<img src="/images/posts/ai-poster-workflow/ai-poster-workflow.png" alt="">

## 设计参考图HTML

当时是为了给我参加Hackthon的项目也就是「食光机」的Demo设计一个宣传海报。
由于本科在宣传部门参与过若干次的海报设计工作，有一定的海报设计经验。所以这对我来说不是一个完全陌生的领域。
过去的流程是：根据优秀寻找灵感->寻找图片内容素材->绘制宣传品

当时是已经有代码仓库和MVP的代码了，里面有配色还有设计理念等内容。
让Agent阅读整个代码仓库，然后给我一个参考Prompt，生成一个Html文件（方便编辑），其实直接生成图片也可以，不过当时并没有Image2这样强大的生图模型

Prompt参考：
“_A3竖版海报设计，食光机AI饮食记录App宣传海报，温暖橙色渐变背景，白色浅色系，干净简洁现代风格。顶部居中：logo图标+产品名称"食光机"手写体+团队名称。中间：精致手机模型展示APP界面，浅色UI+橙色点缀，显示AI食物识别+营养分析界面，手机下方横排4个圆形图标：相机、大脑、对话框、日历，分别代表AI识菜、营养分析、AI顾问、全面记录。底部：左侧大二维码+右侧"扫码下载"文字+底部slogan"拍照识菜·智能营养分析·健康生活伴侣"。留白艺术，浅灰色几何装饰线条，无多余文字，信息层级分明，高端品牌感，8k超高清，平面设计风格，CMYK印刷标准”

得到的HTML文件参考如下：

<img src="/images/posts/ai-poster-workflow/poster-html-reference.png" alt="" width="599">

## 寻找/生成素材

前一步解决了最难的排版和灵感问题之后，下一步就是寻找素材。

我找到的素材有这些：
其中iphone样机是在免费的设计网站上找到的；图标是通过SeedDream生成的方便抠图的图片；二维码是通过Chrome浏览器生成的；背景一开始想塞一个图片，不过后面发现拉一个渐变好看一些；

<img src="/images/posts/ai-poster-workflow/poster-asset-strip.png" alt="">

<img src="/images/posts/ai-poster-workflow/poster-assets-board.png" alt="">

接着就是对齐/排版等较为繁琐重复的工作（或许可以考虑尝试用Computer Use来解决）

导出海报之后如下图所示

<img src="/images/posts/ai-poster-workflow/poster-final.jpg" alt="" width="498">

## 总结

Ai在这个工作流起到的主要作用有：
1. 阅读整个仓库，绘制带有设计理念的海报草图
2. 生成图片素材
3. 帮助做联网搜索
