/* global hexo */

'use strict';

// CI supplies the commit SHA so every deployment gets a deterministic asset
// URL. Local builds keep the checked-in fallback from _config.yml.
hexo.extend.filter.register('before_generate', () => {
  const assetVersion = process.env.ASSET_VERSION && process.env.ASSET_VERSION.trim();
  if (assetVersion) hexo.config.asset_version = assetVersion.slice(0, 12);
});
