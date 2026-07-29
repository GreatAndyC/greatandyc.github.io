{# Modern browsers use WOFF2. These final declarations intentionally omit
   Font Awesome's unshipped legacy .woff/.ttf fallbacks, which otherwise cause
   avoidable 404s when a browser retries after a transient font response. #}
<style>
  @font-face {
    font-family: "Font Awesome 5 Brands";
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url("/lib/font-awesome/webfonts/fa-brands-400.woff2") format("woff2");
  }

  @font-face {
    font-family: "Font Awesome 5 Free";
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url("/lib/font-awesome/webfonts/fa-regular-400.woff2") format("woff2");
  }

  @font-face {
    font-family: "Font Awesome 5 Free";
    font-style: normal;
    font-weight: 900;
    font-display: block;
    src: url("/lib/font-awesome/webfonts/fa-solid-900.woff2") format("woff2");
  }
</style>
