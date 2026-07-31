{%- set og_image = page.og_image or page.photos %}
{%- if not og_image or not og_image.length %}
  {%- if page.lang === 'en' %}
    {%- set og_image = '/images/brand/social-card-en.jpg' %}
  {%- else %}
    {%- set og_image = '/images/brand/social-card-zh.jpg' %}
  {%- endif %}
{%- endif %}
{{ open_graph({
  description: page.description or description,
  image: og_image,
  language: page.lang,
  twitter_card: 'summary_large_image'
}) }}

{{ canonical() }}

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
