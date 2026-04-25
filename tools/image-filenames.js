const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg']);

function isImageFileName(filename = '') {
  return IMAGE_EXTENSIONS.has(path.extname(String(filename || '')).toLowerCase());
}

function sanitizeImageFilename(filename = '', fallbackPrefix = 'image') {
  const parsed = path.parse(path.basename(String(filename || '')));
  const ext = parsed.ext;
  const stem = parsed.name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/^\.+/, '')
    .replace(/^_+/, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

  const safeStem = stem || `${fallbackPrefix}-${Date.now()}`;
  return `${safeStem}${ext}`;
}

function getUniqueFilename(directory, preferredName, reservedNames = new Set()) {
  const parsed = path.parse(preferredName);
  let candidate = preferredName;
  let index = 2;

  while (
    reservedNames.has(candidate.toLowerCase()) ||
    fs.existsSync(path.join(directory, candidate))
  ) {
    candidate = `${parsed.name}-${index}${parsed.ext}`;
    index += 1;
  }

  reservedNames.add(candidate.toLowerCase());
  return candidate;
}

module.exports = {
  IMAGE_EXTENSIONS,
  isImageFileName,
  sanitizeImageFilename,
  getUniqueFilename
};
