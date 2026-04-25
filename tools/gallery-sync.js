#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const GALLERY_DOC_DIR = path.join(process.cwd(), "content", "gallery");
const GALLERY_DATA_PATH = path.join(process.cwd(), "source", "_data", "gallery.yml");

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseFrontMatter(md, filePath) {
  const match = String(md || "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    fail(`${filePath} missing front matter`);
  }
  const fmRaw = match[1];
  const body = match[2] || "";
  const fm = yaml.load(fmRaw) || {};
  return { fm, body };
}

function ensureArray(input) {
  if (Array.isArray(input)) return input;
  if (typeof input !== "string" || !input.trim()) return [];
  return input
    .split(/[,\uFF0C]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSrc(albumFolder, rawSrc) {
  const src = (rawSrc || "").trim();
  if (!src) return "";
  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return `/images/${albumFolder}/${src}`;
}

function parseTable(body) {
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = lines.filter((line) => line.startsWith("|") && line.endsWith("|"));
  if (rows.length < 2) return [];

  const parseCells = (line) =>
    line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());

  const header = parseCells(rows[0]);
  const divider = parseCells(rows[1]);
  if (!divider.every((cell) => /^:?-{3,}:?$/.test(cell))) {
    fail("Gallery table divider is invalid. Use markdown table format.");
  }

  const result = [];
  for (let i = 2; i < rows.length; i += 1) {
    const cells = parseCells(rows[i]);
    if (cells.every((cell) => !cell)) continue;
    const row = {};
    header.forEach((key, idx) => {
      row[key] = cells[idx] || "";
    });
    result.push(row);
  }
  return result;
}

function buildAlbumFromDoc(filePath) {
  const md = readText(filePath);
  const { fm, body } = parseFrontMatter(md, filePath);

  const slug = (fm.slug || "").trim();
  if (!slug) fail(`${filePath} missing slug`);

  const titleZh = fm.title_zh || "";
  const titleEn = fm.title_en || "";
  if (!titleZh || !titleEn) {
    fail(`${filePath} requires title_zh and title_en`);
  }
  const albumFolder = (fm.image_folder || `gallery/${slug}`).replace(/^\/+|\/+$/g, "");

  const rows = parseTable(body);
  const photos = rows.map((row) => {
    const src = normalizeSrc(albumFolder, row.src);
    if (!src) fail(`${filePath} has photo row with empty src`);
    const photo = {
      src,
      title: {
        "zh-CN": row.title_zh || "",
        en: row.title_en || ""
      },
      caption: {
        "zh-CN": row.caption_zh || "",
        en: row.caption_en || ""
      }
    };
    if ((row.meta || "").trim()) {
      photo.meta = row.meta.trim();
    }
    return photo;
  });

  return {
    slug,
    languages: ensureArray(fm.languages).length ? ensureArray(fm.languages) : ["zh-CN", "en"],
    title: {
      "zh-CN": titleZh,
      en: titleEn
    },
    period: {
      "zh-CN": fm.period_zh || "",
      en: fm.period_en || ""
    },
    location: {
      "zh-CN": fm.location_zh || "",
      en: fm.location_en || ""
    },
    camera: {
      "zh-CN": fm.camera_zh || "",
      en: fm.camera_en || ""
    },
    description: {
      "zh-CN": fm.description_zh || "",
      en: fm.description_en || ""
    },
    tags: {
      "zh-CN": ensureArray(fm.tags_zh),
      en: ensureArray(fm.tags_en)
    },
    photos
  };
}

function loadEmptyState() {
  if (!fs.existsSync(GALLERY_DATA_PATH)) {
    return {
      "zh-CN": "画廊还没有内容，后续会逐步补充更多作品。",
      en: "The gallery is empty for now. More work will be added over time."
    };
  }
  const existing = yaml.load(readText(GALLERY_DATA_PATH)) || {};
  return (
    existing.empty || {
      "zh-CN": "画廊还没有内容，后续会逐步补充更多作品。",
      en: "The gallery is empty for now. More work will be added over time."
    }
  );
}

function main() {
  if (!fs.existsSync(GALLERY_DOC_DIR)) {
    fail(`Missing directory: ${GALLERY_DOC_DIR}`);
  }

  const files = fs
    .readdirSync(GALLERY_DOC_DIR)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort()
    .map((name) => path.join(GALLERY_DOC_DIR, name));

  if (files.length === 0) {
    fail(`No markdown files found in ${GALLERY_DOC_DIR}`);
  }

  const albums = files.map((filePath) => buildAlbumFromDoc(filePath));
  const slugs = new Set();
  for (const album of albums) {
    if (slugs.has(album.slug)) fail(`Duplicate album slug: ${album.slug}`);
    slugs.add(album.slug);
  }

  const output = {
    empty: loadEmptyState(),
    albums
  };

  const dumped = yaml.dump(output, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });
  fs.writeFileSync(GALLERY_DATA_PATH, dumped, "utf8");
  console.log(`Synced ${albums.length} albums to source/_data/gallery.yml`);
}

main();
