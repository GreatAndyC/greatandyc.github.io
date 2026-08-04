{% macro render(display_toc) %}
  <div class="toggle sidebar-toggle">
    <span class="toggle-line toggle-line-first"></span>
    <span class="toggle-line toggle-line-middle"></span>
    <span class="toggle-line toggle-line-last"></span>
  </div>

  {%- set display_toc = page.toc.enable and display_toc %}
  {%- if display_toc %}
    {%- set toc = toc(page.content, { class: "nav", list_number: page.toc.number, max_depth: page.toc.max_depth }) %}
    {%- set display_toc = toc.length > 1 and display_toc %}
  {%- endif %}
  {%- set hide_sidebar_overview = is_post() and display_toc %}

  <aside class="sidebar{%- if page.path === 'about/index.html' or page.path === 'en/about/index.html' %} sidebar-about{%- endif %}{%- if display_toc %} sidebar-with-toc{%- endif %}">
    <div class="sidebar-inner">

      <ul class="sidebar-nav motion-element">
        <li class="sidebar-nav-toc">
          {{ __('sidebar.toc') }}
        </li>
        <li class="sidebar-nav-overview"{%- if hide_sidebar_overview %} hidden aria-hidden="true"{%- endif %}>
          {{ __('sidebar.overview') }}
        </li>
      </ul>

      <!--noindex-->
      <div class="post-toc-wrap sidebar-panel">
        {%- if display_toc %}
          <div class="post-toc motion-element">{{ toc }}</div>
        {%- endif %}
      </div>
      <!--/noindex-->

      <div class="site-overview-wrap sidebar-panel"{%- if hide_sidebar_overview %} hidden aria-hidden="true"{%- endif %}>
        {{ partial('_partials/sidebar/site-overview.swig', {}, {cache: theme.cache.enable}) }}

        {{- next_inject('sidebar') }}
      </div>

      {%- if theme.back2top.enable and theme.back2top.sidebar %}
        <div class="back-to-top motion-element">
          <i class="fa fa-arrow-up"></i>
          <span>0%</span>
        </div>
      {%- endif %}

    </div>
  </aside>
  <div id="sidebar-dimmer"></div>
{% endmacro %}
