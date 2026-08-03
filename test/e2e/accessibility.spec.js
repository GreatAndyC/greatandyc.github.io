const { AxeBuilder } = require('@axe-core/playwright');
const { expect, test } = require('@playwright/test');
const { expectNoRuntimeProblems, openPage } = require('./helpers');

const accessibilityRoutes = ['/', '/en/about/', '/en/work/', '/en/gallery/', '/en/archives/'];

test.describe.configure({ mode: 'serial' });

for (const route of accessibilityRoutes) {
  test(`${route} has no automatically detectable WCAG A/AA violations`, async ({ page }, testInfo) => {
    test.skip(
      !['chromium-desktop', 'chromium-mobile'].includes(testInfo.project.name),
      'run the accessibility scan in Chromium desktop and mobile viewports'
    );
    const problems = await openPage(page, route);
    // Let the theme finish applying its sidebar/TOC state before axe computes
    // effective foreground and background colours. Parallel transient scans
    // can otherwise report contrast against an intermediate paint.
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(250);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const summary = results.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.map(node => node.target.join(' '))
    }));

    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
    await expectNoRuntimeProblems(problems);
  });
}
