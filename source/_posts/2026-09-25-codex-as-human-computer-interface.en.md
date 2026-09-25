---
title: CodeX as an Entry Point for Human-Computer Interaction
date: 2026-09-25 12:00:00
lang: en
slug: codex-as-human-computer-interface
permalink: en/2026/09/25/codex-as-human-computer-interface/
description: From editing code directly to using a CMS and letting CodeX connect Obsidian with the blog, a record of three layers of abstraction in my publishing workflow.
photos:
  - /images/posts/codex-as-human-computer-interface/codex-workflow-cover.png
tags:
  - AI
  - Agent
  - CodeX
  - Human-Computer Interaction
categories:
  - Essay
---

<!-- more -->

It has been more than a year since I uploaded my first blog post.

Over the past year, continually using various AI tools has given me a firsthand sense of what “changing with each passing day” really means.

Take the process of updating a blog post as an example.

At the beginning, I had to create a new Markdown file in the project myself, link the images in code, and then run Hexo's deployment and rendering commands before I could publish the article to the server.

At that point, the data flow was rough and primitive:

my brain → project code → server

![](/images/posts/codex-as-human-computer-interface/01-data-flow-code.png)

Later, I learned about CMSs (Content Management Systems).

With CodeX's help, I added a content-management page to my blog and even went so far as to add skins for different universities.

![](/images/posts/codex-as-human-computer-interface/02-cms.png)

![](/images/posts/codex-as-human-computer-interface/03-cms-skin.png)

I also connected a DeepSeek API, which could help me translate content directly into English.

The data flow then became:

my brain → CMS frontend → project code → server

But now my way of providing input has been simplified once again.

After editing an article in Obsidian, I can simply ask CodeX to read it, translate it, and merge it into the codebase. One sentence is enough to complete the process.

![](/images/posts/codex-as-human-computer-interface/04-obsidian-codex.png)

The data flow is now:

my brain → Obsidian → CodeX → project code → server

To me, this process feels like a series of layers of abstraction. I have moved from touching the raw code directly, to wrapping it in a frontend page, and now to skipping the frontend altogether while an agent enters the raw content for me.

Each of the three methods has its own advantages:

- The first method lets me interact with the details of the code, like opening an electrical box and operating it from inside.
- The second is more Web 2.0: frontend and backend are separated, and the mode of human-computer activity is more pleasant.
- The third feels like having a servant. I no longer need to care about execution; I only need to pass the request to someone else.

In my view, an Agent/Harness is like an operating system for a large language model. It constrains the model so that its intelligence can be applied in the right direction. I wonder what it will become in the future.

It is rather strange that this website, with its Web 1.0 visual style, uses the most advanced large-model technology to discuss content from different eras—swallowing everything whole without fully digesting it.
