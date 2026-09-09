'use strict';

/* global hexo */

// Inject Waline without modifying the vendored NexT theme. The feature stays
// disabled until the public Turnstile site key is added to _config.yml.
hexo.extend.filter.register('theme_inject', injects => {
  const config = hexo.config.waline || {};

  if (!config.enable || !config.server_url || !config.turnstile_key) return;

  const serverURL = JSON.stringify(config.server_url);
  const turnstileKey = JSON.stringify(config.turnstile_key);

  injects.comment.raw(
    'waline',
    '<div class="comments waline-comments" id="waline"></div>',
    {},
    {cache: true}
  );

  injects.head.raw(
    'waline-style',
    `{%- if page.comments %}
<link rel="stylesheet" href="https://unpkg.com/@waline/client@v3/dist/waline.css">
{%- endif %}`,
    {},
    {cache: true}
  );

  injects.bodyEnd.raw(
    'waline',
    `{%- if page.comments %}
<script type="module">
  import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';

  init({
    el: '#waline',
    serverURL: ${serverURL},
    lang: document.documentElement.lang === 'en' ? 'en' : 'zh-CN',
    meta: ['mail'],
    requiredMeta: ['mail'],
    login: 'disable',
    turnstileKey: ${turnstileKey},
    noRss: true
  });
</script>
{%- endif %}`,
    {},
    {cache: true}
  );
});
