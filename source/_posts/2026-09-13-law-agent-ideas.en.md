---
title: "Designing and Building a Law Agent: Ideas and Implementation"
date: 2026-09-13 15:26:00
lang: en
slug: law-agent-ideas
permalink: en/2026/09/13/law-agent-ideas/
description: A record of the full process of designing and building a Law Agent, from industry research to product design and implementation.
photos:
  - /images/posts/2026-09-13-law-agent-ideas/law-agent-android-preview.png
tags:
  - AI
  - Agent
  - Law Agent
  - Product
  - Indie Development
categories:
  - AI
---

<!-- more -->

I had wanted to build an app that could quickly and automatically review contracts and provide suggestions. Yesterday, I officially started working on it.

Before starting, I thought about several questions:
1. Why are large language models suitable for language review?
2. Since general-purpose AI products such as ChatGPT already exist, why build an app or Agent ourselves?
I will organize these thoughts one by one.

## Why Are Large Language Models Suitable for Language Review?

Not long ago, I applied for an RA position at HKU and made a small demo for reviewing IFC models in BIM.
The product demo is available at: https://bim-review-agent.andycaoyy6.chatgpt.site/
PS: Since the website is hosted by ChatGPT, please use an IP address that can access ChatGPT services.

In my experience, most people's feelings toward AI are now shifting from excitement to emptiness.

The “bosses” who control resources think AI can improve efficiency. Then why should I hire so many employees? If AI can do it, why can't you? How can I accelerate my digital transformation?
To most bosses, FDE (Foward Deployed Engineering) has effectively become the role of an “operations supervisor”, with the only metric being: “How many people can I lay off?”

Employees who possess knowledge and skills, on the other hand, worry that if AI learns all of their knowledge and skills, how can they protect their own interests? Will this ultimately become a case of “teaching one's apprentice and starving oneself”?
References:
1. https://www.qbitai.com/2026/04/402063.html
2. https://medium.com/@kanishks772/meta-allegedly-used-employee-workflows-to-train-ai-then-laid-off-8-000-people-b267da7a63ec

Moreover, whenever someone says, “My XXXX was completed with the help of AI,”

people tend to think it is “a rough and poorly made product” rather than “a cool, high-tech, high-value product.”

Although the scope and applications of AI (Artificial Intelligence) extend far beyond natural language processing, it is certainly one of the applications that currently affects our lives the most.

Therefore, I believe a good AI product or application should make people unaware of the AI inside it, while producing results that are verifiable, accurate, and highly precise.

Legal contracts are standardized documents that require rigorous logic and language, with standard formats available for comparison. NLP (Natural Language Processing) happens to be one of the areas where large language models are relatively strong.

Therefore, handing a problem or image to a large language model for screening, highlighting problematic areas, providing references, and finally returning feedback creates a good closed loop. It is also an area where AI can provide significant acceleration.

Most importantly, I personally encounter many situations involving employment contracts, rental contracts, civil contracts, and commercial contracts. One purpose of building this product is to create an efficient solution for myself.

## Vertical Agents and General-Purpose Agents

The next question is: since general-purpose apps such as ChatGPT, Doubao, and Gemini already exist, what is the point of developing such a product?

In the past, when I encountered a problem, my usual process was to upload the document to GPT, ask GPT to review it, obtain feedback through repeated questions, and sometimes even generate a new PDF directly.

This question is not limited to app development. It can apply to almost any field: if there is already a powerful and lower-cost solution, why build one ourselves?

Here is a comparison:
Develop it ourselves:
1. Greater freedom in choosing data-processing solutions
2. Freedom to choose data-storage solutions
3. There is a gap between our model and Agent capabilities

Give the data to a major provider:
1. Faster response
2. Fixed and non-customizable workflows
3. All data must be handed over to the provider's servers

It is clear that the advantages and disadvantages of developing independently are both significant. The advantages are greater freedom, more selective disclosure of data, and better integration with existing workflows.

The disadvantage is that processing efficiency still falls behind the major providers' models. If we ultimately still use a model provider's API, the scope of data confidentiality remains limited.

So this is a trade-off between security and efficiency.

It can also be described as centralization versus decentralization, Leviathan versus Behemoth...

## Development Process

First, I researched “industry best practices” and asked CodeX/GPT to conduct industry research.

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-competitor-analysis.png" alt="Law Agent competitor analysis and product structure discussion screenshot" width="1300" height="1344" loading="lazy" decoding="async">
  <figcaption>A comparison of competitors, workflows, and product structures in the legal Agent space.</figcaption>
</figure>

I then referred to related apps and designs, testing their functions through Computer Use or by connecting to mobile apps through developer mode, while also drawing on their design approaches.

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-product-testing.png" alt="Law Agent product feature testing notes screenshot" width="1294" height="966" loading="lazy" decoding="async">
  <figcaption>Records of Law Agent feature tests and items still requiring validation.</figcaption>
</figure>

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-feature-analysis.png" alt="Law Agent feature breakdown and optimization research screenshot" width="1298" height="1366" loading="lazy" decoding="async">
  <figcaption>Research material organizing the feature breakdown, page flow, and future optimization directions.</figcaption>
</figure>

## Obtaining a Design Draft with Figma Make

I then asked CodeX to read the entire folder and provide a prompt for Figma Make, Figma's built-in AI design feature, to create an initial MVP design.

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-figma-make-home.png" alt="Law Agent Figma Make home design draft screenshot" width="2928" height="1412" loading="lazy" decoding="async">
  <figcaption>The Law Agent MVP home page and mobile interface generated by Figma Make.</figcaption>
</figure>

Save the design draft as a Figma file. (For steps you do not know how to complete, Computer Use can be used as a fallback.)

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-figma-make-canvas.png" alt="Law Agent Figma canvas and page structure screenshot" width="2900" height="1406" loading="lazy" decoding="async">
  <figcaption>The saved Figma canvas, page hierarchy, and interaction prototype structure.</figcaption>
</figure>

Next, connect Figma and CodeX through an MCP server and let Figma automatically develop the frontend UI.
Reference: https://help.figma.com/hc/en-us/articles/39888629089175-Codex-and-Figma-Set-up-the-MCP-server

During this process, I can discuss long-term storage and system-architecture choices with CodeX and save them in the repository as an Agent.md file or a specification document.

## Logo and Visual Design

For the visual design, I also discussed the logo with GPT.
To represent legal fairness and impartiality, I used the scales of justice, one of the most common legal symbols, as the visual center.
I also added elements of the judge character, Dragonfly Captain, from the Japanese tokusatsu series B-Robo Kabutack.

## Build and Testing

Once development is complete, I can test stability and reliability on different emulators or real devices.

As for release, promotion, commercialization, and continuous iteration, that is another matter.

## Summary

Overall, this is a loop of AI drafting -> refinement based on personalized aesthetics -> continuous iteration based on personal and market feedback.

## Preview

<figure class="law-agent-figure">
  <img src="/images/posts/2026-09-13-law-agent-ideas/law-agent-android-preview.png" alt="Law Agent Android version preview" width="688" height="1586" loading="lazy" decoding="async">
  <figcaption>A preview of the current Android version of the Law Agent interface.</figcaption>
</figure>

This is a preview of the current Android version. Please stay tuned for the finished product.
