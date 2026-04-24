'use strict';

const CUSTOM_CATEGORY_VALUE = '__custom__';

const state = {
  mode: 'posts',
  meta: { categories: [], pages: [] },
  posts: [],
  pages: [],
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

  elements.post.imageFolderSelect.innerHTML = options.join('');
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

  document.querySelectorAll('.mode-button').forEach(button => {
    button.classList.toggle('is-active', button.dataset.mode === mode);
  });

  elements.newPostButton.hidden = mode !== 'posts';
  elements.postEditor.hidden = true;
  elements.pageEditor.hidden = true;
  elements.workspaceKicker.textContent = mode === 'posts' ? '文章编辑器' : '页面编辑器';
  elements.workspaceTitle.textContent = mode === 'posts' ? '请选择文章' : '请选择页面';
  renderWorkspaceSections();
  renderList();
}

function fillPostEditor(record) {
  renderWorkspaceSections();
  elements.postEditor.hidden = false;
  elements.pageEditor.hidden = true;
  elements.workspaceTitle.textContent = record.zh.title || record.en.title || record.key || '新文章';

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
  elements.workspaceTitle.textContent = record.label;

  elements.page.title.value = record.title || '';
  elements.page.date.value = record.date || '保存后自动生成';
  elements.page.lang.value = record.lang || '';
  elements.page.comments.checked = Boolean(record.comments);
  elements.page.toc.checked = Boolean(record.toc);
  elements.page.extra.value = record.extraYaml || '';
  elements.page.body.value = record.body || '';
  elements.page.file.textContent = record.file || '';
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
  }
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
elements.post.imageDropzone.addEventListener('click', () => {
  elements.post.imageFileInput.click();
});
elements.post.imageDropzone.addEventListener('dragover', event => {
  event.preventDefault();
  elements.post.imageDropzone.classList.add('is-dragover');
});
elements.post.imageDropzone.addEventListener('dragleave', () => {
  elements.post.imageDropzone.classList.remove('is-dragover');
});
elements.post.imageDropzone.addEventListener('drop', event => {
  event.preventDefault();
  elements.post.imageDropzone.classList.remove('is-dragover');
  uploadSelectedImages(event.dataTransfer.files);
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
    await loadPosts(false);
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
