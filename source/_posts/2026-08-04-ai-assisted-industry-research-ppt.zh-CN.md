---
title: 我如何用 AI 在三小时内完成一次行业调研与全英 PPT
date: 2026-08-04 20:00:00
lang: zh-CN
slug: ai-assisted-industry-research-ppt
permalink: 2026/08/04/ai-assisted-industry-research-ppt/
description: 记录一次三小时完成行业调研与全英 PPT 的 AI 工作流。
photos:
  - /images/posts/ai-native-software-engineering/slide-01.png
tags:
  - AI工具
  - AI工作流
  - 行业调研
  - PPT
  - NotebookLM
  - Codex
categories:
  - AI应用
toc: true
---

**记录一次三小时完成行业调研与全英 PPT 的 AI 工作流。**

<!-- more -->

## 一次面试题，变成一次 AI 工作流实验

本文记录的是一次几个月前参加咨询公司面试时的案例准备过程：如何在有限时间内完成一个行业调研，并把研究结果整理成一份可以进行全英 Pre 的 PowerPoint。

第一轮是线下面试。后来面试官告诉我，我是当时小组里第一个进入第二轮的人。第二轮的任务是选择一个自己熟悉的主题，完成一份行业研究，并在面试中用英文进行完整展示。

我当时并没有把它当成一份传统的“查资料、做页面”的作业，而是把它当成了一次小型的 AI 辅助交付实验：如果 AI 已经可以参与大量工作流，那么它能不能同时参与行业研究、观点组织和演示文稿制作？

从开始调研到完成 PPT，我大约用了三个小时。这个时间并不足以完成一份完整的行业研究，但足够把一个模糊的题目转化成一套可以讲清楚的观点、图表和演讲结构。

## 为什么选择软件开发行业

当时我一直在开发自己的 AI 原生饮食管理产品[食光机](https://www.shiguangjiapp.com/)，因此对 AI 如何改变软件开发流程已经有了一些实际感受。

我的基本判断是：AI 不只会影响代码生成，还会进入需求分析、架构设计、测试、文档、部署和运维等环节。于是，我把主题定为高新科技领域中的软件开发，并进一步收敛成一个问题：

> 当 AI 可以越来越快地生成代码之后，软件工程真正的瓶颈会转移到哪里？

这个问题后来成为整份 PPT 的主线。我的结论并不是“AI 会替代软件工程师”，而是：AI 可能会压缩实现阶段的时间，同时把更多压力转移到需求定义、代码审查、系统集成、安全治理和结果验证上。

## 原始版本使用的工具链

当时我正好订阅了 Google Gemini Pro，实际使用的工具主要是 Gemini Pro 的 Deep Research、NotebookLM 和 WPS。

| 工具 | 在这次案例中的作用 |
| --- | --- |
| Gemini Pro / Deep Research | 检索论文、公司材料和行业报告，收束研究问题，并生成带有来源线索的研究草稿 |
| NotebookLM | 汇总研究材料，通过 Slide Deck 功能快速生成演示文稿初稿 |
| WPS Office | 对 NotebookLM 生成的 PPT 进行页面布局、文字和视觉细节调整 |
| 人工判断 | 选择主题、筛选观点、决定叙事顺序，并准备最终的英文讲解 |

这里的关键并不是“哪个工具最强”，而是把不同工具放在了不同的位置：一个工具负责扩展研究，一个工具负责综合材料，另一个工具负责快速组装页面，而最后的取舍和表达仍然由我自己完成。

## Gemini Pro：扩大研究范围，再收束成可讲述的问题

我首先使用 Gemini Pro 的 Deep Research 功能围绕 AI 重塑软件工程进行资料检索。它可以访问和整理与主题相关的论文数据库、公司网站和行业研究报告，例如 arXiv 上的论文、公开技术报告以及软件开发领域的行业研究。

它给出的并不是一页简单的搜索结果，而是一份带有引用线索的研究草稿。接下来我通过多轮对话不断收束上下文，把宽泛的“AI 会如何改变软件工程”逐渐压缩成几个更适合演示的问题：

- AI 生成代码的速度是否会超过人工审查和集成能力？
- AI 生成的代码应该如何进行语义、安全和业务验证？
- 软件工程师的角色是否会从实现者转向定义者、编排者和评估者？
- 企业知识、设计系统和工具权限如何成为 AI 的工作上下文？

最后，我让 Gemini 帮助整理 PPT 的内容结构和文案提示词，再把这些材料交给 NotebookLM 进行下一步处理。

## NotebookLM：从研究材料到演示文稿初稿

我把从 Gemini 获得的研究材料导入 NotebookLM，然后使用其中的 Slide Deck 功能快速生成 PPT 初稿。

<figure class="post-figure post-figure--portrait">
  <img src="/images/posts/ai-native-software-engineering/notebooklm-slide-deck-ui.png" alt="" width="956" height="1316" loading="lazy">
  <figcaption>NotebookLM 中的 Slide Deck 功能入口。</figcaption>
</figure>

NotebookLM 的价值不只是把文字放进幻灯片，而是把研究材料先转换成一个可浏览的叙事结构。对于需要在很短时间内完成英文演示的人来说，这一步明显降低了从“研究资料”到“可以讲述的页面”的距离。

## WPS：把生成结果调整成可交付的面试 PPT

NotebookLM 生成的页面还不能直接作为最终交付物。它更像是一份内容和版式草稿，仍然需要人工调整标题层级、文字密度、图表比例和页面节奏。

当时我使用 WPS 继续处理这些细节，并根据面试场景对视觉风格做了调整，包括页面布局、色彩、标题和面试公司的品牌视觉对齐。

下面是当时 NotebookLM 生成和调整过程中的几个页面示例。它们整体偏向简洁、专业、研究报告式的视觉语言，具体风格可以通过提示词和后续排版控制。

<div class="post-deck-gallery" aria-label="NotebookLM 生成的演示文稿示例">
  <div class="post-deck-gallery__toolbar">
    <strong>NotebookLM Slide Deck 示例</strong>
    <span class="post-deck-gallery__hint">左右滑动或拖动查看</span>
  </div>

  <div class="post-deck-gallery__track" tabindex="0" aria-label="NotebookLM 生成的演示文稿示例，可左右滑动">
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/notebooklm-example-01.png" alt="" width="774" height="414" loading="lazy">
      <figcaption><strong>01</strong>早期 NotebookLM 生成的 V-Bounce Model 封面示例。</figcaption>
    </figure>
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/notebooklm-example-02.png" alt="" width="794" height="422" loading="lazy">
      <figcaption><strong>02</strong>早期版本中的效率悖论与软件工程稳定性页面。</figcaption>
    </figure>
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/notebooklm-regenerated-example-01.png" alt="" width="1050" height="588" loading="lazy">
      <figcaption><strong>03</strong>2026 年重新生成的效率悖论页面，视觉风格已经发生变化。</figcaption>
    </figure>
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/notebooklm-regenerated-example-02.png" alt="" width="1042" height="580" loading="lazy">
      <figcaption><strong>04</strong>重新生成版本中的 Stanford 数据和早期职业岗位变化页面。</figcaption>
    </figure>
  </div>
</div>

## 同一个项目，今天再点击一次 Slide Deck

2026 年 8 月 4 日，我又打开了当时的 NotebookLM 项目，在没有修改原始材料的情况下重新点击了一次 Slide Deck。

重新生成的页面和几个月前的版本已经有了明显区别，尤其是字体、图表布局、信息层级和插图风格。这种变化可能来自模型、提示词解释方式和产品本身的更新，也说明 AI 演示文稿工具的输出并不是固定的模板结果。

因此，如果要把 AI 工具写进一套稳定的工作流，不能只记录“点击了哪个按钮”，还需要保留研究材料、提示词、人工修改和最终验收过程。

## 这套流程今天如何迁移到 Codex

工具本身会变化，但工作流可以保留下来。今天，这套流程的主要环节已经可以迁移到网页端的 ChatGPT / Deep Research 和本地 Codex 中：

1. 使用网页端的 Deep Research 功能获取公开研究内容，并保存来源和引用线索。
2. 在 Codex 或 GPT Work 中整理研究内容，形成文章、讲稿和演示文稿结构。
3. 在本地 Codex 中建立一个隔离的项目目录，把需要处理的原始文件和公开素材放在里面，明确告诉 Codex 需要读取和生成哪些文件。
4. 让 Codex 生成可编辑的 PPTX 或 PDF，再逐页检查版式、来源、数字定义和版权边界。

本地 Codex 中可用的具体模型名称、套餐档位和权限选项会随着客户端更新变化，因此我不建议把某一个时期的型号名称写成固定结论。更稳定的写法是：选择当前环境中能力足够的 GPT-5 系列模型，并根据项目内容决定是否开启更高权限。

如果使用完全访问权限，最好只让它处理一个明确、隔离的项目目录，而不是让它无边界地读取整个个人文件系统。这样既方便生成 PPT，也能降低原始文件和私人资料被误读、误改或误提交的风险。

## 后来，我用 Codex 重新制作了这套 PPT

原始面试 PPT 适合用于当时的现场讲解，但不适合直接作为博客附件公开。因此，我后来又把它整理成了一个独立重构版本：

- 删除原始企业 Logo、口号和品牌锁定版式；
- 不直接复用原始企业插画、火箭、机器人和盾牌素材；
- 重新绘制封面、流程图、连接器、页脚和图表；
- 将内容中的数字分为 Fact、Illustrative Model、Proposed Target 和 To Verify；
- 将 V-Bounce 重新表达为 Definition → Agentic Implementation → Verification；
- 用 `Human accountability` 贯穿 AI 生成、评估和上线决策；
- 生成一套 6 页、16:9、PowerPoint 对象可编辑的独立重构版。

这份版本不代表任何公司、客户或面试方，也不是原始企业材料的官方版本。它是我对那次准备过程的重新整理，以及对 AI-native 软件工程的一次个人模型化表达。

## PPT 全文内容

下面是最终独立重构版的全部 6 页。为了避免在文章中连续堆叠 6 张大图，这里使用了一个可以在桌面端横向拖动、在手机端左右滑动的 HTML 浏览器。

<div class="post-deck-gallery" aria-label="AI-Native Software Engineering 独立重构版演示文稿">
  <div class="post-deck-gallery__toolbar">
    <strong>AI-Native Software Engineering · 6 slides</strong>
    <span class="post-deck-gallery__hint">左右滑动或拖动查看全部页面</span>
  </div>

  <div class="post-deck-gallery__track" tabindex="0" aria-label="AI-Native Software Engineering 全部演示文稿页面，可左右滑动">
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/slide-01.png" alt="" width="1920" height="1080" loading="lazy">
      <figcaption><strong>01</strong>独立重构版封面：Context → Agents → Evaluation。</figcaption>
    </figure>
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/slide-02.png" alt="" width="1920" height="1080" loading="lazy">
      <figcaption><strong>02</strong>AI 将瓶颈从编码阶段转移到交付系统。</figcaption>
    </figure>
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/slide-03.png" alt="" width="1920" height="1080" loading="lazy">
      <figcaption><strong>03</strong>证据页：把外部研究、示意模型和待核验内容分开。</figcaption>
    </figure>
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/slide-04.png" alt="" width="1920" height="1080" loading="lazy">
      <figcaption><strong>04</strong>V-Bounce 操作模型：Definition → Implementation → Verification。</figcaption>
    </figure>
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/slide-05.png" alt="" width="1920" height="1080" loading="lazy">
      <figcaption><strong>05</strong>上下文与角色设计：Context Layer 与 Human Control Layer。</figcaption>
    </figure>
    <figure class="post-deck-gallery__slide">
      <img src="/images/posts/ai-native-software-engineering/slide-06.png" alt="" width="1920" height="1080" loading="lazy">
      <figcaption><strong>06</strong>12 个月试点路线：Foundation → Pilot → Scale → Maturity。</figcaption>
    </figure>
  </div>
</div>

## 下载 PDF

如果你希望把整套内容保存下来，可以下载独立重构版 PDF：

<div class="post-artifact-card">
  <p class="post-artifact-card__copy">
    <strong>AI-Native Software Engineering · Protected PDF</strong>
    <span class="post-artifact-card__meta">无需密码阅读；编辑和权限变更受到所有者密码保护。</span>
  </p>
  <a class="post-artifact-card__link" href="/downloads/ai-native-software-engineering-protected.pdf" download>下载 PDF</a>
</div>

这里的保护属于 PDF 权限控制，而不是访问控制：拿到链接的读者可以直接阅读，但正规 PDF 阅读器会要求所有者密码才能修改或改变权限。这个密码不会写在博客、文件名或 Git 仓库里。

## 我从这次实践中得到的几个结论

### 1. AI 可以压缩研究和制作时间，但不能替你完成问题定义

Gemini 帮我扩大了搜索范围，NotebookLM 帮我把研究材料转换成演示文稿结构，WPS 帮我完成了快速排版。但最终要研究什么、哪些观点值得进入主线、哪些数字可以被公开使用，仍然需要人工判断。

### 2. 一份看起来完整的研究，不一定是一份证据完整的研究

AI 很擅长把多个来源组织成一个顺畅的叙述，但顺畅不代表严谨。公开发布前，我需要重新检查每一个数字的来源、样本、时间窗口和统计定义，并把内容区分为：

- `Fact`：可以追溯到明确来源的事实；
- `Illustrative Model`：为了帮助读者理解而建立的示意模型；
- `Proposed Target`：未来试点中可以验证的目标；
- `To Verify`：目前仍然需要进一步核验的内容。

### 3. AI-native 工作流的重点不是工具数量，而是职责分工

这次经历让我更愿意把 AI 工具看成一组可替换的工作节点：搜索工具负责扩展信息范围，知识工具负责整理上下文，演示文稿工具负责快速表达，而人负责定义问题、设定边界、检查证据和承担最终责任。

如果只是把 AI 加到原来的流程里，团队可能只会更快地产生更多需要审查的内容。真正的变化，是重新设计定义、实现、验证和责任之间的关系。

## 公开边界与免责声明

本文是我对一次咨询公司面试案例准备过程的个人复盘。文章中的研究观点、图表和操作模型分别按公开来源、个人综合、示意模型或待核验内容处理。最终 PPT 是不代表任何公司、客户或面试方的独立重构版本。

原始面试 PPT、原始模板、企业品牌资产和未核验的中间素材没有作为博客附件公开。博客中展示的图片和 PDF 只用于说明这次方法和最终重构结果。

## 参考资料

1. [Google Cloud — 2025 DORA Report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)
2. [Anthropic — Impact of AI on software development](https://www.anthropic.com/research/impact-software-development)
3. [Stanford Digital Economy Lab — Canaries in the Coal Mine](https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/)
4. [Figma — Introducing the Figma MCP server](https://www.figma.com/blog/introducing-figma-mcp-server/)
5. [Cory Hymel — V-Bounce Engineering Paradigm](https://arxiv.org/abs/2408.03416)
