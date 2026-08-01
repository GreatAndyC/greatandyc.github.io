const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const cmsRoot = path.join(root, 'tools', 'local-cms');
const html = fs.readFileSync(path.join(cmsRoot, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(cmsRoot, 'app.js'), 'utf8');
const entryScript = fs.readFileSync(path.join(cmsRoot, 'file-entry.js'), 'utf8');
const styles = fs.readFileSync(path.join(cmsRoot, 'studio.css'), 'utf8');
const themeScript = fs.readFileSync(path.join(cmsRoot, 'school-themes.js'), 'utf8');
const themeStyles = fs.readFileSync(path.join(cmsRoot, 'school-themes.css'), 'utf8');
const themeGenerator = fs.readFileSync(path.join(cmsRoot, 'generate-school-theme-css.js'), 'utf8');
const packReadme = fs.readFileSync(path.join(cmsRoot, 'SCHOOL_THEME_PACK.md'), 'utf8');
const themeContext = { Set };
vm.runInNewContext(themeScript, themeContext);
const catalog = themeContext.CMS_SCHOOL_THEME_CATALOG;

test('portable theme catalogue uses continent navigation and source-specific collections', () => {
  assert.equal(catalog.version, '3.2.1');
  assert.equal(catalog.defaultTheme, 'stanford');
  assert.equal(catalog.continents.length, 4);
  assert.equal(Object.keys(catalog.collections).length, 14);
  assert.equal(catalog.collections['china-985'].themes.length, 39);
  assert.equal(new Set(catalog.collections['china-985'].themes).size, 39);
  assert.equal(catalog.collections['united-states'].sourceId, 'usNewsNational2026');
  assert.equal(catalog.collections['united-states'].themes.length, 31);
  assert.equal(catalog.collections['united-states'].ranks.florida, 30);
  assert.equal(catalog.collections['united-states'].ranks['ut-austin'], 30);
  assert.equal(catalog.collections.canada.sourceId, 'usNewsGlobal2027');
  assert.equal(catalog.rankingSources.usNewsGlobal2027.provider, 'U.S. News');
  assert.equal(catalog.rankingSources.usNewsNational2026.provider, 'U.S. News');
  assert.equal(catalog.rankingSources.moe985.provider, '教育部');
  assert.equal(catalog.collections['hong-kong'].themes.length, 8);
  assert.equal(catalog.collections.singapore.themes.length, 6);

  const requestedTenSchoolCollections = [
    'china-top10',
    'japan',
    'south-korea',
    'taiwan',
    'canada',
    'united-kingdom',
    'germany',
    'france',
    'switzerland',
    'australia'
  ];
  requestedTenSchoolCollections.forEach(collectionId => {
    assert.equal(catalog.collections[collectionId].themes.length, 10, collectionId);
  });

  catalog.continents.forEach(continent => {
    continent.collections.forEach(collectionId => {
      assert.ok(catalog.collections[collectionId], `${collectionId} collection is missing`);
    });
  });
});

test('U.S. News national top 30 ranks include every tie with real marks and translated mottos', () => {
  const collection = catalog.collections['united-states'];
  const expectedThemes = [
    'princeton', 'mit', 'harvard', 'stanford', 'yale', 'uchicago',
    'duke', 'johns-hopkins', 'northwestern-us', 'upenn', 'caltech',
    'cornell', 'brown', 'dartmouth', 'columbia', 'berkeley', 'rice',
    'ucla', 'vanderbilt', 'cmu', 'michigan', 'notre-dame', 'washu',
    'emory', 'georgetown', 'unc', 'uva', 'usc', 'ucsd', 'florida',
    'ut-austin'
  ];

  assert.deepEqual(Array.from(collection.themes), expectedThemes);
  expectedThemes.forEach(themeId => {
    const school = catalog.schools[themeId];
    assert.equal(school.markType, 'local', `${themeId} still uses a generated monogram`);
    assert.ok(school.mark.endsWith(`${themeId}.png`), themeId);
    assert.ok(school.motto && school.motto.original, `${themeId} needs its original motto`);
    assert.ok(school.motto.zh, `${themeId} needs a Chinese motto translation`);
    assert.match(school.identityReference, /^https:\/\//, `${themeId} needs an identity reference`);
  });

  assert.match(script, /collection\.ranks && collection\.ranks\[themeId\]/);
  assert.match(collection.meta, /含并列，共31校/);
});

test('all 175 school themes ship complete local identity and motto assets', () => {
  const schools = Object.entries(catalog.schools);
  assert.equal(schools.length, 175);

  schools.forEach(([themeId, school]) => {
    assert.equal(school.markType, 'local', `${themeId} still uses a generated monogram`);
    assert.ok(school.mark.endsWith(`${themeId}.png`), `${themeId} mark path is not portable`);
    assert.ok(school.motto && school.motto.original, `${themeId} needs a motto or labelled institutional spirit`);
    assert.match(school.identityReference, /^https:\/\//, `${themeId} needs an identity reference`);
    assert.match(school.mottoReference, /^https:\/\//, `${themeId} needs a motto reference`);

    const mark = fs.readFileSync(path.join(cmsRoot, school.mark.replace('/assets/', 'assets/')));
    assert.deepEqual(Array.from(mark.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10], `${themeId} is not a PNG`);
    assert.ok(mark.subarray(16, 20).readUInt32BE(0) >= 64, `${themeId} mark is too narrow`);
    assert.ok(mark.subarray(20, 24).readUInt32BE(0) >= 64, `${themeId} mark is too short`);

    const chineseOriginalRegions = new Set(['china-mainland', 'hong-kong', 'taiwan']);
    const nativeChineseExceptions = new Set(['juntendo', 'ntu-singapore']);
    if (!chineseOriginalRegions.has(school.region) && !nativeChineseExceptions.has(themeId)) {
      assert.ok(school.motto.zh, `${themeId} needs a Chinese translation`);
    }
  });

  assert.match(packReadme, /175\/175 有本地 PNG 标志/);
  assert.match(packReadme, /175\/175 有校训或明确标注的正式精神语/);
});

test('every collection references registered schools without losing the original themes', () => {
  const referencedThemes = new Set();
  Object.values(catalog.collections).forEach(collection => {
    collection.themes.forEach(themeId => {
      referencedThemes.add(themeId);
      assert.ok(catalog.schools[themeId], `${themeId} school is missing`);
    });
  });

  [
    'mit', 'stanford', 'harvard', 'caltech', 'cornell', 'uchicago', 'princeton',
    'oxford', 'cambridge', 'lse', 'peking', 'tsinghua', 'ustc', 'hku', 'hkust',
    'tokyo', 'kyoto'
  ].forEach(themeId => assert.ok(referencedThemes.has(themeId), `${themeId} became unreachable`));
});

test('settings use the second pane for sections and keep theme filters inside appearance', () => {
  assert.match(html, /id="sidebar-title"/);
  assert.match(html, /id="theme-category-navigation"[\s\S]*?aria-label="学校主题筛选"/);
  assert.match(html, /id="theme-school-search"[\s\S]*?placeholder="学校名称或缩写"/);
  assert.match(html, /id="skin-picker"[\s\S]*?aria-label="按洲、国家或地区选择学校主题"/);
  assert.match(html, /北美采用 U\.S\. News，其他地区采用 THE 或官方院校名录/);
  assert.ok(
    html.indexOf('id="theme-category-navigation"') < html.indexOf('id="skin-picker"'),
    'theme filters must live inside the appearance workspace before the school grid'
  );
  assert.match(script, /settingsSection:\s*'appearance'/);
  assert.match(script, /function renderSettingsNavigation\(\)/);
  assert.match(script, /data-settings-section=/);
  assert.match(script, /外观与品牌/);
  assert.match(script, /AI 与排版/);
  assert.match(script, /function renderThemeCategoryNavigation\(\)/);
  assert.match(script, /CMS_SCHOOL_THEME_CATALOG\.continents\.map\(continent =>/);
  assert.match(script, /elements\.themeCategoryNavigation\.innerHTML =/);
  assert.match(script, /data-theme-collection=/);
  assert.match(script, /data-theme-continent=/);
  assert.match(script, /elements\.sidebarBody\.classList\.toggle\('is-settings-navigation', isSettings\);/);
  assert.match(script, /elements\.postLlmPanel\.hidden = !isSettings \|\| state\.settingsSection !== 'ai';/);
  assert.match(script, /elements\.appearancePanel\.hidden = !isSettings \|\| state\.settingsSection !== 'appearance';/);
  assert.match(script, /state\.themeCollection = collectionId;/);
  assert.match(styles, /\.settings-section-item\.is-active[\s\S]*?var\(--studio-accent\)/);
  assert.match(styles, /\.theme-filter-button\.is-active[\s\S]*?var\(--studio-accent\)/);
  assert.match(styles, /\.theme-library-controls\s*\{/);
});

test('school cards are data-driven, scalable and use honest local mark fallbacks', () => {
  assert.ok(Object.keys(catalog.schools).length >= 150);
  Object.entries(catalog.schools).forEach(([themeId, school]) => {
    assert.ok(school.label, themeId);
    assert.ok(school.fullName, themeId);
    assert.match(school.primary, /^#[0-9a-f]{6}$/i);
    assert.match(school.hover, /^#[0-9a-f]{6}$/i);
    assert.match(school.secondary, /^#[0-9a-f]{6}$/i);
    assert.ok(['local', 'monogram'].includes(school.markType), themeId);
    if (school.markType === 'local') {
      assert.ok(school.mark.endsWith(`${themeId}.png`), themeId);
      const mark = fs.readFileSync(path.join(cmsRoot, school.mark.replace('/assets/', 'assets/')));
      assert.deepEqual(Array.from(mark.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    } else {
      assert.ok(school.markText, `${themeId} needs a monogram fallback`);
    }
  });

  assert.match(script, /function getSchoolMarkSource\(school\)/);
  assert.match(script, /data:image\/svg\+xml;charset=UTF-8/);
  assert.doesNotMatch(script, /style="--skin-accent:/);
  assert.match(themeGenerator, /Object\.entries\(catalog\.schools\)\.map/);
  assert.equal((themeStyles.match(/^:root\[data-studio-skin=/gm) || []).length, Object.keys(catalog.schools).length);
  Object.keys(catalog.schools).forEach(themeId => {
    assert.ok(themeStyles.includes(`data-ui-skin="${themeId}"`), `${themeId} picker token is missing`);
  });
});

test('USTC uses the corrected official circular emblem instead of a 16px favicon', () => {
  const mark = path.join(cmsRoot, 'assets', 'school-marks', 'ustc.png');
  const png = fs.readFileSync(mark);
  assert.deepEqual(Array.from(png.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  const dimensions = png.subarray(16, 24);
  assert.equal(dimensions.readUInt32BE(0), 128);
  assert.equal(dimensions.readUInt32BE(4), 128);
  assert.equal(catalog.schools.ustc.primary, '#034ea1');
  assert.match(packReadme, /www\.ustc\.edu\.cn\/news\/images\/logo\.svg/);
});

test('school theme selection prevents first-paint color flash and persists locally', () => {
  assert.match(script, /const CMS_UI_SKIN_STORAGE_KEY = 'local-cms-ui-skin-v1';/);
  assert.match(script, /new Set\(Object\.keys\(CMS_SCHOOL_THEME_CATALOG\.schools\)\)/);
  assert.match(entryScript, /document\.documentElement\.dataset\.studioSkin = initialThemeId;/);
  assert.match(themeStyles, /:root\[data-studio-skin="stanford"\] \.cms-studio/);
  assert.doesNotMatch(script, /\.style\.setProperty\('--studio-accent'/);
  assert.doesNotMatch(script, /style="--skin-accent:/);
  assert.match(script, /window\.localStorage\.setItem\(CMS_UI_SKIN_STORAGE_KEY, normalizedSkin\);/);
  assert.match(script, /elements\.skinPicker\.addEventListener\('click'/);
  assert.match(script, /button\.setAttribute\('aria-pressed', String\(isActive\)\);/);
});

test('school identity propagates to controls, shell atmosphere, watermark and translated motto', () => {
  assert.match(styles, /--studio-theme-canvas:\s*color-mix\(/);
  assert.match(styles, /--studio-theme-surface:\s*color-mix\(/);
  assert.match(styles, /\.primary-button\s*\{[\s\S]*?background:\s*var\(--studio-accent\);/);
  assert.match(styles, /\.mode-button\.is-active\s*\{[\s\S]*?background:\s*var\(--studio-accent\);/);
  assert.match(styles, /\.workspace-header::after\s*\{[\s\S]*?var\(--studio-accent-secondary\)/);
  assert.match(html, /id="workspace-theme-watermark"[\s\S]*?\/assets\/school-marks\/stanford\.png/);
  assert.match(html, /id="workspace-theme-motto-label">校训</);
  assert.match(script, /elements\.workspaceThemeWatermark\.src = themeMarkPath;/);
  assert.match(script, /elements\.workspaceThemeMottoLabel\.textContent = '校训';/);
  assert.match(script, /elements\.workspaceThemeMottoLabel\.title = `资料类型：\$\{themeMotto\.label\}`;/);
  assert.match(script, /themeMotto\.zh\s*\?\s*`\$\{themeMotto\.original\} · \$\{themeMotto\.zh\}`\s*:\s*themeMotto\.original/);
  assert.match(styles, /\.workspace-theme-watermark\s*\{[\s\S]*?opacity:\s*0\.048;/);
});

test('corrected school marks stay visible and recognizable in compact cards', () => {
  const expectedDimensions = {
    sysu: [229, 229],
    buaa: [473, 473],
    fudan: [512, 511],
    hit: [337, 295],
    geneva: [1000, 290],
    nycu: [779, 780],
    nanjing: [135, 135],
    ntnu: [592, 592],
    washington: [450, 303],
    washu: [180, 180]
  };

  Object.entries(expectedDimensions).forEach(([themeId, [expectedWidth, expectedHeight]]) => {
    const mark = fs.readFileSync(path.join(cmsRoot, 'assets', 'school-marks', `${themeId}.png`));
    assert.equal(mark.subarray(16, 20).readUInt32BE(0), expectedWidth, `${themeId} width changed`);
    assert.equal(mark.subarray(20, 24).readUInt32BE(0), expectedHeight, `${themeId} height changed`);
  });

  assert.match(styles, /grid-template-columns:\s*60px minmax\(0, 1fr\) auto;/);
  assert.match(styles, /\.skin-mark\s*\{[\s\S]*?width:\s*58px;/);
  assert.match(styles, /\.skin-mark img\s*\{[\s\S]*?width:\s*50px;/);
  assert.match(packReadme, /界面统一显示中文栏目名“校训”/);
  assert.ok(new Set(Object.values(catalog.schools).map(school => school.motto.label)).size > 1);
});

test('theme pack documents migration boundaries and ranking provenance', () => {
  assert.match(packReadme, /school-themes\.js/);
  assert.match(packReadme, /school-themes\.css/);
  assert.match(packReadme, /assets\/school-marks\//);
  assert.match(packReadme, /U\.S\. News Best Global Universities 2026–2027/);
  assert.match(packReadme, /教育部公布的 39 所“985工程”学校名单/);
  assert.match(packReadme, /宿主适配代码/);
  assert.match(packReadme, /商标使用条款/);
});
