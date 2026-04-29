(function() {
  'use strict';

  var cache = new Map();
  var imagePreloadCache = new Map();
  var PAGE_SIZE = 10;
  var THUMB_WINDOW = 4;
  var state = {
    album: null,
    trigger: null,
    index: 0,
    scrollY: 0,
    bodyStyles: null,
    thumbButtons: [],
    activeThumbIndex: -1,
    filterKey: '',
    page: 1
  };

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"']/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function getAlbum(url) {
    if (!cache.has(url)) {
      cache.set(url, fetch(url, { credentials: 'same-origin' }).then(function(response) {
        if (!response.ok) throw new Error('Gallery data request failed');
        return response.json();
      }));
    }
    return cache.get(url);
  }

  function preloadImage(src) {
    if (!src) return null;
    if (!imagePreloadCache.has(src)) {
      imagePreloadCache.set(src, new Promise(function(resolve) {
        var image = new Image();
        image.decoding = 'async';
        image.onload = function() {
          resolve(src);
        };
        image.onerror = function() {
          resolve(src);
        };
        image.src = src;
      }));
    }
    return imagePreloadCache.get(src);
  }

  function setHidden(viewer, hidden) {
    viewer.hidden = hidden;
    viewer.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    document.documentElement.classList.toggle('gallery-viewer-open', !hidden);
  }

  function lockPageScroll() {
    if (state.bodyStyles) return;

    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    state.scrollY = window.scrollY || window.pageYOffset || 0;
    state.bodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight
    };

    document.body.style.position = 'fixed';
    document.body.style.top = '-' + state.scrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + 'px';
  }

  function unlockPageScroll() {
    if (!state.bodyStyles) return;

    document.body.style.position = state.bodyStyles.position;
    document.body.style.top = state.bodyStyles.top;
    document.body.style.left = state.bodyStyles.left;
    document.body.style.right = state.bodyStyles.right;
    document.body.style.width = state.bodyStyles.width;
    document.body.style.paddingRight = state.bodyStyles.paddingRight;
    window.scrollTo(0, state.scrollY);
    state.bodyStyles = null;
  }

  function albumMetaFromTrigger(trigger) {
    return [trigger.dataset.galleryLocation, trigger.dataset.galleryCamera].filter(Boolean).join(' · ');
  }

  function showStatus(viewer, message) {
    var status = $('[data-gallery-viewer-status]', viewer);
    if (status) status.textContent = message || '';
  }

  function photoCaption(photo) {
    return [photo.title, photo.caption, photo.location, photo.time, photo.meta].filter(Boolean).join(' · ');
  }

  function normalizeCategoryList(value) {
    return String(value || '').split(',').map(function(item) {
      return item.trim();
    }).filter(Boolean);
  }

  function getFilteredCards(filterKey) {
    return $all('.gallery-album-card').filter(function(card) {
      var trigger = $('[data-gallery-open]', card);
      var categories = normalizeCategoryList(trigger && trigger.dataset.galleryCategories);
      return !filterKey || categories.indexOf(filterKey) !== -1;
    });
  }

  function updateFilterChips(filterKey) {
    $all('[data-gallery-filter]').forEach(function(chip) {
      var isActive = (chip.dataset.galleryFilter || '') === filterKey;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function renderPagination(cards) {
    var container = $('[data-gallery-pagination]');
    if (!container) return;

    var totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
    var prevText = container.dataset.prevText || 'Previous';
    var nextText = container.dataset.nextText || 'Next';

    if (cards.length <= PAGE_SIZE) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }

    container.hidden = false;
    container.innerHTML = [
      '<button class="gallery-page-button" type="button" data-gallery-page="' + (state.page - 1) + '" ' + (state.page <= 1 ? 'disabled' : '') + '>' + escapeHTML(prevText) + '</button>',
      Array.from({ length: totalPages }, function(_, index) {
        var page = index + 1;
        var className = 'gallery-page-button' + (page === state.page ? ' is-active' : '');
        return '<button class="' + className + '" type="button" data-gallery-page="' + page + '" aria-current="' + (page === state.page ? 'page' : 'false') + '">' + page + '</button>';
      }).join(''),
      '<button class="gallery-page-button" type="button" data-gallery-page="' + (state.page + 1) + '" ' + (state.page >= totalPages ? 'disabled' : '') + '>' + escapeHTML(nextText) + '</button>'
    ].join('');
  }

  function applyGalleryFilter(filterKey, requestedPage) {
    var emptyState = $('[data-gallery-filter-empty-state]');
    var cards = getFilteredCards(filterKey);
    var totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
    var nextPage = requestedPage || 1;

    state.filterKey = filterKey;
    state.page = Math.min(Math.max(nextPage, 1), totalPages);

    $all('.gallery-album-card').forEach(function(card) {
      card.hidden = true;
    });

    cards.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE).forEach(function(card) {
      card.hidden = false;
    });

    updateFilterChips(filterKey);
    renderPagination(cards);

    if (emptyState) emptyState.hidden = cards.length !== 0;
  }

  function openZoomViewer() {
    if (!state.album || !state.album.photos.length || !window.jQuery || !jQuery.fancybox) return;

    var items = state.album.photos.map(function(photo) {
      return {
        src: photo.src,
        type: 'image',
        opts: {
          caption: photoCaption(photo)
        }
      };
    });

    jQuery.fancybox.open(items, {
      loop: true,
      hash: false,
      buttons: ['zoom', 'thumbs', 'close'],
      protect: true
    }, state.index);
  }

  function ensureThumbImageLoaded(index) {
    var button = state.thumbButtons[index];
    if (!button || button.dataset.thumbLoaded === 'true') return;

    var image = $('img', button);
    if (!image) return;

    image.src = image.dataset.src || '';
    button.dataset.thumbLoaded = 'true';
  }

  function hydrateThumbWindow(index) {
    var start = Math.max(0, index - THUMB_WINDOW);
    var end = Math.min(state.thumbButtons.length - 1, index + THUMB_WINDOW);

    for (var pointer = start; pointer <= end; pointer += 1) {
      ensureThumbImageLoaded(pointer);
    }
  }

  function setActiveThumb(viewer, index) {
    var previousButton = state.thumbButtons[state.activeThumbIndex];
    var nextButton = state.thumbButtons[index];

    if (previousButton) previousButton.classList.remove('is-active');
    if (nextButton) {
      nextButton.classList.add('is-active');
      nextButton.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    }

    state.activeThumbIndex = index;
  }

  function preloadAdjacentPhotos() {
    if (!state.album || !state.album.photos.length) return;

    [-2, -1, 1, 2].forEach(function(offset) {
      var nextIndex = state.index + offset;
      if (nextIndex < 0 || nextIndex >= state.album.photos.length) return;
      preloadImage(state.album.photos[nextIndex].src);
    });
  }

  function renderThumbs(viewer) {
    var thumbs = $('[data-gallery-viewer-thumbs]', viewer);
    if (!thumbs || !state.album) return;

    thumbs.innerHTML = state.album.photos.map(function(photo, index) {
      return [
        '<button class="gallery-viewer-thumb" type="button" data-gallery-jump="' + index + '" aria-label="' + escapeHTML(photo.title || String(index + 1)) + '">',
        '<img data-src="' + escapeHTML(photo.src) + '" alt="" loading="lazy" decoding="async" fetchpriority="low">',
        '</button>'
      ].join('');
    }).join('');

    state.thumbButtons = $all('[data-gallery-jump]', thumbs);
    state.activeThumbIndex = -1;
    hydrateThumbWindow(state.index);
  }

  function renderCurrentPhoto(viewer) {
    if (!state.album || !state.album.photos.length) return;

    var photos = state.album.photos;
    var photo = photos[state.index];
    var image = $('[data-gallery-viewer-image]', viewer);
    var imageLink = $('[data-gallery-viewer-image-link]', viewer);
    var title = $('[data-gallery-viewer-photo-title]', viewer);
    var caption = $('[data-gallery-viewer-photo-caption]', viewer);
    var meta = $('[data-gallery-viewer-photo-meta]', viewer);
    var status = $('[data-gallery-viewer-status]', viewer);
    var prev = $('[data-gallery-prev]', viewer);
    var next = $('[data-gallery-next]', viewer);

    image.decoding = 'async';
    image.src = photo.src;
    image.alt = photo.title || state.album.title || '';
    if (imageLink) imageLink.href = photo.src;
    title.textContent = photo.title || '';
    caption.textContent = photo.caption || '';
    meta.textContent = [photo.location, photo.time, photo.meta].filter(Boolean).join(' · ');
    status.textContent = String(state.index + 1) + ' / ' + String(photos.length);

    if (prev) prev.disabled = photos.length < 2;
    if (next) next.disabled = photos.length < 2;

    hydrateThumbWindow(state.index);
    setActiveThumb(viewer, state.index);
    preloadImage(photo.src);
    preloadAdjacentPhotos();
  }

  function move(viewer, step) {
    if (!state.album || !state.album.photos.length) return;
    var count = state.album.photos.length;
    state.index = (state.index + step + count) % count;
    renderCurrentPhoto(viewer);
  }

  function closeViewer(viewer) {
    setHidden(viewer, true);
    unlockPageScroll();
    state.album = null;
    state.index = 0;
    state.thumbButtons = [];
    state.activeThumbIndex = -1;
    if (state.trigger) state.trigger.focus();
  }

  function openAlbum(viewer, trigger) {
    state.trigger = trigger;
    state.album = null;
    state.index = 0;
    state.thumbButtons = [];
    state.activeThumbIndex = -1;

    $('[data-gallery-viewer-title]', viewer).textContent = trigger.dataset.galleryTitle || '';
    $('[data-gallery-viewer-period]', viewer).textContent = trigger.dataset.galleryPeriod || '';
    $('[data-gallery-viewer-meta]', viewer).textContent = albumMetaFromTrigger(trigger);
    $('[data-gallery-viewer-thumbs]', viewer).innerHTML = '';
    $('[data-gallery-viewer-image]', viewer).removeAttribute('src');
    $('[data-gallery-viewer-image-link]', viewer).setAttribute('href', '#');
    $('[data-gallery-viewer-photo-title]', viewer).textContent = '';
    $('[data-gallery-viewer-photo-caption]', viewer).textContent = '';
    $('[data-gallery-viewer-photo-meta]', viewer).textContent = '';
    showStatus(viewer, $('[data-gallery-viewer-status]', viewer).dataset.loadingText || 'Loading album...');
    lockPageScroll();
    setHidden(viewer, false);

    getAlbum(trigger.dataset.galleryUrl).then(function(album) {
      state.album = album;
      state.index = 0;
      renderThumbs(viewer);
      renderCurrentPhoto(viewer);
      var closeButton = $('[data-gallery-close]', viewer);
      if (closeButton) closeButton.focus({ preventScroll: true });
    }).catch(function() {
      showStatus(viewer, $('[data-gallery-viewer-status]', viewer).dataset.errorText || 'Could not load this album.');
    });
  }

  function initGalleryViewer() {
    var viewer = $('[data-gallery-viewer]');
    if (!viewer) return;
    if (viewer.parentNode !== document.body) document.body.appendChild(viewer);

    var filterBar = $('[data-gallery-filters]');
    if (filterBar) {
      filterBar.addEventListener('click', function(event) {
        var button = event.target.closest('[data-gallery-filter]');
        if (!button) return;
        applyGalleryFilter(button.dataset.galleryFilter || '', 1);
      });
      applyGalleryFilter('', 1);
    }

    var pagination = $('[data-gallery-pagination]');
    if (pagination) {
      pagination.addEventListener('click', function(event) {
        var button = event.target.closest('[data-gallery-page]');
        if (!button || button.disabled) return;
        applyGalleryFilter(state.filterKey, Number(button.dataset.galleryPage || 1));
      });
    }

    $all('[data-gallery-open]').forEach(function(trigger) {
      trigger.addEventListener('click', function() {
        openAlbum(viewer, trigger);
      });
    });

    $all('[data-gallery-close]', viewer).forEach(function(button) {
      button.addEventListener('click', function() {
        closeViewer(viewer);
      });
    });

    $('[data-gallery-prev]', viewer).addEventListener('click', function() {
      move(viewer, -1);
    });

    $('[data-gallery-next]', viewer).addEventListener('click', function() {
      move(viewer, 1);
    });

    $('[data-gallery-viewer-thumbs]', viewer).addEventListener('click', function(event) {
      var button = event.target.closest('[data-gallery-jump]');
      if (!button) return;
      state.index = Number(button.dataset.galleryJump || 0);
      renderCurrentPhoto(viewer);
    });

    $('[data-gallery-viewer-image-link]', viewer).addEventListener('click', function(event) {
      event.preventDefault();
      openZoomViewer();
    });

    document.addEventListener('keydown', function(event) {
      if (viewer.hidden) return;
      if (event.key === 'Escape') closeViewer(viewer);
      if (event.key === 'ArrowLeft') move(viewer, -1);
      if (event.key === 'ArrowRight') move(viewer, 1);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryViewer);
  } else {
    initGalleryViewer();
  }
})();
