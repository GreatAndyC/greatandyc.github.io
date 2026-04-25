---
title: Local STT Solutions
date: 2026-02-07 14:00:00
lang: en
slug: local-stt-solutions
permalink: en/2026/02/07/local-stt-solutions/
description: A practical look at local speech-to-text options, tool selection, and output quality.
photos:
  - /images/posts/feishu-migration/local-stt-solutions/stt-solution-cover.png
tags:
  - STT
  - Whisper
  - Speech Recognition
categories:
  - Tutorial
toc: true
---
> Translation note: This English version was translated by Codex (GPT-5) on 2026-04-20 18:01:46 CST. The source text is the corresponding Chinese post in this repository.

Date: 2026-02-07

I had a batch of local video files that needed transcription. I had previously used CapCut’s subtitle recognition, but for heavier batch use, better privacy, and lower cost, I started looking for open-source STT solutions.

After discussing the options with Gemini and Kimi, I chose OpenAI’s Whisper-large-v3-turbo model for a laptop with an RTX 4060 and an i9 CPU.

Hugging Face link: <https://huggingface.co/openai/whisper-large-v3-turbo>

<figure class="post-figure">
  <img src="/images/posts/feishu-migration/local-stt-solutions/whisper_stt_local_speed_test.png" alt="">
  <figcaption>Whisper local transcription speed test</figcaption>
</figure>

I then found an open-source GUI wrapper called Buzz.

Project link: <https://github.com/chidiwilliams/buzz>

After downloading the Windows executable and the corresponding bin files, the tool was ready to use. The first launch takes a while because the model needs to be downloaded.

<figure class="post-figure">
  <img src="/images/posts/feishu-migration/local-stt-solutions/faster_whisper_config_panel.png" alt="">
  <figcaption>Buzz configuration panel</figcaption>
</figure>

The speed and transcription quality were both good, and it also supports Cantonese recognition and live recording.

<figure class="post-figure">
  <img src="/images/posts/feishu-migration/local-stt-solutions/stt_result_srt_export.png" alt="">
  <figcaption>Subtitle export result</figcaption>
</figure>

That was enough to get “STT freedom.”
