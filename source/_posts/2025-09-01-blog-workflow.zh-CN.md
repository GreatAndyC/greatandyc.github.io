---
title: 新博客工作流
date: 2025-09-01 17:34:26
lang: zh-CN
slug: New-Blog-Workflow
permalink: 2025/09/01/New-Blog-Workflow/
description: 记录新增一篇博客文章时的完整工作流。
tags:
  - Markdown
  - Hexo
categories:
  - 教程
toc: true
---
摘要：本文记录了此博客新增文章的完整流程。

<!-- more -->

# 第一步：新建并编辑md文件
可以选择在Git bash 里输入
```
hexo new post "xxxx"
```
或者手动在Window系统中右键新建md文件，编辑好tags、categories等之后保存


# 第二步：渲染HTML文件

执行
```
hexo clean && hexo g && hexo s
```
在本地的 [localhost:4000](http://localhost:4000) 网页访问没有问题后
执行
```
hexo clean && hexo g && hexo g
```
渲染完成的文件会自动pull到Github的gh-pages分支下

# 第三步：添加Comment并将源码pull到main分支下
执行
```
git add .
git commit -m "post:文章标题"
git push origin main
```
