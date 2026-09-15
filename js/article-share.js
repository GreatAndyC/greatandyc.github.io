/* global document, navigator, window */

'use strict';

function getArticleShareData() {
  const title = document.querySelector('h1.post-title')?.textContent?.trim()
    || document.querySelector('meta[property="og:title"]')?.getAttribute('content')
    || document.title;
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;

  return { title, text: description, url: canonical };
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {}
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (error) {}
  textarea.remove();
  return copied;
}

function initArticleShareRoot(shareRoot) {
  if (!shareRoot || shareRoot.dataset.ready === '1') return;

  const shareButton = shareRoot.querySelector('[data-share-button]');
  const copyButton = shareRoot.querySelector('[data-share-copy]');
  const status = shareRoot.querySelector('[data-share-status]');
  if (!shareButton || !status) return;

  let statusTimer;

  const setStatus = message => {
    status.textContent = message;
    if (shareRoot.hasAttribute('data-post-share-float')) {
      shareRoot.classList.add('has-status');
      window.clearTimeout(statusTimer);
      statusTimer = window.setTimeout(() => {
        shareRoot.classList.remove('has-status');
        status.textContent = '';
      }, 2200);
    }
  };

  const copyArticleLink = async () => {
    const copied = await copyText(getArticleShareData().url);
    setStatus(copied ? shareRoot.dataset.shareCopied : shareRoot.dataset.shareFailed);
  };

  shareButton.addEventListener('click', async () => {
    const shareData = getArticleShareData();

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        setStatus(shareRoot.dataset.shareOpened);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    await copyArticleLink();
  });

  copyButton?.addEventListener('click', copyArticleLink);
  shareRoot.dataset.ready = '1';
}

function initArticleShare() {
  document.querySelectorAll('[data-post-share], [data-post-share-float]').forEach(initArticleShareRoot);
}

function initFloatingArticleShare() {
  if (typeof window.__articleShareScrollCleanup === 'function') {
    window.__articleShareScrollCleanup();
  }

  const floatingRoot = document.querySelector('[data-post-share-float]');
  const inlineRoot = document.querySelector('[data-post-share]');
  if (!floatingRoot) return;

  let lastScrollY = window.scrollY;
  let inlineVisible = false;
  let idleTimer;
  let intersectionObserver;

  const setFloatingVisibility = isVisible => {
    floatingRoot.classList.toggle('is-visible', isVisible);
  };

  const isInlineShareVisible = () => {
    if (!inlineRoot) return false;
    const rect = inlineRoot.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  };

  const updateFloatingVisibility = direction => {
    inlineVisible = isInlineShareVisible();

    if (window.scrollY < 360 || inlineVisible) {
      setFloatingVisibility(false);
      return;
    }

    if (direction === 'down') {
      setFloatingVisibility(false);
    } else {
      setFloatingVisibility(true);
    }
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const direction = currentScrollY > lastScrollY + 4
      ? 'down'
      : currentScrollY < lastScrollY - 4 ? 'up' : 'still';

    updateFloatingVisibility(direction);
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (window.scrollY >= 360 && !inlineVisible) setFloatingVisibility(true);
    }, 650);
    lastScrollY = currentScrollY;
  };

  const handleResize = () => updateFloatingVisibility('still');

  if (inlineRoot && 'IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(entries => {
      inlineVisible = entries[0].isIntersecting;
      if (inlineVisible) setFloatingVisibility(false);
    }, { threshold: 0.15 });
    intersectionObserver.observe(inlineRoot);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize);
  updateFloatingVisibility('still');

  window.__articleShareScrollCleanup = () => {
    window.clearTimeout(idleTimer);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    intersectionObserver?.disconnect();
    delete window.__articleShareScrollCleanup;
  };
}

if (document.readyState !== 'loading') {
  initArticleShare();
  initFloatingArticleShare();
}
document.addEventListener('DOMContentLoaded', () => {
  initArticleShare();
  initFloatingArticleShare();
});
document.addEventListener('pjax:success', () => {
  initArticleShare();
  initFloatingArticleShare();
});
