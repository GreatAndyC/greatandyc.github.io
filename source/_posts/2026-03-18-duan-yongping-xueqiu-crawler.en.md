---
title: How I Crawled Duan Yongping’s Xueqiu Comments
date: 2026-03-18 12:00:00
lang: en
slug: duan-yongping-xueqiu-crawler
permalink: en/2026/03/18/duan-yongping-xueqiu-crawler/
description: A crawl log of Duan Yongping’s Xueqiu comments, including tool choice, debugging, and export results.
photos:
  - /images/posts/feishu-migration/duan-yongping-xueqiu-crawler/duan-buffett-cover.png
tags:
  - Crawler
  - Xueqiu
  - Data Analysis
categories:
  - Tutorial
toc: true
---
> Translation note: This English version was translated by Codex (GPT-5) on 2026-04-20 18:01:46 CST. The source text is the corresponding Chinese post in this repository.

## 1. Background

I came across Duan Yongping’s posts on Xueqiu and thought it would be interesting to analyze them. I had recently finished a Python + AI semantic analysis report on ChatGPT, so I wanted to reuse the same approach and see whether his comments could reveal useful insights such as investment habits and style.

## 2. Tooling

I used the free Gemini 2.0 Flash model in Google AI Studio.

---

<!-- more -->

## 3. Workflow

### 3.1 Choosing the technical path

I first asked Gemini for a scraping strategy that could collect all posts from a user profile and export the user ID, date, comment text, and replied target into CSV.

Gemini suggested using Python `requests`, `BeautifulSoup4`, and `csv`.

### 3.2 Debugging

The initial implementation quickly ran into anti-crawling checks and captchas, usually after about 50 items.

I then refined the approach through several rounds of prompting:

- keep Selenium logged in
- switch pages automatically
- save each page as JSON
- print the time spent per page and the total time
- pause every 60 runs to inspect for captcha
- add a failure pause when collection failed

The main goal was automation of the repetitive steps, not bypassing the platform API.

## 4. Output

In the end, I used a semi-automatic workflow to collect all public comments posted by Duan Yongping on Xueqiu from **2011-03-24** to **2025-01-05**.

**Statistics:** 458 pages at 20 comments per page, for a total of **9,151** comments.

<figure class="post-figure">
  <img src="/images/posts/feishu-migration/duan-yongping-xueqiu-crawler/xueqiu_crawler_output_csv.png" alt="">
  <figcaption>Exported Xueqiu comment table</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/posts/feishu-migration/duan-yongping-xueqiu-crawler/duan_yongping_comment_sample.png" alt="">
  <figcaption>Sample Duan Yongping comment</figcaption>
</figure>
