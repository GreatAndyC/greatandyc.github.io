---
title: "硕士研究：机器人辅助深蹲训练中的疲劳识别"
date: 2026-05-03 20:45:00
lang: zh-CN
slug: msc-thesis-fatigue-recognition
permalink: zh-CN/2026/05/03/msc-thesis-fatigue-recognition/
description: 我的硕士论文研究概览，聚焦结合 sEMG、RPE 与平台记录运动学数据的多模态疲劳识别。
photos:
  - /images/posts/2026-05-03-msc-thesis-fatigue-recognition/training-robot.jpeg
tags:
  - 研究
  - 机器人
  - sEMG
  - 康复
  - 人机交互
categories:
  - 研究
toc: true
---

## 概览

论文题目：*机器人辅助深蹲训练中的疲劳识别方法*

我的硕士论文聚焦于基于电机驱动负载平台的深蹲训练疲劳识别问题，尝试结合主观与客观指标来判断训练过程中疲劳的发生与累积。整个项目整合了用力感知等级量表（RPE）、表面肌电（sEMG）以及平台记录的运动数据，以探索一种适用于训练与康复场景的多模态疲劳监测方法。

<figure class="post-figure">
  <img src="/images/posts/2026-05-03-msc-thesis-fatigue-recognition/training-robot.jpeg" alt="">
  <figcaption>研究中使用的电机驱动负载平台</figcaption>
</figure>

## 研究问题

在基于电机驱动负载平台的深蹲训练中，如何结合主观感知、生物信号和运动学数据，更可靠地识别疲劳状态？

这个问题之所以重要，是因为机器人训练系统可以持续记录动作与负载变化，但疲劳本身并不能被直接观察。若能建立更可靠的疲劳识别框架，就有机会支持更安全的训练调节、更自适应的康复过程，以及更合理的人机交互反馈设计。

## 方法

我围绕一种用于模拟深蹲杠负载的电机驱动负载平台设计了一项概念验证研究。在重复深蹲过程中，疲劳从以下三个互补角度进行评估：

1. `RPE`：用于反映受试者主观感受到的用力程度。
2. `sEMG 中位频率（MF）`：作为肌肉疲劳变化的生理指标。
3. `速度损失（Velocity Loss）`：基于平台记录的运动数据，用作客观的运动表现下降指标。

这项研究的重点并不是依赖单一信号判断疲劳，而是比较这些指标是否呈现一致趋势，以及它们能否在短时疲劳监测中相互补充、相互验证。

<figure class="post-figure">
  <img src="/images/posts/2026-05-03-msc-thesis-fatigue-recognition/data-collection-architecture.jpeg" alt="">
  <figcaption>结合 RPE、sEMG 与电机驱动负载平台深蹲训练的数据采集架构</figcaption>
</figure>

## 我的贡献

- 参与基于电机驱动负载平台的深蹲训练多模态疲劳识别问题的研究构思与实验设计。
- 参与深蹲实验中的下肢 sEMG 数据采集。
- 对 RPE、sEMG 特征以及平台记录的运动学数据进行整理、分析与解释。
- 对不同疲劳指标之间的变化趋势进行比较，并讨论其在康复与训练监测中的实际价值。
- 总结研究方法上的局限性，并提出面向实时疲劳监测系统的后续改进方向。

<figure class="post-figure">
  <img src="/images/posts/2026-05-03-msc-thesis-fatigue-recognition/emg-collection-points.jpeg" alt="">
  <figcaption>实际的肌电采集位置及对应的下肢肌肉</figcaption>
</figure>

## 关键发现

研究结果表明，这三类指标在重复深蹲过程中呈现出较为一致的疲劳变化趋势。

- `RPE` 随着训练进行逐步上升，反映出主观疲劳不断累积。
- `速度损失` 整体呈增加趋势，说明运动表现出现下降。
- 在 sEMG 分析中，多块目标肌肉的中位频率整体下降，支持其作为肌肉疲劳生理指标的价值。

综合来看，将主观评分、生物信号与运动学数据结合起来，比依赖单一指标更能完整描述短时疲劳状态。

<figure class="post-figure">
  <img src="/images/posts/2026-05-03-msc-thesis-fatigue-recognition/rpe-velocity-loss-overlay.png" alt="">
  <figcaption>随着深蹲次数增加，RPE 与速度损失整体呈上升趋势</figcaption>
</figure>

## 这项工作为什么有意义

虽然这项研究的规模仍然较小，但它对应的应用方向比较明确：

- 电机驱动负载平台辅助力量训练中的实时疲劳监测
- 更安全、更自适应的康复训练方案
- 面向老年人的运动监测
- 人机交互系统中的多模态反馈设计

更重要的是，这项工作训练了我从实验设计、生物信号分析到数据解释的完整研究思路，而不是将疲劳问题简化为单一变量分析。

## 局限性

这项工作更适合被理解为一个探索性的研究原型，而不是已经完成泛化验证的成熟系统。

- 研究样本量有限。
- 肌电处理流程中未纳入 MVC 标准化。
- 训练负荷设置带有一定主观性，可能影响结果的可推广性。

这些局限性也直接指向了后续可以扩展的方向，尤其是更大规模的数据采集，以及更标准化的生理信号测量流程。

以上内容就是我的硕士论文的研究内容概括，如果有原文需求，请和我联系。
