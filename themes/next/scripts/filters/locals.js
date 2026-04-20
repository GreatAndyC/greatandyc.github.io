/* global hexo */

'use strict';

const path = require('path');

function getLocalizedConfigValue(config, key, lang) {
  const localizedMap = config[`${key}_i18n`];

  if (!localizedMap || typeof localizedMap !== 'object') {
    return config[key];
  }

  if (localizedMap[lang]) {
    return localizedMap[lang];
  }

  const shortLang = typeof lang === 'string' ? lang.split('-')[0] : '';
  if (shortLang && localizedMap[shortLang]) {
    return localizedMap[shortLang];
  }

  return config[key];
}

hexo.extend.filter.register('template_locals', locals => {
  const { env, config } = hexo;
  const { __, theme } = locals;
  const { i18n } = hexo.theme;
  const pageLang = locals.page.lang || locals.page.language || (Array.isArray(config.language) ? config.language[0] : config.language);
  // Hexo & NexT version
  locals.hexo_version = env.version;
  locals.next_version = require(path.normalize('../../package.json')).version;
  // Language & Config
  locals.title = getLocalizedConfigValue(config, 'title', pageLang);
  locals.subtitle = __('subtitle') !== 'subtitle' ? __('subtitle') : getLocalizedConfigValue(config, 'subtitle', pageLang);
  locals.author = getLocalizedConfigValue(config, 'author', pageLang);
  locals.description = __('description') !== 'description' ? __('description') : getLocalizedConfigValue(config, 'description', pageLang);
  locals.languages = [...i18n.languages];
  locals.languages.splice(locals.languages.indexOf('default'), 1);
  locals.page.lang = pageLang;
  // Creative Commons
  locals.ccURL = 'https://creativecommons.org/' + (theme.creative_commons.license === 'zero' ? 'publicdomain/zero/1.0/' : 'licenses/' + theme.creative_commons.license + '/4.0/') + (theme.creative_commons.language || '');
  // PJAX
  locals.pjax = theme.pjax ? ' data-pjax' : '';
});
