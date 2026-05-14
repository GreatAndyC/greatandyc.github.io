---
title: "Master's Research: Fatigue Recognition in Robot-Assisted Squat Training"
date: "2026-05-04 04:45:00"
lang: en
slug: msc-thesis-fatigue-recognition
permalink: en/2026/05/03/msc-thesis-fatigue-recognition/
description: A research overview of my master's dissertation on multimodal fatigue recognition using sEMG, RPE, and platform-recorded kinematic data.
photos:
  - /images/posts/2026-05-03-msc-thesis-fatigue-recognition/training-robot.jpeg
tags:
  - Research
  - Robotics
  - sEMG
  - Rehabilitation
  - Human-Robot Interaction
categories:
  - Research
toc: true
updated: "2026-05-14 20:47:13"
---

## Overview

Dissertation title: *Methods for Recognizing Fatigue in Robot-Assisted Squat Training*

My master's dissertation examined how fatigue can be recognized during squat training using a motorized loading platform by combining subjective and objective indicators. The project integrated Rating of Perceived Exertion (RPE), surface electromyography (sEMG), and motion data recorded by the platform to explore a multimodal approach to fatigue monitoring in training and rehabilitation settings.

<figure class="post-figure">
  <img src="/images/posts/2026-05-03-msc-thesis-fatigue-recognition/training-robot.jpeg" alt="">
  <figcaption>Motorized loading platform used in the study</figcaption>
</figure>

## Research Question

How can fatigue during squat training using a motorized loading platform be recognized more reliably by combining perceived exertion, biosignals, and kinematic data?

This question matters because robotic training systems can continuously measure movement and load conditions, but fatigue itself is not directly observable. A more reliable fatigue recognition framework could support safer training, adaptive rehabilitation, and better human-robot interaction design.

## Method

I designed a proof-of-concept study around squat training with a motorized loading platform used to simulate squat-bar loading. During repeated squats, fatigue was evaluated from three complementary perspectives:

1. `RPE` as a subjective indicator of perceived exertion.
2. `sEMG median frequency (MF)` as a physiological indicator of muscular fatigue.
3. `Velocity loss` derived from platform-recorded movement data as an objective indicator of performance decline.

The purpose was not to rely on a single fatigue signal, but to compare whether these indicators show consistent trends and can support each other in short-term fatigue monitoring.

<figure class="post-figure">
  <img src="/images/posts/2026-05-03-msc-thesis-fatigue-recognition/data-collection-architecture.jpeg" alt="">
  <figcaption>Experiment data collection architecture combining RPE, sEMG, and squat training with a motorized loading platform</figcaption>
</figure>

## My Contributions

- Contributed to the research framing and experimental design of multimodal fatigue recognition in squat training with a motorized loading platform.
- Participated in lower-limb sEMG data collection during squat experiments.
- Processed and interpreted multimodal signals, including RPE, sEMG-derived features, and platform-recorded kinematic data.
- Compared fatigue trends across different indicators and discussed their practical value for rehabilitation and training monitoring.
- Reflected on methodological limitations and proposed directions for future real-time fatigue monitoring systems.

<figure class="post-figure">
  <img src="/images/posts/2026-05-03-msc-thesis-fatigue-recognition/emg-collection-points.jpeg" alt="">
  <figcaption>Actual EMG collection points and the corresponding lower-limb muscles</figcaption>
</figure>

## Key Findings

The study found that the three indicators showed broadly consistent fatigue trends during repeated squats.

- `RPE` increased as the session progressed, reflecting growing subjective fatigue.
- `Velocity loss` generally rose during training, indicating accumulating performance decline.
- In the sEMG analysis, median frequency generally decreased across the tested muscles, supporting its value as a physiological marker of muscular fatigue.

Taken together, these results suggest that combining subjective ratings, biosignals, and kinematic data can provide a more complete picture of short-term fatigue than relying on a single measure alone.

<figure class="post-figure">
  <img src="/images/posts/2026-05-03-msc-thesis-fatigue-recognition/rpe-velocity-loss-overlay.png" alt="">
  <figcaption>RPE and velocity loss showed an overall upward trend as squat count increased</figcaption>
</figure>

## Why This Work Matters

Although this was a small-scale proof-of-concept study, the project points toward several practical applications:

- Real-time fatigue monitoring in strength training with motorized loading platforms
- Safer and more adaptive rehabilitation programs
- Exercise monitoring for older adults
- Multimodal feedback design in human-robot interaction systems

More broadly, this work helped me think across experiment design, biosignal analysis, and data-driven system interpretation rather than treating fatigue as a single-variable problem.

## Limitations

This work should be interpreted as an exploratory research prototype rather than a finalized generalizable system.

- The study used a limited sample size.
- MVC normalization was not included in the EMG workflow.
- The load setting introduced subjectivity that may affect generalizability.

These limitations also shaped the future directions of the project, especially around larger-scale data collection and more standardized physiological measurement.

The content above is a summary of my master's dissertation research. If you would like to read the original full text, please contact me.
