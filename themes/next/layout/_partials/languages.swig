{%- if theme.language_switcher and languages.length > 1 %}
  <div class="languages">
    <label class="lang-select-label" for="site-language-select">
      <i class="fa fa-language"></i>
      <span>{{ language_name(page.lang) }}</span>
      <i class="fa fa-angle-up" aria-hidden="true"></i>
    </label>
    <select id="site-language-select" class="lang-select" data-canonical="">
      {% for language in languages %}
        <option value="{{ language }}" data-href="{{ i18n_path(language) }}"{% if language === page.lang %} selected{% endif %}>
          {{ language_name(language) }}
        </option>
      {% endfor %}
    </select>
  </div>
{%- endif %}
