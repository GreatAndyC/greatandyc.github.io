/* global document, window, fetch, DOMParser */

'use strict';

function normalizeCategory(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCategoryName(link) {
  if (link.dataset.category) return normalizeCategory(link.dataset.category);

  const clone = link.cloneNode(true);
  const countNode = clone.querySelector('.home-category-count');
  if (countNode) countNode.remove();
  return normalizeCategory(clone.textContent);
}

function initHomeCategoryFilter() {
  const panel = document.querySelector('.home-category-panel');
  if (!panel) return;
  if (panel.dataset.filterReady === '1') return;

  const listContainer = panel.querySelector('.home-category-nav');
  if (!listContainer) return;

  const content = document.querySelector('.main .content.index.posts-expand');
  if (!content) return;

  const posts = Array.from(content.querySelectorAll('article.post-block'));
  if (!posts.length) return;

  const categoryLinks = Array.from(listContainer.querySelectorAll('.home-category-link'));
  if (!categoryLinks.length) return;

  const pagination = content.querySelector('.pagination');
  const originalPostsHtml = posts.map(post => post.outerHTML);
  let allPostsCache = null;
  let prefetchPromise = null;

  const emptyClassName = 'home-category-empty';
  const emptyDefaultText = '当前分类在首页没有文章。';
  let emptyHint = document.querySelector('.' + emptyClassName);
  if (!emptyHint) {
    emptyHint = document.createElement('div');
    emptyHint.className = emptyClassName;
    emptyHint.textContent = emptyDefaultText;
    emptyHint.hidden = true;
    panel.insertAdjacentElement('afterend', emptyHint);
  }

  categoryLinks.forEach(link => {
    if (link.dataset.category) return;
    link.dataset.category = getCategoryName(link);
    link.setAttribute('href', '#');
  });
  categoryLinks.forEach(link => {
    if (!link.getAttribute('href')) link.setAttribute('href', '#');
  });

  function setLoading(isLoading) {
    panel.classList.toggle('is-loading', isLoading);
  }

  function parsePageCount() {
    if (!pagination) return 1;
    const pages = Array.from(pagination.querySelectorAll('.page-number')).map(node => {
      const text = (node.textContent || '').trim();
      const page = Number.parseInt(text, 10);
      return Number.isNaN(page) ? 1 : page;
    });
    return pages.length ? Math.max(...pages) : 1;
  }

  function getLocalePrefix() {
    const path = window.location.pathname || '/';
    const langMatch = path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?:\/|$)/);
    return langMatch ? '/' + langMatch[1] : '';
  }

  function getIndexPageUrl(page) {
    const prefix = getLocalePrefix();
    return prefix + '/page/' + page + '/';
  }

  function restoreOriginalList() {
    const dynamicPosts = Array.from(content.querySelectorAll('article.post-block'));
    dynamicPosts.forEach(post => post.remove());
    const anchor = pagination || null;
    originalPostsHtml.forEach(html => {
      if (anchor) {
        anchor.insertAdjacentHTML('beforebegin', html);
      } else {
        content.insertAdjacentHTML('beforeend', html);
      }
    });
    if (pagination) pagination.hidden = false;
    emptyHint.textContent = emptyDefaultText;
    emptyHint.hidden = true;
    revealRenderedPosts();
  }

  function replaceWithPosts(postsHtml) {
    const dynamicPosts = Array.from(content.querySelectorAll('article.post-block'));
    dynamicPosts.forEach(post => post.remove());
    const anchor = pagination || null;
    postsHtml.forEach(html => {
      if (anchor) {
        anchor.insertAdjacentHTML('beforebegin', html);
      } else {
        content.insertAdjacentHTML('beforeend', html);
      }
    });
    if (pagination) pagination.hidden = true;
    emptyHint.textContent = emptyDefaultText;
    emptyHint.hidden = postsHtml.length > 0;
    revealRenderedPosts();
  }

  function revealRenderedPosts() {
    const renderedPosts = Array.from(content.querySelectorAll('article.post-block'));
    const renderedHeaders = Array.from(content.querySelectorAll('.post-header'));
    const renderedBodies = Array.from(content.querySelectorAll('.post-body'));
    const visibleNodes = renderedPosts.concat(renderedHeaders, renderedBodies);

    visibleNodes.forEach(node => {
      node.style.opacity = '1';
    });
  }

  function extractPostsFromDocument(doc) {
    return Array.from(doc.querySelectorAll('.main .content.index.posts-expand article.post-block')).map(post => post.outerHTML);
  }

  function postHasCategory(postHtml, normalizedCategory) {
    if (normalizedCategory === 'all') return true;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = postHtml;
    const post = wrapper.querySelector('article.post-block');
    if (!post) return false;
    const categories = normalizeCategory(post.dataset.homeCategories || '').split(',').filter(Boolean);
    return categories.includes(normalizedCategory);
  }

  async function loadAllPostsFromIndexPages() {
    if (allPostsCache) return allPostsCache;

    const maxPage = parsePageCount();
    const parser = new DOMParser();
    const unique = new Map();

    originalPostsHtml.forEach(html => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      const canonical = wrapper.querySelector('link[itemprop="mainEntityOfPage"]');
      const key = canonical ? canonical.getAttribute('href') : html;
      unique.set(key, html);
    });

    const pageRequests = [];
    for (let page = 2; page <= maxPage; page += 1) {
      pageRequests.push(fetch(getIndexPageUrl(page)).then(resp => resp.text()));
    }

    const pageHtmlList = await Promise.all(pageRequests);
    pageHtmlList.forEach(pageHtml => {
      const doc = parser.parseFromString(pageHtml, 'text/html');
      extractPostsFromDocument(doc).forEach(html => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const canonical = wrapper.querySelector('link[itemprop="mainEntityOfPage"]');
        const key = canonical ? canonical.getAttribute('href') : html;
        if (!unique.has(key)) unique.set(key, html);
      });
    });

    allPostsCache = Array.from(unique.values());
    return allPostsCache;
  }

  function filterPostsByCategory(postsHtml, normalizedCategory) {
    return postsHtml.filter(postHtml => postHasCategory(postHtml, normalizedCategory));
  }

  async function applyFilter(category) {
    const normalized = normalizeCategory(category);
    categoryLinks.forEach(link => {
      link.classList.toggle('is-active', link.dataset.category === normalized);
    });

    if (normalized === 'all') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('category');
        window.history.replaceState(null, '', url.toString());
      } catch (error) {}
      setLoading(false);
      restoreOriginalList();
      return;
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('category', normalized);
      window.history.replaceState(null, '', url.toString());
    } catch (error) {}

    // Immediate response: filter what we already have on this page first.
    const quickMatches = filterPostsByCategory(originalPostsHtml, normalized);
    replaceWithPosts(quickMatches);

    // If we already have full cache, finalize instantly.
    if (allPostsCache) {
      const fullMatches = filterPostsByCategory(allPostsCache, normalized);
      replaceWithPosts(fullMatches);
      return;
    }

    setLoading(true);
    emptyHint.hidden = false;
    emptyHint.textContent = '正在加载该分类的更多文章...';

    try {
      const allPosts = await (prefetchPromise || loadAllPostsFromIndexPages());
      const matchedPosts = filterPostsByCategory(allPosts, normalized);
      replaceWithPosts(matchedPosts);
    } catch (error) {
      // Keep quick filter result as fallback.
      emptyHint.hidden = quickMatches.length > 0;
      if (!quickMatches.length) {
        emptyHint.textContent = '加载更多文章失败，请稍后重试。';
      }
    } finally {
      setLoading(false);
    }
  }

  listContainer.addEventListener('click', async event => {
    const link = event.target.closest('.home-category-link');
    if (!link) return;
    event.preventDefault();
    await applyFilter(link.dataset.category || getCategoryName(link) || 'all');
  });

  restoreOriginalList();
  try {
    const url = new URL(window.location.href);
    const initialCategory = normalizeCategory(url.searchParams.get('category'));
    if (initialCategory && initialCategory !== 'all') {
      applyFilter(initialCategory);
    }
  } catch (error) {}

  // Background prefetch so subsequent clicks are instant.
  prefetchPromise = loadAllPostsFromIndexPages().catch(() => null);
  panel.dataset.filterReady = '1';
}

if (document.readyState !== 'loading') {
  initHomeCategoryFilter();
}
document.addEventListener('DOMContentLoaded', initHomeCategoryFilter);
document.addEventListener('pjax:success', initHomeCategoryFilter);
