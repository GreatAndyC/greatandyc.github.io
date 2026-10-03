const { spawnSync } = require('node:child_process');

const EXCEPTION_URL = 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm';
const EXCEPTION_EXPIRES = Date.parse('2026-11-01T00:00:00Z');

function evaluateAudit(report, now = Date.now()) {
  if (!report || report.error || !report.vulnerabilities) {
    throw new Error('npm audit did not return a usable vulnerability report');
  }

  const highSeverity = Object.entries(report.vulnerabilities)
    .filter(([, item]) => item.severity === 'high' || item.severity === 'critical');
  if (highSeverity.length === 0) return [];

  if (now >= EXCEPTION_EXPIRES) {
    throw new Error('The temporary braces advisory exception has expired');
  }

  function directAdvisories(name, visited = new Set()) {
    if (visited.has(name)) throw new Error(`Circular npm audit chain at ${name}`);
    const item = report.vulnerabilities[name];
    if (!item || !Array.isArray(item.via)) {
      throw new Error(`Incomplete npm audit chain at ${name}`);
    }

    const nextVisited = new Set(visited);
    nextVisited.add(name);
    return item.via.flatMap(via => typeof via === 'string'
      ? directAdvisories(via, nextVisited)
      : [via]);
  }

  for (const [name] of highSeverity) {
    const advisories = directAdvisories(name);
    if (advisories.length === 0 || advisories.some(advisory =>
      advisory.name !== 'braces'
      || advisory.url !== EXCEPTION_URL
      || advisory.range !== '<=3.0.3'
      || advisory.severity !== 'high')) {
      throw new Error(`Unexcepted high-severity npm advisory through ${name}`);
    }
  }

  return highSeverity.map(([name]) => name);
}

function main() {
  const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  if (result.error || ![0, 1].includes(result.status)) {
    throw result.error || new Error(`npm audit exited with status ${result.status}`);
  }

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    throw new Error('npm audit did not return valid JSON');
  }

  const waivedPackages = evaluateAudit(report);
  if (waivedPackages.length) {
    // Hexo runs only during the static build. No npm package is deployed to readers.
    // This upstream advisory has no patched npm release as of 2026-10-03.
    console.warn(`Temporary build-only exception for ${EXCEPTION_URL} `
      + `through ${waivedPackages.join(', ')}; expires 2026-11-01.`);
  } else {
    console.log('No high or critical npm audit findings.');
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { evaluateAudit };
