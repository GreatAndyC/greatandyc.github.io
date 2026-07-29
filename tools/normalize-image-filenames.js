#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  isImageFileName,
  sanitizeImageFilename,
  getUniqueFilename
} = require('./image-filenames');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'source', 'images');
const TEXT_EXTENSIONS = new Set([
  '.md', '.markdown', '.yml', '.yaml', '.json', '.js', '.cjs', '.mjs',
  '.ejs', '.njk', '.html', '.xml', '.txt', '.styl', '.css', '.scss'
]);
const IGNORED_DIRS = new Set(['.git', '.deploy_git', 'node_modules', 'public', 'source/images']);

function parseArgs(argv) {
  const args = { write: false, folder: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--write') {
      args.write = true;
      continue;
    }
    if (token === '--folder') {
      args.folder = argv[i + 1] || '';
      i += 1;
      continue;
    }
    if (token === '--help' || token === '-h') {
      args.help = true;
    }
  }
  return args;
}

function help() {
  console.log(`Normalize image filenames for Hexo.

Usage:
  node tools/normalize-image-filenames.js [--folder gallery/album-name] [--write]

Default mode is dry-run. Add --write to rename files and update references.
`);
}

function toPosixPath(input) {
  return String(input || '').split(path.sep).join('/');
}

function isPathInside(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === '' || (
    relative !== '..'
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative)
  );
}

function resolveImageRoot(folder = '') {
  const normalizedFolder = String(folder || '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/^images\//, '')
    .split(/[\\/]+/)
    .filter(Boolean)
    .join('/');
  const absolute = path.resolve(IMAGES_DIR, normalizedFolder);
  if (!isPathInside(IMAGES_DIR, absolute)) {
    throw new Error('Folder must stay inside source/images.');
  }
  return { normalizedFolder, absolute };
}

function listImageFiles(currentPath, result = []) {
  if (!fs.existsSync(currentPath)) return result;
  for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
    const fullPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      listImageFiles(fullPath, result);
      continue;
    }
    if (entry.isFile() && isImageFileName(entry.name)) {
      result.push(fullPath);
    }
  }
  return result;
}

function listTextFiles(currentPath, result = []) {
  for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
    const fullPath = path.join(currentPath, entry.name);
    const relative = toPosixPath(path.relative(ROOT, fullPath));
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(relative) || IGNORED_DIRS.has(entry.name)) continue;
      listTextFiles(fullPath, result);
      continue;
    }
    if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      result.push(fullPath);
    }
  }
  return result;
}

function buildRenamePlan(files) {
  const reservedByDir = new Map();
  const plan = [];

  for (const filePath of files.sort((left, right) => left.localeCompare(right))) {
    const directory = path.dirname(filePath);
    const currentName = path.basename(filePath);
    const safeName = sanitizeImageFilename(currentName);
    if (safeName === currentName) continue;

    if (!reservedByDir.has(directory)) {
      reservedByDir.set(directory, new Set());
    }
    const nextName = getUniqueFilename(directory, safeName, reservedByDir.get(directory));
    const nextPath = path.join(directory, nextName);
    const oldRelative = toPosixPath(path.relative(IMAGES_DIR, filePath));
    const nextRelative = toPosixPath(path.relative(IMAGES_DIR, nextPath));

    plan.push({
      oldPath: filePath,
      nextPath,
      oldName: currentName,
      nextName,
      oldPublicPath: `/images/${oldRelative}`,
      nextPublicPath: `/images/${nextRelative}`
    });
  }

  return plan;
}

function applyReferenceUpdates(plan) {
  const replacements = plan.map(item => [item.oldPublicPath, item.nextPublicPath]);
  const updatedFiles = [];
  let replacementCount = 0;

  for (const filePath of listTextFiles(ROOT)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let nextContent = content;
    for (const [from, to] of replacements) {
      const count = nextContent.split(from).length - 1;
      if (count > 0) {
        nextContent = nextContent.split(from).join(to);
        replacementCount += count;
      }
    }
    if (nextContent !== content) {
      fs.writeFileSync(filePath, nextContent, 'utf8');
      updatedFiles.push(toPosixPath(path.relative(ROOT, filePath)));
    }
  }

  return { updatedFiles, replacementCount };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    help();
    return;
  }

  const { absolute, normalizedFolder } = resolveImageRoot(args.folder);
  const plan = buildRenamePlan(listImageFiles(absolute));
  if (!plan.length) {
    console.log(`No image filenames need changes in source/images/${normalizedFolder}`.replace(/\/$/, ''));
    return;
  }

  if (!args.write) {
    console.log('Dry-run only. Add --write to apply these renames:');
    plan.forEach(item => console.log(`${item.oldPublicPath} -> ${item.nextPublicPath}`));
    return;
  }

  plan.forEach(item => fs.renameSync(item.oldPath, item.nextPath));
  const references = applyReferenceUpdates(plan);

  console.log(`Renamed ${plan.length} image file(s).`);
  plan.forEach(item => console.log(`${item.oldPublicPath} -> ${item.nextPublicPath}`));
  console.log(`Updated ${references.replacementCount} reference(s) in ${references.updatedFiles.length} file(s).`);
}

main();
