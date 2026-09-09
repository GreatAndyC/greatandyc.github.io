{% extends '_layout.swig' %}
{% import '_macro/sidebar.swig' as sidebar_template with context %}

{% block title %}{{ title }}{%- if theme.index_with_subtitle and subtitle %} - {{ subtitle }}{%- endif %}{% endblock %}

{% block class %}index posts-expand feed-page feed-view-list{% endblock %}

{% block content %}
  {%- set show_home_sort = true %}
  {% include '_partials/home/category-panel.swig' %}

  {# Apply a saved card preference before the first post image is parsed. #}
  <script>
    (function () {
      try {
        if (window.localStorage.getItem('home-feed-view-mode') !== 'card') return;
        var content = document.currentScript && document.currentScript.closest('.content.feed-page');
        if (!content) return;
        content.classList.remove('feed-view-list');
        content.classList.add('feed-view-card');
      } catch (error) {}
    }());
  </script>

  <div class="feed-posts-container">
  {%- for post in page.posts.toArray() %}
    {{ partial('_macro/post.swig', {post: post, is_index: true, index: loop.index}) }}
  {%- endfor %}
  </div>

  {% include '_partials/pagination.swig' %}

{% endblock %}

{% block sidebar %}
  {{ sidebar_template.render(false) }}
{% endblock %}
