'use strict';

const CUSTOM_CATEGORY_VALUE = '__custom__';
const GALLERY_PAGE_IDS = new Set(['gallery-zh', 'gallery-en']);

const state = {
  mode: 'posts',
  meta: { categories: [], pages: [] },
  posts: [],
  pages: [],
  gallery: {
    items: [],
    selectedSlug: '',
    currentAlbum: null
  },
  imageFolders: [],
  settings: {
    llm: {
      endpoint: '',
      apiKey: '',
      model: '',
      temperature: 0.2,
      prompt: ''
    }
  },
  selectedId: '',
  currentRecord: null,
  commands: {
    currentTask: null,
    currentTaskLog: '',
    lastTask: null,
    server: {
      running: false,
      startedAt: '',
      pid: null,
      url: 'http://127.0.0.1:4000/',
      log: ''
    }
  },
  panels: {
    commandsExpanded: true,
    llmExpanded: true
  }
};

const elements = {
  listPanel: document.querySelector('#list-panel'),
  searchInput: document.querySelector('#search-input'),
  saveButton: document.querySelector('#save-button'),
  refreshButton: document.querySelector('#refresh-button'),
  newPostButton: document.querySelector('#new-post-button'),
  saveLlmButton: document.querySelector('#save-llm-button'),
  formatZhButton: document.querySelector('#format-zh-button'),
  uploadImageButton: document.querySelector('#upload-image-button'),
  createImageFolderButton: document.querySelector('#create-image-folder-button'),
  addCategoryPresetButton: document.querySelector('#add-category-preset-button'),
  statusBar: document.querySelector('#status-bar'),
  toggleCommandPanelButton: document.querySelector('#toggle-command-panel'),
  toggleLlmPanelButton: document.querySelector('#toggle-llm-panel'),
  commandButtons: Array.from(document.querySelectorAll('[data-command]')),
  commandCurrentTask: document.querySelector('#command-current-task'),
  commandCurrentMeta: document.querySelector('#command-current-meta'),
  commandServerStatus: document.querySelector('#command-server-status'),
  commandServerMeta: document.querySelector('#command-server-meta'),
  commandLastTask: document.querySelector('#command-last-task'),
  commandLastMeta: document.querySelector('#command-last-meta'),
  commandLog: document.querySelector('#command-log'),
  commandPreviewLink: document.querySelector('#command-preview-link'),
  commandPanelBody: document.querySelector('#command-panel-body'),
  llmPanelBody: document.querySelector('#llm-panel-body'),
  postCommandPanel: document.querySelector('#post-command-panel'),
  postLlmPanel: document.querySelector('#post-llm-panel'),
  llm: {
    endpoint: document.querySelector('#llm-endpoint'),
    apiKey: document.querySelector('#llm-api-key'),
    model: document.querySelector('#llm-model'),
    temperature: document.querySelector('#llm-temperature'),
    prompt: document.querySelector('#llm-prompt')
  },
  workspaceKicker: document.querySelector('#workspace-kicker'),
  workspaceTitle: document.querySelector('#workspace-title'),
  postEditor: document.querySelector('#post-editor'),
  pageEditor: document.querySelector('#page-editor'),
  galleryManager: document.querySelector('#gallery-manager'),
  post: {
    date: document.querySelector('#post-date'),
    slug: document.querySelector('#post-slug'),
    toc: document.querySelector('#post-toc'),
    category: document.querySelector('#post-category'),
    categoryCustomPanel: document.querySelector('#post-category-custom-panel'),
    categoryCustomZh: document.querySelector('#post-category-custom-zh'),
    categoryCustomEn: document.querySelector('#post-category-custom-en'),
    photos: document.querySelector('#post-photos'),
    imageFolderSelect: document.querySelector('#image-folder-select'),
    imageNewFolder: document.querySelector('#image-new-folder'),
    imageDropzone: document.querySelector('#image-dropzone'),
    imageDropzoneMeta: document.querySelector('#image-dropzone-meta'),
    imageFileInput: document.querySelector('#image-file-input'),
    zhFile: document.querySelector('#post-zh-file'),
    zhTitle: document.querySelector('#post-zh-title'),
    zhDescription: document.querySelector('#post-zh-description'),
    zhTags: document.querySelector('#post-zh-tags'),
    zhBody: document.querySelector('#post-zh-body'),
    enFile: document.querySelector('#post-en-file'),
    enTitle: document.querySelector('#post-en-title'),
    enDescription: document.querySelector('#post-en-description'),
    enTags: document.querySelector('#post-en-tags'),
    enBody: document.querySelector('#post-en-body')
  },
  page: {
    title: document.querySelector('#page-title'),
    date: document.querySelector('#page-date'),
    lang: document.querySelector('#page-lang'),
    comments: document.querySelector('#page-comments'),
    toc: document.querySelector('#page-toc'),
    extra: document.querySelector('#page-extra'),
    body: document.querySelector('#page-body'),
    file: document.querySelector('#page-file')
  },
  gallery: {
    refreshButton: document.querySelector('#refresh-gallery-button'),
    newAlbumButton: document.querySelector('#new-gallery-album-button'),
    saveButton: document.querySelector('#save-gallery-button'),
    albumList: document.querySelector('#gallery-album-list'),
    slug: document.querySelector('#gallery-slug'),
    file: document.querySelector('#gallery-file'),
    langZh: document.querySelector('#gallery-lang-zh'),
    langEn: document.querySelector('#gallery-lang-en'),
    titleZh: document.querySelector('#gallery-title-zh'),
    titleEn: document.querySelector('#gallery-title-en'),
    periodZh: document.querySelector('#gallery-period-zh'),
    periodEn: document.querySelector('#gallery-period-en'),
    locationZh: document.querySelector('#gallery-location-zh'),
    locationEn: document.querySelector('#gallery-location-en'),
    cameraZh: document.querySelector('#gallery-camera-zh'),
    cameraEn: document.querySelector('#gallery-camera-en'),
    tagsZh: document.querySelector('#gallery-tags-zh'),
    tagsEn: document.querySelector('#gallery-tags-en'),
    descriptionZh: document.querySelector('#gallery-description-zh'),
    descriptionEn: document.querySelector('#gallery-description-en'),
    addPhotoButton: document.querySelector('#gallery-add-photo-button'),
    photoList: document.querySelector('#gallery-photo-list'),
    uploadImageButton: document.querySelector('#gallery-upload-image-button'),
    imageFolderSelect: document.querySelector('#gallery-image-folder-select'),
    imageNewFolder: document.querySelector('#gallery-image-new-folder'),
    createImageFolderButton: document.querySelector('#gallery-create-image-folder-button'),
    imageDropzone: document.querySelector('#gallery-image-dropzone'),
    imageDropzoneMeta: document.querySelector('#gallery-image-dropzone-meta'),
    imageFileInput: document.querySelector('#gallery-image-file-input')
  }
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || '请求失败');
  }
  return payload;
}

function setStatus(message, tone = '') {
  elements.statusBar.textContent = message;
  elements.statusBar.className = `status-bar${tone ? ` is-${tone}` : ''}`;
}

function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function renderCommandPanel() {
  const commands = state.commands || {};
  const currentTask = commands.currentTask;
  const lastTask = commands.lastTask;
  const server = commands.server || {};
  const log = currentTask ? commands.currentTaskLog : (server.running ? server.log : ((lastTask && lastTask.log) || server.log || ''));

  elements.commandCurrentTask.textContent = currentTask ? currentTask.label : '空闲';
  elements.commandCurrentMeta.textContent = currentTask
    ? `开始于 ${formatTimestamp(currentTask.startedAt)}`
    : '没有任务在运行';

  elements.commandServerStatus.textContent = server.running ? '运行中' : '未启动';
  elements.commandServerMeta.textContent = server.running
    ? `${server.url} · PID ${server.pid || '-'}`
    : (server.url || '127.0.0.1:4000');

  elements.commandLastTask.textContent = lastTask
    ? `${lastTask.label} · ${lastTask.status === 'success' ? '成功' : '失败'}`
    : '暂无记录';
  elements.commandLastMeta.textContent = lastTask
    ? `${formatTimestamp(lastTask.finishedAt)} · 退出码 ${lastTask.exitCode}`
    : '等待第一次执行';

  elements.commandLog.value = log || '暂无日志。';
  elements.commandPreviewLink.href = server.url || 'http://127.0.0.1:4000/';
  elements.commandPreviewLink.classList.toggle('is-disabled', !server.running);

  elements.commandButtons.forEach(button => {
    const name = button.dataset.command;
    const disabledByTask = Boolean(currentTask) && name !== 'stop-serve';
    const disabledByServer = (name === 'serve' && server.running) || (name === 'stop-serve' && !server.running);
    button.disabled = disabledByTask || disabledByServer;
  });
}

function renderPanelVisibility() {
  elements.commandPanelBody.classList.toggle('panel-body-collapsed', !state.panels.commandsExpanded);
  elements.llmPanelBody.classList.toggle('panel-body-collapsed', !state.panels.llmExpanded);
  elements.toggleCommandPanelButton.textContent = state.panels.commandsExpanded ? '隐藏' : '显示';
  elements.toggleLlmPanelButton.textContent = state.panels.llmExpanded ? '隐藏' : '显示';
  elements.toggleCommandPanelButton.setAttribute('aria-expanded', String(state.panels.commandsExpanded));
  elements.toggleLlmPanelButton.setAttribute('aria-expanded', String(state.panels.llmExpanded));
}

function renderWorkspaceSections() {
  elements.postCommandPanel.hidden = false;
  elements.postLlmPanel.hidden = false;
}

function isGalleryPageRecord(record) {
  return Boolean(record && record.id && GALLERY_PAGE_IDS.has(record.id));
}

function updatePrimarySaveButtonLabel() {
  if (state.mode === 'posts') {
    elements.saveButton.textContent = '保存文章';
    return;
  }

  if (isGalleryPageRecord(state.currentRecord)) {
    elements.saveButton.textContent = '保存页面介绍';
    return;
  }

  elements.saveButton.textContent = '保存页面';
}

function normalizeCommaList(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function createEmptyGalleryAlbum() {
  return {
    kind: 'gallery-album',
    slug: '',
    sourceSlug: '',
    file: '',
    languages: ['zh-CN', 'en'],
    title: { 'zh-CN': '', en: '' },
    period: { 'zh-CN': '', en: '' },
    location: { 'zh-CN': '', en: '' },
    camera: { 'zh-CN': '', en: '' },
    description: { 'zh-CN': '', en: '' },
    tags: { 'zh-CN': [], en: [] },
    photos: []
  };
}

function renderCategoryOptions() {
  const options = ['<option value="">请选择分类</option>']
    .concat(state.meta.categories.map(item => {
      return `<option value="${item.id}">${item.zh} / ${item.en}</option>`;
    }))
    .concat(`<option value="${CUSTOM_CATEGORY_VALUE}">自定义分类</option>`);

  elements.post.category.innerHTML = options.join('');
  syncCategoryPresetButtonState();
}

function renderImageFolders() {
  const options = state.imageFolders.map(folder => {
    const label = folder ? `images/${folder}` : 'images/';
    return `<option value="${escapeHtml(folder)}">${escapeHtml(label)}</option>`;
  });

  const html = options.join('');
  elements.post.imageFolderSelect.innerHTML = html;
  elements.gallery.imageFolderSelect.innerHTML = html;
}

function fillLlmSettings() {
  const llm = state.settings.llm || {};
  elements.llm.endpoint.value = llm.endpoint || '';
  elements.llm.apiKey.value = llm.apiKey || '';
  elements.llm.model.value = llm.model || '';
  elements.llm.temperature.value = String(llm.temperature ?? 0.2);
  elements.llm.prompt.value = llm.prompt || '';
}

function formatPostListTitle(item) {
  return item.titleZh || item.titleEn || item.key;
}

function formatPostListSubtitle(item) {
  const parts = [];
  if (item.titleZh && item.titleEn) parts.push(item.titleEn);
  const categoryLabel = getPostCategoryLabel(item);
  if (categoryLabel) parts.push(categoryLabel);
  return parts.join(' · ');
}

function getPostCategoryLabel(item) {
  if (item.categoryId) {
    const category = state.meta.categories.find(option => option.id === item.categoryId);
    if (category) return `${category.zh} / ${category.en}`;
  }

  if (item.categoryZh || item.categoryEn) {
    return [item.categoryZh, item.categoryEn].filter(Boolean).join(' / ');
  }

  return '';
}

function syncCategoryPresetButtonState() {
  const isCustom = elements.post.category.value === CUSTOM_CATEGORY_VALUE;
  const hasRequiredNames = Boolean(
    elements.post.categoryCustomZh.value.trim() &&
    elements.post.categoryCustomEn.value.trim()
  );
  elements.addCategoryPresetButton.disabled = !isCustom || !hasRequiredNames;
}

function updateCategoryCustomPanel() {
  const isCustom = elements.post.category.value === CUSTOM_CATEGORY_VALUE;
  elements.post.categoryCustomPanel.hidden = !isCustom;
  syncCategoryPresetButtonState();
}

function setCategoryFormValue(record) {
  const categoryId = record.common.categoryId || '';
  const hasPreset = Boolean(
    categoryId &&
    state.meta.categories.some(item => item.id === categoryId)
  );

  if (hasPreset) {
    elements.post.category.value = categoryId;
    elements.post.categoryCustomZh.value = '';
    elements.post.categoryCustomEn.value = '';
  } else if (record.common.categoryCustomZh || record.common.categoryCustomEn) {
    elements.post.category.value = CUSTOM_CATEGORY_VALUE;
    elements.post.categoryCustomZh.value = record.common.categoryCustomZh || '';
    elements.post.categoryCustomEn.value = record.common.categoryCustomEn || '';
  } else {
    elements.post.category.value = '';
    elements.post.categoryCustomZh.value = '';
    elements.post.categoryCustomEn.value = '';
  }

  updateCategoryCustomPanel();
}

function getFilteredItems() {
  const keyword = elements.searchInput.value.trim().toLowerCase();
  const items = state.mode === 'posts' ? state.posts : state.pages;
  if (!keyword) return items;

  return items.filter(item => {
    const raw = state.mode === 'posts'
      ? [item.key, item.titleZh, item.titleEn, item.sourceFiles.zh, item.sourceFiles.en]
      : [item.id, item.label, item.file];

    return raw.filter(Boolean).some(value => String(value).toLowerCase().includes(keyword));
  });
}

function renderList() {
  const items = getFilteredItems();
  if (!items.length) {
    elements.listPanel.innerHTML = '<div class="list-item"><div class="list-title">没有匹配结果</div></div>';
    return;
  }

  const html = items.map(item => {
    const isActive = item.key === state.selectedId || item.id === state.selectedId;
    if (state.mode === 'posts') {
      return `
        <button class="list-item${isActive ? ' is-active' : ''}" type="button" data-item-id="${item.key}">
          <div class="list-title">${escapeHtml(formatPostListTitle(item))}</div>
          <div class="list-subtitle">${escapeHtml(formatPostListSubtitle(item))}</div>
          <div class="list-meta">
            <span>${escapeHtml(item.date || '')}</span>
            <span>${escapeHtml(item.status || '')}</span>
          </div>
        </button>
      `;
    }

    return `
      <button class="list-item${isActive ? ' is-active' : ''}" type="button" data-item-id="${item.id}">
        <div class="list-title">${escapeHtml(item.label)}</div>
        <div class="list-subtitle">${escapeHtml(item.file)}</div>
      </button>
    `;
  }).join('');

  elements.listPanel.innerHTML = html;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyMode(mode) {
  state.mode = mode;
  state.selectedId = '';
  state.currentRecord = null;
  state.gallery.selectedSlug = '';
  state.gallery.currentAlbum = null;

  document.querySelectorAll('.mode-button').forEach(button => {
    button.classList.toggle('is-active', button.dataset.mode === mode);
  });

  elements.newPostButton.hidden = mode !== 'posts';
  elements.postEditor.hidden = true;
  elements.pageEditor.hidden = true;
  elements.galleryManager.hidden = true;
  elements.workspaceKicker.textContent = mode === 'posts' ? '文章编辑器' : '页面编辑器';
  elements.workspaceTitle.textContent = mode === 'posts' ? '请选择文章' : '请选择页面';
  updatePrimarySaveButtonLabel();
  renderWorkspaceSections();
  renderList();
}

function fillPostEditor(record) {
  renderWorkspaceSections();
  elements.postEditor.hidden = false;
  elements.pageEditor.hidden = true;
  elements.galleryManager.hidden = true;
  elements.workspaceTitle.textContent = record.zh.title || record.en.title || record.key || '新文章';
  updatePrimarySaveButtonLabel();

  elements.post.date.value = record.common.date || '保存后自动生成';
  elements.post.slug.value = record.common.slug || '';
  elements.post.toc.checked = Boolean(record.common.toc);
  setCategoryFormValue(record);
  elements.post.photos.value = record.common.photos || '';
  elements.post.zhFile.textContent = record.sourceFiles.zh || '新建后生成';
  elements.post.zhTitle.value = record.zh.title || '';
  elements.post.zhDescription.value = record.zh.description || '';
  elements.post.zhTags.value = record.zh.tags || '';
  elements.post.zhBody.value = record.zh.body || '';
  elements.post.enFile.textContent = record.sourceFiles.en || '新建后生成';
  elements.post.enTitle.value = record.en.title || '';
  elements.post.enDescription.value = record.en.description || '';
  elements.post.enTags.value = record.en.tags || '';
  elements.post.enBody.value = record.en.body || '';

  const inferredFolder = inferImageFolder(record);
  if (state.imageFolders.includes(inferredFolder)) {
    elements.post.imageFolderSelect.value = inferredFolder;
  } else {
    elements.post.imageFolderSelect.value = '';
  }
}

function fillPageEditor(record) {
  renderWorkspaceSections();
  elements.pageEditor.hidden = false;
  elements.postEditor.hidden = true;
  elements.galleryManager.hidden = !isGalleryPageRecord(record);
  elements.workspaceTitle.textContent = record.label;
  updatePrimarySaveButtonLabel();

  elements.page.title.value = record.title || '';
  elements.page.date.value = record.date || '保存后自动生成';
  elements.page.lang.value = record.lang || '';
  elements.page.comments.checked = Boolean(record.comments);
  elements.page.toc.checked = Boolean(record.toc);
  elements.page.extra.value = record.extraYaml || '';
  elements.page.body.value = record.body || '';
  elements.page.file.textContent = record.file || '';
}

function formatGalleryAlbumTitle(item) {
  return item.titleZh || item.titleEn || item.slug || '未命名相册';
}

function formatGalleryAlbumSubtitle(item) {
  const parts = [item.titleEn, item.periodZh || item.periodEn, item.locationZh || item.locationEn]
    .filter(Boolean);
  return parts.join(' · ');
}

function renderGalleryAlbumList() {
  const items = state.gallery.items || [];
  if (!items.length) {
    elements.gallery.albumList.innerHTML = '<div class="gallery-empty-state">还没有相册，点右上角“新建相册”开始。</div>';
    return;
  }

  elements.gallery.albumList.innerHTML = items.map(item => {
    const isActive = item.slug === state.gallery.selectedSlug;
    return `
      <button class="gallery-album-item${isActive ? ' is-active' : ''}" type="button" data-gallery-slug="${escapeHtml(item.slug)}">
        <div class="gallery-album-item-head">
          <strong>${escapeHtml(formatGalleryAlbumTitle(item))}</strong>
          <span>${item.photoCount || 0} 张</span>
        </div>
        <div class="gallery-album-item-subtitle">${escapeHtml(formatGalleryAlbumSubtitle(item))}</div>
        <div class="gallery-album-item-meta">${escapeHtml(item.slug)}</div>
      </button>
    `;
  }).join('');
}

function renderGalleryPhotoList() {
  const album = state.gallery.currentAlbum || createEmptyGalleryAlbum();
  const photos = album.photos || [];

  if (!photos.length) {
    elements.gallery.photoList.innerHTML = '<div class="gallery-empty-state">当前相册还没有照片。可以上传图片，或者先新增一张手动填写。</div>';
    return;
  }

  elements.gallery.photoList.innerHTML = photos.map((photo, index) => {
    const preview = photo.src
      ? `<img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.title['zh-CN'] || photo.title.en || `photo-${index + 1}`)}">`
      : '<div class="gallery-photo-placeholder">暂无预览</div>';

    return `
      <article class="gallery-photo-card" data-photo-index="${index}">
        <div class="gallery-photo-preview">${preview}</div>
        <div class="gallery-photo-fields">
          <div class="gallery-photo-toolbar">
            <strong>照片 ${index + 1}</strong>
            <div class="gallery-photo-actions">
              <button class="ghost-button" type="button" data-gallery-photo-action="up" data-photo-index="${index}" ${index === 0 ? 'disabled' : ''}>上移</button>
              <button class="ghost-button" type="button" data-gallery-photo-action="down" data-photo-index="${index}" ${index === photos.length - 1 ? 'disabled' : ''}>下移</button>
              <button class="ghost-button" type="button" data-gallery-photo-action="remove" data-photo-index="${index}">删除</button>
            </div>
          </div>
          <label>
            <span>图片路径</span>
            <input type="text" data-gallery-field="src" data-photo-index="${index}" value="${escapeHtml(photo.src)}" placeholder="/images/gallery/example/cover.jpg">
          </label>
          <div class="gallery-photo-grid">
            <label>
              <span>中文标题</span>
              <input type="text" data-gallery-field="title-zh" data-photo-index="${index}" value="${escapeHtml(photo.title['zh-CN'])}">
            </label>
            <label>
              <span>English Title</span>
              <input type="text" data-gallery-field="title-en" data-photo-index="${index}" value="${escapeHtml(photo.title.en)}">
            </label>
          </div>
          <div class="gallery-photo-grid">
            <label>
              <span>中文说明</span>
              <textarea rows="3" data-gallery-field="caption-zh" data-photo-index="${index}">${escapeHtml(photo.caption['zh-CN'])}</textarea>
            </label>
            <label>
              <span>English Caption</span>
              <textarea rows="3" data-gallery-field="caption-en" data-photo-index="${index}">${escapeHtml(photo.caption.en)}</textarea>
            </label>
          </div>
          <label>
            <span>拍摄信息 / Meta</span>
            <input type="text" data-gallery-field="meta" data-photo-index="${index}" value="${escapeHtml(photo.meta || '')}">
          </label>
        </div>
      </article>
    `;
  }).join('');
}

function inferGalleryImageFolder(album) {
  const firstPhoto = album && album.photos && album.photos[0] ? String(album.photos[0].src || '').trim() : '';
  if (firstPhoto.startsWith('/images/')) {
    const rest = firstPhoto.replace(/^\/images\//, '');
    const segments = rest.split('/');
    segments.pop();
    return segments.join('/');
  }
  return '';
}

function fillGalleryEditor(album) {
  const nextAlbum = album || createEmptyGalleryAlbum();
  state.gallery.currentAlbum = nextAlbum;
  state.gallery.selectedSlug = nextAlbum.sourceSlug || nextAlbum.slug || '';

  elements.gallery.slug.value = nextAlbum.slug || '';
  elements.gallery.file.textContent = nextAlbum.file || '新建后生成';
  elements.gallery.langZh.checked = (nextAlbum.languages || []).includes('zh-CN');
  elements.gallery.langEn.checked = (nextAlbum.languages || []).includes('en');
  elements.gallery.titleZh.value = nextAlbum.title['zh-CN'] || '';
  elements.gallery.titleEn.value = nextAlbum.title.en || '';
  elements.gallery.periodZh.value = nextAlbum.period['zh-CN'] || '';
  elements.gallery.periodEn.value = nextAlbum.period.en || '';
  elements.gallery.locationZh.value = nextAlbum.location['zh-CN'] || '';
  elements.gallery.locationEn.value = nextAlbum.location.en || '';
  elements.gallery.cameraZh.value = nextAlbum.camera['zh-CN'] || '';
  elements.gallery.cameraEn.value = nextAlbum.camera.en || '';
  elements.gallery.tagsZh.value = (nextAlbum.tags['zh-CN'] || []).join(', ');
  elements.gallery.tagsEn.value = (nextAlbum.tags.en || []).join(', ');
  elements.gallery.descriptionZh.value = nextAlbum.description['zh-CN'] || '';
  elements.gallery.descriptionEn.value = nextAlbum.description.en || '';

  const folder = inferGalleryImageFolder(nextAlbum);
  elements.gallery.imageFolderSelect.value = state.imageFolders.includes(folder) ? folder : '';
  renderGalleryAlbumList();
  renderGalleryPhotoList();
}

function syncGalleryDraftFromForm() {
  if (!state.gallery.currentAlbum || elements.galleryManager.hidden) {
    return state.gallery.currentAlbum;
  }

  const photoIndexes = Array.from(elements.gallery.photoList.querySelectorAll('[data-photo-index]'))
    .map(node => Number(node.dataset.photoIndex))
    .filter(index => Number.isInteger(index));

  const uniqueIndexes = Array.from(new Set(photoIndexes)).sort((left, right) => left - right);
  const photos = uniqueIndexes.map(index => ({
    src: elements.gallery.photoList.querySelector(`[data-gallery-field="src"][data-photo-index="${index}"]`)?.value.trim() || '',
    title: {
      'zh-CN': elements.gallery.photoList.querySelector(`[data-gallery-field="title-zh"][data-photo-index="${index}"]`)?.value.trim() || '',
      en: elements.gallery.photoList.querySelector(`[data-gallery-field="title-en"][data-photo-index="${index}"]`)?.value.trim() || ''
    },
    caption: {
      'zh-CN': elements.gallery.photoList.querySelector(`[data-gallery-field="caption-zh"][data-photo-index="${index}"]`)?.value.trim() || '',
      en: elements.gallery.photoList.querySelector(`[data-gallery-field="caption-en"][data-photo-index="${index}"]`)?.value.trim() || ''
    },
    meta: elements.gallery.photoList.querySelector(`[data-gallery-field="meta"][data-photo-index="${index}"]`)?.value.trim() || ''
  }));

  state.gallery.currentAlbum = {
    ...state.gallery.currentAlbum,
    slug: elements.gallery.slug.value.trim(),
    languages: [
      elements.gallery.langZh.checked ? 'zh-CN' : '',
      elements.gallery.langEn.checked ? 'en' : ''
    ].filter(Boolean),
    title: {
      'zh-CN': elements.gallery.titleZh.value.trim(),
      en: elements.gallery.titleEn.value.trim()
    },
    period: {
      'zh-CN': elements.gallery.periodZh.value.trim(),
      en: elements.gallery.periodEn.value.trim()
    },
    location: {
      'zh-CN': elements.gallery.locationZh.value.trim(),
      en: elements.gallery.locationEn.value.trim()
    },
    camera: {
      'zh-CN': elements.gallery.cameraZh.value.trim(),
      en: elements.gallery.cameraEn.value.trim()
    },
    description: {
      'zh-CN': elements.gallery.descriptionZh.value.trim(),
      en: elements.gallery.descriptionEn.value.trim()
    },
    tags: {
      'zh-CN': normalizeCommaList(elements.gallery.tagsZh.value),
      en: normalizeCommaList(elements.gallery.tagsEn.value)
    },
    photos
  };

  return state.gallery.currentAlbum;
}

function inferImageFolder(record) {
  const firstPhoto = String(record && record.common && record.common.photos || '')
    .split(/\r?\n/)
    .map(item => item.trim())
    .find(Boolean);

  if (firstPhoto && firstPhoto.startsWith('/images/')) {
    const rest = firstPhoto.replace(/^\/images\//, '');
    const parts = rest.split('/');
    parts.pop();
    return parts.join('/');
  }

  return '';
}

function appendPhotoPaths(paths) {
  const existing = elements.post.photos.value
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
  const next = existing.slice();

  paths.forEach(item => {
    if (!next.includes(item)) next.push(item);
  });

  elements.post.photos.value = next.join('\n');
}

async function loadMeta() {
  state.meta = await request('/api/meta');
  state.pages = state.meta.pages;
  renderCategoryOptions();
}

async function loadSettings() {
  state.settings = await request('/api/settings');
  fillLlmSettings();
}

async function loadImageFolders() {
  const payload = await request('/api/images/folders');
  state.imageFolders = payload.folders || [''];
  renderImageFolders();
}

async function loadCommands() {
  state.commands = await request('/api/commands');
  renderCommandPanel();
}

async function loadPosts(selectFirst = false) {
  const payload = await request('/api/posts');
  state.posts = payload.items;
  renderList();

  if (selectFirst && state.posts.length) {
    await selectItem(state.posts[0].key);
  }
}

async function loadGallery(selectFirst = false, preferredSlug = '') {
  const payload = await request('/api/gallery');
  state.gallery.items = payload.items || [];
  renderGalleryAlbumList();

  if (!state.gallery.items.length) {
    fillGalleryEditor(createEmptyGalleryAlbum());
    return;
  }

  const targetSlug = preferredSlug
    || state.gallery.selectedSlug
    || (selectFirst ? state.gallery.items[0].slug : '');

  if (targetSlug) {
    await selectGalleryAlbum(targetSlug);
  }
}

async function selectItem(id) {
  state.selectedId = id;
  renderList();

  if (state.mode === 'posts') {
    const record = await request(`/api/posts/${encodeURIComponent(id)}`);
    state.currentRecord = record;
    fillPostEditor(record);
  } else {
    const record = await request(`/api/pages/${encodeURIComponent(id)}`);
    state.currentRecord = record;
    fillPageEditor(record);
    if (isGalleryPageRecord(record)) {
      await loadGallery(true);
    }
  }
}

async function selectGalleryAlbum(slug) {
  const record = await request(`/api/gallery/${encodeURIComponent(slug)}`);
  fillGalleryEditor(record);
}

function buildPostPayload() {
  const isCustomCategory = elements.post.category.value === CUSTOM_CATEGORY_VALUE;

  return {
    key: state.currentRecord && state.currentRecord.key ? state.currentRecord.key : '',
    common: {
      slug: elements.post.slug.value,
      toc: elements.post.toc.checked,
      categoryId: isCustomCategory ? '' : elements.post.category.value,
      categoryCustomZh: isCustomCategory ? elements.post.categoryCustomZh.value.trim() : '',
      categoryCustomEn: isCustomCategory ? elements.post.categoryCustomEn.value.trim() : '',
      photos: elements.post.photos.value
    },
    zh: {
      title: elements.post.zhTitle.value,
      description: elements.post.zhDescription.value,
      tags: elements.post.zhTags.value,
      permalink: state.currentRecord && state.currentRecord.zh ? state.currentRecord.zh.permalink : '',
      body: elements.post.zhBody.value,
      extras: state.currentRecord && state.currentRecord.zh ? state.currentRecord.zh.extras : {}
    },
    en: {
      title: elements.post.enTitle.value,
      description: elements.post.enDescription.value,
      tags: elements.post.enTags.value,
      permalink: state.currentRecord && state.currentRecord.en ? state.currentRecord.en.permalink : '',
      body: elements.post.enBody.value,
      extras: state.currentRecord && state.currentRecord.en ? state.currentRecord.en.extras : {}
    }
  };
}

function buildPagePayload() {
  return {
    title: elements.page.title.value,
    lang: elements.page.lang.value,
    comments: elements.page.comments.checked,
    toc: elements.page.toc.checked,
    extraYaml: elements.page.extra.value,
    body: elements.page.body.value
  };
}

function buildGalleryPayload() {
  const album = syncGalleryDraftFromForm() || createEmptyGalleryAlbum();
  return {
    sourceSlug: album.sourceSlug || '',
    slug: album.slug,
    languages: album.languages,
    title: album.title,
    period: album.period,
    location: album.location,
    camera: album.camera,
    description: album.description,
    tags: album.tags,
    photos: album.photos
  };
}

function buildLlmPayload() {
  return {
    llm: {
      endpoint: elements.llm.endpoint.value.trim(),
      apiKey: elements.llm.apiKey.value.trim(),
      model: elements.llm.model.value.trim(),
      temperature: Number(elements.llm.temperature.value || 0.2),
      prompt: elements.llm.prompt.value
    }
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const content = result.includes(',') ? result.split(',')[1] : result;
      resolve({
        name: file.name,
        content
      });
    };
    reader.onerror = () => reject(new Error(`读取文件失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function handleSaveLlmSettings() {
  try {
    const payload = buildLlmPayload();
    state.settings = await request('/api/settings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    fillLlmSettings();
    setStatus(`LLM 配置已保存到 ${state.settings.envPath || '.env'}。`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function handleCreateImageFolder() {
  try {
    const folder = elements.post.imageNewFolder.value.trim();
    const payload = await request('/api/images/folders', {
      method: 'POST',
      body: JSON.stringify({ folder })
    });
    state.imageFolders = payload.folders || [''];
    renderImageFolders();
    elements.post.imageFolderSelect.value = payload.folder || '';
    elements.post.imageNewFolder.value = '';
    setStatus(`已创建目录：images/${payload.folder}`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function uploadSelectedImages(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  try {
    setStatus(`正在上传 ${files.length} 个文件...`);
    const encoded = await Promise.all(files.map(fileToBase64));
    const payload = await request('/api/images/upload', {
      method: 'POST',
      body: JSON.stringify({
        folder: elements.post.imageFolderSelect.value,
        files: encoded
      })
    });

    state.imageFolders = payload.folders || state.imageFolders;
    renderImageFolders();
    appendPhotoPaths((payload.uploaded || []).map(item => item.path));
    elements.post.imageDropzoneMeta.textContent = (payload.uploaded || []).map(item => item.path).join('  ');
    elements.post.imageFileInput.value = '';
    setStatus(`已上传 ${(payload.uploaded || []).length} 个文件。`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

function appendGalleryPhotos(paths) {
  syncGalleryDraftFromForm();

  if (!state.gallery.currentAlbum) {
    state.gallery.currentAlbum = createEmptyGalleryAlbum();
  }

  const nextPhotos = paths.map(path => ({
    src: path,
    title: { 'zh-CN': '', en: '' },
    caption: { 'zh-CN': '', en: '' },
    meta: ''
  }));

  state.gallery.currentAlbum.photos = (state.gallery.currentAlbum.photos || []).concat(nextPhotos);
  renderGalleryPhotoList();
}

function mutateGalleryPhotos(mutator) {
  const album = syncGalleryDraftFromForm() || createEmptyGalleryAlbum();
  const nextPhotos = Array.isArray(album.photos) ? album.photos.slice() : [];
  mutator(nextPhotos);
  state.gallery.currentAlbum = {
    ...album,
    photos: nextPhotos
  };
  renderGalleryPhotoList();
}

async function handleGalleryCreateImageFolder() {
  try {
    const folder = elements.gallery.imageNewFolder.value.trim();
    const payload = await request('/api/images/folders', {
      method: 'POST',
      body: JSON.stringify({ folder })
    });
    state.imageFolders = payload.folders || [''];
    renderImageFolders();
    elements.gallery.imageFolderSelect.value = payload.folder || '';
    elements.gallery.imageNewFolder.value = '';
    setStatus(`已创建目录：images/${payload.folder}`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function uploadGalleryImages(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  try {
    setStatus(`正在上传 ${files.length} 张画廊图片...`);
    const encoded = await Promise.all(files.map(fileToBase64));
    const payload = await request('/api/images/upload', {
      method: 'POST',
      body: JSON.stringify({
        folder: elements.gallery.imageFolderSelect.value,
        files: encoded
      })
    });

    state.imageFolders = payload.folders || state.imageFolders;
    renderImageFolders();
    appendGalleryPhotos((payload.uploaded || []).map(item => item.path));
    elements.gallery.imageDropzoneMeta.textContent = (payload.uploaded || []).map(item => item.path).join('  ');
    elements.gallery.imageFileInput.value = '';
    setStatus(`已上传 ${(payload.uploaded || []).length} 张画廊图片。`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function handleFormatZh() {
  try {
    setStatus('正在调用 LLM 排版中文稿...');
    const payload = await request('/api/format/zh', {
      method: 'POST',
      body: JSON.stringify({
        title: elements.post.zhTitle.value,
        description: elements.post.zhDescription.value,
        body: elements.post.zhBody.value
      })
    });

    elements.post.zhBody.value = payload.content || '';
    setStatus('中文稿已完成一键排版。', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function handleSaveGalleryAlbum() {
  try {
    setStatus('正在保存画廊相册...');
    const payload = buildGalleryPayload();
    const saved = await request('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    state.gallery.currentAlbum = saved;
    state.gallery.selectedSlug = saved.slug;
    await loadGallery(false, saved.slug);
    setStatus('画廊相册已保存，并已同步 gallery.yml。', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function handleSave() {
  if (!state.currentRecord && state.mode !== 'posts') {
    setStatus('请先选择一个页面。', 'error');
    return;
  }

  try {
    setStatus('正在保存...');

    if (state.mode === 'posts') {
      const payload = buildPostPayload();
      const saved = await request('/api/posts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      state.currentRecord = saved;
      state.selectedId = saved.key;
      fillPostEditor(saved);
      await loadPosts(false);
    } else {
      const payload = buildPagePayload();
      const saved = await request(`/api/pages/${encodeURIComponent(state.currentRecord.id)}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      state.currentRecord = saved;
      fillPageEditor(saved);
      renderList();
    }

    setStatus('保存成功。', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function handleAddCategoryPreset() {
  try {
    setStatus('正在加入预设分类...');
    const payload = await request('/api/categories', {
      method: 'POST',
      body: JSON.stringify({
        zh: elements.post.categoryCustomZh.value.trim(),
        en: elements.post.categoryCustomEn.value.trim()
      })
    });

    state.meta.categories = payload.categories || [];
    renderCategoryOptions();
    elements.post.category.value = payload.category.id;
    updateCategoryCustomPanel();

    if (state.currentRecord && state.currentRecord.common) {
      state.currentRecord.common.categoryId = payload.category.id;
      state.currentRecord.common.categoryCustomZh = '';
      state.currentRecord.common.categoryCustomEn = '';
    }

    setStatus(`已加入预设分类：${payload.category.zh} / ${payload.category.en}`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function handleCommand(name) {
  try {
    const payload = await request(`/api/commands/${encodeURIComponent(name)}`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    state.commands = payload;
    renderCommandPanel();

    if (name === 'serve') {
      setStatus('预览服务已启动。', 'success');
      return;
    }

    if (name === 'stop-serve') {
      setStatus('正在停止预览服务...', 'success');
      return;
    }

    setStatus(`已开始执行：${name}`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

function createEmptyPost() {
  state.selectedId = '';
  state.currentRecord = {
    kind: 'post',
    key: '',
    status: '新建',
    sourceFiles: { zh: '', en: '' },
    common: {
      date: '',
      slug: '',
      toc: false,
      photos: '',
      categoryId: '',
      categoryCustomZh: '',
      categoryCustomEn: ''
    },
    zh: { title: '', description: '', tags: '', permalink: '', body: '', extras: {} },
    en: { title: '', description: '', tags: '', permalink: '', body: '', extras: {} }
  };
  renderList();
  fillPostEditor(state.currentRecord);
  setStatus('已进入新建文章模式。保存时会自动写入当前时间。');
}

async function bootstrap() {
  try {
    applyMode('posts');
    renderPanelVisibility();
    await loadMeta();
    await loadSettings();
    await loadImageFolders();
    await loadCommands();
    await loadPosts(true);
    setStatus('本地 CMS 已加载。');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

document.querySelectorAll('.mode-button').forEach(button => {
  button.addEventListener('click', async () => {
    applyMode(button.dataset.mode);
    if (button.dataset.mode === 'pages') {
      renderList();
    } else {
      await loadPosts(false);
    }
  });
});

elements.listPanel.addEventListener('click', async event => {
  const button = event.target.closest('[data-item-id]');
  if (!button) return;
  try {
    await selectItem(button.dataset.itemId);
    setStatus('已加载。');
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

elements.searchInput.addEventListener('input', renderList);
elements.saveButton.addEventListener('click', handleSave);
elements.saveLlmButton.addEventListener('click', handleSaveLlmSettings);
elements.formatZhButton.addEventListener('click', handleFormatZh);
elements.createImageFolderButton.addEventListener('click', handleCreateImageFolder);
elements.addCategoryPresetButton.addEventListener('click', handleAddCategoryPreset);
elements.gallery.saveButton.addEventListener('click', handleSaveGalleryAlbum);
elements.gallery.refreshButton.addEventListener('click', async () => {
  try {
    await loadGallery(true);
    setStatus('画廊相册列表已刷新。', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
});
elements.gallery.newAlbumButton.addEventListener('click', () => {
  state.gallery.selectedSlug = '';
  fillGalleryEditor(createEmptyGalleryAlbum());
  setStatus('已进入新建相册模式。');
});
elements.gallery.addPhotoButton.addEventListener('click', () => {
  mutateGalleryPhotos(photos => {
    photos.push({
      src: '',
      title: { 'zh-CN': '', en: '' },
      caption: { 'zh-CN': '', en: '' },
      meta: ''
    });
  });
});
elements.gallery.createImageFolderButton.addEventListener('click', handleGalleryCreateImageFolder);
elements.toggleCommandPanelButton.addEventListener('click', () => {
  state.panels.commandsExpanded = !state.panels.commandsExpanded;
  renderPanelVisibility();
});
elements.toggleLlmPanelButton.addEventListener('click', () => {
  state.panels.llmExpanded = !state.panels.llmExpanded;
  renderPanelVisibility();
});
elements.post.category.addEventListener('change', updateCategoryCustomPanel);
elements.post.categoryCustomZh.addEventListener('input', syncCategoryPresetButtonState);
elements.post.categoryCustomEn.addEventListener('input', syncCategoryPresetButtonState);
elements.uploadImageButton.addEventListener('click', () => {
  elements.post.imageFileInput.click();
});
elements.post.imageFileInput.addEventListener('change', event => {
  uploadSelectedImages(event.target.files);
});
elements.gallery.uploadImageButton.addEventListener('click', () => {
  elements.gallery.imageFileInput.click();
});
elements.gallery.imageFileInput.addEventListener('change', event => {
  uploadGalleryImages(event.target.files);
});
elements.post.imageDropzone.addEventListener('click', () => {
  elements.post.imageFileInput.click();
});
elements.gallery.imageDropzone.addEventListener('click', () => {
  elements.gallery.imageFileInput.click();
});
elements.post.imageDropzone.addEventListener('dragover', event => {
  event.preventDefault();
  elements.post.imageDropzone.classList.add('is-dragover');
});
elements.gallery.imageDropzone.addEventListener('dragover', event => {
  event.preventDefault();
  elements.gallery.imageDropzone.classList.add('is-dragover');
});
elements.post.imageDropzone.addEventListener('dragleave', () => {
  elements.post.imageDropzone.classList.remove('is-dragover');
});
elements.gallery.imageDropzone.addEventListener('dragleave', () => {
  elements.gallery.imageDropzone.classList.remove('is-dragover');
});
elements.post.imageDropzone.addEventListener('drop', event => {
  event.preventDefault();
  elements.post.imageDropzone.classList.remove('is-dragover');
  uploadSelectedImages(event.dataTransfer.files);
});
elements.gallery.imageDropzone.addEventListener('drop', event => {
  event.preventDefault();
  elements.gallery.imageDropzone.classList.remove('is-dragover');
  uploadGalleryImages(event.dataTransfer.files);
});
elements.gallery.albumList.addEventListener('click', async event => {
  const button = event.target.closest('[data-gallery-slug]');
  if (!button) return;
  try {
    await selectGalleryAlbum(button.dataset.gallerySlug);
    setStatus('已加载画廊相册。', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
});
elements.gallery.photoList.addEventListener('click', event => {
  const button = event.target.closest('[data-gallery-photo-action]');
  if (!button) return;

  const index = Number(button.dataset.photoIndex);
  if (!Number.isInteger(index)) return;

  if (button.dataset.galleryPhotoAction === 'remove') {
    mutateGalleryPhotos(photos => {
      photos.splice(index, 1);
    });
    return;
  }

  if (button.dataset.galleryPhotoAction === 'up' && index > 0) {
    mutateGalleryPhotos(photos => {
      const current = photos[index];
      photos[index] = photos[index - 1];
      photos[index - 1] = current;
    });
    return;
  }

  if (button.dataset.galleryPhotoAction === 'down') {
    mutateGalleryPhotos(photos => {
      if (index >= photos.length - 1) return;
      const current = photos[index];
      photos[index] = photos[index + 1];
      photos[index + 1] = current;
    });
  }
});
elements.commandButtons.forEach(button => {
  button.addEventListener('click', () => handleCommand(button.dataset.command));
});
elements.refreshButton.addEventListener('click', async () => {
  try {
    await loadMeta();
    await loadSettings();
    await loadImageFolders();
    await loadCommands();
    if (state.mode === 'posts') {
      await loadPosts(false);
    } else if (isGalleryPageRecord(state.currentRecord)) {
      await loadGallery(true);
    }
    renderList();
    setStatus('列表已刷新。', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
});
elements.newPostButton.addEventListener('click', createEmptyPost);

bootstrap();
window.setInterval(() => {
  loadCommands().catch(() => {});
}, 2000);
