const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const configuredAssetVersion = fs
  .readFileSync(path.join(root, '_config.yml'), 'utf8')
  .match(/^asset_version:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1];
const assetVersion = process.env.ASSET_VERSION?.slice(0, 12) || configuredAssetVersion;

const pageMatrix = [
  {
    file: 'index.html',
    language: 'en',
    links: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    file: 'en/index.html',
    language: 'en',
    links: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    file: 'zh-CN/index.html',
    language: 'zh-CN',
    links: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  },
  {
    file: 'about/index.html',
    language: 'zh-CN',
    links: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  },
  {
    file: 'gallery/index.html',
    language: 'zh-CN',
    links: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  },
  {
    file: 'work/index.html',
    language: 'zh-CN',
    links: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  },
  {
    file: 'en/about/index.html',
    language: 'en',
    links: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    file: 'en/gallery/index.html',
    language: 'en',
    links: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    file: 'en/work/index.html',
    language: 'en',
    links: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  }
];

const workPages = [
  { file: 'work/index.html', alternate: '/en/work/index.html' },
  { file: 'en/work/index.html', alternate: '/work/index.html' }
];

const projectIds = [
  'shiguangji',
  'photographhk',
  'wujian',
  'signalforge',
  'learning-community',
  'provenance-lens',
  'publishing-system',
  'challengeforge',
  'autogoogleplay',
  'fatigue-research'
];

function readPublic(relativePath) {
  const absolutePath = path.join(publicDir, relativePath);
  assert.ok(fs.existsSync(absolutePath), `missing generated file: public/${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

function readSource(relativePath) {
  const absolutePath = path.join(root, relativePath);
  assert.ok(fs.existsSync(absolutePath), `missing source file: ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

function menuHref(html, item) {
  const itemPattern = new RegExp(
    `<li class="menu-item menu-item-${item}">([\\s\\S]*?)<\\/li>`
  );
  const itemHtml = html.match(itemPattern)?.[1];
  return itemHtml?.match(/<a href="([^"]+)"/)?.[1];
}

test('core pages keep the localized Home, About, Work, and Gallery menu', () => {
  assert.ok(assetVersion, 'asset_version must be configured');

  pageMatrix.forEach(({ file, language, links }) => {
    const html = readPublic(file);

    assert.match(html, new RegExp(`<html lang="${language}">`), `${file} has the wrong language`);

    Object.entries(links).forEach(([item, expectedHref]) => {
      assert.equal(
        menuHref(html, item),
        expectedHref,
        `${file} has the wrong ${item} menu destination`
      );
    });
  });
});

test('home feeds publish twelve cards per page and keep one shared desktop rail', () => {
  const html = readPublic('zh-CN/index.html');
  const postCount = (html.match(/class="post-block/g) || []).length;

  assert.equal(postCount, 12, 'the localized homepage should publish twelve posts per page');
  assert.match(html, /class="site-rail"/, 'the page should render one shared navigation rail');
  assert.match(
    html,
    /class="sidebar-layout-spacer"/,
    'the content layout should reserve the rail gutter without duplicating the sidebar'
  );
});

test('core pages request the versioned stylesheet to avoid stale deployment CSS', () => {
  pageMatrix.forEach(({ file }) => {
    const html = readPublic(file);
    const expectedAsset = `/css/main.css?v=${assetVersion}`;

    assert.ok(html.includes(`href="${expectedAsset}"`), `${file} is missing ${expectedAsset}`);
    assert.ok(!html.includes('href="/css/main.css"'), `${file} still requests unversioned CSS`);
  });
});

test('home category controls use the feed-aligned responsive layout', () => {
  const html = readPublic('zh-CN/index.html');
  const css = readPublic('css/main.css');
  const filterScript = readPublic('js/home-category-filter.js');

  assert.match(
    html,
    /class="home-category-nav-shell"[\s\S]*data-category-scroller[\s\S]*data-category-scroll-hint/,
    'the category rail should expose a scroll hint wrapper for overflow states'
  );
  assert.match(
    filterScript,
    /function syncCategoryScrollHint\(panel\)/,
    'the category rail should detect overflow and update its hint while scrolling'
  );

  assert.ok(
    css.includes('grid-template-columns: auto minmax(0, 1fr) auto;')
      && css.includes('grid-template-areas: "heading navigation tools";'),
    'the desktop category panel must align the heading, categories, and tools on one rail'
  );
  assert.ok(
    css.includes('box-sizing: border-box;')
      && css.includes('width: 100%;')
      && css.includes('max-width: none;'),
    'the category panel must fill the same bounded content track as the feed'
  );
  assert.ok(
    css.includes('@media (max-width: 1199px)')
      && css.includes('grid-template-areas: "heading" "navigation" "tools";'),
    'tablet widths must stack the category panel into predictable rows'
  );
  assert.ok(
    css.includes('grid-template-rows: 44px 44px;')
      && css.includes('.home-category-nav::-webkit-scrollbar'),
    'mobile controls must provide touch-sized actions and a contained category scroller'
  );
  assert.ok(
    css.includes('border-bottom: 2px solid transparent;')
      && css.includes('box-shadow: inset 0 -2px 0 var(--text-color);'),
    'category and sort states must use the editorial underline treatment instead of filled pills'
  );
});

test('home feed metadata remains readable in English cards and list dates', () => {
  const englishHtml = readPublic('en/index.html');
  const css = readPublic('css/main.css');

  assert.match(
    englishHtml,
    /post-meta-item-text post-meta-item-text-compact[^>]*>Words:/,
    'English cards should use the compact Words label'
  );
  assert.match(
    englishHtml,
    /post-meta-item-count[^>]*aria-label="Symbols count in article:/,
    'the compact English label should retain the full accessible description'
  );
  assert.ok(
    css.includes('.main .content.feed-page.feed-view-card .post-meta .post-meta-item-text-full')
      && css.includes('.main .content.feed-page.feed-view-card .post-meta .post-meta-item-text-compact')
      && css.includes('grid-template-columns: minmax(0, max-content);'),
    'card metrics need compact labels while list metadata needs a dedicated date column'
  );
  assert.match(
    css,
    /feed-view-list \.post-meta \.post-meta-item-created,[\s\S]*feed-view-list \.post-meta \.post-meta-item-updated/,
    'list view should keep both publication and update dates visible'
  );
});

test('home feed opens as an editorial index and keeps the visual grid alternative', () => {
  const html = readPublic('zh-CN/index.html');
  const css = readPublic('css/main.css');
  const filterScript = readPublic('js/home-category-filter.js');

  assert.match(
    html,
    /class="home-view-button is-active"[^>]*data-view-mode="list"/,
    'the localized homepage should make the readable index the no-script default'
  );
  assert.ok(
    css.includes('.main .content.feed-page.feed-view-card .feed-posts-container')
      && css.includes('grid-template-columns: repeat(3, minmax(0, 1fr));')
      && css.includes('.main .content.feed-page.feed-view-list .post-body > .post-gallery.post-gallery'),
    'the feed should ship both a structured grid and a thumbnail-led index layout'
  );
  assert.match(
    filterScript,
    /let initialMode = 'list';/,
    'the client-side default should match the no-script index layout'
  );
});

test('core pages expose the AC brand mark and complete favicon metadata', () => {
  pageMatrix.forEach(({ file }) => {
    const html = readPublic(file);
    const version = `?v=${assetVersion}`;

    assert.match(html, /class="site-brand-mark"/, `${file} is missing the AC header mark`);
    assert.match(
      html,
      /class="site-brand-mark"[\s\S]*?src="\/images\/brand\/ac-mark-light\.svg"/,
      `${file} uses the wrong AC header mark`
    );
    assert.ok(
      html.includes(`rel="shortcut icon" type="image/x-icon" href="/favicon.ico${version}"`),
      `${file} is missing the versioned root favicon`
    );
    assert.ok(
      html.includes(
        `rel="icon" type="image/svg+xml" sizes="any" href="/images/brand/favicon.svg${version}"`
      ),
      `${file} is missing the versioned SVG favicon`
    );
    assert.ok(
      html.includes(
        `rel="apple-touch-icon" sizes="180x180" href="/images/brand/apple-touch-icon.png${version}"`
      ),
      `${file} is missing the branded Apple touch icon`
    );
    assert.ok(
      html.includes(
        `rel="icon" type="image/png" sizes="32x32" href="/images/brand/favicon-32.png${version}"`
      ),
      `${file} is missing the branded 32px favicon`
    );
    assert.ok(
      html.includes(
        `rel="icon" type="image/png" sizes="16x16" href="/images/brand/favicon-16.png${version}"`
      ),
      `${file} is missing the branded 16px favicon`
    );
    assert.ok(
      html.includes(`rel="manifest" href="/images/brand/site.webmanifest${version}"`),
      `${file} is missing the branded web manifest`
    );
  });
});

test('core pages expose semantic mobile navigation, skip links, and localized metadata', () => {
  const zh = readPublic('zh-CN/index.html');
  const en = readPublic('en/index.html');

  [zh, en].forEach((html, index) => {
    assert.match(html, /<button[\s\S]*class="toggle"[\s\S]*type="button"[\s\S]*aria-expanded="false"[\s\S]*aria-controls="site-navigation"/);
    assert.match(html, /<nav id="site-navigation" class="site-nav"/);
    assert.match(html, /class="skip-link" href="#main-content"/);
    assert.match(html, /rel="alternate" hreflang="en"/);
    assert.match(html, /rel="alternate" hreflang="zh-CN"/);
    assert.match(html, /rel="alternate" hreflang="x-default"/);
    assert.match(
      html,
      index === 0
        ? /<link rel="alternate" hreflang="en" href="https:\/\/caoyueyang\.org\/">/
        : /<link rel="alternate" hreflang="zh-CN" href="https:\/\/caoyueyang\.org\/zh-CN\/">/
    );
    assert.doesNotMatch(html, /rel="alternate"[^>]+href="[^"]+index\.html"/);
    assert.match(html, /class="menu-section-label"/);
    assert.match(html, /class="mobile-rail-links"/);
    assert.match(html, /class="mobile-rail-link"[^>]*>[\s\S]*<span>GitHub<\/span>/);
    assert.match(
      html,
      index === 0
        ? /<span>走向世界<\/span>/
        : /<span>Explore the World<\/span>/
    );
    assert.match(
      html,
      index === 0
        ? /<meta name="description" content="AI 产品、软件系统与应用研究">/
        : /<meta name="description" content="AI products, software systems, and applied research">/
    );
  });

  const css = readPublic('css/main.css');
  assert.match(
    css,
    /\.menu-section-label\s*\{[\s\S]*list-style: none;[\s\S]*text-align: left;/,
    'the Explore menu section label should be a clean, left-aligned heading without a browser-default bullet'
  );
});

test('the fixed desktop rail cannot escape the viewport during root overscroll', () => {
  const css = readPublic('css/main.css');

  assert.match(
    css,
    /html,\s*body\s*\{[\s\S]*overscroll-behavior-y:\s*none;/,
    'the document root should suppress elastic top and bottom overscroll'
  );
  assert.match(
    css,
    /\.site-rail\s*\{[\s\S]*overscroll-behavior-y:\s*none;/,
    'the fixed navigation rail should keep its own scroll boundary contained'
  );
});

test('post detail sidebars prioritize the table of contents without a redundant overview switch', () => {
  const post = readPublic('2026/05/15/manus/index.html');
  const work = readPublic('work/index.html');

  assert.match(post, /class="sidebar-nav-toc"/, 'post details should retain their table of contents');
  assert.match(post, /class="sidebar[^\"]*sidebar-with-toc/, 'post details should mark the active table-of-contents rail');
  assert.match(
    post,
    /class="sidebar-nav-overview" hidden aria-hidden="true"/,
    'post details with a table of contents should hide the Overview switch'
  );
  assert.match(
    post,
    /class="site-overview-wrap sidebar-panel" hidden aria-hidden="true"/,
    'post details with a table of contents should hide the second sidebar panel'
  );
  assert.match(
    work,
    /class="sidebar-nav-overview"/,
    'Work should keep the site overview panel alongside its project index'
  );
  assert.doesNotMatch(
    work,
    /class="sidebar-nav-overview" hidden aria-hidden="true"/,
    'Work should leave the site overview switch available'
  );
});

test('index and gallery covers reserve space and prioritize only the first visible image', () => {
  const home = readPublic('zh-CN/index.html');
  const gallery = readPublic('gallery/index.html');
  const article = readPublic('2026/05/15/manus/index.html');

  assert.match(
    home,
    /<img[\s\S]*width="1280"[\s\S]*height="800"[\s\S]*loading="eager"[\s\S]*fetchpriority="high"/
  );
  assert.match(home, /<img[\s\S]*loading="lazy"[\s\S]*decoding="async"/);
  assert.match(
    gallery,
    /gallery-album-cover[\s\S]*?<img[\s\S]*loading="eager"[\s\S]*fetchpriority="high"/
  );
  assert.match(gallery, /gallery-album-cover[\s\S]*?<img[\s\S]*loading="lazy"/);
  assert.match(article, /<img[\s\S]*loading="eager"[\s\S]*fetchpriority="high"/);
  assert.match(article, /<img[\s\S]*loading="lazy"[\s\S]*decoding="async"/);
});

test('ChatGPT Android report keeps its English translation aligned with the Chinese source', () => {
  const zh = readSource('source/_posts/2025-01-15-chatgpt-android-analysis-report.zh-CN.md');
  const en = readSource('source/_posts/2025-01-15-chatgpt-android-analysis-report.en.md');
  const imagePaths = content => [...content.matchAll(/!\[[^\]]*\]\((\/images\/[^)]+)\)/g)]
    .map(match => match[1]);

  assert.deepEqual(
    imagePaths(en),
    imagePaths(zh),
    'the English report must keep the same figures and image order as the Chinese report'
  );
  assert.match(en, /^## 1\. Background Analysis$/m);
  assert.match(en, /^## 2\. Methods and Environment$/m);
  assert.match(en, /^## 3\. Product Overview$/m);
  assert.match(en, /^## 4\. Product Analysis$/m);
  assert.match(en, /^## 5\. User Feedback$/m);
  assert.match(en, /^## 6\. Competitor Analysis$/m);
  assert.match(en, /^## 7\. Conclusion$/m);
  assert.match(en, /1,116/);
  assert.match(en, /1,967/);
  assert.match(en, /13\.09%/);
  assert.match(en, /Google Play Weakness Statistics/);
  assert.match(en, /Zapier, 2025/);
  assert.doesNotMatch(en, /References are kept in the original Chinese article/);
});

test('every bilingual post keeps its figures, tables, and top-level sections aligned', () => {
  const postsDir = path.join(root, 'source', '_posts');
  const imagePaths = content => [...content.matchAll(/(?:!\[[^\]]*\]\(|<img[^>]+src=["'])([^)"']+)/g)]
    .map(match => match[1].split('?')[0]);
  const tableRows = content => content.match(/^\|.*\|$/gm) || [];
  const topLevelSections = content => content.match(/^##\s+.+$/gm) || [];
  const chinesePosts = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.zh-CN.md'))
    .sort();

  assert.ok(chinesePosts.length > 0, 'no Chinese source posts were found');

  chinesePosts.forEach(chineseFile => {
    const englishFile = chineseFile.replace(/\.zh-CN\.md$/, '.en.md');
    const chinesePath = path.join(postsDir, chineseFile);
    const englishPath = path.join(postsDir, englishFile);
    assert.ok(fs.existsSync(englishPath), `${chineseFile} is missing its English pair`);

    const chinese = fs.readFileSync(chinesePath, 'utf8');
    const english = fs.readFileSync(englishPath, 'utf8');

    assert.deepEqual(
      imagePaths(english),
      imagePaths(chinese),
      `${englishFile} must keep the same local figures and image order as ${chineseFile}`
    );
    assert.equal(
      tableRows(english).length,
      tableRows(chinese).length,
      `${englishFile} must keep the same Markdown table structure as ${chineseFile}`
    );
    assert.ok(
      topLevelSections(english).length >= topLevelSections(chinese).length,
      `${englishFile} must not drop top-level sections from ${chineseFile}`
    );
  });
});

test('legacy NexT icon URLs now resolve to the AC identity', () => {
  const pairs = [
    ['source/images/brand/apple-touch-icon.png', 'themes/next/source/images/apple-touch-icon-next.png'],
    ['source/images/brand/favicon-16.png', 'themes/next/source/images/favicon-16x16-next.png'],
    ['source/images/brand/favicon-32.png', 'themes/next/source/images/favicon-32x32-next.png']
  ];

  pairs.forEach(([brandPath, legacyPath]) => {
    assert.deepEqual(
      fs.readFileSync(path.join(root, legacyPath)),
      fs.readFileSync(path.join(root, brandPath)),
      `${legacyPath} still contains the NexT identity`
    );
  });

  const legacyLogo = fs.readFileSync(
    path.join(root, 'themes/next/source/images/logo.svg'),
    'utf8'
  );
  assert.ok(!legacyLogo.includes('id="NexT"'), 'legacy logo.svg still contains the NexT logo');
  assert.match(legacyLogo, /stroke="#F5F2EE"/, 'legacy logo.svg is not the AC favicon');
});

test('localized pages use their matching large social card', () => {
  pageMatrix.forEach(({ file, language }) => {
    const html = readPublic(file);
    const card = language === 'en' ? 'social-card-en.jpg' : 'social-card-zh.jpg';
    const expectedImage = `https://caoyueyang.org/images/brand/${card}`;

    assert.ok(
      html.includes(`<meta property="og:image" content="${expectedImage}">`),
      `${file} is missing ${card}`
    );
    assert.ok(
      html.includes('<meta name="twitter:card" content="summary_large_image">'),
      `${file} is not configured for a large Twitter card`
    );
    assert.ok(
      html.includes(`<meta name="twitter:image" content="${expectedImage}">`),
      `${file} is missing the localized Twitter image`
    );
  });
});

test('Work pages publish their project-specific localized descriptions', () => {
  const english = readPublic('en/work/index.html');
  const chinese = readPublic('work/index.html');

  assert.ok(
    english.includes(
      '<meta name="description" content="Andy Cao&#39;s independent products, open-source software, and research projects.">'
    )
  );
  assert.ok(
    chinese.includes(
      '<meta name="description" content="曹越洋的独立产品、开源软件与研究型项目。">'
    )
  );
});

test('bilingual About pages share the updated positioning, background, and concise CTA', () => {
  const expectations = [
    {
      file: 'about/index.html',
      positioning: '曹越洋 · AI 产品工程师 &#x2F; 系统构建者',
      focus: '我关注 Applied AI、AI Software、Research Software 和 AI-native Product Engineering。',
      background: '我的经历横跨产品分析、跨平台应用、数据与 AI 工作流、应用研究和系统实现',
      degree: '工学硕士：工业工程与物流管理',
      researchRole: '我的研究兴趣包括机器人辅助训练、人机交互和多模态数据分析',
      portraitAlt: '曹越洋个人肖像',
      workHref: '/work/',
      removedCopy: ['目前我居住在香港', '超过三年的 AI 产品使用、调研与实践积累', '约一年的业界项目和软件交付经历', '数据与系统工程系（Department of Data and Systems Engineering）']
    },
    {
      file: 'en/about/index.html',
      positioning: 'Andy Cao · AI Product Engineer &amp; Systems Builder',
      focus: 'I focus on Applied AI, AI Software, Research Software, and AI-native Product Engineering.',
      background: 'My work has crossed product analysis, cross-platform applications, data and AI workflows, applied research, and systems implementation',
      degree: 'MSc(Eng) in Industrial Engineering and Logistics Management',
      researchRole: 'My research interests include robotic training, human–robot interaction, and multimodal data analysis',
      portraitAlt: 'Portrait of Andy Cao',
      workHref: '/en/work/',
      removedCopy: ['I am currently based in Hong Kong', 'more than three years of hands-on AI product use', 'approximately one year of industry project and software-delivery experience', 'Department of Data and Systems Engineering']
    }
  ];

  expectations.forEach(expectation => {
    const html = readPublic(expectation.file);

    [
      expectation.positioning,
      expectation.focus,
      expectation.background,
      expectation.degree,
      expectation.researchRole
    ].forEach(copy => {
      assert.ok(html.includes(copy), `${expectation.file} is missing updated copy: ${copy}`);
    });

    expectation.removedCopy.forEach(copy => {
      assert.ok(!html.includes(copy), `${expectation.file} still contains removed copy: ${copy}`);
    });
    assert.ok(!html.includes('andy.caoyueyang@gmail.com'), `${expectation.file} must not expose the personal email`);

    assert.ok(
      html.includes(`src="/images/CaoYueyang.png" alt="${expectation.portraitAlt}"`),
      `${expectation.file} is missing an accessible portrait`
    );
    assert.ok(
      html.includes(`class="profile-actions"`) && html.includes(`href="${expectation.workHref}"`),
      `${expectation.file} is missing its localized Work CTA`
    );
    assert.ok(html.includes('AI-native product delivery'), `${expectation.file} is missing current focus`);

    ['Core Work', 'Related Writing', '核心项目', '技术栈', 'ShiguangJi', 'Wujian', 'SignalForge'].forEach(
      legacyCopy => {
        assert.ok(!html.includes(legacyCopy), `${expectation.file} still contains ${legacyCopy}`);
      }
    );
    assert.ok(!/href="[^"]*(?:cv|resume)[^"]*"/i.test(html), `${expectation.file} must not link a CV`);
  });

  const css = readPublic('css/main.css');
  assert.ok(css.includes('.profile-actions'), 'built CSS is missing the About CTA layout');
  assert.ok(
    css.includes('.profile-avatar-frame > a'),
    'built CSS must make the NexT portrait wrapper fill the circular frame'
  );
  assert.ok(
    css.includes('.profile-avatar-frame .image-caption'),
    'built CSS must suppress the NexT image caption inside the portrait frame'
  );
  assert.match(
    css,
    /\.profile-avatar-frame \.profile-avatar\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover[^}]*transform:\s*none[^}]*max-width:\s*none/,
    'built CSS must render the portrait as a complete square inside the circular frame'
  );
});

test('portfolio pages have ten projects and a ten-item flat NexT table of contents', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);

    assert.ok(html.includes('class="post-block page-type-portfolio"'));
    assert.ok(html.includes('<aside class="sidebar'), `${file} is missing the NexT sidebar`);
    assert.ok(html.includes('class="post-toc'), `${file} is missing the generated TOC`);

    projectIds.forEach(projectId => {
      assert.equal(
        (html.match(new RegExp(`id="${projectId}"`, 'g')) || []).length,
        1,
        `${file} must contain project #${projectId} exactly once`
      );
      assert.ok(
        html.includes(`href="#${projectId}-title"`),
        `${file} TOC is missing project #${projectId}`
      );
    });

    const tocHtml = html.match(/<div class="post-toc motion-element">([\s\S]*?)<\/div>/)?.[1] || '';
    assert.equal(
      (tocHtml.match(/class="nav-item/g) || []).length,
      projectIds.length,
      `${file} TOC must contain exactly ten project entries`
    );
    assert.ok(!tocHtml.includes('Selected Work'), `${file} TOC must not include the page hero`);
    assert.ok(!tocHtml.includes('作品集'), `${file} TOC must not include the page hero`);
    assert.ok(!tocHtml.includes('Want to talk'), `${file} TOC must not include the contact block`);
    assert.ok(!tocHtml.includes('想聊产品'), `${file} TOC must not include the contact block`);
    assert.ok(!tocHtml.includes('nav-number'), `${file} TOC must not show numeric prefixes`);
  });
});

test('software case studies disclose major-feature build time without counting project age', () => {
  const softwareProjectIds = projectIds.filter(projectId => projectId !== 'fatigue-research');
  const expectedBuildTimes = {
    'work/index.html': {
      shiguangji: '核心功能与上线加固：52 个 Git 活跃开发日',
      photographhk: '前台、CMS、询价与交付基线：约 20 小时',
      wujian: '主要功能 3 个活跃日 · 稳定性加固 2 个活跃日',
      signalforge: '核心产品与两轮迭代：约 24 小时',
      'learning-community': '认证、课程与直播纵向切片：4 个活跃开发日',
      'provenance-lens': '核心本地工具：约 30 小时',
      'publishing-system': '公开站、画廊与 CMS：20 个活跃开发日',
      challengeforge: '机会雷达与决策管道：约 6 小时',
      autogoogleplay: '核心管道 2 个活跃日 · Dashboard 1 个活跃日'
    },
    'en/work/index.html': {
      shiguangji: 'Core features + release hardening: 52 active Git days',
      photographhk: 'Frontend, CMS, inquiry flow + delivery baseline: ~20 hours',
      wujian: 'Major features: 3 active days · hardening: 2 active days',
      signalforge: 'Core product + two iteration rounds: ~24 hours',
      'learning-community': 'Auth, course + live-session slices: 4 active days',
      'provenance-lens': 'Core local tool: ~30 hours',
      'publishing-system': 'Public site, gallery + CMS: 20 active days',
      challengeforge: 'Opportunity radar + decision pipeline: ~6 hours',
      autogoogleplay: 'Core pipeline: 2 active days · dashboard: 1 active day'
    }
  };

  workPages.forEach(({ file }) => {
    const html = readPublic(file);

    assert.ok(
      html.includes('class="work-build-note"'),
      `${file} must explain how build durations are measured`
    );
    assert.ok(
      html.includes(file.startsWith('en/') ? 'project age are excluded' : '项目存续时间均不计入'),
      `${file} must explicitly exclude project age and maintenance gaps`
    );
    ['10 months', '9 weeks', '16 days', '8 days', '11 months', '11 days', '10 个月', '约 9 周', '约 16 天', '8 天完成', '11 个月', '11 天完成'].forEach(
      misleadingDuration => {
        assert.ok(
          !html.includes(misleadingDuration),
          `${file} must not retain elapsed project-span wording: ${misleadingDuration}`
        );
      }
    );

    softwareProjectIds.forEach(projectId => {
      const section = html.match(
        new RegExp(`<section class="[^"]*" id="${projectId}"[\\s\\S]*?<\\/section>`)
      )?.[0];

      assert.ok(section, `${file} is missing project section ${projectId}`);
      assert.match(
        section,
        /<dt>(?:主要功能开发|Core build time)<\/dt>/,
        `${file} ${projectId} must label major-feature build time`
      );
      assert.ok(
        section.includes(expectedBuildTimes[file][projectId]),
        `${file} ${projectId} must show the recalculated major-feature build time`
      );
    });
  });
});

test('portfolio hero introduces the maker without turning the project index into a résumé', () => {
  const expectations = [
    {
      file: 'work/index.html',
      kicker: '曹越洋 / AI 原生产品工程师',
      title: '想法变成<br>产品。',
      disciplines: ['产品设计', '软件工程', '应用 AI'],
      portraitAlt: '曹越洋个人肖像',
      sectionTitle: '作品集'
    },
    {
      file: 'en/work/index.html',
      kicker: 'ANDY CAO / AI-NATIVE PRODUCT ENGINEER',
      title: '<span>Ideas into</span><span>products.</span>',
      disciplines: ['Product Design', 'Software Engineering', 'Applied AI'],
      portraitAlt: 'Portrait of Andy Cao',
      sectionTitle: 'Selected Work'
    }
  ];

  expectations.forEach(({ file, kicker, title, disciplines, portraitAlt, sectionTitle }) => {
    const html = readPublic(file);
    const hero = html.match(/<header class="work-intro">([\s\S]*?)<\/header>/)?.[1] || '';

    assert.ok(hero.includes(kicker), `${file} is missing the positioning statement`);
    assert.ok(hero.includes(title), `${file} is missing the editorial hero title`);
    assert.ok(
      hero.includes(`src="/images/CaoYueyang.png" alt="${portraitAlt}"`),
      `${file} is missing the shared portrait`
    );
    disciplines.forEach(discipline => {
      assert.ok(hero.includes(discipline), `${file} is missing discipline ${discipline}`);
    });
    assert.ok(
      html.includes(
        `<p class="work-selection-heading__title" role="heading" aria-level="2">${sectionTitle}</p>`
      ),
      `${file} is missing its selected-work section heading`
    );
    assert.ok(
      !/experience|employment|工作经历|职业履历/i.test(hero),
      `${file} hero must remain portfolio positioning rather than career history`
    );
  });

  assert.ok(
    fs.existsSync(path.join(publicDir, 'images/CaoYueyang.png')),
    'the portrait must be copied into the generated site'
  );
});

test('portfolio chrome follows the language of each Work page', () => {
  const chineseHtml = readPublic('work/index.html');
  const englishHtml = readPublic('en/work/index.html');

  [
    '精选作品 / 01—10',
    '项目界面',
    '安全演示 / 本地构建',
    '产品界面 + 业务逻辑',
    '网页端 + 移动端',
    '方法 + 实践',
    '来源识别 + 隐私',
    '公开站 + 本地内容后台',
    '公开 DEVPOST 数据快照',
    '数据管道 + 分析输出',
    '研究视图'
  ].forEach(copy => {
    assert.ok(chineseHtml.includes(copy), `Chinese Work page is missing localized copy: ${copy}`);
    assert.ok(!englishHtml.includes(copy), `English Work page contains Chinese chrome: ${copy}`);
  });

  [
    'SELECTED WORK / 01—10',
    'PROJECT VIEWS',
    'SAFE DEMO / LOCAL BUILD',
    'PRODUCT UI + LOGIC',
    'WEB + MOBILE',
    'METHOD + PRACTICE',
    'PROVENANCE + PRIVACY',
    'PUBLIC SITE + LOCAL CMS',
    'PUBLIC DEVPOST SNAPSHOT',
    'PIPELINE + OUTPUT',
    'RESEARCH VIEWS'
  ].forEach(copy => {
    assert.ok(englishHtml.includes(copy), `English Work page is missing localized copy: ${copy}`);
    assert.ok(!chineseHtml.includes(copy), `Chinese Work page contains English chrome: ${copy}`);
  });
});

test('long project names use concise headings without polluting the table of contents', () => {
  const expectations = [
    {
      file: 'work/index.html',
      fatigueTitle: '疲劳识别',
      fatigueSubtitle: '机器人辅助深蹲训练'
    },
    {
      file: 'en/work/index.html',
      fatigueTitle: 'Fatigue Recognition',
      fatigueSubtitle: 'Robot-Assisted Squat Training'
    }
  ];

  expectations.forEach(({ file, fatigueTitle, fatigueSubtitle }) => {
    const html = readPublic(file);
    const learningSection = html.match(
      /<section class="work-project work-project--medium-title" id="learning-community"[\s\S]*?<\/section>/
    )?.[0];
    const fatigueSection = html.match(
      /<section class="work-project work-project--split-title" id="fatigue-research"[\s\S]*?<\/section>/
    )?.[0];
    const tocHtml = html.match(/<div class="post-toc motion-element">([\s\S]*?)<\/div>/)?.[1] || '';

    assert.ok(
      learningSection,
      `${file} must apply the medium-title treatment to Learning Community`
    );
    assert.ok(fatigueSection, `${file} must apply the split-title treatment to fatigue research`);
    assert.ok(
      html.includes(
        '<section class="work-project work-project--compact-title" id="autogoogleplay"'
      ),
      `${file} must apply the compact-title treatment to AutoGooglePlay Analyzer`
    );
    assert.ok(
      html.includes('<h2 id="autogoogleplay-title">AutoGooglePlay Analyzer</h2>'),
      `${file} must keep the AutoGooglePlay Analyzer display name readable`
    );
    assert.ok(
      fatigueSection.includes(`<h2 id="fatigue-research-title">${fatigueTitle}</h2>`),
      `${file} has the wrong concise fatigue heading`
    );
    assert.ok(
      fatigueSection.includes(
        `<p class="work-project__subtitle" id="fatigue-research-subtitle">${fatigueSubtitle}</p>`
      ),
      `${file} is missing the fatigue project subtitle`
    );
    assert.ok(tocHtml.includes(fatigueTitle), `${file} TOC is missing the concise fatigue title`);
    assert.ok(
      !tocHtml.includes(fatigueSubtitle),
      `${file} TOC must not repeat the fatigue project subtitle`
    );
  });
});

test('portfolio pages load one versioned gallery script and keep the compact language switcher', () => {
  workPages.forEach(({ file, alternate }) => {
    const html = readPublic(file);
    const expectedScript = `/js/portfolio-gallery.js?v=${assetVersion}`;

    assert.equal(
      (html.match(new RegExp(expectedScript.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || [])
        .length,
      1,
      `${file} must load the versioned gallery script exactly once`
    );
    assert.ok(html.includes('class="languages language-switcher"'), `${file} is missing the language switcher`);
    assert.ok(html.includes('class="language-switcher-label"'), `${file} is missing the localized switcher label`);
    assert.ok(html.includes('class="language-switcher-divider"'), `${file} is missing the editorial language divider`);
    assert.ok(!html.includes('class="lang-select"'), `${file} still renders the old language dropdown`);
    assert.ok(html.includes(`data-href="${alternate}"`), `${file} is missing its language pair`);
  });
});

test('every local portfolio image referenced by either language exists in public', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);
    const imagePaths = [...html.matchAll(/src="(\/images\/work\/[^"]+)"/g)].map(match => match[1]);

    assert.ok(imagePaths.length > 0, `${file} has no portfolio imagery`);
    imagePaths.forEach(imagePath => {
      assert.ok(
        fs.existsSync(path.join(publicDir, decodeURI(imagePath))),
        `${file} references missing image ${imagePath}`
      );
    });
  });
});

test('Wujian gallery leads with the three real product screens in workflow order', () => {
  const expectedScreens = [
    '/images/work/wujian/capture-queue.webp',
    '/images/work/wujian/inventory-view.webp',
    '/images/work/wujian/model-settings.webp'
  ];

  workPages.forEach(({ file }) => {
    const html = readPublic(file);
    const wujianSection = html.match(
      /<section class="work-project" id="wujian"[\s\S]*?<\/section>/
    )?.[0];

    assert.ok(wujianSection, `${file} is missing the Wujian section`);
    assert.equal(
      (wujianSection.match(/class="work-gallery__slide/g) || []).length,
      6,
      `${file} Wujian gallery must contain six slides`
    );
    assert.ok(
      wujianSection.includes('data-gallery-total>06</span>'),
      `${file} Wujian gallery counter must show six slides`
    );

    const screenPositions = expectedScreens.map(imagePath => {
      const position = wujianSection.indexOf(imagePath);
      assert.notEqual(position, -1, `${file} Wujian gallery is missing ${imagePath}`);
      return position;
    });

    assert.deepEqual(
      [...screenPositions].sort((a, b) => a - b),
      screenPositions,
      `${file} Wujian product screens are in the wrong order`
    );
    assert.ok(
      screenPositions[2] < wujianSection.indexOf('work-gallery__slide--diagram'),
      `${file} must show real Wujian screens before explanatory diagrams`
    );
  });
});

test('SignalForge exposes its OpenAI Build Week demo evidence', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);
    const signalForgeSection = html.match(
      /<section class="work-project" id="signalforge"[\s\S]*?<\/section>/
    )?.[0];

    assert.ok(signalForgeSection, `${file} is missing the SignalForge section`);
    const expectedLabel =
      file === 'work/index.html'
        ? '04 / OPENAI BUILD WEEK / 工作与效率'
        : '04 / OPENAI BUILD WEEK / WORK + PRODUCTIVITY';
    assert.ok(
      signalForgeSection.includes(expectedLabel),
      `${file} must identify SignalForge as an OpenAI Build Week project`
    );
    assert.ok(
      signalForgeSection.includes('href="https://youtu.be/C_vdD40rpV0"'),
      `${file} is missing the public SignalForge demo`
    );
  });
});

test('Learning Community gallery leads with the public AI-delivery workflow', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);
    const learningSection = html.match(
      /<section class="work-project work-project--medium-title" id="learning-community"[\s\S]*?<\/section>/
    )?.[0];

    assert.ok(learningSection, `${file} is missing the Learning Community section`);
    assert.ok(
      learningSection.includes('data-gallery-total>04</span>'),
      `${file} must expose all four Learning Community slides`
    );

    const workflowImage = '/images/work/ai-native-delivery/ai-native-product-delivery-workflow.webp';
    const workflowIndex = learningSection.indexOf(workflowImage);
    const compactDiagramIndex = learningSection.indexOf('work-diagram work-diagram--compact');

    assert.ok(workflowIndex >= 0, `${file} is missing the public Figma workflow`);
    assert.ok(
      workflowIndex < compactDiagramIndex,
      `${file} must lead the AI delivery gallery with the detailed workflow`
    );
    assert.ok(
      fs.existsSync(path.join(publicDir, workflowImage)),
      `${file} references a missing public workflow image`
    );
  });
});

test('Provenance Lens uses its real Flutter interface instead of unrelated source imagery', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);
    const provenanceSection = html.match(
      /<section class="work-project" id="provenance-lens"[\s\S]*?<\/section>/
    )?.[0];

    assert.ok(provenanceSection, `${file} is missing the Provenance Lens section`);
    assert.ok(
      provenanceSection.includes('/images/work/provenance-lens/app-empty-state.webp'),
      `${file} must show the real macOS Flutter interface`
    );
    assert.ok(
      !provenanceSection.includes('source-with-provenance'),
      `${file} must not reuse unrelated source imagery`
    );
  });
});

test('localized case studies use available language-specific screenshots', () => {
  const chineseHtml = readPublic('work/index.html');
  const englishHtml = readPublic('en/work/index.html');

  [
    '/images/work/photographhk/home-demo-en.webp',
    '/images/work/photographhk/work-index-demo-en.webp',
    '/images/work/photographhk/project-detail-demo-en.webp',
    '/images/work/publishing-system/site-home-en.webp',
    '/images/work/publishing-system/gallery-en.webp'
  ].forEach(imagePath => {
    assert.ok(englishHtml.includes(imagePath), `English Work page is missing ${imagePath}`);
    assert.ok(!chineseHtml.includes(imagePath), `Chinese Work page must not use ${imagePath}`);
  });

  [
    '/images/work/publishing-system/cms-articles-hku.webp',
    '/images/work/publishing-system/cms-gallery-hku.webp',
    '/images/work/publishing-system/cms-images-hku.webp'
  ].forEach(imagePath => {
    assert.ok(chineseHtml.includes(imagePath), `Chinese Work page is missing ${imagePath}`);
    assert.ok(englishHtml.includes(imagePath), `English Work page is missing ${imagePath}`);
  });
});

test('every project gallery count matches its rendered slide count', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);

    projectIds.forEach(projectId => {
      const section = html.match(
        new RegExp(`<section class="[^"]*" id="${projectId}"[\\s\\S]*?<\\/section>`)
      )?.[0];

      assert.ok(section, `${file} is missing project section ${projectId}`);

      const declaredTotal = Number(
        section.match(/data-gallery-total>(\d+)<\/span>/)?.[1]
      );
      const renderedSlides = section.match(/class="work-gallery__slide(?:\s[^"]*)?"/g)?.length || 0;

      assert.ok(
        Number.isInteger(declaredTotal) && declaredTotal > 0,
        `${file} ${projectId} has no valid gallery total`
      );
      assert.equal(
        declaredTotal,
        renderedSlides,
        `${file} ${projectId} declares ${declaredTotal} slides but renders ${renderedSlides}`
      );
    });
  });
});

test('standalone app icons are centered and the Wujian black corners are clipped', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);

    assert.ok(
      html.includes('class="work-gallery__slide work-gallery__slide--icon"'),
      `${file} is missing standalone app-icon slides`
    );
    assert.ok(
      html.includes('class="work-app-icon work-app-icon--rounded-cutout"'),
      `${file} must mark the Wujian icon for a clean rounded cutout`
    );
  });
});

test('Chinese portfolio typography keeps display text aligned and naturally spaced', () => {
  const html = readPublic('work/index.html');
  const css = readPublic('css/main.css');
  const wujianSection = html.match(
    /<section class="work-project" id="wujian"[\s\S]*?<\/section>/
  )?.[0] || '';

  assert.ok(
    wujianSection.includes(
      '<h2 id="wujian-title"><span>物见</span> <span class="work-project__latin-title">Wujian</span></h2>'
    ),
    'the Chinese Wujian title must keep the Chinese name together and demote the Latin label'
  );
  assert.match(
    css,
    /\.work-page\s*\{[\s\S]*?text-align:\s*left/,
    'portfolio content must opt out of the theme-wide justified alignment'
  );
  assert.match(
    css,
    /html\[lang=(?:"zh-CN"|zh-CN)\] \.work-intro__title\s*\{[\s\S]*?line-height:\s*1\.1[\s\S]*?letter-spacing:\s*0\.015em/,
    'the Chinese hero must use open line height and neutral tracking'
  );
  assert.ok(
    css.includes('.work-project__latin-title'),
    'built CSS is missing the secondary Latin project-title treatment'
  );
});

test('portfolio portrait preserves the complete source image instead of cropping it', () => {
  const css = readPublic('css/main.css');

  assert.match(
    css,
    /\.work-intro__portrait img\s*\{[\s\S]*?width:\s*100%[\s\S]*?height:\s*auto[\s\S]*?min-height:\s*0[\s\S]*?object-fit:\s*contain/,
    'the portfolio portrait must scale proportionally without cover-cropping'
  );
  assert.match(
    css,
    /\.work-intro__portrait\s*\{[\s\S]*?align-self:\s*center/,
    'the complete portrait should remain vertically centered beside the introduction'
  );
});

test('English portfolio hero keeps complete title lines across responsive widths', () => {
  const html = readPublic('en/work/index.html');
  const css = readPublic('css/main.css');

  assert.ok(
    html.includes(
      '<p class="work-intro__title" role="heading" aria-level="1"><span>Ideas into</span><span>products.</span></p>'
    ),
    'the English hero must expose two intentional, indivisible title lines'
  );
  assert.match(
    css,
    /\.work-intro__copy\s*\{[\s\S]*?container-type:\s*inline-size/,
    'the hero copy column must establish a sizing container'
  );
  assert.match(
    css,
    /html\[lang=(?:"en"|en)\] \.work-intro__title\s*\{[\s\S]*?font-size:\s*clamp\(3rem,\s*17cqi,\s*6\.2rem\)/,
    'the English display size must respond to its own column rather than the viewport'
  );
  assert.match(
    css,
    /html\[lang=(?:"en"|en)\] \.work-intro__title > span\s*\{[\s\S]*?white-space:\s*nowrap/,
    'English title words must never split internally'
  );
});

test('built CSS contains portfolio layout and mobile gallery rules', () => {
  const css = readPublic('css/main.css');

  [
    '.work-page',
    '.work-project__header',
    '.work-project--medium-title .work-project__header h2',
    '.work-project--compact-title .work-project__header h2',
    '.work-project--split-title .work-project__header h2',
    '.work-project__subtitle',
    '.work-gallery__slide',
    '.work-page .work-gallery__slide--icon > a.fancybox',
    '.work-app-icon--rounded-cutout',
    '@media (max-width: 767px)'
  ].forEach(selector => {
    assert.ok(css.includes(selector), `built CSS is missing ${selector}`);
  });
  assert.match(
    css,
    /overflow-wrap:\s*anywhere/,
    'built CSS must allow long project names to wrap on mobile'
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\)[\s\S]*?\.work-project__header\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    'built CSS must stack project headings before the side-by-side columns become cramped'
  );
});

test('desktop portfolio keeps the NexT content gutter beside the fixed menu', () => {
  const css = readPublic('css/main.css');

  assert.ok(
    css.includes('width: calc(100% - 252px);'),
    'built CSS is missing the NexT desktop content gutter'
  );
  assert.ok(
    !css.includes('.main-inner:has(.post-block.page-type-portfolio) .content-wrap'),
    'portfolio CSS must not expand beneath the fixed desktop menu'
  );
});

test('portfolio gallery JavaScript is syntactically valid', () => {
  assert.doesNotThrow(() => {
    execFileSync(process.execPath, ['--check', path.join(root, 'source/js/portfolio-gallery.js')], {
      stdio: 'pipe'
    });
  });
});
