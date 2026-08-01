const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
const html = fs.readFileSync(path.join(root, 'tools', 'local-cms', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'tools', 'local-cms', 'app.js'), 'utf8');
const serverScript = fs.readFileSync(path.join(root, 'tools', 'local-cms.js'), 'utf8');

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || '';
}

function buttonById(id) {
  return (html.match(/<button\b[\s\S]*?<\/button>/g) || [])
    .find(tag => attribute(tag, 'id') === id) || '';
}

function functionBody(source, name) {
  const declaration = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`).exec(source);
  assert.ok(declaration, `missing function ${name}`);

  const openingBrace = source.indexOf('{', declaration.index);
  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = openingBrace; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = '';
      }
      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }

    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  assert.fail(`unterminated function ${name}`);
}

test('durable drafts live in a private gitignored CMS directory', () => {
  assert.match(gitignore, /(?:^|\r?\n)\.local-cms\/(?:\r?\n|$)/);
  assert.match(
    serverScript,
    /const DRAFTS_DIR\s*=\s*path\.join\((?:ROOT|PROJECT_ROOT),\s*['"]\.local-cms['"],\s*['"]drafts-v2['"]\);/
  );
  assert.match(serverScript, /createDraftStore\(DRAFTS_DIR\)|new DraftStore\(DRAFTS_DIR\)/);
  assert.doesNotMatch(serverScript, /DRAFTS_DIR\s*=\s*path\.join\([^)]*['"]source['"][^)]*['"]_drafts['"]/);
});

test('the server exposes list, upsert, read, delete and publish draft routes', () => {
  assert.match(
    serverScript,
    /req\.method === 'GET' && pathname === '\/api\/drafts'/
  );
  assert.match(
    serverScript,
    /req\.method === 'POST' && pathname === '\/api\/drafts'/
  );
  assert.match(
    serverScript,
    /req\.method === 'GET' && pathname\.startsWith\('\/api\/drafts\/'\)/
  );
  assert.match(
    serverScript,
    /req\.method === 'DELETE' && pathname\.startsWith\('\/api\/drafts\/'\)/
  );
  assert.match(
    serverScript,
    /req\.method === 'POST' && pathname\.startsWith\('\/api\/drafts\/'\) && pathname\.endsWith\('\/publish'\)/
  );
});

test('saving a draft and publishing an article are separate actions', () => {
  const saveButton = buttonById('save-button');
  const publishButton = buttonById('publish-button');

  assert.ok(saveButton, 'missing the draft save button');
  assert.ok(publishButton, 'missing the publish button');
  assert.match(saveButton, />\s*保存(?:草稿)?\s*<\/button>/);
  assert.match(publishButton, />\s*发布文章\s*<\/button>/);

  assert.match(script, /saveButton:\s*document\.querySelector\('#save-button'\)/);
  assert.match(script, /publishButton:\s*document\.querySelector\('#publish-button'\)/);
  assert.match(script, /request\('\/api\/drafts',\s*\{[\s\S]*?method:\s*'POST'/);
  assert.match(script, /request\(`\/api\/drafts\/\$\{encodeURIComponent\([^)]+\)\}\/publish`,\s*\{[\s\S]*?method:\s*'POST'/);
  assert.match(script, /elements\.saveButton\.addEventListener\('click',\s*handleSaveDraft\)/);
  assert.match(script, /elements\.publishButton\.addEventListener\('click',\s*handlePublishPost\)/);
});

test('the article list provides consistent all, draft and published filters', () => {
  const filterTags = (html.match(/<button\b[\s\S]*?<\/button>/g) || [])
    .filter(tag => attribute(tag, 'data-post-status-filter'));
  const filterValues = filterTags.map(tag => attribute(tag, 'data-post-status-filter'));

  assert.deepEqual(filterValues, ['all', 'draft', 'published']);
  assert.equal(new Set(filterValues).size, filterValues.length);
  assert.match(html, /id="post-status-filters"[^>]*role="group"/);

  filterValues.forEach(status => {
    assert.match(
      html,
      new RegExp(`data-post-status-count="${status}"`)
    );
  });

  assert.match(script, /querySelectorAll\('\[data-post-status-filter\]'\)/);
  assert.match(script, /dataset\.postStatusFilter/);
  assert.match(script, /postStatusFilter:\s*'all'/);
});

test('pagehide synchronously flushes pending recovery data before closing the session', () => {
  const pagehideRegistration = /window\.addEventListener\('pagehide',\s*([A-Za-z_$][\w$]*)\);/.exec(script);
  assert.ok(pagehideRegistration, 'pagehide must use a named, testable handler');

  const body = functionBody(script, pagehideRegistration[1]);
  const flushIndex = body.indexOf('flushPendingAutosave()');
  const closeIndex = body.indexOf('closeCmsSession()');

  assert.notEqual(flushIndex, -1, 'pagehide handler must flush pending draft recovery data');
  assert.notEqual(closeIndex, -1, 'pagehide handler must close the CMS session');
  assert.ok(flushIndex < closeIndex, 'draft recovery data must flush before the session closes');
});

test('localStorage failures are contained so editing can continue', () => {
  const readBody = functionBody(script, 'readStoredDraftMap');
  const writeBody = functionBody(script, 'writeStoredDraftMap');

  assert.match(readBody, /try\s*\{/);
  assert.match(readBody, /catch\s*\([^)]*\)\s*\{/);
  assert.match(writeBody, /try\s*\{/);
  assert.match(writeBody, /catch\s*\([^)]*\)\s*\{/);
  assert.match(writeBody, /localStorage\.setItem/);
});

test('the obsolete full-page local draft viewer is removed', () => {
  [
    'post-draft-toggle-button',
    'post-draft-viewer',
    'post-draft-viewer-content',
    'post-draft-restore-button',
    'post-draft-clear-button'
  ].forEach(id => {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`));
    assert.doesNotMatch(script, new RegExp(`#${id}`));
  });

  assert.doesNotMatch(html, /class="[^"]*\bdraft-viewer-card\b/);
  assert.doesNotMatch(script, /postDraftViewerOpen/);
});
