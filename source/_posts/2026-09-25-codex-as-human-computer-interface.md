---
title: CodeX作为人机交互的入口
date: 2026-09-25 12:00:00
lang: zh-CN
slug: codex-as-human-computer-interface
permalink: 2026/09/25/codex-as-human-computer-interface/
description: 从直接修改代码、使用 CMS 到让 CodeX 连接 Obsidian 与博客，记录个人内容发布工作流的三次封装。
photos:
  - /images/posts/codex-as-human-computer-interface/codex-workflow-cover.png
tags:
  - AI
  - Agent
  - CodeX
  - 人机交互
categories:
  - 随笔
---

<!-- more -->

自从第一篇博客内容上传完成到现在，已经一年有余。

在这一年里不断地使用各种Ai工具，让我切身体会到了什么叫做“日新月异”。

以我更新一篇文章为例：

在最开始的时候，我需要自己在项目里新建md文件，同时用代码链接好图片，接着执行Hexo的部署和渲染命令，然后实现我的文章部署到服务器。

这个时候的数据流向很粗糙原始：我的大脑-工程代码-服务器

![](/images/posts/codex-as-human-computer-interface/01-data-flow-code.png)

后面我了解到了CMS（Content Management System）内容管理系统。

于是我在CodeX的帮助下，给我的博客增加了一套内容管理系统的页面，甚至煞有介事地增加了各个学校的皮肤。

![](/images/posts/codex-as-human-computer-interface/02-cms.png)

![](/images/posts/codex-as-human-computer-interface/03-cms-skin.png)

同时我接入了Deepseek的API，可以帮助我直接把内容翻译成英文。

这个时候的数据流向就是：我的大脑-CMS前端-工程代码-服务器。

而到了现在，我的输入方式又一次简化了。

我在Obsidian里面编辑好了之后，直接让CodeX去阅读，并且把文章翻译完成，并入到代码里，可以说一句话就完成了。

![](/images/posts/codex-as-human-computer-interface/04-obsidian-codex.png)

数据流向是：我的大脑-Obsidian-CodeX-工程代码-服务器

在我看来，这个过程就像是一层层封装一样，从我直接接触原始代码，到封装一层前端页面，再到现在的直接跳过前端，Agent操作原始内容直接录入。

三种方法都有各自的好处：
- 第一种方法让我可以接触到代码细节，就像是拆开电箱在里面直接操作
- 第二种方法更加Web2.0，前后端分离，人机活动模式更加宜人
- 第三种方式就像是多了一个仆人，我不再需要关注执行，只需要把要求丢给其他人做

在我看来Agent/Harness就像是大模型的操作系统，给模型约束，让它能够在正确地方向上发挥自己的智能，不知道未来又会变成什么样子。

非常怪异地，我这个画风如Web1.0的网站，用最先进的大模型的技术，讨论着不同时代的内容，囫囵吞枣，把所有的东西吃下去。
