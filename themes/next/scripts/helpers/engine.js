/* global hexo */

'use strict';

const crypto = require('crypto');
const { Color, escapeHTML } = require('hexo-util');

const GALLERY_DATA_DIR = 'gallery-data';

function getDefaultLanguage() {
  return Array.isArray(hexo.config.language) ? hexo.config.language[0] : hexo.config.language;
}

function getLanguages() {
  return [].concat(hexo.config.language || []).filter(Boolean);
}

function getCurrentLanguage(ctx) {
  return ctx.page.lang || ctx.page.language || getDefaultLanguage();
}

function getLocalizedPosts(ctx, language = getCurrentLanguage(ctx)) {
  const defaultLanguage = getDefaultLanguage();
  return ctx.site.posts.toArray().filter(post => (post.lang || defaultLanguage) === language);
}

function getLocalizedTags(ctx, language = getCurrentLanguage(ctx)) {
  const defaultLanguage = getDefaultLanguage();

  return ctx.site.tags.toArray().map(tag => {
    const posts = tag.posts.toArray().filter(post => (post.lang || defaultLanguage) === language);

    if (!posts.length) return null;

    return {
      name: tag.name,
      path: tag.path,
      length: posts.length
    };
  }).filter(Boolean);
}

function getLocalizedCategories(ctx, language = getCurrentLanguage(ctx)) {
  const defaultLanguage = getDefaultLanguage();

  return ctx.site.categories.toArray().map(category => {
    const posts = category.posts.toArray().filter(post => (post.lang || defaultLanguage) === language);

    if (!posts.length) return null;

    return {
      name: category.name,
      path: category.path,
      length: posts.length
    };
  }).filter(Boolean);
}

function compareLocalizedValues(left, right, language = getDefaultLanguage()) {
  if (left === right) return 0;

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right), language, {
    numeric: true,
    sensitivity: 'base'
  });
}

function getLocalizedValue(value, language, fallbackLanguage = getDefaultLanguage()) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    return value[language] || value[fallbackLanguage] || value.default || Object.values(value)[0] || '';
  }
  return value;
}

function normalizeInputPath(pathname = '') {
  return pathname.replace(/[#?].*$/, '').replace(/^\/+/, '');
}

function normalizeRoutePath(pathname = '') {
  const normalized = normalizeInputPath(pathname);
  if (!normalized) return 'index.html';
  if (normalized.endsWith('/')) return `${normalized}index.html`;
  if (!/\/[^/]+\.[^/]+$/.test(normalized)) return `${normalized}/index.html`;
  return normalized;
}

function routeExists(pathname = '') {
  return Boolean(hexo.route.get(normalizeRoutePath(pathname)));
}

function stripLanguagePrefix(pathname = '', languages = getLanguages()) {
  const normalized = normalizeInputPath(pathname);
  const matchedLanguage = languages.find(language => {
    return normalized === language || normalized.startsWith(`${language}/`);
  });
  if (!matchedLanguage) return normalized;
  return normalized.slice(matchedLanguage.length).replace(/^\/+/, '');
}

function localizedRoutePath(pathname, language, defaultLanguage) {
  const normalized = normalizeInputPath(pathname);
  if (!normalized) return language === defaultLanguage ? '' : `${language}/`;
  return language === defaultLanguage ? normalized : `${language}/${normalized}`;
}

function extractPaginationInfo(pathname = '', paginationDir = 'page') {
  const normalized = normalizeInputPath(pathname).replace(/\/+$/, '');
  const prefix = `${paginationDir}/`;
  const match = normalized.match(new RegExp(`(?:^|/)${paginationDir}/(\\d+)$`));
  if (!match) return { basePath: normalized, paginationSuffix: '' };
  if (normalized.startsWith(prefix)) {
    return { basePath: '', paginationSuffix: `${normalized}/` };
  }
  const marker = `/${paginationDir}/`;
  const markerIndex = normalized.lastIndexOf(marker);
  if (markerIndex === -1) return { basePath: normalized, paginationSuffix: '' };
  return {
    basePath: normalized.slice(0, markerIndex),
    paginationSuffix: `${normalized.slice(markerIndex + 1)}/`
  };
}

function safeDecodeURIComponent(value = '') {
  try {
    return decodeURIComponent(value);
  } catch (_) {
    return value;
  }
}

function encodePathSegments(pathname = '') {
  return pathname.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lookupCaseInsensitive(map, key) {
  if (Object.prototype.hasOwnProperty.call(map, key)) return map[key];

  const normalizedKey = String(key || '').toLowerCase();
  const matchedKey = Object.keys(map).find(item => item.toLowerCase() === normalizedKey);
  return matchedKey ? map[matchedKey] : '';
}

function galleryRouteSegment(value = '') {
  return encodeURIComponent(String(value).replace(/^\/+|\/+$/g, ''));
}

function galleryAlbumDataPath(album, language) {
  return `${GALLERY_DATA_DIR}/${galleryRouteSegment(language)}/${galleryRouteSegment(album.slug)}.json`;
}

function normalizeGalleryPhoto(photo = {}, language = getDefaultLanguage()) {
  return {
    src: photo.src || '',
    title: getLocalizedValue(photo.title, language),
    caption: getLocalizedValue(photo.caption, language),
    location: getLocalizedValue(photo.location, language),
    time: getLocalizedValue(photo.time, language),
    meta: photo.meta || ''
  };
}

function parseGalleryAlbumSortDate(album) {
  const candidates = [
    getLocalizedValue(album.period, 'en'),
    getLocalizedValue(album.period, 'zh-CN'),
    album.period
  ].map(value => String(value || '').trim()).filter(Boolean);

  for (const candidate of candidates) {
    const match = candidate.match(/(20\d{2})(?:[-/.](\d{1,2})(?:[-/.](\d{1,2}))?)?/);
    if (!match) continue;

    const year = Number(match[1]);
    const month = Number(match[2] || 1);
    const day = Number(match[3] || 1);
    const timestamp = Date.UTC(year, month - 1, day);
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  return null;
}

function sortGalleryAlbums(albums = []) {
  return albums
    .map((album, index) => ({
      album,
      index,
      sortDate: parseGalleryAlbumSortDate(album)
    }))
    .sort((left, right) => {
      if (left.sortDate != null && right.sortDate != null && left.sortDate !== right.sortDate) {
        return right.sortDate - left.sortDate;
      }
      if (left.sortDate != null && right.sortDate == null) return -1;
      if (left.sortDate == null && right.sortDate != null) return 1;
      return left.index - right.index;
    })
    .map(item => item.album);
}

hexo.extend.generator.register('gallery_data', function (locals) {
  const galleryData = (locals.data && locals.data.gallery) || {};
  const albums = sortGalleryAlbums(galleryData.albums || []);
  const languages = getLanguages();

  return languages.flatMap(language => {
    return albums
      .filter(album => !album.languages || album.languages.includes(language))
      .map(album => {
        const photos = (album.photos || []).map(photo => normalizeGalleryPhoto(photo, language));
        return {
          path: galleryAlbumDataPath(album, language),
          data: JSON.stringify({
            slug: album.slug,
            title: getLocalizedValue(album.title, language),
            photos
          })
        };
      });
  });
});

function getPostTranslationKey(post, languages = getLanguages()) {
  const source = post.source || post.path || post.slug || '';
  const basename = source.split('/').pop().replace(/\.(md|markdown|html)$/i, '');

  if (!basename) return String(post.slug || post.title || '').toLowerCase();

  const languagePattern = languages
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');

  if (!languagePattern) return basename.toLowerCase();

  return basename.replace(new RegExp(`\\.(${languagePattern})$`, 'i'), '').toLowerCase();
}

function buildInferredCategoryMaps(ctx) {
  const languages = getLanguages();
  const categoriesByPostKey = ctx.site.categories.toArray().reduce((result, category) => {
    category.posts.toArray().forEach(post => {
      const language = post.lang || getDefaultLanguage();
      const key = getPostTranslationKey(post, languages);

      if (!key) return;
      if (!result[key]) result[key] = {};
      if (!result[key][language]) result[key][language] = [];
      result[key][language].push(category);
    });

    return result;
  }, {});

  return Object.values(categoriesByPostKey).reduce((maps, localizedCategories) => {
    const entries = Object.entries(localizedCategories);

    entries.forEach(([sourceLanguage, sourceCategories]) => {
      if (!sourceCategories.length) return;

      entries.forEach(([targetLanguage, targetCategories]) => {
        if (sourceLanguage === targetLanguage) return;

        const pairCount = Math.min(sourceCategories.length, targetCategories.length);
        if (!pairCount) return;

        if (!maps[sourceLanguage]) maps[sourceLanguage] = {};
        if (!maps[sourceLanguage][targetLanguage]) maps[sourceLanguage][targetLanguage] = {};

        for (let index = 0; index < pairCount; index++) {
          const sourceName = sourceCategories[index].name;
          const targetName = targetCategories[index].name;

          if (sourceName && targetName) {
            maps[sourceLanguage][targetLanguage][sourceName] = targetName;
          }
        }
      });
    });

    return maps;
  }, {});
}

function mapCategorySlugByLanguage(ctx, slug, language) {
  const defaultLanguage = getDefaultLanguage();
  const categoryMap = ctx.config.category_map || {};
  const decodedSlug = safeDecodeURIComponent(slug);
  const reverseMap = Object.entries(categoryMap).reduce((result, [source, target]) => {
    result[target] = source;
    return result;
  }, {});
  const sourceLanguage = getCurrentLanguage(ctx);
  const inferredCategoryMap = buildInferredCategoryMaps(ctx);
  const inferredMap = inferredCategoryMap[sourceLanguage] && inferredCategoryMap[sourceLanguage][language]
    ? inferredCategoryMap[sourceLanguage][language]
    : {};
  const mapped = language === defaultLanguage
    ? (lookupCaseInsensitive(reverseMap, decodedSlug) || lookupCaseInsensitive(inferredMap, decodedSlug) || decodedSlug)
    : (lookupCaseInsensitive(categoryMap, decodedSlug) || lookupCaseInsensitive(inferredMap, decodedSlug) || decodedSlug);
  return encodePathSegments(mapped);
}

function findLocalizedTaxonomyPath(ctx, taxonomy, slug, language) {
  const normalizedSlug = safeDecodeURIComponent(slug || '').toLowerCase();
  if (!normalizedSlug) return '';

  const defaultLanguage = getDefaultLanguage();
  const isCategory = taxonomy === 'category';
  const collection = isCategory ? ctx.site.categories : ctx.site.tags;
  const dirKey = isCategory ? 'category_dir' : 'tag_dir';
  const fallbackDir = isCategory ? 'categories' : 'tags';
  const taxonomyDir = normalizeInputPath(ctx.config[dirKey] || fallbackDir).replace(/\/+$/, '');
  const taxonomyPrefix = `${taxonomyDir}/`;

  const matched = collection.toArray().find(item => {
    const posts = item.posts.toArray().filter(post => (post.lang || defaultLanguage) === language);
    if (!posts.length) return false;

    const itemPath = normalizeInputPath(item.path).replace(/\/+$/, '');
    if (!itemPath.startsWith(taxonomyPrefix)) return false;

    const itemSlug = safeDecodeURIComponent(itemPath.slice(taxonomyPrefix.length)).toLowerCase();
    return itemSlug === normalizedSlug;
  });

  return matched ? normalizeInputPath(matched.path).replace(/\/+$/, '') : '';
}

hexo.extend.helper.register('next_inject', function (point) {
  return hexo.theme.config.injects[point]
    .map(item => this.partial(item.layout, item.locals, item.options))
    .join('');
});

hexo.extend.helper.register('next_js', function (...urls) {
  const { js } = hexo.theme.config;
  return urls.map(url => this.js(`${js}/${url}`)).join('');
});

hexo.extend.helper.register('next_vendors', function (url) {
  if (url.startsWith('//')) return url;
  const internal = hexo.theme.config.vendors._internal;
  return this.url_for(`${internal}/${url}`);
});

hexo.extend.helper.register('localized_path', function (path) {
  if (typeof path !== 'string') return path;
  if (/^(?:[a-z]+:)?\/\//i.test(path) || /^(?:mailto:|javascript:|#)/i.test(path)) return path;

  const defaultLanguage = getDefaultLanguage();
  const currentLanguage = getCurrentLanguage(this);

  if (!currentLanguage || currentLanguage === defaultLanguage) {
    return this.url_for(path);
  }

  const normalizedPath = normalizeInputPath(path);
  const localizedPath = localizedRoutePath(normalizedPath, currentLanguage, defaultLanguage);

  if (routeExists(localizedPath)) {
    return this.url_for(localizedPath);
  }

  if (routeExists(normalizedPath)) {
    return this.url_for(normalizedPath);
  }

  // 如果本地化和基础路径都不存在，返回站点首页
  return this.url_for('/');
});

hexo.extend.helper.register('localized_posts_count', function (language) {
  return getLocalizedPosts(this, language).length;
});

hexo.extend.helper.register('localized_tag_count', function (language) {
  return getLocalizedTags(this, language).length;
});

hexo.extend.helper.register('localized_category_count', function (language) {
  return getLocalizedCategories(this, language).length;
});

hexo.extend.helper.register('localized_tagcloud', function (options = {}) {
  const tags = getLocalizedTags(this);

  if (!tags.length) return '';

  const min = options.min_font || 10;
  const max = options.max_font || 20;
  const orderby = options.orderby || 'name';
  const order = options.order || 1;
  const unit = options.unit || 'px';
  const color = options.color;
  const className = options.class;
  const showCount = options.show_count;
  const countClassName = options.count_class || 'count';
  const level = options.level || 10;
  const { transform } = options;
  const separator = options.separator || ' ';
  let localizedTags = [...tags];
  let startColor;
  let endColor;

  if (orderby === 'random' || orderby === 'rand') {
    localizedTags.sort(() => Math.random() - 0.5);
  } else {
    localizedTags.sort((a, b) => {
      const left = a[orderby];
      const right = b[orderby];
      if (left === right) return 0;
      return left > right ? order : -order;
    });
  }

  if (options.amount) {
    localizedTags = localizedTags.slice(0, options.amount);
  }

  if (color) {
    startColor = new Color(options.start_color);
    endColor = new Color(options.end_color);
  }

  const sizes = [...new Set(localizedTags.map(tag => tag.length))].sort((a, b) => a - b);
  const length = sizes.length - 1;

  return localizedTags.map(tag => {
    const ratio = length ? sizes.indexOf(tag.length) / length : 0;
    const size = min + ((max - min) * ratio);
    let style = `font-size: ${parseFloat(size.toFixed(2))}${unit};`;
    const attr = className ? ` class="${className}-${Math.round(ratio * level)}"` : '';

    if (color) {
      style += ` color: ${startColor.mix(endColor, ratio).toString()}`;
    }

    return `<a href="${this.localized_path(tag.path)}" style="${style}"${attr}>${transform ? transform(tag.name) : tag.name}${showCount ? `<span class="${countClassName}">${tag.length}</span>` : ''}</a>`;
  }).join(separator);
});

hexo.extend.helper.register('localized_list_categories', function (options = {}) {
  const categories = getLocalizedCategories(this);

  if (!categories.length) return '';

  const { style = 'list', transform, separator = ', ', suffix = '' } = options;
  const showCount = Object.prototype.hasOwnProperty.call(options, 'show_count') ? options.show_count : true;
  const className = options.class || 'category';
  const orderby = options.orderby || 'name';
  const order = options.order || 1;
  const amount = Number.isFinite(Number(options.amount)) ? Math.max(Math.trunc(Number(options.amount)), 0) : 0;
  const includeCurrent = Boolean(options.include_current);
  const currentCategoryName = String(options.current || '').trim();
  const currentLanguage = getCurrentLanguage(this);
  const normalizedCurrentCategory = currentCategoryName.toLowerCase();
  const sortDirection = order >= 0 ? 1 : -1;
  let localizedCategories = [...categories].sort((a, b) => {
    const primaryResult = compareLocalizedValues(a[orderby], b[orderby], currentLanguage);
    if (primaryResult !== 0) return primaryResult * sortDirection;

    return compareLocalizedValues(a.name, b.name, currentLanguage);
  });

  if (amount > 0 && localizedCategories.length > amount) {
    localizedCategories = localizedCategories.slice(0, amount);

    if (includeCurrent && normalizedCurrentCategory) {
      const hasCurrentCategory = localizedCategories.some(category => category.name.toLowerCase() === normalizedCurrentCategory);

      if (!hasCurrentCategory) {
        const currentCategory = categories.find(category => category.name.toLowerCase() === normalizedCurrentCategory);

        if (currentCategory) {
          localizedCategories.push(currentCategory);
        }
      }
    }
  }

  if (style === 'list') {
    return `<ul class="${className}-list">${localizedCategories.map(category => {
      return `<li class="${className}-list-item"><a class="${className}-list-link" href="${this.localized_path(category.path)}${suffix}">${transform ? transform(category.name) : category.name}</a>${showCount ? `<span class="${className}-list-count">${category.length}</span>` : ''}</li>`;
    }).join('')}</ul>`;
  }

  return localizedCategories.map(category => {
    return `<a class="${className}-link" href="${this.localized_path(category.path)}${suffix}">${transform ? transform(category.name) : category.name}${showCount ? `<span class="${className}-count">${category.length}</span>` : ''}</a>`;
  }).join(separator);
});

hexo.extend.helper.register('render_gallery', function (language = getCurrentLanguage(this)) {
  const galleryData = this.site.data.gallery || {};
  const galleryFilters = (galleryData.filters || []).map(filter => ({
    key: String(filter && filter.key || '').trim(),
    label: getLocalizedValue(filter && filter.label, language)
  })).filter(filter => filter.key && filter.label);
  const albums = sortGalleryAlbums((galleryData.albums || []).filter(album => {
    return !album.languages || album.languages.includes(language);
  }));
  const emptyText = escapeHTML(getLocalizedValue(galleryData.empty, language) || 'No gallery items yet.');

  if (!albums.length) {
    return `<div class="gallery-empty">${emptyText}</div>`;
  }

  const albumCards = albums.map(album => {
    const title = escapeHTML(getLocalizedValue(album.title, language));
    const description = escapeHTML(getLocalizedValue(album.description, language));
    const location = escapeHTML(getLocalizedValue(album.location, language));
    const period = escapeHTML(getLocalizedValue(album.period, language));
    const camera = escapeHTML(getLocalizedValue(album.camera, language));
    const category = String(album.category || (Array.isArray(album.categories) ? album.categories[0] : '') || '').trim();
    const categories = category ? [category] : [];
    const tags = getLocalizedValue(album.tags, language) || [];
    const photoList = album.photos || [];
    const coverPhoto = photoList[0] || {};
    const coverSrc = coverPhoto.src ? this.url_for(coverPhoto.src) : '';
    const dataUrl = this.url_for(`/${galleryAlbumDataPath(album, language)}`);
    const countText = String(language).toLowerCase().startsWith('zh') ? `${photoList.length} 张照片` : `${photoList.length} photos`;
    const openText = String(language).toLowerCase().startsWith('zh') ? '打开相册' : 'Open album';

    return `
      <article class="gallery-album-card" id="gallery-${album.slug}">
        <button
          class="gallery-album-trigger"
          type="button"
          data-gallery-open
          data-gallery-album="${escapeHTML(album.slug)}"
          data-gallery-title="${title}"
          data-gallery-period="${period}"
          data-gallery-location="${location}"
          data-gallery-camera="${camera}"
          data-gallery-categories="${escapeHTML(categories.join(','))}"
          data-gallery-url="${escapeHTML(dataUrl)}"
        >
          <span class="gallery-album-cover">
            ${coverSrc ? `<img src="${coverSrc}" alt="${title}" loading="lazy" decoding="async">` : ''}
            <span class="gallery-album-count">${countText}</span>
          </span>
          <span class="gallery-album-card-copy">
            <span class="gallery-album-card-kicker">${period || ''}</span>
            <span class="gallery-album-card-title">${title}</span>
            ${description ? `<span class="gallery-album-card-description">${description}</span>` : ''}
            <span class="gallery-album-card-meta">
              ${location ? `<span>${location}</span>` : ''}
              ${camera ? `<span>${camera}</span>` : ''}
            </span>
            ${tags.length ? `<span class="gallery-album-card-tags">${tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</span>` : ''}
            <span class="gallery-album-card-action">${openText}</span>
          </span>
        </button>
      </article>`;
  }).join('');

  const allText = String(language).toLowerCase().startsWith('zh') ? '全部' : 'All';
  const emptyFilterText = String(language).toLowerCase().startsWith('zh')
    ? '当前分类下还没有相册。'
    : 'No albums in this category yet.';
  const pagePrevText = String(language).toLowerCase().startsWith('zh') ? '上一页' : 'Previous';
  const pageNextText = String(language).toLowerCase().startsWith('zh') ? '下一页' : 'Next';
  const initialPageCount = Math.ceil(albums.length / 10);
  const filterButtons = [{
    key: '',
    label: allText,
    count: albums.length
  }].concat(galleryFilters.map(filter => ({
    key: filter.key,
    label: filter.label,
    count: albums.filter(album => {
      const category = String(album.category || (Array.isArray(album.categories) ? album.categories[0] : '') || '').trim();
      return category === filter.key;
    }).length
  })));

  const closeText = String(language).toLowerCase().startsWith('zh') ? '关闭' : 'Close';
  const previousText = String(language).toLowerCase().startsWith('zh') ? '上一张' : 'Previous';
  const nextText = String(language).toLowerCase().startsWith('zh') ? '下一张' : 'Next';
  const loadingText = String(language).toLowerCase().startsWith('zh') ? '正在加载相册...' : 'Loading album...';
  const errorText = String(language).toLowerCase().startsWith('zh') ? '相册加载失败，请稍后重试。' : 'Could not load this album. Please try again later.';
  return `
    <div class="gallery-page">
      ${filterButtons.length > 1 ? `
        <div class="gallery-filter-bar" data-gallery-filters>
          ${filterButtons.map((filter, index) => `
            <button
              class="gallery-filter-chip${index === 0 ? ' is-active' : ''}${filter.count === 0 && filter.key ? ' is-empty' : ''}"
              type="button"
              data-gallery-filter="${escapeHTML(filter.key)}"
              aria-pressed="${index === 0 ? 'true' : 'false'}"
            >
              <span>${escapeHTML(String(filter.label))}</span>
              <span class="gallery-filter-chip-count">${filter.count}</span>
            </button>
          `).join('')}
        </div>
      ` : ''}
      <div class="gallery-card-deck">
        ${albumCards}
      </div>
      <div
        class="gallery-pagination"
        data-gallery-pagination
        data-prev-text="${escapeHTML(pagePrevText)}"
        data-next-text="${escapeHTML(pageNextText)}"
        ${initialPageCount > 1 ? '' : 'hidden'}
      >${initialPageCount > 1 ? `
        <button class="gallery-page-button" type="button" data-gallery-page="0" disabled>${escapeHTML(pagePrevText)}</button>
        <button class="gallery-page-button is-active" type="button" data-gallery-page="1" aria-current="page">1</button>
        ${Array.from({ length: Math.max(initialPageCount - 1, 0) }, (_, index) => `<button class="gallery-page-button" type="button" data-gallery-page="${index + 2}" aria-current="false">${index + 2}</button>`).join('')}
        <button class="gallery-page-button" type="button" data-gallery-page="2">${escapeHTML(pageNextText)}</button>
      ` : ''}</div>
      <div class="gallery-filter-empty" data-gallery-filter-empty-state hidden>${escapeHTML(emptyFilterText)}</div>
    </div>
    <div class="gallery-viewer" data-gallery-viewer hidden aria-hidden="true">
      <div class="gallery-viewer-backdrop" data-gallery-close></div>
      <section class="gallery-viewer-panel" role="dialog" aria-modal="true" aria-label="Gallery viewer">
        <header class="gallery-viewer-header">
          <div>
            <p class="gallery-viewer-kicker" data-gallery-viewer-period></p>
            <h2 class="gallery-viewer-title" data-gallery-viewer-title></h2>
            <p class="gallery-viewer-meta" data-gallery-viewer-meta></p>
          </div>
          <button class="gallery-viewer-close" type="button" data-gallery-close aria-label="${closeText}">${closeText}</button>
        </header>
        <div class="gallery-viewer-stage">
          <button class="gallery-viewer-nav gallery-viewer-prev" type="button" data-gallery-prev aria-label="${previousText}">‹</button>
          <figure class="gallery-viewer-figure">
            <a class="gallery-viewer-image-link" data-gallery-viewer-image-link href="#">
              <img data-gallery-viewer-image alt="">
            </a>
            <figcaption class="gallery-viewer-caption">
              <span class="gallery-viewer-photo-title" data-gallery-viewer-photo-title></span>
              <span class="gallery-viewer-photo-caption" data-gallery-viewer-photo-caption></span>
              <span class="gallery-viewer-photo-meta" data-gallery-viewer-photo-meta></span>
            </figcaption>
          </figure>
          <button class="gallery-viewer-nav gallery-viewer-next" type="button" data-gallery-next aria-label="${nextText}">›</button>
        </div>
        <div class="gallery-viewer-footer">
          <div class="gallery-viewer-status" data-gallery-viewer-status data-loading-text="${loadingText}" data-error-text="${errorText}"></div>
          <div class="gallery-viewer-thumbs" data-gallery-viewer-thumbs></div>
        </div>
      </section>
    </div>
    <script src="${this.url_for('/js/gallery-loader.js')}" defer></script>`;
});

hexo.extend.helper.register('post_edit', function (src) {
  const theme = hexo.theme.config;
  if (!theme.post_edit.enable) return '';
  return this.next_url(theme.post_edit.url + src, '<i class="fa fa-pencil-alt"></i>', {
    class: 'post-edit-link',
    title: this.__('post.edit')
  });
});

hexo.extend.helper.register('post_nav', function (post) {
  const theme = hexo.theme.config;
  const posts = this.site.posts.sort('-date').toArray();
  const defaultLanguage = getDefaultLanguage();
  const postLang = post.lang || this.page.lang || defaultLanguage;
  const localizedPosts = posts.filter(item => (item.lang || defaultLanguage) === postLang);
  const currentIndex = localizedPosts.findIndex(item => item.path === post.path);

  if (theme.post_navigation === false || currentIndex === -1) return '';

  const localizedPrev = currentIndex > 0 ? localizedPosts[currentIndex - 1] : null;
  const localizedNext = currentIndex < localizedPosts.length - 1 ? localizedPosts[currentIndex + 1] : null;
  const prev = theme.post_navigation === 'right' ? localizedPrev : localizedNext;
  const next = theme.post_navigation === 'right' ? localizedNext : localizedPrev;

  if (!prev && !next) return '';

  const left = prev ? `
    <a href="${this.url_for(prev.path)}" rel="prev" title="${prev.title}">
      <i class="fa fa-chevron-left"></i> ${prev.title}
    </a>` : '';
  const right = next ? `
    <a href="${this.url_for(next.path)}" rel="next" title="${next.title}">
      ${next.title} <i class="fa fa-chevron-right"></i>
    </a>` : '';
  return `
    <div class="post-nav">
      <div class="post-nav-item">${left}</div>
      <div class="post-nav-item">${right}</div>
    </div>`;
});

hexo.extend.helper.register('gitalk_md5', function (path) {
  let str = this.url_for(path);
  str.replace('index.html', '');
  return crypto.createHash('md5').update(str).digest('hex');
});

hexo.extend.helper.register('canonical', function () {
  // https://support.google.com/webmasters/answer/139066
  const { permalink } = hexo.config;
  let url = this.url.replace(/index\.html$/, '');
  if (!permalink.endsWith('.html')) {
    url = url.replace(/\.html$/, '');
  }
  return `<link rel="canonical" href="${url}">`;
});

/**
 * Get page path given a certain language tag
 */
hexo.extend.helper.register('i18n_path', function (language) {
  const languages = this.languages || getLanguages();
  const defaultLanguage = languages[0] || getDefaultLanguage();
  const currentPageLanguage = this.page && (this.page.lang || this.page.language);
  const pagePath = this.page && this.page.path ? this.page.path : '';
  const strippedPath = stripLanguagePrefix(pagePath, languages);
  const paginationDir = this.config.pagination_dir || 'page';
  const { basePath, paginationSuffix } = extractPaginationInfo(strippedPath, paginationDir);
  const candidates = [];

  function addCandidate(pathname) {
    const normalized = normalizeInputPath(pathname);
    if (!normalized) return;
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  }

  if (this.page && (this.page.layout === 'category' || this.page.category)) {
    const categoryDir = normalizeInputPath(this.config.category_dir || 'categories').replace(/\/+$/, '');
    const categoryPrefix = `${categoryDir}/`;
    if (basePath.startsWith(categoryPrefix)) {
      const rawSlug = basePath.slice(categoryPrefix.length);
      const mappedSlug = mapCategorySlugByLanguage(this, rawSlug, language);
      const mappedBasePath = `${categoryPrefix}${mappedSlug}`;
      addCandidate(paginationSuffix ? `${mappedBasePath}/${paginationSuffix}` : mappedBasePath);

      const matchedRawPath = findLocalizedTaxonomyPath(this, 'category', rawSlug, language);
      if (matchedRawPath) {
        addCandidate(paginationSuffix ? `${matchedRawPath}/${paginationSuffix}` : matchedRawPath);
      }

      const matchedMappedPath = findLocalizedTaxonomyPath(this, 'category', mappedSlug, language);
      if (matchedMappedPath) {
        addCandidate(paginationSuffix ? `${matchedMappedPath}/${paginationSuffix}` : matchedMappedPath);
      }
    }
  }

  if (this.page && (this.page.layout === 'tag' || this.page.tag)) {
    const tagDir = normalizeInputPath(this.config.tag_dir || 'tags').replace(/\/+$/, '');
    const tagPrefix = `${tagDir}/`;
    if (basePath.startsWith(tagPrefix)) {
      const rawSlug = basePath.slice(tagPrefix.length);
      const matchedTagPath = findLocalizedTaxonomyPath(this, 'tag', rawSlug, language);
      if (matchedTagPath) {
        addCandidate(paginationSuffix ? `${matchedTagPath}/${paginationSuffix}` : matchedTagPath);
      }
    }
  }

  addCandidate(strippedPath);

  for (const candidate of candidates) {
    const localizedCandidate = localizedRoutePath(candidate, language, defaultLanguage);
    if (routeExists(localizedCandidate)) {
      return this.url_for(`/${localizedCandidate}`);
    }
  }

  if (this.page) {
    const categoryIndex = normalizeInputPath(this.config.category_dir || 'categories');
    const tagIndex = normalizeInputPath(this.config.tag_dir || 'tags');
    const archiveIndex = normalizeInputPath(this.config.archive_dir || 'archives');
    const isCategoryPage = this.page.layout === 'category' || this.page.category
      || strippedPath === categoryIndex || strippedPath.startsWith(`${categoryIndex}/`);
    const isTagPage = this.page.layout === 'tag' || this.page.tag
      || strippedPath === tagIndex || strippedPath.startsWith(`${tagIndex}/`);
    const isArchivePage = this.page.layout === 'archive'
      || strippedPath === archiveIndex || strippedPath.startsWith(`${archiveIndex}/`);

    if (isCategoryPage) {
      const localizedCategoryIndex = localizedRoutePath(categoryIndex, language, defaultLanguage);
      return this.url_for(`/${localizedCategoryIndex}`);
    }

    if (isTagPage) {
      const localizedTagIndex = localizedRoutePath(tagIndex, language, defaultLanguage);
      return this.url_for(`/${localizedTagIndex}`);
    }

    if (isArchivePage) {
      const localizedArchiveIndex = localizedRoutePath(archiveIndex, language, defaultLanguage);
      return this.url_for(`/${localizedArchiveIndex}`);
    }
  }

  // Non-i18n pages (e.g. admin) should keep their original route if it exists.
  if (!currentPageLanguage && routeExists(strippedPath)) {
    return this.url_for(`/${strippedPath}`);
  }

  const localizedRoot = localizedRoutePath('', language, defaultLanguage);
  return this.url_for(localizedRoot ? `/${localizedRoot}` : '/');
});

/**
 * Get the language name
 */
hexo.extend.helper.register('language_name', function (language) {
  const name = hexo.theme.i18n.__(language)('name');
  return name === 'name' ? language : name;
});
