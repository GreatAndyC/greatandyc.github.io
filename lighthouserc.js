const { chromium } = require('@playwright/test');

module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      chromePath: chromium.executablePath(),
      numberOfRuns: 1,
      url: [
        'http://localhost/',
        'http://localhost/en/work/',
        'http://localhost/en/about/',
        'http://localhost/en/gallery/',
        'http://localhost/en/archives/'
      ],
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.65 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        // The generated site is served over localhost HTTP during CI, so
        // Lighthouse deducts the HTTPS audit by design (production is HTTPS).
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.85 }]
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './reports/lighthouse'
    }
  }
};
