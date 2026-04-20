#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const DATA_PATH = path.join(process.cwd(), "source", "_data", "gallery.yml");

function loadData() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const doc = yaml.load(raw) || {};
  if (!Array.isArray(doc.albums)) doc.albums = [];
  return doc;
}

function saveData(doc) {
  const dumped = yaml.dump(doc, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });
  fs.writeFileSync(DATA_PATH, dumped, "utf8");
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      out._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function help() {
  console.log(`
Gallery CLI

Usage:
  node tools/gallery-cli.js list-albums
  node tools/gallery-cli.js add-album --slug <slug> --title-zh "<中文标题>" --title-en "<English Title>" [--period-zh "..."] [--period-en "..."] [--location-zh "..."] [--location-en "..."] [--camera-zh "..."] [--camera-en "..."] [--description-zh "..."] [--description-en "..."] [--tags-zh "标签1,标签2"] [--tags-en "Tag1,Tag2"]
  node tools/gallery-cli.js add-photo --album <slug> --src </images/...> [--title-zh "..."] [--title-en "..."] [--caption-zh "..."] [--caption-en "..."] [--meta "..."]
`);
}

function splitCsv(input) {
  if (!input) return [];
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listAlbums() {
  const doc = loadData();
  if (doc.albums.length === 0) {
    console.log("No albums found.");
    return;
  }

  doc.albums.forEach((album, idx) => {
    const zh = album.title && album.title["zh-CN"] ? album.title["zh-CN"] : "";
    const en = album.title && album.title.en ? album.title.en : "";
    console.log(`${idx + 1}. ${album.slug} | ${zh} | ${en}`);
  });
}

function addAlbum(args) {
  const slug = args.slug;
  const titleZh = args["title-zh"];
  const titleEn = args["title-en"];

  if (!slug) fail("Missing required option --slug");
  if (!titleZh) fail("Missing required option --title-zh");
  if (!titleEn) fail("Missing required option --title-en");

  const doc = loadData();
  if (doc.albums.some((album) => album.slug === slug)) {
    fail(`Album slug already exists: ${slug}`);
  }

  const album = {
    slug,
    languages: ["zh-CN", "en"],
    title: {
      "zh-CN": titleZh,
      en: titleEn
    },
    period: {
      "zh-CN": args["period-zh"] || "",
      en: args["period-en"] || ""
    },
    location: {
      "zh-CN": args["location-zh"] || "",
      en: args["location-en"] || ""
    },
    camera: {
      "zh-CN": args["camera-zh"] || "",
      en: args["camera-en"] || ""
    },
    description: {
      "zh-CN": args["description-zh"] || "",
      en: args["description-en"] || ""
    },
    tags: {
      "zh-CN": splitCsv(args["tags-zh"]),
      en: splitCsv(args["tags-en"])
    },
    photos: []
  };

  doc.albums.push(album);
  saveData(doc);
  console.log(`Added album: ${slug}`);
}

function addPhoto(args) {
  const albumSlug = args.album;
  const src = args.src;
  if (!albumSlug) fail("Missing required option --album");
  if (!src) fail("Missing required option --src");

  const doc = loadData();
  const album = doc.albums.find((item) => item.slug === albumSlug);
  if (!album) fail(`Album not found: ${albumSlug}`);
  if (!Array.isArray(album.photos)) album.photos = [];

  const photo = {
    src,
    title: {
      "zh-CN": args["title-zh"] || "",
      en: args["title-en"] || ""
    },
    caption: {
      "zh-CN": args["caption-zh"] || "",
      en: args["caption-en"] || ""
    }
  };

  if (args.meta) {
    photo.meta = args.meta;
  }

  album.photos.push(photo);
  saveData(doc);
  console.log(`Added photo to ${albumSlug}: ${src}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  if (!cmd || cmd === "help" || args.help) {
    help();
    return;
  }

  if (cmd === "list-albums") {
    listAlbums();
    return;
  }
  if (cmd === "add-album") {
    addAlbum(args);
    return;
  }
  if (cmd === "add-photo") {
    addPhoto(args);
    return;
  }

  fail(`Unknown command: ${cmd}`);
}

main();
