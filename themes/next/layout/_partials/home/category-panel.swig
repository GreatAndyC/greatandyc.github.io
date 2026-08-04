{%- set panel_current_category = current_category or 'all' %}
{%- set panel_all_url = localized_path(config.root) %}
{%- set localized_categories_total = localized_category_count() %}
{%- set panel_category_limit = (config.home_category_panel and config.home_category_panel.max_items) or 10 %}
{%- set panel_categories_path = '/categories/' %}
{%- if theme.menu.categories %}
  {%- set panel_categories_path = theme.menu.categories.split('||')[0] | trim %}
{%- endif %}
{%- set panel_categories_url = localized_path(panel_categories_path) %}
{%- if localized_categories_total > 0 %}
  <section class="home-category-panel" aria-label="{{ __('state.categories') }}" data-current-category="{{ panel_current_category }}">
    <div class="home-category-panel-head">
      <span class="home-category-panel-title">{{ __('state.categories') }}</span>
    </div>
    <div class="home-category-nav-shell">
      <nav class="home-category-nav" aria-label="{{ __('accessibility.category_navigation') }}" data-category-scroller>
        <a class="home-category-link{%- if panel_current_category == 'all' %} is-active{%- endif %}" href="{{ panel_all_url }}" data-category="all">{{ __('home.all') }}</a>
        {{
          localized_list_categories({
            style: 'flat',
            class: 'home-category',
            separator: '',
            show_count: true,
            orderby: 'length',
            order: -1,
            amount: panel_category_limit,
            include_current: true,
            current: panel_current_category
          })
        }}
        {%- if localized_categories_total > panel_category_limit %}
          <a class="home-category-link home-category-link-more" href="{{ panel_categories_url }}">{{ __('home.more_categories') }}</a>
        {%- endif %}
      </nav>
      <span class="home-category-scroll-hint" data-category-scroll-hint aria-hidden="true">
        <span>{{ __('home.swipe_categories') }}</span>
        <i class="fa fa-angle-right" aria-hidden="true"></i>
      </span>
    </div>
    <div class="home-category-panel-tools">
      {%- if theme.algolia_search.enable or theme.local_search.enable %}
        <button class="home-category-search popup-trigger" type="button" aria-label="{{ __('menu.search') }}">
          <i class="fa fa-search home-category-search-icon" aria-hidden="true"></i>
          <span class="home-category-search-label">{{ __('menu.search') }}</span>
        </button>
      {%- endif %}
      {%- if show_home_sort %}
        <div class="home-sort-group" data-home-sort role="group" aria-label="{{ __('home.sort_label') }}">
          <span class="home-sort-label">{{ __('home.sort_label') }}</span>
          <button class="home-sort-option is-active" type="button" aria-pressed="true" data-sort-mode="published">{{ __('home.sort_published') }}</button>
          <button class="home-sort-option" type="button" aria-pressed="false" data-sort-mode="updated">{{ __('home.sort_updated') }}</button>
          <button class="home-sort-option" type="button" aria-pressed="false" data-sort-mode="hot">{{ __('home.sort_hot') }}</button>
        </div>
      {%- endif %}
      <div class="home-view-toggle" role="group" aria-label="文章视图切换">
        <button class="home-view-button" type="button" data-view-mode="card" aria-label="卡片视图"><i class="fa fa-th-large" aria-hidden="true"></i></button>
        <button class="home-view-button is-active" type="button" data-view-mode="list" aria-label="列表视图"><i class="fa fa-list" aria-hidden="true"></i></button>
      </div>
    </div>
  </section>
{%- endif %}
