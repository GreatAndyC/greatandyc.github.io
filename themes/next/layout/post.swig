{% extends '_layout.swig' %}
{% import '_macro/sidebar.swig' as sidebar_template with context %}

{% block title %}{{ page.title }} | {{ title }}{% endblock %}

{% block class %}post posts-expand{% endblock %}

{% block content %}

  {{ partial('_macro/post.swig', {post: page}) }}

  {%- if config.visitor_log and config.visitor_log.enable and config.visitor_log.counts_endpoint %}
    <script src="{{ url_for('/js/post-view-count.js') }}?v={{ config.asset_version }}" data-view-counts-endpoint="{{ config.visitor_log.counts_endpoint }}" defer></script>
  {%- endif %}

  {%- if page.article_gallery %}
    <script src="{{ url_for('/js/portfolio-gallery.js') }}?v={{ config.asset_version }}" defer></script>
  {%- endif %}

{% endblock %}

{% block sidebar %}
  {{ sidebar_template.render(true) }}
{% endblock %}
