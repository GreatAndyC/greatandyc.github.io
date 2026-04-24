/* global hexo */

'use strict';

const pagination = require('hexo-pagination');
const path = require('path');

function getLanguages(config) {
  const languages = [].concat(config.language || []).filter(Boolean);
  return {
    defaultLanguage: languages[0],
    languages
  };
}

function generateLocalizedTaxonomy(locals, collection, type, configKey) {
  const config = this.config;
  const { languages, defaultLanguage } = getLanguages(config);
  const perPage = config[configKey].per_page;
  const paginationDir = config.pagination_dir || 'page';
  const orderBy = config[configKey].order_by || '-date';

  return languages.reduce((pages, language) => {
    const localizedPages = collection.reduce((result, item) => {
      const posts = item.posts.find({ lang: language }).sort(orderBy);

      if (!posts.length) return result;

      const localizedPath = language === defaultLanguage
        ? item.path
        : path.posix.join(language, item.path);
      const data = pagination(localizedPath, posts, {
        perPage,
        layout: [type, 'archive', 'index'],
        format: `${paginationDir}/%d/`,
        data: {
          [type]: item.name,
          lang: language
        }
      });

      return result.concat(data);
    }, []);

    return pages.concat(localizedPages);
  }, []);
}

hexo.extend.generator.register('localized-tag', function(locals) {
  return generateLocalizedTaxonomy.call(this, locals, locals.tags, 'tag', 'tag_generator');
});

hexo.extend.generator.register('localized-category', function(locals) {
  return generateLocalizedTaxonomy.call(this, locals, locals.categories, 'category', 'category_generator');
});
