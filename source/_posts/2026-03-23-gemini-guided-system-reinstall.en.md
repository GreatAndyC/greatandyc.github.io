---
title: "A Cyber Cleanup: Reinstalling an Old Laptop into an AI Agent Machine with Gemini"
date: 2026-03-23 15:00:00
lang: en
slug: gemini-guided-system-reinstall
permalink: en/2026/03/23/gemini-guided-system-reinstall/
description: A full record of reinstalling and repurposing an old laptop with Gemini’s help.
photos:
  - /images/posts/feishu-migration/gemini-guided-system-reinstall/system_clean_project_cover.png
tags:
  - Gemini
  - System Reinstall
  - AI
categories:
  - Tutorial
toc: true
---
> Translation note: This English version was translated by Codex (GPT-5) on 2026-04-20 18:01:46 CST. The source text is the corresponding Chinese post in this repository.

## Background

OpenClaw had just gone viral, and I had experimented with it on a MacBook. But given the security concerns, token cost, and limited production readiness, I stopped there.

When I later cleaned up my room, I found an old laptop from my undergraduate days collecting dust. During a conversation with Gemini, I started thinking about turning it into a lightweight engineering machine or server.

This machine is only meant for lightweight or experimental AI tasks. If you need heavy development, you will need better hardware.

The goal was simple: keep no private files, install the lightest practical system, and dedicate the machine to AI coding execution.

Why not buy a server?

1. Save money
2. Reuse old hardware
3. Keep it fully private
4. Learn by rebuilding

## Preparation

- A stable internet connection
- An 8GB+ USB drive
- A large backup disk

Useful software:

- Gemini / Doubao / Qwen web apps
- Snipaste
- Antigravity or VS Code + Cline
- Motrix
- Rufus
- Clash Verge
- LocalSend
- Chrome

## The Process

### Cleaning up files

I first cleaned up the machine’s files. Using Gemini, I exported a Markdown-style hardware profile and checked how long it had been since the last reboot: 248 days. The machine was full of fragments and leftover software, which helped explain why it felt sluggish.

I then used Task Manager and the installed-apps list, took screenshots with Snipaste, and asked Gemini to explain each process and app, and to generate an uninstall list. This uncovered a lot of vendor software, leftover packages, and resource-hungry preinstalls.

### Downloading the system image

After discussing my requirements with Gemini, I chose Windows 10 Enterprise LTSC 2021 over Ubuntu 24.04 because of software compatibility and ecosystem support.

I downloaded the ISO via BT from next.itellyou.cn and used Motrix for P2P transfer.

### Making a bootable USB

I opened Rufus, selected the ISO, verified its hash, and then wrote it to a USB drive.

### Reinstalling the system

After one final backup check, I asked AI to generate a Markdown SOP for the reinstall process and carried it to another device for reference.

I used the BIOS settings to boot from USB and then installed Windows LTSC. SSDs did not need partitioning, while mechanical drives were partitioned normally.

After installation, I let Windows Update patch the system, which took about 30–60 minutes.

### Installing the base tools

I installed:

- 7-Zip
- Windows Update Blocker
- Defender Control
- Clash Verge
- ToDesk

Then it was time to configure OpenClaw / Claude Code / other AI tools.

## Epilogue

As of 2026-03-23, I checked memory prices from two years earlier and found that they had surged from 900 RMB to 2,400 RMB. That is a good reminder of how much AI is changing hardware demand.

More and more document-heavy and decision-heavy jobs are being reshaped by agents. Whether AI is a bubble or a real transformation, the safe answer is still the same: keep up with the wave, or get left behind.
