#!/usr/bin/env node

'use strict';

const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { spawn } = require('child_process');
const yaml = require('js-yaml');
const {
  isImageFileName,
  sanitizeImageFilename,
  getUniqueFilename
} = require('./image-filenames');

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
const AUDIT_LOG_PATH = path.join(ROOT, '.local-cms-audit.log');
const WRITING_STYLE_GUIDE_PATH = path.join(ROOT, 'docs', 'writing-style-guide.md');
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
  prompt: 'LOCAL_CMS_LLM_PROMPT',
  translationPrompt: 'LOCAL_CMS_TRANSLATION_PROMPT'
};
const CMS_SESSION_TTL_MS = 30000;
const CMS_SHUTDOWN_GRACE_MS = 5000;

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
  'updated',
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
  ].join('\n'),
  translationPrompt: [
    '你是一个严谨的中译英博客编辑助手。',
    '请把用户提供的中文博客稿翻译成自然、准确、可发布的英文博客稿。',
    '需要同时输出英文标题、英文一句话概括、英文标签数组和英文 Markdown 正文。',
    '保留原文事实、链接、图片地址、代码块、项目名和专有名词，不要捏造信息。',
    '输出必须是 JSON 对象，结构为 {"title":"","description":"","tags":[""],"body":""}。',
    '不要输出 JSON 以外的任何解释文字。'
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
const cmsSessions = new Map();
let cmsShutdownTimer = null;
let hasSeenCmsSession = false;

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
  const parsed = parseDelimitedFrontMatter(raw, filePath);
  return {
    data: parsed.data || {},
    body: parsed.body || ''
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

function getCategoryMapRange(configText) {
  const lines = configText.split(/\r?\n/);
  const startIndex = lines.findIndex(line => /^category_map:\s*$/.test(line));

  if (startIndex === -1) {
    throw new Error('找不到 _config.yml 里的 category_map 配置。');
  }

  let endIndex = startIndex + 1;
  while (endIndex < lines.length) {
    const line = lines[endIndex];
    if (!line.trim() || /^\s/.test(line) || /^#/.test(line)) {
      endIndex += 1;
      continue;
    }
    break;
  }

  return {
    startIndex,
    endIndex,
    lines,
    lineBreak: configText.includes('\r\n') ? '\r\n' : '\n'
  };
}

function rewriteCategoryMap(configText, categories) {
  const { startIndex, endIndex, lines, lineBreak } = getCategoryMapRange(configText);
  const nextLines = [
    'category_map:',
    ...categories.map(item => `  ${formatYamlInlineString(item.zh)}: ${formatYamlInlineString(item.en)}`)
  ];

  lines.splice(startIndex, endIndex - startIndex, ...nextLines);
  return lines.join(lineBreak);
}

function normalizeCategoryPayload(payload) {
  const zh = String(payload && payload.zh || '').trim();
  const en = String(payload && payload.en || '').trim();

  if (!zh || !en) {
    throw new Error('分类的中英文名称都不能为空。');
  }

  return {
    zh,
    en,
    id: slugifyFileSegment(en || zh)
  };
}

function rewriteSinglePostCategory(filePath, fromCategory, toCategory) {
  if (!fs.existsSync(filePath)) return false;

  const parsed = parseMarkdownFile(filePath);
  const categories = Array.isArray(parsed.data.categories) ? parsed.data.categories.slice() : [];
  if (!categories.length || categories[0] !== fromCategory) {
    return false;
  }

  categories[0] = toCategory;
  const nextData = {
    ...omitReservedFields(parsed.data, new Set()),
    ...parsed.data,
    categories
  };

  delete nextData._content;
  fs.writeFileSync(filePath, buildFrontMatterString(nextData, parsed.body), 'utf8');
  return true;
}

function renameCategoryInPosts(fromCategoryZh, fromCategoryEn, toCategoryZh, toCategoryEn) {
  if (!fs.existsSync(POSTS_DIR)) return;

  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
  files.forEach(filename => {
    const split = splitPostKey(filename);
    if (!split) return;

    const filePath = path.join(POSTS_DIR, filename);
    if (split.lang === 'zh-CN') {
      rewriteSinglePostCategory(filePath, fromCategoryZh, toCategoryZh);
      return;
    }

    if (split.lang === 'en') {
      rewriteSinglePostCategory(filePath, fromCategoryEn, toCategoryEn);
    }
  });
}

function findPostsUsingCategory(categoryZh, categoryEn) {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const keys = new Set();
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));

  files.forEach(filename => {
    const split = splitPostKey(filename);
    if (!split) return;

    const parsed = parseMarkdownFile(path.join(POSTS_DIR, filename));
    const categories = Array.isArray(parsed.data.categories) ? parsed.data.categories : [];
    const firstCategory = String(categories[0] || '');

    if (
      (split.lang === 'zh-CN' && firstCategory === categoryZh) ||
      (split.lang === 'en' && firstCategory === categoryEn)
    ) {
      keys.add(split.key);
    }
  });

  return Array.from(keys).sort();
}

function addCategoryOption(payload) {
  const { zh, en, id: newId } = normalizeCategoryPayload(payload);
  const existingOptions = loadCategoryOptions();
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

function updateCategoryOption(id, payload) {
  const normalizedId = String(id || '').trim();
  const existingOptions = loadCategoryOptions();
  const target = existingOptions.find(option => option.id === normalizedId);

  if (!target) {
    throw new Error(`找不到预设分类：${normalizedId}`);
  }

  const next = normalizeCategoryPayload(payload);
  const duplicate = existingOptions.find(option => {
    if (option.id === normalizedId) return false;
    return option.zh === next.zh || option.en === next.en || option.id === next.id;
  });

  if (duplicate) {
    throw new Error('新的分类名称与现有预设冲突，请调整后再保存。');
  }

  const nextCategories = existingOptions.map(option => (
    option.id === normalizedId ? { id: next.id, zh: next.zh, en: next.en } : option
  ));

  const configText = fs.readFileSync(CONFIG_PATH, 'utf8');
  fs.writeFileSync(CONFIG_PATH, rewriteCategoryMap(configText, nextCategories), 'utf8');
  renameCategoryInPosts(target.zh, target.en, next.zh, next.en);

  return {
    category: { id: next.id, zh: next.zh, en: next.en },
    categories: loadCategoryOptions()
  };
}

function deleteCategoryOption(id) {
  const normalizedId = String(id || '').trim();
  const existingOptions = loadCategoryOptions();
  const target = existingOptions.find(option => option.id === normalizedId);

  if (!target) {
    throw new Error(`找不到预设分类：${normalizedId}`);
  }

  const usedBy = findPostsUsingCategory(target.zh, target.en);
  if (usedBy.length) {
    throw new Error(`这个预设分类仍被文章使用，无法删除：${usedBy.slice(0, 5).join('、')}${usedBy.length > 5 ? ' 等' : ''}`);
  }

  const nextCategories = existingOptions.filter(option => option.id !== normalizedId);
  const configText = fs.readFileSync(CONFIG_PATH, 'utf8');
  fs.writeFileSync(CONFIG_PATH, rewriteCategoryMap(configText, nextCategories), 'utf8');

  return {
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

function normalizePostKeyInput(value) {
  const raw = path.basename(String(value || '').trim())
    .replace(/\.zh-CN\.md$/i, '')
    .replace(/\.en\.md$/i, '')
    .replace(/\.md$/i, '')
    .trim();

  if (!raw) return '';
  if (/[<>:"/\\|?*\u0000-\u001f]/.test(raw)) {
    throw new Error('源文件名不能包含路径分隔符或非法字符。');
  }

  return raw.replace(/\s+/g, '-');
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

function parseDelimitedFrontMatter(raw, filePath = 'document') {
  const text = String(raw || '');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      data: {},
      body: text
    };
  }

  try {
    return {
      data: yaml.load(match[1]) || {},
      body: match[2] || ''
    };
  } catch (error) {
    throw new Error(`${filePath} front matter parse failed: ${error.message}`);
  }
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

function normalizeGalleryCategoryKey(value) {
  const raw = Array.isArray(value)
    ? value
    : String(value || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

  const first = raw.find(Boolean);
  return first ? normalizeGallerySlug(first) : '';
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

function getGalleryPhotoFolderFromSrc(src = '') {
  const normalized = String(src || '').trim();
  if (!normalized.startsWith('/images/')) return '';
  const relativePath = normalized.replace(/^\/images\//, '');
  const segments = relativePath.split('/').filter(Boolean);
  segments.pop();
  return segments.join('/');
}

function inferGalleryImageFolder(photos = []) {
  const folders = Array.from(new Set(
    (Array.isArray(photos) ? photos : [])
      .map(photo => getGalleryPhotoFolderFromSrc(photo && photo.src))
      .filter(Boolean)
  ));
  return folders.length === 1 ? folders[0] : '';
}

function isGalleryManagedFolder(folder = '') {
  return String(folder || '').trim().startsWith('gallery/');
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

function loadGalleryFilterOptions() {
  if (!fs.existsSync(GALLERY_DATA_PATH)) {
    return [];
  }

  const existing = yaml.load(fs.readFileSync(GALLERY_DATA_PATH, 'utf8')) || {};
  const filters = Array.isArray(existing.filters) ? existing.filters : [];

  return filters
    .map(filter => {
      const key = normalizeGallerySlug(filter && filter.key);
      const label = filter && typeof filter.label === 'object' ? filter.label : {};
      const zh = String(label['zh-CN'] || '').trim();
      const en = String(label.en || '').trim();
      if (!key || !zh || !en) return null;

      return {
        key,
        label: {
          'zh-CN': zh,
          en
        }
      };
    })
    .filter(Boolean);
}

function buildGalleryAlbumRecord(filePath) {
  const parsed = parseDelimitedFrontMatter(fs.readFileSync(filePath, 'utf8'), filePath);
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
    imageFolder: normalizeFolderPath(data.image_folder || inferGalleryImageFolder(photos)),
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
    category: normalizeGalleryCategoryKey(data.category || data.categories || data.category_keys),
    categories: (() => {
      const category = normalizeGalleryCategoryKey(data.category || data.categories || data.category_keys);
      return category ? [category] : [];
    })(),
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
    imageFolder: album.imageFolder,
    titleZh: album.title['zh-CN'],
    titleEn: album.title.en,
    periodZh: album.period['zh-CN'],
    periodEn: album.period.en,
    locationZh: album.location['zh-CN'],
    locationEn: album.location.en,
    category: album.category,
    categories: album.categories,
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
  const category = normalizeGalleryCategoryKey(record.category || record.categories);
  const frontMatterData = {
    slug: record.slug,
    image_folder: normalizeFolderPath(record.imageFolder || inferGalleryImageFolder(record.photos)),
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
    category,
    tags_zh: record.tags['zh-CN'].join(','),
    tags_en: record.tags.en.join(',')
  };

  return buildFrontMatterString(frontMatterData, buildGalleryMarkdownTable(record.photos));
}

function syncGalleryDataFile() {
  const filters = loadGalleryFilterOptions();
  const albums = listGalleryAlbumsDetailed().map(album => ({
    slug: album.slug,
    imageFolder: album.imageFolder,
    languages: album.languages,
    title: album.title,
    period: album.period,
    location: album.location,
    camera: album.camera,
    description: album.description,
    category: album.category,
    categories: album.categories,
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
    filters,
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
    imageFolder: normalizeFolderPath(payload && payload.imageFolder || ''),
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
    category: normalizeGalleryCategoryKey((payload && Object.prototype.hasOwnProperty.call(payload, 'category'))
      ? payload.category
      : (payload && payload.categories)),
    categories: (() => {
      const category = normalizeGalleryCategoryKey((payload && Object.prototype.hasOwnProperty.call(payload, 'category'))
        ? payload.category
        : (payload && payload.categories));
      return category ? [category] : [];
    })(),
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

  const uniqueFolders = Array.from(new Set(record.photos.map(photo => getGalleryPhotoFolderFromSrc(photo.src)).filter(Boolean)));
  if (uniqueFolders.length !== 1) {
    throw new Error('画廊相册的所有图片必须位于同一个 images 子目录。');
  }

  if (!record.imageFolder) {
    record.imageFolder = uniqueFolders[0];
  }

  if (!isGalleryManagedFolder(record.imageFolder) || !isGalleryManagedFolder(uniqueFolders[0])) {
    throw new Error('画廊相册只能引用 images/gallery/... 目录下的图片，请先把图片迁移到专用 gallery 目录。');
  }

  if (record.imageFolder !== uniqueFolders[0]) {
    throw new Error(`相册目录与图片实际目录不一致：images/${record.imageFolder} / images/${uniqueFolders[0]}`);
  }

  fs.mkdirSync(GALLERY_DOC_DIR, { recursive: true });
  fs.writeFileSync(targetPath, serializeGalleryAlbum(record), 'utf8');

  if (sourcePath && sourcePath !== targetPath && fs.existsSync(sourcePath)) {
    fs.unlinkSync(sourcePath);
  }

  syncGalleryDataFile();
  return readGalleryAlbumBySlug(slug);
}

function normalizeGalleryFilterPayload(payload) {
  const key = normalizeGallerySlug(payload && payload.key);
  const zh = String(payload && payload.label && payload.label['zh-CN'] || '').trim();
  const en = String(payload && payload.label && payload.label.en || '').trim();

  if (!key || !zh || !en) {
    throw new Error('画廊分类需要完整的 key、中文名和英文名。');
  }

  return {
    key,
    label: {
      'zh-CN': zh,
      en
    }
  };
}

function addGalleryFilterOption(payload) {
  const next = normalizeGalleryFilterPayload(payload);
  const existing = loadGalleryFilterOptions();

  if (existing.some(item => item.key === next.key)) {
    throw new Error(`画廊分类已存在：${next.key}`);
  }

  const output = yaml.dump({
    empty: loadGalleryEmptyState(),
    filters: existing.concat(next),
    albums: listGalleryAlbumsDetailed().map(album => ({
      slug: album.slug,
      imageFolder: album.imageFolder,
      languages: album.languages,
      title: album.title,
      period: album.period,
      location: album.location,
      camera: album.camera,
      description: album.description,
      categories: album.categories,
      tags: album.tags,
      photos: album.photos.map(photo => {
        const item = {
          src: photo.src,
          title: photo.title,
          caption: photo.caption
        };
        if (photo.meta) item.meta = photo.meta;
        return item;
      })
    }))
  }, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });

  fs.writeFileSync(GALLERY_DATA_PATH, output, 'utf8');
  return {
    filter: next,
    filters: loadGalleryFilterOptions()
  };
}

function updateGalleryFilterOption(key, payload) {
  const currentKey = normalizeGallerySlug(key);
  const existing = loadGalleryFilterOptions();
  const target = existing.find(item => item.key === currentKey);

  if (!target) {
    throw new Error(`找不到画廊分类：${currentKey}`);
  }

  const next = normalizeGalleryFilterPayload(payload);
  if (next.key !== currentKey && existing.some(item => item.key === next.key)) {
    throw new Error(`画廊分类已存在：${next.key}`);
  }

  const albums = listGalleryAlbumsDetailed().map(album => ({
    ...album,
    category: album.category === currentKey ? next.key : album.category,
    categories: album.category === currentKey
      ? [next.key]
      : (album.category ? [album.category] : [])
  }));

  const output = yaml.dump({
    empty: loadGalleryEmptyState(),
    filters: existing.map(item => item.key === currentKey ? next : item),
    albums: albums.map(album => ({
      slug: album.slug,
      imageFolder: album.imageFolder,
      languages: album.languages,
      title: album.title,
      period: album.period,
      location: album.location,
      camera: album.camera,
      description: album.description,
      category: album.category,
      categories: album.categories,
      tags: album.tags,
      photos: album.photos.map(photo => {
        const item = {
          src: photo.src,
          title: photo.title,
          caption: photo.caption
        };
        if (photo.meta) item.meta = photo.meta;
        return item;
      })
    }))
  }, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });

  fs.writeFileSync(GALLERY_DATA_PATH, output, 'utf8');

  albums.forEach(album => {
    fs.writeFileSync(galleryDocPathFromSlug(album.slug), serializeGalleryAlbum(album), 'utf8');
  });

  return {
    filter: next,
    filters: loadGalleryFilterOptions()
  };
}

function deleteGalleryFilterOption(key) {
  const currentKey = normalizeGallerySlug(key);
  const existing = loadGalleryFilterOptions();
  const target = existing.find(item => item.key === currentKey);

  if (!target) {
    throw new Error(`找不到画廊分类：${currentKey}`);
  }

  const albums = listGalleryAlbumsDetailed().map(album => ({
    ...album,
    category: album.category === currentKey ? '' : album.category,
    categories: album.category === currentKey
      ? []
      : (album.category ? [album.category] : [])
  }));

  const output = yaml.dump({
    empty: loadGalleryEmptyState(),
    filters: existing.filter(item => item.key !== currentKey),
    albums: albums.map(album => ({
      slug: album.slug,
      imageFolder: album.imageFolder,
      languages: album.languages,
      title: album.title,
      period: album.period,
      location: album.location,
      camera: album.camera,
      description: album.description,
      category: album.category,
      categories: album.categories,
      tags: album.tags,
      photos: album.photos.map(photo => {
        const item = {
          src: photo.src,
          title: photo.title,
          caption: photo.caption
        };
        if (photo.meta) item.meta = photo.meta;
        return item;
      })
    }))
  }, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });

  fs.writeFileSync(GALLERY_DATA_PATH, output, 'utf8');

  albums.forEach(album => {
    fs.writeFileSync(galleryDocPathFromSlug(album.slug), serializeGalleryAlbum(album), 'utf8');
  });

  return {
    filters: loadGalleryFilterOptions()
  };
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
      prompt: env[LLM_ENV_KEYS.prompt] || DEFAULT_LLM_SETTINGS.prompt,
      translationPrompt: env[LLM_ENV_KEYS.translationPrompt] || DEFAULT_LLM_SETTINGS.translationPrompt
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
    [LLM_ENV_KEYS.prompt]: next.llm.prompt || DEFAULT_LLM_SETTINGS.prompt,
    [LLM_ENV_KEYS.translationPrompt]: next.llm.translationPrompt || DEFAULT_LLM_SETTINGS.translationPrompt
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
      prompt: settings.llm.prompt || DEFAULT_LLM_SETTINGS.prompt,
      translationPrompt: settings.llm.translationPrompt || DEFAULT_LLM_SETTINGS.translationPrompt
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

function formatFileSize(size) {
  const value = Number(size || 0);
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${value} B`;
}

function parseImageDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length < 24) return null;

    if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
      };
    }

    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xFF) {
          offset += 1;
          continue;
        }
        const marker = buffer[offset + 1];
        if (marker === 0xD9 || marker === 0xDA) break;
        const blockLength = buffer.readUInt16BE(offset + 2);
        if (blockLength < 2 || offset + 2 + blockLength > buffer.length) break;
        if (
          (marker >= 0xC0 && marker <= 0xC3) ||
          (marker >= 0xC5 && marker <= 0xC7) ||
          (marker >= 0xC9 && marker <= 0xCB) ||
          (marker >= 0xCD && marker <= 0xCF)
        ) {
          return {
            height: buffer.readUInt16BE(offset + 5),
            width: buffer.readUInt16BE(offset + 7)
          };
        }
        offset += 2 + blockLength;
      }
    }
  } catch (error) {
    return null;
  }

  return null;
}

function parseExifFromJpeg(filePath) {
  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (error) {
    return null;
  }

  if (buffer.length < 8 || buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    return null;
  }

  let offset = 2;
  while (offset + 10 < buffer.length) {
    if (buffer[offset] !== 0xFF) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xD9 || marker === 0xDA) break;
    const blockLength = buffer.readUInt16BE(offset + 2);
    if (blockLength < 2 || offset + 2 + blockLength > buffer.length) break;

    if (marker === 0xE1 && buffer.toString('ascii', offset + 4, offset + 10) === 'Exif\u0000\u0000') {
      return parseExifTiffBuffer(buffer.slice(offset + 10, offset + 2 + blockLength));
    }

    offset += 2 + blockLength;
  }

  return null;
}

function parseExifTiffBuffer(buffer) {
  if (!buffer || buffer.length < 8) return null;

  const littleEndian = buffer.toString('ascii', 0, 2) === 'II';
  const readUInt16 = offset => littleEndian ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset);
  const readUInt32 = offset => littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);

  function readValue(type, count, rawOffset) {
    const typeSizes = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 };
    const unitSize = typeSizes[type];
    if (!unitSize) return null;
    const byteLength = unitSize * count;
    const valueOffset = byteLength <= 4 ? rawOffset : readUInt32(rawOffset);
    if (valueOffset < 0 || valueOffset + byteLength > buffer.length) return null;

    if (type === 2) {
      return buffer.slice(valueOffset, valueOffset + byteLength).toString('utf8').replace(/\u0000+$/g, '').trim();
    }

    if (type === 3) {
      if (count === 1) return littleEndian ? buffer.readUInt16LE(valueOffset) : buffer.readUInt16BE(valueOffset);
      return Array.from({ length: count }, (_, index) => littleEndian
        ? buffer.readUInt16LE(valueOffset + index * 2)
        : buffer.readUInt16BE(valueOffset + index * 2));
    }

    if (type === 4) {
      if (count === 1) return readUInt32(valueOffset);
      return Array.from({ length: count }, (_, index) => readUInt32(valueOffset + index * 4));
    }

    if (type === 5) {
      const numerator = readUInt32(valueOffset);
      const denominator = readUInt32(valueOffset + 4);
      if (!denominator) return null;
      return numerator / denominator;
    }

    return null;
  }

  function readIfd(offset) {
    if (!offset || offset + 2 > buffer.length) return {};
    const count = readUInt16(offset);
    const result = {};
    for (let index = 0; index < count; index += 1) {
      const entryOffset = offset + 2 + index * 12;
      if (entryOffset + 12 > buffer.length) break;
      const tag = readUInt16(entryOffset);
      const type = readUInt16(entryOffset + 2);
      const valueCount = readUInt32(entryOffset + 4);
      result[tag] = readValue(type, valueCount, entryOffset + 8);
    }
    return result;
  }

  const firstIfdOffset = readUInt32(4);
  const ifd0 = readIfd(firstIfdOffset);
  const exifIfd = ifd0[0x8769] ? readIfd(ifd0[0x8769]) : {};
  const dateTimeOriginal = String(exifIfd[0x9003] || '').trim();
  const dateTimeDigitized = String(exifIfd[0x9004] || '').trim();
  const dateTime = String(ifd0[0x0132] || '').trim();

  return {
    make: String(ifd0[0x010F] || '').trim(),
    model: String(ifd0[0x0110] || '').trim(),
    dateTimeOriginal: dateTimeOriginal || '',
    dateTimeDigitized: dateTimeDigitized || '',
    dateTime: dateTime || '',
    exposureTime: exifIfd[0x829A] || null,
    fNumber: exifIfd[0x829D] || null,
    iso: exifIfd[0x8827] || null,
    focalLength: exifIfd[0x920A] || null,
    focalLength35mm: exifIfd[0xA405] || null,
    pixelWidth: exifIfd[0xA002] || null,
    pixelHeight: exifIfd[0xA003] || null
  };
}

function trimDecimal(value, digits = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '';
  const fixed = numeric.toFixed(digits);
  return fixed.replace(/\.0+$/g, '').replace(/(\.\d*[1-9])0+$/g, '$1');
}

function formatExposureTime(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  if (numeric >= 1) return `${trimDecimal(numeric, 1)}s`;
  const denominator = Math.round(1 / numeric);
  return denominator > 0 ? `1/${denominator}s` : '';
}

function pruneCmsSessions() {
  const now = Date.now();
  for (const [sessionId, expiresAt] of cmsSessions.entries()) {
    if (expiresAt <= now) {
      cmsSessions.delete(sessionId);
    }
  }
}

function scheduleCmsAutoShutdown() {
  if (cmsShutdownTimer) {
    clearTimeout(cmsShutdownTimer);
    cmsShutdownTimer = null;
  }

  if (!hasSeenCmsSession) return;
  pruneCmsSessions();
  if (cmsSessions.size > 0) return;

  cmsShutdownTimer = setTimeout(() => {
    pruneCmsSessions();
    if (cmsSessions.size > 0) return;
    cleanupChildren();
    server.close(() => process.exit(0));
  }, CMS_SHUTDOWN_GRACE_MS);
}

function markCmsSessionAlive(sessionId) {
  const normalized = String(sessionId || '').trim();
  if (!normalized) {
    throw new Error('会话标识不能为空。');
  }

  cmsSessions.set(normalized, Date.now() + CMS_SESSION_TTL_MS);
  hasSeenCmsSession = true;
  if (cmsShutdownTimer) {
    clearTimeout(cmsShutdownTimer);
    cmsShutdownTimer = null;
  }

  return {
    sessionId: normalized,
    expiresInMs: CMS_SESSION_TTL_MS
  };
}

function closeCmsSession(sessionId) {
  const normalized = String(sessionId || '').trim();
  if (!normalized) {
    throw new Error('会话标识不能为空。');
  }

  cmsSessions.delete(normalized);
  scheduleCmsAutoShutdown();
  return {
    sessionId: normalized,
    remainingSessions: cmsSessions.size
  };
}

const cmsSessionWatchdog = setInterval(() => {
  pruneCmsSessions();
  if (cmsSessions.size === 0) {
    scheduleCmsAutoShutdown();
  }
}, 5000);

if (typeof cmsSessionWatchdog.unref === 'function') {
  cmsSessionWatchdog.unref();
}

function formatExifDateTime(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const match = raw.match(/^(\d{4}):(\d{2}):(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) return raw;

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function buildImageTechnicalMeta(filePath) {
  const dimensions = parseImageDimensions(filePath);
  const exif = parseExifFromJpeg(filePath);
  const camera = [exif && exif.make, exif && exif.model].filter(Boolean).join(' · ');
  const captureTime = formatExifDateTime(
    exif && (exif.dateTimeOriginal || exif.dateTimeDigitized || exif.dateTime)
  );
  const parts = [];

  if (captureTime) {
    parts.push(captureTime);
  }

  if (exif && exif.focalLength35mm) {
    parts.push(`${Math.round(Number(exif.focalLength35mm))}mm`);
  } else if (exif && exif.focalLength) {
    parts.push(`${trimDecimal(exif.focalLength, 0)}mm`);
  }

  if (exif && exif.exposureTime) {
    const exposure = formatExposureTime(exif.exposureTime);
    if (exposure) parts.push(exposure);
  }

  if (exif && exif.fNumber) {
    parts.push(`f/${trimDecimal(exif.fNumber, 1)}`);
  }

  if (exif && exif.iso) {
    parts.push(`ISO ${Math.round(Number(exif.iso))}`);
  }

  return {
    width: dimensions && dimensions.width ? dimensions.width : (exif && exif.pixelWidth ? Number(exif.pixelWidth) : null),
    height: dimensions && dimensions.height ? dimensions.height : (exif && exif.pixelHeight ? Number(exif.pixelHeight) : null),
    camera,
    captureTime,
    captureMeta: parts.join(' · ')
  };
}

function listImageLibrary(folder = '') {
  const { normalized, absolute } = resolveImageFolder(folder);
  fs.mkdirSync(absolute, { recursive: true });

  const items = fs.readdirSync(absolute, { withFileTypes: true })
    .filter(entry => entry.isFile() && isImageFileName(entry.name))
    .map(entry => {
      const filePath = path.join(absolute, entry.name);
      const stat = fs.statSync(filePath);
      const publicPath = normalized
        ? `/images/${normalized}/${entry.name}`
        : `/images/${entry.name}`;
      const technical = buildImageTechnicalMeta(filePath);

      return {
        name: entry.name,
        path: publicPath,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        meta: `${formatFileSize(stat.size)} · ${formatDate(stat.mtime)}`,
        width: technical.width || null,
        height: technical.height || null,
        dimensions: technical.width && technical.height ? `${technical.width} × ${technical.height}` : '',
        camera: technical.camera || '',
        captureTime: technical.captureTime || '',
        captureMeta: technical.captureMeta || ''
      };
    })
    .sort((left, right) => String(left.name).localeCompare(String(right.name), 'zh-Hans-CN', { numeric: true }));

  return {
    folder: normalized,
    folders: listImageFolders(),
    items
  };
}

function listImageFilesRecursive(currentPath, result = []) {
  if (!fs.existsSync(currentPath)) return result;
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      listImageFilesRecursive(fullPath, result);
      return;
    }
    if (entry.isFile() && isImageFileName(entry.name)) {
      result.push(fullPath);
    }
  });

  return result;
}

function buildSequentialImageBaseName(folder = '', fallback = 'image') {
  const normalized = String(folder || '').replace(/^\/+|\/+$/g, '');
  const leaf = normalized.split('/').filter(Boolean).pop() || fallback;
  return slugifyFileSegment(leaf);
}

function buildSequentialImageFilename(baseName, index, total, extension) {
  const digits = Math.max(2, String(Math.max(1, total)).length);
  return `${baseName}-${String(index + 1).padStart(digits, '0')}${extension}`;
}

function buildImageRenamePlan(files, options = {}) {
  const mode = String(options.mode || 'sanitize').trim();
  const reservedByDir = new Map();
  const plan = [];
  const sortedFiles = (Array.isArray(files) ? files.slice() : []).sort((left, right) => left.localeCompare(right));

  if (mode === 'gallery-sequence') {
    const filesByDir = new Map();
    sortedFiles.forEach(filePath => {
      const directory = path.dirname(filePath);
      if (!filesByDir.has(directory)) {
        filesByDir.set(directory, []);
      }
      filesByDir.get(directory).push(filePath);
    });

    filesByDir.forEach((directoryFiles, directory) => {
      const relativeDir = toPosixPath(path.relative(IMAGES_DIR, directory));
      const baseName = slugifyFileSegment(options.baseName || buildSequentialImageBaseName(relativeDir));
      const orderedFiles = directoryFiles
        .map(filePath => ({
          filePath,
          captureTime: buildImageTechnicalMeta(filePath).captureTime || '',
          name: path.basename(filePath)
        }))
        .sort((left, right) => {
          if (left.captureTime && right.captureTime && left.captureTime !== right.captureTime) {
            return left.captureTime.localeCompare(right.captureTime);
          }
          if (left.captureTime && !right.captureTime) return -1;
          if (!left.captureTime && right.captureTime) return 1;
          return left.name.localeCompare(right.name, 'zh-Hans-CN', { numeric: true });
        });
      const total = orderedFiles.length;
      const reservedNames = new Set();

      orderedFiles.forEach(({ filePath }, index) => {
        const currentName = path.basename(filePath);
        const extension = path.extname(currentName).toLowerCase();
        const preferredName = buildSequentialImageFilename(baseName, index, total, extension);
        const nextName = getUniqueFilename(directory, preferredName, reservedNames);
        if (nextName === currentName) return;

        const nextPath = path.join(directory, nextName);
        const oldRelative = toPosixPath(path.relative(IMAGES_DIR, filePath));
        const nextRelative = toPosixPath(path.relative(IMAGES_DIR, nextPath));

        plan.push({
          oldPath: filePath,
          nextPath,
          oldName: currentName,
          nextName,
          oldPublicPath: `/images/${oldRelative}`,
          nextPublicPath: `/images/${nextRelative}`
        });
      });
    });

    return plan;
  }

  sortedFiles.forEach(filePath => {
    const directory = path.dirname(filePath);
    const currentName = path.basename(filePath);
    const safeName = sanitizeImageFilename(currentName, 'image');
    if (safeName === currentName) return;

    if (!reservedByDir.has(directory)) {
      reservedByDir.set(directory, new Set());
    }

    const nextName = getUniqueFilename(directory, safeName, reservedByDir.get(directory));
    const nextPath = path.join(directory, nextName);
    const oldRelative = toPosixPath(path.relative(IMAGES_DIR, filePath));
    const nextRelative = toPosixPath(path.relative(IMAGES_DIR, nextPath));

    plan.push({
      oldPath: filePath,
      nextPath,
      oldName: currentName,
      nextName,
      oldPublicPath: `/images/${oldRelative}`,
      nextPublicPath: `/images/${nextRelative}`
    });
  });

  return plan;
}

function replaceManyTextInProjectFiles(replacements = [], excludedFiles = []) {
  const normalizedReplacements = (Array.isArray(replacements) ? replacements : [])
    .filter(item => item && item.from && item.from !== item.to)
    .map(item => ({ from: String(item.from), to: String(item.to) }));

  if (!normalizedReplacements.length) {
    return {
      updatedFiles: [],
      replacementCount: 0
    };
  }

  const excluded = new Set(excludedFiles.map(filePath => ensureInsideRoot(filePath)));
  const files = listSearchableProjectFiles(ROOT);
  const updatedFiles = [];
  let replacementCount = 0;

  files.forEach(filePath => {
    if (excluded.has(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    let nextContent = content;
    let fileReplacementCount = 0;
    const placeholders = normalizedReplacements.map((item, index) => ({
      token: `__LOCAL_CMS_RENAME_${index}_${Date.now()}__`,
      to: item.to
    }));

    normalizedReplacements.forEach((item, index) => {
      const count = countSubstringOccurrences(nextContent, item.from);
      if (!count) return;
      nextContent = nextContent.split(item.from).join(placeholders[index].token);
      fileReplacementCount += count;
    });

    if (!fileReplacementCount) return;

    placeholders.forEach(item => {
      nextContent = nextContent.split(item.token).join(item.to);
    });

    if (nextContent === content) return;

    fs.writeFileSync(filePath, nextContent, 'utf8');
    updatedFiles.push(toPosixPath(filePath));
    replacementCount += fileReplacementCount;
  });

  return {
    updatedFiles,
    replacementCount
  };
}

function normalizeImageFilenamesInFolder(folder = '', options = {}) {
  const { normalized, absolute } = resolveImageFolder(folder);
  fs.mkdirSync(absolute, { recursive: true });

  const plan = buildImageRenamePlan(listImageFilesRecursive(absolute), options);

  const updatedFiles = new Set();
  const tempPlan = [];

  plan.forEach((item, index) => {
    const tempPath = path.join(path.dirname(item.oldPath), `.__local_cms_rename_${Date.now()}_${index}${path.extname(item.oldPath).toLowerCase()}`);
    fs.renameSync(item.oldPath, tempPath);
    tempPlan.push({
      ...item,
      tempPath
    });
  });

  tempPlan.forEach(item => {
    fs.renameSync(item.tempPath, item.nextPath);
  });

  const replaceResult = replaceManyTextInProjectFiles(
    tempPlan.map(item => ({
      from: item.oldPublicPath,
      to: item.nextPublicPath
    }))
  );
  replaceResult.updatedFiles.forEach(filePath => updatedFiles.add(filePath));

  return {
    folder: normalized,
    renamed: tempPlan.map(item => ({
      from: item.oldPublicPath,
      to: item.nextPublicPath,
      oldName: item.oldName,
      nextName: item.nextName
    })),
    renamedCount: tempPlan.length,
    replacementCount: replaceResult.replacementCount,
    updatedFiles: Array.from(updatedFiles),
    folders: listImageFolders()
  };
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

function renameImageFolder(currentFolder, nextFolder) {
  const current = resolveImageFolder(currentFolder);
  const next = resolveImageFolder(nextFolder);

  if (!current.normalized) {
    throw new Error('请选择要重命名的目录。');
  }

  if (!next.normalized) {
    throw new Error('请输入新的目录名。');
  }

  if (!fs.existsSync(current.absolute) || !fs.statSync(current.absolute).isDirectory()) {
    throw new Error(`目录不存在：images/${current.normalized}`);
  }

  if (next.normalized === current.normalized) {
    throw new Error('目录名未变化。');
  }

  if (next.normalized.startsWith(`${current.normalized}/`)) {
    throw new Error('不能把目录重命名到自己的子目录中。');
  }

  if (fs.existsSync(next.absolute)) {
    throw new Error(`目标目录已存在：images/${next.normalized}`);
  }

  fs.mkdirSync(path.dirname(next.absolute), { recursive: true });
  fs.renameSync(current.absolute, next.absolute);
  const replaceResult = replaceTextInProjectFiles(
    `/images/${current.normalized}/`,
    `/images/${next.normalized}/`
  );

  return {
    previousFolder: current.normalized,
    folder: next.normalized,
    folders: listImageFolders(),
    updatedFiles: replaceResult.updatedFiles,
    replacementCount: replaceResult.replacementCount
  };
}

function deleteImageFolder(folder, options = {}) {
  const target = resolveImageFolder(folder);

  if (!target.normalized) {
    throw new Error('不能删除 source/images 根目录。');
  }

  if (!fs.existsSync(target.absolute) || !fs.statSync(target.absolute).isDirectory()) {
    throw new Error(`目录不存在：images/${target.normalized}`);
  }

  const referencePayload = getImageReferencePayload({ folder: target.normalized });
  if (referencePayload.referenceCount > 0 && !options.force) {
    throw new Error(`目录 images/${target.normalized} 仍被 ${referencePayload.referenceCount} 个文件引用，不能直接删除。`);
  }

  fs.rmSync(target.absolute, { recursive: true, force: true });
  return {
    deleted: target.normalized,
    folders: listImageFolders(),
    references: referencePayload.references,
    referenceCount: referencePayload.referenceCount,
    forced: Boolean(options.force)
  };
}

function resolveImagePublicPath(imagePath = '') {
  const normalized = String(imagePath || '').trim();
  if (!normalized.startsWith('/images/')) {
    throw new Error('图片路径必须以 /images/ 开头。');
  }

  const relativePath = normalized.replace(/^\/images\//, '');
  const absolutePath = ensureInsideRoot(path.join(IMAGES_DIR, relativePath));
  if (!absolutePath.startsWith(IMAGES_DIR)) {
    throw new Error('图片路径必须位于 source/images 下。');
  }

  return {
    normalized,
    relativePath,
    absolutePath
  };
}

function countSubstringOccurrences(content, searchValue) {
  if (!searchValue) return 0;
  let count = 0;
  let cursor = 0;

  while (cursor < content.length) {
    const nextIndex = content.indexOf(searchValue, cursor);
    if (nextIndex === -1) break;
    count += 1;
    cursor = nextIndex + searchValue.length;
  }

  return count;
}

function collectProjectTextMatches(searchValue, excludedFiles = []) {
  if (!searchValue) return [];

  const excluded = new Set(excludedFiles.map(filePath => ensureInsideRoot(filePath)));
  const files = listSearchableProjectFiles(ROOT);
  const matches = [];

  files.forEach(filePath => {
    if (excluded.has(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(searchValue)) return;

    matches.push({
      file: toPosixPath(filePath),
      count: countSubstringOccurrences(content, searchValue)
    });
  });

  return matches;
}

function getImageReferencePayload({ publicPath = '', folder = '' } = {}) {
  const normalizedPath = String(publicPath || '').trim();
  const normalizedFolder = normalizeFolderPath(folder);

  if (normalizedPath) {
    const target = resolveImagePublicPath(normalizedPath);
    const references = collectProjectTextMatches(target.normalized);
    return {
      kind: 'image',
      path: target.normalized,
      references,
      referenceCount: references.length,
      matchCount: references.reduce((sum, item) => sum + Number(item.count || 0), 0)
    };
  }

  if (normalizedFolder) {
    const folderPrefix = `/images/${normalizedFolder}/`;
    const references = collectProjectTextMatches(folderPrefix);
    return {
      kind: 'folder',
      folder: normalizedFolder,
      path: `images/${normalizedFolder}`,
      references,
      referenceCount: references.length,
      matchCount: references.reduce((sum, item) => sum + Number(item.count || 0), 0)
    };
  }

  throw new Error('请提供图片路径或目录路径。');
}

function replaceTextInProjectFiles(searchValue, replaceValue, excludedFiles = []) {
  if (!searchValue) {
    return {
      updatedFiles: [],
      replacementCount: 0
    };
  }

  const excluded = new Set(excludedFiles.map(filePath => ensureInsideRoot(filePath)));
  const files = listSearchableProjectFiles(ROOT);
  const updatedFiles = [];
  let replacementCount = 0;

  files.forEach(filePath => {
    if (excluded.has(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(searchValue)) return;

    const count = countSubstringOccurrences(content, searchValue);
    const nextContent = content.split(searchValue).join(replaceValue);
    if (nextContent === content) return;

    fs.writeFileSync(filePath, nextContent, 'utf8');
    updatedFiles.push(toPosixPath(filePath));
    replacementCount += count;
  });

  return {
    updatedFiles,
    replacementCount
  };
}

function moveImageFile(imagePath, nextFolder, nextName) {
  const current = resolveImagePublicPath(imagePath);
  if (!fs.existsSync(current.absolutePath) || !fs.statSync(current.absolutePath).isFile()) {
    throw new Error(`图片不存在：${current.normalized}`);
  }

  const currentFolder = path.dirname(current.relativePath) === '.'
    ? ''
    : path.dirname(current.relativePath).split(path.sep).join('/');
  const targetFolder = resolveImageFolder(typeof nextFolder === 'string' ? nextFolder : currentFolder);
  const targetName = nextName
    ? sanitizeUploadFilename(nextName, targetFolder.absolute)
    : path.basename(current.relativePath);
  const nextAbsolutePath = path.join(targetFolder.absolute, targetName);
  const nextPublicPath = targetFolder.normalized
    ? `/images/${targetFolder.normalized}/${targetName}`
    : `/images/${targetName}`;

  if (nextPublicPath === current.normalized) {
    throw new Error('图片路径未变化。');
  }

  if (fs.existsSync(nextAbsolutePath)) {
    throw new Error(`目标图片已存在：${nextPublicPath}`);
  }

  fs.mkdirSync(targetFolder.absolute, { recursive: true });
  fs.renameSync(current.absolutePath, nextAbsolutePath);
  const replaceResult = replaceTextInProjectFiles(current.normalized, nextPublicPath);
  cleanupEmptyImageDirectories(current.absolutePath);

  return {
    previousPath: current.normalized,
    path: nextPublicPath,
    folder: targetFolder.normalized,
    name: targetName,
    folders: listImageFolders(),
    updatedFiles: replaceResult.updatedFiles,
    replacementCount: replaceResult.replacementCount
  };
}

function deleteImageFile(imagePath, options = {}) {
  const target = resolveImagePublicPath(imagePath);
  if (!fs.existsSync(target.absolutePath) || !fs.statSync(target.absolutePath).isFile()) {
    throw new Error(`图片不存在：${target.normalized}`);
  }

  const referencePayload = getImageReferencePayload({ publicPath: target.normalized });
  if (referencePayload.referenceCount > 0 && !options.force) {
    throw new Error(`图片 ${target.normalized} 仍被 ${referencePayload.referenceCount} 个文件引用，不能直接删除。`);
  }

  fs.rmSync(target.absolutePath, { force: true });
  cleanupEmptyImageDirectories(path.dirname(target.absolutePath));

  const folder = path.dirname(target.relativePath) === '.'
    ? ''
    : path.dirname(target.relativePath).split(path.sep).join('/');

  return {
    deleted: target.normalized,
    folder,
    folders: listImageFolders(),
    references: referencePayload.references,
    referenceCount: referencePayload.referenceCount,
    forced: Boolean(options.force)
  };
}

function sanitizeUploadFilename(filename = '', directory = '') {
  const safe = sanitizeImageFilename(filename, 'upload');
  if (!directory) return safe;
  return getUniqueFilename(directory, safe);
}

function uploadImageFiles(folder, files) {
  const { normalized, absolute } = resolveImageFolder(folder);
  fs.mkdirSync(absolute, { recursive: true });

  const reservedNames = new Set();
  const uploaded = (Array.isArray(files) ? files : []).map(file => {
    const originalName = path.basename(String(file.name || ''));
    const filename = getUniqueFilename(
      absolute,
      sanitizeUploadFilename(originalName),
      reservedNames
    );
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
      originalName,
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
  if (payload && typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (payload && Array.isArray(payload.output)) {
    const outputText = payload.output.map(item => {
      if (!item || !Array.isArray(item.content)) return '';
      return item.content.map(contentItem => {
        if (contentItem && typeof contentItem.text === 'string') return contentItem.text;
        return '';
      }).join('');
    }).join('').trim();

    if (outputText) return outputText;
  }

  if (payload && Array.isArray(payload.content)) {
    const anthropicText = payload.content.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item.text === 'string') return item.text;
      return '';
    }).join('').trim();

    if (anthropicText) return anthropicText;
  }

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

function ensureLlmSettingsReady() {
  const settings = getLlmSettingsPayload().llm;

  if (!settings.endpoint || !settings.apiKey || !settings.model) {
    throw new Error('请先在 LLM 配置里填写 endpoint、API Key 和 model。');
  }

  return settings;
}

function normalizeTranslatedTags(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function formatFetchErrorMessage(error, endpoint, model) {
  const reason = error && error.cause && error.cause.message
    ? error.cause.message
    : (error && error.message ? error.message : '未知网络错误');

  return [
    `无法连接到 LLM 接口：${endpoint}`,
    `当前模型配置：${model || '未填写'}`,
    `底层错误：${reason}`,
    '请检查 endpoint、模型名、API Key，以及当前网络是否能访问该接口。'
  ].join('；');
}

function loadProjectWritingStyleGuide() {
  if (!fs.existsSync(WRITING_STYLE_GUIDE_PATH)) {
    return '';
  }

  return fs.readFileSync(WRITING_STYLE_GUIDE_PATH, 'utf8');
}

function extractWritingGuideSection(guide, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`## ${escapedHeading}[\\s\\S]*?(?=\\n## |$)`, 'm');
  const match = String(guide || '').match(pattern);
  return match ? match[0].trim() : '';
}

function buildTranslationStyleGuideContext() {
  const guide = loadProjectWritingStyleGuide();
  if (!guide) return '';

  return [
    extractWritingGuideSection(guide, '2. 文章骨架'),
    extractWritingGuideSection(guide, '3. 开头概括规范'),
    extractWritingGuideSection(guide, '6. 通用写作标准'),
    extractWritingGuideSection(guide, '7. 翻译稿规则')
  ].filter(Boolean).join('\n\n');
}

function formatTranslationNoteTimestamp(value = new Date()) {
  return `${formatDate(value)} CST`;
}

function buildTranslationNote(modelUsed, translatedAt) {
  return `> Translation note: This English version was translated by ${modelUsed} on ${translatedAt}. The source text is the corresponding Chinese post in this repository.`;
}

function removeExistingTranslationNote(body) {
  const text = String(body || '').trim();
  if (!text) return '';

  return text.replace(
    /(^|\n{2,})> Translation note: This English version was translated by .*? The source text is the corresponding Chinese post in this repository\.\s*/g,
    '\n\n'
  ).trim();
}

function upsertTranslationNote(body, modelUsed, translatedAt) {
  const note = buildTranslationNote(modelUsed, translatedAt);
  const sanitized = removeExistingTranslationNote(body);
  const moreMarker = '<!-- more -->';

  if (sanitized.includes(moreMarker)) {
    return sanitized.replace(
      moreMarker,
      `${moreMarker}\n\n${note}`
    ).trim();
  }

  return `${moreMarker}\n\n${note}\n\n${sanitized}`.trim();
}

function normalizeLlmSettingsInput(payload) {
  const llm = payload && payload.llm && typeof payload.llm === 'object' ? payload.llm : payload || {};
  return {
    endpoint: String(llm.endpoint || '').trim(),
    apiKey: String(llm.apiKey || '').trim(),
    model: String(llm.model || '').trim(),
    temperature: Number(llm.temperature ?? DEFAULT_LLM_SETTINGS.temperature),
    prompt: String(llm.prompt || '').trim(),
    translationPrompt: String(llm.translationPrompt || '').trim()
  };
}

function ensureLlmSettingsObject(settings) {
  const normalized = normalizeLlmSettingsInput(settings);
  if (!normalized.endpoint || !normalized.apiKey || !normalized.model) {
    throw new Error('请先在 LLM 配置里填写 endpoint、API Key 和 model。');
  }
  return normalized;
}

function normalizeLlmEndpoint(endpoint) {
  const raw = String(endpoint || '').trim();
  if (!raw) return '';

  let parsed;
  try {
    parsed = new URL(raw);
  } catch (error) {
    return raw;
  }

  const lowerHost = String(parsed.hostname || '').toLowerCase();
  const pathname = parsed.pathname.replace(/\/+$/g, '');
  const isAnthropic = lowerHost.includes('anthropic.com');
  const isXiaomiAnthropic = lowerHost.includes('xiaomimimo.com') && pathname.includes('/anthropic');

  if (isAnthropic || isXiaomiAnthropic) {
    if (pathname.endsWith('/messages')) {
      return parsed.toString();
    }

    if (isXiaomiAnthropic) {
      if (pathname.endsWith('/v1')) {
        parsed.pathname = `${pathname}/messages`;
        return parsed.toString();
      }

      if (pathname.endsWith('/anthropic')) {
        parsed.pathname = `${pathname}/v1/messages`;
        return parsed.toString();
      }

      parsed.pathname = `${pathname}/messages`;
      return parsed.toString();
    }

    if (!pathname || pathname === '/') {
      parsed.pathname = '/v1/messages';
      return parsed.toString();
    }

    if (pathname.endsWith('/v1')) {
      parsed.pathname = `${pathname}/messages`;
      return parsed.toString();
    }

    parsed.pathname = `${pathname}/messages`;
    return parsed.toString();
  }

  if (
    pathname.endsWith('/chat/completions') ||
    pathname.endsWith('/responses') ||
    pathname.endsWith('/completions')
  ) {
    return parsed.toString();
  }

  if (!pathname || pathname === '/') {
    parsed.pathname = '/v1/chat/completions';
    return parsed.toString();
  }

  if (pathname.endsWith('/v1')) {
    parsed.pathname = `${pathname}/chat/completions`;
    return parsed.toString();
  }

  parsed.pathname = `${pathname}/chat/completions`;
  return parsed.toString();
}

function detectLlmProvider(endpoint) {
  const raw = String(endpoint || '').trim().toLowerCase();
  if (!raw) return 'openai-compatible';

  if (raw.includes('xiaomimimo.com')) {
    return raw.includes('/anthropic') || raw.includes('/v1/messages')
      ? 'xiaomi-anthropic'
      : 'xiaomi-openai';
  }

  if (raw.includes('anthropic.com') || raw.includes('/v1/messages')) {
    return 'anthropic';
  }

  if (raw.endsWith('/responses') || raw.includes('/v1/responses')) {
    return 'openai-responses';
  }

  return 'openai-compatible';
}

function normalizeLlmMessages(messages = []) {
  return (Array.isArray(messages) ? messages : []).map(message => ({
    role: String(message && message.role || 'user').trim() || 'user',
    content: message && typeof message.content === 'string'
      ? message.content
      : String(message && message.content || '')
  }));
}

function buildAnthropicMessagesPayload(messages, settings, options = {}) {
  const normalizedMessages = normalizeLlmMessages(messages);
  const system = normalizedMessages
    .filter(message => message.role === 'system')
    .map(message => message.content)
    .filter(Boolean)
    .join('\n\n');

  const conversation = normalizedMessages
    .filter(message => message.role !== 'system')
    .map(message => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content
    }));

  return {
    model: settings.model,
    temperature: Number(options.temperature ?? settings.temperature ?? DEFAULT_LLM_SETTINGS.temperature),
    max_tokens: Number(options.maxTokens || 4096),
    ...(system ? { system } : {}),
    messages: conversation
  };
}

function buildOpenAiResponsesPayload(messages, settings, options = {}) {
  const normalizedMessages = normalizeLlmMessages(messages);
  const input = normalizedMessages.map(message => ({
    role: message.role === 'assistant' ? 'assistant' : (message.role === 'system' ? 'system' : 'user'),
    content: [
      {
        type: 'input_text',
        text: message.content
      }
    ]
  }));

  return {
    model: settings.model,
    temperature: Number(options.temperature ?? settings.temperature ?? DEFAULT_LLM_SETTINGS.temperature),
    input
  };
}

function buildOpenAiChatPayload(messages, settings, options = {}) {
  return {
    model: String(settings.model || '').trim(),
    temperature: Number(options.temperature ?? settings.temperature ?? DEFAULT_LLM_SETTINGS.temperature),
    ...(options.maxCompletionTokens ? { max_completion_tokens: Number(options.maxCompletionTokens) } : {}),
    messages: normalizeLlmMessages(messages)
  };
}

function normalizeProviderModel(provider, model) {
  const raw = String(model || '').trim();
  if (!raw) return raw;

  if (provider === 'xiaomi-openai' || provider === 'xiaomi-anthropic') {
    return raw.toLowerCase();
  }

  return raw;
}

function buildLlmRequestConfig(settings, messages, options = {}) {
  const endpoint = normalizeLlmEndpoint(settings.endpoint);
  const provider = detectLlmProvider(endpoint);
  const providerSettings = {
    ...settings,
    model: normalizeProviderModel(provider, settings.model)
  };
  const headers = {
    'Content-Type': 'application/json'
  };

  if (provider === 'anthropic' || provider === 'xiaomi-anthropic') {
    if (provider === 'xiaomi-anthropic') {
      headers['api-key'] = providerSettings.apiKey;
    } else {
      headers['x-api-key'] = providerSettings.apiKey;
    }
    headers['anthropic-version'] = '2023-06-01';
    return {
      endpoint,
      provider,
      headers,
      body: buildAnthropicMessagesPayload(messages, providerSettings, options)
    };
  }

  if (provider === 'xiaomi-openai') {
    headers['api-key'] = providerSettings.apiKey;
  } else {
    headers.Authorization = `Bearer ${providerSettings.apiKey}`;
  }

  if (provider === 'openai-responses') {
    return {
      endpoint,
      provider,
      headers,
      body: buildOpenAiResponsesPayload(messages, providerSettings, options)
    };
  }

  return {
    endpoint,
    provider,
    headers,
    body: buildOpenAiChatPayload(messages, providerSettings, options)
  };
}

async function requestLlmChat(messages, options = {}) {
  const settings = options.settings
    ? ensureLlmSettingsObject(options.settings)
    : ensureLlmSettingsReady();
  const requestConfig = buildLlmRequestConfig(settings, messages, options);
  let response;
  try {
    response = await fetch(requestConfig.endpoint, {
      method: 'POST',
      headers: requestConfig.headers,
      body: JSON.stringify(requestConfig.body)
    });
  } catch (error) {
    throw new Error(formatFetchErrorMessage(error, requestConfig.endpoint, settings.model));
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM 请求失败：${response.status} ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = parseLlmResponseContent(data);

  if (!content) {
    throw new Error('LLM 没有返回可用内容。');
  }

  return content;
}

async function testLlmConnection(payload) {
  const settings = ensureLlmSettingsObject(payload);
  const content = await requestLlmChat([
    {
      role: 'system',
      content: 'Return a short plain-text acknowledgment.'
    },
    {
      role: 'user',
      content: 'Reply with exactly: connection ok'
    }
  ], {
    settings,
    temperature: 0,
    maxCompletionTokens: 32
  });

  const endpoint = normalizeLlmEndpoint(settings.endpoint);
  const provider = detectLlmProvider(endpoint);
  return {
    ok: true,
    provider,
    endpoint,
    model: normalizeProviderModel(provider, settings.model),
    preview: String(content || '').trim().slice(0, 120)
  };
}

function parseJsonFromLlmText(content) {
  const raw = String(content || '').trim();
  if (!raw) {
    throw new Error('LLM 没有返回可解析的 JSON。');
  }

  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : raw;

  try {
    return JSON.parse(candidate);
  } catch (error) {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch (nestedError) {
        throw new Error(`LLM 返回的 JSON 无法解析：${nestedError.message}`);
      }
    }
    throw new Error(`LLM 返回的 JSON 无法解析：${error.message}`);
  }
}

async function formatChineseDraftWithLlm(payload) {
  const body = String(payload.body || '').trim();
  if (!body) {
    throw new Error('中文正文为空，无法排版。');
  }

  const settings = ensureLlmSettingsReady();
  const formatted = await requestLlmChat([
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
  ]);

  return {
    content: formatted
  };
}

async function translateGalleryAlbumToEnglish(payload) {
  const album = payload && typeof payload === 'object' ? payload : {};
  const photos = Array.isArray(album.photos) ? album.photos : [];
  const hasAlbumText = [
    album.title,
    album.period,
    album.location,
    album.camera,
    album.description
  ].some(value => String(value || '').trim());
  const hasPhotoText = photos.some(photo => String(photo && (photo.title || photo.caption) || '').trim());

  if (!hasAlbumText && !hasPhotoText) {
    throw new Error('请先填写中文相册信息或图片中文说明，再执行一键翻译。');
  }

  const prompt = [
    '你是一个严谨的中英摄影内容翻译助手。',
    '请把输入的中文画廊信息翻译成自然、简洁、适合作品集展示的英文。',
    '保留专有名词、品牌、镜头型号、地点名、日期、数字和摄影参数。',
    '不要扩写，不要添加原文没有的信息。',
    '如果某个中文字段为空，对应英文字段返回空字符串。',
    '标签翻译成简洁的英文词组数组。',
    '只返回 JSON，不要输出解释或 Markdown 代码块。',
    'JSON 结构必须是：{"title":"","period":"","location":"","camera":"","description":"","tags":[],"photos":[{"src":"","title":"","caption":""}]}',
    'photos 数组顺序和输入保持一致，src 原样返回。'
  ].join('\n');

  const content = await requestLlmChat([
    { role: 'system', content: prompt },
    {
      role: 'user',
      content: JSON.stringify({
        title: String(album.title || '').trim(),
        period: String(album.period || '').trim(),
        location: String(album.location || '').trim(),
        camera: String(album.camera || '').trim(),
        description: String(album.description || '').trim(),
        tags: Array.isArray(album.tags) ? album.tags.map(item => String(item || '').trim()).filter(Boolean) : [],
        photos: photos.map(photo => ({
          src: String(photo && photo.src || '').trim(),
          title: String(photo && photo.title || '').trim(),
          caption: String(photo && photo.caption || '').trim()
        }))
      }, null, 2)
    }
  ], { temperature: 0.1 });

  const parsed = parseJsonFromLlmText(content);
  const translatedPhotos = Array.isArray(parsed.photos) ? parsed.photos : [];
  const photosBySrc = new Map(translatedPhotos.map(photo => [String(photo && photo.src || '').trim(), photo]));

  return {
    title: String(parsed.title || '').trim(),
    period: String(parsed.period || '').trim(),
    location: String(parsed.location || '').trim(),
    camera: String(parsed.camera || '').trim(),
    description: String(parsed.description || '').trim(),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(item => String(item || '').trim()).filter(Boolean) : [],
    photos: photos.map(photo => {
      const src = String(photo && photo.src || '').trim();
      const translated = photosBySrc.get(src) || {};
      return {
        src,
        title: String(translated.title || '').trim(),
        caption: String(translated.caption || '').trim()
      };
    })
  };
}

async function translateChineseDraftToEnglish(payload) {
  const settings = ensureLlmSettingsReady();
  const zhTitle = String(payload.zhTitle || '').trim();
  const zhBody = String(payload.zhBody || '').trim();

  if (!zhTitle && !zhBody) {
    throw new Error('中文标题和正文至少要有一项，才能生成英文稿。');
  }

  const writingGuideContext = buildTranslationStyleGuideContext();
  const content = await requestLlmChat([
    { role: 'system', content: settings.translationPrompt || DEFAULT_LLM_SETTINGS.translationPrompt },
    {
      role: 'system',
      content: writingGuideContext
        ? [
          '请严格遵守当前项目的英文写作规范，尤其注意：',
          '- 英文标题尽量使用 sentence case。',
          '- 一句话概括要短、直接、有信息量。',
          '- 如果正文里已有 `<!-- more -->`，请保留它。',
          '- 不要自行添加 front matter。',
          '- 不要自行编造翻译说明，我会在后处理中统一插入。',
          '',
          '下面是从项目文档实时读取的写作规范：',
          writingGuideContext
        ].join('\n')
        : [
          '请严格遵守当前项目的英文写作规范。',
          '英文标题尽量使用 sentence case。',
          '一句话概括要短、直接、有信息量。',
          '如果正文里已有 `<!-- more -->`，请保留它。',
          '不要自行添加 front matter 或翻译说明。'
        ].join('\n')
    },
    {
      role: 'user',
      content: JSON.stringify({
        zhTitle,
        zhDescription: String(payload.zhDescription || '').trim(),
        zhTags: normalizeStringList(payload.zhTags),
        zhBody,
        existingEnDraft: {
          title: String(payload.existingEnTitle || '').trim(),
          description: String(payload.existingEnDescription || '').trim(),
          tags: normalizeStringList(payload.existingEnTags),
          body: String(payload.existingEnBody || '').trim()
        }
      }, null, 2)
    }
  ]);

  const translated = parseJsonFromLlmText(content);
  const title = String(translated.title || '').trim();
  const description = String(translated.description || '').trim();
  const tags = normalizeTranslatedTags(translated.tags);
  const modelUsed = settings.model;
  const translatedAt = formatTranslationNoteTimestamp(new Date());
  const body = upsertTranslationNote(String(translated.body || '').trim(), modelUsed, translatedAt);

  if (!title) {
    throw new Error('LLM 返回的英文标题为空。');
  }
  if (!body) {
    throw new Error('LLM 返回的英文正文为空。');
  }

  return {
    title,
    description,
    tags,
    body,
    modelUsed,
    translatedAt
  };
}

function renderMarkdownPreview(markdown, sourcePath = 'source/_posts/preview.zh-CN.md') {
  const render = require('hexo-renderer-marked/lib/renderer');
  const config = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
  const sourceDir = path.join(ROOT, 'source') + path.sep;
  const fakeHexo = {
    config: {
      ...config,
      source_dir: sourceDir,
      post_asset_folder: Boolean(config.post_asset_folder),
      marked: {
        gfm: true,
        pedantic: false,
        breaks: true,
        smartLists: true,
        smartypants: true,
        modifyAnchors: 0,
        autolink: true,
        mangle: true,
        sanitizeUrl: false,
        dompurify: false,
        headerIds: true,
        anchorAlias: false,
        lazyload: false,
        prependRoot: true,
        postAsset: false,
        external_link: {
          enable: false,
          exclude: [],
          nofollow: false
        },
        descriptionLists: true,
        ...(config.marked || {})
      }
    },
    source_dir: sourceDir,
    execFilterSync() {},
    model() {
      return {
        findOne() {
          return null;
        }
      };
    }
  };

  return render.call(fakeHexo, {
    path: sourcePath,
    text: String(markdown || '')
  }, {});
}

function trimLog(content, maxLength = 30000) {
  const value = String(content || '');
  if (value.length <= maxLength) return value;
  return value.slice(value.length - maxLength);
}

function createAuditId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getRequestActor(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || req.socket.remoteAddress || '';
  return {
    ip: ip.replace(/^::ffff:/, ''),
    userAgent: String(req.headers['user-agent'] || '').trim()
  };
}

function appendAuditLog(req, payload) {
  const entry = {
    id: createAuditId(),
    timestamp: createTimestamp(),
    entityType: String(payload.entityType || '').trim(),
    action: String(payload.action || '').trim(),
    summary: String(payload.summary || '').trim(),
    target: String(payload.target || '').trim(),
    details: payload.details && typeof payload.details === 'object' ? payload.details : {},
    request: {
      method: req.method,
      path: new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`).pathname,
      ...getRequestActor(req)
    }
  };

  fs.appendFileSync(AUDIT_LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8');
  return entry;
}

function readAuditLogs(filters = {}) {
  const entityType = String(filters.entityType || '').trim();
  const action = String(filters.action || '').trim();
  const rawLimit = Number(filters.limit || 120);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(500, Math.floor(rawLimit))) : 120;

  if (!fs.existsSync(AUDIT_LOG_PATH)) {
    return {
      file: toPosixPath(AUDIT_LOG_PATH),
      items: []
    };
  }

  const lines = fs.readFileSync(AUDIT_LOG_PATH, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean);
  const items = [];

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(lines[index]);
      if (entityType && parsed.entityType !== entityType) continue;
      if (action && parsed.action !== action) continue;
      items.push(parsed);
      if (items.length >= limit) break;
    } catch (error) {
      continue;
    }
  }

  return {
    file: toPosixPath(AUDIT_LOG_PATH),
    items
  };
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

function checkPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();

    probe.once('error', error => {
      if (error && error.code === 'EADDRINUSE') {
        resolve(false);
        return;
      }
      reject(error);
    });

    probe.once('listening', () => {
      probe.close(closeError => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve(true);
      });
    });

    probe.listen(port);
  });
}

function spawnNpmScript(script) {
  const options = {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  };
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath && fs.existsSync(npmExecPath)) {
    return spawn(process.execPath, [npmExecPath, 'run', script], options);
  }

  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', `npm run ${script}`], {
      ...options,
      windowsHide: true
    });
  }

  return spawn('npm', ['run', script], options);
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

  const child = spawnNpmScript(command.script);

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

async function startHexoServer() {
  if (commandState.serverProcess && commandState.serverStatus.running) {
    throw new Error('预览服务器已经在运行。');
  }

  const isAvailable = await checkPortAvailable(4000);
  if (!isAvailable) {
    throw new Error('4000 端口已被占用。先停止现有预览进程，或运行 `lsof -nP -iTCP:4000 -sTCP:LISTEN` 找到 PID 后结束它；也可以改用 `npm run server -- -p 4001`。');
  }

  commandState.serverStatus = {
    running: true,
    startedAt: createTimestamp(),
    pid: null,
    url: 'http://127.0.0.1:4000/',
    log: '$ npm run server\n'
  };

  const child = spawnNpmScript('server');

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
      fileKey: key,
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
  const normalizedSaveTime = formatDate(saveTime);

  if (!slug) throw new Error('Slug 不能为空。');
  if (!normalizedSaveTime) throw new Error('保存时间格式不合法。');

  const desiredKey = normalizePostKeyInput(payload.common && payload.common.fileKey);
  const key = desiredKey || sourceKey || `${normalizedSaveTime.slice(0, 10)}-${slugifyFileSegment(slug)}`;
  const zhPath = ensureInsideRoot(path.join(POSTS_DIR, `${key}.zh-CN.md`));
  const enPath = ensureInsideRoot(path.join(POSTS_DIR, `${key}.en.md`));
  const sourceZhPath = sourceKey ? ensureInsideRoot(path.join(POSTS_DIR, `${sourceKey}.zh-CN.md`)) : '';
  const sourceEnPath = sourceKey ? ensureInsideRoot(path.join(POSTS_DIR, `${sourceKey}.en.md`)) : '';

  if (sourceKey && key !== sourceKey && (fs.existsSync(zhPath) || fs.existsSync(enPath))) {
    throw new Error(`目标文件名已存在：${key}`);
  }

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
  const existingZhData = sourceZhPath && fs.existsSync(sourceZhPath) ? parseMarkdownFile(sourceZhPath).data : {};
  const existingEnData = sourceEnPath && fs.existsSync(sourceEnPath) ? parseMarkdownFile(sourceEnPath).data : {};
  const preservedPublishedDate = formatDate(
    existingZhData.date
    || existingEnData.date
    || normalizedSaveTime
  );

  if (!preservedPublishedDate) {
    throw new Error('文章发布时间格式不合法。');
  }

  const zhFrontMatter = {
    title: String(payload.zh.title || '').trim(),
    date: preservedPublishedDate,
    lang: 'zh-CN',
    slug,
    permalink: derivePermalink('zh-CN', preservedPublishedDate, slug, String(payload.zh.permalink || '').trim()),
    description: String(payload.zh.description || '').trim(),
    photos,
    tags: normalizeStringList(payload.zh.tags),
    categories: [categoryZh],
    toc,
    ...zhExtras,
    updated: normalizedSaveTime
  };

  const enFrontMatter = {
    title: String(payload.en.title || '').trim(),
    date: preservedPublishedDate,
    lang: 'en',
    slug,
    permalink: derivePermalink('en', preservedPublishedDate, slug, String(payload.en.permalink || '').trim()),
    description: String(payload.en.description || '').trim(),
    photos,
    tags: normalizeStringList(payload.en.tags),
    categories: [categoryEn],
    toc,
    ...enExtras,
    updated: normalizedSaveTime
  };

  if (!zhFrontMatter.title) throw new Error('中文标题不能为空。');
  if (!enFrontMatter.title) throw new Error('英文标题不能为空。');

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(zhPath, buildFrontMatterString(zhFrontMatter, payload.zh.body), 'utf8');
  fs.writeFileSync(enPath, buildFrontMatterString(enFrontMatter, payload.en.body), 'utf8');

  if (sourceKey && key !== sourceKey) {
    if (sourceZhPath && fs.existsSync(sourceZhPath)) fs.unlinkSync(sourceZhPath);
    if (sourceEnPath && fs.existsSync(sourceEnPath)) fs.unlinkSync(sourceEnPath);
  }

  return readPostPair(key, categoryOptions);
}

function collectPostPhotoPaths(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const parsed = parseMarkdownFile(filePath);
  return normalizePhotoList(parsed.data.photos);
}

function resolvePublicImagePath(publicPath) {
  const normalized = String(publicPath || '').trim();
  if (!normalized.startsWith('/images/')) return null;

  const relativePath = normalized.replace(/^\/images\//, '');
  const absolutePath = ensureInsideRoot(path.join(IMAGES_DIR, relativePath));
  if (!absolutePath.startsWith(IMAGES_DIR)) return null;

  return {
    publicPath: normalized,
    relativePath,
    absolutePath
  };
}

function listSearchableProjectFiles(currentPath, result = []) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  const textExtensions = new Set([
    '.md', '.markdown', '.yml', '.yaml', '.json', '.js', '.cjs', '.mjs',
    '.ejs', '.njk', '.html', '.xml', '.txt', '.styl', '.css', '.scss'
  ]);
  const ignoredDirs = new Set(['.git', '.deploy_git', 'node_modules', 'public', 'source/images']);

  entries.forEach(entry => {
    const fullPath = path.join(currentPath, entry.name);
    const relative = toPosixPath(fullPath);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(relative) || ignoredDirs.has(entry.name)) return;
      listSearchableProjectFiles(fullPath, result);
      return;
    }

    if (textExtensions.has(path.extname(entry.name).toLowerCase())) {
      result.push(fullPath);
    }
  });

  return result;
}

function isImageReferencedElsewhere(publicPath, excludedFiles = []) {
  const excluded = new Set(excludedFiles.map(filePath => ensureInsideRoot(filePath)));
  const files = listSearchableProjectFiles(ROOT);

  return files.some(filePath => {
    if (excluded.has(filePath)) return false;
    return fs.readFileSync(filePath, 'utf8').includes(publicPath);
  });
}

function cleanupEmptyImageDirectories(startPath) {
  let currentPath = path.dirname(startPath);

  while (currentPath.startsWith(IMAGES_DIR) && currentPath !== IMAGES_DIR) {
    if (!fs.existsSync(currentPath) || !fs.statSync(currentPath).isDirectory()) break;
    if (fs.readdirSync(currentPath).length > 0) break;
    fs.rmdirSync(currentPath);
    currentPath = path.dirname(currentPath);
  }
}

function deletePostPair(key) {
  const normalizedKey = String(key || '').trim();
  if (!normalizedKey) {
    throw new Error('缺少要删除的文章标识。');
  }

  const zhPath = ensureInsideRoot(path.join(POSTS_DIR, `${normalizedKey}.zh-CN.md`));
  const enPath = ensureInsideRoot(path.join(POSTS_DIR, `${normalizedKey}.en.md`));
  const zhExists = fs.existsSync(zhPath);
  const enExists = fs.existsSync(enPath);

  if (!zhExists && !enExists) {
    throw new Error(`找不到文章：${normalizedKey}`);
  }

  const deletedRecord = readPostPair(normalizedKey, loadCategoryOptions());
  const deletedTitle = deletedRecord.zh.title || deletedRecord.en.title || normalizedKey;

  const referencedPhotos = Array.from(new Set([
    ...collectPostPhotoPaths(zhPath),
    ...collectPostPhotoPaths(enPath)
  ]));
  const deletedImages = [];
  const keptImages = [];

  if (zhExists) fs.unlinkSync(zhPath);
  if (enExists) fs.unlinkSync(enPath);

  referencedPhotos.forEach(publicPath => {
    const resolved = resolvePublicImagePath(publicPath);
    if (!resolved || !fs.existsSync(resolved.absolutePath)) {
      return;
    }

    if (isImageReferencedElsewhere(publicPath, [zhPath, enPath])) {
      keptImages.push(publicPath);
      return;
    }

    fs.unlinkSync(resolved.absolutePath);
    cleanupEmptyImageDirectories(resolved.absolutePath);
    deletedImages.push(publicPath);
  });

  return {
    deleted: normalizedKey,
    title: deletedTitle,
    deletedImages,
    keptImages
  };
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
  res.writeHead(200, {
    'Content-Type': `${contentType}; charset=utf-8`,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0'
  });
  res.end(fs.readFileSync(filePath, 'utf8'));
}

function serveProjectImage(res, pathname) {
  const relativePath = decodeURIComponent(pathname.replace(/^\/images\//, ''));
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
    const chunks = [];
    let totalLength = 0;
    req.on('data', chunk => {
      const nextChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(nextChunk);
      totalLength += nextChunk.length;
      if (totalLength > 60 * 1024 * 1024) {
        reject(new Error('请求体过大。'));
      }
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
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
        galleryFilters: loadGalleryFilterOptions(),
        pages: listPages()
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/session/open') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, markCmsSessionAlive(payload.sessionId || ''));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/session/heartbeat') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, markCmsSessionAlive(payload.sessionId || ''));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/session/close') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, closeCmsSession(payload.sessionId || ''));
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

    if (req.method === 'POST' && pathname === '/api/settings/test-llm') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, await testLlmConnection(payload));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/categories') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, addCategoryOption(payload));
      return;
    }

    if (req.method === 'PATCH' && pathname.startsWith('/api/categories/')) {
      const id = decodeURIComponent(pathname.replace('/api/categories/', ''));
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, updateCategoryOption(id, payload));
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/categories/') && pathname.endsWith('/update')) {
      const id = decodeURIComponent(pathname.replace('/api/categories/', '').replace(/\/update$/, ''));
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, updateCategoryOption(id, payload));
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/categories/')) {
      const id = decodeURIComponent(pathname.replace('/api/categories/', ''));
      jsonResponse(res, 200, deleteCategoryOption(id));
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/categories/') && pathname.endsWith('/delete')) {
      const id = decodeURIComponent(pathname.replace('/api/categories/', '').replace(/\/delete$/, ''));
      jsonResponse(res, 200, deleteCategoryOption(id));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/gallery-filters') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, addGalleryFilterOption(payload));
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/gallery-filters/') && pathname.endsWith('/update')) {
      const key = decodeURIComponent(pathname.replace('/api/gallery-filters/', '').replace(/\/update$/, ''));
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, updateGalleryFilterOption(key, payload));
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/gallery-filters/') && pathname.endsWith('/delete')) {
      const key = decodeURIComponent(pathname.replace('/api/gallery-filters/', '').replace(/\/delete$/, ''));
      jsonResponse(res, 200, deleteGalleryFilterOption(key));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/images/folders') {
      const payload = {
        folders: listImageFolders()
      };
      appendAuditLog(req, {
        entityType: 'image-folder',
        action: 'read',
        summary: `查看图片目录列表（${payload.folders.length} 个目录）`,
        target: 'source/images',
        details: {
          folderCount: payload.folders.length
        }
      });
      jsonResponse(res, 200, payload);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/images/library') {
      const payload = listImageLibrary(requestUrl.searchParams.get('folder') || '');
      appendAuditLog(req, {
        entityType: 'image',
        action: 'read',
        summary: `查看图片目录 ${payload.folder ? `images/${payload.folder}` : 'images/'}（${payload.items.length} 个文件）`,
        target: payload.folder ? `images/${payload.folder}` : 'images/',
        details: {
          folder: payload.folder,
          itemCount: payload.items.length
        }
      });
      jsonResponse(res, 200, payload);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/images/references') {
      const payload = getImageReferencePayload({
        publicPath: requestUrl.searchParams.get('path') || '',
        folder: requestUrl.searchParams.get('folder') || ''
      });
      appendAuditLog(req, {
        entityType: payload.kind === 'folder' ? 'image-folder' : 'image',
        action: 'read',
        summary: payload.kind === 'folder'
          ? `查看图片目录引用 images/${payload.folder}（${payload.referenceCount} 个文件）`
          : `查看图片引用 ${payload.path}（${payload.referenceCount} 个文件）`,
        target: payload.kind === 'folder' ? `images/${payload.folder}` : payload.path,
        details: {
          kind: payload.kind,
          referenceCount: payload.referenceCount,
          matchCount: payload.matchCount,
          references: payload.references
        }
      });
      jsonResponse(res, 200, payload);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/folders') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = createImageFolder(payload.folder);
      appendAuditLog(req, {
        entityType: 'image-folder',
        action: 'create',
        summary: `创建图片目录 ${result.folder ? `images/${result.folder}` : 'images/'}`,
        target: result.folder ? `images/${result.folder}` : 'images/',
        details: {
          folder: result.folder
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'PATCH' && pathname === '/api/images/folders') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = renameImageFolder(payload.currentFolder, payload.nextFolder);
      appendAuditLog(req, {
        entityType: 'image-folder',
        action: 'update',
        summary: `重命名图片目录 images/${payload.currentFolder} -> images/${result.folder}`,
        target: result.folder ? `images/${result.folder}` : 'images/',
        details: {
          previousFolder: String(payload.currentFolder || '').trim(),
          nextFolder: result.folder,
          replacementCount: result.replacementCount,
          updatedFiles: result.updatedFiles
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/folders/rename') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = renameImageFolder(payload.currentFolder, payload.nextFolder);
      appendAuditLog(req, {
        entityType: 'image-folder',
        action: 'update',
        summary: `重命名图片目录 images/${payload.currentFolder} -> images/${result.folder}`,
        target: result.folder ? `images/${result.folder}` : 'images/',
        details: {
          previousFolder: String(payload.currentFolder || '').trim(),
          nextFolder: result.folder,
          replacementCount: result.replacementCount,
          updatedFiles: result.updatedFiles
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'DELETE' && pathname === '/api/images/folders') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = deleteImageFolder(payload.folder, {
        force: Boolean(payload.force)
      });
      appendAuditLog(req, {
        entityType: 'image-folder',
        action: 'delete',
        summary: `删除图片目录 images/${result.deleted}`,
        target: `images/${result.deleted}`,
        details: {
          folder: result.deleted,
          force: result.forced,
          referenceCount: result.referenceCount
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/folders/delete') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = deleteImageFolder(payload.folder, {
        force: Boolean(payload.force)
      });
      appendAuditLog(req, {
        entityType: 'image-folder',
        action: 'delete',
        summary: `删除图片目录 images/${result.deleted}`,
        target: `images/${result.deleted}`,
        details: {
          folder: result.deleted,
          force: result.forced,
          referenceCount: result.referenceCount
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/upload') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = uploadImageFiles(payload.folder, payload.files);
      appendAuditLog(req, {
        entityType: 'image',
        action: 'create',
        summary: `上传 ${(result.uploaded || []).length} 张图片到 ${result.folder ? `images/${result.folder}` : 'images/'}`,
        target: result.folder ? `images/${result.folder}` : 'images/',
        details: {
          folder: result.folder,
          uploaded: (result.uploaded || []).map(item => item.path)
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/normalize-filenames') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = normalizeImageFilenamesInFolder(payload.folder || '', {
        mode: payload.mode || 'sanitize',
        baseName: payload.baseName || ''
      });
      appendAuditLog(req, {
        entityType: 'image',
        action: 'update',
        summary: `规范化图片文件名 ${result.renamedCount} 个，目录 ${result.folder ? `images/${result.folder}` : 'images/'}`,
        target: result.folder ? `images/${result.folder}` : 'images/',
        details: {
          folder: result.folder,
          renamed: result.renamed,
          replacementCount: result.replacementCount,
          updatedFiles: result.updatedFiles
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/move') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = moveImageFile(payload.path, payload.folder, payload.name);
      appendAuditLog(req, {
        entityType: 'image',
        action: 'update',
        summary: `移动图片 ${result.previousPath} -> ${result.path}`,
        target: result.path,
        details: {
          previousPath: result.previousPath,
          path: result.path,
          folder: result.folder,
          replacementCount: result.replacementCount,
          updatedFiles: result.updatedFiles
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/images/delete') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const result = deleteImageFile(payload.path, {
        force: Boolean(payload.force)
      });
      appendAuditLog(req, {
        entityType: 'image',
        action: 'delete',
        summary: `删除图片 ${result.deleted}`,
        target: result.deleted,
        details: {
          path: result.deleted,
          folder: result.folder,
          force: result.forced,
          referenceCount: result.referenceCount
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/format/zh') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, await formatChineseDraftWithLlm(payload));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/gallery/translate-en') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, await translateGalleryAlbumToEnglish(payload));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/translate/en') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, await translateChineseDraftToEnglish(payload));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/preview/markdown') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      jsonResponse(res, 200, {
        html: renderMarkdownPreview(payload.markdown, payload.sourcePath)
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/commands') {
      jsonResponse(res, 200, serializeCommandState());
      return;
    }

    if (req.method === 'GET' && pathname === '/api/posts') {
      const payload = {
        items: listPostPairs(categoryOptions)
      };
      appendAuditLog(req, {
        entityType: 'post',
        action: 'read',
        summary: `查看文章列表（${payload.items.length} 篇）`,
        target: 'source/_posts',
        details: {
          itemCount: payload.items.length
        }
      });
      jsonResponse(res, 200, payload);
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/api/posts/')) {
      const key = decodeURIComponent(pathname.replace('/api/posts/', ''));
      const result = readPostPair(key, categoryOptions);
      appendAuditLog(req, {
        entityType: 'post',
        action: 'read',
        summary: `查看文章《${result.zh.title || result.en.title || result.key}》`,
        target: result.key,
        details: {
          key: result.key,
          titleZh: result.zh.title || '',
          titleEn: result.en.title || '',
          sourceFiles: result.sourceFiles
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/posts') {
      const body = await collectBody(req);
      const payload = JSON.parse(body || '{}');
      const isUpdate = Boolean(String(payload.key || '').trim());
      const result = writePostFiles(payload, categoryOptions);
      appendAuditLog(req, {
        entityType: 'post',
        action: isUpdate ? 'update' : 'create',
        summary: `${isUpdate ? '更新' : '创建'}文章《${result.zh.title || result.en.title || result.key}》`,
        target: result.key,
        details: {
          key: result.key,
          previousKey: String(payload.key || '').trim(),
          titleZh: result.zh.title || '',
          titleEn: result.en.title || '',
          slug: result.common.slug || '',
          sourceFiles: result.sourceFiles,
          photoCount: normalizePhotoList(result.common.photos).length
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/posts/')) {
      const key = decodeURIComponent(pathname.replace('/api/posts/', ''));
      const result = deletePostPair(key);
      appendAuditLog(req, {
        entityType: 'post',
        action: 'delete',
        summary: `删除文章《${result.title || result.deleted}》`,
        target: result.deleted,
        details: {
          key: result.deleted,
          title: result.title || '',
          deletedImages: result.deletedImages || [],
          keptImages: result.keptImages || []
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/posts/') && pathname.endsWith('/delete')) {
      const key = decodeURIComponent(pathname.replace('/api/posts/', '').replace(/\/delete$/, ''));
      const result = deletePostPair(key);
      appendAuditLog(req, {
        entityType: 'post',
        action: 'delete',
        summary: `删除文章《${result.title || result.deleted}》`,
        target: result.deleted,
        details: {
          key: result.deleted,
          title: result.title || '',
          deletedImages: result.deletedImages || [],
          keptImages: result.keptImages || []
        }
      });
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/audit-logs') {
      jsonResponse(res, 200, readAuditLogs({
        entityType: requestUrl.searchParams.get('entityType') || '',
        action: requestUrl.searchParams.get('action') || '',
        limit: requestUrl.searchParams.get('limit') || '120'
      }));
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
        await startHexoServer();
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
  listImageLibrary,
  normalizeImageFilenamesInFolder,
  readGalleryAlbumBySlug,
  writeGalleryAlbum,
  syncGalleryDataFile,
  writePostFiles,
  deletePostPair,
  deleteImageFile,
  renderMarkdownPreview
};
