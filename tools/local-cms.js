#!/usr/bin/env node

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { spawn } = require('child_process');
const yaml = require('js-yaml');
const frontMatter = require('hexo-front-matter');

const HOST = process.env.LOCAL_CMS_HOST || '127.0.0.1';
const PORT = Number(process.env.LOCAL_CMS_PORT || 4010);
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const IMAGES_DIR = path.join(ROOT, 'source', 'images');
const GALLERY_DOC_DIR = path.join(ROOT, 'content', 'gallery');
const GALLERY_DATA_PATH = path.join(ROOT, 'source', '_data', 'gallery.yml');
const STATIC_DIR = path.join(ROOT, 'tools', 'local-cms');
const CONFIG_PATH = path.join(ROOT, '_config.yml');
const ENV_PATH = path.join(ROOT, '.env');
const LOCAL_SETTINGS_PATH = path.join(ROOT, '.local-cms.json');
const GALLERY_PAGE_IDS = new Set(['gallery-zh', 'gallery-en']);
const GALLERY_DEFAULT_EMPTY = {
  'zh-CN': '画廊还没有内容，后续会逐步补充更多作品。',
  en: 'The gallery is empty for now. More work will be added over time.'
};
const LLM_ENV_KEYS = {
  endpoint: 'LOCAL_CMS_LLM_ENDPOINT',
  apiKey: 'LOCAL_CMS_LLM_API_KEY',
  model: 'LOCAL_CMS_LLM_MODEL',
  temperature: 'LOCAL_CMS_LLM_TEMPERATURE',
  prompt: 'LOCAL_CMS_LLM_PROMPT'
};

const PAGE_DEFINITIONS = [
  { id: 'about-zh', label: 'About 中文', file: path.join(ROOT, 'source', 'about', 'index.md') },
  { id: 'about-en', label: 'About English', file: path.join(ROOT, 'source', 'en', 'about', 'index.md') },
  { id: 'gallery-zh', label: 'Gallery 中文', file: path.join(ROOT, 'source', 'gallery', 'index.md') },
  { id: 'gallery-en', label: 'Gallery English', file: path.join(ROOT, 'source', 'en', 'gallery', 'index.md') },
  { id: 'categories-zh', label: 'Categories 中文', file: path.join(ROOT, 'source', 'categories', 'index.md') },
  { id: 'categories-en', label: 'Categories English', file: path.join(ROOT, 'source', 'en', 'categories', 'index.md') },
  { id: 'tags-zh', label: 'Tags 中文', file: path.join(ROOT, 'source', 'tags', 'index.md') },
  { id: 'tags-en', label: 'Tags English', file: path.join(ROOT, 'source', 'en', 'tags', 'index.md') }
];

const RESERVED_POST_FIELDS = new Set([
  'title',
  'date',
  'lang',
  'slug',
  'permalink',
  'description',
  'photos',
  'tags',
  'categories',
  'toc'
]);

const RESERVED_PAGE_FIELDS = new Set([
  'title',
  'date',
  'lang',
  'comments',
  'toc'
]);

const COMMAND_SCRIPTS = {
  clean: { label: '清缓存', script: 'clean' },
  build: { label: '构建站点', script: 'build' },
  deploy: { label: '部署站点', script: 'deploy' },
  serve: { label: '启动预览', script: 'server' }
};

const DEFAULT_LLM_SETTINGS = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  model: '',
  temperature: 0.2,
  prompt: [
    '你是一个严谨的中文 Markdown 编辑助手。',
    '请把用户给出的中文博客草稿整理成更清晰的 Markdown 正文。',
    '只输出排版后的正文，不要额外解释。',
    '保留事实、链接、图片地址和代码块，不要捏造信息。',
    '不输出 front matter。'
  ].join('\n')
};

const commandState = {
  currentTask: null,
  currentTaskLog: '',
  lastTask: null,
  serverProcess: null,
  serverStatus: {
    running: false,
    startedAt: '',
    pid: null,
    url: 'http://127.0.0.1:4000/',
    log: ''
  }
};

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function textResponse(res, statusCode, contentType, body) {
  res.writeHead(statusCode, { 'Content-Type': `${contentType}; charset=utf-8` });
  res.end(body);
}

function binaryResponse(res, statusCode, contentType, body) {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

function toPosixPath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function ensureInsideRoot(filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(ROOT)) {
    throw new Error('目标路径超出项目目录。');
  }
  return resolved;
}

function parseMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = frontMatter.parse(raw);
  return {
    data: parsed,
    body: parsed._content || ''
  };
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ];
  const time = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0')
  ];
  return `${parts.join('-')} ${time.join(':')}`;
}

function toDateTimeLocalValue(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ];
  const time = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0')
  ];
  return `${parts.join('-')}T${time.join(':')}`;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizePhotoList(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function slugifyFileSegment(value) {
  const cleaned = String(value || '')
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return cleaned || 'untitled';
}

function loadCategoryOptions() {
  const config = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
  const categoryMap = config.category_map || {};

  return Object.entries(categoryMap).map(([zh, en]) => ({
    id: slugifyFileSegment(en || zh),
    zh,
    en
  }));
}

function findCategoryOptionByNames(options, zhCategory, enCategory) {
  return options.find(option => option.zh === zhCategory || option.en === enCategory) || null;
}

function formatYamlInlineString(value) {
  const text = String(value || '').trim();
  if (!text) return '""';
  if (/^[\p{L}\p{N}_-]+$/u.test(text)) return text;
  return JSON.stringify(text);
}

function appendCategoryMapEntry(configText, zh, en) {
  const lines = configText.split(/\r?\n/);
  const lineBreak = configText.includes('\r\n') ? '\r\n' : '\n';
  const startIndex = lines.findIndex(line => /^category_map:\s*$/.test(line));

  if (startIndex === -1) {
    throw new Error('找不到 _config.yml 里的 category_map 配置。');
  }

  let insertIndex = startIndex + 1;
  while (insertIndex < lines.length) {
    const line = lines[insertIndex];
    if (!line.trim()) {
      insertIndex += 1;
      continue;
    }
    if (/^\s/.test(line) || /^#/.test(line)) {
      insertIndex += 1;
      continue;
    }
    break;
  }

  lines.splice(insertIndex, 0, `  ${formatYamlInlineString(zh)}: ${formatYamlInlineString(en)}`);
  return lines.join(lineBreak);
}

function addCategoryOption(payload) {
  const zh = String(payload && payload.zh || '').trim();
  const en = String(payload && payload.en || '').trim();

  if (!zh || !en) {
    throw new Error('新增预设分类时，中英文名称都不能为空。');
  }

  const existingOptions = loadCategoryOptions();
  const newId = slugifyFileSegment(en || zh);
  const exactMatch = existingOptions.find(option => option.zh === zh && option.en === en);

  if (exactMatch) {
    return {
      category: exactMatch,
      categories: existingOptions
    };
  }

  if (existingOptions.some(option => option.zh === zh && option.en !== en)) {
    throw new Error('这个中文分类已经存在，但对应的英文名不同，请先统一命名。');
  }

  if (existingOptions.some(option => option.en === en && option.zh !== zh)) {
    throw new Error('这个英文分类已经存在，但对应的中文名不同，请先统一命名。');
  }

  if (existingOptions.some(option => option.id === newId)) {
    throw new Error('该英文分类生成的标识与现有分类冲突，请换一个英文名称。');
  }

  const configText = fs.readFileSync(CONFIG_PATH, 'utf8');
  const updatedConfigText = appendCategoryMapEntry(configText, zh, en);
  fs.writeFileSync(CONFIG_PATH, updatedConfigText, 'utf8');

  return {
    category: { id: newId, zh, en },
    categories: loadCategoryOptions()
  };
}

function splitPostKey(filename) {
  const match = filename.match(/^(.+)\.(zh-CN|en)\.md$/);
  if (!match) return null;
  return {
    key: match[1],
    lang: match[2]
  };
}

function deriveSlugFromKey(key) {
  return String(key || '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function derivePermalink(language, dateValue, slug, fallbackPermalink) {
  if (fallbackPermalink) return fallbackPermalink;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const prefix = language === 'en' ? 'en/' : '';
  const dateParts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ];
  return `${prefix}${dateParts.join('/')}/${slug}/`;
}

function omitReservedFields(data, reservedFields) {
  return Object.fromEntries(
    Object.entries(data || {}).filter(([key]) => !reservedFields.has(key) && key !== '_content')
  );
}

function buildFrontMatterString(data, body) {
  const serialized = yaml.dump(data, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"'
  });

  const normalizedBody = String(body || '').replace(/^\n+/, '');
  return `---\n${serialized}---\n\n${normalizedBody}`;
}

function normalizeGallerySlug(value) {
  const slug = String(value || '').trim();
  if (!slug) {
    throw new Error('画廊相册的 slug 不能为空。');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('画廊相册的 slug 只能包含小写字母、数字和连字符。');
  }
  return slug;
}

function normalizeGalleryLanguages(value) {
  const raw = Array.isArray(value)
    ? value
    : String(value || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

  const unique = Array.from(new Set(raw.filter(item => item === 'zh-CN' || item === 'en')));
  return unique.length ? unique : ['zh-CN', 'en'];
}

function splitMarkdownTableRow(line) {
  const row = String(line || '').trim();
  const content = row.replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let current = '';

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const previous = index > 0 ? content[index - 1] : '';

    if (char === '|' && previous !== '\\') {
      cells.push(current.trim().replace(/\\\|/g, '|'));
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim().replace(/\\\|/g, '|'));
  return cells;
}

function parseGalleryPhotoTable(body) {
  const rows = String(body || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && line.endsWith('|'));

  if (rows.length < 2) return [];

  const header = splitMarkdownTableRow(rows[0]);
  const divider = splitMarkdownTableRow(rows[1]);
  if (!divider.every(cell => /^:?-{3,}:?$/.test(cell))) {
    throw new Error('画廊照片表格格式不合法，请使用标准 Markdown 表格。');
  }

  return rows.slice(2).map(line => {
    const cells = splitMarkdownTableRow(line);
    const row = {};
    header.forEach((key, index) => {
      row[key] = (cells[index] || '').replace(/<br\s*\/?>/gi, '\n');
    });
    return row;
  }).filter(row => Object.values(row).some(Boolean));
}

function escapeMarkdownTableCell(value) {
  return String(value || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

function normalizeGalleryPhotoSrc(rawSrc) {
  return String(rawSrc || '').trim();
}

function galleryDocPathFromSlug(slug) {
  return ensureInsideRoot(path.join(GALLERY_DOC_DIR, `${slug}.md`));
}

function loadGalleryEmptyState() {
  if (!fs.existsSync(GALLERY_DATA_PATH)) {
    return { ...GALLERY_DEFAULT_EMPTY };
  }

  const existing = yaml.load(fs.readFileSync(GALLERY_DATA_PATH, 'utf8')) || {};
  const empty = existing.empty && typeof existing.empty === 'object' ? existing.empty : {};
  return {
    'zh-CN': String(empty['zh-CN'] || GALLERY_DEFAULT_EMPTY['zh-CN']),
    en: String(empty.en || GALLERY_DEFAULT_EMPTY.en)
  };
}

function buildGalleryAlbumRecord(filePath) {
  const parsed = parseMarkdownFile(filePath);
  const data = parsed.data || {};
  const slug = normalizeGallerySlug(data.slug || path.basename(filePath, '.md'));
  const photos = parseGalleryPhotoTable(parsed.body).map(row => {
    const src = normalizeGalleryPhotoSrc(row.src);
    if (!src) {
      throw new Error(`画廊相册 ${slug} 中存在空图片路径。`);
    }

    return {
      src,
      title: {
        'zh-CN': String(row.title_zh || ''),
        en: String(row.title_en || '')
      },
      caption: {
        'zh-CN': String(row.caption_zh || ''),
        en: String(row.caption_en || '')
      },
      meta: String(row.meta || '')
    };
  });

  return {
    kind: 'gallery-album',
    slug,
    sourceSlug: slug,
    file: toPosixPath(filePath),
    languages: normalizeGalleryLanguages(data.languages),
    title: {
      'zh-CN': String(data.title_zh || ''),
      en: String(data.title_en || '')
    },
    period: {
      'zh-CN': String(data.period_zh || ''),
      en: String(data.period_en || '')
    },
    location: {
      'zh-CN': String(data.location_zh || ''),
      en: String(data.location_en || '')
    },
    camera: {
      'zh-CN': String(data.camera_zh || ''),
      en: String(data.camera_en || '')
    },
    description: {
      'zh-CN': String(data.description_zh || ''),
      en: String(data.description_en || '')
    },
    tags: {
      'zh-CN': normalizeStringList(data.tags_zh),
      en: normalizeStringList(data.tags_en)
    },
    photos
  };
}

function listGalleryAlbumFiles() {
  if (!fs.existsSync(GALLERY_DOC_DIR)) {
    fs.mkdirSync(GALLERY_DOC_DIR, { recursive: true });
  }

  return fs.readdirSync(GALLERY_DOC_DIR)
    .filter(name => name.endsWith('.md') && name !== '_template.md')
    .sort((left, right) => left.localeCompare(right))
    .map(name => path.join(GALLERY_DOC_DIR, name));
}

function listGalleryAlbumsDetailed() {
  return listGalleryAlbumFiles().map(filePath => buildGalleryAlbumRecord(filePath));
}

function listGalleryAlbums() {
  return listGalleryAlbumsDetailed().map(album => ({
    slug: album.slug,
    file: album.file,
    titleZh: album.title['zh-CN'],
    titleEn: album.title.en,
    periodZh: album.period['zh-CN'],
    periodEn: album.period.en,
    locationZh: album.location['zh-CN'],
    locationEn: album.location.en,
    photoCount: album.photos.length,
    cover: album.photos[0] ? album.photos[0].src : ''
  }));
}

function readGalleryAlbumBySlug(slug) {
  const normalizedSlug = normalizeGallerySlug(slug);
  const filePath = galleryDocPathFromSlug(normalizedSlug);
  if (!fs.existsSync(filePath)) {
    throw new Error(`找不到画廊相册：${normalizedSlug}`);
  }
  return buildGalleryAlbumRecord(filePath);
}

function buildGalleryMarkdownTable(photos) {
  const rows = [
    '| src | title_zh | title_en | caption_zh | caption_en | meta |',
    '| --- | --- | --- | --- | --- | --- |'
  ];

  photos.forEach(photo => {
    rows.push([
      '|',
      ` ${escapeMarkdownTableCell(photo.src)} |`,
      ` ${escapeMarkdownTableCell(photo.title['zh-CN'])} |`,
      ` ${escapeMarkdownTableCell(photo.title.en)} |`,
      ` ${escapeMarkdownTableCell(photo.caption['zh-CN'])} |`,
      ` ${escapeMarkdownTableCell(photo.caption.en)} |`,
      ` ${escapeMarkdownTableCell(photo.meta)} |`
    ].join(''));
  });

  return rows.join('\n');
}

function serializeGalleryAlbum(record) {
  const frontMatterData = {
    slug: record.slug,
    languages: record.languages.join(','),
    title_zh: record.title['zh-CN'],
    title_en: record.title.en,
    period_zh: record.period['zh-CN'],
    period_en: record.period.en,
    location_zh: record.location['zh-CN'],
    location_en: record.location.en,
    camera_zh: record.camera['zh-CN'],
    camera_en: record.camera.en,
    description_zh: record.description['zh-CN'],
    description_en: record.description.en,
    tags_zh: record.tags['zh-CN'].join(','),
    tags_en: record.tags.en.join(',')
  };

  return buildFrontMatterString(frontMatterData, buildGalleryMarkdownTable(record.photos));
}

function syncGalleryDataFile() {
  const albums = listGalleryAlbumsDetailed().map(album => ({
    slug: album.slug,
    languages: album.languages,
    title: album.title,
    period: album.period,
    location: album.location,
    camera: album.camera,
    description: album.description,
    tags: album.tags,
    photos: album.photos.map(photo => {
      const next = {
        src: photo.src,
        title: photo.title,
        caption: photo.caption
      };
      if (photo.meta) {
        next.meta = photo.meta;
      }
      return next;
    })
  }));

  const output = yaml.dump({
    empty: loadGalleryEmptyState(),
    albums
  }, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });

  fs.mkdirSync(path.dirname(GALLERY_DATA_PATH), { recursive: true });
  fs.writeFileSync(GALLERY_DATA_PATH, output, 'utf8');
}

function writeGalleryAlbum(payload) {
  const sourceSlug = String(payload && payload.sourceSlug || '').trim();
  const slug = normalizeGallerySlug(payload && payload.slug);
  const targetPath = galleryDocPathFromSlug(slug);
  const sourcePath = sourceSlug ? galleryDocPathFromSlug(normalizeGallerySlug(sourceSlug)) : '';

  if (sourcePath && sourcePath !== targetPath && fs.existsSync(targetPath)) {
    throw new Error(`目标 slug 已存在：${slug}`);
  }

  if (!sourcePath && fs.existsSync(targetPath)) {
    throw new Error(`画廊相册已存在：${slug}`);
  }

  const record = {
    slug,
    languages: normalizeGalleryLanguages(payload.languages),
    title: {
      'zh-CN': String(payload.title && payload.title['zh-CN'] || '').trim(),
      en: String(payload.title && payload.title.en || '').trim()
    },
    period: {
      'zh-CN': String(payload.period && payload.period['zh-CN'] || '').trim(),
      en: String(payload.period && payload.period.en || '').trim()
    },
    location: {
      'zh-CN': String(payload.location && payload.location['zh-CN'] || '').trim(),
      en: String(payload.location && payload.location.en || '').trim()
    },
    camera: {
      'zh-CN': String(payload.camera && payload.camera['zh-CN'] || '').trim(),
      en: String(payload.camera && payload.camera.en || '').trim()
    },
    description: {
      'zh-CN': String(payload.description && payload.description['zh-CN'] || '').trim(),
      en: String(payload.description && payload.description.en || '').trim()
    },
    tags: {
      'zh-CN': normalizeStringList(payload.tags && payload.tags['zh-CN']),
      en: normalizeStringList(payload.tags && payload.tags.en)
    },
    photos: Array.isArray(payload.photos)
      ? payload.photos.map(item => ({
        src: normalizeGalleryPhotoSrc(item && item.src),
        title: {
          'zh-CN': String(item && item.title && item.title['zh-CN'] || '').trim(),
          en: String(item && item.title && item.title.en || '').trim()
        },
        caption: {
          'zh-CN': String(item && item.caption && item.caption['zh-CN'] || '').trim(),
          en: String(item && item.caption && item.caption.en || '').trim()
        },
        meta: String(item && item.meta || '').trim()
      })).filter(item => item.src)
      : []
  };

  if (!record.title['zh-CN'] || !record.title.en) {
    throw new Error('画廊相册的中英文标题都不能为空。');
  }

  if (!record.photos.length) {
    throw new Error('至少需要一张照片才能保存画廊相册。');
  }

  fs.mkdirSync(GALLERY_DOC_DIR, { recursive: true });
  fs.writeFileSync(targetPath, serializeGalleryAlbum(record), 'utf8');

  if (sourcePath && sourcePath !== targetPath && fs.existsSync(sourcePath)) {
    fs.unlinkSync(sourcePath);
  }

  syncGalleryDataFile();
  return readGalleryAlbumBySlug(slug);
}

function parseDotEnv(content = '') {
  return String(content || '')
    .split(/\r?\n/)
    .reduce((result, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return result;

      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) return result;

      const key = match[1];
      let value = match[2] || '';
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith('\'') && value.endsWith('\''))
      ) {
        value = value.slice(1, -1);
      }

      result[key] = value
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      return result;
    }, {});
}

function encodeEnvValue(value) {
  return `"${String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/"/g, '\\"')}"`;
}

function loadEnvSettings() {
  if (!fs.existsSync(ENV_PATH)) return null;

  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const env = parseDotEnv(raw);
  const hasAnyLlmConfig = Object.values(LLM_ENV_KEYS).some(key => Object.prototype.hasOwnProperty.call(env, key));

  if (!hasAnyLlmConfig) return null;

  return {
    llm: {
      ...DEFAULT_LLM_SETTINGS,
      endpoint: env[LLM_ENV_KEYS.endpoint] || DEFAULT_LLM_SETTINGS.endpoint,
      apiKey: env[LLM_ENV_KEYS.apiKey] || '',
      model: env[LLM_ENV_KEYS.model] || '',
      temperature: Number(env[LLM_ENV_KEYS.temperature] || DEFAULT_LLM_SETTINGS.temperature),
      prompt: env[LLM_ENV_KEYS.prompt] || DEFAULT_LLM_SETTINGS.prompt
    }
  };
}

function updateEnvFile(entries) {
  const lineBreak = fs.existsSync(ENV_PATH) && fs.readFileSync(ENV_PATH, 'utf8').includes('\r\n') ? '\r\n' : '\n';
  const existingText = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const lines = existingText ? existingText.split(/\r?\n/) : [];
  const handledKeys = new Set();

  const nextLines = lines.map(line => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match) return line;

    const key = match[1];
    if (!Object.prototype.hasOwnProperty.call(entries, key)) return line;

    handledKeys.add(key);
    return `${key}=${encodeEnvValue(entries[key])}`;
  });

  Object.entries(entries).forEach(([key, value]) => {
    if (handledKeys.has(key)) return;
    nextLines.push(`${key}=${encodeEnvValue(value)}`);
  });

  const output = `${nextLines.filter((line, index, arr) => !(index === arr.length - 1 && line === '')).join(lineBreak)}${lineBreak}`;
  fs.writeFileSync(ENV_PATH, output, 'utf8');
}

function loadLocalSettings() {
  const envSettings = loadEnvSettings();
  if (envSettings) return envSettings;

  if (!fs.existsSync(LOCAL_SETTINGS_PATH)) {
    return { llm: { ...DEFAULT_LLM_SETTINGS } };
  }

  const raw = fs.readFileSync(LOCAL_SETTINGS_PATH, 'utf8');
  const parsed = JSON.parse(raw || '{}');

  return {
    llm: {
      ...DEFAULT_LLM_SETTINGS,
      ...(parsed.llm || {})
    }
  };
}

function saveLocalSettings(payload) {
  const current = loadLocalSettings();
  const next = {
    llm: {
      ...current.llm,
      ...(payload.llm || {})
    }
  };

  updateEnvFile({
    [LLM_ENV_KEYS.endpoint]: next.llm.endpoint || DEFAULT_LLM_SETTINGS.endpoint,
    [LLM_ENV_KEYS.apiKey]: next.llm.apiKey || '',
    [LLM_ENV_KEYS.model]: next.llm.model || '',
    [LLM_ENV_KEYS.temperature]: String(Number(next.llm.temperature ?? DEFAULT_LLM_SETTINGS.temperature)),
    [LLM_ENV_KEYS.prompt]: next.llm.prompt || DEFAULT_LLM_SETTINGS.prompt
  });
  return {
    ...next,
    envPath: toPosixPath(ENV_PATH)
  };
}

function getLlmSettingsPayload() {
  const settings = loadLocalSettings();
  return {
    envPath: toPosixPath(ENV_PATH),
    llm: {
      endpoint: settings.llm.endpoint || '',
      apiKey: settings.llm.apiKey || '',
      model: settings.llm.model || '',
      temperature: Number(settings.llm.temperature ?? DEFAULT_LLM_SETTINGS.temperature),
      prompt: settings.llm.prompt || DEFAULT_LLM_SETTINGS.prompt
    }
  };
}

function normalizeFolderPath(input = '') {
  const parts = String(input || '')
    .replace(/^\/+|\/+$/g, '')
    .split(/[\\/]+/)
    .map(part => part.trim())
    .filter(Boolean);

  parts.forEach(part => {
    if (part === '.' || part === '..') {
      throw new Error('目录名不能包含 . 或 ..');
    }
  });

  return parts.join('/');
}

function resolveImageFolder(folder = '') {
  const normalized = normalizeFolderPath(folder);
  const absolute = ensureInsideRoot(path.join(IMAGES_DIR, normalized));

  if (!absolute.startsWith(IMAGES_DIR)) {
    throw new Error('图片目录必须位于 source/images 下。');
  }

  return {
    normalized,
    absolute
  };
}

function listImageFoldersRecursive(currentDir, prefix = '') {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  const result = [];

  entries
    .filter(entry => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-Hans-CN'))
    .forEach(entry => {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      result.push(relative);
      result.push(...listImageFoldersRecursive(path.join(currentDir, entry.name), relative));
    });

  return result;
}

function listImageFolders() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  return [''].concat(listImageFoldersRecursive(IMAGES_DIR));
}

function createImageFolder(folder) {
  const { normalized, absolute } = resolveImageFolder(folder);
  if (!normalized) {
    throw new Error('请输入要创建的目录名。');
  }

  fs.mkdirSync(absolute, { recursive: true });
  return {
    folder: normalized,
    folders: listImageFolders()
  };
}

function sanitizeUploadFilename(filename = '') {
  const safe = path.basename(String(filename || ''))
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .trim();

  return safe || `upload-${Date.now()}.bin`;
}

function uploadImageFiles(folder, files) {
  const { normalized, absolute } = resolveImageFolder(folder);
  fs.mkdirSync(absolute, { recursive: true });

  const uploaded = (Array.isArray(files) ? files : []).map(file => {
    const filename = sanitizeUploadFilename(file.name);
    const targetPath = path.join(absolute, filename);
    const content = String(file.content || '');

    if (!content) {
      throw new Error(`文件 ${filename} 缺少内容。`);
    }

    fs.writeFileSync(targetPath, Buffer.from(content, 'base64'));

    const publicPath = normalized
      ? `/images/${normalized}/${filename}`
      : `/images/${filename}`;

    return {
      name: filename,
      path: publicPath
    };
  });

  return {
    folder: normalized,
    uploaded,
    folders: listImageFolders()
  };
}

function parseLlmResponseContent(payload) {
  const choice = payload && Array.isArray(payload.choices) ? payload.choices[0] : null;
  const content = choice && choice.message ? choice.message.content : '';

  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item.text === 'string') return item.text;
      return '';
    }).join('').trim();
  }

  return '';
}

async function formatChineseDraftWithLlm(payload) {
  const settings = getLlmSettingsPayload().llm;

  if (!settings.endpoint || !settings.apiKey || !settings.model) {
    throw new Error('请先在 LLM 配置里填写 endpoint、API Key 和 model。');
  }

  const body = String(payload.body || '').trim();
  if (!body) {
    throw new Error('中文正文为空，无法排版。');
  }

  const response = await fetch(settings.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: Number(settings.temperature ?? DEFAULT_LLM_SETTINGS.temperature),
      messages: [
        { role: 'system', content: settings.prompt || DEFAULT_LLM_SETTINGS.prompt },
        {
          role: 'user',
          content: [
            '请整理下面这篇中文博客草稿，只返回排版后的 Markdown 正文。',
            '',
            `标题：${String(payload.title || '').trim()}`,
            `一句话概括：${String(payload.description || '').trim()}`,
            '',
            '正文：',
            body
          ].join('\n')
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM 请求失败：${response.status} ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  const formatted = parseLlmResponseContent(data);

  if (!formatted) {
    throw new Error('LLM 没有返回可用内容。');
  }

  return {
    content: formatted
  };
}

function trimLog(content, maxLength = 30000) {
  const value = String(content || '');
  if (value.length <= maxLength) return value;
  return value.slice(value.length - maxLength);
}

function appendTaskLog(text) {
  commandState.currentTaskLog = trimLog(`${commandState.currentTaskLog}${text}`);
}

function appendServerLog(text) {
  commandState.serverStatus.log = trimLog(`${commandState.serverStatus.log}${text}`);
}

function serializeCommandState() {
  return {
    currentTask: commandState.currentTask,
    currentTaskLog: commandState.currentTaskLog,
    lastTask: commandState.lastTask,
    server: {
      running: commandState.serverStatus.running,
      startedAt: commandState.serverStatus.startedAt,
      pid: commandState.serverStatus.pid,
      url: commandState.serverStatus.url,
      log: commandState.serverStatus.log
    }
  };
}

function createTimestamp() {
  return new Date().toISOString();
}

function runShellTask(name) {
  const command = COMMAND_SCRIPTS[name];
  if (!command || name === 'serve') {
    throw new Error('不支持的命令。');
  }

  if (commandState.currentTask) {
    throw new Error(`已有命令正在运行：${commandState.currentTask.label}`);
  }

  commandState.currentTask = {
    name,
    label: command.label,
    startedAt: createTimestamp(),
    status: 'running'
  };
  commandState.currentTaskLog = `$ npm run ${command.script}\n`;

  const child = spawn('npm', ['run', command.script], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', chunk => appendTaskLog(chunk.toString('utf8')));
  child.stderr.on('data', chunk => appendTaskLog(chunk.toString('utf8')));
  child.on('error', error => {
    appendTaskLog(`\n[error] ${error.message}\n`);
  });
  child.on('close', code => {
    const finishedAt = createTimestamp();
    commandState.lastTask = {
      name,
      label: command.label,
      startedAt: commandState.currentTask ? commandState.currentTask.startedAt : finishedAt,
      finishedAt,
      status: code === 0 ? 'success' : 'failed',
      exitCode: code,
      log: commandState.currentTaskLog
    };
    commandState.currentTask = null;
    commandState.currentTaskLog = '';
  });
}

function startHexoServer() {
  if (commandState.serverProcess && commandState.serverStatus.running) {
    throw new Error('预览服务器已经在运行。');
  }

  commandState.serverStatus = {
    running: true,
    startedAt: createTimestamp(),
    pid: null,
    url: 'http://127.0.0.1:4000/',
    log: '$ npm run server\n'
  };

  const child = spawn('npm', ['run', 'server'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  commandState.serverProcess = child;
  commandState.serverStatus.pid = child.pid;

  child.stdout.on('data', chunk => appendServerLog(chunk.toString('utf8')));
  child.stderr.on('data', chunk => appendServerLog(chunk.toString('utf8')));
  child.on('error', error => {
    appendServerLog(`\n[error] ${error.message}\n`);
  });
  child.on('close', code => {
    appendServerLog(`\n[exit] server stopped with code ${code}\n`);
    commandState.serverProcess = null;
    commandState.serverStatus.running = false;
    commandState.serverStatus.pid = null;
  });
}

function stopHexoServer() {
  if (!commandState.serverProcess || !commandState.serverStatus.running) {
    throw new Error('预览服务器当前没有运行。');
  }

  appendServerLog('\n[signal] stopping server...\n');
  commandState.serverProcess.kill('SIGTERM');
}

function readPostPair(key, categoryOptions) {
  const zhPath = path.join(POSTS_DIR, `${key}.zh-CN.md`);
  const enPath = path.join(POSTS_DIR, `${key}.en.md`);
  const zhExists = fs.existsSync(zhPath);
  const enExists = fs.existsSync(enPath);

  if (!zhExists && !enExists) {
    throw new Error(`找不到文章：${key}`);
  }

  const zhFile = zhExists ? parseMarkdownFile(zhPath) : null;
  const enFile = enExists ? parseMarkdownFile(enPath) : null;
  const zhData = zhFile ? zhFile.data : {};
  const enData = enFile ? enFile.data : {};
  const zhCategory = Array.isArray(zhData.categories) ? zhData.categories[0] : '';
  const enCategory = Array.isArray(enData.categories) ? enData.categories[0] : '';
  const matchedCategory = findCategoryOptionByNames(categoryOptions, zhCategory, enCategory);

  return {
    kind: 'post',
    key,
    status: zhExists && enExists ? '双语完整' : '待补语言',
    sourceFiles: {
      zh: zhExists ? toPosixPath(zhPath) : '',
      en: enExists ? toPosixPath(enPath) : ''
    },
    common: {
      date: toDateTimeLocalValue(zhData.date || enData.date || ''),
      slug: String(zhData.slug || enData.slug || deriveSlugFromKey(key)),
      toc: Boolean(zhData.toc || enData.toc),
      photos: (zhData.photos || enData.photos || []).join('\n'),
      categoryId: matchedCategory ? matchedCategory.id : '',
      categoryCustomZh: matchedCategory ? '' : String(zhCategory || ''),
      categoryCustomEn: matchedCategory ? '' : String(enCategory || '')
    },
    zh: {
      title: String(zhData.title || ''),
      description: String(zhData.description || ''),
      tags: normalizeStringList(zhData.tags).join(', '),
      permalink: String(zhData.permalink || ''),
      body: zhFile ? zhFile.body : '',
      extras: omitReservedFields(zhData, RESERVED_POST_FIELDS)
    },
    en: {
      title: String(enData.title || ''),
      description: String(enData.description || ''),
      tags: normalizeStringList(enData.tags).join(', '),
      permalink: String(enData.permalink || ''),
      body: enFile ? enFile.body : '',
      extras: omitReservedFields(enData, RESERVED_POST_FIELDS)
    }
  };
}

function listPostPairs(categoryOptions) {
  const grouped = new Map();
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));

  files.forEach(filename => {
    const split = splitPostKey(filename);
    if (!split) return;
    if (!grouped.has(split.key)) grouped.set(split.key, new Set());
    grouped.get(split.key).add(split.lang);
  });

  return Array.from(grouped.keys())
    .map(key => {
      const item = readPostPair(key, categoryOptions);
      return {
        key,
        titleZh: item.zh.title,
        titleEn: item.en.title,
        date: item.common.date,
        status: item.status,
        categoryId: item.common.categoryId || '',
        categoryZh: item.common.categoryId
          ? ((categoryOptions.find(option => option.id === item.common.categoryId) || {}).zh || '')
          : (item.common.categoryCustomZh || ''),
        categoryEn: item.common.categoryId
          ? ((categoryOptions.find(option => option.id === item.common.categoryId) || {}).en || '')
          : (item.common.categoryCustomEn || ''),
        sourceFiles: item.sourceFiles
      };
    })
    .sort((left, right) => String(right.date || '').localeCompare(String(left.date || '')));
}

function listPages() {
  return PAGE_DEFINITIONS.map(page => ({
    id: page.id,
    label: page.label,
    file: toPosixPath(page.file)
  }));
}

function readPageById(id) {
  const page = PAGE_DEFINITIONS.find(item => item.id === id);
  if (!page) throw new Error(`找不到页面：${id}`);

  const parsed = parseMarkdownFile(page.file);
  const data = parsed.data;

  return {
    kind: 'page',
    id: page.id,
    label: page.label,
    file: toPosixPath(page.file),
    isGalleryPage: GALLERY_PAGE_IDS.has(page.id),
    title: String(data.title || ''),
    date: toDateTimeLocalValue(data.date || ''),
    lang: String(data.lang || ''),
    comments: Boolean(data.comments),
    toc: Boolean(data.toc),
    extraYaml: serializeExtraYaml(omitReservedFields(data, RESERVED_PAGE_FIELDS)),
    body: parsed.body
  };
}

function writePostFiles(payload, categoryOptions) {
  const sourceKey = String(payload.key || '').trim();
  const slug = String(payload.common && payload.common.slug || '').trim();
  const saveTime = new Date();
  const normalizedDate = formatDate(saveTime);

  if (!slug) throw new Error('Slug 不能为空。');
  if (!normalizedDate) throw new Error('保存时间格式不合法。');

  const key = sourceKey || `${normalizedDate.slice(0, 10)}-${slugifyFileSegment(slug)}`;
  const zhPath = ensureInsideRoot(path.join(POSTS_DIR, `${key}.zh-CN.md`));
  const enPath = ensureInsideRoot(path.join(POSTS_DIR, `${key}.en.md`));

  const categoryId = String(payload.common.categoryId || '').trim();
  const matchedCategory = categoryOptions.find(option => option.id === categoryId);
  const categoryZh = matchedCategory ? matchedCategory.zh : String(payload.common.categoryCustomZh || '').trim();
  const categoryEn = matchedCategory ? matchedCategory.en : String(payload.common.categoryCustomEn || '').trim();

  if (!categoryZh || !categoryEn) {
    throw new Error('分类不能为空；请选择预设分类或补齐中英文分类。');
  }

  const photos = normalizePhotoList(payload.common.photos);
  const toc = Boolean(payload.common.toc);
  const zhExtras = payload.zh && typeof payload.zh.extras === 'object' ? payload.zh.extras : {};
  const enExtras = payload.en && typeof payload.en.extras === 'object' ? payload.en.extras : {};

  const zhFrontMatter = {
    title: String(payload.zh.title || '').trim(),
    date: normalizedDate,
    lang: 'zh-CN',
    slug,
    permalink: derivePermalink('zh-CN', normalizedDate, slug, String(payload.zh.permalink || '').trim()),
    description: String(payload.zh.description || '').trim(),
    photos,
    tags: normalizeStringList(payload.zh.tags),
    categories: [categoryZh],
    toc,
    ...zhExtras
  };

  const enFrontMatter = {
    title: String(payload.en.title || '').trim(),
    date: normalizedDate,
    lang: 'en',
    slug,
    permalink: derivePermalink('en', normalizedDate, slug, String(payload.en.permalink || '').trim()),
    description: String(payload.en.description || '').trim(),
    photos,
    tags: normalizeStringList(payload.en.tags),
    categories: [categoryEn],
    toc,
    ...enExtras
  };

  if (!zhFrontMatter.title) throw new Error('中文标题不能为空。');
  if (!enFrontMatter.title) throw new Error('英文标题不能为空。');

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(zhPath, buildFrontMatterString(zhFrontMatter, payload.zh.body), 'utf8');
  fs.writeFileSync(enPath, buildFrontMatterString(enFrontMatter, payload.en.body), 'utf8');

  return readPostPair(key, categoryOptions);
}

function parseYamlObject(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) return {};
  const parsed = yaml.load(trimmed);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('高级 front matter 必须是 YAML 对象。');
  }
  return parsed;
}

function serializeExtraYaml(data) {
  const value = yaml.dump(data || {}, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"'
  }).trim();

  return value === '{}' ? '' : value;
}

function writePageFile(id, payload) {
  const page = PAGE_DEFINITIONS.find(item => item.id === id);
  if (!page) throw new Error(`找不到页面：${id}`);
  const normalizedDate = formatDate(new Date());

  const frontMatterData = {
    title: String(payload.title || '').trim(),
    date: normalizedDate,
    lang: String(payload.lang || '').trim(),
    comments: Boolean(payload.comments),
    toc: Boolean(payload.toc),
    ...parseYamlObject(payload.extraYaml)
  };

  if (!frontMatterData.title) throw new Error('页面标题不能为空。');
  if (!frontMatterData.date) throw new Error('页面日期不能为空。');

  fs.writeFileSync(page.file, buildFrontMatterString(frontMatterData, payload.body), 'utf8');
  return readPageById(id);
}

function serveStaticAsset(res, pathname) {
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = ensureInsideRoot(path.join(STATIC_DIR, relativePath));

  if (!filePath.startsWith(STATIC_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    textResponse(res, 404, 'text/plain', 'Not found');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = ext === '.css'
    ? 'text/css'
    : ext === '.js'
      ? 'application/javascript'
      : 'text/html';

  textResponse(res, 200, contentType, fs.readFileSync(filePath, 'utf8'));
}

function serveProjectImage(res, pathname) {
  const relativePath = pathname.replace(/^\/images\//, '');
  const filePath = ensureInsideRoot(path.join(IMAGES_DIR, relativePath));

  if (!filePath.startsWith(IMAGES_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    textResponse(res, 404, 'text/plain', 'Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = ({
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif'
  })[ext] || 'application/octet-stream';

  binaryResponse(res, 200, contentType, fs.readFileSync(filePath));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    req.on('data', chunk => {
      buffer += chunk;
      if (buffer.length > 60 * 1024 * 1024) {
        reject(new Error('请求体过大。'));
      }
    });
    req.on('end', () => resolve(buffer));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const pathname = requestUrl.pathname;
    const categoryOptions = loadCategoryOptions();

    if (req.method === 'GET' && pathname === '/api/meta') {
      jsonResponse(res, 200, {
        categories: categoryOptions,
        pages: listPages()
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/settings') {
      jsonResponse(res, 200, getLlmSettingsPayload());
      return;
    }

    if (req.method === 'POST' && pathname === '/api/settings') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, saveLocalSettings(payload));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/categories') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, addCategoryOption(payload));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/images/folders') {
      jsonResponse(res, 200, {
        folders: listImageFolders()
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/folders') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, createImageFolder(payload.folder));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/upload') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, uploadImageFiles(payload.folder, payload.files));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/format/zh') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, await formatChineseDraftWithLlm(payload));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/commands') {
      jsonResponse(res, 200, serializeCommandState());
      return;
    }

    if (req.method === 'GET' && pathname === '/api/posts') {
      jsonResponse(res, 200, {
        items: listPostPairs(categoryOptions)
      });
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/api/posts/')) {
      const key = decodeURIComponent(pathname.replace('/api/posts/', ''));
      jsonResponse(res, 200, readPostPair(key, categoryOptions));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/posts') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, writePostFiles(payload, categoryOptions));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/gallery') {
      jsonResponse(res, 200, {
        items: listGalleryAlbums()
      });
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/api/gallery/')) {
      const slug = decodeURIComponent(pathname.replace('/api/gallery/', ''));
      jsonResponse(res, 200, readGalleryAlbumBySlug(slug));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/gallery') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, writeGalleryAlbum(payload));
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/commands/')) {
      const name = decodeURIComponent(pathname.replace('/api/commands/', ''));

      if (name === 'serve') {
        startHexoServer();
        jsonResponse(res, 200, serializeCommandState());
        return;
      }

      if (name === 'stop-serve') {
        stopHexoServer();
        jsonResponse(res, 200, serializeCommandState());
        return;
      }

      runShellTask(name);
      jsonResponse(res, 200, serializeCommandState());
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/api/pages/')) {
      const id = decodeURIComponent(pathname.replace('/api/pages/', ''));
      jsonResponse(res, 200, readPageById(id));
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/pages/')) {
      const id = decodeURIComponent(pathname.replace('/api/pages/', ''));
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, writePageFile(id, payload));
      return;
    }

    if (req.method === 'GET') {
      if (pathname.startsWith('/images/')) {
        serveProjectImage(res, pathname);
        return;
      }
      serveStaticAsset(res, pathname);
      return;
    }

    textResponse(res, 405, 'text/plain', 'Method not allowed');
  } catch (error) {
    jsonResponse(res, 500, {
      error: error.message || '未知错误'
    });
  }
});

function cleanupChildren() {
  if (commandState.serverProcess) {
    commandState.serverProcess.kill('SIGTERM');
  }
}

if (require.main === module) {
  process.on('SIGINT', () => {
    cleanupChildren();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanupChildren();
    process.exit(0);
  });

  server.listen(PORT, HOST, () => {
    console.log(`Local CMS running at http://${HOST}:${PORT}`);
  });
}

module.exports = {
  listGalleryAlbums,
  readGalleryAlbumBySlug,
  writeGalleryAlbum,
  syncGalleryDataFile
};
