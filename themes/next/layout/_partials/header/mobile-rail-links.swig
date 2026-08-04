{%- if theme.social or theme.links %}
  <div class="mobile-rail-links" aria-label="{% if page.lang === 'zh-CN' %}外部链接{% else %}External links{% endif %}">
    {%- set mobileLinksTitle = theme.links_settings.title %}
    {%- if theme.links_settings.title.zh-CN or theme.links_settings.title.en %}
      {%- set mobileLinksTitle = theme.links_settings.title[page.lang] or theme.links_settings.title['default'] or theme.links_settings.title.en or theme.links_settings.title.zh-CN %}
    {%- endif %}
    <div class="mobile-rail-links-heading">
      {%- if theme.links_settings.icon %}<i class="{{ theme.links_settings.icon }} fa-fw" aria-hidden="true"></i>{%- endif %}
      <span>{{ mobileLinksTitle }}</span>
    </div>
    <div class="mobile-rail-links-list">
      {%- if theme.social %}
        {%- for name, link in theme.social %}
          {%- set mobileURL = link.split('||')[0] | trim %}
          {%- set mobileIcon = '' %}
          {%- if theme.social_icons.enable and link.split('||')[1] %}
            {%- set mobileIcon = '<i class="' + link.split('||')[1] | trim + ' fa-fw" aria-hidden="true"></i>' %}
          {%- endif %}
          {{ next_url(mobileURL, mobileIcon + '<span>' + name + '</span>', {class: 'mobile-rail-link', title: name + ' → ' + mobileURL}) }}
        {%- endfor %}
      {%- endif %}
      {%- if theme.links %}
        {%- for blogrollKey, blogrollConfig in theme.links %}
          {%- set mobileText = blogrollKey %}
          {%- set mobileURL = blogrollConfig %}
          {%- if blogrollConfig.url %}
            {%- set mobileURL = blogrollConfig.url %}
            {%- if blogrollConfig.title %}
              {%- set mobileText = blogrollConfig.title[page.lang] or blogrollConfig.title['default'] or blogrollConfig.title.en or blogrollConfig.title['zh-CN'] or blogrollKey %}
            {%- endif %}
          {%- endif %}
          {{ next_url(mobileURL, '<i class="fa fa-link fa-fw" aria-hidden="true"></i><span>' + mobileText + '</span>', {class: 'mobile-rail-link', title: mobileText + ' → ' + mobileURL}) }}
        {%- endfor %}
      {%- endif %}
    </div>
  </div>
{%- endif %}
