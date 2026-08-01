const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  resolveNpmCliPath,
  buildNpmSpawnEnvironment
} = require('../tools/local-cms');

function temporaryNodeInstall(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'local-cms-node-'));
  const binDirectory = path.join(root, 'bin');
  const npmCliPath = path.join(root, 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const nodeExecPath = path.join(binDirectory, 'node');

  fs.mkdirSync(path.dirname(npmCliPath), { recursive: true });
  fs.mkdirSync(binDirectory, { recursive: true });
  fs.writeFileSync(nodeExecPath, '');
  fs.writeFileSync(npmCliPath, '');
  fs.symlinkSync('../lib/node_modules/npm/bin/npm-cli.js', path.join(binDirectory, 'npm'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  return { binDirectory, nodeExecPath, npmCliPath };
}

test('npm CLI is resolved beside Node when launchd omits npm_execpath', t => {
  const install = temporaryNodeInstall(t);

  assert.equal(
    resolveNpmCliPath({ PATH: '/usr/bin:/bin' }, install.nodeExecPath),
    fs.realpathSync(install.npmCliPath)
  );
});

test('npm child environment prepends the active Node directory to a restricted PATH', t => {
  const install = temporaryNodeInstall(t);
  const environment = buildNpmSpawnEnvironment(
    { PATH: '/usr/bin:/bin', TEST_VALUE: 'kept' },
    install.nodeExecPath
  );

  assert.equal(environment.TEST_VALUE, 'kept');
  assert.deepEqual(
    environment.PATH.split(path.delimiter),
    [install.binDirectory, '/usr/bin', '/bin']
  );
});
