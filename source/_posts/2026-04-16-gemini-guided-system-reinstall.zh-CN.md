---
title: 赛博空间大扫除：我如何用 Gemini 把旧笔记本变成 AI 智能体执行机
date: 2026-04-16 15:00:00
lang: zh-CN
slug: gemini-guided-system-reinstall
permalink: 2026/04/16/gemini-guided-system-reinstall/
description: 记录一次在 Gemini 辅助下完成系统重装、设备清理和旧电脑再利用的完整实践。
photos:
  - /images/feishu-migration/gemini-guided-system-reinstall/system_clean_project_cover.png
tags:
  - Gemini
  - 系统重装
  - AI
categories:
  - 教程
toc: true
---
# 赛博空间大扫除：我如何用 Gemini 把旧笔记本变成 AI 智能体执行机

https://my.feishu.cn/wiki/I7T9wXh2CiuO7Qkx8RqcxbfvnNh
写于26.3.23 4pm-5:40pm
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/system_clean_project_cover.png)
封面图由Nano banana2生成

<!-- more -->

前言
        前段时间Openclaw爆火，在Macbook上也部署了一个，但是考虑到安全性不足以及潜在的巨大Token开销和目前无法生产化的能力，浅尝辄止后就没有继续深入研究了。
最近清点收拾房间的时候，发现本科时候的旧的笔记本电脑已吃灰许久，在和Gemini的对话过程中逐渐产生了把这台笔记本改装成工程机/服务器的想法。
注：改装后的机器也只适合轻量级/实验性AI任务，若有重度开发需求————得加钱
目的：不保存任何隐私文件，系统选择最轻量化的版本，所有资源让位给AI编程，机器定位为AI Coding的执行机。
为什么不买服务器：
1.节约成本 2.废物利用 3.绝对私有 4.装机学习

实验准备：
删档重开！
稳定的互联网连接（而非局域网）

硬件准备：
8GB以上U盘：用于写入存储系统文件
备份数据资料的大容量硬盘

软件准备：
Gemini/豆包/千问网页版
开源截图工具Snipaste：https://zh.snipaste.com/
Antigravity或VScode+Cline插件：https://antigravity.google/
P2P下载软件-Motrix:motrix.app
系统文件写入U盘的工具Rufus: rufus.ie
万里长城维修梯ClashVerge:https://github.com/clash-verge-rev/clash-verge-rev/blob/dev/README.md
局域网全平台文件互传软件LocalSend：https://localsend.org/
Chrome浏览器：https://www.google.com/intl/zh-CN/chrome/
具体过程
资料清理环节
首先清理电脑资料，这部分不做过多赘述，相信大家都有搬家&打扫的经验，因人而异。
C盘可以重点关注下载、文档等文件夹下的文件，可以在Powershell&Bash里合理使用Tree命令获取文件夹结构，将文件拆分发给AI工具询问哪些可能是有价值的文档，进行针对性保存。
可以使用工具WizTree帮助快速可视化分析硬盘空间，加快清理过程https://diskanalyzer.com/
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/wiztree_disk_space_analysis.png)
当然一开始其实并没有想要重装电脑的想法，只是想要把软件给进行深度清理，做一下大扫除。此时刚刚打开电脑，运行Antigravity的Gemini模型，读取电脑配置和运行信息：“为什么我的电脑这么卡”。（这一步可以手动进行，不过我懒，就让Agent帮我代劳了）

获得一份Markdown格式的笔记本配置文件以及，已经248天没有重启的信息，所以积累了很多碎片文件，间接导致了系统运行卡顿。

具体配置：
处理器Intel(R) Core(TM) i7-6500U CPU @ 2.50GHz 2.60 GHz
机带 RAM 8.00 GB (7.87 GB 可用)
显卡 NVIDIA GeForce 940M (2 GB), Intel(R) HD Graphics 520 (128 MB)
存储 256 GB SSD LITEON CV1-CC256

当时已经到了开启浏览器都要卡5秒的程度了，查看任务管理器（Ctrl+Shift+Esc）和程序与卸载页面（Win+R输入“appwiz.cpl”进入），截多张图（Snipaste），发给Gemini，让它给我解释每一个进程、软件有什么用处和开发公司，并且按照顺序给我卸载清单，发现后台和本地磁盘运行了诸多如X里巴巴系残留、x软、厂商原装软件等吃资源大户。
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/windows_app_uninstall_list.png)
挨个卸载过时的软件、没有用的软件等，大约给硬盘腾出了40GB左右的空间，花费了不少时间（学到了很多关于Windows系统权限、以及如何做深度清理的一般方法的知识），但是也遇到了一些流氓软件需要非常复杂的卸载手段的情况（请神容易送神难），遂打算直接重装系统。
联网获取系统镜像
在和Gemini讨论我的需求（稳定，清爽系统）后，在Ubuntu 24.04和Windows LTSC 2021之间选择了后者（考虑到软件生态和适配度等）

在https://next.itellyou.cn/的网站上获取Windows 10 Enterprise LTSC 2021 (x64) - DVD (Chinese-Simplified)的BT下载链接，使用MotrixP2P下载（记得下载完毕后继续上传做种，确保分享率达到1，和互联网的匿名帮助者互不相欠）原理

将U盘变启动盘
打开Rufus，在镜像文件中选择刚刚下载的iso文件，点击“选择”按钮左边的✅按钮进行Hash校验，确保没有被篡改或投毒。（我要验牌）
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/rufus_iso_selection_gui.png)
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/rufus_checksum_verification.png)
校验值结果如下，牌没问题。
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/iso_hash_check_result_success.png)
准备就绪后点击开始，勾选除了使用当前用户的区域设置以外的所有内容
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/rufus_bootable_usb_creation_start.png)
直至写入完成。
刷系统环节
在最后一次检查资料已全部清空备份后，让AI生成一份刷机SOP的Markdown文档，用U盘/互联网转移到其他设备，手机拍照or云文档方式便于对照执行
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/bios_boot_order_config.png)
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/windows_ltsc_installation_step1.png)
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/windows_ltsc_disk_partitioning.png)
具体内容不过多赘述，Ai给的详细的操作指南，进入BIOS的设置是为了让硬件能从U盘启动，SSD可以不用分区，机械盘最好进行分区。
任何不懂的可以拍照问Gemini/豆包，谨慎操作一般不会导致设备变成大号砖头。
（真变砖了请不要找作者负责🙏）
接着在Window更新页面，联网自动更新2021版本至今的安全漏洞，以及相关的驱动，让电脑更加丝滑。需要花费大约30-60min的时间，如果嫌麻烦可以不这么做，黑客一般也不会攻击没有什么价值的垃圾电脑/服务器
装机软件
安装好提前准备好的
7-Zip（解压缩软件）
Windows-Update-Blocker（一键禁止Window更新）
DefenderControl（防止防火墙持续扫描文件，降低资源消耗）
ClashVerge（Hello World✈️）
Todesk（远程控制软件：真得控制控制你了）

一切就绪后，就开始配置你的Openclaw/Claude code/Open code吧！

什么，你说，智能体把你的电脑搞崩了？
![alt text](/images/feishu-migration/gemini-guided-system-reinstall/system_crash_humor_meme.png)
https://www.zhihu.com/question/1999136031413384196/answer/2011220677781365962

不怕，点击这里，还可以抢救一下！（跳到本文开头）
后记-旧电脑的赛博新生
截止至26.3.23，笔者在京东搜索两年前买的内存条，价格从900元涨到了2400元，背后是AI时代对存储、算力的爆发式需求带来的供需关系引发的异常市场价格波动。
伴随着各种Agent的爆火，越来越多高度文档化和需要分析决策的工作在不断被替代。
Ai是泡沫还是变革，没有人有确切的答案，但是跟紧浪潮，才能不被时代落下，这是亘古不变的道理。

中译中：真没招了，只能硬着头皮学了。
