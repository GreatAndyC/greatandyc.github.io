/* global document, window */

'use strict';

const HOME_VIEW_STORAGE_KEY = 'home-feed-view-mode';

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

function initHomeFeedControls() {
  const content = document.querySelector('.main .content.feed-page');
  const panel = document.querySelector('.home-category-panel');
  if (!content || !panel) return;
  if (panel.dataset.controlsReady === '1') return;

  syncCurrentCategory(panel);

  let initialMode = 'card';
  try {
    const savedMode = window.localStorage.getItem(HOME_VIEW_STORAGE_KEY);
    if (savedMode === 'list' || savedMode === 'card') {
      initialMode = savedMode;
    }
  } catch (error) {}

  applyViewMode(content, panel, initialMode);

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
