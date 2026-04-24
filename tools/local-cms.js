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
const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const STATIC_DIR = path.join(ROOT, 'tools', 'local-cms');
const CONFIG_PATH = path.join(ROOT, '_config.yml');

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

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    req.on('data', chunk => {
      buffer += chunk;
      if (buffer.length > 5 * 1024 * 1024) {
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
