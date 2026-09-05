---
title: "Project Based Learning: Server Deployment"
date: 2026-09-05 21:20:00
lang: en
slug: project-based-learning-server-deployment
permalink: en/2026/09/05/project-based-learning-server-deployment/
description: A reflection on project based learning through a hands-on server deployment.
photos:
  - /images/posts/project-based-learning-server-deployment/vultr-server-selection.png
tags:
  - AI
  - Servers
  - Project Based Learning
categories:
  - Learning Notes
---

**A reflection on project based learning through a hands-on server deployment.**

<!-- more -->

> Translation note: This English version was translated by Codex on 2026-09-05. The source text is the corresponding Chinese post in this repository.

For a while, I was frustrated by network connection problems that made it difficult to use applications such as Antigravity and ChatGPT reliably. One day, I decided that I had to solve the problem myself instead of remaining constrained by external conditions, and began upgrading my information infrastructure.

After a brief survey, I chose Vultr as my server provider.

<figure class="post-figure">
  <img src="/images/posts/project-based-learning-server-deployment/vultr-server-selection.png" alt="">
  <figcaption>Vultr's server selection and purchase page</figcaption>
</figure>

It took nearly two days and followed a loop like this:

- Start by trying to solve a problem.
- Encounter new knowledge I did not understand.
- Take a screenshot and ask an AI how to resolve it.
- Run into the next problem.

Eventually, the entire process worked end to end.

Through this hands-on work, I came to understand protocols, the difference between IPv4 and IPv6, and the nature of a server. These questions appeared immediately while I was trying to solve a real problem, so I could get feedback right away. It was one of the most efficient ways to learn. For example:

- Understanding the nature of a server meant comparing Dedicated CPU, Shared CPU, Cloud GPU, and bare metal when choosing a service, then selecting the option that best matched my constraints.
- While deploying network services, I could immediately ask about the difference between IPv4 and IPv6. I learned that IPv4 is a legacy system, while IPv6 has enough addresses for every grain of sand on Earth.
- I learned why root access is useful for creating an administrator account, and why SSH access should later disable root login: the logs showed countless automated scripts scanning the server ports with brute-force attempts moments after the server came online.
- Logging in through SSH also connected the cryptography concepts I had learned in my e-commerce course to a practical system.

This kind of learning, where feedback arrives immediately, is similar to vibe coding. Without noticing, you build a map of related concepts in your mind. If you later review the process and turn it into an SOP or a tutorial for your future self and others, you reinforce the knowledge again. The result becomes a durable asset.

A few weeks ago, I installed OpenCode, an agent, on the server. Now I only need to describe the goal I want to achieve, and the agent can begin carrying it out. Still, without first going through the manual process myself—running each command, even by copying and pasting, and asking an AI about screenshots—I doubt I would have built a complete mental model of the system.

<figure class="post-figure">
  <img src="/images/posts/project-based-learning-server-deployment/opencode-command-line.png" alt="">
  <figcaption>The original input method: the OpenCode command line interface</figcaption>
</figure>

On social media, people often compare “old-school programming” with “AI programming” and ask questions such as how to overcome the lack of feedback in traditional programming.

Some people say that successfully solving a difficult problem releases a burst of endorphins, as satisfying as turning a losing position around in a competition.

This reminds me of high school mathematics exams. Although the problems were genuinely difficult, I did not feel a sickening emptiness. I felt tired from solving one problem after another under the mild pressure of the exam room. Perhaps that feeling also came from the way the brain had been exercised by thinking through and solving problems.

As many discussions have suggested, AI may be able to complete most people's work in the foreseeable future. But when it comes to learning, the human process of input and understanding has not fundamentally changed. We still need time to work through the principles.

In my view, project based learning followed by review, reflection, and publishing the result as an article is one of the most suitable ways to learn in the age of AI.
