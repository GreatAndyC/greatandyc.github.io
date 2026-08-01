'use strict';

if (window.location.protocol === 'file:') {
  window.location.replace('http://127.0.0.1:4010/');
} else {
  try {
    const storedTheme = window.localStorage.getItem('local-cms-ui-skin-v1');
    const themeCatalog = window.CMS_SCHOOL_THEME_CATALOG;
    const allowedThemes = new Set(Object.keys(themeCatalog && themeCatalog.schools || {}));
    const defaultTheme = themeCatalog && themeCatalog.defaultTheme || 'stanford';
    const initialThemeId = allowedThemes.has(storedTheme)
      ? storedTheme
      : defaultTheme;
    document.documentElement.dataset.studioSkin = initialThemeId;
  } catch (_) {
    document.documentElement.dataset.studioSkin = 'stanford';
  }
}
