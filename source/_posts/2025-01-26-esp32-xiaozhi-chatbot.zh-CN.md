---
title: ESP32 小智 Chatbot 制作全流程记录
date: 2025-01-26 12:00:00
lang: zh-CN
slug: esp32-xiaozhi-chatbot
permalink: 2025/01/26/esp32-xiaozhi-chatbot/
description: 记录一次基于 ESP32 搭建小智语音聊天终端的全过程，包括 BOM、接线、烧录和联网配置。
photos:
  - /images/feishu-migration/esp32-xiaozhi-chatbot/xiaozhi-cover.jpg
tags:
  - ESP32
  - IoT
  - AI
categories:
  - 教程
toc: true
toc_number: false
---
# ESP32 小智 Chatbot 制作全流程记录

ESP32 小智Chatbot制作全流程记录

项目创建时间：2025.1.26

## 1. 名词解释

### ESP32

乐鑫科技（Espressif Systems）推出的一款高性能、低成本的 Wi-Fi & 蓝牙双模物联网芯片，主要用于物联网（IoT）设备开发。它集成了丰富的硬件资源，功能强大且易于开发，是智能家居、工业控制、可穿戴设备等领域的常用解决方案。

### 小智

这个Ai软件/项目的拟人化命名

### 虾哥

疑似目前29岁的、毕业于华南理工大学的小智开源项目的所有者。

- Github项目链接:https://github.com/78
- Bilibili主页:https://space.bilibili.com/59357679 id：牛逼的小虾米
- 个人博客：https://xiaoxia.org/

### 面包板

英文：Breadboard）是一种用于搭建和测试电子电路的实验工具，不需要焊接，可以快速插拔电子元件和导线，非常适合原型设计和学习电子制作。它的名字来源于早期工程师用木板和钉子（像切面包的板子）临时搭建电路的习惯。

## 2. 功能

截至2025.1.26

### 1. 通信与联网

  - 支持 Wi-Fi 和 ML307 Cat.1 4G 联网。
  - 流式语音对话协议：WebSocket 或 UDP。

### 2. 语音交互

  - 离线唤醒：ESP-SR 语音唤醒（无需联网）。
  - 多语言识别：国语、粤语、英语、日语、韩语。
  - 声纹识别：通过 3D Speaker 识别说话人身份。
  - TTS 语音合成：支持火山引擎或 CosyVoice 生成语音。

### 3. AI 核心

  - 大语言模型（LLM）：集成 Qwen2.5 72B 或豆包 API。
  - 短期记忆：每轮对话后自动总结，提升交互连贯性。

### 4. 硬件交互

  - 按键控制：BOOT 键支持点击（唤醒）和长按（打断）。
  - 显示屏支持：OLED/LCD 显示信号强度、对话内容或图片表情。

## 3. 效果参考

- https://www.bilibili.com/video/BV1XnmFYLEJN/

<!-- more -->

## 4. 材料清单BOM

| 材料 | 价格 |
| --- | --- |
| 1.开发板 ESP32-S3-DevKitC-1(WROOM N16R8)  | 淘宝价格：33R |
| 2.麦克风数字功放 INMP441 | 淘宝价格：9R |
| 3.音频功效 MAX98357A | 淘宝价格：8R |
| 4.腔体喇叭 8Ω 2~3W 或4Ω 2~3W | 淘宝价格：3R |
| 5.400 孔面包板需要2块 | 淘宝价格：2*2 = 4R |
| 6.1.54寸 240x240 液晶显示屏 | 淘宝价格：7R |
| 7.140根盒装面包板线1盒 | 淘宝价格：4R |

总价格：68R

- 经过对比，选择直接在淘宝店铺购买DIY套件：淘宝购买链接
- 视频教程：https://www.bilibili.com/video/BV1fwF7evEgv/?spm_id_from=333.337.search-card.all.click&vd_source=75d656a7472bd9409d3f8f47160a8b73
- 参考链接：一起玩：小智AI聊天机器人https://my.feishu.cn/wiki/AgDaw0P9liDwpfkUBOjcMbADnec

## 5. 组装步骤

### 5.1 按照线路图组装

![alt text](/images/feishu-migration/esp32-xiaozhi-chatbot/esp32_xiaozhi_wiring_schematic.png)

![alt text](/images/feishu-migration/esp32-xiaozhi-chatbot/esp32_breadboard_real_connection.png)

组装完成后电路图如上图所示

### 5.2 烧录

![alt text](/images/feishu-migration/esp32-xiaozhi-chatbot/espressif_flash_download_tool.png)

![alt text](/images/feishu-migration/esp32-xiaozhi-chatbot/firmware_flashing_log_output.png)

使用官方的烧录软件烧录固件到开发板中

### 5.3 联网

![alt text](/images/feishu-migration/esp32-xiaozhi-chatbot/xiaozhi_console_backend_settings.png)

使用小智官网的网络服务连接到网络中，在https://xiaozhi.me/console/agents中配置好后端

## 6. 功能

- 1.对话聊天
- 2.ASR语音唤醒https://kcn80f4hacgs.feishu.cn/wiki/OxsZwab8iiGYjvkH9SBcFK2anmh
- 小智AI终端ASR自定义唤醒词简单方案

## 7. 技术路线

- 参考【自制】我造了一台钢铁侠的迷你机械臂 ！【硬核】_哔哩哔哩_bilibili 2：14的架构示意图https://www.bilibili.com/video/BV12341117rG

## 遇到的问题

- 什么是ESP32？https://www.espressif.com.cn/zh-hans/products/socs

## 参考资料

- Github项目链接：https://github.com/78/xiaozhi-esp32
- 小智 AI 聊天机器人百科全书https://my.feishu.cn/wiki/F5krwD16viZoF0kKkvDcrZNYnhb
- 小智AI聊天机器人硬件清单与接线教程https://my.feishu.cn/wiki/EH6wwrgvNiU7aykr7HgclP09nCh
- 社区资源：https://www.xiaohongshu.com/explore/67833edd000000000b0208ef?xsec_token=AB_MS52dkJqZumANKyGVlOYvJx6Qft6QMksPRPM2IU1Yo=&xsec_source=pc_search&source=web_search_result_notes
