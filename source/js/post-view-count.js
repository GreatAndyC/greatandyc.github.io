(function () {
  'use strict';

  var script = document.currentScript;
  var endpoint = script && script.dataset ? script.dataset.viewCountsEndpoint : '';
  var countElement = document.querySelector('[data-post-view-count]');

  if (!endpoint || !countElement) return;

  function canonicalPath(pathname) {
    var path = pathname.replace(/\/index\.html$/, '/');

    if (path.indexOf('/en/') === 0) {
      path = path.slice(3);
    } else if (path.indexOf('/zh-CN/') === 0) {
      path = path.slice(6);
    }

    path = path.replace(/\/{2,}/g, '/');
    return path === '/' ? path : path.replace(/\/+$/, '') + '/';
  }

  window.fetch(endpoint, { credentials: 'omit', mode: 'cors' })
    .then(function (response) {
      if (!response.ok) throw new Error('View count unavailable');
      return response.json();
    })
    .then(function (payload) {
      var counts = payload && payload.counts;
      var value = counts && counts[canonicalPath(window.location.pathname)];
      var count = Number(value == null ? 0 : value);

      if (Number.isSafeInteger(count) && count >= 0) {
        countElement.textContent = count.toLocaleString(document.documentElement.lang || undefined);
      }
    })
    .catch(function () {
      // Keep the visible dash when the counter is temporarily unavailable.
    });
}());
