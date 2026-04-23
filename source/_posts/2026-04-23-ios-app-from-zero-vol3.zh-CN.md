---
title: 从 0 到 1 上架一款 iOS 应用（三）：第一个 Hello World iOS APP
date: 2026-04-23 20:39:00
lang: zh-CN
slug: ios-app-from-zero-vol3
permalink: 2026/04/23/ios-app-from-zero-vol3/
description: 通过 Xcode 创建并运行第一个 iOS App，掌握开发者账号注册和 AI 辅助开发流程。
photos:
  - /images/2026-04-23-ios-app-from-zero-vol3/0-1-ios-cover.png
tags:
  - iOS
  - AI
  - 独立开发
categories:
  - 教程
toc: true
---

## 前言

在前两篇，已经介绍了开发 iOS App 的原因和模型准备，本篇将介绍如何在自己的手机上开发出第一个 iOS App。

## 前提准备

1. Mac 上下载 Xcode 软件
2. 准备一个苹果开发者账号

### 成为苹果开发者

> https://developer.apple.com/cn/programs/enroll/

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/apple-developer-enrollment-page.png" alt="">
  <figcaption>苹果开发者注册页面</figcaption>
</figure>

点击开始注册。

个人身份注册需要满足条件为：

1. 开启了 2FA 的 Apple 账户
2. 达到地区的法定年龄
3. 电子邮件、电话和地址：不接受邮政信箱

填写真实有效的个人信息。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/apple-developer-personal-info.png" alt="">
  <figcaption>填写个人信息</figcaption>
</figure>

选择 Entity Type 为 Individual。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/apple-developer-entity-type.png" alt="">
  <figcaption>选择账户类型</figcaption>
</figure>

同意条款。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/apple-developer-terms-agreement.png" alt="">
  <figcaption>同意条款</figcaption>
</figure>

后续就是支付费用等待通过了。

任何问题都可以在「联系我们」处获取支持。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/apple-developer-contact-support.png" alt="">
  <figcaption>联系支持</figcaption>
</figure>

> 一般是通过邮件的方式和客服联系，如果不懂怎么写，可以自己写一份草稿，然后让 AI 帮你改成合适的书面语再发送。

## 下载 Xcode

在 Mac 的 App Store 中搜索 Xcode，点击下载。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/app-store-xcode-download.png" alt="">
  <figcaption>App Store 下载 Xcode</figcaption>
</figure>

等待安装完成。

## 了解 Xcode

Xcode 是苹果官方推出的 IDE（集成开发环境），主要作用是对 iOS App 进行编译、调试、打包、签名发布。

> 实际上主力用 AI 开发的话，在 Xcode 中进行编辑的时间并不会很多，大部分时间都是和 AI 进行讨论需求和开发细节。

不管是 Xcode 还是 Android Studio 都是类似的，最终都是通过这些 IDE 来编译打包 App，然后进行签名发布。

## 新建项目

打开 Xcode，点击「Create a new Xcode project」。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/xcode-create-project.png" alt="">
  <figcaption>Xcode 创建项目</figcaption>
</figure>

选择「App」模板，然后点击「Next」。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/xcode-app-template.png" alt="">
  <figcaption>Xcode 选择 App 模板</figcaption>
</figure>

填写项目信息：

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/xcode-project-info-config.png" alt="">
  <figcaption>Xcode 项目配置</figcaption>
</figure>

- Product Name：HelloIOS（随便填，后面可以改）
- Team：选择你刚刚注册的开发者账号
- Organization Identifier：com.yourname（例如：com.andy）
- Interface：SwiftUI
- Language：Swift
- Testing System：默认即可（Swift Testing with XCTest UI Tests）
- Storage：SwiftData
- Host in CloudKit：❌ 不要勾选，涉及到 iCloud 同步问题

点击「Next」，选择保存项目的路径，然后点击「Create」，在本地硬盘创建一个文件夹。

现在就有一个项目文件啦。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/xcode-project-structure.png" alt="">
  <figcaption>Xcode 项目结构</figcaption>
</figure>

左边是文件目录，中间是代码编辑区，右边是模拟运行区。

这里可以点击选择在真机还是模拟器上运行我们的 App，点击右上角的运行按钮（Command+R）即可。我这里直接选择了我的真机进行运行。（初次连接需要插数据线并且开启设备的开发者选项，同时做签名确认，这些比较琐碎的问题都可以截图问 AI，重点是要足够耐心）

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/xcode-device-selector.png" alt="">
  <figcaption>设备选择器</figcaption>
</figure>

弹出一个巨大的 Build Failed 以及左边全红的报错（如果是股市就好了呢）。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/xcode-build-failed.png" alt="">
  <figcaption>构建失败</figcaption>
</figure>

那么就到 Debug 步骤了（修复程序中的错误）。

> 这时候就有读者要问了，我完全不懂编程不会写 SwiftUI 咋办啊？

没关系，我也一行 SwiftUI 都不会写，但我依然跑出了第一个 iOS App。

> 这不是因为我变强了，而是开发方式变了。大部分简单重复的应用层面上的工作，都可以交给 AI 完成，只有一些非常底层和细节或者逻辑性要求很强/项目文件过大等特殊情况，才需要我们自己上手「古法编程」。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/generation-changed.png" alt="">
  <figcaption>时代变了</figcaption>
</figure>

这时候可以选择：把报错信息全部一起复制给网页端的 AI 工具，例如 Gemini、GPT，帮你一个个 Debug，你要做的，就是充当一个人肉复制机器，事实上笔者在开始探索的时候也是这么做的。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/ai-copy-error-message.png" alt="">
  <figcaption>复制错误信息给 AI</figcaption>
</figure>

这时候你是不是跃跃欲试想要直接开始上手干了？

> 且慢，随着时间的进行，现在的 AI 工具已经具备了 Agentic 的能力，能自主进行分析和修改代码，所以你可以直接在其他 AI 工具里面打开项目，用 Agent 插件实现自动 Debug，所以这种人肉复制的工作也不需要了。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/martial-arts-secret-meme.png" alt="">
  <figcaption>葵花宝典第一页：欲练神功，必先自宫。不过下刀之前，多翻两页，说不定是「预练神功，亦可不必自宫」</figcaption>
</figure>

具体实现工具选择包括：

### 开发工具分类

#### CLI 工具

- Claude Code
- CodeX

#### VSCode 内核编辑器中的插件（Cline、Koli code等）

- Cursor
- Antigravity
- VSCode

#### Agent 应用

- CodeX APP
- Claude APP

根据实际情况，任君挑选。

## 使用 Cline 进行 AI 辅助开发

这里以笔者常用的 Antigravity + Cline 为例进行编辑（VSCode 一样）。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/vscode-cline-plugin.png" alt="">
  <figcaption>VSCode Cline 插件</figcaption>
</figure>

1. 先在插件中搜索下载 Cline
2. 在 Cline 设置页面配置好 API Key

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/cline-api-key-config.png" alt="">
  <figcaption>Cline API Key 配置</figcaption>
</figure>

> 笔者选择的是经济实惠的 Minimax Token Plan。
>
> 具体教程可参考 Minimax 官方文档：https://platform.minimaxi.com/docs/token-plan/cline#cline
>
> 笔者的邀请链接可享 9 折优惠：https://platform.minimaxi.com/subscribe/token-plan?code=H5mFhfRxqH&source=link
（非广，笔者也在考虑随时跳车，只是作为教程，刚好有 Quota 没用完，所以用来举例子）

配置好后，在编辑器中打开项目文件夹，然后点击 Cline，和 Agent 互动，让 AI 先读一下这个项目。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/cline-open-project.png" alt="">
  <figcaption>Cline 打开项目</figcaption>
</figure>

接着可以继续提出你的需求，让 AI 自动帮你修改代码。不过原则是尽量拆解成细分的小任务，而不是让 AI 一次性帮你完成所有问题的修改。

#### 好的提问示例

- 我现在这个项目运行报错了，你帮我看看问题出在哪「xxxxxxxx」
- 如果我要新增一个功能，我怎么选择方法，我需要具体达到的效果是「xxxxx」

#### 差的提问示例

- 帮我把这个项目改成全球可用的支付宝，可以支持全球货币转换和提现秒到账。

接着就是等待 Agent 自动帮你完成任务了，Cline 的优点和缺点都是会实时显示操作。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/cline-realtime-operations.png" alt="">
  <figcaption>Cline 实时操作</figcaption>
</figure>

等待 Agent 帮你修改完成，输出显示所有的 Bug 都已经完成修复了。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/cline-bugs-fixed.png" alt="">
  <figcaption>Bug 修复完成</figcaption>
</figure>

回到 Xcode，再次运行 Build 命令。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/xcode-build-success.png" alt="">
  <figcaption>构建成功</figcaption>
</figure>

如果一切连接顺利，一个没有图标的 iOS App 就会在你的设备上显示出类似下载的动画，直至完成。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/ios-app-download-complete.jpeg" alt="">
  <figcaption>App 下载完成</figcaption>
</figure>

打开这个 iOS App，运行成功。

<figure class="post-figure">
  <img src="/images/2026-04-23-ios-app-from-zero-vol3/ios-app-running-success.jpeg" alt="">
  <figcaption>App 运行成功</figcaption>
</figure>

恭喜你 🎉 完成了你的第一个 iOS App 的开发。

## 后记

虽然这个程序并没有什么实际用处，但这标志着你已经完成了 iOS App 开发最重要的一步，就是能够把自己开发的程序在设备上运行了。

经过这一个步骤，你掌握了：

- 创建开发者账号的一般方法
- Xcode 的创建项目和工程目录结构
- 代码的编译运行和 Debug 流程
- 如何调用 AI 工具修改代码
- 开发环境的基本使用

这意味着，你从消费者的角色正式成为了一个创造者。

> 关于 Hello World，其实是大多数程序员输出的第一行代码。
>
> 笔者在最初学习 Python 的时候，在终端上打印出 Hello World 的时候并没有书上说的那种「Amazing」的感觉，反而是觉得「就这？」
>
> 可能的原因大概是，笔者当时经常使用 PC，对打印出一行字并没有觉得很神奇，但是在自己设备上运行出第一个应用，真的让笔者有了那么一些的「Amazing」的感觉。

这不由得让我想起了道格拉斯·亚当斯科技三定律。

### 道格拉斯·亚当斯科技三定律

> 道格拉斯·亚当斯科技三定律（Douglas Adams's Three Rules of Technology）
>
> 1. 你出生时已经存在的技术，是世界本来就该有的样子。
> 2. 你 15 到 35 岁之间出现的技术，是令人兴奋的革命，可以去投身其中。
> 3. 你 35 岁之后才出现的技术，都是违背自然规律的胡来。

可能在未来的人类，会把 GPT 的时刻当作世界本来就有的样子，但是身处时代当中的我们应该意识到，这是一个激动人心的革命，承前启后，推动创新，需要不断学习和保持开放的心态。