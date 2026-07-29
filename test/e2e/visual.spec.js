const { expect, test } = require('@playwright/test');
const { expectImagesDecodable, openPage } = require('./helpers');

test.skip(
  process.env.RUN_VISUAL_REGRESSION !== '1',
  'visual baselines are maintained explicitly with npm run test:visual'
);

for (const { route, snapshot } of [
  { route: '/en/work/', snapshot: 'work-en.png' },
  { route: '/en/about/', snapshot: 'about-en.png' }
]) {
  test(`${route} matches the reviewed responsive viewport`, async ({ page }) => {
    await openPage(page, route);
    await page.waitForLoadState('networkidle');
    await expectImagesDecodable(page, '.post-body img');
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          caret-color: transparent !important;
        }
      `
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    await expect(page).toHaveScreenshot(snapshot, {
      fullPage: false,
      animations: 'disabled'
    });
  });
}
