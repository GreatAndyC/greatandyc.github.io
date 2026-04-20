---
title: "Snowy Hong Kong: Stable Diffusion Image Generation Practice"
date: 2026-02-09 10:00:00
lang: en
slug: snowy-hong-kong-stable-diffusion
permalink: 2026/04/16/snowy-hong-kong-stable-diffusion/
description: A practical experiment in turning Hong Kong street scenes into snowy landscapes with Stable Diffusion.
photos:
  - /images/feishu-migration/snowy-hong-kong-stable-diffusion/snow-hk-cover.png
tags:
  - Stable Diffusion
  - AI Art
  - Photography
categories:
  - Tutorial
toc: true
---

I first saw a snowy AI effect on the vivo X200 and wanted to recreate the same feeling on my own street photos, even though I did not have the phone itself.

## 1. Background

I wanted to generate a snow scene from ordinary Hong Kong street photography.

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/hong_kong_snow_sd_cover.png" alt="">
  <figcaption>Snow effect shown by the vivo X200</figcaption>
</figure>

## 2. Technical Approach

My guess was that vivo used a model or local inference after taking the photo. I chose Stable Diffusion img2img as the practical workaround.

## 3. Execution

### 3.1 Installation

I downloaded a Stable Diffusion WebUI bundle made by the Bilibili creator “秋葉aaaki.”

Reference: <https://www.bilibili.com/video/BV1iM4y1y7oA>

### 3.2 Model Choice

I found a reference photo on Xiaohongshu and then located a matching model on Civitai:

<https://civitai.com/models/109730/lwarchitecutralmix>

### 3.3 Parameters

I used img2img with:

- realisticVisionV60B1 v51HyperVAE.safetensors
- vae-ft-mse-840000-ema-pruned.safetensors
- ControlNet line-art mode
- Default values for the remaining parameters

Prompt:

> make it snow, snow scenery, modern architecture, glass, snowing, in winter, masterpiece, high quality, real, realistic, full detail, 8K, falling snow, there are no people or vehicles

Negative prompt:

> lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry

I kept the input image under 800×1200 to avoid out-of-memory errors.

Sampling settings:

- Steps: 20
- Sampler: DPM++ 2M
- Schedule: Karras
- CFG scale: 7
- Seed: 3075314455
- Size: 400×600

## 4. Results

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_lora_parameter_config.png" alt="">
  <figcaption>Alfafa side</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_prompt_eng_process.png" alt="">
  <figcaption>HKU Red Wall</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_img2img_base_photo.png" alt="">
  <figcaption>AIA Ferris Wheel</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_generation_variation_1.png" alt="">
  <figcaption>Tsim Sha Tsui Apple Store</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_generation_variation_2.png" alt="">
  <figcaption>Centennial Campus 1</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_generation_variation_3.png" alt="">
  <figcaption>Kennedy Town</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_upscale_detail_enhance.png" alt="">
  <figcaption>Centennial Campus 2</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_post_process_color_grading.png" alt="">
  <figcaption>HKU B1 Exit</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_final_comparison_grid.png" alt="">
  <figcaption>Centennial Garden</figcaption>
</figure>

<figure class="post-figure">
  <img src="/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_metadata_exif_info.png" alt="">
  <figcaption>Tsim Sha Tsui</figcaption>
</figure>
