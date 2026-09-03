---
title: "Building an iOS App from Zero to One (Part 3): My First Hello World iOS App"
date: 2026-04-23 20:39:00
lang: en
slug: ios-app-from-zero-vol3
permalink: en/2026/04/23/ios-app-from-zero-vol3/
description: Create and run your first iOS app with Xcode, from developer enrollment to AI-assisted debugging.
photos:
  - /images/posts/2026-04-23-ios-app-from-zero-vol3/0-1-ios-cover.png
tags:
  - iOS
  - AI
  - Indie Development
categories:
  - Tutorial
toc: true
---

## Preface

In the first two articles, I covered why to build iOS apps and how to prepare your model/tooling stack. In this part, we build the first real iOS app that runs on your own device.

## Prerequisites

1. Download Xcode on your Mac.
2. Prepare an Apple Developer account.

### Enroll in Apple Developer Program

> https://developer.apple.com/cn/programs/enroll/

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/apple-developer-enrollment-page.png" alt="">
  <figcaption>Apple Developer enrollment page</figcaption>
</figure>

Click to start enrollment.

For an individual account, you generally need:

1. An Apple account with 2FA enabled.
2. Legal age in your region.
3. Valid email, phone, and address (no PO Box).

Fill in your real personal information.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/apple-developer-personal-info.png" alt="">
  <figcaption>Fill in personal information</figcaption>
</figure>

Choose `Entity Type` as `Individual`.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/apple-developer-entity-type.png" alt="">
  <figcaption>Select account type</figcaption>
</figure>

Accept the agreement.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/apple-developer-terms-agreement.png" alt="">
  <figcaption>Accept terms and conditions</figcaption>
</figure>

Then pay the fee and wait for approval.

If needed, use the "Contact Us" section for support.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/apple-developer-contact-support.png" alt="">
  <figcaption>Contact support</figcaption>
</figure>

> Support is usually handled by email. If you are not sure how to write it, draft it first and let AI polish it into formal wording.

## Download Xcode

Search for Xcode in the Mac App Store and download it.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/app-store-xcode-download.png" alt="">
  <figcaption>Download Xcode from App Store</figcaption>
</figure>

Wait for installation to finish.

## Understand Xcode

Xcode is Apple’s official IDE (Integrated Development Environment). It is used to compile, debug, package, sign, and release iOS apps.

> If you use AI heavily, you may spend less time editing directly in Xcode and more time discussing requirements and implementation details with AI.

Xcode and Android Studio are similar in role: at the end of the day, you still need an IDE to compile/sign/package and release apps.

## Create a New Project

Open Xcode and click `Create a new Xcode project`.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/xcode-create-project.png" alt="">
  <figcaption>Create a project in Xcode</figcaption>
</figure>

Choose the `App` template, then click `Next`.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/xcode-app-template.png" alt="">
  <figcaption>Choose the App template</figcaption>
</figure>

Fill in project info:

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/xcode-project-info-config.png" alt="">
  <figcaption>Xcode project configuration</figcaption>
</figure>

- Product Name: `HelloIOS` (any name, can be changed later)
- Team: your developer account
- Organization Identifier: `com.yourname` (example: `com.andy`)
- Interface: `SwiftUI`
- Language: `Swift`
- Testing System: default (`Swift Testing with XCTest UI Tests`)
- Storage: `SwiftData`
- Host in CloudKit: do not enable for now (avoid iCloud sync complexity)

Click `Next`, choose where to save it, then click `Create`.

Now you have a project.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/xcode-project-structure.png" alt="">
  <figcaption>Xcode project structure</figcaption>
</figure>

Left side: files. Middle: editor. Right side: simulator/device preview area.

Choose device or simulator, then hit Run (`Command + R`). I ran directly on my real iPhone. (For first-time connection you need cable, developer mode, and signing trust steps. These details are tedious but manageable. Screenshot errors and ask AI when needed, and stay patient.)

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/xcode-device-selector.png" alt="">
  <figcaption>Device selector</figcaption>
</figure>

Then came a huge `Build Failed` and a wall of red errors.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/xcode-build-failed.png" alt="">
  <figcaption>Build failed</figcaption>
</figure>

That is where debugging starts.

> You may ask: what if I do not know programming and cannot write SwiftUI at all?

That is okay. I could not write a single line of SwiftUI either, and still got my first iOS app running.

> It is not because I suddenly became a stronger programmer. The workflow changed. A lot of repetitive app-layer work can now be delegated to AI. Only low-level, highly specific, or very large/complex cases still require heavy manual coding.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/generation-changed.png" alt="">
  <figcaption>The era has changed</figcaption>
</figure>

At this stage, one option is to copy all error messages to web AI tools (Gemini, GPT, etc.) and fix them one by one.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/ai-copy-error-message.png" alt="">
  <figcaption>Copy errors to AI</figcaption>
</figure>

<!-- more -->

> Translation note: This English version was translated by Codex (GPT-5) on 2026-04-24 00:08:00 CST. The source text is the corresponding Chinese post in this repository.

Ready to jump in and start?

> One more thing: modern AI tools now have agentic capability. They can analyze and modify code directly, so you no longer need to manually copy and paste every error.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/martial-arts-secret-meme.png" alt="">
  <figcaption>“To master the skill, first remove distractions.” But read a few more pages first.</figcaption>
</figure>

Tool choices include:

### Tool Categories

#### CLI tools

- Claude Code
- CodeX

#### Editor plugins in VSCode-like editors (Cline, Kilo Code, etc.)

- Cursor
- Antigravity
- VSCode

#### Agent apps

- CodeX App
- Claude App

Pick based on your workflow.

## AI-Assisted Development with Cline

I use Antigravity + Cline as an example here (same idea in VSCode).

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/vscode-cline-plugin.png" alt="">
  <figcaption>VSCode Cline plugin</figcaption>
</figure>

1. Install Cline from the extension marketplace.
2. Configure your API key in Cline settings.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/cline-api-key-config.png" alt="">
  <figcaption>Cline API key setup</figcaption>
</figure>

> I used a Minimax Token Plan for this run.
>
> Official guide: [MiniMax quick-start documentation](https://platform.minimaxi.com/docs/token-plan/quickstart)
>
> Invite link (10% off): https://platform.minimaxi.com/subscribe/token-plan?code=H5mFhfRxqH&source=link
(Not an ad. I may switch providers later. This is only used as a practical example because I still had quota.)

After setup, open your project folder in the editor, launch Cline, and ask the agent to read the project first.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/cline-open-project.png" alt="">
  <figcaption>Open project in Cline</figcaption>
</figure>

Then ask for specific tasks. Break your request into small, focused steps instead of asking AI to solve everything at once.

### Good prompt examples

- My project fails to run. Help me identify the root cause: `xxxxxxxx`.
- I want to add a feature. What implementation options do I have for this expected behavior: `xxxxx`?

### Bad prompt example

- Turn this project into a global Alipay clone with instant settlement and multi-currency payout.

Then wait for the agent to execute. Cline’s strength and weakness are both in its real-time visible actions.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/cline-realtime-operations.png" alt="">
  <figcaption>Cline real-time operations</figcaption>
</figure>

After the agent finishes and reports all fixes done, return to Xcode and build again.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/cline-bugs-fixed.png" alt="">
  <figcaption>Bugs fixed by the agent</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/xcode-build-success.png" alt="">
  <figcaption>Build succeeded</figcaption>
</figure>

If everything is connected correctly, your device will show an install animation and then finish app installation.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/ios-app-download-complete.jpeg" alt="">
  <figcaption>App installed</figcaption>
</figure>

Open the app, and it runs.

<figure class="post-figure">
  <img src="/images/posts/2026-04-23-ios-app-from-zero-vol3/ios-app-running-success.jpeg" alt="">
  <figcaption>App running successfully</figcaption>
</figure>

Congratulations. You built your first iOS app.

## Epilogue

This program is simple and not very useful by itself, but it marks the most important first milestone in iOS development: running your own app on your own device.

After this step, you now understand:

- how to enroll as a developer
- how Xcode project creation and structure work
- the compile-run-debug loop
- how to use AI tools to modify code
- basic setup of a practical development environment

This is the moment you move from a consumer role to a creator role.

> “Hello World” is often the first output most programmers ever write.
>
> When I first printed `Hello World` in Python years ago, I did not feel that “amazing” moment from textbooks. I just thought: “That is it?”
>
> Maybe because I used PCs all the time, printing one line did not feel special. But getting my first app running on my own device did feel genuinely amazing.

That reminds me of Douglas Adams’s Three Rules of Technology.

**Douglas Adams’s Three Rules of Technology**

> 1. Anything that is in the world when you are born is normal and ordinary and is just a natural part of the way the world works.
> 2. Anything invented between when you are 15 and 35 is new and exciting and revolutionary and you can probably get a career in it.
> 3. Anything invented after you are 35 is against the natural order of things.

In the future, people may treat the GPT era as if it had always existed. But for those living through it right now, this is an exciting transition period that connects old and new. Keep learning and stay open.
