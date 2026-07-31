<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="{{ theme.android_chrome_color }}">
<meta name="generator" content="Hexo {{ hexo_version }}">

<link rel="shortcut icon" type="image/x-icon" href="{{ url_for('/favicon.ico') }}?v={{ config.asset_version }}">
{%- if theme.favicon.svg %}
  <link rel="icon" type="image/svg+xml" sizes="any" href="{{ url_for(theme.favicon.svg) }}?v={{ config.asset_version }}">
{%- endif %}
{%- if theme.favicon.apple_touch_icon %}
  <link rel="apple-touch-icon" sizes="180x180" href="{{ url_for(theme.favicon.apple_touch_icon) }}?v={{ config.asset_version }}">
{%- endif %}
{%- if theme.favicon.medium %}
  <link rel="icon" type="image/png" sizes="32x32" href="{{ url_for(theme.favicon.medium) }}?v={{ config.asset_version }}">
{%- endif %}
{%- if theme.favicon.small %}
  <link rel="icon" type="image/png" sizes="16x16" href="{{ url_for(theme.favicon.small) }}?v={{ config.asset_version }}">
{%- endif %}
{%- if theme.favicon.safari_pinned_tab %}
  <link rel="mask-icon" href="{{ url_for(theme.favicon.safari_pinned_tab) }}?v={{ config.asset_version }}" color="{{ theme.android_chrome_color }}">
{%- endif %}
{%- if theme.favicon.android_manifest %}
  <link rel="manifest" href="{{ url_for(theme.favicon.android_manifest) }}?v={{ config.asset_version }}">
{%- endif %}
{%- if theme.favicon.ms_browserconfig %}
  <meta name="msapplication-config" content="{{ url_for(theme.favicon.ms_browserconfig) }}">
{%- endif %}

{%- if theme.disable_baidu_transformation %}
  <meta http-equiv="Cache-Control" content="no-transform">
  <meta http-equiv="Cache-Control" content="no-siteapp">
{%- endif %}
{%- if theme.google_site_verification %}
  <meta name="google-site-verification" content="{{ theme.google_site_verification }}">
{%- endif %}
{%- if theme.bing_site_verification %}
  <meta name="msvalidate.01" content="{{ theme.bing_site_verification }}">
{%- endif %}
{%- if theme.yandex_site_verification %}
  <meta name="yandex-verification" content="{{ theme.yandex_site_verification }}">
{%- endif %}
{%- if theme.baidu_site_verification %}
  <meta name="baidu-site-verification" content="{{ theme.baidu_site_verification }}">
{%- endif %}

<link rel="stylesheet" href="{{ url_for(theme.css) }}/main.css?v={{ config.asset_version }}">

{{ next_font() }}

{%- set font_awesome_uri = theme.vendors.fontawesome or next_vendors('font-awesome/css/all.min.css') %}
<link rel="stylesheet" href="{{ font_awesome_uri }}">

{%- if theme.fancybox %}
  {%- set fancybox_css_uri = theme.vendors.fancybox_css or next_vendors('//cdn.jsdelivr.net/gh/fancyapps/fancybox@3/dist/jquery.fancybox.min.css') %}
  <link rel="stylesheet" href="{{ fancybox_css_uri }}">
{%- endif %}

{%- if theme.pace.enable %}
  {%- set pace_css_uri = theme.vendors.pace_css or next_vendors('pace/pace-theme-' + theme.pace.theme + '.min.css') %}
  {%- set pace_js_uri = theme.vendors.pace or next_vendors('pace/pace.min.js') %}
  <link rel="stylesheet" href="{{ pace_css_uri }}">
  <script src="{{ pace_js_uri }}"></script>
{%- endif %}

{{ next_config() }}
