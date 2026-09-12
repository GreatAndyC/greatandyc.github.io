<div class="mobile-rail-profile" aria-label="{{ author }}">
  {%- if theme.avatar.url %}
    <span class="mobile-rail-profile-image-frame">
      <img
        class="mobile-rail-profile-image"
        src="{{ url_for(theme.avatar.url) }}"
        alt="{{ author }}"
        width="968"
        height="868"
        decoding="async"
      >
    </span>
  {%- endif %}
  <span class="mobile-rail-profile-copy">
    <strong class="mobile-rail-profile-name">{{ author }}</strong>
    <span class="mobile-rail-profile-description">{{ description }}</span>
  </span>
</div>
