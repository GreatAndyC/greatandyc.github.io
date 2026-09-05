---
title: Project Based Learning——服务器部署篇
date: 2026-09-05 21:20:00
lang: zh-CN
slug: project-based-learning-server-deployment
permalink: 2026/09/05/project-based-learning-server-deployment/
description: 从服务器部署实战，反思 AI 时代的项目式学习。
photos:
  - /images/posts/project-based-learning-server-deployment/vultr-server-selection.png
tags:
  - AI
  - 服务器
  - Project Based Learning
categories:
  - 学习记录
---

**从服务器部署实战，反思 AI 时代的项目式学习。**

<!-- more -->

再过去有一段时间，曾经苦恼于网络连接问题而无法稳定使用Antigravity，ChatGPT等应用
遂在某一天下定决心一定要解决这个问题，不再受制于外界，更新自己的Information Infra建设

经过简单调研，选择Vultr作为服务器供应商
<figure class="post-figure">
  <img src="/images/posts/project-based-learning-server-deployment/vultr-server-selection.png" alt="">
  <figcaption>Vultr的服务器选择购买页面</figcaption>
</figure>


花了接近两天的时间，经历了这样的一个Loop：
- 希望解决某个问题
- 遇到新的不懂的知识
- 截图问AI如何解决
- 遇到下一个问题

最后直至跑通整个流程

在这个过程中，我通过“实战”，理解了什么是协议，什么是ipv4什么是ipv6，以及服务器的本质
这些问题都是在尝试解决问题的时候立刻出现的，而且由于有真实的场景，所以可以立刻得到反馈，可以说是最高效的学习方法，例如：
- 理解服务器的本质：需要在选择购买服务的时候，弄明白Dedicate CPU,Shared CPU, Cloud GPU, 裸金属的区别以此确定符合我约束条件的最优选择
- 而在部署网络服务的时候，可以立刻询问ipv4,ipv6的区别：也因此知道了ipv4是历史遗留，而ipv6多到可以给地球上所有的沙子都分配一个地址
- 为什么要用root权限分配管理员账号，为什么后续用ssh登陆并且禁止root登陆：因为从日志就可以看到，刚刚登上服务器的一刻，就有无数的自动脚本在对着端口暴力扫描
- ssh登陆又把在电子商务课程上学到的密码学知识连接在了一起。

可以说，这种立刻就可以得到反馈的学习方法如同Vibe Coding一般，让你在不经意间就在大脑里构建出了一个知识地图。而只要后续把这个过程通过自己回顾总结写成SOP或者给未来的自己、他人看的教程，又是一个新的巩固和复习的过程，于是就沉淀成了长期的资产。

在前几周开始，在服务器上安装了Opencode这个Agent，这下只需要对着服务器输入希望达成的目标，Agent就会自己开始执行目标了，但是如果没有前面自己手动去实战、一行行哪怕copy and paste，截图问AI的过程，我估计我很难建立起来一个完整的知识体系。
<figure class="post-figure">
  <img src="/images/posts/project-based-learning-server-deployment/opencode-command-line.png" alt="">
  <figcaption>最原始的输入方式，OpenCode命令行界面</figcaption>
</figure>

在社交媒体上经常可以看到“古法编程”和“AI编程”的提问，比如“如何克服古法编程中的负反馈”？

有答主的说法是，当成功解决一个问题的时候，那种内啡肽分泌的快感就和在比赛中逆风翻盘一样舒畅。

这让我想起了高中数学考试的时候，虽然确实很难，但是其实我并没有感到一种恶心的空虚，有的只是在略带压力的考场上解决了一个个问题的疲惫感。大概也是这种，大脑经过了思考和锻炼解决了问题的缘故。

就像一些讨论说的那样，AI在可见的未来能够完成绝大多数人的工作，但是在学习这件事上，人的输入和学习这个过程并没有发生本质的改变，依然需要时间去打磨和理解原理。

这种Project Based Learning加上事后的总结回顾并且发布成为文章总结反思，在我看来是最适合AI时代的学习方式了。
