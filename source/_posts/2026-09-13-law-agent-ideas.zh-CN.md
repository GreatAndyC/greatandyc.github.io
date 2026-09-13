---
title: 26.9.13 设计Law Agent的思路与实现
date: 2026-09-13 15:26:00
lang: zh-CN
slug: law-agent-ideas
description: 记录 Law Agent 从行业调研到设计与实现的全过程。
photos:
  - /images/posts/2026-09-13-law-agent-ideas/law-agent-android-preview.png
tags:
  - AI
  - Agent
  - Law Agent
  - 产品
  - 独立开发
categories:
  - AI
---

<!-- more -->

之前一直想要做一个APP，能够帮我快速自动审查合同并且给出建议，所以昨天正式开始做这一件事情

在做这个事情之前思考了几个问题：
1. 大语言模型为什么适合做语言审查？
2. 既然已经有通用的人工智能产品ChatGPT了，为什么还要自己制作一个APP/Agent？
挨个整理一下思绪。

## 大语言模型为什么适合做语言审查？

在不久之前投递了HKU的RA岗位，做了一个小的Demo，做的事情就是BIM里面的IFC模型审查
产品Demo可以通过网址：https://bim-review-agent.andycaoyy6.chatgpt.site/ 访问
PS:由于使用的是ChatGPT提供的网站托管服务，所以请使用支持Chatgpt服务的IP访问

实际上，依据我的个人经验，现在多数人对于AI对感觉，从兴奋开始转向虚无。

掌握资源的“老板”们觉得AI可以帮助我提效，那么为什么我还要雇佣这么多雇员？AI可以做到为什么你做不到？我怎么加速我的数字化转型？
FDE（Foward Deployed Engineering）在大多数的老板眼里，实际上已经是“东西厂主管”的角色，唯一负责的指标是“我可以裁多少人？”

而掌握知识技能的雇员们认为，如果我的知识技能都被AI学习走了，那么我自己的利益怎么保护？最终难道不会”教会徒弟饿死师傅“吗？
参考链接：
1. https://www.qbitai.com/2026/04/402063.html 
2. https://medium.com/@kanishks772/meta-allegedly-used-employee-workflows-to-train-ai-then-laid-off-8-000-people-b267da7a63ec

而且目前一旦提到，“我的XXXX是在AI帮助下完成的”。

在我看来，人们的认知里面只会觉得“这是一个粗制滥造的东西”，而不是“这是一个非常高科技含量的很酷的、很有含金量的东西”。

虽然AI（Artificial Intelligence）的范围和应用远不止是自然语言处理，但是确实它是目前影响我们生活最多的一个应用。

所以，我认为，一个好的AI产品/应用，应该让人察觉不到AI在其中，而且结果是可以验证的、准确的、高精度的。

法律合同这样的标准文书写作需要对逻辑和语言非常严谨，并且有标准样式可以参考对比，NLP（Natural Language Processing）恰好就是大语言模型比较擅长的地方。

因此，把问题/图像交给大语言模型做筛查，接着将有问题的地方进行高亮，并且给出参考文献，最终给出反馈意见，就是一个很好的闭环，也是可以用AI可以极大加速的地方。

当然最主要的是，我自己个人会遇到很多诸如劳动合同、租房合同、民事商务合同等的情况，所以做这个产品的一个目的之一，也是我自己希望有一个高效的解决方案。

## 垂直Agent和通用Agent

接着问题又来了——既然已经有ChatGPT/豆包/Gemini这样的通用APP，开发这样的一个产品的意义何在？

在过去我遇到问题的时候，大多数的流程是：将文件内容上传给GPT，接着让GPT给我审查，通过反复提问得到反馈，甚至直接生成新的PDF。

这个问题其实不仅限于APP开发，几乎可以套用到任何领域：既然已经有一个非常强大的更低成本的解决方案，为什么还要自己做？

对比一下两者的区别：
自己开发：
1. 更加高自由度的数据处理方案选择
2. 自由选择数据存储方案
3. 模型能力和Agent能力存在差距

将数据给巨头：
1. 更快速的响应
2. 工作流程固定化，不可定制
3. 数据需要全部交给巨头的服务器

所以可以看出，自己开发的好处和坏处都很明显，好处就是更多的自由度，并且可以将数据更加有选择性地披露，同时可以更好地与当前的工作流结合。

坏处就是，在处理效率上，依然和巨头的模型有差距，而且如果最终还是要使用模型供应商的API，那么最终数据保密的范围依然只能是有限度的。

所以这是一个 安全VS效率的 Trade off

也可以说是，中心化VS去中心化，利维坦VS贝希摩斯......

## 开发流程

首先进行“行业最佳实践”调研，让CodeX/GPT进行行业最佳调研

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-competitor-analysis.png" alt="Law Agent 竞品分析与产品结构讨论截图" width="1300" height="1344" loading="lazy" decoding="async">
  <figcaption>围绕法律行业 Agent 的竞品、工作流和产品结构进行对比。</figcaption>
</figure>

接着对相关的APP和设计进行参考，例如通过Computer Use或者通过开发者模式连接手机APP，对功能进行测试，并且对设计思路进行参考。

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-product-testing.png" alt="Law Agent 产品功能测试记录截图" width="1294" height="966" loading="lazy" decoding="async">
  <figcaption>记录 Law Agent 与相关产品的功能测试结果和待验证事项。</figcaption>
</figure>

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-feature-analysis.png" alt="Law Agent 功能拆解与优化研究截图" width="1298" height="1366" loading="lazy" decoding="async">
  <figcaption>将功能拆解、页面链路和后续优化方向整理成研究材料。</figcaption>
</figure>

## 通过FigmaMake获取设计稿

接着让CodeX阅读整个文件夹内容，给出发送给FigmaMake（设计软件Figma自带的AI设计功能）进行初版的MVP设计。

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-figma-make-home.png" alt="Law Agent Figma Make 首页设计稿截图" width="2928" height="1412" loading="lazy" decoding="async">
  <figcaption>Figma Make 生成的 Law Agent MVP 首页与移动端界面方案。</figcaption>
</figure>

将设计稿内容保存为Figma文件（所有不会的步骤可以考虑用Computer Use进行兜底辅助）

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-figma-make-canvas.png" alt="Law Agent Figma 画布与页面结构截图" width="2900" height="1406" loading="lazy" decoding="async">
  <figcaption>保存后的 Figma 画布、页面层级和交互原型结构。</figcaption>
</figure>


后续将Figma和CodeX通过MCP服务器连接，让Figma全自动进行前端UI开发
参考链接：https://help.figma.com/hc/en-us/articles/39888629089175-Codex-and-Figma-Set-up-the-MCP-server

在此期间可以和CodeX讨论如何做长期存储、系统架构方案选择等，保存到仓库里作为Agent.md或者Spec文档等。

## Logo和视觉

在视觉设计上，也是和GPT讨论了Logo怎么设计。
为了体现法律公平公正，所以采用了法律最常用的天平作为视觉中心。
而且还加入了日本特摄剧《铁甲小宝》里面的裁判——蜻蜓队长的元素。

## Build和测试

当开发完成后就可以自己在不同模拟器或者真实设备上测试稳定性，可靠性等了。

至于发布和推广商业化和持续迭代优化，那又是另一回事了

## 总结

总的来看，这是一个AI打草稿->依据个性化审美优化->根据自己和市场的反馈不断迭代的Loop

## 预览图

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-android-preview.png" alt="Law Agent Android 版本预览图" width="688" height="1586" loading="lazy" decoding="async">
  <figcaption>目前 Android 版本的 Law Agent 界面预览。</figcaption>
</figure>

这是目前的安卓版本的预览图，至于后续的成品，请待后续关注。
