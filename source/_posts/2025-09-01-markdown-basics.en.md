---
title: Markdown Basics
date: 2025-09-01 17:07:28
lang: en
slug: Markdown-Basics
permalink: 2025/09/01/Markdown-Basics/
description: A short note on the Markdown syntax used in this blog.
photos:
  - /images/test.png
tags:
  - Markdown
  - Hexo
categories:
  - Tutorial
---
> Translation note: This English version was translated by Codex (`GPT-5`) on 2026-04-19 18:15:09 CST. The source text is the original Chinese post in this repository.

Summary: This is a note-style article about basic Markdown syntax.

<!-- more -->

```text
# Level-1 Heading
Step 1: You need a GitHub account and a new repository.
To change the theme, modify the `theme` field in the root YAML config.
To change the NexT sub-scheme, modify the `scheme` field.
Use `hexo new post "xxxx"` to create a new post.

---

## Level-2 Heading: Text Styles
Pitfall:
- GitHub does not distinguish folder names by case in the same way as the local environment. If you only change capitalization locally, `pull` may not reflect it correctly. You may need to rename it and then rename it back.

- **Bold text**
- *Italic text*
- ~~Strikethrough~~

---

## Level-2 Heading: Quote
> This is a quoted line.
> It can span multiple lines and is often used for sayings or notes.

---

## Level-2 Heading: Lists
Unordered list:
- Apple
- Banana
  - Small banana
  - Big banana
- Orange

Ordered list:
1. Step one
2. Step two
3. Step three

## Level-2 Heading: Code
Inline code: `console.log("Hello world!")`

Multi-line code block:

```python
def hello(name):
    print(f"Hello, {name}")

hello("Andy")
```

## Level-2 Heading: Links and Images
This is a link to [Bing Search](www.bing.com).

Local image (put it under `source/images/`):
<img src="/images/test.png" alt="Sample image"
     style="width:300px; border:2px solid #ccc; box-shadow:2px 2px 8px rgba(0,0,0,0.3); display:block; margin:auto;">

Reference links:
1. https://zhuanlan.zhihu.com/p/106060640
2. https://pdpeng.github.io/2022/01/19/setup-personal-blog/#%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7
```

# The Rendered Effect

# Level-1 Heading
Step 1: You need a GitHub account and a new repository.
To change the theme, modify the `theme` field in the root YAML config.
To change the NexT sub-scheme, modify the `scheme` field.
Use `hexo new post "xxxx"` to create a new post.

---

## Level-2 Heading: Text Styles
Pitfall:
- GitHub folders are case-insensitive in some workflows. If the local capitalization changes, `pull` may not recognize it correctly. You may need to rename the folder and then rename it back.

- **Bold text**
- *Italic text*
- ~~Strikethrough~~

---

## Level-2 Heading: Quote
> This is a quoted line.
> It can span multiple lines and is often used for sayings or reminders.

---

## Level-2 Heading: Lists
Unordered list:
- Apple
- Banana
  - Small banana
  - Big banana
- Orange

Ordered list:
1. Step one
2. Step two
3. Step three

## Level-2 Heading: Code
Inline code: `console.log("Hello world!")`

Multi-line code block:

```python
def hello(name):
    print(f"Hello, {name}")

hello("Andy")
```

## Level-2 Heading: Links and Images
This is a link to [Bing Search](www.bing.com).

Local image (put it under `source/images/`):
<img src="/images/test.png" alt="Sample image"
     style="width:300px; border:2px solid #ccc; box-shadow:2px 2px 8px rgba(0,0,0,0.3); display:block; margin:auto;">

Reference links:
1. https://zhuanlan.zhihu.com/p/106060640
2. https://pdpeng.github.io/2022/01/19/setup-personal-blog/#%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7
