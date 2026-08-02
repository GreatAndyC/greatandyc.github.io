{%- if theme.language_switcher and languages.length > 1 %}
  <div class="languages language-switcher">
    <span class="language-switcher-label" aria-hidden="true">{% if page.lang === 'zh-CN' %}语言{% else %}LANGUAGE{% endif %}</span>
    <span class="language-switcher-options" role="group"{% if page.lang === 'zh-CN' %} aria-label="切换语言"{% else %} aria-label="Switch language"{% endif %}>
      {% for language in languages %}
        {% set languageLabel = language_name(language) %}
        {% if language === 'en' %}
          {% set languageLabel = 'EN' %}
        {% elif language === 'zh-CN' %}
          {% set languageLabel = '中' %}
        {% endif %}
        {% if language === page.lang %}
          <span class="language-switcher-option is-current" data-language="{{ language }}" data-href="{{ i18n_path(language) }}" aria-current="page">{{ languageLabel }}</span>
        {% else %}
          <a class="language-switcher-option" href="{{ i18n_path(language) }}" data-language="{{ language }}" data-href="{{ i18n_path(language) }}" hreflang="{{ language }}" lang="{{ language }}">{{ languageLabel }}</a>
        {% endif %}
        {% if loop.index !== languages.length %}
          <span class="language-switcher-divider" aria-hidden="true">/</span>
        {% endif %}
      {% endfor %}
    </span>
  </div>
{%- endif %}
