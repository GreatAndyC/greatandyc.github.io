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

test('built CSS contains portfolio layout and mobile gallery rules', () => {
  const css = readPublic('css/main.css');

  [
    '.work-page',
    '.work-project__header',
    '.work-gallery__slide',
    '@media (max-width: 767px)'
  ].forEach(selector => {
    assert.ok(css.includes(selector), `built CSS is missing ${selector}`);
  });
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
