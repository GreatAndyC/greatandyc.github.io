{% extends '_layout.swig' %}
{% import '_macro/sidebar.swig' as sidebar_template with context %}

{% block title %}{{ title }}{%- if theme.index_with_subtitle and subtitle %} - {{ subtitle }}{%- endif %}{% endblock %}

{% block class %}index posts-expand{% endblock %}

{% block content %}

  {%- set localized_categories_total = localized_category_count() %}
  {%- if localized_categories_total > 0 %}
    <section class="home-category-panel" aria-label="{{ __('state.categories') }}">
      <div class="home-category-panel-head">
        <span class="home-category-panel-title">{{ __('state.categories') }}</span>
      </div>
      <nav class="home-category-nav">
        <a class="home-category-link is-active" href="#" data-category="all">全部</a>
        {{
          localized_list_categories({
            style: 'flat',
            class: 'home-category',
            separator: '',
            show_count: true
          })
        }}
      </nav>
    </section>
  {%- endif %}

  {%- for post in page.posts.toArray() %}
    {{ partial('_macro/post.swig', {post: post, is_index: true}) }}
  {%- endfor %}

  {% include '_partials/pagination.swig' %}

{% endblock %}

{% block sidebar %}
  {{ sidebar_template.render(false) }}
{% endblock %}
