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
