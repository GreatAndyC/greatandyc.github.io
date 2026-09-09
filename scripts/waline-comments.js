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
    '{%- if page.comments and is_post() %}<div class="comments waline-comments" id="waline"></div>{%- endif %}',
    {},
    {cache: true}
  );

  injects.head.raw(
    'waline-style',
    `{%- if page.comments and is_post() %}
<link rel="stylesheet" href="https://unpkg.com/@waline/client@v3/dist/waline.css">
{%- endif %}`,
    {}
  );

  injects.bodyEnd.raw(
    'waline',
    `{%- if page.comments and is_post() %}
<script type="module">
  const walineElement = document.querySelector('#waline');

  if (walineElement) {
    const { init } = await import('https://unpkg.com/@waline/client@v3/dist/waline.js');

    if (walineElement.isConnected) {
      init({
        el: walineElement,
        serverURL: ${serverURL},
        lang: document.documentElement.lang === 'en' ? 'en' : 'zh-CN',
        meta: ['mail'],
        requiredMeta: ['mail'],
        login: 'disable',
        turnstileKey: ${turnstileKey},
        noRss: true
      });
    }
  }
</script>
    {%- endif %}`,
    {}
  );
});
