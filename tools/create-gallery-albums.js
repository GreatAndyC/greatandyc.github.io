#!/usr/bin/env node
'use strict';

const cms = require('./local-cms.js');

const FOLDER_CONFIGS = {
  'gallery/Blue_Hour_SYSU': {
    slug: 'blue-hour-sysu',
    title: { 'zh-CN': 'SYSU 蓝调时刻', en: 'Blue Hour at SYSU' },
    location: { 'zh-CN': 'SYSU', en: 'SYSU' },
    tags: { 'zh-CN': ['蓝调时刻', '校园', '城市'], en: ['Blue Hour', 'Campus', 'City'] },
    description: {
      'zh-CN': '一组围绕蓝调时刻展开的校园与城市光线练习，画面重点放在天色、建筑轮廓和环境氛围。',
      en: 'A small study of campus and city light during blue hour, focused on sky tone, architecture, and ambient atmosphere.'
    }
  },
  'gallery/DisneyLand_Fireworks': {
    slug: 'disneyland-fireworks',
    title: { 'zh-CN': '迪士尼烟花', en: 'Disneyland Fireworks' },
    location: { 'zh-CN': '香港迪士尼乐园', en: 'Hong Kong Disneyland' },
    tags: { 'zh-CN': ['烟花', '夜景', '乐园'], en: ['Fireworks', 'Night', 'Theme Park'] },
    description: {
      'zh-CN': '这组照片集中在夜间烟花表演，重点是长曝光下的光线轨迹、前景层次和现场氛围。',
      en: 'This set focuses on a nighttime fireworks show, with attention to long-exposure trails, foreground layering, and the atmosphere on site.'
    }
  },
  'gallery/HKU_Campus_Hangaround': {
    slug: 'hku-campus-hangaround',
    title: { 'zh-CN': '港大校园闲逛', en: 'HKU Campus Hangaround' },
    location: { 'zh-CN': '香港大学', en: 'The University of Hong Kong' },
    tags: { 'zh-CN': ['校园', '日常', '港大'], en: ['Campus', 'Everyday', 'HKU'] },
    description: {
      'zh-CN': '偏日常感的一组校园照片，主要记录走动、停留和光线落在校园空间里的细节。',
      en: 'A quieter set of campus images built around everyday movement, pauses, and the way light settles into the university space.'
    }
  },
  'gallery/Kennedy_Town_Photo_Walk': {
    slug: 'kennedy-town-photo-walk',
    title: { 'zh-CN': '坚尼地城扫街', en: 'Kennedy Town Photo Walk' },
    location: { 'zh-CN': '坚尼地城', en: 'Kennedy Town, Hong Kong' },
    tags: { 'zh-CN': ['扫街', '街头', '坚尼地城'], en: ['Photo Walk', 'Street', 'Kennedy Town'] },
    description: {
      'zh-CN': '一次以街头观察为主的拍摄，重点是人、街角、店面和海边社区的日常节奏。',
      en: 'A street-focused walk through Kennedy Town, centered on people, corners, storefronts, and the everyday rhythm of the waterfront neighborhood.'
    }
  },
  'gallery/Main_Campus_Photo_Walk': {
    slug: 'main-campus-photo-walk',
    title: { 'zh-CN': '主校区扫街', en: 'Main Campus Photo Walk' },
    location: { 'zh-CN': '主校区', en: 'Main Campus' },
    tags: { 'zh-CN': ['校园', '扫街', '建筑'], en: ['Campus', 'Photo Walk', 'Architecture'] },
    description: {
      'zh-CN': '围绕主校区空间展开的一次步行拍摄，画面集中在建筑线条、路径关系和校园里的光影变化。',
      en: 'A walking set built around the main campus, with frames focused on architecture, pathways, and changing light across the grounds.'
    }
  },
  'gallery/Monster_Building&Victoria_Peak_in_Fog': {
    slug: 'monster-building-victoria-peak-in-fog',
    title: { 'zh-CN': '怪兽大厦与雾中的太平山', en: 'Monster Building and Victoria Peak in Fog' },
    location: { 'zh-CN': '怪兽大厦、太平山', en: 'Monster Building and Victoria Peak, Hong Kong' },
    tags: { 'zh-CN': ['城市', '雾', '建筑'], en: ['City', 'Fog', 'Architecture'] },
    description: {
      'zh-CN': '这组照片把高密度城市建筑和雾里的山顶视角放在一起，重点是层次、压缩感和天气带来的氛围变化。',
      en: 'This set places dense urban architecture next to a foggy mountain viewpoint, focusing on layering, compression, and the mood shift created by weather.'
    }
  },
  'gallery/SJC_High_Table': {
    slug: 'sjc-high-table',
    title: { 'zh-CN': 'SJC High Table', en: 'SJC High Table' },
    location: { 'zh-CN': 'SJC', en: 'SJC' },
    tags: { 'zh-CN': ['晚宴', '室内', '活动'], en: ['Dinner', 'Indoor', 'Event'] },
    description: {
      'zh-CN': '一组偏活动记录的室内照片，重点放在席间氛围、人物互动和低光环境下的画面组织。',
      en: 'An indoor event set built around table atmosphere, interaction, and image structure in low light.'
    }
  },
  'gallery/Victoria_Harbour_Panorama_Peak_View': {
    slug: 'victoria-harbour-panorama-peak-view',
    title: { 'zh-CN': '太平山顶俯瞰维港全景', en: 'Victoria Harbour Panorama from the Peak' },
    location: { 'zh-CN': '太平山顶', en: 'Victoria Peak, Hong Kong' },
    tags: { 'zh-CN': ['全景', '维港', '夜景'], en: ['Panorama', 'Victoria Harbour', 'Night View'] },
    description: {
      'zh-CN': '一张从山顶视角展开的维港全景，重点是城市灯光、海岸线和横向展开的空间关系。',
      en: 'A panoramic harbour view from the Peak, focused on city light, shoreline shape, and the lateral sweep of the scene.'
    }
  }
};

function simplifyCamera(camera) {
  return String(camera || '')
    .trim()
    .replace(/^NIKON CORPORATION\s*[^A-Za-z0-9]+\s*/i, '')
    .replace(/^FUJIFILM\s*[^A-Za-z0-9]+\s*/i, '')
    .replace(/^Canon\s*[^A-Za-z0-9]+\s*/i, '')
    .trim();
}

function parseDate(name) {
  const match = String(name || '').match(/(20\d{2})(\d{2})(\d{2})/);
  if (!match) return '';
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function buildPeriod(items) {
  const dates = Array.from(new Set(items.map(item => parseDate(item.name)).filter(Boolean))).sort();
  if (!dates.length) {
    return { 'zh-CN': '', en: '' };
  }
  if (dates.length === 1) {
    return { 'zh-CN': dates[0], en: dates[0] };
  }
  return {
    'zh-CN': `${dates[0]} - ${dates[dates.length - 1]}`,
    en: `${dates[0]} - ${dates[dates.length - 1]}`
  };
}

function buildCamera(items) {
  const cameras = Array.from(new Set(items.map(item => simplifyCamera(item.camera)).filter(Boolean)));
  return cameras.join(' / ');
}

function createAlbums() {
  const results = [];

  for (const [folder, config] of Object.entries(FOLDER_CONFIGS)) {
    const payload = cms.listImageLibrary(folder);
    if (!payload.items.length) {
      results.push({ folder, status: 'skipped-empty' });
      continue;
    }

    const camera = buildCamera(payload.items);
    const record = cms.writeGalleryAlbum({
      sourceSlug: config.slug,
      slug: config.slug,
      imageFolder: folder,
      languages: ['zh-CN', 'en'],
      title: config.title,
      period: buildPeriod(payload.items),
      location: config.location,
      camera: { 'zh-CN': camera, en: camera },
      description: config.description,
      tags: config.tags,
      photos: payload.items.map(item => ({
        src: item.path,
        title: { 'zh-CN': '', en: '' },
        caption: { 'zh-CN': '', en: '' },
        meta: item.captureMeta || item.meta || ''
      }))
    });

    results.push({
      folder,
      status: 'created',
      slug: record.slug,
      count: record.photos.length,
      camera
    });
  }

  return results;
}

if (require.main === module) {
  process.stdout.write(`${JSON.stringify(createAlbums(), null, 2)}\n`);
}

module.exports = { createAlbums };
