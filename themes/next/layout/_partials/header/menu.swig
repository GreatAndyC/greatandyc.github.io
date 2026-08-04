{% import 'menu-item.swig' as menu_item with context %}

<nav id="site-navigation" class="site-nav" aria-label="{{ __('accessibility.primary_navigation') }}">
{%- if theme.menu %}
  {{ partial('_partials/header/mobile-rail-profile.swig', {}, {cache: theme.cache.enable}) }}
  <ul id="menu" class="main-menu menu">
    {%- for name, path in theme.menu %}
      {%- if name | lower == 'tags' %}
        <li class="menu-section-label" aria-hidden="true">{{ __('menu.explore') }}</li>
      {%- endif %}
      {%- set respath = path %}
      {%- if path == '[object Object]' %}
        {# Main Menu (default menu item for Submenu) #}
        {%- for subname, subpath in path %}
          {%- set itemName = subname | lower %}
          {%- set respath = subpath %}
          {%- if itemName == 'default' %}
            {%- set itemName = name | lower %}
            {{ menu_item.render(name, itemName, respath) }}
          {%- endif %}
        {%- endfor %}
      {% else %}
        {# Main Menu (standard menu items) #}
        {%- set itemName = name | lower %}
        {{- menu_item.render(name, itemName, respath) | trim }}
      {%- endif %}
    {%- endfor %}
    <li class="menu-item menu-item-language">
      {{ partial('_partials/languages.swig', {}, {cache: theme.cache.enable}) }}
    </li>

  </ul>
  {{ partial('_partials/header/mobile-rail-links.swig', {}, {cache: theme.cache.enable}) }}
{%- endif %}
</nav>
