---
title: Trying out Manus to download Stanford CS146s locally
date: "2026-05-15 19:33:19"
lang: en
slug: manus
permalink: en/2026/05/15/manus/
description: A hands-on trial of Manus for downloading course materials and a comparison with Openclaw.
photos:
  - /images/posts/2026-05-15-manus-trial/ChatGPT-Image-2026年5月15日-20_01_14.png
tags:
  - AI
  - Manus
  - Stanford
categories:
  - AI
toc: false
updated: "2026-05-15 20:01:44"
---

<!-- more -->

> Translation note: This English version follows the structure, figures, and conclusions of the corresponding Chinese post. It was reviewed and synchronized on 2026-08-03.

Since the explosion of LLMs worldwide announced the arrival of the AI era, a widespread anxiety has visibly spread from the tech circle to the entire society.

I have also been actively learning and exploring the practical uses of AI in daily life, especially how various AI tools can help with real production and software development.

A few months ago, I participated in the final round interview of a consulting company. The requirement was to choose an industry for research and create a corresponding PPT for the final presentation.

At that time, I chose the high-tech industry—software development—and conducted a somewhat in-depth research on it.

## Theory of new software development model

Whether it's the messages conveyed by major tech practitioners or KOLs on social media, or the actual usage of AI tools in real workflows by practitioners, we can see that programming agents have become deeply integrated with development. There are even reports that employees at companies like Google, Anthropic, and OpenAI have almost 100% of their code written by agents.

The bottleneck in the traditional V-shaped development model (design - programming/execution - deployment/testing) has been the execution phase, which can now be completed very quickly by agents. It is expected that in the future, the design and deployment/testing phases will also see significant agent participation.

![](/images/posts/2026-05-15-manus-trial/manus-01.png)

## Learning and practice

Although the ideal is appealing, there are still many detailed issues to solve in actual software development. I successfully developed a usable iOS app through vibe coding and published it on the overseas App Store, but the process did not achieve the efficiency expected from the new software development model. Therefore, I planned to systematically study modern software development patterns and found this Stanford course.

CS146S: The Modern Software Developer
URL: https://themodernsoftware.dev/

![](/images/posts/2026-05-15-manus-trial/manus-02.png)

As we all know, Stanford University, located in Palo Alto, excels in integrating industry, academia, and commercialization, providing a wealth of free high-quality learning resources online. This course is taught by Stanford researcher Mihail Eric.

For his personal profile, see: https://www.mihaileric.com/

By learning this course, Eric gains fame and influence, Stanford reaps potential commercial benefits, and we get access to high-quality learning resources—a win-win-win situation.

## Manus

As someone who is somewhat greedy, I prefer to learn a particular technology through projects; otherwise, my motivation is very low. Just as Manus, a product at the center of public controversy, was accused of being a wrapper and being outshined by the free "Openclaw", I happened to want to download all the resources of this course locally and try using NotebookLM (https://notebooklm.google/) to study the content efficiently. So, I obtained a trial account. Adhering to the materialist principle of "no investigation, no right to speak," I started my test.

## How capable is it?

First, downloading and logging in was extremely smooth. The product UI and UX design are very similar to the web interfaces of various popular chatbots, allowing almost seamless operation without prior experience.

Then, I told Manus my requirements: analyze the website structure, scrape the web content, and finally package it into an offline-accessible HTML page.

During this process, Manus continuously output its thoughts and execution steps, and a remote virtual computer performed these tasks. I also asked Manus to download YouTube videos and add bilingual Chinese-English subtitles, but the process was interrupted due to quota limitations. However, my initial goal—a complete bilingual HTML page—was achieved. Manus directly packaged the file for me to download.

![](/images/posts/2026-05-15-manus-trial/manus-03.png)

The resulting offline local files:

![](/images/posts/2026-05-15-manus-trial/manus-04.png)

## Difference between Openclaw and Manus

![](/images/posts/2026-05-15-manus-trial/manus-06.png)

Through this process, we can see that the biggest difference between Openclaw and Manus lies in their positioning: "engineer's tool" versus "mature commercial product."

After Zuckerberg acquired Manus at a sky-high price, many thought it was just a wrapper application, and an open-source version of Manus appeared on GitHub the next day.

So why can it sell at such a high price? Is Zuckerberg fooled?

In my view, the advantages that justify Manus's high price are:
1. It is the first globally recognized agent application.
2. Compared to Openclaw, it provides "out-of-the-box" and stable, reliable service.
3. Manus has already accumulated a certain user base, commercial reputation, and user data, giving it first-mover advantage.

I believe points 1 and 3 are similar: just as most people who don't understand AI technical principles mention GPT when they talk about AI, they will inevitably first search for and use OpenAI's GPT product when they need to choose an AI tool.

Point 2 is the line distinguishing a "product" from a "tool." Even someone like me, who considers themselves knowledgeable and very patient, found it painful to configure the Openclaw environment, often encountering unstable services. For users, the experience of "out-of-the-box" versus "spent three hours configuring and got nothing done" is vastly different. In many cases, even an extra button in the process can cause significant user churn, let alone such an "engineer's tool."

Moreover, Openclaw has security issues, potentially leading to information or data leaks or unauthorized deletions. Manus, by charging for services and using remote computers to assume these data security and stability risks, can command such a premium.

## Back to the topic

Who would have thought that after all these side explorations, my original intention was to learn modern software development?

> General: The most important thing in learning is to start learning!

Currently, I'm stuck on the "Tree Sentinel" of this course—a three-hour YouTube video by Karpathy introducing large models: Deep Dive into LLMs.

![](/images/posts/2026-05-15-manus-trial/manus-05.png)

Like many videos, it is perfect for watching when you can't sleep :) (Even though Karpathy explains it in a very accessible and vivid way)

Stay tuned for the continuation of CS146s learning content and sharing.
