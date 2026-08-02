/* global document, window */

'use strict';

const HOME_VIEW_STORAGE_KEY = 'home-feed-view-mode';
const HOME_SORT_STORAGE_KEY = 'home-feed-sort-mode';

function normalizeCategory(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getLinkCategory(link) {
  if (link.dataset.category) return normalizeCategory(link.dataset.category);

  const clone = link.cloneNode(true);
  const countNode = clone.querySelector('.home-category-count');
  if (countNode) countNode.remove();
  return normalizeCategory(clone.textContent);
}

function syncCurrentCategory(panel) {
  if (!panel) return;

  const currentCategory = normalizeCategory(panel.dataset.currentCategory || 'all');
  const categoryLinks = Array.from(panel.querySelectorAll('.home-category-link'));

  categoryLinks.forEach(link => {
    const linkCategory = getLinkCategory(link);
    link.classList.toggle('is-active', linkCategory === currentCategory);
  });
}

function applyViewMode(content, panel, mode) {
  if (!content || !panel) return;

  const normalizedMode = mode === 'list' ? 'list' : 'card';
  content.classList.toggle('feed-view-list', normalizedMode === 'list');
  content.classList.toggle('feed-view-card', normalizedMode === 'card');
  content.dataset.viewMode = normalizedMode;

  panel.querySelectorAll('.home-view-button').forEach(button => {
    button.classList.toggle('is-active', button.dataset.viewMode === normalizedMode);
  });
}

function getSortMode(panel) {
  const sortDropdown = panel.querySelector('[data-home-sort]');
  if (!sortDropdown) return '';

  return sortDropdown.dataset.sortMode || 'published';
}

function getPostMetric(post, mode) {
  if (mode === 'updated') {
    return Number(post.dataset.homeUpdated || 0);
  }
  if (mode === 'hot') {
    const countNode = post.querySelector('.leancloud-visitors-count');
    const rawValue = countNode ? countNode.textContent : '';
    const numericValue = Number(String(rawValue || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
  return Number(post.dataset.homePublished || 0);
}

function sortHomePosts(content, panel, mode) {
  if (!content || !panel) return;

  const postsContainer = content.querySelector('.feed-posts-container');
  if (!postsContainer) return;

  const normalizedMode = mode === 'updated' || mode === 'hot' ? mode : 'published';
  const posts = Array.from(postsContainer.querySelectorAll('.post-block'));

  posts
    .sort((left, right) => {
      const metricDiff = getPostMetric(right, normalizedMode) - getPostMetric(left, normalizedMode);
      if (metricDiff !== 0) return metricDiff;
      return Number(left.dataset.homeOriginalIndex || 0) - Number(right.dataset.homeOriginalIndex || 0);
    })
    .forEach(post => {
      postsContainer.appendChild(post);
    });

  const sortDropdown = panel.querySelector('[data-home-sort]');
  if (sortDropdown) {
    sortDropdown.dataset.sortMode = normalizedMode;
  }

  panel.querySelectorAll('.home-sort-option').forEach(option => {
    const isActive = option.dataset.sortMode === normalizedMode;
    option.classList.toggle('is-active', isActive);
    option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function initHomeFeedControls() {
  const content = document.querySelector('.main .content.feed-page');
  const panel = document.querySelector('.home-category-panel');
  if (!content || !panel) return;
  if (panel.dataset.controlsReady === '1') return;

  syncCurrentCategory(panel);

  // The index opens as an editorial reading list; the visual grid remains
  // available as an explicit alternative and saved preferences still win.
  let initialMode = 'list';
  try {
    const savedMode = window.localStorage.getItem(HOME_VIEW_STORAGE_KEY);
    if (savedMode === 'list' || savedMode === 'card') {
      initialMode = savedMode;
    }
  } catch (error) {}

  applyViewMode(content, panel, initialMode);

  const postsContainer = content.querySelector('.feed-posts-container');
  if (postsContainer) {
    Array.from(postsContainer.querySelectorAll('.post-block')).forEach((post, index) => {
      post.dataset.homeOriginalIndex = String(index);
    });
  }

  const sortDropdown = panel.querySelector('[data-home-sort]');
  if (sortDropdown) {
    let initialSortMode = 'published';
    try {
      const savedSortMode = window.localStorage.getItem(HOME_SORT_STORAGE_KEY);
      if (savedSortMode === 'published' || savedSortMode === 'updated' || savedSortMode === 'hot') {
        initialSortMode = savedSortMode;
      }
    } catch (error) {}

    sortHomePosts(content, panel, initialSortMode);

    const observer = new MutationObserver(() => {
      if (getSortMode(panel) === 'hot') {
        sortHomePosts(content, panel, 'hot');
      }
    });

    if (postsContainer) {
      postsContainer.querySelectorAll('.leancloud-visitors-count').forEach(node => {
        observer.observe(node, { childList: true, characterData: true, subtree: true });
      });
    }

    panel.addEventListener('click', event => {
      const option = event.target.closest('.home-sort-option');
      if (!option) return;

      const mode = option.dataset.sortMode;
      sortHomePosts(content, panel, mode);

      try {
        window.localStorage.setItem(HOME_SORT_STORAGE_KEY, mode);
      } catch (error) {}
    });
  }

  panel.addEventListener('click', event => {
    const button = event.target.closest('.home-view-button');
    if (!button) return;

    const mode = button.dataset.viewMode === 'list' ? 'list' : 'card';
    applyViewMode(content, panel, mode);

    try {
      window.localStorage.setItem(HOME_VIEW_STORAGE_KEY, mode);
    } catch (error) {}
  });

  panel.dataset.controlsReady = '1';
}

if (document.readyState !== 'loading') {
  initHomeFeedControls();
}
document.addEventListener('DOMContentLoaded', initHomeFeedControls);
document.addEventListener('pjax:success', initHomeFeedControls);
