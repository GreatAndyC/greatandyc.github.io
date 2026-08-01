# School Theme Pack

这套学校主题按“目录数据、视觉令牌、本地图像、宿主适配”拆分，可以从当前 CMS 独立打包迁移。

## 可直接打包的资产

1. `school-themes.js`
   - `continents`：洲级导航
   - `collections`：国家、地区或官方院校集合
   - `rankingSources`：每个集合自己的排名／名录来源
   - `schools`：学校名称、原文名称、主色、悬停色、辅助色、标志与格言
2. `school-themes.css`
   - 由 `generate-school-theme-css.js` 从目录自动生成的同源 CSS Custom Properties
   - 不手写学校选择器；新增学校后运行一次生成器即可，同时继续满足 CMS 的严格 CSP
3. `assets/school-marks/`
   - 175 所学校已经全部本地化为统一的 PNG 标志
   - `markText` 只在文件损坏或丢失时作为运行时容错，不再是正常目录中的视觉占位

把以上三项保持相同目录结构，即可作为独立的 `school-theme-pack`。

## 目录结构与当前范围

- 亚洲：中国大陆前十、39 所 985、中国香港 8 所、日本前十、新加坡 6 所自治大学、韩国前十、中国台湾前十
- 北美洲：美国 U.S. News 2026 National Universities 前 30 名次（含并列，共 31 校）、加拿大前十
- 欧洲：英国、德国、法国、瑞士前十
- 大洋洲：澳大利亚前十

洲只负责降低导航密度；真正的筛选单元是国家、地区或“985”这样的官方集合。这样不会把香港、新加坡、台湾等口径硬塞进不准确的国家分类，也能避免 150 多个主题出现在一个超长平铺列表里。

## 排名与名录口径

- 中国大陆前十：THE World University Rankings 2026
- 中国大陆 985：中华人民共和国教育部公布的 39 所“985工程”学校名单
- 美国：U.S. News Best National Universities 2026。第 30 名有两所并列院校，因此保留全部并列后实际展示 31 所，不用数组位置伪造排名。
- 加拿大：U.S. News Best Global Universities 2026–2027，按加拿大院校在全球榜中的出现顺序
- 英国、德国、法国、瑞士、澳大利亚、日本、韩国、台湾：THE World University Rankings 2026 的国家／地区筛选顺序
- 中国香港：THE Asia University Rankings 2026；实际展示 8 所，不虚构“前十”
- 新加坡：新加坡教育部 6 所 Autonomous Universities 官方名录；这是院校集合而不是排名

排名会变化，官方院校集合也可能调整。升级时修改 `rankingSources` 和对应 `collections` 的 `themes` 顺序；若学校颜色有增删，再运行：

```sh
npm run cms:themes
```

## 全目录完整度基线

美国集合最先建立了验收规则，目录 `3.2.1` 已把同一规则扩展到全部 175 所学校：

- 所有院校均使用本地 PNG 标志，不使用自动生成的字母章。
- 所有院校均具有正式校训；确实没有传统校训的年轻院校，使用学校官方愿景、精神语或品牌宣言，并通过 `label` 明确标为 `Spirit`、`Vision`、`Values` 或 `Claim`，不冒充传统校训。
- CMS 的读者界面统一显示中文栏目名“校训”；目录中的 `motto.label` 继续保留 `Motto`、`Spirit`、`Vision` 等原始资料类型，供审计与迁移使用。
- 中文原文直接展示，不再追加尴尬的同义“中文翻译”；外文原文附经过整理的中文译文。
- `collections.united-states.ranks` 保存 U.S. News 的真实名次；Stanford／Yale、Duke／Johns Hopkins／Northwestern／Penn 等并列关系不会被数组顺序改写。
- `identityReference` 记录学校官网、官方品牌页或学校条目，`mottoReference` 单独记录校训／正式精神语来源，便于迁移后复核。

采用的榜单口径是 U.S. News 2026 `Best National Universities`，不是从全球大学榜中筛选美国院校。后者会把只设研究生或医学教育的机构混入面向综合大学的主题目录。

## 资产完整度审计

目录版本 `3.2.1` 共登记 175 所学校。当前审计结果：

- 美国前 30 名次：31/31 有本地标志，31/31 有原文与中文校训。
- 全目录：175/175 有本地 PNG 标志。
- 全目录：175/175 有校训或明确标注的正式精神语。
- 全目录：175/175 有机构身份来源和校训／精神语来源。

新增学校时，仍须同时满足本地标志、原文校训或正式精神语、必要的中文译文、机构来源和文字来源，再计入完整主题。只登记名称和主题色不算完成。

`3.2.1` 额外按白底界面的实际可见性复核了标志，而不再只检查“文件存在”。中山大学、北京航空航天大学、复旦大学、哈尔滨工业大学、南京大学、国立阳明交通大学、国立台湾师范大学、日内瓦大学、华盛顿大学与圣路易斯华盛顿大学的本地资产已更换为适合小尺寸白底卡片的现行标志；同时把学校卡片的标志视窗加宽，以免横式官方字标被压缩成不可辨认的小点。

## 宿主需要实现的最小接口

页面先加载：

```html
<script src="/school-themes.js"></script>
<link rel="stylesheet" href="/school-themes.css">
```

选择主题时，只写入主题 ID；颜色由同源 CSS 选择器提供，不需要内联样式：

```js
document.documentElement.dataset.studioSkin = themeId;
document.body.dataset.studioSkin = themeId;
```

当前 CMS 的 `renderThemeCategoryNavigation()`、`renderSchoolThemePicker()`、`renderCmsUiSkin()` 与 `applyCmsUiSkin()` 是宿主适配代码，不属于学校目录数据本身。

## USTC 标志修正

USTC 不再使用原先的 16×16 favicon。当前本地资产裁取自中国科学技术大学官方网站的完整标志：

- 官方文件：<https://www.ustc.edu.cn/news/images/logo.svg>
- 学校章程对校徽结构的说明：<https://xcb.ustc.edu.cn/info/1003/1616.htm>

本地文件保留圆形校徽部分并输出为 128×128 PNG，适合选择卡片、导航标志和大面积半透明水印。

## 商标与迁移边界

学校校徽属于各学校的机构标识。内部后台、个人项目或原型可以将已核实标志作为本地 UI 资产；若公开发布、商业分发或出售模板，应逐项复核学校视觉识别和商标使用条款。运行时生成的校名章只用于图片故障容错，不能表述为官方校徽。
