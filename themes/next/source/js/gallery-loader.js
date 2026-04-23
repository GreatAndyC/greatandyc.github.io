(function() {
  'use strict';

  var cache = new Map();
  var state = {
    album: null,
    trigger: null,
    index: 0,
    scrollY: 0,
    bodyStyles: null
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

  function renderThumbs(viewer) {
    var thumbs = $('[data-gallery-viewer-thumbs]', viewer);
    if (!thumbs || !state.album) return;

    thumbs.innerHTML = state.album.photos.map(function(photo, index) {
      return [
        '<button class="gallery-viewer-thumb" type="button" data-gallery-jump="' + index + '" aria-label="' + escapeHTML(photo.title || String(index + 1)) + '">',
        '<img src="' + escapeHTML(photo.src) + '" alt="">',
        '</button>'
      ].join('');
    }).join('');
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

    image.src = photo.src;
    image.alt = photo.title || state.album.title || '';
    if (imageLink) imageLink.href = photo.src;
    title.textContent = photo.title || '';
    caption.textContent = photo.caption || '';
    meta.textContent = [photo.location, photo.time, photo.meta].filter(Boolean).join(' · ');
    status.textContent = String(state.index + 1) + ' / ' + String(photos.length);

    if (prev) prev.disabled = photos.length < 2;
    if (next) next.disabled = photos.length < 2;

    $all('[data-gallery-jump]', viewer).forEach(function(button) {
      button.classList.toggle('is-active', Number(button.dataset.galleryJump) === state.index);
      if (Number(button.dataset.galleryJump) === state.index) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
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
    if (state.trigger) state.trigger.focus();
  }

  function openAlbum(viewer, trigger) {
    state.trigger = trigger;
    state.album = null;
    state.index = 0;

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
