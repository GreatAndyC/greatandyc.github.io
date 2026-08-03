{%- set og_image = page.og_image or page.photos %}
{%- if not og_image or not og_image.length %}
  {%- if page.lang === 'en' %}
    {%- set og_image = '/images/brand/social-card-en.jpg' %}
  {%- else %}
    {%- set og_image = '/images/brand/social-card-zh.jpg' %}
  {%- endif %}
{%- endif %}
{{ open_graph({
  title: title,
  description: page.description or description,
  image: og_image,
  site_name: title,
  language: page.lang,
  author: author,
  twitter_card: 'summary_large_image'
}) }}

{{ canonical() }}

{# Tell crawlers which localized page is the equivalent alternate. #}
{%- for language in languages %}
  {%- set alternate_url = i18n_path(language) %}
  {%- set alternate_href = absolute_url(alternate_url) %}
  <link rel="alternate" hreflang="{{ language }}" href="{{ alternate_href }}">
  {%- if loop.index === 1 %}
    <link rel="alternate" hreflang="x-default" href="{{ alternate_href }}">
  {%- endif %}
{%- endfor %}

{# Exports some front-matter variables to Front-End #}
<script id="page-configurations">
  // https://hexo.io/docs/variables.html
  CONFIG.page = {
    sidebar: {{ page.sidebar | json }},
    isHome : {{ is_home() }},
    isPost : {{ is_post() }},
    lang   : '{{ page.lang }}'
  };
</script>
