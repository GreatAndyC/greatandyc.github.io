---
title: 作品
date: 2026-07-28 12:00:00
type: portfolio
layout: page
lang: zh-CN
description: 曹越洋的独立产品、开源软件与研究型项目。
comments: false
toc:
  enable: true
  number: false
  max_depth: 2
sidebar: true
fancybox: false
---

{% raw %}
<div class="work-page">
  <header class="work-intro">
    <div class="work-intro__copy">
      <p class="work-kicker">曹越洋 / AI 原生产品工程师</p>
      <p class="work-intro__title" role="heading" aria-level="1">想法变成<br>产品。</p>
      <p class="work-intro__lead">我把产品想法转化为可以实际使用的 AI 原生产品，覆盖交互设计、工程实现、自动验证与上线后的持续迭代。</p>
      <div class="work-intro__disciplines" aria-label="核心能力">
        <span>产品设计</span>
        <span>软件工程</span>
        <span>应用 AI</span>
      </div>
      <div class="work-links work-intro__links">
        <a href="#shiguangji">查看作品 ↓</a>
        <a href="https://github.com/GreatAndyC" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        <a href="mailto:andy.caoyueyang@gmail.com">Email ↗</a>
      </div>
    </div>
    <figure class="work-intro__portrait">
      <img src="/images/CaoYueyang.png" alt="曹越洋个人肖像" width="968" height="868">
      <figcaption><span>曹越洋</span><span>产品 · 工程 · AI</span></figcaption>
    </figure>
  </header>

  <header class="work-selection-heading">
    <p class="work-kicker">SELECTED WORK / 01—06</p>
    <p class="work-selection-heading__title" role="heading" aria-level="2">作品集</p>
  </header>

  <nav class="work-index" aria-label="作品目录">
    <a href="#shiguangji"><span>01</span> 食光机</a>
    <a href="#wujian"><span>02</span> 物见</a>
    <a href="#signalforge"><span>03</span> SignalForge</a>
    <a href="#ai-native-delivery"><span>04</span> AI 交付研究</a>
    <a href="#autogoogleplay"><span>05</span> 评论分析器</a>
    <a href="#fatigue-research"><span>06</span> 疲劳识别研究</a>
  </nav>

  <section class="work-project" id="shiguangji" aria-labelledby="shiguangji-title">
    <header class="work-project__header">
      <p class="work-project__number">01 / IOS PRODUCT / LIVE</p>
      <h2 id="shiguangji-title">食光机</h2>
      <p class="work-project__lead">一款从 0 到 1 独立设计、开发并上线的 AI 原生饮食管理 iOS App，把餐食照片和用户历史转化为营养估算与个性化建议。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>成果</dt><dd>App Store 产品上线</dd></div>
      <div><dt>核心</dt><dd>Vision LLM · RAG · SwiftData</dd></div>
      <div><dt>验证</dt><dd>TestFlight 与真实产品界面</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://www.shiguangjiapp.com/" target="_blank" rel="noopener noreferrer">产品官网 ↗</a>
      <a href="/2026/03/23/ios-app-from-zero-vol1/">开发记录 01 →</a>
      <a href="/2026/03/30/ios-app-from-zero-vol2/">开发记录 02 →</a>
      <a href="/2026/04/23/ios-app-from-zero-vol3/">开发记录 03 →</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>PROJECT VIEWS</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="食光机项目图片，可左右滑动">
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/shiguangji/food-recognition-screen.webp" alt="食光机拍照识别饮食界面" width="720" height="1565" loading="lazy">
          <figcaption><span>01</span> 拍照与 AI 食物识别</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/shiguangji/architecture.webp" alt="食光机系统架构图" width="1600" height="900" loading="lazy">
          <figcaption><span>02</span> Vision LLM、RAG 与本地数据层</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--icon">
          <img src="/images/work/shiguangji/app-icon.webp" alt="食光机应用图标" width="512" height="512" loading="lazy">
          <figcaption><span>03</span> 产品图标</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project" id="wujian" aria-labelledby="wujian-title">
    <header class="work-project__header">
      <p class="work-project__number">02 / OPEN SOURCE / FLUTTER</p>
      <h2 id="wujian-title"><span>物见</span> <span class="work-project__latin-title">Wujian</span></h2>
      <p class="work-project__lead">面向家庭收纳、搬家整理和物品盘点的多模态应用。AI 先把照片转成结构化库存草稿，用户确认后再保存到本地。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>版本</dt><dd>当前仓库版本 v1.0.4</dd></div>
      <div><dt>可靠性</dt><dd>21 项自动化测试与 CI</dd></div>
      <div><dt>原则</dt><dd>Local-first · Human-in-the-loop</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/Wujian_Flutter" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
      <a href="https://github.com/GreatAndyC/Wujian_Flutter/blob/master/docs/releases/v1.0.4.md" target="_blank" rel="noopener noreferrer">v1.0.4 发布说明 ↗</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>PRODUCT UI + LOGIC</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>06</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="物见实际界面与产品逻辑，可左右滑动">
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/wujian/capture-queue.webp" alt="物见首页的拍照入口、连续识别和待确认队列统计" width="1264" height="2499" loading="lazy">
          <figcaption><span>01</span> 拍照入口、连续识别与待确认队列</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/wujian/inventory-view.webp" alt="物见视图页面的物品搜索、分类筛选、确认与导出功能" width="1264" height="2448" loading="lazy">
          <figcaption><span>02</span> 已入库物品的搜索、筛选与导出</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/wujian/model-settings.webp" alt="物见设置页面的多模态模型配置、Token 和本地存储统计" width="1263" height="2459" loading="lazy">
          <figcaption><span>03</span> 多模型配置与 Token / 本地存储统计</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram" aria-label="物见识别工作流">
            <span>拍照</span><i>→</i><span>AI 草稿</span><i>→</i><span>人工确认</span><i>→</i><span>本地保存</span>
          </div>
          <figcaption><span>04</span> AI 提速，人保留最终决定</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram work-diagram--stack" aria-label="物见可靠性设计">
            <span>安全密钥</span><span>图片压缩与去重</span><span>原子保存与备份</span><span>PDF / Excel / Markdown 导出</span>
          </div>
          <figcaption><span>05</span> 本地优先的数据可靠性设计</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--icon">
          <img class="work-app-icon work-app-icon--rounded-cutout" src="/images/work/wujian/app-icon.webp" alt="物见应用图标" width="512" height="512" loading="lazy">
          <figcaption><span>06</span> 物见应用图标</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project" id="signalforge" aria-labelledby="signalforge-title">
    <header class="work-project__header">
      <p class="work-project__number">03 / OPENAI BUILD WEEK / WORK + PRODUCTIVITY</p>
      <h2 id="signalforge-title">SignalForge</h2>
      <p class="work-project__lead">为 OpenAI Build Week 构建，把 GitHub 技术信号转化为可解释的 SaaS 商机，并明确区分事实证据、模型推断和待验证建议。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>系统</dt><dd>TypeScript · Node.js · SQLite</dd></div>
      <div><dt>客户端</dt><dd>响应式 Web 与 Flutter</dd></div>
      <div><dt>边界</dt><dd>可解释评分与人工审核</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/GithubStars" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
      <a href="https://youtu.be/C_vdD40rpV0" target="_blank" rel="noopener noreferrer">观看 Build Week 演示 ↗</a>
      <a href="https://github.com/GreatAndyC/GithubStars#readme" target="_blank" rel="noopener noreferrer">产品与架构说明 ↗</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>WEB + MOBILE</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>04</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="SignalForge 项目图片，可左右滑动">
        <figure class="work-gallery__slide">
          <img src="/images/work/signalforge/cover.webp" alt="SignalForge 商机雷达概览" width="1600" height="1067" loading="lazy">
          <figcaption><span>01</span> 商机雷达概览</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/signalforge/home-en.webp" alt="SignalForge 首页界面" width="1600" height="1000" loading="lazy">
          <figcaption><span>02</span> 信号采集与机会列表</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/signalforge/project-en.webp" alt="SignalForge 项目分析界面" width="1600" height="1000" loading="lazy">
          <figcaption><span>03</span> 可解释的项目分析</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/signalforge/mobile-en.webp" alt="SignalForge Flutter 移动端界面" width="720" height="1440" loading="lazy">
          <figcaption><span>04</span> Flutter 移动客户端</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--medium-title" id="ai-native-delivery" aria-labelledby="ai-native-delivery-title">
    <header class="work-project__header">
      <p class="work-project__number">04 / ONGOING RESEARCH / AI-NATIVE DELIVERY</p>
      <h2 id="ai-native-delivery-title">AI-Native Product Delivery</h2>
      <p class="work-project__lead">把上下文工程、Agent 管理、自动验证、安全与生产反馈应用到学习社区平台，研究一条由人保持判断、以证据完成验收的 AI 原生交付流程。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>状态</dt><dd>研究中 · 持续迭代</dd></div>
      <div><dt>方法</dt><dd>Context · Spec · Human-in-the-loop</dd></div>
      <div><dt>实践</dt><dd>学习社区平台</dd></div>
    </dl>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>METHOD + PRACTICE</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>04</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="AI 原生产品交付研究图片，可左右滑动">
        <figure class="work-gallery__slide">
          <img src="/images/work/ai-native-delivery/ai-native-product-delivery-workflow.webp" alt="连接研究意图、Figma 设计、产品规格、人工决策、Agent 实现、自动验证、发布和生产学习的八阶段 AI 原生产品交付流程" width="1672" height="941" loading="lazy">
          <figcaption><span>01</span> 以 Figma 为设计输入，由人工决策和三条证据反馈闭环控制交付</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram work-diagram--compact" role="img" aria-label="从意图与约束，经规格与决策、Agent 协作、测试与审查，到反馈沉淀的交付闭环">
            <span>意图<br>与约束</span><i>→</i>
            <span>规格<br>与决策</span><i>→</i>
            <span>Agent<br>协作</span><i>→</i>
            <span>测试<br>与审查</span><i>→</i>
            <span>反馈<br>沉淀</span>
          </div>
          <figcaption><span>02</span> 从一次性生成转向从意图到证据的可控闭环</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/ai-native-delivery/learning-platform-home.jpg" alt="学习社区平台课程首页，展示周计划、课程模块与学习进度" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> 学习社区平台：把产品规格落实为可操作的课程空间</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/ai-native-delivery/learning-platform-discussion.jpg" alt="学习社区平台班级讨论页面" width="1280" height="720" loading="lazy">
          <figcaption><span>04</span> 学习社区平台：围绕学习行为组织班级讨论</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--compact-title" id="autogoogleplay" aria-labelledby="autogoogleplay-title">
    <header class="work-project__header">
      <p class="work-project__number">05 / OPEN SOURCE / DATA + AI</p>
      <h2 id="autogoogleplay-title">AutoGooglePlay Analyzer</h2>
      <p class="work-project__lead">一个把 Google Play 评论采集、持久化和 LLM Map-Reduce 分析串成完整流程的开源工具，并提供可视化 Web 控制台。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>版本</dt><dd>公开版本 v1.1.0</dd></div>
      <div><dt>管道</dt><dd>Python · PostgreSQL · LLM</dd></div>
      <div><dt>输出</dt><dd>Markdown · PDF · JSON</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/AutoGooglePlayAnalyzer" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
      <a href="/2025/01/15/chatgpt-android-analysis-report/">阅读 1,116 条评论分析 →</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>PIPELINE + OUTPUT</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="AutoGooglePlayAnalyzer 项目图片，可左右滑动">
        <figure class="work-gallery__slide">
          <img src="/images/work/autogoogleplay/dashboard-chatgpt.jpg" alt="AutoGooglePlayAnalyzer 的 ChatGPT 评论数据采集工作区" width="1280" height="720" loading="lazy">
          <figcaption><span>01</span> 实际数据采集工作区：ChatGPT 包名、抓取数量与实时日志</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/autogoogleplay/ai-analysis-workspace.jpg" alt="AutoGooglePlayAnalyzer 的 AI 分批分析工作区" width="1280" height="720" loading="lazy">
          <figcaption><span>02</span> 实际 AI 分析工作区：按批次处理 1,116 条评论</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/autogoogleplay/chatgpt-report-findings.jpg" alt="AutoGooglePlayAnalyzer 报告查看器中的 ChatGPT 评论分析结论" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> 实际报告：办公 / 效率用途占 26.91%，开发与学习紧随其后</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--split-title" id="fatigue-research" aria-labelledby="fatigue-research-title fatigue-research-subtitle">
    <header class="work-project__header">
      <p class="work-project__number">06 / RESEARCH PROTOTYPE / HUMAN–ROBOT INTERACTION</p>
      <div class="work-project__title-group">
        <h2 id="fatigue-research-title">疲劳识别</h2>
        <p class="work-project__subtitle" id="fatigue-research-subtitle">机器人辅助深蹲训练</p>
      </div>
      <p class="work-project__lead">结合主观疲劳评分、表面肌电和平台运动学数据，比较不同疲劳指标，并参与实验设计、数据采集与分析。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>信号</dt><dd>RPE · sEMG · Velocity Loss</dd></div>
      <div><dt>场景</dt><dd>机器人辅助深蹲训练</dd></div>
      <div><dt>工作</dt><dd>实验、采集与分析</dd></div>
    </dl>
    <div class="work-links">
      <a href="/zh-CN/2026/05/03/msc-thesis-fatigue-recognition/">阅读研究说明 →</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>RESEARCH VIEWS</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="疲劳识别研究图片，可左右滑动">
        <figure class="work-gallery__slide">
          <img src="/images/work/research/training-robot.webp" alt="机器人辅助深蹲训练设备" width="717" height="538" loading="lazy">
          <figcaption><span>01</span> 机器人辅助训练设备</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/research/data-collection-architecture.webp" alt="疲劳识别数据采集架构" width="1600" height="900" loading="lazy">
          <figcaption><span>02</span> 多源数据采集架构</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/research/rpe-velocity-loss-overlay.webp" alt="RPE 与速度损失对照图" width="1600" height="900" loading="lazy">
          <figcaption><span>03</span> 主观疲劳与运动学指标对照</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <footer class="work-contact" id="contact">
    <p class="work-kicker">CONTACT</p>
    <p class="work-contact__title" role="heading" aria-level="2">想聊产品、AI 或软件系统？</p>
    <div class="work-links">
      <a href="mailto:andy.caoyueyang@gmail.com">andy.caoyueyang@gmail.com ↗</a>
      <a href="https://github.com/GreatAndyC" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    </div>
  </footer>
</div>
{% endraw %}
