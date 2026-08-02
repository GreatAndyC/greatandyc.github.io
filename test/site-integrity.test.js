const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function readHtml(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function publicTargetFromUrl(rawUrl, sourceFile) {
  if (
    !rawUrl
    || rawUrl.startsWith('#')
    || /^(?:data:|mailto:|tel:|javascript:)/i.test(rawUrl)
    || /^https?:\/\//i.test(rawUrl)
    || rawUrl.startsWith('//')
  ) {
    return null;
  }

  const sourceRoute = `/${path.relative(publicDir, sourceFile).split(path.sep).join('/')}`;
  const pathname = new URL(rawUrl, `https://site.invalid${sourceRoute}`).pathname;
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    decodedPath = pathname;
  }

  const relativePath = decodedPath.replace(/^\/+/, '');
  const exactTarget = path.join(publicDir, relativePath);

  if (fs.existsSync(exactTarget) && fs.statSync(exactTarget).isFile()) {
    return exactTarget;
  }

  return path.join(exactTarget, 'index.html');
}

const htmlFiles = listFiles(publicDir).filter(filePath => filePath.endsWith('.html'));

test('all generated local links and assets resolve to a generated file', () => {
  const brokenReferences = [];

  htmlFiles.forEach(filePath => {
    const html = readHtml(filePath);
    const references = [
      ...html.matchAll(/\b(?:href|src|data-href)="([^"]+)"/g)
    ].map(match => match[1]);

    references.forEach(reference => {
      const target = publicTargetFromUrl(reference, filePath);
      if (target && !fs.existsSync(target)) {
        brokenReferences.push(
          `${path.relative(publicDir, filePath)} -> ${reference}`
        );
      }
    });
  });

  assert.deepEqual(brokenReferences, [], `broken generated references:\n${brokenReferences.join('\n')}`);
});

test('every language-switcher destination exists and has the requested document language', () => {
  const languageErrors = [];

  htmlFiles.forEach(filePath => {
    const html = readHtml(filePath);
    const options = [
      ...html.matchAll(
        /class="language-switcher-option[^"]*"[^>]*data-language="(en|zh-CN)"[^>]*data-href="([^"]+)"/g
      )
    ];

    options.forEach(([, language, targetUrl]) => {
      const target = publicTargetFromUrl(targetUrl, filePath);
      if (!target || !fs.existsSync(target)) {
        languageErrors.push(
          `${path.relative(publicDir, filePath)} -> ${language}: missing ${targetUrl}`
        );
        return;
      }

      const targetLanguage = readHtml(target).match(/<html[^>]*\blang="([^"]+)"/i)?.[1];
      if (targetLanguage !== language) {
        languageErrors.push(
          `${path.relative(publicDir, filePath)} -> ${targetUrl}: expected ${language}, got ${targetLanguage || 'none'}`
        );
      }
    });
  });

  assert.deepEqual(languageErrors, [], `invalid language destinations:\n${languageErrors.join('\n')}`);
});

test('archives, categories, and tags have explicit English and Chinese landing pages', () => {
  ['archives', 'categories', 'tags'].forEach(section => {
    [
      { file: `${section}/index.html`, language: 'en' },
      { file: `en/${section}/index.html`, language: 'en' },
      { file: `zh-CN/${section}/index.html`, language: 'zh-CN' }
    ].forEach(({ file, language }) => {
      const fullPath = path.join(publicDir, file);
      assert.ok(fs.existsSync(fullPath), `missing localized page: public/${file}`);
      assert.match(readHtml(fullPath), new RegExp(`<html lang="${language}">`));
    });
  });
});

test('the Decap admin page is emitted as one raw HTML document', () => {
  const adminHtml = readHtml(path.join(publicDir, 'admin', 'index.html'));

  assert.equal((adminHtml.match(/<!doctype html>/gi) || []).length, 1);
  assert.equal((adminHtml.match(/<html\b/gi) || []).length, 1);
  assert.equal((adminHtml.match(/<body\b/gi) || []).length, 1);
  assert.ok(adminHtml.includes('decap-cms@3.15.1/dist/decap-cms.js'));
  assert.ok(!adminHtml.includes('menu-item-language'));
  assert.ok(!adminHtml.includes('/css/main.css'));
});

test('external links opened in a new tab prevent opener access', () => {
  const unsafeLinks = [];

  htmlFiles.forEach(filePath => {
    const html = readHtml(filePath);
    for (const match of html.matchAll(/<a\b[^>]*\btarget="_blank"[^>]*>/gi)) {
      if (!/\brel="[^"]*\bnoopener\b[^"]*"/i.test(match[0])) {
        unsafeLinks.push(`${path.relative(publicDir, filePath)}: ${match[0]}`);
      }
    }
  });

  assert.deepEqual(unsafeLinks, [], `unsafe target=_blank links:\n${unsafeLinks.join('\n')}`);
});

test('all tracked JavaScript files pass the Node syntax checker', () => {
  const trackedJavaScript = execFileSync('git', ['ls-files', '*.js'], {
    cwd: root,
    encoding: 'utf8'
  }).trim().split('\n').filter(Boolean);

  trackedJavaScript.forEach(relativePath => {
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, ['--check', path.join(root, relativePath)], {
        stdio: 'pipe'
      });
    }, `${relativePath} has invalid JavaScript syntax`);
  });
});
