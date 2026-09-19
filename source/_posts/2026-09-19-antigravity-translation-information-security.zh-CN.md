---
title: "尝试用 Antigravity 翻译威胁报告：我对 Agent 信息安全的观察"
date: 2026-09-19 20:00:00
lang: zh-CN
slug: antigravity-translation-information-security
permalink: 2026/09/19/antigravity-translation-information-security/
description: 记录用 Antigravity 翻译 Anthropic 威胁报告，并从 Agent 数据流出发观察 AI 时代的信息安全边界。
photos:
  - /images/posts/antigravity-translation-information-security/cover-agent-information-security.png
tags:
  - AI
  - Agent
  - 信息安全
  - 隐私
  - Antigravity
categories:
  - AI
toc: true
---

**一次 PDF 翻译实践，让我重新思考了云端 Agent 的数据边界。**

<!-- more -->

## 使用 Antigravity 翻译 PDF

9 月中关注到新闻提到 Anthropic 的威胁报告，里面提到了大量震撼的内容（Anthropic, 2026b），于是便产生了阅读原文的想法。毕竟在条件允许的情况下，我还是更愿意直接阅读原始报告，而不是只依赖他人的二手总结。

我在 Anthropic 官网找到了报告的 PDF，然后下载到本地：

[Detecting and countering misuse of AI: September 2026](https://www.anthropic.com/threat-intelligence-report-september-2026)

接着给 Antigravity 下达命令，让它处理 PDF 翻译。

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/01-antigravity-pdf-translation.png" alt="在 Antigravity 中拆分并发翻译 Anthropic 威胁报告" width="1866" height="1532" loading="eager">
  <figcaption>在 Antigravity 中让 Agent 拆分 PDF，并行执行文本识别与翻译。</figcaption>
</figure>

采用拆分并发的方式是为了提升速度。不过，如果模型本身的智能足够高，可能这些 Prompt 都是多余的，模型会自己判断什么样的方式最高效。

我还让 Agent 简单统计了一下威胁报告中不同类型案例的比例：

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/02-threat-report-distribution.png" alt="Anthropic 威胁报告中不同威胁类型的页数分布" width="1274" height="1192" loading="lazy">
  <figcaption>Anthropic 威胁报告中不同威胁类型的页数分布。</figcaption>
</figure>

大约一年前，我还没有想过可以直接使用 Agent 本身的能力完成这一步骤。现在看来，很多垂直翻译工具的功能边界正在被通用 Agent 压缩。

之前我也尝试过 [PDFMathTranslate](https://github.com/PDFMathTranslate/PDFMathTranslate)。它的优点是可以自由选择不同的翻译引擎，但部署和调试相对繁琐；这些小功能现在也可以通过通用 Agent，或者 Codex 的子 Agent 来实现（PDFMathTranslate, n.d.）。

Agent 正在把很多垂直软件的“功能护城河”抹平。可能未来垂直软件真正剩下的护城河，会更多转向工作流、稳定性、专业数据、合规、UI 和集成。

## 威胁报告之后

威胁报告发布后，很快就出现了对网络安全的讨论。报告中提到了攻击者通过中间人、代理和其他基础设施扩大模型使用范围的问题（Anthropic, 2026b）。

这也让我再次意识到，“数据安全”并不是一个只和密码学或服务器配置有关的命题。

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/03-privacy-leak-example.png" alt="《头文字D》电影剧照" width="600" height="591" loading="lazy">
  <figcaption>《头文字D》电影剧照（2005）。历史上并不缺乏因为私人数字资料泄露而造成巨大现实后果的案例。</figcaption>
</figure>

AI Agent 的不同之处在于，它获得的数据读取范围可能比传统应用大得多。它不只是等待用户输入文本，还可能读取文件、调用工具、执行命令，并把结果交给远程模型继续处理。

## Agent 的工作原理

以这次使用的云端 Agent 为例，模型推理主要在云端完成。为了让 Agent 处理本地 PDF，它至少需要接收到任务相关的文件或文本；究竟上传哪些内容，则取决于客户端实现、Agent 权限和具体工作流。

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/04-agent-data-flow.png" alt="Agent 在本地电脑与云端模型之间传输数据的示意图" width="1448" height="1086" loading="lazy">
  <figcaption>Agent 工作时，本地文件、原始数据和模型返回结果可能在本地与云端之间流动。</figcaption>
</figure>

当权限控制、数据边界或供应链存在问题时，Agent 可能从“助手”变成“小偷”：它有能力读取、上传，甚至把原本只存在于本地的数据交给第三方处理。

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/05-agent-data-flow-risk.png" alt="数据被上传到云端并长期保存时的 Agent 风险示意图" width="1448" height="1086" loading="lazy">
  <figcaption>如果上传范围和保存时间不透明，Agent 的便利性就会转化为新的数据暴露面。</figcaption>
</figure>

9 月 18 日，开发者 Ferstar 通过逆向分析指出，智谱 ZCode 的闭源 Agent 存在工作区快照上传行为；随后智谱官方致歉，并解释称问题源于代码库索引功能（Ferstar, 2026; IT之家, 2026）。

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/06-zcode-official-response.png" alt="关于 ZCode 代码库上传争议的新闻报道截图" width="1522" height="984" loading="lazy">
  <figcaption>关于 ZCode 代码库索引和工作区数据上传争议的报道截图。</figcaption>
</figure>

这个事件让我觉得，安全边界不能只看“模型有没有训练用户数据”，还要继续追问：客户端读取了什么、上传了什么、谁能够解密、数据保存多久，以及用户是否真的拥有关闭这些功能的能力。

## 解决方案

Anthropic 在 6 月调整 Claude Fable 的数据政策后，Fable 默认要求保留 30 天数据，用于安全监测（Anthropic, 2026a）。这项变化引发了部分企业对 ZDR（Zero Data Retention，零数据留存）、知识产权和日志保存范围的担忧。

在 9 月 10 日威胁报告披露后的几天内，企业客户对 AI 数据边界的担忧也开始公开化。9 月 14 日，Reuters 援引 The Information 报道，NVIDIA、Palantir、Booz Allen 等公司已经开始限制 Anthropic 模型在敏感工作流中的使用（Reuters, 2026）。

按照数据敏感程度，可以采用不同的解决方案：

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/07-data-sensitivity-solutions.png" alt="按照数据敏感程度选择 SaaS、零数据留存、私有云或本地隔离环境" width="1536" height="1024" loading="lazy">
  <figcaption>按照数据敏感程度选择不同的 AI 使用方式：从普通 SaaS，到零数据留存、私有云和本地隔离环境。</figcaption>
</figure>

理想情况下，所有数据都可以在本地处理，不需要离开设备。哪怕云服务商提供合规审查和零数据留存保证，只要数据离开本地，就已经进入了新的信任边界，不能再按照本地处理的安全等级来对待。

因此，未来的重点可能会同时落在两个方向：更安全、高效的云端计算，以及足够高效的本地模型。

一个面向个人或小团队的本地 AI 示意组合可以是：

1. 以 Google Gemma 4 作为基础模型；
2. 使用 NVIDIA DGX Spark 作为小型 AI 工作站。

不过，这只是一个示意组合。真正的企业级部署还需要 IAM、网络隔离、审计、密钥管理、备份和终端安全。

## 结语

我这次真正观察到的，不是 Agent 一定会“偷”数据，而是：使用云端 Agent 后，文件的安全边界不再只在本地设备，而是扩展到了模型厂商、客户端、代理服务、插件和工具链。

Agent 越强，能够读取和操作的范围就越大；因此，权限最小化、数据分级和可验证的供应链透明度，也会变得越来越重要。

## 参考文献

<div class="apa-references">
<p>Anthropic. (2026a, June 9). <em>Claude Fable 5</em>. <a href="https://www.anthropic.com/claude/fable" target="_blank" rel="noopener">https://www.anthropic.com/claude/fable</a></p>
<p>Anthropic. (2026b, September 10). <em>Detecting and countering misuse of AI: September 2026</em>. <a href="https://www.anthropic.com/threat-intelligence-report-september-2026" target="_blank" rel="noopener">https://www.anthropic.com/threat-intelligence-report-september-2026</a></p>
<p>Ferstar. (2026, September 18). <em>扒一扒 ZCode 静默上传全量 Git 历史的骚操作</em> [Investigating ZCode’s silent upload of the full Git history]. <em>Code is cheap, let’s talk</em>. <a href="https://blog.ferstar.org/posts/zcode-silent-workspace-snapshot-upload/" target="_blank" rel="noopener">https://blog.ferstar.org/posts/zcode-silent-workspace-snapshot-upload/</a></p>
<p>IT之家. (2026, September 18). <em>智谱 ZCode 被质疑“偷传代码”：官方回应称问题已修复，将开源代码库、引入第三方审查</em> [Zhipu ZCode accused of “stealing code”: Official response says the issue has been fixed and the codebase will be open-sourced]. <em>IT之家</em>. <a href="https://www.ithome.com/1/004/310.htm" target="_blank" rel="noopener">https://www.ithome.com/1/004/310.htm</a></p>
<p>PDFMathTranslate. (n.d.). <em>PDFMathTranslate</em> [Computer software]. GitHub. <a href="https://github.com/PDFMathTranslate/PDFMathTranslate" target="_blank" rel="noopener">https://github.com/PDFMathTranslate/PDFMathTranslate</a></p>
<p>Reuters. (2026, September 14). <em>Palantir, Nvidia curb AI model use over data fears, The Information reports</em>. <em>Yahoo Finance</em>. <a href="https://finance.yahoo.com/technology/ai/articles/palantir-nvidia-curb-ai-model-151108619.html" target="_blank" rel="noopener">https://finance.yahoo.com/technology/ai/articles/palantir-nvidia-curb-ai-model-151108619.html</a></p>
</div>
