---
title: Trying to Control an Android Phone with an Agent (I)
date: 2026-09-07 10:58:19
lang: en
slug: agent-control-android-phone
permalink: en/2026/09/07/agent-control-android-phone/
description: Exploring Android phone automation with USB debugging and scrcpy.
photos:
  - /images/posts/agent-control-android-phone/01-usb-connection.png
tags:
  - Agent
  - Android
  - Automation
  - scrcpy
categories:
  - AI
toc: true
---

**Exploring Agent control of an Android phone, starting with USB debugging and `scrcpy`.**

<!-- more -->

> Translation note: This English version was translated by Codex on 2026-09-07. The source text is the corresponding Chinese post in this repository.

## Why try to control a phone?

I have recently been trying to automate phone control so that I can build an automated customer-service workflow for applications with mobile-only entry points, such as Xianyu.

## Connect the phone to a Mac

First, connect the Android phone to the Mac with a data cable.

<figure class="post-figure">
  <img src="/images/posts/agent-control-android-phone/01-usb-connection.png" alt="" width="1634" height="1222" loading="lazy">
  <figcaption>An Android phone connected to a Mac with a data cable.</figcaption>
</figure>

Then enable USB debugging on the phone and confirm that it is connected to the computer. If the phone displays a USB debugging authorization prompt, allow this computer to debug the device.

<figure class="post-figure">
  <img src="/images/posts/agent-control-android-phone/02-usb-debugging-permission.jpg" alt="" width="1053" height="751" loading="lazy">
  <figcaption>The Android USB debugging authorization prompt.</figcaption>
</figure>

## Use `scrcpy` to create a phone mirror

Next, connect the phone and computer through `scrcpy`. Once the connection succeeds, an interactive phone mirror appears on the Mac.

<figure class="post-figure">
  <img src="/images/posts/agent-control-android-phone/03-scrcpy-mirror.png" alt="" width="1826" height="1578" loading="lazy">
  <figcaption>An Android phone displayed on a Mac through <code>scrcpy</code>.</figcaption>
</figure>

## What this makes possible

Actions performed on the Mac mirror are synchronized with the phone. This simple setup provides an initial mapping for several capabilities:

- **Screen access:** observe the phone through the mirror and capture screenshots as visual input.
- **Keyboard input:** map input from the Mac to the phone.
- **Text entry:** enter customer-service messages in mobile applications.

## Next step

For now, this is only a minimal connection method. I still need to investigate how to establish reliable, high-speed data transfer between a mobile device and a laptop, and how to make an Agent observe, enter text, and operate the phone more reliably on top of that connection.
