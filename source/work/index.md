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
      </div>
    </div>
    <figure class="work-intro__portrait">
      <img src="/images/CaoYueyang.png" alt="曹越洋个人肖像" width="968" height="868">
      <figcaption><span>曹越洋</span><span>产品 · 工程 · AI</span></figcaption>
    </figure>
  </header>

  <header class="work-selection-heading">
    <p class="work-kicker">精选作品 / 01—10</p>
    <p class="work-selection-heading__title" role="heading" aria-level="2">作品集</p>
  </header>
  <p class="work-build-note"><strong>时间口径：</strong>只统计主要产品功能、集成与上线加固的开发时间。Git 历史足够细时采用功能提交的活跃开发日；一次性导入基线的仓库采用对应本地开发会话计时。维护空档、纯文档更新和项目存续时间均不计入。</p>

  <nav class="work-index" aria-label="作品目录">
    <a href="#shiguangji"><span>01</span> 食光机</a>
    <a href="#photographhk"><span>02</span> PhotographHK</a>
    <a href="#wujian"><span>03</span> 物见</a>
    <a href="#signalforge"><span>04</span> SignalForge</a>
    <a href="#learning-community"><span>05</span> 学习社区</a>
    <a href="#provenance-lens"><span>06</span> 净图</a>
    <a href="#publishing-system"><span>07</span> 发布系统</a>
    <a href="#challengeforge"><span>08</span> ChallengeForge</a>
    <a href="#autogoogleplay"><span>09</span> 评论分析器</a>
    <a href="#fatigue-research"><span>10</span> 疲劳识别研究</a>
  </nav>

  <section class="work-project" id="shiguangji" aria-labelledby="shiguangji-title">
    <header class="work-project__header">
      <p class="work-project__number">01 / IOS 产品 / 已上线</p>
      <h2 id="shiguangji-title">食光机</h2>
      <p class="work-project__lead">一款从 0 到 1 独立设计、开发并上线的 AI 原生饮食管理 iOS App，把餐食照片和用户历史转化为营养估算与个性化建议。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>成果</dt><dd>App Store 产品上线</dd></div>
      <div><dt>核心</dt><dd>Vision LLM · RAG · SwiftData</dd></div>
      <div><dt>主要功能开发</dt><dd>核心功能与上线加固：52 个 Git 活跃开发日</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://www.shiguangjiapp.com/" target="_blank" rel="noopener noreferrer">产品官网 ↗</a>
      <a href="/2026/03/23/ios-app-from-zero-vol1/">开发记录 01 →</a>
      <a href="/2026/03/30/ios-app-from-zero-vol2/">开发记录 02 →</a>
      <a href="/2026/04/23/ios-app-from-zero-vol3/">开发记录 03 →</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>项目界面</span>
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

  <section class="work-project work-project--compact-title" id="photographhk" aria-labelledby="photographhk-title">
    <header class="work-project__header">
      <p class="work-project__number">02 / 私有项目 / 全栈内容系统</p>
      <h2 id="photographhk-title">PhotographHK</h2>
      <p class="work-project__lead">为摄影业务从 0 到 1 构建的双语作品站与内容后台：公开站负责项目叙事和询价转化，Payload CMS、PostgreSQL、权限边界、备份与自动化测试共同支撑上线前基线。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>主要功能开发</dt><dd>前台、CMS、询价与交付基线：约 20 小时</dd></div>
      <div><dt>系统</dt><dd>Next.js 16 · Payload · PostgreSQL</dd></div>
      <div><dt>验证</dt><dd>24 单元测试 · 33 E2E</dd></div>
    </dl>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>安全演示 / 本地构建</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="PhotographHK 本地演示界面，可左右滑动">
        <figure class="work-gallery__slide">
          <img src="/images/work/photographhk/home-demo.webp" alt="PhotographHK 本地双语摄影站首页演示" width="1280" height="720" loading="lazy">
          <figcaption><span>01</span> 明确标注为 Demo 的双语摄影站首页</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/photographhk/work-index-demo.webp" alt="PhotographHK 作品索引演示页面" width="1280" height="720" loading="lazy">
          <figcaption><span>02</span> 以项目叙事组织摄影作品</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/photographhk/project-detail-demo.webp" alt="PhotographHK 摄影项目详情演示页面" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> 项目详情、媒体与询价路径</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project" id="wujian" aria-labelledby="wujian-title">
    <header class="work-project__header">
      <p class="work-project__number">03 / 开源 / FLUTTER</p>
      <h2 id="wujian-title"><span>物见</span> <span class="work-project__latin-title">Wujian</span></h2>
      <p class="work-project__lead">面向家庭收纳、搬家整理和物品盘点的多模态应用。AI 先把照片转成结构化库存草稿，用户确认后再保存到本地。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>主要功能开发</dt><dd>主要功能 3 个活跃日 · 稳定性加固 2 个活跃日</dd></div>
      <div><dt>可靠性</dt><dd>21 项自动化测试与 CI</dd></div>
      <div><dt>原则</dt><dd>Local-first · Human-in-the-loop</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/Wujian_Flutter" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
      <a href="https://github.com/GreatAndyC/Wujian_Flutter/blob/master/docs/releases/v1.0.4.md" target="_blank" rel="noopener noreferrer">v1.0.4 发布说明 ↗</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>产品界面 + 业务逻辑</span>
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
      <p class="work-project__number">04 / OPENAI BUILD WEEK / 工作与效率</p>
      <h2 id="signalforge-title">SignalForge</h2>
      <p class="work-project__lead">为 OpenAI Build Week 构建，把 GitHub 技术信号转化为可解释的 SaaS 商机，并明确区分事实证据、模型推断和待验证建议。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>系统</dt><dd>TypeScript · Node.js · SQLite</dd></div>
      <div><dt>主要功能开发</dt><dd>核心产品与两轮迭代：约 24 小时</dd></div>
      <div><dt>边界</dt><dd>可解释评分与人工审核</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/GithubStars" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
      <a href="https://youtu.be/C_vdD40rpV0" target="_blank" rel="noopener noreferrer">观看 Build Week 演示 ↗</a>
      <a href="https://github.com/GreatAndyC/GithubStars#readme" target="_blank" rel="noopener noreferrer">产品与架构说明 ↗</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>网页端 + 移动端</span>
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

  <section class="work-project work-project--medium-title" id="learning-community" aria-labelledby="learning-community-title">
    <header class="work-project__header">
      <p class="work-project__number">05 / 私有项目 / AI 原生交付</p>
      <h2 id="learning-community-title"><span>学习社区</span> <span class="work-project__latin-title">Learning Community</span></h2>
      <p class="work-project__lead">把认证、课程、讨论与直播拆成可验证的纵向切片，并用 Firebase Emulator、Rules 测试、组件测试与 E2E 组成交付证据；产品判断由人掌握，Agent 负责组织、实现与复查。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>主要功能开发</dt><dd>认证、课程与直播纵向切片：4 个活跃开发日</dd></div>
      <div><dt>后端</dt><dd>Firebase Emulator · Rules · Callable</dd></div>
      <div><dt>验证</dt><dd>31 单元/组件 · 10 Rules · 4 E2E</dd></div>
    </dl>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>方法 + 实践</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>04</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="学习社区平台与 AI 原生交付流程图片，可左右滑动">
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
          <img src="/images/work/learning-community/home-demo.webp" alt="学习社区平台本地演示首页" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> 使用虚构课程与进度数据的本地首页</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/learning-community/discussion-demo.webp" alt="学习社区平台本地班级讨论演示页面" width="1280" height="720" loading="lazy">
          <figcaption><span>04</span> 用演示身份验证课程讨论纵向切片</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project" id="provenance-lens" aria-labelledby="provenance-lens-title">
    <header class="work-project__header">
      <p class="work-project__number">06 / 本地工具 / FLUTTER</p>
      <h2 id="provenance-lens-title"><span>净图</span> <span class="work-project__latin-title">Provenance Lens</span></h2>
      <p class="work-project__lead">一款本地优先的图片来源检查器，解析 C2PA / JUMBF、EXIF 与软件标签等可读线索，区分“发现了什么”和“能够证明什么”，并在不覆盖原图的前提下导出副本。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>主要功能开发</dt><dd>核心本地工具：约 30 小时</dd></div>
      <div><dt>核心</dt><dd>C2PA · JUMBF · EXIF · 指纹</dd></div>
      <div><dt>边界</dt><dd>本地处理 · 不覆盖原图 · 不夸大结论</dd></div>
    </dl>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>来源识别 + 隐私</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="净图项目素材与流程，可左右滑动">
        <figure class="work-gallery__slide">
          <img src="/images/work/provenance-lens/app-empty-state.webp" alt="在 macOS 上真实运行的净图批量图片检查初始界面" width="800" height="632" loading="lazy">
          <figcaption><span>01</span> Flutter 3.44.8 构建的真实 macOS 初始界面</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram" role="img" aria-label="净图从选择图片到解析来源线索、解释证据和导出副本的本地流程">
            <span>选择图片</span><i>→</i><span>解析线索</span><i>→</i><span>解释证据</span><i>→</i><span>导出副本</span>
          </div>
          <figcaption><span>02</span> 全程本地、保留原图的检查流程</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--icon">
          <img class="work-app-icon work-app-icon--rounded-cutout" src="/images/work/provenance-lens/app-icon.webp" alt="净图应用图标" width="1254" height="1254" loading="lazy">
          <figcaption><span>03</span> 净图应用图标</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--medium-title" id="publishing-system" aria-labelledby="publishing-system-title">
    <header class="work-project__header">
      <p class="work-project__number">07 / 在线系统 / 内容运营</p>
      <h2 id="publishing-system-title"><span>个人发布系统</span> <span class="work-project__latin-title">Personal Publishing System</span></h2>
      <p class="work-project__lead">不只是一个博客，而是一套双语内容生产系统：公开站、摄影画廊、本地 CMS、AI 排版与翻译、媒体管理和质量门禁共同形成从草稿到发布的可维护链路。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>主要功能开发</dt><dd>公开站、画廊与 CMS：20 个活跃开发日</dd></div>
      <div><dt>内容</dt><dd>24 组双语文章 · 28 个画廊来源</dd></div>
      <div><dt>质量</dt><dd>62 项测试 · Playwright · Axe · Lighthouse</dd></div>
    </dl>
    <div class="work-links">
      <a href="/zh-CN/">访问公开站 →</a>
      <a href="/gallery/">浏览摄影画廊 →</a>
      <a href="https://github.com/GreatAndyC/greatandyc.github.io" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>公开站 + 本地内容后台</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>06</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="个人发布系统公开站与本地 CMS，可左右滑动">
        <figure class="work-gallery__slide">
          <img src="/images/work/publishing-system/site-home.webp" alt="个人双语站点公开首页" width="1280" height="720" loading="lazy">
          <figcaption><span>01</span> 双语内容、分类与阅读入口</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/publishing-system/cms-articles-hku.webp" alt="香港大学主题下的本地 CMS 文章与双语编辑后台" width="1280" height="720" loading="lazy">
          <figcaption><span>02</span> 文章列表、双语编辑与发布设置</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/publishing-system/cms-gallery-hku.webp" alt="香港大学主题下的本地 CMS 画廊内容管理后台" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> 相册、双语元数据与主分类管理</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/publishing-system/cms-images-hku.webp" alt="香港大学主题下的本地 CMS 图片资源管理后台" width="1280" height="720" loading="lazy">
          <figcaption><span>04</span> 图片目录、上传与媒体资源管理</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/publishing-system/cms-themes.webp" alt="本地 CMS 的香港大学学校主题目录，不含私密配置" width="1280" height="720" loading="lazy">
          <figcaption><span>05</span> 香港大学主题系统，私密配置已隐藏</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/publishing-system/gallery.webp" alt="个人站点摄影画廊页面" width="1280" height="720" loading="lazy">
          <figcaption><span>06</span> 后台内容生成的可筛选摄影档案</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--compact-title" id="challengeforge" aria-labelledby="challengeforge-title">
    <header class="work-project__header">
      <p class="work-project__number">08 / 私有原型 / 机会情报</p>
      <h2 id="challengeforge-title">ChallengeForge</h2>
      <p class="work-project__lead">把公开 Devpost 赛事转成可操作的机会雷达：按奖金密度、竞争强度、AI 自动化适配与交付窗口排序，同时把资格、知识产权和最终提交保留为人工门槛。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>主要功能开发</dt><dd>机会雷达与决策管道：约 6 小时</dd></div>
      <div><dt>系统</dt><dd>Next.js · D1 · SSE · 公共数据</dd></div>
      <div><dt>边界</dt><dd>事实 / 评分代理 / 人工决定分层</dd></div>
    </dl>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>公开 DEVPOST 数据快照</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="上一张">←</button>
          <button type="button" data-gallery-next aria-label="下一张">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="ChallengeForge 公共赛事数据界面，可左右滑动">
        <figure class="work-gallery__slide">
          <img src="/images/work/challengeforge/radar-live.webp" alt="ChallengeForge 基于公开 Devpost 数据的机会雷达" width="1280" height="720" loading="lazy">
          <figcaption><span>01</span> 公共赛事快照与可解释评分</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/challengeforge/ai-filter.webp" alt="ChallengeForge 的 Machine Learning AI 赛事筛选状态" width="1280" height="720" loading="lazy">
          <figcaption><span>02</span> 按 AI 主题收敛候选机会</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/challengeforge/prize-sort.webp" alt="ChallengeForge 按奖金池排序的公开赛事页面" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> 以不同代理指标切换决策视角</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--compact-title" id="autogoogleplay" aria-labelledby="autogoogleplay-title">
    <header class="work-project__header">
      <p class="work-project__number">09 / 开源 / 数据 + AI</p>
      <h2 id="autogoogleplay-title">AutoGooglePlay Analyzer</h2>
      <p class="work-project__lead">一个把 Google Play 评论采集、持久化和 LLM Map-Reduce 分析串成完整流程的开源工具，并提供可视化 Web 控制台。</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>主要功能开发</dt><dd>核心管道 2 个活跃日 · Dashboard 1 个活跃日</dd></div>
      <div><dt>管道</dt><dd>Python · PostgreSQL · LLM</dd></div>
      <div><dt>输出</dt><dd>Markdown · PDF · JSON</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/AutoGooglePlayAnalyzer" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
      <a href="/2025/01/15/chatgpt-android-analysis-report/">阅读 1,116 条评论分析 →</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>数据管道 + 分析输出</span>
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
      <p class="work-project__number">10 / 研究原型 / 人机协作</p>
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
        <span>研究视图</span>
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
    <p class="work-kicker">联系</p>
    <p class="work-contact__title" role="heading" aria-level="2">想聊产品、AI 或软件系统？</p>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC" target="_blank" rel="noopener noreferrer">通过 GitHub 联系 ↗</a>
    </div>
  </footer>
</div>
{% endraw %}
