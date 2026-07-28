const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const assetVersion = fs
  .readFileSync(path.join(root, '_config.yml'), 'utf8')
  .match(/^asset_version:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1];

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
  'wujian',
  'signalforge',
  'ai-native-delivery',
  'autogoogleplay',
  'fatigue-research'
];

function readPublic(relativePath) {
  const absolutePath = path.join(publicDir, relativePath);
  assert.ok(fs.existsSync(absolutePath), `missing generated file: public/${relativePath}`);
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

test('core pages request the versioned stylesheet to avoid stale deployment CSS', () => {
  pageMatrix.forEach(({ file }) => {
    const html = readPublic(file);
    const expectedAsset = `/css/main.css?v=${assetVersion}`;

    assert.ok(html.includes(`href="${expectedAsset}"`), `${file} is missing ${expectedAsset}`);
    assert.ok(!html.includes('href="/css/main.css"'), `${file} still requests unversioned CSS`);
  });
});

test('portfolio pages have six projects and a six-item flat NexT table of contents', () => {
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
      `${file} TOC must contain exactly six project entries`
    );
    assert.ok(!tocHtml.includes('Selected Work'), `${file} TOC must not include the page hero`);
    assert.ok(!tocHtml.includes('作品集'), `${file} TOC must not include the page hero`);
    assert.ok(!tocHtml.includes('Want to talk'), `${file} TOC must not include the contact block`);
    assert.ok(!tocHtml.includes('想聊产品'), `${file} TOC must not include the contact block`);
    assert.ok(!tocHtml.includes('nav-number'), `${file} TOC must not show numeric prefixes`);
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
    const aiSection = html.match(
      /<section class="work-project work-project--medium-title" id="ai-native-delivery"[\s\S]*?<\/section>/
    )?.[0];
    const fatigueSection = html.match(
      /<section class="work-project work-project--split-title" id="fatigue-research"[\s\S]*?<\/section>/
    )?.[0];
    const tocHtml = html.match(/<div class="post-toc motion-element">([\s\S]*?)<\/div>/)?.[1] || '';

    assert.ok(aiSection, `${file} must apply the medium-title treatment to AI delivery`);
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

test('portfolio pages load one versioned gallery script and keep language switching', () => {
  workPages.forEach(({ file, alternate }) => {
    const html = readPublic(file);
    const expectedScript = `/js/portfolio-gallery.js?v=${assetVersion}`;

    assert.equal(
      (html.match(new RegExp(expectedScript.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || [])
        .length,
      1,
      `${file} must load the versioned gallery script exactly once`
    );
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
    assert.ok(
      signalForgeSection.includes('03 / OPENAI BUILD WEEK / WORK + PRODUCTIVITY'),
      `${file} must identify SignalForge as an OpenAI Build Week project`
    );
    assert.ok(
      signalForgeSection.includes('href="https://youtu.be/C_vdD40rpV0"'),
      `${file} is missing the public SignalForge demo`
    );
  });
});

test('AI delivery gallery leads with the public Figma workflow', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);
    const aiSection = html.match(
      /<section class="work-project work-project--medium-title" id="ai-native-delivery"[\s\S]*?<\/section>/
    )?.[0];

    assert.ok(aiSection, `${file} is missing the AI delivery section`);
    assert.ok(
      aiSection.includes('data-gallery-total>04</span>'),
      `${file} must expose all four AI delivery slides`
    );

    const workflowImage = '/images/work/ai-native-delivery/ai-native-product-delivery-workflow.webp';
    const workflowIndex = aiSection.indexOf(workflowImage);
    const compactDiagramIndex = aiSection.indexOf('work-diagram work-diagram--compact');

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
