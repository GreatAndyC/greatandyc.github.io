const assert = require('node:assert/strict');
const test = require('node:test');
const { evaluateAudit } = require('../tools/audit-production-dependencies');

const now = Date.parse('2026-10-03T00:00:00Z');
const braces = {
  name: 'braces',
  url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  range: '<=3.0.3',
  severity: 'high'
};

test('allows only the unpatched braces advisory and its transitive chain', () => {
  const report = {
    vulnerabilities: {
      braces: { severity: 'high', via: [braces] },
      chokidar: { severity: 'high', via: ['braces'] },
      hexo: { severity: 'high', via: ['chokidar'] }
    }
  };

  assert.deepEqual(evaluateAudit(report, now), ['braces', 'chokidar', 'hexo']);
});

test('ignores a moderate advisory in a parent with the excepted high-severity chain', () => {
  const report = {
    vulnerabilities: {
      braces: { severity: 'high', via: [braces] },
      'sprintf-js': { severity: 'moderate', via: [{
        name: 'sprintf-js',
        url: 'https://github.com/advisories/GHSA-hp3w-g68c-fv3c',
        severity: 'moderate'
      }] },
      'hexo-i18n': { severity: 'moderate', via: ['sprintf-js'] },
      hexo: { severity: 'high', via: ['braces', 'hexo-i18n'] }
    }
  };

  assert.deepEqual(evaluateAudit(report, now), ['braces', 'hexo']);
});

test('rejects a high-severity package without a high-severity advisory chain', () => {
  const report = {
    vulnerabilities: {
      example: { severity: 'high', via: [{ name: 'example', severity: 'moderate' }] }
    }
  };

  assert.throws(() => evaluateAudit(report, now), /Unexcepted high-severity/);
});

test('rejects another high-severity advisory even in the same dependency chain', () => {
  const report = {
    vulnerabilities: {
      braces: { severity: 'high', via: [braces, { ...braces, url: 'https://example.invalid/another-advisory' }] },
      chokidar: { severity: 'high', via: ['braces'] }
    }
  };

  assert.throws(() => evaluateAudit(report, now), /Unexcepted high-severity/);
});

test('rejects an incomplete audit result and expires the exception', () => {
  const report = { vulnerabilities: { braces: { severity: 'high', via: [braces] } } };

  assert.throws(() => evaluateAudit({ error: 'registry unavailable' }, now), /usable vulnerability report/);
  assert.throws(() => evaluateAudit(report, Date.parse('2026-11-01T00:00:00Z')), /expired/);
});
