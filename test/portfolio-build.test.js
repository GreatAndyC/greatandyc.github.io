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

test('portfolio pages have six projects and no NexT sidebar or generated TOC', () => {
  workPages.forEach(({ file }) => {
    const html = readPublic(file);

    assert.ok(html.includes('class="post-block page-type-portfolio"'));
    assert.ok(!html.includes('<aside class="sidebar'), `${file} still renders the NexT sidebar`);
    assert.ok(!html.includes('class="post-toc'), `${file} still renders a generated TOC`);
    assert.ok(!html.includes('Table of Contents'), `${file} still exposes a TOC label`);

    projectIds.forEach(projectId => {
      assert.equal(
        (html.match(new RegExp(`id="${projectId}"`, 'g')) || []).length,
        1,
        `${file} must contain project #${projectId} exactly once`
      );
    });
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

test('built CSS contains portfolio layout and mobile gallery rules', () => {
  const css = readPublic('css/main.css');

  [
    '.main-inner:has(.post-block.page-type-portfolio) .content-wrap',
    '.work-page',
    '.work-project__header',
    '.work-gallery__slide',
    '@media (max-width: 767px)'
  ].forEach(selector => {
    assert.ok(css.includes(selector), `built CSS is missing ${selector}`);
  });
});

test('portfolio gallery JavaScript is syntactically valid', () => {
  assert.doesNotThrow(() => {
    execFileSync(process.execPath, ['--check', path.join(root, 'source/js/portfolio-gallery.js')], {
      stdio: 'pipe'
    });
  });
});
