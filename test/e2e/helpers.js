const { expect } = require('@playwright/test');

function monitorRuntime(page) {
  const problems = [];

  page.on('pageerror', error => {
    problems.push(`page error: ${error.message}`);
  });

  page.on('console', message => {
    if (message.type() === 'error') {
      problems.push(`console error: ${message.text()}`);
    }
  });

  page.on('requestfailed', request => {
    const requestUrl = new URL(request.url());
    const errorText = request.failure()?.errorText || 'unknown';
    // Chromium aborts unfinished requests from the previous document during a
    // user-initiated navigation. That is expected browser behavior, not a
    // broken asset on the destination page.
    if (
      errorText !== 'net::ERR_ABORTED'
      && requestUrl.origin === new URL(page.url() || 'http://site.invalid').origin
    ) {
      problems.push(
        `request failed: ${request.method()} ${requestUrl.pathname} (${errorText})`
      );
    }
  });

  page.on('response', response => {
    const responseUrl = new URL(response.url());
    if (
      page.url()
      && responseUrl.origin === new URL(page.url()).origin
      && response.status() >= 400
    ) {
      problems.push(`response ${response.status()}: ${responseUrl.pathname}`);
    }
  });

  return problems;
}

async function openPage(page, route) {
  const problems = monitorRuntime(page);
  // Visitor analytics is a third-party enhancement. Stub it so acceptance
  // tests remain deterministic and do not fail on its cookies, rate limits,
  // or availability.
  await page.route('**://busuanzi.ibruce.info/**', requestRoute =>
    requestRoute.fulfill({
      status: 204,
      contentType: 'application/javascript',
      body: ''
    })
  );
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

  expect(response, `${route} did not return a document response`).not.toBeNull();
  expect(response.status(), `${route} returned ${response.status()}`).toBeLessThan(400);
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(50);

  return problems;
}

async function expectNoRuntimeProblems(problems) {
  await expect.poll(() => problems, { timeout: 1000 }).toEqual([]);
}

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));

  expect(
    dimensions.scrollWidth,
    `page overflows horizontally by ${dimensions.scrollWidth - dimensions.clientWidth}px`
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function expectImagesDecodable(page, selector = 'img') {
  const failures = await page.locator(selector).evaluateAll(async images => {
    const sources = [
      ...new Set(
        images
          .map(image => image.currentSrc || image.getAttribute('src') || image.dataset.src)
          .filter(Boolean)
      )
    ];

    return (
      await Promise.all(
        sources.map(
          source =>
            new Promise(resolve => {
              const probe = new Image();
              probe.onload = () => resolve(null);
              probe.onerror = () => resolve(source);
              probe.src = source;
            })
        )
      )
    ).filter(Boolean);
  });

  expect(failures, `images could not be decoded:\n${failures.join('\n')}`).toEqual([]);
}

module.exports = {
  expectImagesDecodable,
  expectNoHorizontalOverflow,
  expectNoRuntimeProblems,
  openPage
};
