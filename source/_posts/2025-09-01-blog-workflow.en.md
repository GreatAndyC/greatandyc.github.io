---
title: New Blog Workflow
date: 2025-09-01 17:34:26
lang: en
slug: New-Blog-Workflow
permalink: en/2025/09/01/New-Blog-Workflow/
description: A note on the workflow for creating new blog posts.
tags:
  - Markdown
  - Hexo
categories:
  - Tutorial
toc: true
---
> Translation note: This English version was translated by Codex (GPT-5) on 2026-04-20 18:01:46 CST. The source text is the corresponding Chinese post in this repository.

Summary: This article records the full workflow for adding a new post to this blog.

<!-- more -->

# Step 1: Create and edit the Markdown file
You can either run this in Git Bash:

```bash
hexo new post "xxxx"
```

Or create a new Markdown file manually in Windows, edit the tags, categories, and other front matter, and then save it.

# Step 2: Render the HTML files
Run:

```bash
hexo clean && hexo g && hexo s
```

After confirming that everything looks correct on the local `localhost:4000` site, run:

```bash
hexo clean && hexo g && hexo g
```

The rendered files will be pushed automatically to the `gh-pages` branch on GitHub.

# Step 3: Add a comment and push the source code to the `main` branch
Run:

```bash
git add .
git commit -m "post: article title"
git push origin main
```
