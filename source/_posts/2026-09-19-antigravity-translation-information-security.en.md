---
title: "Using Antigravity to Translate a Threat Report: Reflections on Agent Information Security"
date: 2026-09-19 20:00:00
lang: en
slug: antigravity-translation-information-security
permalink: en/2026/09/19/antigravity-translation-information-security/
description: A record of using Antigravity to translate an Anthropic threat report and reflect on the data boundaries of AI agents.
photos:
  - /images/posts/antigravity-translation-information-security/cover-agent-information-security.png
tags:
  - AI
  - Agent
  - Information Security
  - Privacy
  - Antigravity
categories:
  - AI
toc: true
---

**A PDF translation workflow made me rethink the data boundaries of cloud-based agents.**

<!-- more -->

> Translation note: This English version was translated by Codex (GPT-5) on 2026-09-19. The source text is the corresponding Chinese post in this repository.

## Using Antigravity to Translate a PDF

In mid-September, I saw news coverage of an Anthropic threat report that contained a large number of disturbing cases (Anthropic, 2026b). I wanted to read the original report. When possible, I would rather consult a primary source than rely only on someone else’s summary.

I found the PDF on Anthropic’s website and downloaded it locally:

[Detecting and countering misuse of AI: September 2026](https://www.anthropic.com/threat-intelligence-report-september-2026)

I then asked Antigravity to process the PDF and translate it.

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/01-antigravity-pdf-translation.png" alt="Splitting and translating Anthropic’s threat report in Antigravity" width="1866" height="1532" loading="eager">
  <figcaption>In Antigravity, the Agent splits the PDF and runs text recognition and translation tasks in parallel.</figcaption>
</figure>

I used concurrent subtasks to improve speed. However, if the model is capable enough, these prompts may be unnecessary: the model may be able to decide which approach is most efficient by itself.

I also asked the Agent to make a simple count of the report’s different case categories:

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/02-threat-report-distribution.en.png" alt="Page distribution across threat categories in Anthropic’s report" width="1296" height="1213" loading="lazy">
  <figcaption>Page distribution across different threat categories in Anthropic’s report.</figcaption>
</figure>

About a year ago, I would not have expected an Agent itself to complete this kind of work. Now, many of the functional boundaries of specialized translation tools are being compressed by general-purpose Agents.

I had previously tried [PDFMathTranslate](https://github.com/PDFMathTranslate/PDFMathTranslate). Its advantage is that it lets users choose different translation engines, but deployment and debugging are relatively cumbersome. These smaller capabilities can now also be implemented through a general-purpose Agent or a Codex sub-agent (PDFMathTranslate, n.d.).

Agents are flattening the “feature moats” of many specialized software products. In the future, the remaining moats may shift toward workflows, reliability, specialized data, compliance, user interfaces, and integrations.

## After the Threat Report

The report quickly led to discussions about cybersecurity. It also described how intermediaries, proxies, and other infrastructure can expand the reach of model use (Anthropic, 2026b).

This reminded me that information security is not only a question of cryptography or server configuration.

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/03-privacy-leak-example.png" alt="A still from the film Initial D" width="600" height="591" loading="lazy">
  <figcaption>A still from <em>Initial D</em> (2005). History contains many examples of private digital information leaks causing serious real-world consequences.</figcaption>
</figure>

The difference with an AI Agent is that its potential data access can be much broader than that of a traditional application. It does not merely wait for text input; it may also read files, call tools, execute commands, and send the results to a remote model for further processing.

## How an Agent Works

In the cloud-based workflow I used, the model’s inference mainly happens in the cloud. For an Agent to process a local PDF, it must receive at least the relevant files or text. Exactly what gets uploaded depends on the client implementation, the Agent’s permissions, and the workflow.

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/04-agent-data-flow.en.png" alt="Data moving between a local computer and a cloud model during Agent work" width="1448" height="1086" loading="lazy">
  <figcaption>During Agent work, local files, source data, and model results may move between the local computer and the cloud.</figcaption>
</figure>

When permissions, data boundaries, or the supply chain are poorly controlled, an Agent can shift from an “assistant” into a “thief”: it may read and upload data, and hand information that originally existed only on the local device to a third party.

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/05-agent-data-flow-risk.en.png" alt="An Agent risk diagram showing data uploaded to the cloud and stored for a long time" width="1448" height="1086" loading="lazy">
  <figcaption>When upload scope and retention time are opaque, an Agent’s convenience becomes a new data exposure surface.</figcaption>
</figure>

On September 18, developer Ferstar reported through reverse engineering that Zhipu’s closed-source ZCode Agent uploaded workspace snapshots. Zhipu later apologized and explained that the issue came from its repository indexing feature (Ferstar, 2026; IT之家, 2026).

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/06-zcode-official-response.png" alt="A news report screenshot about the ZCode repository upload controversy" width="1522" height="984" loading="lazy">
  <figcaption>A report about ZCode’s repository indexing and workspace data upload controversy.</figcaption>
</figure>

The incident made me think that security boundaries cannot be evaluated only by asking whether a model trains on user data. We also need to ask: What did the client read? What did it upload? Who can decrypt it? How long is it stored? Can users actually disable the feature?

## Possible Solutions

In June, Anthropic changed the data policy for Claude Fable. Fable now requires 30-day data retention by default for safety monitoring (Anthropic, 2026a). This change prompted some enterprise customers to question zero data retention (ZDR), intellectual property, and the scope of log retention.

Within days of the threat report’s publication on September 10, concerns from enterprise customers about AI data boundaries also became public. On September 14, Reuters, citing The Information, reported that NVIDIA, Palantir, Booz Allen, and other companies had begun restricting Anthropic models in sensitive workflows (Reuters, 2026).

Different solutions can be selected according to data sensitivity:

<figure class="post-figure">
  <img src="/images/posts/antigravity-translation-information-security/07-data-sensitivity-solutions.en.png" alt="Choosing SaaS, zero-data-retention, private-cloud, or isolated local environments according to data sensitivity" width="1536" height="1024" loading="lazy">
  <figcaption>Choosing an AI deployment model according to data sensitivity: from ordinary SaaS to zero data retention, private cloud, and isolated local environments.</figcaption>
</figure>

Ideally, all data could be processed locally and never leave the device. Even when a cloud provider offers compliance reviews and zero-data-retention guarantees, data that leaves the local device has entered a new trust boundary and cannot be treated as having the same security level as local processing.

The future will therefore likely focus on both safer, more efficient cloud computing and local models that are capable enough for demanding work.

One illustrative local AI setup for an individual or small team could be:

1. Use Google Gemma 4 as the base model;
2. Use NVIDIA DGX Spark as a small AI workstation.

This is only an illustrative combination. A real enterprise deployment would also need IAM, network isolation, auditing, key management, backups, and endpoint security.

## Conclusion

What I really observed was not that Agents will necessarily “steal” data. It was that using a cloud-based Agent moves the security boundary beyond the local device and into the model provider, client, proxy service, plugins, and toolchain.

The more capable an Agent becomes, the more it can read and operate on. Least privilege, data classification, and verifiable supply-chain transparency will therefore become increasingly important.

## References

<div class="apa-references">
<p>Anthropic. (2026a, June 9). <em>Claude Fable 5</em>. <a href="https://www.anthropic.com/claude/fable" target="_blank" rel="noopener">https://www.anthropic.com/claude/fable</a></p>
<p>Anthropic. (2026b, September 10). <em>Detecting and countering misuse of AI: September 2026</em>. <a href="https://www.anthropic.com/threat-intelligence-report-september-2026" target="_blank" rel="noopener">https://www.anthropic.com/threat-intelligence-report-september-2026</a></p>
<p>Ferstar. (2026, September 18). <em>扒一扒 ZCode 静默上传全量 Git 历史的骚操作</em> [Investigating ZCode’s silent upload of the full Git history]. <em>Code is cheap, let’s talk</em>. <a href="https://blog.ferstar.org/posts/zcode-silent-workspace-snapshot-upload/" target="_blank" rel="noopener">https://blog.ferstar.org/posts/zcode-silent-workspace-snapshot-upload/</a></p>
<p>IT之家. (2026, September 18). <em>智谱 ZCode 被质疑“偷传代码”：官方回应称问题已修复，将开源代码库、引入第三方审查</em> [Zhipu ZCode accused of “stealing code”: Official response says the issue has been fixed and the codebase will be open-sourced]. <em>IT之家</em>. <a href="https://www.ithome.com/1/004/310.htm" target="_blank" rel="noopener">https://www.ithome.com/1/004/310.htm</a></p>
<p>PDFMathTranslate. (n.d.). <em>PDFMathTranslate</em> [Computer software]. GitHub. <a href="https://github.com/PDFMathTranslate/PDFMathTranslate" target="_blank" rel="noopener">https://github.com/PDFMathTranslate/PDFMathTranslate</a></p>
<p>Reuters. (2026, September 14). <em>Palantir, Nvidia curb AI model use over data fears, The Information reports</em>. <em>Yahoo Finance</em>. <a href="https://finance.yahoo.com/technology/ai/articles/palantir-nvidia-curb-ai-model-151108619.html" target="_blank" rel="noopener">https://finance.yahoo.com/technology/ai/articles/palantir-nvidia-curb-ai-model-151108619.html</a></p>
</div>
