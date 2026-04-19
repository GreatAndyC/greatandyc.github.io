{% extends '_layout.swig' %}
{% import '_macro/post-collapse.swig' as post_template with context %}
{% import '_macro/sidebar.swig' as sidebar_template with context %}

{% block title %}{{ __('title.tag') }}: {{ page.tag }} | {{ title }}{% endblock %}

{% block class %}tag{% endblock %}

{% block content %}
  {%- set current_lang = page.lang or config.language[0] %}
  {%- set localized_posts = page.posts.find({lang: current_lang}) %}

  {#################}
  {### TAG BLOCK ###}
  {#################}
  <div class="post-block">
    <div class="posts-collapse">
      <div class="collection-title">
        <h2 class="collection-header">
          {{- page.tag }}
          <small>{{ __('title.tag') }}</small>
        </h2>
      </div>

      {{ post_template.render(localized_posts) }}
    </div>
  </div>
  {#####################}
  {### END TAG BLOCK ###}
  {#####################}

  {% include '_partials/pagination.swig' %}

{% endblock %}

{% block sidebar %}
  {{ sidebar_template.render(false) }}
{% endblock %}
