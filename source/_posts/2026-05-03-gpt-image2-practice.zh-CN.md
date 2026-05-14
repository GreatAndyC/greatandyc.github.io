---
title: GPT-image-2 文生图/图生图实践：斯德哥尔摩奖章、中国高校雪景与期末智华馆
date: "2026-05-03 21:17:48"
lang: zh-CN
slug: gpt-image2-practice
permalink: 2026/05/03/gpt-image2-practice/
description: 利用 GPT Image 2 模型进行文生图和图生图创意实践，展示逼真生成效果与操作套路。
photos:
  - /images/posts/post/gpt-image-2/gpt-image2-practice-17-2.png
tags:
  - AIGC
  - 高校
  - 文生图
  - 图生图
categories:
  - 教程
toc: false
updated: "2026-05-14 20:07:42"
---

![](/images/posts/post/gpt-image-2/gpt-image2-practice-17-2.png)

2026年4月21日，ChatGPT 更新了新的生图模型 ChatGPT Image 2.0。

在各大社交媒体上刷屏——只需简单指令，即可生成过去需要复杂操作才能制作的细腻且以假乱真的图像。这标志着在 AI 生图领域，OpenAI 重新占据主导地位。

以下是 ChatGPT 官网对 Image 2 的介绍：
<https://openai.com/zh-Hans-CN/index/introducing-chatgpt-images-2-0/#textmode>

> 图像不仅是装饰，更是一种语言。优秀的图像应如精辟的文字：它裁选素材、编排结构、揭示本质。它可以解释一种机制，营造一种氛围，测试一个创意，或是阐述一个论点。
> 
> 更高的精度与控制力：微小文字、图标系统、UI 元素、密集构图以及细微的风格约束，在 API 中分辨率最高可达 2K。
> 
> 更强大的多语言能力：新增“在中文、日语、韩语、印地语和孟加拉语中表现出色”。
> 
> 同时在风格表现和写实度上也更加出色。

简而言之：**无敌**。

## 图生图实践

笔者一直喜欢创作幻想题材图片。

![](/images/posts/post/gpt-image-2/gpt-image2-practice-13-2.jpg)
<p align="center"><em>制作于2018年1月13日生日推送，目前正在南洋做博后的🐷哥哥</em></p>

Image 2 一出，有如低山臭水遇知音、一拍即合如虎添翼。随即对这张图进行现代化优化——开启 GPT 的 Think 模式，传入 prompt：

> 用这个人脸生成一个在斯德哥尔摩拿诺贝尔奖的图片，要求西装革履，以假乱真，清晰正脸，颁奖为诺贝尔化学奖，所有信息符合真实世界诺奖颁奖设定。16:9，大师作品。

![](/images/posts/post/gpt-image-2/gpt-image2-practice-12-2.png)

接着生成与瑞典国王合影：

> 同一环境，超写实照片，这次是与瑞典国王合影，服装一致，焦距约20mm，透视和光影真实。

![](/images/posts/post/gpt-image-2/gpt-image2-practice-11.png)

除了极难察觉的光影或透视细节，简单结构化 prompt 已可达到以假乱真的效果。

## 文生图实践

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=5254815&auto=0&height=66"></iframe>

笔者一直在南方生活，对雪情有独钟，但实际见雪次数屈指可数，因此用 AI 生成美丽雪景。

结合中国各大高校主题，用文字生图测试效果。图片与文字见下（学校顺序依笔者偏好）。

![](/images/posts/post/gpt-image-2/gpt-image2-practice-01-2.jpg)

![](/images/posts/post/gpt-image-2/gpt-image2-practice-07-2.jpg)

![](/images/posts/post/gpt-image-2/gpt-image2-practice-03-2.jpg)

![](/images/posts/post/gpt-image-2/gpt-image2-practice-08-2.jpg)

![](/images/posts/post/gpt-image-2/gpt-image2-practice-05-2.jpg)

![](/images/posts/post/gpt-image-2/gpt-image2-practice-02-2.jpg)

![](/images/posts/post/gpt-image-2/gpt-image2-practice-06-2.jpg)

![](/images/posts/post/gpt-image-2/gpt-image2-practice-04-2.jpg)

![](/images/posts/post/gpt-image-2/gpt-image2-practice-10-2.jpg)

<p align="center"><em>笔者对南京大学并不了解，因此未安排场景，向致力于中国最好本科教育的南京大学致歉。</em></p>

[详细图片请查看画廊-AI绘图-雪中中国高校](/gallery/#gallery-aigc-university-cn)

## 图生图实践2：期末智华馆

笔者尝试用文生图回忆香港大学智华馆学习记忆，prompt 如下：

![](/images/posts/post/gpt-image-2/gpt-image2-practice-25.png)

但生成的图片并非真正的智华馆内景。

推测 Think 模式下文生图模型的工作流程：

识别 prompt 意图 → 联网搜索目标图片 → 调用模型资源生图 → 返回结果。

显然第二步识别“智华馆”内景时出问题。由于链路对用户是黑盒，手动解决：上传真实智华馆图片，让 GPT 在对话中记住。

![](/images/posts/post/gpt-image-2/gpt-image2-practice-09-2.jpg)
<p align="center"><em>笔者在智华馆熬夜赶作业的凌晨</em></p>

再将上述 prompt 发给 GPT：

> 生成一张真实的雪中香港大学照片，场景是智华馆凌晨，里面坐满人，站着的地方也站满人，至少三张桌子分别放着：吃剩的乱糟糟麦当劳外卖、带电饭煲煮饭的阿姨、缠绕在一起亲嘴的情侣、眼睛通红赶论文穿拖鞋的男子。

效果出色：

![](/images/posts/post/gpt-image-2/gpt-image2-practice-21-2.png)
<p align="center"><em>该图在某社交媒体获1万阅读量（此处应有掌声👏）</em></p>

总结简单生图实践套路：

传入带正面提示词、负面提示词（可选）、参考图片（可选）的 prompt，开启 GPT Think 模式生成目标图片。后续通过反复对话和编辑调整细节。

当然，GPT 内置敏感内容审查与水印，技术上可绕过，但违规成本通常大于收益，动手前请三思。
