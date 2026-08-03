{% extends '_layout.swig' %}
{% import '_macro/sidebar.swig' as sidebar_template with context %}

{% block title %}{{ __('title.category') }}: {{ page.category }} | {{ title }}{% endblock %}

{% block class %}category posts-expand feed-page{% endblock %}

{% block content %}
  {%- set current_lang = page.lang or config.language[0] %}
  {%- set localized_posts = page.posts.find({lang: current_lang}) %}
  {%- set current_category = page.category %}
  {% include '_partials/home/category-panel.swig' %}

  <div class="feed-posts-container">
  {%- for post in localized_posts.toArray() %}
    {{ partial('_macro/post.swig', {post: post, is_index: true, index: loop.index}) }}
  {%- endfor %}
  </div>

  {% include '_partials/pagination.swig' %}

{% endblock %}

{% block sidebar %}
  {{ sidebar_template.render(false) }}
{% endblock %}
