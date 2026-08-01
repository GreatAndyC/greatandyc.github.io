'use strict';

(function registerSchoolThemeCatalog(root) {
  const rankingSources = Object.freeze({
    moe985: Object.freeze({
      provider: '教育部',
      edition: 2006,
      shortLabel: '985',
      label: '教育部“985工程”学校名单',
      source: 'https://www.moe.gov.cn/srcsite/A22/s7065/200612/t20061206_128833.html'
    }),
    theWorld2026: Object.freeze({
      provider: 'THE',
      edition: 2026,
      shortLabel: 'THE',
      label: 'Times Higher Education World University Rankings 2026',
      source: 'https://www.timeshighereducation.com/world-university-rankings/latest/world-ranking'
    }),
    theAsia2026: Object.freeze({
      provider: 'THE Asia',
      edition: 2026,
      shortLabel: 'THE Asia',
      label: 'Times Higher Education Asia University Rankings 2026',
      source: 'https://www.timeshighereducation.com/world-university-rankings/2026/regional-ranking'
    }),
    usNewsGlobal2027: Object.freeze({
      provider: 'U.S. News',
      edition: '2026–27',
      shortLabel: 'USN',
      label: 'U.S. News Best Global Universities 2026–2027',
      source: 'https://www.usnews.com/education/best-global-universities/rankings'
    }),
    usNewsNational2026: Object.freeze({
      provider: 'U.S. News',
      edition: 2026,
      shortLabel: 'USN',
      label: 'U.S. News Best National Universities 2026',
      source: 'https://www.usnews.com/best-colleges/rankings/national-universities'
    }),
    singaporeMoe: Object.freeze({
      provider: '新加坡教育部',
      edition: 2026,
      shortLabel: 'MOE AU',
      label: 'Singapore Ministry of Education Autonomous Universities',
      source: 'https://www.moe.gov.sg/post-secondary/overview/autonomous-universities'
    })
  });

  const palettes = Object.freeze([
    ['#8c1515', '#175e54'],
    ['#003b70', '#c9a227'],
    ['#6f2c91', '#d4b46a'],
    ['#005a84', '#e87722'],
    ['#8a1538', '#d6a461'],
    ['#004b87', '#6bbbae'],
    ['#5b2c6f', '#c7a008'],
    ['#9b2743', '#234e70'],
    ['#0b5d55', '#d4a017'],
    ['#263b80', '#b72f3f'],
    ['#7a0019', '#f2a900'],
    ['#004f71', '#b4a269']
  ]);

  const localMarkIds = new Set([
    'princeton', 'mit', 'harvard', 'stanford', 'yale', 'uchicago', 'duke',
    'johns-hopkins', 'northwestern-us', 'upenn', 'caltech', 'cornell', 'brown',
    'dartmouth', 'columbia', 'berkeley', 'rice', 'ucla', 'vanderbilt', 'cmu',
    'michigan', 'notre-dame', 'washu', 'emory', 'georgetown', 'unc', 'uva',
    'usc', 'ucsd', 'florida', 'ut-austin',
    'buaa', 'southeast', 'xiamen', 'sysu', 'washington',
    'imperial', 'ucl', 'edinburgh', 'kcl',
    'oxford', 'cambridge', 'lse', 'peking', 'tsinghua', 'fudan', 'sjtu',
    'zhejiang', 'nanjing', 'ustc', 'tongji', 'wuhan', 'hit', 'hku', 'cuhk',
    'hkust', 'polyu', 'cityu', 'tokyo', 'kyoto'
  ]);

  const schools = {};
  let generatedPaletteIndex = 0;

  function darken(hex, amount = 0.76) {
    const value = String(hex).replace('#', '');
    const channels = [0, 2, 4].map(offset => Math.round(parseInt(value.slice(offset, offset + 2), 16) * amount));
    return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  function addSchool(id, definition) {
    if (schools[id]) {
      const update = { ...definition };
      if (!update.mottoReference && update.motto && update.identityReference) {
        update.mottoReference = update.identityReference;
      }
      Object.assign(schools[id], update);
      return schools[id];
    }

    const palette = palettes[generatedPaletteIndex % palettes.length];
    generatedPaletteIndex += 1;
    const primary = definition.primary || palette[0];
    const secondary = definition.secondary || palette[1];
    const markText = definition.markText || definition.label.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase();
    schools[id] = {
      label: definition.label,
      fullName: definition.fullName,
      nativeName: definition.nativeName || '',
      region: definition.region,
      colorName: definition.colorName || `${definition.label} 主题`,
      primary,
      hover: definition.hover || darken(primary),
      secondary,
      motto: definition.motto || null,
      mottoReference: definition.mottoReference || definition.identityReference || '',
      identityReference: definition.identityReference || '',
      mark: definition.mark || (localMarkIds.has(id) ? `/assets/school-marks/${id}.png` : ''),
      markText: markText || definition.label.slice(0, 2),
      markType: definition.mark || localMarkIds.has(id) ? 'local' : 'monogram'
    };
    return schools[id];
  }

  function addBatch(region, rows) {
    rows.forEach(row => {
      const [
        id,
        label,
        fullName,
        nativeName = '',
        primary = '',
        secondary = '',
        markText = ''
      ] = row;
      addSchool(id, { label, fullName, nativeName, region, primary, secondary, markText });
    });
  }

  [
    ['mit', {
      label: 'MIT',
      fullName: 'Massachusetts Institute of Technology',
      region: 'united-states',
      colorName: 'MIT Red',
      primary: '#a31f34',
      hover: '#7b1727',
      secondary: '#4b4b4b',
      motto: { label: 'Motto', original: 'Mens et Manus', zh: '心智与双手并举' },
      identityReference: 'https://brand.mit.edu/logos-marks/mit-logo'
    }],
    ['stanford', {
      label: 'Stanford',
      fullName: 'Stanford University',
      region: 'united-states',
      colorName: 'Cardinal Red',
      primary: '#8c1515',
      hover: '#6f1010',
      secondary: '#175e54',
      motto: { label: 'Spirit', original: 'Die Luft der Freiheit weht', zh: '自由之风劲吹' },
      identityReference: 'https://identity.stanford.edu/visual-identity/stanford-logos/'
    }],
    ['harvard', {
      label: 'Harvard',
      fullName: 'Harvard University',
      region: 'united-states',
      colorName: 'Crimson',
      primary: '#a51c30',
      hover: '#7d1524',
      secondary: '#f3c677',
      motto: { label: 'Motto', original: 'Veritas', zh: '真理' },
      identityReference: 'https://www.harvard.edu/about/history/shields/'
    }],
    ['caltech', {
      label: 'Caltech',
      fullName: 'California Institute of Technology',
      region: 'united-states',
      colorName: 'Caltech Orange',
      primary: '#b44a00',
      hover: '#873700',
      secondary: '#111111',
      motto: { label: 'Motto', original: 'The truth shall make you free', zh: '真理使人自由' },
      identityReference: 'https://identity.caltech.edu/logos'
    }],
    ['cornell', {
      label: 'Cornell',
      fullName: 'Cornell University',
      region: 'united-states',
      colorName: 'Carnelian',
      primary: '#b31b1b',
      hover: '#871414',
      secondary: '#222222',
      motto: { label: 'Motto', original: 'Any person · Any study', zh: '让人人皆可求学，让学问无所不包' },
      identityReference: 'https://brand.cornell.edu/design-center/logos-lockups/'
    }],
    ['uchicago', {
      label: 'UChicago',
      fullName: 'University of Chicago',
      region: 'united-states',
      colorName: 'Maroon',
      primary: '#800000',
      hover: '#5c0000',
      secondary: '#737373',
      motto: { label: 'Motto', original: 'Crescat scientia; vita excolatur', zh: '知识日新，人生乃丰' },
      identityReference: 'https://creative.uchicago.edu/resources/identity-guidelines/'
    }],
    ['princeton', {
      label: 'Princeton',
      fullName: 'Princeton University',
      region: 'united-states',
      colorName: 'Princeton Orange',
      primary: '#b84b00',
      hover: '#8a3800',
      secondary: '#121212',
      motto: { label: 'Motto', original: 'Dei sub numine viget', zh: '在上苍庇佑下蓬勃生长' },
      identityReference: 'https://communications.princeton.edu/guides-tools/logo-graphic-identity'
    }],
    ['oxford', {
      label: 'Oxford',
      fullName: 'University of Oxford',
      region: 'united-kingdom',
      colorName: 'Oxford Blue',
      primary: '#002147',
      hover: '#00162f',
      secondary: '#cfb53b',
      motto: { label: 'Motto', original: 'Dominus illuminatio mea', zh: '主乃我光' }
    }],
    ['cambridge', {
      label: 'Cambridge',
      fullName: 'University of Cambridge',
      region: 'united-kingdom',
      colorName: 'Cambridge Teal',
      primary: '#087783',
      hover: '#075963',
      secondary: '#a3c1ad',
      motto: { label: 'Motto', original: 'Hinc lucem et pocula sacra', zh: '由此得启明，饮于智慧圣泉' }
    }],
    ['lse', {
      label: 'LSE',
      fullName: 'London School of Economics and Political Science',
      region: 'united-kingdom',
      colorName: 'LSE Red',
      primary: '#c40032',
      hover: '#950026',
      secondary: '#111111',
      motto: { label: 'Motto', original: 'Rerum cognoscere causas', zh: '探究万物之因' }
    }],
    ['peking', {
      label: '北京大学',
      fullName: 'Peking University',
      nativeName: '北京大学',
      region: 'china-mainland',
      colorName: '北大红',
      primary: '#9b1b30',
      hover: '#721323',
      secondary: '#003f88',
      markText: 'PKU',
      motto: { label: '精神', original: '思想自由 · 兼容并包', zh: '' }
    }],
    ['tsinghua', {
      label: '清华大学',
      fullName: 'Tsinghua University',
      nativeName: '清华大学',
      region: 'china-mainland',
      colorName: '清华紫',
      primary: '#82318e',
      hover: '#602469',
      secondary: '#d8b7de',
      markText: 'THU',
      motto: { label: '校训', original: '自强不息 · 厚德载物', zh: '' }
    }],
    ['fudan', {
      label: '复旦大学',
      fullName: 'Fudan University',
      nativeName: '复旦大学',
      region: 'china-mainland',
      colorName: '复旦蓝',
      primary: '#005aa7',
      hover: '#00437c',
      secondary: '#b7193f',
      markText: 'FDU',
      motto: { label: '校训', original: '博学而笃志 · 切问而近思', zh: '' }
    }],
    ['sjtu', {
      label: '上海交通大学',
      fullName: 'Shanghai Jiao Tong University',
      nativeName: '上海交通大学',
      region: 'china-mainland',
      colorName: '交大红',
      primary: '#c8161e',
      hover: '#961017',
      secondary: '#003f70',
      markText: 'SJTU',
      motto: { label: '校训', original: '饮水思源 · 爱国荣校', zh: '' }
    }],
    ['zhejiang', {
      label: '浙江大学',
      fullName: 'Zhejiang University',
      nativeName: '浙江大学',
      region: 'china-mainland',
      colorName: '求是蓝',
      primary: '#003b7a',
      hover: '#002b59',
      secondary: '#5b9bd5',
      markText: 'ZJU',
      motto: { label: '校训', original: '求是创新', zh: '' }
    }],
    ['nanjing', {
      label: '南京大学',
      fullName: 'Nanjing University',
      nativeName: '南京大学',
      region: 'china-mainland',
      colorName: '南大紫',
      primary: '#5f259f',
      hover: '#461b76',
      secondary: '#c69214',
      markText: 'NJU',
      motto: { label: '校训', original: '诚朴雄伟 · 励学敦行', zh: '' }
    }],
    ['ustc', {
      label: '中国科学技术大学',
      fullName: 'University of Science and Technology of China',
      nativeName: '中国科学技术大学',
      region: 'china-mainland',
      colorName: '科大蓝',
      primary: '#034ea1',
      hover: '#023875',
      secondary: '#f39800',
      markText: 'USTC',
      motto: { label: '校训', original: '红专并进 · 理实交融', zh: '' }
    }],
    ['tongji', {
      label: '同济大学',
      fullName: 'Tongji University',
      nativeName: '同济大学',
      region: 'china-mainland',
      colorName: '同济蓝',
      primary: '#005ca9',
      hover: '#00447d',
      secondary: '#e60012',
      markText: 'TJU',
      motto: { label: '校训', original: '同舟共济', zh: '' }
    }],
    ['wuhan', {
      label: '武汉大学',
      fullName: 'Wuhan University',
      nativeName: '武汉大学',
      region: 'china-mainland',
      colorName: '珞珈蓝',
      primary: '#008c95',
      hover: '#006970',
      secondary: '#0b4f8a',
      markText: 'WHU',
      motto: { label: '校训', original: '自强 · 弘毅 · 求是 · 拓新', zh: '' }
    }],
    ['hit', {
      label: '哈尔滨工业大学',
      fullName: 'Harbin Institute of Technology',
      nativeName: '哈尔滨工业大学',
      region: 'china-mainland',
      colorName: '哈工大蓝',
      primary: '#005bac',
      hover: '#00437f',
      secondary: '#d71920',
      markText: 'HIT',
      motto: { label: '校训', original: '规格严格 · 功夫到家', zh: '' }
    }],
    ['hku', {
      label: 'HKU',
      fullName: 'The University of Hong Kong',
      nativeName: '香港大學',
      region: 'hong-kong',
      colorName: 'HKU Green',
      primary: '#024638',
      hover: '#01362b',
      secondary: '#d7a537',
      motto: { label: 'Motto', original: 'Sapientia et Virtus', zh: '明德格物' }
    }],
    ['cuhk', {
      label: 'CUHK',
      fullName: 'The Chinese University of Hong Kong',
      nativeName: '香港中文大學',
      region: 'hong-kong',
      colorName: 'Purple & Gold',
      primary: '#750f6d',
      hover: '#580b51',
      secondary: '#dda300',
      motto: { label: '校训', original: '博文約禮', zh: '' }
    }],
    ['hkust', {
      label: 'HKUST',
      fullName: 'The Hong Kong University of Science and Technology',
      nativeName: '香港科技大學',
      region: 'hong-kong',
      colorName: 'Blue & Gold',
      primary: '#003366',
      hover: '#00264d',
      secondary: '#996600',
      motto: { label: 'Slogan', original: 'We Shape the Future', zh: '共塑未来' }
    }],
    ['polyu', {
      label: 'PolyU',
      fullName: 'The Hong Kong Polytechnic University',
      nativeName: '香港理工大學',
      region: 'hong-kong',
      colorName: 'PolyU Red & Grey',
      primary: '#a02337',
      hover: '#791a2a',
      secondary: '#5b5b5b',
      motto: { label: '校训', original: '開物成務 · 勵學利民', zh: '' }
    }],
    ['cityu', {
      label: 'CityUHK',
      fullName: 'City University of Hong Kong',
      nativeName: '香港城市大學',
      region: 'hong-kong',
      colorName: 'Burgundy & Orange',
      primary: '#c81048',
      hover: '#980c36',
      secondary: '#e56b2e',
      motto: { label: 'Motto', original: 'Officium et Civitas', zh: '敬业乐群' }
    }],
    ['tokyo', {
      label: 'UTokyo',
      fullName: 'The University of Tokyo',
      nativeName: '東京大学',
      region: 'japan',
      colorName: 'UTokyo Blue',
      primary: '#005a9c',
      hover: '#004274',
      secondary: '#f2c300',
      motto: { label: 'Slogan', original: 'Discover Excellence.', zh: '发现卓越' }
    }],
    ['kyoto', {
      label: 'Kyoto',
      fullName: 'Kyoto University',
      nativeName: '京都大学',
      region: 'japan',
      colorName: 'Kyoto Blue',
      primary: '#001e62',
      hover: '#001445',
      secondary: '#b59410',
      motto: { label: '精神', original: '自重自敬 · 自由の学風', zh: '崇尚自由学风' }
    }]
  ].forEach(([id, definition]) => addSchool(id, definition));

  addBatch('china-mainland', [
    ['renmin', '中国人民大学', 'Renmin University of China', '中国人民大学', '#8b1d2c', '#f0c75e', 'RUC'],
    ['buaa', '北京航空航天大学', 'Beihang University', '北京航空航天大学', '#004b87', '#d71920', 'BUAA'],
    ['bit', '北京理工大学', 'Beijing Institute of Technology', '北京理工大学', '#0068b7', '#d71920', 'BIT'],
    ['cau', '中国农业大学', 'China Agricultural University', '中国农业大学', '#1d6b3c', '#f0b323', 'CAU'],
    ['bnu', '北京师范大学', 'Beijing Normal University', '北京师范大学', '#7a0019', '#caa65d', 'BNU'],
    ['minzu', '中央民族大学', 'Minzu University of China', '中央民族大学', '#8a1538', '#d4a017', 'MUC'],
    ['nankai', '南开大学', 'Nankai University', '南开大学', '#5b2c6f', '#d4a017', 'NKU'],
    ['tianjin', '天津大学', 'Tianjin University', '天津大学', '#005a84', '#e87722', 'TJU'],
    ['dlut', '大连理工大学', 'Dalian University of Technology', '大连理工大学', '#005bac', '#f2a900', 'DUT'],
    ['northeastern', '东北大学', 'Northeastern University, China', '东北大学', '#004f71', '#f2a900', 'NEU'],
    ['jilin', '吉林大学', 'Jilin University', '吉林大学', '#003b70', '#c9a227', 'JLU'],
    ['ecnu', '华东师范大学', 'East China Normal University', '华东师范大学', '#6f2c91', '#d4b46a', 'ECNU'],
    ['southeast', '东南大学', 'Southeast University', '东南大学', '#5b2c6f', '#f2a900', 'SEU'],
    ['xiamen', '厦门大学', 'Xiamen University', '厦门大学', '#263b80', '#b72f3f', 'XMU'],
    ['shandong', '山东大学', 'Shandong University', '山东大学', '#004b87', '#d71920', 'SDU'],
    ['ocean-china', '中国海洋大学', 'Ocean University of China', '中国海洋大学', '#005a84', '#6bbbae', 'OUC'],
    ['hust', '华中科技大学', 'Huazhong University of Science and Technology', '华中科技大学', '#005bac', '#d71920', 'HUST'],
    ['hunan', '湖南大学', 'Hunan University', '湖南大学', '#003b70', '#c9a227', 'HNU'],
    ['csu', '中南大学', 'Central South University', '中南大学', '#004b87', '#f2a900', 'CSU'],
    ['nudt', '国防科技大学', 'National University of Defense Technology', '国防科技大学', '#005a84', '#d4a017', 'NUDT'],
    ['sysu', '中山大学', 'Sun Yat-sen University', '中山大学', '#006633', '#f0b323', 'SYSU'],
    ['scut', '华南理工大学', 'South China University of Technology', '华南理工大学', '#7a0019', '#f2a900', 'SCUT'],
    ['sichuan', '四川大学', 'Sichuan University', '四川大学', '#8a1538', '#d4a017', 'SCU'],
    ['uestc', '电子科技大学', 'University of Electronic Science and Technology of China', '电子科技大学', '#005bac', '#e87722', 'UESTC'],
    ['chongqing', '重庆大学', 'Chongqing University', '重庆大学', '#004f71', '#d4a017', 'CQU'],
    ['xian-jiaotong', '西安交通大学', 'Xi’an Jiaotong University', '西安交通大学', '#005bac', '#c8102e', 'XJTU'],
    ['nwpu', '西北工业大学', 'Northwestern Polytechnical University', '西北工业大学', '#003b70', '#d71920', 'NPU'],
    ['nwafu', '西北农林科技大学', 'Northwest A&F University', '西北农林科技大学', '#1d6b3c', '#d4a017', 'NWAFU'],
    ['lanzhou', '兰州大学', 'Lanzhou University', '兰州大学', '#004b87', '#c9a227', 'LZU']
  ]);

  [
    ['yale', {
      label: 'Yale',
      fullName: 'Yale University',
      region: 'united-states',
      colorName: 'Yale Blue',
      primary: '#00356b',
      secondary: '#63aaff',
      motto: { label: 'Motto', original: 'Lux et Veritas', zh: '光明与真理' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Yale_University_Shield_1.svg'
    }],
    ['duke', {
      label: 'Duke',
      fullName: 'Duke University',
      region: 'united-states',
      colorName: 'Duke Blue',
      primary: '#003087',
      secondary: '#00539b',
      motto: { label: 'Motto', original: 'Eruditio et Religio', zh: '学识与信仰' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Duke_University_Seal.png'
    }],
    ['johns-hopkins', {
      label: 'Johns Hopkins',
      fullName: 'Johns Hopkins University',
      region: 'united-states',
      colorName: 'Heritage Blue',
      primary: '#002d72',
      secondary: '#68ace5',
      markText: 'JHU',
      motto: { label: 'Motto', original: 'Veritas vos liberabit', zh: '真理必使你自由' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:185px-JHU_seal.png'
    }],
    ['northwestern-us', {
      label: 'Northwestern',
      fullName: 'Northwestern University',
      region: 'united-states',
      colorName: 'Northwestern Purple',
      primary: '#4e2a84',
      secondary: '#836eaa',
      markText: 'NU',
      motto: { label: 'Motto', original: 'Quaecumque sunt vera', zh: '凡真实之事' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Northwestern_University_seal.svg'
    }],
    ['upenn', {
      label: 'Penn',
      fullName: 'University of Pennsylvania',
      region: 'united-states',
      colorName: 'Penn Red & Blue',
      primary: '#990000',
      secondary: '#011f5b',
      markText: 'PENN',
      motto: { label: 'Motto', original: 'Leges sine moribus vanae', zh: '法无德则空' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Shield_of_the_University_of_Pennsylvania.svg'
    }],
    ['brown', {
      label: 'Brown',
      fullName: 'Brown University',
      region: 'united-states',
      colorName: 'Brown & Cardinal',
      primary: '#4e3629',
      secondary: '#ed1c24',
      motto: { label: 'Motto', original: 'In Deo Speramus', zh: '我们仰望上帝' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Brown_seal.svg'
    }],
    ['dartmouth', {
      label: 'Dartmouth',
      fullName: 'Dartmouth College',
      region: 'united-states',
      colorName: 'Dartmouth Green',
      primary: '#00693e',
      secondary: '#12312b',
      motto: { label: 'Motto', original: 'Vox clamantis in deserto', zh: '旷野中的呼声' },
      identityReference: 'https://communications.dartmouth.edu/guides-and-tools/design-guidelines/brand-marks'
    }],
    ['columbia', {
      label: 'Columbia',
      fullName: 'Columbia University',
      region: 'united-states',
      colorName: 'Columbia Blue',
      primary: '#1d4f91',
      secondary: '#b9d9eb',
      markText: 'CU',
      motto: { label: 'Motto', original: 'In lumine Tuo videbimus lumen', zh: '在你的光中，我们必见光明' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Coat_of_Arms_of_Columbia_University.svg'
    }],
    ['berkeley', {
      label: 'UC Berkeley',
      fullName: 'University of California, Berkeley',
      region: 'united-states',
      colorName: 'Berkeley Blue & California Gold',
      primary: '#003262',
      secondary: '#fdb515',
      markText: 'UCB',
      motto: { label: 'Motto', original: 'Fiat lux', zh: '要有光' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Seal_of_University_of_California,_Berkeley.svg'
    }],
    ['rice', {
      label: 'Rice',
      fullName: 'Rice University',
      region: 'united-states',
      colorName: 'Rice Blue',
      primary: '#00205b',
      secondary: '#c1c6c8',
      motto: { label: 'Seal', original: 'Letters · Science · Art', zh: '人文、科学与艺术' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Academic_Seal_Rice_University.svg'
    }],
    ['ucla', {
      label: 'UCLA',
      fullName: 'University of California, Los Angeles',
      region: 'united-states',
      colorName: 'UCLA Blue & Gold',
      primary: '#2774ae',
      secondary: '#ffd100',
      motto: { label: 'Motto', original: 'Fiat lux', zh: '要有光' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:The_University_of_California_UCLA.svg'
    }],
    ['vanderbilt', {
      label: 'Vanderbilt',
      fullName: 'Vanderbilt University',
      region: 'united-states',
      colorName: 'Vanderbilt Gold',
      primary: '#866d4b',
      secondary: '#1c1c1c',
      markText: 'VU',
      motto: { label: 'Motto', original: 'Crescere aude', zh: '敢于成长' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Vanderbilt_University_logo.svg'
    }],
    ['cmu', {
      label: 'Carnegie Mellon',
      fullName: 'Carnegie Mellon University',
      region: 'united-states',
      colorName: 'Carnegie Red',
      primary: '#c41230',
      secondary: '#1c1c1c',
      markText: 'CMU',
      motto: { label: 'Motto', original: 'My heart is in the work', zh: '我心在工作中' },
      identityReference: 'https://brand.cmu.edu/visual-identity/carnegie-mellon-trademarks/university-logo'
    }],
    ['michigan', {
      label: 'Michigan',
      fullName: 'University of Michigan–Ann Arbor',
      region: 'united-states',
      colorName: 'Michigan Blue & Maize',
      primary: '#00274c',
      secondary: '#ffcb05',
      markText: 'UM',
      motto: { label: 'Motto', original: 'Artes · Scientia · Veritas', zh: '艺术、知识与真理' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Seal_of_the_University_of_Michigan.svg'
    }],
    ['notre-dame', {
      label: 'Notre Dame',
      fullName: 'University of Notre Dame',
      region: 'united-states',
      colorName: 'Notre Dame Blue & Gold',
      primary: '#0c2340',
      secondary: '#c99700',
      markText: 'ND',
      motto: { label: 'Motto', original: 'Vita · Dulcedo · Spes', zh: '生命、甘甜与希望' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:University_of_Notre_Dame_seal_(2).svg'
    }],
    ['washu', {
      label: 'WashU',
      fullName: 'Washington University in St. Louis',
      region: 'united-states',
      colorName: 'WashU Red & Green',
      primary: '#a51417',
      secondary: '#007360',
      motto: { label: 'Motto', original: 'Per veritatem vis', zh: '真理赋予力量' },
      identityReference: 'https://marcomm.washu.edu/washu-logo/'
    }],
    ['emory', {
      label: 'Emory',
      fullName: 'Emory University',
      region: 'united-states',
      colorName: 'Emory Blue & Gold',
      primary: '#012169',
      secondary: '#f2a900',
      motto: { label: 'Motto', original: 'Cor prudentis possidebit scientiam', zh: '智者之心求取知识' },
      identityReference: 'https://brand.emory.edu/'
    }],
    ['georgetown', {
      label: 'Georgetown',
      fullName: 'Georgetown University',
      region: 'united-states',
      colorName: 'Georgetown Blue & Gray',
      primary: '#041e42',
      secondary: '#8d817b',
      markText: 'GU',
      motto: { label: 'Motto', original: 'Utraque unum', zh: '合二为一' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Georgetown_University_seal.svg'
    }],
    ['unc', {
      label: 'UNC Chapel Hill',
      fullName: 'University of North Carolina at Chapel Hill',
      region: 'united-states',
      colorName: 'Carolina Blue',
      primary: '#2f6f9f',
      secondary: '#4b9cd3',
      markText: 'UNC',
      motto: { label: 'Motto', original: 'Lux libertas', zh: '光明与自由' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Univ_north_carolina_original_seal.png'
    }],
    ['uva', {
      label: 'Virginia',
      fullName: 'University of Virginia',
      region: 'united-states',
      colorName: 'UVA Blue & Orange',
      primary: '#232d4b',
      secondary: '#e57200',
      markText: 'UVA',
      motto: { label: 'Motto', original: 'That future students may follow us', zh: '愿后来的学子循此前行' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:University_of_Virginia_seal.svg'
    }],
    ['usc', {
      label: 'USC',
      fullName: 'University of Southern California',
      region: 'united-states',
      colorName: 'USC Cardinal & Gold',
      primary: '#990000',
      secondary: '#ffcc00',
      motto: { label: 'Motto', original: 'Palmam qui meruit ferat', zh: '功成者当受其荣' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:University_of_Southern_California_(USC)_seal.svg'
    }],
    ['ucsd', {
      label: 'UC San Diego',
      fullName: 'University of California, San Diego',
      region: 'united-states',
      colorName: 'UC San Diego Blue & Gold',
      primary: '#00629b',
      secondary: '#c69214',
      markText: 'UCSD',
      motto: { label: 'Motto', original: 'Fiat lux', zh: '要有光' },
      identityReference: 'https://commons.wikimedia.org/wiki/File:Seal_of_the_University_of_California,_San_Diego.svg'
    }],
    ['florida', {
      label: 'Florida',
      fullName: 'University of Florida',
      region: 'united-states',
      colorName: 'Florida Blue & Orange',
      primary: '#0021a5',
      secondary: '#fa4616',
      markText: 'UF',
      motto: {
        label: 'Motto',
        original: 'Civium in moribus rei publicae salus',
        zh: '国之福祉系于公民德行'
      },
      identityReference: 'https://www.ufl.edu/'
    }],
    ['ut-austin', {
      label: 'UT Austin',
      fullName: 'The University of Texas at Austin',
      region: 'united-states',
      colorName: 'Burnt Orange',
      primary: '#bf5700',
      secondary: '#333f48',
      markText: 'UT',
      motto: { label: 'Motto', original: 'Disciplina praesidium civitatis', zh: '教育乃社会之保障' },
      identityReference: 'https://brand.utexas.edu/identity/logos/'
    }],
    ['washington', {
      label: 'UW',
      fullName: 'University of Washington',
      region: 'united-states',
      colorName: 'UW Purple & Gold',
      primary: '#4b2e83',
      secondary: '#b7a57a',
      motto: { label: 'Motto', original: 'Lux sit', zh: '要有光' }
    }]
  ].forEach(([id, definition]) => addSchool(id, definition));

  addBatch('united-kingdom', [
    ['imperial', 'Imperial', 'Imperial College London', '', '#003e74', '#dd2501', 'ICL'],
    ['ucl', 'UCL', 'University College London', '', '#500778', '#00a3e0', 'UCL'],
    ['edinburgh', 'Edinburgh', 'University of Edinburgh', '', '#041e42', '#c4d600', 'UOE'],
    ['kcl', 'King’s', 'King’s College London', '', '#8a1538', '#d4a017', 'KCL'],
    ['manchester', 'Manchester', 'University of Manchester', '', '#6b2c91', '#f2a900', 'UOM'],
    ['bristol', 'Bristol', 'University of Bristol', '', '#b01c2e', '#2b6f83', 'UOB'],
    ['glasgow', 'Glasgow', 'University of Glasgow', '', '#003865', '#f2a900', 'UOG']
  ]);

  addBatch('japan', [
    ['tohoku', 'Tohoku', 'Tohoku University', '東北大学', '#1f4e79', '#8dc63f', 'TU'],
    ['osaka', 'Osaka', 'The University of Osaka', '大阪大学', '#005a84', '#e87722', 'UO'],
    ['science-tokyo', 'Science Tokyo', 'Institute of Science Tokyo', '東京科学大学', '#003b70', '#c9a227', 'IST'],
    ['nagoya', 'Nagoya', 'Nagoya University', '名古屋大学', '#7a0019', '#f2a900', 'NU'],
    ['kyushu', 'Kyushu', 'Kyushu University', '九州大学', '#004b87', '#d71920', 'KU'],
    ['hokkaido', 'Hokkaido', 'Hokkaido University', '北海道大学', '#0b5d55', '#d4a017', 'HU'],
    ['tsukuba', 'Tsukuba', 'University of Tsukuba', '筑波大学', '#005a84', '#6bbbae', 'UT'],
    ['juntendo', 'Juntendo', 'Juntendo University', '順天堂大学', '#263b80', '#b72f3f', 'JU']
  ]);

  addBatch('hong-kong', [
    ['eduhk', 'EdUHK', 'The Education University of Hong Kong', '香港教育大學', '#7a0019', '#d4a017', 'EdU'],
    ['hkbu', 'HKBU', 'Hong Kong Baptist University', '香港浸會大學', '#c8102e', '#003b70', 'HKBU'],
    ['lingnan', 'Lingnan', 'Lingnan University', '嶺南大學', '#8a1538', '#f2a900', 'LU']
  ]);

  addBatch('singapore', [
    ['nus', 'NUS', 'National University of Singapore', '', '#003d7c', '#ef7c00', 'NUS'],
    ['ntu-singapore', 'NTU', 'Nanyang Technological University, Singapore', '', '#003b70', '#e31837', 'NTU'],
    ['sit', 'SIT', 'Singapore Institute of Technology', '', '#006747', '#f2a900', 'SIT'],
    ['smu', 'SMU', 'Singapore Management University', '', '#003b70', '#c9a227', 'SMU'],
    ['suss', 'SUSS', 'Singapore University of Social Sciences', '', '#7a0019', '#f2a900', 'SUSS'],
    ['sutd', 'SUTD', 'Singapore University of Technology and Design', '', '#e87722', '#263b80', 'SUTD']
  ]);

  addBatch('south-korea', [
    ['snu', 'SNU', 'Seoul National University', '서울대학교', '#003b70', '#c9a227', 'SNU'],
    ['kaist', 'KAIST', 'Korea Advanced Institute of Science and Technology', '한국과학기술원', '#004b87', '#d71920', 'KAIST'],
    ['yonsei', 'Yonsei', 'Yonsei University', '연세대학교', '#003876', '#d4a017', 'YU'],
    ['skku', 'SKKU', 'Sungkyunkwan University', '성균관대학교', '#0b5d55', '#f2a900', 'SKKU'],
    ['postech', 'POSTECH', 'Pohang University of Science and Technology', '포항공과대학교', '#8a1538', '#d4a017', 'POSTECH'],
    ['korea', 'Korea', 'Korea University', '고려대학교', '#862633', '#c9a227', 'KU'],
    ['unist', 'UNIST', 'Ulsan National Institute of Science and Technology', '울산과학기술원', '#005a84', '#6bbbae', 'UNIST'],
    ['hanyang', 'Hanyang', 'Hanyang University', '한양대학교', '#005bac', '#f2a900', 'HYU'],
    ['kyung-hee', 'Kyung Hee', 'Kyung Hee University', '경희대학교', '#7a0019', '#d4a017', 'KHU'],
    ['sejong', 'Sejong', 'Sejong University', '세종대학교', '#8a1538', '#f2a900', 'SJU']
  ]);

  addBatch('taiwan', [
    ['ntu-taiwan', 'NTU Taiwan', 'National Taiwan University', '國立臺灣大學', '#7a0019', '#d4a017', 'NTU'],
    ['cmu-taiwan', 'CMU Taiwan', 'China Medical University, Taiwan', '中國醫藥大學', '#0b5d55', '#d4a017', 'CMU'],
    ['asia-taiwan', 'Asia University', 'Asia University, Taiwan', '亞洲大學', '#6f2c91', '#d4b46a', 'AU'],
    ['taiwan-tech', 'Taiwan Tech', 'National Taiwan University of Science and Technology', '國立臺灣科技大學', '#004b87', '#d71920', 'NTUST'],
    ['nthu', 'NTHU', 'National Tsing Hua University', '國立清華大學', '#6f2c91', '#d4b46a', 'NTHU'],
    ['nycu', 'NYCU', 'National Yang Ming Chiao Tung University', '國立陽明交通大學', '#005a84', '#e87722', 'NYCU'],
    ['tmu', 'TMU', 'Taipei Medical University', '臺北醫學大學', '#005bac', '#6bbbae', 'TMU'],
    ['ncku', 'NCKU', 'National Cheng Kung University', '國立成功大學', '#8a1538', '#d4a017', 'NCKU'],
    ['ntnu', 'NTNU', 'National Taiwan Normal University', '國立臺灣師範大學', '#004b87', '#f2a900', 'NTNU'],
    ['yunlin-tech', 'YunTech', 'National Yunlin University of Science and Technology', '國立雲林科技大學', '#0b5d55', '#d4a017', 'YunTech']
  ]);

  addBatch('canada', [
    ['toronto', 'Toronto', 'University of Toronto', '', '#002a5c', '#d4a017', 'UofT'],
    ['ubc', 'UBC', 'University of British Columbia', '', '#002145', '#00a7e1', 'UBC'],
    ['mcgill', 'McGill', 'McGill University', '', '#ed1b2f', '#6a737b', 'McG'],
    ['mcmaster', 'McMaster', 'McMaster University', '', '#7a003c', '#fdbf57', 'MAC'],
    ['alberta', 'Alberta', 'University of Alberta', '', '#007c41', '#ffdb05', 'UofA'],
    ['montreal', 'Montréal', 'Université de Montréal', '', '#0057b8', '#f2a900', 'UdeM'],
    ['waterloo', 'Waterloo', 'University of Waterloo', '', '#000000', '#fdd54f', 'UW'],
    ['calgary', 'Calgary', 'University of Calgary', '', '#c8102e', '#f2a900', 'UCal'],
    ['ottawa', 'Ottawa', 'University of Ottawa', '', '#8f001a', '#6a737b', 'uOttawa'],
    ['western', 'Western', 'Western University', '', '#4f2683', '#c4d600', 'Western']
  ]);

  addBatch('germany', [
    ['tum', 'TUM', 'Technical University of Munich', 'Technische Universität München', '#005293', '#c9a227', 'TUM'],
    ['lmu', 'LMU Munich', 'LMU Munich', 'Ludwig-Maximilians-Universität München', '#006633', '#f2a900', 'LMU'],
    ['heidelberg', 'Heidelberg', 'Heidelberg University', 'Ruprecht-Karls-Universität Heidelberg', '#8a1538', '#d4a017', 'RKU'],
    ['humboldt', 'Humboldt', 'Humboldt University of Berlin', 'Humboldt-Universität zu Berlin', '#003b70', '#c9a227', 'HU'],
    ['charite', 'Charité', 'Charité – Universitätsmedizin Berlin', '', '#7a0019', '#6bbbae', 'CU'],
    ['rwth', 'RWTH Aachen', 'RWTH Aachen University', '', '#00549f', '#8dc63f', 'RWTH'],
    ['bonn', 'Bonn', 'University of Bonn', 'Rheinische Friedrich-Wilhelms-Universität Bonn', '#004b87', '#d71920', 'UB'],
    ['tubingen', 'Tübingen', 'University of Tübingen', 'Eberhard Karls Universität Tübingen', '#8a1538', '#d4a017', 'UT'],
    ['fu-berlin', 'FU Berlin', 'Free University of Berlin', 'Freie Universität Berlin', '#006633', '#f2a900', 'FUB'],
    ['gottingen', 'Göttingen', 'University of Göttingen', 'Georg-August-Universität Göttingen', '#003b70', '#c9a227', 'UG']
  ]);

  addBatch('france', [
    ['psl', 'PSL', 'Paris Sciences et Lettres – PSL Research University Paris', '', '#7a0019', '#d4a017', 'PSL'],
    ['ip-paris', 'IP Paris', 'Institut Polytechnique de Paris', '', '#003b70', '#e87722', 'IP'],
    ['paris-saclay', 'Paris-Saclay', 'Paris-Saclay University', 'Université Paris-Saclay', '#005a84', '#d4a017', 'UPS'],
    ['sorbonne', 'Sorbonne', 'Sorbonne University', 'Sorbonne Université', '#004b87', '#d71920', 'SU'],
    ['paris-cite', 'Paris Cité', 'Paris Cité University', 'Université Paris Cité', '#7a0019', '#6bbbae', 'UPC'],
    ['ens-lyon', 'ENS Lyon', 'École Normale Supérieure de Lyon', '', '#8a1538', '#d4a017', 'ENSL'],
    ['grenoble', 'Grenoble Alpes', 'Université Grenoble Alpes', '', '#005bac', '#f2a900', 'UGA'],
    ['imt-atlantique', 'IMT Atlantique', 'IMT Atlantique', '', '#004f71', '#e87722', 'IMT'],
    ['institut-agro', 'Institut Agro', 'Institut Agro', '', '#1d6b3c', '#d4a017', 'IA'],
    ['montpellier', 'Montpellier', 'University of Montpellier', 'Université de Montpellier', '#8a1538', '#6bbbae', 'UM']
  ]);

  addBatch('switzerland', [
    ['eth', 'ETH Zürich', 'ETH Zurich', 'Eidgenössische Technische Hochschule Zürich', '#000000', '#1f4e79', 'ETH'],
    ['epfl', 'EPFL', 'École Polytechnique Fédérale de Lausanne', '', '#e3001b', '#6a737b', 'EPFL'],
    ['bern', 'Bern', 'University of Bern', 'Universität Bern', '#7a0019', '#d4a017', 'UNIBE'],
    ['basel', 'Basel', 'University of Basel', 'Universität Basel', '#005a84', '#d4a017', 'UNIBAS'],
    ['lausanne', 'Lausanne', 'University of Lausanne', 'Université de Lausanne', '#004b87', '#6bbbae', 'UNIL'],
    ['geneva', 'Geneva', 'University of Geneva', 'Université de Genève', '#8a1538', '#d4a017', 'UNIGE'],
    ['usi', 'USI', 'Università della Svizzera italiana', '', '#263b80', '#e87722', 'USI'],
    ['st-gallen', 'St Gallen', 'University of St Gallen', 'Universität St.Gallen', '#0b5d55', '#d4a017', 'HSG'],
    ['fribourg', 'Fribourg', 'University of Fribourg', 'Université de Fribourg', '#7a0019', '#6bbbae', 'UNIFR'],
    ['neuchatel', 'Neuchâtel', 'University of Neuchâtel', 'Université de Neuchâtel', '#004b87', '#d4a017', 'UniNE']
  ]);

  addBatch('australia', [
    ['melbourne', 'Melbourne', 'University of Melbourne', '', '#003b70', '#c9a227', 'UniMelb'],
    ['sydney', 'Sydney', 'University of Sydney', '', '#c8102e', '#f2a900', 'USYD'],
    ['monash', 'Monash', 'Monash University', '', '#006dae', '#6a737b', 'MON'],
    ['anu', 'ANU', 'Australian National University', '', '#be830e', '#003b70', 'ANU'],
    ['unsw', 'UNSW', 'UNSW Sydney', '', '#000000', '#ffd100', 'UNSW'],
    ['queensland', 'Queensland', 'The University of Queensland', '', '#51247a', '#f2a900', 'UQ'],
    ['adelaide', 'Adelaide', 'Adelaide University', '', '#005a84', '#d4a017', 'AU'],
    ['uts', 'UTS', 'University of Technology Sydney', '', '#000000', '#e87722', 'UTS'],
    ['uwa', 'UWA', 'The University of Western Australia', '', '#003b70', '#c9a227', 'UWA'],
    ['macquarie', 'Macquarie', 'Macquarie University', '', '#8a1538', '#d4a017', 'MQ']
  ]);

  [
    ['buaa', {
      motto: { label: '校训', original: '德才兼备 · 知行合一', zh: '' },
      identityReference: 'https://buaa.edu.cn/info/1005/1003.htm'
    }],
    ['southeast', {
      motto: { label: '校训', original: '止于至善', zh: '' },
      identityReference: 'https://www.seu.edu.cn/2017/0524/c17410a189987/page.psp'
    }],
    ['xiamen', {
      motto: { label: '校训', original: '自强不息 · 止于至善', zh: '' },
      identityReference: 'https://www.xmu.edu.cn/sdgl/xxbs.htm'
    }],
    ['sysu', {
      motto: { label: '校训', original: '博学 · 审问 · 慎思 · 明辨 · 笃行', zh: '' },
      identityReference: 'https://www.sysu.edu.cn/xxg/zdjj1.htm'
    }],
    ['imperial', {
      motto: {
        label: 'Motto',
        original: 'Scientia imperii decus et tutamen',
        zh: '科学乃帝国之光荣与保障'
      },
      identityReference: 'https://www.imperial.ac.uk/brand-style-guide/'
    }],
    ['ucl', {
      motto: {
        label: 'Motto',
        original: 'Cuncti adsint meritaeque expectent praemia palmae',
        zh: '愿贤者皆至，凭其功绩赢得荣誉'
      },
      identityReference: 'https://www.ucl.ac.uk/brand/'
    }],
    ['edinburgh', {
      motto: { label: 'Motto', original: 'Nec temere · nec timide', zh: '不鲁莽，不怯懦' },
      identityReference: 'https://www.ed.ac.uk/about/website/website-terms-conditions/logo'
    }],
    ['kcl', {
      motto: { label: 'Motto', original: 'Sancte et sapienter', zh: '虔敬而睿智' },
      identityReference: 'https://www.kcl.ac.uk/brand'
    }]
  ].forEach(([id, definition]) => addSchool(id, definition));

  [
    ['oxford', 'https://www.ox.ac.uk/about/organisation/history/coat-arms'],
    ['cambridge', 'https://www.cam.ac.uk/brand-resources'],
    ['lse', 'https://info.lse.ac.uk/staff/divisions/communications-division/brand'],
    ['peking', 'https://www.pku.edu.cn/'],
    ['tsinghua', 'https://www.tsinghua.edu.cn/'],
    ['fudan', 'https://www.fudan.edu.cn/'],
    ['sjtu', 'https://www.sjtu.edu.cn/'],
    ['zhejiang', 'https://www.zju.edu.cn/'],
    ['nanjing', 'https://www.nju.edu.cn/'],
    ['ustc', 'https://www.ustc.edu.cn/'],
    ['tongji', 'https://www.tongji.edu.cn/'],
    ['wuhan', 'https://www.whu.edu.cn/'],
    ['hit', 'https://www.hit.edu.cn/'],
    ['hku', 'https://www.hku.hk/'],
    ['cuhk', 'https://www.cuhk.edu.hk/'],
    ['hkust', 'https://hkust.edu.hk/'],
    ['polyu', 'https://www.polyu.edu.hk/'],
    ['cityu', 'https://www.cityu.edu.hk/'],
    ['tokyo', 'https://www.u-tokyo.ac.jp/en/'],
    ['kyoto', 'https://www.kyoto-u.ac.jp/en'],
    ['washington', 'https://www.washington.edu/brand/graphic-elements/']
  ].forEach(([id, reference]) => addSchool(id, {
    identityReference: reference,
    mottoReference: reference
  }));

  function schoolArticleReference(id) {
    const title = schools[id].fullName.replace(/\s+/g, '_');
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title).replace(/%2F/g, '/')}`;
  }

  [
    // 中国大陆：原文已经是中文，不再追加重复翻译。
    ['renmin', '校训', '实事求是', ''],
    ['bit', '校训', '德以明理 · 学以精工', '', 'https://www.bit.edu.cn/'],
    ['cau', '校训', '解民生之多艰 · 育天下之英才', ''],
    ['bnu', '校训', '学为人师 · 行为世范', ''],
    ['minzu', '校训', '美美与共 · 知行合一', ''],
    ['nankai', '校训', '允公允能 · 日新月异', ''],
    ['tianjin', '校训', '实事求是', ''],
    ['dlut', '校训', '海纳百川 · 自强不息 · 厚德笃学 · 知行合一', ''],
    ['northeastern', '校训', '自强不息 · 知行合一', ''],
    ['jilin', '校训', '求实创新 · 励志图强', ''],
    ['ecnu', '校训', '求实创造 · 为人师表', ''],
    ['shandong', '校训', '学无止境 · 气有浩然', ''],
    ['ocean-china', '校训', '海纳百川 · 取则行远', ''],
    ['hust', '校训', '明德 · 厚学 · 求是 · 创新', ''],
    ['hunan', '校训', '实事求是 · 敢为人先', ''],
    ['csu', '校训', '知行合一 · 经世致用', ''],
    ['nudt', '校训', '厚德博学 · 强军兴国', ''],
    ['scut', '校训', '博学慎思 · 明辨笃行', ''],
    ['sichuan', '校训', '海纳百川 · 有容乃大', ''],
    ['uestc', '校训', '求实求真 · 大气大为', ''],
    ['chongqing', '校训', '耐劳苦 · 尚俭朴 · 勤学业 · 爱国家', ''],
    ['xian-jiaotong', '校训', '精勤求学 · 敦笃励志 · 果毅力行 · 忠恕任事', ''],
    ['nwpu', '校训', '公诚勇毅', ''],
    ['nwafu', '校训', '诚朴勇毅', ''],
    ['lanzhou', '校训', '自强不息 · 独树一帜', ''],

    ['manchester', 'Motto', 'Cognitio · Sapientia · Humanitas', '知识 · 智慧 · 人文'],
    ['bristol', 'Motto', 'Vim promovet insitam', '学问激发天赋'],
    ['glasgow', 'Motto', 'Via · Veritas · Vita', '道路 · 真理 · 生命'],

    ['tohoku', 'Principles', '研究第一主義 · 門戸開放 · 実学尊重', '研究至上 · 门户开放 · 崇尚实学', 'https://www.tohoku.ac.jp/en/about/'],
    ['osaka', 'Motto', '地域に生き、世界に伸びる', '扎根地方 · 走向世界'],
    ['science-tokyo', 'Spirit', 'Advancing science and human wellbeing', '推动科学进步 · 增进人类福祉'],
    ['nagoya', 'Motto', '勇気ある知識人', '成为有勇气的知识人'],
    ['kyushu', 'Slogan', 'Leap into the Next', '跃向下一个未来', 'https://www.kyushu-u.ac.jp/en/topics/view/363/'],
    ['hokkaido', 'Motto', '少年よ、大志を抱け', '少年啊 · 要胸怀大志'],
    ['tsukuba', 'Motto', 'Imagine the Future', '构想未来'],
    ['juntendo', '学是', '仁', '', 'https://en.juntendo.ac.jp/about/mission.html'],

    ['eduhk', '校训', '文行忠信', ''],
    ['hkbu', '校训', '笃信力行', ''],
    ['lingnan', '校训', '作育英才 · 服务社会', ''],

    ['nus', 'Spirit', 'Shaping the Future', '塑造未来', 'https://www.nus.edu.sg/'],
    ['ntu-singapore', '校训', '自强不息 · 力求上进', '', 'https://www.ntu.edu.sg/about-us'],
    ['sit', 'Vision', 'A Premier University of Applied Learning', '卓越的应用学习型大学', 'https://www.singaporetech.edu.sg/about/our-mission-and-vision'],
    ['smu', 'Spirit', 'Shaping Impact · Transforming Lives', '塑造影响 · 改变人生', 'https://www.smu.edu.sg/about/smu2030'],
    ['suss', 'Vision', 'Inspiring Learning for Life · Impacting Lives', '启迪终身学习 · 成就人生影响', 'https://www.suss.edu.sg/about/about-suss/who-we-are'],
    ['sutd', 'Motto', 'Trailblazing a Better World by Design', '以设计开创更美好的世界'],

    ['snu', 'Motto', 'Veritas Lux Mea', '真理是我的光'],
    ['kaist', 'Spirit', 'Challenge · Creativity · Caring', '挑战 · 创造 · 关怀', 'https://kaist.ac.kr/en/html/kaist/011301.html'],
    ['yonsei', 'Motto', 'Cognoscetis Veritatem et Veritas Liberabit Vos', '真理必使你们自由'],
    ['skku', 'Motto', '인의예지', '仁 · 义 · 礼 · 智'],
    ['postech', 'Motto', '성실 · 창의 · 진취', '诚实 · 创意 · 进取'],
    ['korea', 'Motto', 'Libertas · Justitia · Veritas', '自由 · 正义 · 真理'],
    ['unist', 'Motto', 'First in Change', '率先改变'],
    ['hanyang', 'Motto', '사랑의 실천', '爱之实践'],
    ['kyung-hee', 'Motto', '학원의 민주화 · 사상의 민주화 · 생활의 민주화', '学府民主化 · 思想民主化 · 生活民主化'],
    ['sejong', 'Motto', 'Creativitas Servitium', '创造与服务'],

    // 中国台湾：保留学校通行的中文原文，不机械重复翻译。
    ['ntu-taiwan', '校训', '敦品励学 · 爱国爱人', ''],
    ['cmu-taiwan', '校训', '仁 · 慎 · 勤 · 廉', ''],
    ['asia-taiwan', '校训', '健康 · 关怀 · 创新 · 卓越', ''],
    ['taiwan-tech', '校训', '精诚', ''],
    ['nthu', '校训', '自强不息 · 厚德载物', ''],
    ['nycu', '校训', '真知力行 · 仁心仁术', ''],
    ['tmu', '校训', '诚朴', ''],
    ['ncku', '校训', '穷理致知', ''],
    ['ntnu', '校训', '诚正勤朴', ''],
    ['yunlin-tech', '校训', '诚敬恒新', ''],

    ['toronto', 'Motto', 'Velut arbor ævo', '如树木般历久生长'],
    ['ubc', 'Motto', 'Tuum Est', '一切在你'],
    ['mcgill', 'Motto', 'Grandescunt Aucta Labore', '万物因勤勉而发展壮大'],
    ['mcmaster', 'Motto', 'Τὰ πάντα ἐν Χριστῷ συνέστηκεν', '万有靠基督而立'],
    ['alberta', 'Motto', 'Quaecumque vera', '凡是真实的'],
    ['montreal', 'Motto', 'Fide splendet et scientia', '以信仰与知识照耀'],
    ['waterloo', 'Motto', 'Concordia cum veritate', '与真理和谐共处'],
    ['calgary', 'Motto', 'Mo Shùile Togam Suas', '我将举目仰望'],
    ['ottawa', 'Motto', 'Deus scientiarum Dominus est', '上帝乃知识之主'],
    ['western', 'Motto', 'Veritas et Utilitas', '真理与实用', 'https://www.president.uwo.ca/strategic_planning/sptf2001/intro.html'],

    ['tum', 'Spirit', 'The Entrepreneurial University', '创业型大学'],
    ['lmu', 'Spirit', 'A New Perspective', '全新视野', 'https://www.lmu.de/en/about-lmu/lmu-at-a-glance/awards/excellence-strategy/university-of-excellence/'],
    ['heidelberg', 'Motto', 'Semper apertus', '永远开放'],
    ['humboldt', 'Motto', 'Universitas litterarum', '学问共同体'],
    ['charite', 'Motto', 'Forschen · Lehren · Heilen · Helfen', '研究 · 教学 · 治疗 · 助人'],
    ['rwth', 'Motto', 'Zukunft denken', '思考未来'],
    ['bonn', 'Spirit', 'The Bonn Spirit of WE', '共筑波恩“我们”精神', 'https://www.uni-bonn.de/en/university/about-the-university/mission-statement'],
    ['tubingen', 'Motto', 'Attempto!', '我敢！'],
    ['fu-berlin', 'Motto', 'Veritas · Iustitia · Libertas', '真理 · 正义 · 自由'],
    ['gottingen', 'Motto', 'In publica commoda', '为众人谋福祉'],

    ['psl', 'Motto', 'Sapere Aude', '敢于求知', 'https://psl.eu/en/university/sapere-aude'],
    ['ip-paris', 'Spirit', 'Servir la science', '献身科学', 'https://www.ip-paris.fr/en/about'],
    ['paris-saclay', 'Spirit', 'La science au service d’une société plus juste et plus vivable', '以科学服务更公正 · 更宜居的社会', 'https://www.universite-paris-saclay.fr/en/about/about-universite-paris-saclay'],
    ['sorbonne', 'Motto', 'Créateurs de futurs depuis 1257', '自1257年起 · 创造未来'],
    ['paris-cite', 'Motto', 'Planetary Health: healthy people, in healthy societies, on a healthy planet', '地球健康：健康的人 · 健康的社会 · 健康的星球', 'https://u-paris.fr/language/en/development-strategy/'],
    ['ens-lyon', 'Motto', 'L’enseignement par la recherche · pour la recherche', '以研究育人 · 为研究育人'],
    ['grenoble', 'Motto', 'Veritas Liberabit', '真理使人自由'],
    ['imt-atlantique', 'Spirit', 'Ingénieur pour transformer l’avenir', '培养改变未来的工程师', 'https://www.imt-atlantique.fr/en/about'],
    ['institut-agro', 'Spirit', 'Former · Chercher · Innover', '育人 · 研究 · 创新', 'https://www.institut-agro.fr/en/our-missions'],
    ['montpellier', 'Values', 'La réussite au mérite · l’égalité des chances', '凭实力取得成功 · 机会平等', 'https://www.umontpellier.fr/articles/je-choisis-universite-de-montpellier'],

    ['eth', 'Motto', 'Where the future begins', '未来由此开始', 'https://ethz.ch/en.html'],
    ['epfl', 'Spirit', 'Positive and lasting change', '带来积极而持久的改变', 'https://www.epfl.ch/about/overview/'],
    ['bern', 'Claim', 'Wissen schafft Wert', '知识创造价值', 'https://www.unibe.ch/unibe/portal/content/e152701/e322683/e1681678/e1681679/ul_ws_markenfuehrung_ger.pdf'],
    ['basel', 'Spirit', 'Your future starts here', '你的未来从这里开始', 'https://www.unibas.ch/en/'],
    ['lausanne', 'Motto', 'Le savoir vivant', '鲜活的知识'],
    ['geneva', 'Motto', 'Post tenebras lux', '黑暗之后是光明', 'https://www.unige.ch/en'],
    ['usi', 'Motto', 'Libertà di creare · responsabilità nell’agire', '创造的自由 · 行动的责任'],
    ['st-gallen', 'Motto', 'From insight to impact', '从洞见到影响'],
    ['fribourg', 'Motto', 'Scientia et Sapientia', '知识与智慧'],
    ['neuchatel', 'Values', 'Intégrité · respect · intérêt général', '诚信 · 尊重 · 公共利益', 'https://www.unine.ch/luniversite/portrait/valeurs'],

    ['melbourne', 'Motto', 'Postera Crescam Laude', '我将在后人的赞誉中成长'],
    ['sydney', 'Motto', 'Sidere mens eadem mutato', '繁星纵变 · 心智如一'],
    ['monash', 'Motto', 'Ancora imparo', '我仍在学习'],
    ['anu', 'Motto', 'Naturam Primum Cognoscere Rerum', '首在认识万物本质'],
    ['unsw', 'Motto', 'Scientia Corde Manu et Mente', '以心 · 以手 · 以智求知'],
    ['queensland', 'Motto', 'Scientia ac Labore', '凭知识与勤勉'],
    ['adelaide', 'Spirit', 'A university for the future', '面向未来的大学'],
    ['uts', 'Motto', 'Think · Change · Do', '思考 · 改变 · 行动'],
    ['uwa', 'Motto', 'Seek Wisdom', '探索智慧'],
    ['macquarie', 'Motto', 'And gladly teche', '并以教人为乐', 'https://www.mq.edu.au/']
  ].forEach(([id, label, original, zh, reference]) => {
    const source = reference || schoolArticleReference(id);
    addSchool(id, {
      motto: { label, original, zh },
      mottoReference: source,
      identityReference: source,
      mark: `/assets/school-marks/${id}.png`,
      markType: 'local'
    });
  });

  const china985 = [
    'peking', 'renmin', 'tsinghua', 'buaa', 'bit', 'cau', 'bnu', 'minzu',
    'nankai', 'tianjin', 'dlut', 'northeastern', 'jilin', 'hit', 'fudan',
    'tongji', 'sjtu', 'ecnu', 'nanjing', 'southeast', 'zhejiang', 'ustc',
    'xiamen', 'shandong', 'ocean-china', 'wuhan', 'hust', 'hunan', 'csu',
    'nudt', 'sysu', 'scut', 'sichuan', 'uestc', 'chongqing', 'xian-jiaotong',
    'nwpu', 'nwafu', 'lanzhou'
  ];

  const collections = Object.freeze({
    'china-top10': {
      id: 'china-top10',
      continent: 'asia',
      region: 'china-mainland',
      label: '中国大陆前十',
      meta: 'THE 世界大学排名 2026 · 中国大陆顺序',
      sourceId: 'theWorld2026',
      rankPrefix: '本国',
      themes: ['tsinghua', 'peking', 'fudan', 'zhejiang', 'sjtu', 'ustc', 'nanjing', 'wuhan', 'hit', 'bnu']
    },
    'china-985': {
      id: 'china-985',
      continent: 'asia',
      region: 'china-mainland',
      label: '985 全部院校',
      meta: '教育部公布的 39 所“985工程”学校',
      sourceId: 'moe985',
      rankPrefix: '',
      badge: '985',
      themes: china985
    },
    'hong-kong': {
      id: 'hong-kong',
      continent: 'asia',
      region: 'hong-kong',
      label: '中国香港',
      meta: 'THE 亚洲大学排名 2026 · 共 8 所',
      sourceId: 'theAsia2026',
      rankPrefix: '本区',
      themes: ['hku', 'cuhk', 'hkust', 'cityu', 'polyu', 'eduhk', 'hkbu', 'lingnan']
    },
    japan: {
      id: 'japan',
      continent: 'asia',
      region: 'japan',
      label: '日本前十',
      meta: 'THE 世界大学排名 2026 · 日本顺序',
      sourceId: 'theWorld2026',
      rankPrefix: '本国',
      themes: ['tokyo', 'kyoto', 'tohoku', 'osaka', 'science-tokyo', 'nagoya', 'kyushu', 'hokkaido', 'tsukuba', 'juntendo']
    },
    singapore: {
      id: 'singapore',
      continent: 'asia',
      region: 'singapore',
      label: '新加坡自治大学',
      meta: '教育部官方名录 · 实际共 6 所',
      sourceId: 'singaporeMoe',
      rankPrefix: '',
      badge: 'MOE AU',
      themes: ['nus', 'ntu-singapore', 'sit', 'smu', 'suss', 'sutd']
    },
    'south-korea': {
      id: 'south-korea',
      continent: 'asia',
      region: 'south-korea',
      label: '韩国前十',
      meta: 'THE 世界大学排名 2026 · 韩国顺序',
      sourceId: 'theWorld2026',
      rankPrefix: '本国',
      themes: ['snu', 'kaist', 'yonsei', 'skku', 'postech', 'korea', 'unist', 'hanyang', 'kyung-hee', 'sejong']
    },
    taiwan: {
      id: 'taiwan',
      continent: 'asia',
      region: 'taiwan',
      label: '中国台湾前十',
      meta: 'THE 世界大学排名 2026 · 台湾地区顺序',
      sourceId: 'theWorld2026',
      rankPrefix: '本区',
      themes: ['ntu-taiwan', 'cmu-taiwan', 'asia-taiwan', 'taiwan-tech', 'nthu', 'nycu', 'tmu', 'ncku', 'ntnu', 'yunlin-tech']
    },
    'united-states': {
      id: 'united-states',
      continent: 'north-america',
      region: 'united-states',
      label: '美国前30',
      meta: 'U.S. News 2026 · 前30名次（含并列，共31校）',
      sourceId: 'usNewsNational2026',
      rankPrefix: '本国',
      themes: [
        'princeton', 'mit', 'harvard', 'stanford', 'yale', 'uchicago',
        'duke', 'johns-hopkins', 'northwestern-us', 'upenn', 'caltech',
        'cornell', 'brown', 'dartmouth', 'columbia', 'berkeley', 'rice',
        'ucla', 'vanderbilt', 'cmu', 'michigan', 'notre-dame', 'washu',
        'emory', 'georgetown', 'unc', 'uva', 'usc', 'ucsd', 'florida',
        'ut-austin'
      ],
      ranks: {
        princeton: 1,
        mit: 2,
        harvard: 3,
        stanford: 4,
        yale: 4,
        uchicago: 6,
        duke: 7,
        'johns-hopkins': 7,
        'northwestern-us': 7,
        upenn: 7,
        caltech: 11,
        cornell: 12,
        brown: 13,
        dartmouth: 13,
        columbia: 15,
        berkeley: 15,
        rice: 17,
        ucla: 17,
        vanderbilt: 17,
        cmu: 20,
        michigan: 20,
        'notre-dame': 20,
        washu: 20,
        emory: 24,
        georgetown: 24,
        unc: 26,
        uva: 26,
        usc: 28,
        ucsd: 29,
        florida: 30,
        'ut-austin': 30
      }
    },
    canada: {
      id: 'canada',
      continent: 'north-america',
      region: 'canada',
      label: '加拿大前十',
      meta: 'U.S. News 2026–27 · 加拿大顺序',
      sourceId: 'usNewsGlobal2027',
      rankPrefix: '本国',
      themes: ['toronto', 'ubc', 'mcgill', 'mcmaster', 'alberta', 'montreal', 'waterloo', 'calgary', 'ottawa', 'western']
    },
    'united-kingdom': {
      id: 'united-kingdom',
      continent: 'europe',
      region: 'united-kingdom',
      label: '英国前十',
      meta: 'THE 世界大学排名 2026 · 英国顺序',
      sourceId: 'theWorld2026',
      rankPrefix: '本国',
      themes: ['oxford', 'cambridge', 'imperial', 'ucl', 'edinburgh', 'kcl', 'lse', 'manchester', 'bristol', 'glasgow']
    },
    germany: {
      id: 'germany',
      continent: 'europe',
      region: 'germany',
      label: '德国前十',
      meta: 'THE 世界大学排名 2026 · 德国顺序',
      sourceId: 'theWorld2026',
      rankPrefix: '本国',
      themes: ['tum', 'lmu', 'heidelberg', 'humboldt', 'charite', 'rwth', 'bonn', 'tubingen', 'fu-berlin', 'gottingen']
    },
    france: {
      id: 'france',
      continent: 'europe',
      region: 'france',
      label: '法国前十',
      meta: 'THE 世界大学排名 2026 · 法国顺序（并列按榜单顺序）',
      sourceId: 'theWorld2026',
      rankPrefix: '本国',
      themes: ['psl', 'ip-paris', 'paris-saclay', 'sorbonne', 'paris-cite', 'ens-lyon', 'grenoble', 'imt-atlantique', 'institut-agro', 'montpellier']
    },
    switzerland: {
      id: 'switzerland',
      continent: 'europe',
      region: 'switzerland',
      label: '瑞士前十',
      meta: 'THE 世界大学排名 2026 · 瑞士顺序',
      sourceId: 'theWorld2026',
      rankPrefix: '本国',
      themes: ['eth', 'epfl', 'bern', 'basel', 'lausanne', 'geneva', 'usi', 'st-gallen', 'fribourg', 'neuchatel']
    },
    australia: {
      id: 'australia',
      continent: 'oceania',
      region: 'australia',
      label: '澳大利亚前十',
      meta: 'THE 世界大学排名 2026 · 澳大利亚顺序',
      sourceId: 'theWorld2026',
      rankPrefix: '本国',
      themes: ['melbourne', 'sydney', 'monash', 'anu', 'unsw', 'queensland', 'adelaide', 'uts', 'uwa', 'macquarie']
    }
  });

  const continents = Object.freeze([
    { id: 'asia', label: '亚洲', collections: ['china-top10', 'china-985', 'hong-kong', 'japan', 'singapore', 'south-korea', 'taiwan'] },
    { id: 'north-america', label: '北美洲', collections: ['united-states', 'canada'] },
    { id: 'europe', label: '欧洲', collections: ['united-kingdom', 'germany', 'france', 'switzerland'] },
    { id: 'oceania', label: '大洋洲', collections: ['australia'] }
  ]);

  const groups = Object.freeze(
    Object.values(collections).map(collection => Object.freeze({
      id: collection.id,
      label: collection.label,
      meta: collection.meta,
      themes: Object.freeze([...collection.themes])
    }))
  );

  Object.values(collections).forEach(collection => {
    collection.themes.forEach(themeId => {
      if (!schools[themeId]) {
        throw new Error(`学校主题 ${themeId} 未注册`);
      }
    });
  });

  Object.values(schools).forEach(school => Object.freeze(school));

  root.CMS_SCHOOL_THEME_CATALOG = Object.freeze({
    version: '3.2.1',
    defaultTheme: 'stanford',
    defaultCollection: 'china-top10',
    rankingSources,
    continents,
    collections,
    groups,
    schools: Object.freeze(schools)
  });
})(globalThis);
