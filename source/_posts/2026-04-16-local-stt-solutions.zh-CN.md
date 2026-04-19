---
title: STT 本地解决方案
date: 2026-04-16 14:00:00
lang: zh-CN
slug: local-stt-solutions
permalink: 2026/04/16/local-stt-solutions/
description: 汇总一套本地语音转文字方案的基本思路、工具选型与输出效果。
tags:
  - STT
  - Whisper
  - 语音识别
categories:
  - 教程
toc: true
---
# STT 本地解决方案

时间：2026.2.7
本地有一些视频文件需要进行语音转录，过去的方式是使用剪映的字幕识别功能，不过考虑到有高强度批量化使用，同时保证隐私并且低成本的方案，因此开始搜寻开源STT解决方案。

在和Gemini以及Kimi进行讨论之后，根据4060+i9的笔记本配置，选择的模型是openai的Whisper-large-v3-turbo开源模型
HuggingFace链接：https://huggingface.co/openai/whisper-large-v3-turbo
![alt text](/images/feishu-migration/local-stt-solutions/whisper_stt_local_speed_test.png)
随后发现有已经打包好的套壳开源GUI软件buzz
项目链接：https://github.com/chidiwilliams/buzz

在Release页面下载好exe和对应的bin文件之后就可以开始使用了，初次使用的时候下载模型需要一定时间
![alt text](/images/feishu-migration/local-stt-solutions/faster_whisper_config_panel.png)
速度和效果都挺好的，还可以支持粤语识别和实时录制
![alt text](/images/feishu-migration/local-stt-solutions/stt_result_srt_export.png)
由此实现了STT自由
