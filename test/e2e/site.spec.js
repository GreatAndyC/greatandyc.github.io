const { expect, test } = require('@playwright/test');
const {
  expectImagesDecodable,
  expectNoHorizontalOverflow,
  expectNoRuntimeProblems,
  openPage
} = require('./helpers');

const routeMatrix = [
  {
    route: '/',
    language: 'en',
    menu: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    route: '/zh-CN/',
    language: 'zh-CN',
    menu: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  },
  {
    route: '/en/about/',
    language: 'en',
    menu: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    route: '/about/',
    language: 'zh-CN',
    menu: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  },
  {
    route: '/en/work/',
    language: 'en',
    menu: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    route: '/work/',
    language: 'zh-CN',
    menu: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  },
  {
    route: '/en/gallery/',
    language: 'en',
    menu: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    route: '/gallery/',
    language: 'zh-CN',
    menu: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  },
  {
    route: '/en/archives/',
    language: 'en',
    menu: { home: '/', about: '/en/about/', work: '/en/work/', gallery: '/en/gallery/' }
  },
  {
    route: '/zh-CN/archives/',
    language: 'zh-CN',
    menu: { home: '/zh-CN/', about: '/about/', work: '/work/', gallery: '/gallery/' }
  }
];

for (const { route, language, menu } of routeMatrix) {
  test(`${route} keeps its language, core menu, and responsive width`, async ({ page }) => {
    const problems = await openPage(page, route);

    await expect(page.locator('html')).toHaveAttribute('lang', language);
    for (const [item, href] of Object.entries(menu)) {
      await expect(page.locator(`.menu-item-${item} > a`)).toHaveAttribute('href', href);
    }

    await expectNoHorizontalOverflow(page);
    await expectNoRuntimeProblems(problems);
  });
}

test('English menu navigation never drops Work or crosses into Chinese', async ({ page }) => {
  test.skip(
    page.viewportSize().width < 992,
    'mobile navigation is covered by the dedicated collapsed-menu test'
  );
  const problems = await openPage(page, '/en/');

  await page.locator('.menu-item-about > a').click();
  await expect(page).toHaveURL(/\/en\/about\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.menu-item-work > a')).toHaveAttribute('href', '/en/work/');

  await page.locator('.menu-item-gallery > a').click();
  await expect(page).toHaveURL(/\/en\/gallery\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.menu-item-work > a')).toHaveAttribute('href', '/en/work/');

  await expectNoRuntimeProblems(problems);
});

for (const languageSwitch of [
  { from: '/en/work/', language: 'zh-CN', path: '/work/index.html', documentLanguage: 'zh-CN' },
  { from: '/work/', language: 'en', path: '/en/work/index.html', documentLanguage: 'en' },
  {
    from: '/archives/',
    language: 'zh-CN',
    path: '/zh-CN/archives/index.html',
    documentLanguage: 'zh-CN'
  },
  {
    from: '/zh-CN/archives/',
    language: 'en',
    path: '/en/archives/index.html',
    documentLanguage: 'en'
  }
]) {
  test(`language switcher maps ${languageSwitch.from} to ${languageSwitch.path}`, async ({ page }) => {
    const problems = await openPage(page, languageSwitch.from);

    if (page.viewportSize().width < 992) {
      await page.locator('.site-nav-toggle .toggle').click();
      await expect(page.locator('.site-nav')).toHaveClass(/site-nav-on/);
      await expect(page.locator('.site-nav-toggle .toggle')).toHaveAttribute('aria-expanded', 'true');
    }

    await Promise.all([
      page.waitForURL(url => url.pathname === languageSwitch.path),
      page.locator(`.language-switcher-option[data-language="${languageSwitch.language}"]`).click()
    ]);

    await expect(page.locator('html')).toHaveAttribute('lang', languageSwitch.documentLanguage);
    await expectNoRuntimeProblems(problems);
  });
}

test('mobile navigation opens and keeps Work available', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-only navigation behavior');
  const problems = await openPage(page, '/en/about/');

  const menuButtonMetrics = await page.locator('.site-nav-toggle .toggle').evaluate(button => {
    const lines = [...button.querySelectorAll('.toggle-line')];
    const buttonRect = button.getBoundingClientRect();
    return {
      flexDirection: getComputedStyle(button).flexDirection,
      width: buttonRect.width,
      height: buttonRect.height,
      lineWidths: lines.map(line => line.getBoundingClientRect().width)
    };
  });
  expect(menuButtonMetrics.flexDirection).toBe('column');
  expect(menuButtonMetrics.width).toBeGreaterThanOrEqual(44);
  expect(menuButtonMetrics.height).toBeGreaterThanOrEqual(44);
  expect(menuButtonMetrics.lineWidths).toEqual([24, 24, 24]);

  await page.locator('.site-nav-toggle .toggle').click();
  await expect(page.locator('.site-nav')).toHaveClass(/site-nav-on/);
  await expect(page.locator('.site-nav-toggle .toggle')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.site-nav-toggle .toggle')).toHaveAttribute('aria-controls', 'site-navigation');
  await expect(page.locator('.mobile-rail-profile')).toBeVisible();
  await expect(page.locator('.menu-item-work > a')).toBeVisible();
  await expect(page.locator('.menu-item-work > a')).toHaveAttribute('href', '/en/work/');
  await expect(page.locator('.menu-item-language')).toBeVisible();
  const mobileRailLinks = page.locator('.mobile-rail-links .mobile-rail-link');
  await expect(mobileRailLinks).toHaveCount(3);
  await expect(mobileRailLinks.nth(0)).toContainText('GitHub');
  await expect(mobileRailLinks.nth(1)).toContainText('RSS');
  await expect(mobileRailLinks.nth(2)).toContainText('Explore the World');
  await expect(mobileRailLinks.nth(2)).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('.site-nav')).not.toHaveClass(/site-nav-on/);
  await expect(page.locator('.site-nav-toggle .toggle')).toHaveAttribute('aria-expanded', 'false');

  await expectNoRuntimeProblems(problems);
});

test('Work sidebar exposes both the project TOC and author overview', async ({ page }) => {
  test.skip(page.viewportSize().width < 992, 'Gemini hides the desktop sidebar below 992px');
  const problems = await openPage(page, '/en/work/');

  await expect(page.locator('.post-toc')).toBeVisible();
  await expect(page.locator('.site-author-image')).toHaveAttribute('src', '/images/avatar.jpg');

  await page.locator('.sidebar-nav-overview').click();
  await expect(page.locator('.site-overview-wrap')).toHaveClass(/sidebar-panel-active/);
  await expect(page.locator('.site-author-image')).toBeVisible();
  await expectNoRuntimeProblems(problems);
});

test('post detail sidebar keeps only the contextual TOC and restores overview after navigation', async ({ page }) => {
  test.skip(page.viewportSize().width < 992, 'Gemini hides the desktop sidebar below 992px');
  const problems = await openPage(page, '/2026/05/15/manus/');

  await expect(page.locator('.post-toc')).toBeVisible();
  await expect(page.locator('.sidebar-nav-overview')).toBeHidden();
  await expect(page.locator('.site-overview-wrap')).toBeHidden();

  await page.locator('.menu-item-work > a').click();
  await expect(page).toHaveURL(/\/work\/$/);
  // Pjax updates the page configuration and sidebar state in separate steps;
  // wait until both have settled before exercising the restored overview tab.
  await page.waitForFunction(() => (
    window.CONFIG?.page?.isPost === false
    && document.querySelector('.site-overview-wrap')?.getAttribute('aria-hidden') === 'false'
  ));
  await expect(page.locator('.site-overview-wrap')).not.toHaveAttribute('hidden', '');
  await expect(page.locator('.sidebar-nav-overview')).not.toBeHidden();
  await page.locator('.sidebar-nav-overview').click();
  await expect(page.locator('.site-overview-wrap')).toHaveClass(/sidebar-panel-active/);
  await expectNoRuntimeProblems(problems);
});

test('Work and About images decode in a real browser', async ({ page }) => {
  let problems = await openPage(page, '/en/work/');
  await expectImagesDecodable(page, '.post-body img');
  await expectNoRuntimeProblems(problems);

  problems = await openPage(page, '/en/about/');
  await expectImagesDecodable(page, '.post-body img');
  await expectNoRuntimeProblems(problems);
});

test('Gallery opens an album, advances, and closes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'one browser is enough for gallery behavior');
  const problems = await openPage(page, '/en/gallery/');

  await page.locator('[data-gallery-open]').first().click();
  const viewer = page.locator('[data-gallery-viewer]');
  const image = page.locator('[data-gallery-viewer-image]');

  await expect(viewer).toBeVisible();
  await expect(viewer).toHaveAttribute('aria-hidden', 'false');
  await expect.poll(() => image.evaluate(element => element.naturalWidth)).toBeGreaterThan(0);
  const firstSource = await image.getAttribute('src');

  await page.locator('[data-gallery-next]').click();
  await expect.poll(() => image.getAttribute('src')).not.toBe(firstSource);
  await page.locator('.gallery-viewer-close').click();
  await expect(viewer).toBeHidden();

  await expectNoRuntimeProblems(problems);
});

test('local search returns a safe result', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'one browser is enough for search behavior');
  const problems = await openPage(page, '/en/');

  await page.locator('.home-category-search').click();
  await expect(page.locator('.search-pop-overlay')).toHaveClass(/search-active/);
  await page.locator('.search-input').fill('AI');
  await expect(page.locator('#search-result .search-result-list')).toBeVisible();
  await expect(page.locator('#search-result a').first()).toHaveAttribute('href', /^\//);

  await expectNoRuntimeProblems(problems);
});
