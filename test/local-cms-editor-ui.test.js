const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools', 'local-cms', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'tools', 'local-cms', 'app.js'), 'utf8');
const fileEntryScript = fs.readFileSync(path.join(root, 'tools', 'local-cms', 'file-entry.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'tools', 'local-cms', 'studio.css'), 'utf8');
const serverScript = fs.readFileSync(path.join(root, 'tools', 'local-cms.js'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || '';
}

test('opening the CMS HTML file directly redirects to the local server entry', () => {
  assert.match(html, /<script src="\.\/file-entry\.js"><\/script>/);
  assert.match(fileEntryScript, /window\.location\.protocol === 'file:'/);
  assert.match(fileEntryScript, /window\.location\.replace\('http:\/\/127\.0\.0\.1:4010\/'\);/);
  assert.match(fileEntryScript, /document\.documentElement\.dataset\.studioSkin/);
});

test('manual CMS startup remains available until the user stops it', () => {
  assert.equal(packageJson.scripts['cms:local'], 'LOCAL_CMS_AUTO_SHUTDOWN=0 node tools/local-cms.js');
  assert.match(serverScript, /const CMS_AUTO_SHUTDOWN_ENABLED = process\.env\.LOCAL_CMS_AUTO_SHUTDOWN !== '0';/);
  assert.match(serverScript, /function scheduleCmsAutoShutdown\(\) \{\s*if \(!CMS_AUTO_SHUTDOWN_ENABLED\) return;/);
});

test('module switches paint cached workspaces immediately while initial startup keeps one stable skeleton', () => {
  assert.match(html, /<body class="cms-studio" data-workspace-mode="posts">/);
  assert.match(html, /id="workspace-loading" class="workspace-loading"[\s\S]*?id="workspace-loading-label"/);
  assert.match(html, /class="workspace-heading"[\s\S]*?id="workspace-kicker"[\s\S]*?id="workspace-title"/);
  assert.match(script, /function beginWorkspaceTransition\(mode = state\.mode, options = \{\}\)/);
  assert.match(script, /function finishWorkspaceTransition\(token, mode = state\.mode\)/);
  assert.match(script, /document\.body\.dataset\.workspaceMode = mode;/);
  assert.match(script, /function renderCachedModeWorkspace\(\)/);
  assert.match(script, /function applyMode\(mode, options = \{\}\)/);
  assert.match(script, /loading:\s*options\.loading !== false/);
  assert.match(script, /if \(options\.renderCached === true\) \{\s*renderCachedModeWorkspace\(\);/);
  assert.match(script, /applyMode\(mode, \{\s*loading:\s*false,\s*refreshing:\s*true,\s*renderCached:\s*true/);
  assert.match(script, /document\.body\.classList\.toggle\('is-workspace-loading', showLoading\);/);
  assert.match(script, /elements\.workspaceLoading\.hidden = !showLoading;/);
  assert.match(script, /finally \{\s*finishWorkspaceTransition\(transitionToken, mode\);\s*\}/);
  assert.match(styles, /\.cms-studio\[data-workspace-mode\] \.workspace-scroll[\s\S]*?background:\s*var\(--studio-theme-surface-glass\);/);
  assert.match(styles, /\.workspace-loading\[hidden\]\s*\{[\s\S]*?display:\s*none;/);
  assert.match(styles, /\.cms-studio\.is-workspace-loading \.workspace-heading > \*/);
  assert.match(styles, /visibility:\s*hidden;[\s\S]*?opacity:\s*0;/);
  assert.match(styles, /\.cms-studio\.is-workspace-loading \.workspace-heading::before/);
  assert.match(script, /document\.body\.classList\.add\('is-sidebar-loading'\);/);
  assert.match(script, /document\.body\.classList\.remove\('is-sidebar-loading'\);/);
  assert.match(script, /elements\.listPanel\?\.setAttribute\('aria-busy', 'true'\);/);
  assert.match(script, /elements\.listPanel\?\.setAttribute\('aria-busy', 'false'\);/);
  assert.match(styles, /\.cms-studio\.is-sidebar-loading \.list-panel\s*\{\s*pointer-events:\s*none;\s*\}/);
  assert.doesNotMatch(styles, /\.cms-studio\.is-sidebar-loading \.list-panel > \*/);
  assert.doesNotMatch(styles, /\.cms-studio\.is-sidebar-loading \.list-panel::after/);
});

test('secondary CMS workspaces are prefetched so their real content does not replace a default editor after navigation', () => {
  assert.match(script, /async function preloadSecondaryWorkspaces\(\)/);
  assert.match(script, /Promise\.allSettled\(\[\s*request\('\/api\/gallery'\),\s*request\('\/api\/images\/library'\)/);
  assert.match(script, /state\.gallery\.currentAlbum = firstAlbumRecord;/);
  assert.match(script, /state\.images\.items = payload\.items \|\| \[\];/);
  assert.match(script, /preloadSecondaryWorkspaces\(\),\s*loadAuditLogs\(\{ selectFirst: true, silent: true \}\)/);
  assert.match(script, /cacheRecord\('posts', item\.id, item\.record\)/);
  assert.match(script, /cacheRecord\('pages', item\.id, item\.record\)/);
  assert.match(script, /cacheRecord\('gallery', item\.slug, item\.record\)/);
  assert.match(serverScript, /sourceFiles:\s*item\.sourceFiles,\s*record:\s*item/);
  assert.match(serverScript, /file:\s*toPosixPath\(page\.file\),\s*record:\s*readPageById\(page\.id\)/);
  assert.match(serverScript, /cover:\s*album\.photos\[0\][\s\S]*?record:\s*album/);
  assert.match(script, /loadGallery\(false, '', \{ listOnly: true \}\)/);
  assert.doesNotMatch(
    script,
    /button\.addEventListener\('click', async \(\) => \{[\s\S]*?applyMode\(mode\);[\s\S]*?loadGallery\(true\)/
  );
});

test('stale async responses cannot repaint a newly selected CMS module or record', () => {
  assert.match(script, /async function loadPosts\(selectFirst = false\) \{\s*const requestedMode = state\.mode;/);
  assert.match(script, /async function loadGallery\(selectFirst = false, preferredSlug = '', options = \{\}\) \{\s*const requestedMode = state\.mode;/);
  assert.match(script, /async function loadImageLibrary\(folder = '', options = \{\}\) \{\s*const requestedMode = state\.mode;/);
  assert.match(script, /const requestedTransitionToken = state\.workspaceTransition\.token;/);
  assert.match(script, /state\.workspaceTransition\.token !== requestedTransitionToken/);
  assert.match(script, /\|\| state\.selectedId !== id/);
  assert.match(script, /\|\| state\.selectedId !== slug/);
});

test('every CMS module and record switch preserves its last workspace and refreshes without hiding content', () => {
  assert.match(script, /workspaceMemory:\s*\{\s*posts:\s*\{ selectedId: '', currentRecord: null, currentDraft: null \},\s*pages:/);
  assert.match(script, /recordCache:\s*\{\s*posts:\s*new Map\(\),\s*pages:\s*new Map\(\),\s*gallery:\s*new Map\(\)/);
  assert.match(script, /function rememberCurrentWorkspace\(\)/);
  assert.match(script, /function restoreWorkspaceMemory\(mode\)/);
  assert.match(script, /function flushPendingAutosave\(\)/);
  assert.match(script, /function applyMode\(mode, options = \{\}\) \{\s*flushPendingAutosave\(\);/);
  assert.match(script, /function revealPostEditor\(record\)/);
  assert.match(script, /function revealPageEditor\(record\)/);
  assert.match(script, /function revealGalleryEditor\(album\)/);
  assert.match(script, /const cachedRecord = getCachedRecord\('posts', id\)/);
  assert.match(script, /const cachedRecord = getCachedRecord\('pages', id\)/);
  assert.match(script, /const cachedRecord = getCachedRecord\('gallery', slug\)/);
  assert.match(
    script,
    /beginWorkspaceTransition\(mode, \{\s*loading:\s*false,\s*refreshing:\s*true,\s*hideContent:\s*false/
  );
  assert.match(script, /document\.body\.classList\.toggle\('is-workspace-refreshing', showRefreshing\);/);
  assert.doesNotMatch(
    script,
    /elements\.listPanel\.addEventListener\('click'[\s\S]*?beginWorkspaceTransition\(mode\);\s*try/
  );
});

test('local CMS static assets are served as binary images with explicit MIME types', () => {
  assert.match(serverScript, /'\.png':\s*'image\/png'/);
  assert.match(serverScript, /res\.end\(fs\.readFileSync\(filePath\)\);/);
});

test('both post languages expose accessible edit and preview tabs', () => {
  const viewTabs = (html.match(/<button[\s\S]*?>/g) || [])
    .filter(tag => tag.includes('data-post-body-language='));

  assert.equal(viewTabs.length, 4);

  ['zh', 'en'].forEach(language => {
    const languageTabs = viewTabs.filter(tag => attribute(tag, 'data-post-body-language') === language);
    assert.deepEqual(
      languageTabs.map(tag => attribute(tag, 'data-post-body-view')),
      ['edit', 'preview']
    );
    assert.deepEqual(
      languageTabs.map(tag => attribute(tag, 'aria-selected')),
      ['true', 'false']
    );

    languageTabs.forEach(tag => {
      const tabId = attribute(tag, 'id');
      const panelId = attribute(tag, 'aria-controls');
      assert.equal(attribute(tag, 'role'), 'tab');
      assert.ok(tabId);
      assert.ok(panelId);
      assert.match(
        html,
        new RegExp(`id="${panelId}"[\\s\\S]*?role="tabpanel"[\\s\\S]*?aria-labelledby="${tabId}"`)
      );
    });
  });

  assert.match(html, /id="post-zh-body"[^>]*aria-labelledby="post-zh-body-label"/);
  assert.match(html, /id="post-en-body"[^>]*aria-labelledby="post-en-body-label"/);
  assert.match(html, /id="post-zh-preview" class="markdown-preview"/);
  assert.match(html, /id="post-en-preview" class="markdown-preview"/);
});

test('post preview state and rendering are isolated by language', () => {
  assert.match(script, /requestTokens:\s*\{\s*zh:\s*0,\s*en:\s*0\s*\}/);
  assert.match(script, /views:\s*\{\s*zh:\s*'edit',\s*en:\s*'edit'\s*\}/);
  assert.match(script, /function renderPostPreview\(language, token\)/);
  assert.match(script, /function schedulePostPreviewRender\(language, delay = 240\)/);
  assert.match(script, /source\/_posts\/preview\.zh-CN\.md/);
  assert.match(script, /source\/_posts\/preview\.en\.md/);
  assert.match(script, /schedulePostPreviewRender\('en'\)/);
  assert.doesNotMatch(script, /scheduleZhPreviewRender|renderZhPreview/);
});

test('CMS default accent starts at Stanford Cardinal and keeps destructive actions semantic', () => {
  assert.match(styles, /--studio-accent:\s*#8c1515;/);
  assert.match(styles, /--studio-accent-hover:\s*#6f1010;/);
  assert.match(styles, /--studio-accent-text:\s*var\(--studio-accent\);/);
  assert.match(styles, /--studio-danger:\s*#b42318;/);
  assert.match(styles, /\.markdown-preview a\s*\{[\s\S]*?color:\s*var\(--studio-accent-text\);/);
  assert.doesNotMatch(styles, /#6558e8|#5548d8|#8175ff|#9288ff|rgba\(101,\s*88,\s*232|rgba\(129,\s*117,\s*255/);
});

test('CMS scroll regions use one square visual system without a nested inspector scroller', () => {
  assert.match(styles, /--studio-scroll-thumb:\s*#b7bac2;/);
  assert.match(
    styles,
    /\.workspace-scroll::-webkit-scrollbar[\s\S]*?width:\s*7px;[\s\S]*?height:\s*7px;/
  );
  assert.match(
    styles,
    /\.workspace-scroll::-webkit-scrollbar-thumb[\s\S]*?border-radius:\s*0;/
  );
  assert.match(
    styles,
    /#post-editor > \.post-inspector\s*\{[\s\S]*?max-height:\s*none;[\s\S]*?overflow:\s*visible;/
  );
});

test('post editor structural panes share one white canvas', () => {
  assert.match(
    styles,
    /\.workspace-scroll:has\(#post-editor:not\(\[hidden\]\)\)\s*\{[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.match(
    styles,
    /#post-editor \.post-language-switchbar\s*\{[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.match(
    styles,
    /#post-editor \.post-language-card textarea\[id\$="-body"\]\s*\{[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.match(
    styles,
    /#post-editor \.post-body-preview-panel\s*\{[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.match(
    styles,
    /#post-editor > \.post-inspector\s*\{[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.match(
    styles,
    /\.search-box input\s*\{[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.doesNotMatch(
    styles,
    /linear-gradient\([\s\S]*?var\(--studio-surface-subtle\)[\s\S]*?calc\(100% - 320px\)/
  );
});

test('pages, galleries, images, logs and settings share the same square pane grammar', () => {
  ['#page-editor', '#gallery-manager', '#image-library', '#audit-viewer'].forEach(selector => {
    assert.ok(styles.includes(selector), `${selector} is missing from the shared workspace rules`);
  });
  assert.match(
    styles,
    /\.workspace-scroll:has\(#page-editor:not\(\[hidden\]\)\)[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.match(
    styles,
    /#gallery-manager > \.gallery-manager\s*\{[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.match(
    styles,
    /#gallery-manager \.gallery-inner-card\s*\{[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*var\(--studio-surface\);/
  );
  assert.match(
    styles,
    /:is\(#appearance-panel, #post-llm-panel\)\s*\{[\s\S]*?border-bottom:\s*1px solid var\(--studio-border\);/
  );
  assert.match(
    styles,
    /#audit-viewer \.audit-log-card\s*\{[\s\S]*?background:\s*var\(--studio-surface-subtle\);/
  );
});

test('post command and media action layouts do not leave gaps or squeeze labels', () => {
  assert.match(
    styles,
    /\.workspace-scroll:has\(#post-editor:not\(\[hidden\]\)\)\s*>\s*#post-command-panel\s*\{[\s\S]*?margin-bottom:\s*0;/
  );
  assert.match(
    styles,
    /#post-editor \.library-grid\s*\{[\s\S]*?minmax\(min\(250px, 100%\), 1fr\)/
  );
  assert.match(
    styles,
    /#post-editor \.library-card-toolbar\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(0, 1\.12fr\)\s+minmax\(0, 1fr\)\s+minmax\(0, 0\.84fr\);/
  );
  assert.match(
    styles,
    /#post-editor \.library-card-primary-actions\s*\{[\s\S]*?display:\s*contents;/
  );
});
