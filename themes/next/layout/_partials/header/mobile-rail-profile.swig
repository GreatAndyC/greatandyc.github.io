<div class="mobile-rail-profile" aria-label="{{ author }}">
  {%- if theme.avatar.url %}
    <img
      class="mobile-rail-profile-image"
      src="{{ url_for(theme.avatar.url) }}"
      alt="{{ author }}"
      width="56"
      height="56"
      decoding="async"
    >
  {%- endif %}
  <span class="mobile-rail-profile-copy">
    <strong class="mobile-rail-profile-name">{{ author }}</strong>
    <span class="mobile-rail-profile-description">{{ description }}</span>
  </span>
</div>
