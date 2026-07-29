const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {
  isPathInside,
  isTrustedCmsRequest
} = require('../tools/local-cms');

function request(overrides = {}) {
  return {
    headers: {
      host: '127.0.0.1:4010',
      ...overrides.headers
    },
    socket: {
      remoteAddress: '127.0.0.1',
      ...overrides.socket
    }
  };
}

test('path containment rejects sibling directories with the same prefix', () => {
  const root = path.resolve('/tmp/example-root');

  assert.equal(isPathInside(root, path.join(root, 'source', 'image.png')), true);
  assert.equal(isPathInside(root, root), true);
  assert.equal(isPathInside(root, path.resolve('/tmp/example-root-copy/file.txt')), false);
  assert.equal(isPathInside(root, path.resolve(root, '..', 'outside.txt')), false);
});

test('local CMS requests must stay on the loopback interface and configured port', () => {
  assert.equal(isTrustedCmsRequest(request()), true);
  assert.equal(
    isTrustedCmsRequest(request({ headers: { origin: 'http://localhost:4010' } })),
    true
  );
  assert.equal(
    isTrustedCmsRequest(request({ headers: { host: 'example.test:4010' } })),
    false
  );
  assert.equal(
    isTrustedCmsRequest(request({ headers: { host: '127.0.0.1:9999' } })),
    false
  );
  assert.equal(
    isTrustedCmsRequest(request({ socket: { remoteAddress: '192.168.1.20' } })),
    false
  );
});

test('local CMS rejects cross-site browser requests', () => {
  assert.equal(
    isTrustedCmsRequest(request({ headers: { origin: 'https://attacker.example' } })),
    false
  );
  assert.equal(
    isTrustedCmsRequest(request({ headers: { 'sec-fetch-site': 'cross-site' } })),
    false
  );
});
