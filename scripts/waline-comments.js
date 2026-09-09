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
      const turnstileScriptURL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

      // Waline v3 currently requests Turnstile's compact mode internally.
      // Preload the same script and override only the render size before
      // Waline submits a comment, so the widget uses Cloudflare's standard
      // 300x65 layout without changing the server-side verification flow.
      const prepareStandardTurnstile = () => new Promise(resolve => {
        const patchTurnstile = () => {
          const turnstile = window.turnstile;

          if (!turnstile || typeof turnstile.render !== 'function') return false;
          if (turnstile.render.__walineStandardSize) return true;

          const originalRender = turnstile.render;
          const standardRender = (container, options = {}) => originalRender.call(
            turnstile,
            container,
            { ...options, size: 'normal' }
          );

          standardRender.__walineStandardSize = true;
          turnstile.render = standardRender;

          return true;
        };

        if (patchTurnstile()) {
          resolve();
          return;
        }

        let script = Array.from(document.scripts).find(item => item.src === turnstileScriptURL);

        if (!script) {
          script = document.createElement('script');
          script.src = turnstileScriptURL;
          script.async = false;
          document.head.appendChild(script);
        }

        const finish = () => {
          // VueUse's useScriptTag, which Waline uses, reuses this exact
          // script when it has the data-loaded marker.
          script.setAttribute('data-loaded', 'true');
          patchTurnstile();
          resolve();
        };

        if (script.hasAttribute('data-loaded')) {
          finish();
        } else {
          script.addEventListener('load', finish, { once: true });
          script.addEventListener('error', resolve, { once: true });
        }
      });

      await prepareStandardTurnstile();

      const commentPlaceholder = document.documentElement.lang === 'en'
        ? 'Leave a comment. Markdown is supported.'
        : '欢迎评论，支持 Markdown 格式内容输入';

      const applyMetaFieldHints = () => {
        let fieldsFound = 0;

        [
          ['wl-nick', '请输入昵称'],
          ['wl-mail', '请输入邮箱'],
          ['wl-link', 'https://example.com（可选）'],
          ['wl-edit', commentPlaceholder]
        ].forEach(([id, placeholder]) => {
          const field = walineElement.querySelector('#' + id);

          if (!field) return;

          fieldsFound += 1;
          field.setAttribute('placeholder', placeholder);

          if (id !== 'wl-link') {
            field.setAttribute('aria-required', 'true');
          }
        });

        return fieldsFound === 4;
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
        locale: {
          placeholder: document.documentElement.lang === 'en'
            ? 'Leave a comment. Markdown is supported.'
            : '欢迎评论，支持 Markdown 格式内容输入'
        },
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

      // Waline can rerender the editor after comments finish loading. Keep
      // the custom placeholder in place without replacing reply hints.
      const applyCommentPlaceholder = () => {
        const currentWalineElement = document.querySelector('#waline');
        const field = currentWalineElement?.querySelector('#wl-edit');
        const currentPlaceholder = field?.getAttribute('placeholder') || '';

        if (field && !currentPlaceholder.startsWith('@') && currentPlaceholder !== commentPlaceholder) {
          field.setAttribute('placeholder', commentPlaceholder);
        }
      };

      const commentPlaceholderObserver = new MutationObserver(applyCommentPlaceholder);
      commentPlaceholderObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['placeholder'],
        childList: true,
        subtree: true
      });
      applyCommentPlaceholder();

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
