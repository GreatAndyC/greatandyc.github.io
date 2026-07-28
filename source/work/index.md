---
title: 作品
date: 2026-07-28 12:00:00
type: portfolio
layout: page
lang: zh-CN
description: 曹越洋的独立产品、开源软件与研究型项目。
comments: false
toc:
  enable: false
  number: false
sidebar: false
fancybox: false
---

{% raw %}
<main class="work-page">
  <header class="work-intro">
    <p class="work-kicker">PORTFOLIO / 2024—2026</p>
    <h1>作品集</h1>
    <p class="work-intro__lead">独立产品、开源工具和研究型软件。这里展示的是做出来的东西，以及它们如何工作。</p>
    <div class="work-links work-intro__links">
      <a href="https://github.com/GreatAndyC" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      <a href="mailto:andy.caoyueyang@gmail.com">Email ↗</a>
    </div>
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
      <h2 id="wujian-title">物见 Wujian</h2>
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
        <span>PRODUCT LOGIC</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="物见产品逻辑，可左右滑动">
        <figure class="work-gallery__slide work-gallery__slide--icon">
          <img src="/images/work/wujian/app-icon.webp" alt="物见应用图标" width="512" height="512" loading="lazy">
          <figcaption><span>01</span> 物见应用图标</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram" aria-label="物见识别工作流">
            <span>拍照</span><i>→</i><span>AI 草稿</span><i>→</i><span>人工确认</span><i>→</i><span>本地保存</span>
          </div>
          <figcaption><span>02</span> AI 提速，人保留最终决定</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram work-diagram--stack" aria-label="物见可靠性设计">
            <span>安全密钥</span><span>图片压缩与去重</span><span>原子保存与备份</span><span>PDF / Excel / Markdown 导出</span>
          </div>
          <figcaption><span>03</span> 本地优先的数据可靠性设计</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project" id="signalforge" aria-labelledby="signalforge-title">
    <header class="work-project__header">
      <p class="work-project__number">03 / SAAS RESEARCH TOOL / BUILD WEEK</p>
      <h2 id="signalforge-title">SignalForge</h2>
      <p class="work-project__lead">把 GitHub 技术信号转化为可解释的 SaaS 商机研究工作台，明确区分已观察事实、模型推断和待验证建议。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>系统</dt><dd>TypeScript · Node.js · SQLite</dd></div>
      <div><dt>客户端</dt><dd>响应式 Web 与 Flutter</dd></div>
      <div><dt>边界</dt><dd>可解释评分与人工审核</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/GithubStars" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
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

  <section class="work-project" id="ai-native-delivery" aria-labelledby="ai-native-delivery-title">
    <header class="work-project__header">
      <p class="work-project__number">04 / ONGOING RESEARCH / AI-NATIVE DELIVERY</p>
      <h2 id="ai-native-delivery-title">AI-Native Product Delivery</h2>
      <p class="work-project__lead">围绕 AI 原生软件交付的持续研究。我把《The Modern Software Developer》中的上下文工程、Agent 管理、自动验证、安全与生产反馈方法，应用到学习社区平台的规格、架构、实现和测试中。目标不是让 AI 取代工程判断，而是建立一条人定义意图、AI 协助执行、证据负责验收的可控流程。</p>
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
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="AI 原生产品交付研究图片，可左右滑动">
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram work-diagram--compact" role="img" aria-label="从意图与约束，经规格与决策、Agent 协作、测试与审查，到反馈沉淀的交付闭环">
            <span>意图<br>与约束</span><i>→</i>
            <span>规格<br>与决策</span><i>→</i>
            <span>Agent<br>协作</span><i>→</i>
            <span>测试<br>与审查</span><i>→</i>
            <span>反馈<br>沉淀</span>
          </div>
          <figcaption><span>01</span> 从一次性生成转向从意图到证据的可控闭环</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/ai-native-delivery/learning-platform-home.jpg" alt="学习社区平台课程首页，展示周计划、课程模块与学习进度" width="1280" height="720" loading="lazy">
          <figcaption><span>02</span> 学习社区平台：把产品规格落实为可操作的课程空间</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/ai-native-delivery/learning-platform-discussion.jpg" alt="学习社区平台班级讨论页面" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> 学习社区平台：围绕学习行为组织班级讨论</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project" id="autogoogleplay" aria-labelledby="autogoogleplay-title">
    <header class="work-project__header">
      <p class="work-project__number">05 / OPEN SOURCE / DATA + AI</p>
      <h2 id="autogoogleplay-title">AutoGooglePlayAnalyzer</h2>
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

  <section class="work-project" id="fatigue-research" aria-labelledby="fatigue-research-title">
    <header class="work-project__header">
      <p class="work-project__number">06 / RESEARCH PROTOTYPE / HUMAN–ROBOT INTERACTION</p>
      <h2 id="fatigue-research-title">机器人辅助深蹲训练中的疲劳识别</h2>
      <p class="work-project__lead">参与实验设计、数据采集与分析，结合主观疲劳评分、表面肌电和平台记录的运动学数据，比较不同指标如何反映疲劳。</p>
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
    <h2>想聊产品、AI 或软件系统？</h2>
    <div class="work-links">
      <a href="mailto:andy.caoyueyang@gmail.com">andy.caoyueyang@gmail.com ↗</a>
      <a href="https://github.com/GreatAndyC" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    </div>
  </footer>
</main>
{% endraw %}
