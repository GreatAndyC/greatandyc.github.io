{%- set panel_current_category = current_category or 'all' %}
{%- set panel_all_url = localized_path(config.root) %}
{%- set panel_view_card_label = '卡片' %}
{%- set panel_view_list_label = '列表' %}
{%- set localized_categories_total = localized_category_count() %}
{%- if localized_categories_total > 0 %}
  <section class="home-category-panel" aria-label="{{ __('state.categories') }}" data-current-category="{{ panel_current_category }}">
    <div class="home-category-panel-head">
      <span class="home-category-panel-title">{{ __('state.categories') }}</span>
    </div>
    <nav class="home-category-nav">
      <a class="home-category-link{%- if panel_current_category == 'all' %} is-active{%- endif %}" href="{{ panel_all_url }}" data-category="all">全部</a>
      {{
        localized_list_categories({
          style: 'flat',
          class: 'home-category',
          separator: '',
          show_count: true
        })
      }}
    </nav>
    <div class="home-category-panel-tools">
      {%- if theme.algolia_search.enable or theme.local_search.enable %}
        <button class="home-category-search popup-trigger" type="button" aria-label="{{ __('menu.search') }}">
          <i class="fa fa-search home-category-search-icon" aria-hidden="true"></i>
          <span class="home-category-search-label">{{ __('menu.search') }}</span>
        </button>
      {%- endif %}
      <div class="home-view-toggle" role="group" aria-label="文章视图切换">
        <button class="home-view-button is-active" type="button" data-view-mode="card">{{ panel_view_card_label }}</button>
        <button class="home-view-button" type="button" data-view-mode="list">{{ panel_view_list_label }}</button>
      </div>
    </div>
  </section>
{%- endif %}
