---
title: 尝试使用 Agent 控制 Android 手机（一）
date: 2026-09-07 10:58:19
lang: zh-CN
slug: agent-control-android-phone
permalink: 2026/09/07/agent-control-android-phone/
description: 从 USB 调试与 scrcpy 开始探索 Agent 控制 Android 手机。
photos:
  - /images/posts/agent-control-android-phone/01-usb-connection.png
tags:
  - Agent
  - Android
  - 自动化
  - scrcpy
categories:
  - AI
toc: true
---

**从 USB 调试与 `scrcpy` 开始探索 Agent 控制 Android 手机。**

<!-- more -->

## 为什么要尝试控制手机

最近在尝试自动化控制手机，为一些只有移动端入口的应用（例如闲鱼）实现自动客服功能。

## 先把手机连接到 Mac

首先用数据线连接 Android 手机与 Mac。

<figure class="post-figure">
  <img src="/images/posts/agent-control-android-phone/01-usb-connection.png" alt="" width="1634" height="1222" loading="lazy">
  <figcaption>Android 手机通过数据线连接 Mac。</figcaption>
</figure>

然后在手机上开启 USB 调试，并确认手机已经与电脑建立连接。如果手机弹出 USB 调试授权提示，需要确认允许这台电脑进行调试。

<figure class="post-figure">
  <img src="/images/posts/agent-control-android-phone/02-usb-debugging-permission.jpg" alt="" width="1053" height="751" loading="lazy">
  <figcaption>Android 手机上的 USB 调试授权提示。</figcaption>
</figure>

## 使用 `scrcpy` 建立手机镜像

接着通过 `scrcpy` 连接手机和电脑。连接成功后，Mac 上会出现一个可操作的手机镜像。

<figure class="post-figure">
  <img src="/images/posts/agent-control-android-phone/03-scrcpy-mirror.png" alt="" width="1826" height="1578" loading="lazy">
  <figcaption>通过 <code>scrcpy</code> 在 Mac 上显示 Android 手机画面。</figcaption>
</figure>

## 当前能做什么

现在操作 Mac 上的镜像会同步操作手机。用这种最简单的方式，已经可以先建立几类能力的映射：

- <strong>画面获取：</strong>通过镜像观察手机画面，并以截图的方式获取画面信息。
- <strong>输入法操作：</strong>把 Mac 侧的输入操作映射到手机。
- <strong>文字输入：</strong>在手机应用中完成客服等场景需要的文字录入。

## 下一步

这套方案目前只是一个最小的连接方式。如何在移动设备和笔记本之间建立可靠、高速的数据传输，以及如何在此基础上让 Agent 更稳定地完成观察、输入和操作，还需要后续研究。
