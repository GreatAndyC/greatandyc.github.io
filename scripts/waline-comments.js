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
      const applyMetaFieldHints = () => {
        let fieldsFound = 0;

        [
          ['wl-nick', '请输入昵称'],
          ['wl-mail', '请输入邮箱'],
          ['wl-link', 'https://example.com（可选）']
        ].forEach(([id, placeholder]) => {
          const field = walineElement.querySelector('#' + id);

          if (!field) return;

          fieldsFound += 1;
          field.setAttribute('placeholder', placeholder);

          if (id !== 'wl-link') {
            field.setAttribute('aria-required', 'true');
          }
        });

        return fieldsFound === 3;
      };

      const applyCommentAvatar = () => {
        const defaultAvatar = '/images/avatar-penguin.png';
        const avatarSelector = [
          '.wl-cards .wl-user-avatar',
          '.wl-cards .wl-avatar',
          '.wl-cards .wl-user > img'
        ].join(', ');

        walineElement.querySelectorAll(avatarSelector).forEach(image => {
          image.removeAttribute('srcset');

          if (image.getAttribute('src') !== defaultAvatar) {
            image.setAttribute('src', defaultAvatar);
          }
        });
      };

      init({
        el: walineElement,
        serverURL: ${serverURL},
        lang: document.documentElement.lang === 'en' ? 'en' : 'zh-CN',
        meta: ['nick', 'mail', 'link'],
        requiredMeta: ['nick', 'mail'],
        login: 'disable',
        turnstileKey: ${turnstileKey},
        imageUploader: false,
        noRss: true
      });

      // Make the metadata fields self-explanatory without changing Waline's
      // built-in requiredMeta validation. Waline renders them asynchronously.
      if (!applyMetaFieldHints()) {
        const fieldObserver = new MutationObserver(() => {
          if (applyMetaFieldHints()) fieldObserver.disconnect();
        });

        fieldObserver.observe(walineElement, {childList: true, subtree: true});
      }

      // The current site uses anonymous comments, so the supplied penguin is
      // the shared fallback avatar for comment cards only.
      const commentAvatarObserver = new MutationObserver(applyCommentAvatar);
      commentAvatarObserver.observe(walineElement, {
        attributes: true,
        attributeFilter: ['class', 'src', 'srcset'],
        childList: true,
        subtree: true
      });
      applyCommentAvatar();
    }
  }
</script>
    {%- endif %}`,
    {}
  );
});
