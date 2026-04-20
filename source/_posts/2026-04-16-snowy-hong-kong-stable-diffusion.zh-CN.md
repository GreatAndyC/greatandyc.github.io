---
title: 雪中香港：Stable Diffusion 定制化生图实践
date: 2026-04-16 10:00:00
lang: zh-CN
slug: snowy-hong-kong-stable-diffusion
permalink: 2026/04/16/snowy-hong-kong-stable-diffusion/
description: 记录一次用 Stable Diffusion 为香港街景制作雪景效果的完整实践，包括模型选择、图生图参数配置和结果对比。
photos:
  - /images/feishu-migration/snowy-hong-kong-stable-diffusion/hong_kong_snow_sd_cover.png
tags:
  - Stable Diffusion
  - AI绘画
  - 摄影
categories:
  - 教程
toc: true
---
# 雪中香港：Stable Diffusion 定制化生图实践

雪中香港-SD定制化生图实践Snowy Hong Kong: AI-Generated Landscapes with Stable Diffusion
1. 背景
在社交媒体上看到vivox200的雪景Ai效果（如下图所示），感觉非常惊艳，想要拍摄同款，但是没有相应的手机，于是打算通过自己的方式制作下雪效果
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/hong_kong_snow_sd_cover.png)

<!-- more -->

2. 技术探究
推测的原理是，vivo手机在拍摄后使用自己的大模型Api或者本地大模型进行运算，得到图片。
在网上搜索解决方案后，最终决定通过流行的AI绘画模型Stable Diffusion进行图生图得到结果作为技术解决方案。
3. 执行步骤
3.1  软件安装
首先下载Stable Diffusion模型，在Bilibili找到Up主“秋葉aaaki”自制的Web-UI整合包
参考链接：https://www.bilibili.com/video/BV1iM4y1y7oA
3.2  模型选择
在小红书上找到一个参考照片：
在Civitai上找到这个模型，并且下载导入StableDiffusion的WebUI
https://civitai.com/models/109730/lwarchitecutralmix
3.3 参数设置
使用图生图功能
模型选用realisticVisionV60B1 v51HyperVAE.safetensors
外挂Vae模型选用vae-ft-mse-840000-ema-pruned.safetensors
开启ControlNet的线稿模式，其余参数默认
Positive Prompt：
make it snow,snow scenery,modern architecture,glass,snowing,in winter,masterpiece,high quality,real,realistic,full detail,8K,falling snow,there are no people or vehicles
Negative Prompt
lowres,bad anatomy,bad hands,text,error,missing fingers,extra digit,fewer digits,cropped,worst quality,low quality,normal quality,jpeg artifacts,signature,watermark,username,blurry,Low resolution,poor structure,people,text,errors,numbers,jpeg,
上传原始图像，控制图片大小为800*1200以内防止爆显存
采样参数：
- Steps: 20 → 常规迭代步数，不算高（偏快）。
- Sampler: DPM++ 2M → 生成质量不错的采样器。
- Schedule type: Karras → 控制噪声调度，细节更平滑。
- CFG scale: 7 → 提示词引导力度，7 是比较稳妥的平衡值。
- Seed: 3075314455 → 固定随机种子，可复现结果。
- Size: 400x600 → 竖图构图，适合建筑主体。
4. 结果产出
生成图片如下
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_lora_parameter_config.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_checkpoint_selection.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_prompt_eng_process.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_img2img_base_photo.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_generation_variation_1.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_generation_variation_2.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_generation_variation_3.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_upscale_detail_enhance.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_post_process_color_grading.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_final_comparison_grid.png)
![alt text](/images/feishu-migration/snowy-hong-kong-stable-diffusion/sd_metadata_exif_info.png)
