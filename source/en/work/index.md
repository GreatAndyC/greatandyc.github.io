---
title: Work
date: 2026-07-28 12:00:00
type: portfolio
layout: page
lang: en
description: Andy Cao's independent products, open-source software, and research projects.
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
      <p class="work-kicker">ANDY CAO / AI-NATIVE PRODUCT ENGINEER</p>
      <p class="work-intro__title" role="heading" aria-level="1"><span>Ideas into</span><span>products.</span></p>
      <p class="work-intro__lead">I design, build, and ship AI-native products—from product intent and interaction design to implementation, automated verification, and production learning.</p>
      <div class="work-intro__disciplines" aria-label="Core disciplines">
        <span>Product Design</span>
        <span>Software Engineering</span>
        <span>Applied AI</span>
      </div>
      <div class="work-links work-intro__links">
        <a href="#shiguangji">View selected work ↓</a>
        <a href="https://github.com/GreatAndyC" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        <a href="mailto:andy.caoyueyang@gmail.com">Email ↗</a>
      </div>
    </div>
    <figure class="work-intro__portrait">
      <img src="/images/CaoYueyang.png" alt="Portrait of Andy Cao" width="968" height="868">
      <figcaption><span>Andy Cao</span><span>Product · Engineering · AI</span></figcaption>
    </figure>
  </header>

  <header class="work-selection-heading">
    <p class="work-kicker">SELECTED WORK / 01—06</p>
    <p class="work-selection-heading__title" role="heading" aria-level="2">Selected Work</p>
  </header>

  <nav class="work-index" aria-label="Work index">
    <a href="#shiguangji"><span>01</span> Shiguangji</a>
    <a href="#wujian"><span>02</span> Wujian</a>
    <a href="#signalforge"><span>03</span> SignalForge</a>
    <a href="#ai-native-delivery"><span>04</span> AI Delivery Study</a>
    <a href="#autogoogleplay"><span>05</span> Review Analyzer</a>
    <a href="#fatigue-research"><span>06</span> Fatigue Research</a>
  </nav>

  <section class="work-project" id="shiguangji" aria-labelledby="shiguangji-title">
    <header class="work-project__header">
      <p class="work-project__number">01 / IOS PRODUCT / LIVE</p>
      <h2 id="shiguangji-title">Shiguangji</h2>
      <p class="work-project__lead">An AI-native food-management iOS app that I designed, built, and shipped from zero to one, turning meal photos and user history into nutrition estimates and personalized guidance.</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>Outcome</dt><dd>Live App Store product</dd></div>
      <div><dt>Core</dt><dd>Vision LLM · RAG · SwiftData</dd></div>
      <div><dt>Validation</dt><dd>TestFlight and real product UI</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://www.shiguangjiapp.com/" target="_blank" rel="noopener noreferrer">Product site ↗</a>
      <a href="/en/2026/03/23/ios-app-from-zero-vol1/">Build log 01 →</a>
      <a href="/en/2026/03/30/ios-app-from-zero-vol2/">Build log 02 →</a>
      <a href="/en/2026/04/23/ios-app-from-zero-vol3/">Build log 03 →</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>PROJECT VIEWS</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="Previous image">←</button>
          <button type="button" data-gallery-next aria-label="Next image">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="Shiguangji project images; swipe horizontally">
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/shiguangji/food-recognition-screen.webp" alt="Shiguangji photo-based meal recognition screen" width="720" height="1565" loading="lazy">
          <figcaption><span>01</span> Camera and AI food recognition</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/shiguangji/architecture.webp" alt="Shiguangji system architecture" width="1600" height="900" loading="lazy">
          <figcaption><span>02</span> Vision LLM, RAG, and local data layer</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--icon">
          <img src="/images/work/shiguangji/app-icon.webp" alt="Shiguangji app icon" width="512" height="512" loading="lazy">
          <figcaption><span>03</span> Product identity</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project" id="wujian" aria-labelledby="wujian-title">
    <header class="work-project__header">
      <p class="work-project__number">02 / OPEN SOURCE / FLUTTER</p>
      <h2 id="wujian-title">Wujian</h2>
      <p class="work-project__lead">A multimodal app for home organization, moving, and inventory. AI turns a photo into a structured draft; the user reviews it before anything is stored locally.</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>Version</dt><dd>Current repository version v1.0.4</dd></div>
      <div><dt>Reliability</dt><dd>21 automated tests and CI</dd></div>
      <div><dt>Principle</dt><dd>Local-first · Human-in-the-loop</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/Wujian_Flutter" target="_blank" rel="noopener noreferrer">GitHub repository ↗</a>
      <a href="https://github.com/GreatAndyC/Wujian_Flutter/blob/master/docs/releases/v1.0.4.md" target="_blank" rel="noopener noreferrer">v1.0.4 release notes ↗</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>PRODUCT UI + LOGIC</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>06</span></output>
          <button type="button" data-gallery-prev aria-label="Previous image">←</button>
          <button type="button" data-gallery-next aria-label="Next image">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="Wujian product UI and logic; swipe horizontally">
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/wujian/capture-queue.webp" alt="Wujian home screen with capture actions and pending-review metrics" width="1264" height="2499" loading="lazy">
          <figcaption><span>01</span> Capture entry, continuous recognition, and the pending-review queue</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/wujian/inventory-view.webp" alt="Wujian inventory view with search, filters, review state, and export" width="1264" height="2448" loading="lazy">
          <figcaption><span>02</span> Search, filter, and export confirmed inventory</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/wujian/model-settings.webp" alt="Wujian settings with multimodal model, token, and local-storage controls" width="1263" height="2459" loading="lazy">
          <figcaption><span>03</span> Multimodal model, token, and local-storage controls</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram" aria-label="Wujian recognition workflow">
            <span>Photo</span><i>→</i><span>AI draft</span><i>→</i><span>Human review</span><i>→</i><span>Local save</span>
          </div>
          <figcaption><span>04</span> AI accelerates; the person decides</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram work-diagram--stack" aria-label="Wujian reliability design">
            <span>Secure credentials</span><span>Compression and deduplication</span><span>Atomic save and backup</span><span>PDF / Excel / Markdown export</span>
          </div>
          <figcaption><span>05</span> Local-first reliability design</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--icon">
          <img class="work-app-icon work-app-icon--rounded-cutout" src="/images/work/wujian/app-icon.webp" alt="Wujian app icon" width="512" height="512" loading="lazy">
          <figcaption><span>06</span> Product identity</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project" id="signalforge" aria-labelledby="signalforge-title">
    <header class="work-project__header">
      <p class="work-project__number">03 / OPENAI BUILD WEEK / WORK + PRODUCTIVITY</p>
      <h2 id="signalforge-title">SignalForge</h2>
      <p class="work-project__lead">Built for OpenAI Build Week, SignalForge turns GitHub signals into explainable SaaS opportunities while separating evidence, model inference, and unvalidated ideas.</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>System</dt><dd>TypeScript · Node.js · SQLite</dd></div>
      <div><dt>Clients</dt><dd>Responsive Web and Flutter</dd></div>
      <div><dt>Boundary</dt><dd>Explainable scoring and human review</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/GithubStars" target="_blank" rel="noopener noreferrer">GitHub repository ↗</a>
      <a href="https://youtu.be/C_vdD40rpV0" target="_blank" rel="noopener noreferrer">Watch Build Week demo ↗</a>
      <a href="https://github.com/GreatAndyC/GithubStars#readme" target="_blank" rel="noopener noreferrer">Product and architecture ↗</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>WEB + MOBILE</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>04</span></output>
          <button type="button" data-gallery-prev aria-label="Previous image">←</button>
          <button type="button" data-gallery-next aria-label="Next image">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="SignalForge project images; swipe horizontally">
        <figure class="work-gallery__slide">
          <img src="/images/work/signalforge/cover.webp" alt="SignalForge opportunity radar overview" width="1600" height="1067" loading="lazy">
          <figcaption><span>01</span> Opportunity radar overview</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/signalforge/home-en.webp" alt="SignalForge home interface" width="1600" height="1000" loading="lazy">
          <figcaption><span>02</span> Signal collection and opportunity list</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/signalforge/project-en.webp" alt="SignalForge project analysis interface" width="1600" height="1000" loading="lazy">
          <figcaption><span>03</span> Explainable project analysis</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--phone">
          <img src="/images/work/signalforge/mobile-en.webp" alt="SignalForge Flutter mobile interface" width="720" height="1440" loading="lazy">
          <figcaption><span>04</span> Flutter mobile client</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--medium-title" id="ai-native-delivery" aria-labelledby="ai-native-delivery-title">
    <header class="work-project__header">
      <p class="work-project__number">04 / ONGOING RESEARCH / AI-NATIVE DELIVERY</p>
      <h2 id="ai-native-delivery-title">AI-Native Product Delivery</h2>
      <p class="work-project__lead">An ongoing study applying context engineering, agent management, automated verification, security, and production feedback to an evidence-led learning-platform workflow with human judgment in control.</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>Status</dt><dd>Ongoing research</dd></div>
      <div><dt>Method</dt><dd>Context · Specs · Human in the loop</dd></div>
      <div><dt>Testbed</dt><dd>Learning community platform</dd></div>
    </dl>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>METHOD + PRACTICE</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>04</span></output>
          <button type="button" data-gallery-prev aria-label="Previous image">←</button>
          <button type="button" data-gallery-next aria-label="Next image">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="AI-native product delivery research images; swipe horizontally">
        <figure class="work-gallery__slide">
          <img src="/images/work/ai-native-delivery/ai-native-product-delivery-workflow.webp" alt="Eight-stage AI-native product delivery workflow connecting research intent, Figma design, product specifications, human decisions, agent implementation, automated verification, release, and production learning" width="1672" height="941" loading="lazy">
          <figcaption><span>01</span> Figma-led delivery with human decisions and three evidence feedback loops</figcaption>
        </figure>
        <figure class="work-gallery__slide work-gallery__slide--diagram">
          <div class="work-diagram work-diagram--compact" role="img" aria-label="A delivery loop from intent and constraints through specifications and decisions, agent collaboration, tests and review, to retained feedback">
            <span>Intent &amp;<br>constraints</span><i>→</i>
            <span>Specs &amp;<br>decisions</span><i>→</i>
            <span>Agent<br>collaboration</span><i>→</i>
            <span>Tests &amp;<br>review</span><i>→</i>
            <span>Feedback<br>loop</span>
          </div>
          <figcaption><span>02</span> From one-shot generation to an evidence-led delivery loop</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/ai-native-delivery/learning-platform-home.jpg" alt="Learning community platform course home with weekly schedule, modules, and learner progress" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> Learning platform: turning product specifications into an actionable course space</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/ai-native-delivery/learning-platform-discussion.jpg" alt="Class discussion view in the learning community platform" width="1280" height="720" loading="lazy">
          <figcaption><span>04</span> Learning platform: organizing discussion around learning activity</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--compact-title" id="autogoogleplay" aria-labelledby="autogoogleplay-title">
    <header class="work-project__header">
      <p class="work-project__number">05 / OPEN SOURCE / DATA + AI</p>
      <h2 id="autogoogleplay-title">AutoGooglePlay Analyzer</h2>
      <p class="work-project__lead">An open-source system connecting Google Play review collection, persistent storage, and LLM Map-Reduce analysis in one pipeline, with a visual Web control surface.</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>Release</dt><dd>Public version v1.1.0</dd></div>
      <div><dt>Pipeline</dt><dd>Python · PostgreSQL · LLM</dd></div>
      <div><dt>Outputs</dt><dd>Markdown · PDF · JSON</dd></div>
    </dl>
    <div class="work-links">
      <a href="https://github.com/GreatAndyC/AutoGooglePlayAnalyzer" target="_blank" rel="noopener noreferrer">GitHub repository ↗</a>
      <a href="/en/2025/01/15/chatgpt-android-analysis-report/">Read the 1,116-review analysis →</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>PIPELINE + OUTPUT</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="Previous image">←</button>
          <button type="button" data-gallery-next aria-label="Next image">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="AutoGooglePlayAnalyzer project images; swipe horizontally">
        <figure class="work-gallery__slide">
          <img src="/images/work/autogoogleplay/dashboard-chatgpt.jpg" alt="ChatGPT review collection workspace in AutoGooglePlayAnalyzer" width="1280" height="720" loading="lazy">
          <figcaption><span>01</span> Actual collection workspace: ChatGPT package, sample size, and live log</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/autogoogleplay/ai-analysis-workspace.jpg" alt="AI batch-analysis workspace in AutoGooglePlayAnalyzer" width="1280" height="720" loading="lazy">
          <figcaption><span>02</span> Actual AI workspace: batching 1,116 reviews for LLM analysis</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/autogoogleplay/chatgpt-report-findings.jpg" alt="ChatGPT review findings in the AutoGooglePlayAnalyzer report viewer" width="1280" height="720" loading="lazy">
          <figcaption><span>03</span> Actual report: work and productivity lead at 26.91%, followed by coding and learning</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="work-project work-project--split-title" id="fatigue-research" aria-labelledby="fatigue-research-title fatigue-research-subtitle">
    <header class="work-project__header">
      <p class="work-project__number">06 / RESEARCH PROTOTYPE / HUMAN–ROBOT INTERACTION</p>
      <div class="work-project__title-group">
        <h2 id="fatigue-research-title">Fatigue Recognition</h2>
        <p class="work-project__subtitle" id="fatigue-research-subtitle">Robot-Assisted Squat Training</p>
      </div>
      <p class="work-project__lead">Research combining perceived exertion, surface EMG, and platform-recorded kinematics to compare fatigue indicators across experiment design, data collection, and analysis.</p>
    </header>
    <dl class="work-project__facts">
      <div><dt>Signals</dt><dd>RPE · sEMG · Velocity Loss</dd></div>
      <div><dt>Context</dt><dd>Robot-assisted squat training</dd></div>
      <div><dt>Work</dt><dd>Experiment, collection, and analysis</dd></div>
    </dl>
    <div class="work-links">
      <a href="/en/2026/05/03/msc-thesis-fatigue-recognition/">Read the research note →</a>
    </div>
    <div class="work-gallery-shell" data-work-gallery>
      <div class="work-gallery__toolbar">
        <span>RESEARCH VIEWS</span>
        <div class="work-gallery__controls">
          <output aria-live="polite"><b data-gallery-current>01</b> / <span data-gallery-total>03</span></output>
          <button type="button" data-gallery-prev aria-label="Previous image">←</button>
          <button type="button" data-gallery-next aria-label="Next image">→</button>
        </div>
      </div>
      <div class="work-gallery" data-gallery-track tabindex="0" aria-label="Fatigue-recognition research images; swipe horizontally">
        <figure class="work-gallery__slide">
          <img src="/images/work/research/training-robot.webp" alt="Robot-assisted squat training setup" width="717" height="538" loading="lazy">
          <figcaption><span>01</span> Robot-assisted training setup</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/research/data-collection-architecture.webp" alt="Fatigue-recognition data collection architecture" width="1600" height="900" loading="lazy">
          <figcaption><span>02</span> Multi-source data collection architecture</figcaption>
        </figure>
        <figure class="work-gallery__slide">
          <img src="/images/work/research/rpe-velocity-loss-overlay.webp" alt="RPE and velocity-loss comparison" width="1600" height="900" loading="lazy">
          <figcaption><span>03</span> Subjective fatigue and kinematic indicators</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <footer class="work-contact" id="contact">
    <p class="work-kicker">CONTACT</p>
    <p class="work-contact__title" role="heading" aria-level="2">Want to talk about products, AI, or software systems?</p>
    <div class="work-links">
      <a href="mailto:andy.caoyueyang@gmail.com">andy.caoyueyang@gmail.com ↗</a>
      <a href="https://github.com/GreatAndyC" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    </div>
  </footer>
</div>
{% endraw %}
