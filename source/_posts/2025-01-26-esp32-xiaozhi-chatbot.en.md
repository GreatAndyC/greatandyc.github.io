---
title: "ESP32 Xiaozhi Chatbot: Full Build Log"
date: 2025-01-26 12:00:00
lang: en
slug: esp32-xiaozhi-chatbot
permalink: en/2025/01/26/esp32-xiaozhi-chatbot/
description: A complete build log for an ESP32-based voice chatbot terminal, including parts, wiring, flashing, and setup.
photos:
  - /images/posts/feishu-migration/esp32-xiaozhi-chatbot/xiaozhi-cover.jpg
tags:
  - ESP32
  - IoT
  - AI
categories:
  - Tutorial
toc: true
---
> Translation note: This English version was translated by Codex (GPT-5) on 2026-04-20 18:01:46 CST. The source text is the corresponding Chinese post in this repository.

# ESP32 Xiaozhi Chatbot: Full Build Log

Project start: 2025-01-26

## 1. Key Terms

- ESP32: a low-cost, high-performance Wi-Fi and Bluetooth dual-mode chip from Espressif, widely used for IoT devices.
- Xiaozhi: the personified name of this AI software/project.
- Xiaoge: reportedly the current owner of the open-source Xiaozhi project.
- Breadboard: a solderless prototyping board for quickly building and testing circuits.

## 2. Features

As of 2025-01-26, the project supports:

1. Connectivity
   - Wi-Fi and ML307 Cat.1 4G
   - Streaming voice dialog via WebSocket or UDP
2. Voice interaction
   - Offline wake word via ESP-SR
   - Multilingual recognition: Mandarin, Cantonese, English, Japanese, and Korean
   - Speaker recognition through 3D Speaker
   - TTS via Volcano Engine or CosyVoice
3. AI core
   - LLM integration with Qwen2.5 72B or Doubao APIs
   - Short-term memory through automatic per-turn summarization
4. Hardware interaction
   - BOOT key for tap-to-wake and long-press interrupt
   - OLED/LCD support for signal, dialog, or emoji-style visuals

## 3. Demo Reference

<https://www.bilibili.com/video/BV1XnmFYLEJN/>

<!-- more -->

## 4. BOM

1. ESP32-S3-DevKitC-1 (WROOM N16R8)
2. INMP441 digital microphone
3. MAX98357A audio amplifier
4. 8Ω 2~3W or 4Ω 2~3W speaker
5. Two 400-hole breadboards
6. 1.54-inch 240x240 LCD display
7. One box of 140 breadboard wires

Total cost: about 68 RMB.

I eventually bought a DIY kit on Taobao instead of sourcing every part separately.

Useful references:

- Video tutorial: <https://www.bilibili.com/video/BV1fwF7evEgv/?spm_id_from=333.337.search-card.all.click&vd_source=75d656a7472bd9409d3f8f47160a8b73>
- Project wiki: <https://my.feishu.cn/wiki/AgDaw0P9liDwpfkUBOjcMbADnec>

## 5. Assembly

### 5.1 Wiring

![](/images/posts/feishu-migration/esp32-xiaozhi-chatbot/esp32_xiaozhi_wiring_schematic.png)
![](/images/posts/feishu-migration/esp32-xiaozhi-chatbot/esp32_breadboard_real_connection.png)

### 5.2 Flashing

![](/images/posts/feishu-migration/esp32-xiaozhi-chatbot/espressif_flash_download_tool.png)
![](/images/posts/feishu-migration/esp32-xiaozhi-chatbot/firmware_flashing_log_output.png)

Use Espressif’s official flashing tool to burn the firmware.

### 5.3 Networking

![](/images/posts/feishu-migration/esp32-xiaozhi-chatbot/xiaozhi_console_backend_settings.png)

Configure the backend in the Xiaozhi console and connect the device to the network.

## 6. What It Can Do

1. Conversational chat
2. ASR wake word support

## 7. Technical Route

Reference: a Bilibili project video and the architecture diagram around 2:14.

## 8. References

- GitHub: <https://github.com/78/xiaozhi-esp32>
- Xiaozhi encyclopedia page: <https://my.feishu.cn/wiki/F5krwD16viZoF0kKkvDcrZNYnhb>
- Hardware and wiring guide: <https://my.feishu.cn/wiki/EH6wwrgvNiU7aykr7HgclP09nCh>
- Community resource: <https://www.xiaohongshu.com/explore/67833edd000000000b0208ef?xsec_token=AB_MS52dkJqZumANKyGVlOYvJx6Qft6QMksPRPM2IU1Yo=&xsec_source=pc_search&source=web_search_result_notes>
