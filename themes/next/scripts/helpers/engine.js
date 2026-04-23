/* global hexo */

'use strict';

const crypto = require('crypto');
const { Color, escapeHTML } = require('hexo-util');

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

function mapCategorySlugByLanguage(ctx, slug, language) {
  const defaultLanguage = getDefaultLanguage();
  const categoryMap = ctx.config.category_map || {};
  const decodedSlug = safeDecodeURIComponent(slug);
  const reverseMap = Object.entries(categoryMap).reduce((result, [source, target]) => {
    result[target] = source;
    return result;
  }, {});
  const mapped = language === defaultLanguage
    ? (reverseMap[decodedSlug] || decodedSlug)
    : (categoryMap[decodedSlug] || decodedSlug);
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
  const localizedCategories = [...categories].sort((a, b) => {
    const left = a[orderby];
    const right = b[orderby];
    if (left === right) return 0;
    return left > right ? order : -order;
  });

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
  const albums = (galleryData.albums || []).filter(album => {
    return !album.languages || album.languages.includes(language);
  });
  const emptyText = escapeHTML(getLocalizedValue(galleryData.empty, language) || 'No gallery items yet.');

  if (!albums.length) {
    return `<div class="gallery-empty">${emptyText}</div>`;
  }

  const navItems = albums.map(album => {
    const title = escapeHTML(getLocalizedValue(album.title, language));
    const count = (album.photos || []).length;
    return `<a class="gallery-nav-link" href="#gallery-${album.slug}">${title}<span>${count}</span></a>`;
  }).join('');

  const albumSections = albums.map(album => {
    const title = escapeHTML(getLocalizedValue(album.title, language));
    const description = escapeHTML(getLocalizedValue(album.description, language));
    const location = escapeHTML(getLocalizedValue(album.location, language));
    const period = escapeHTML(getLocalizedValue(album.period, language));
    const camera = escapeHTML(getLocalizedValue(album.camera, language));
    const tags = getLocalizedValue(album.tags, language) || [];
    const photos = (album.photos || []).map((photo, index) => {
      const photoTitle = escapeHTML(getLocalizedValue(photo.title, language));
      const photoCaption = escapeHTML(getLocalizedValue(photo.caption, language));
      const photoLocation = escapeHTML(getLocalizedValue(photo.location, language));
      const photoTime = escapeHTML(getLocalizedValue(photo.time, language));
      const photoMeta = escapeHTML(photo.meta || '');
      const src = this.url_for(photo.src);
      const dataCaption = [photoTitle, photoCaption, photoLocation, photoTime, photoMeta].filter(Boolean).join(' · ');
      const hasFacts = photoLocation || photoTime;

      return `
        <figure class="gallery-photo-card">
          <a class="gallery-photo-frame" href="${src}" data-fancybox="gallery-${album.slug}" data-caption="${dataCaption}">
            <img src="${src}" alt="${photoTitle || `${title}-${index + 1}`}" loading="lazy">
          </a>
          <figcaption class="gallery-photo-copy">
            <div class="gallery-photo-title">${photoTitle}</div>
            ${photoCaption ? `<p class="gallery-photo-caption">${photoCaption}</p>` : ''}
            ${hasFacts ? `<div class="gallery-photo-facts">${photoLocation ? `<span class="gallery-photo-fact">${photoLocation}</span>` : ''}${photoTime ? `<span class="gallery-photo-fact">${photoTime}</span>` : ''}</div>` : ''}
            ${photoMeta ? `<div class="gallery-photo-meta">${photoMeta}</div>` : ''}
          </figcaption>
        </figure>`;
    }).join('');

    return `
      <section class="gallery-album" id="gallery-${album.slug}">
        <header class="gallery-album-header">
          <div>
            <p class="gallery-album-kicker">${period || ''}</p>
            <h2 class="gallery-album-title">${title}</h2>
            ${description ? `<p class="gallery-album-description">${description}</p>` : ''}
          </div>
          <div class="gallery-album-meta">
            ${location ? `<span>${location}</span>` : ''}
            ${camera ? `<span>${camera}</span>` : ''}
          </div>
        </header>
        ${tags.length ? `<div class="gallery-album-tags">${tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>` : ''}
        <div class="gallery-photo-grid">
          ${photos}
        </div>
      </section>`;
  }).join('');

  return `
    <div class="gallery-page">
      <nav class="gallery-nav" aria-label="Gallery albums">
        ${navItems}
      </nav>
      <div class="gallery-albums">
        ${albumSections}
      </div>
    </div>`;
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

  addCandidate(strippedPath);

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
