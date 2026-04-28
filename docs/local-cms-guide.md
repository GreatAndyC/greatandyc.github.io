# 本地内容后台使用说明

这个本地 CMS 的目标很明确：

- 不再直接翻 `_posts` 手改双语 Markdown
- 在浏览器里完成文章录入和维护
- 用统一表单管理中文、英文、分类、封面图和正文
- 继续把最终内容保存回仓库里的 Markdown 文件
- 顺手在同一个后台里执行常用 Hexo 命令
- 在后台里直接上传封面图并创建 `source/images/` 子目录
- 给中文稿接入可配置的 LLM 一键排版
- 给中文稿接入一键翻译英文稿
- 针对画廊提供和真实数据结构一致的相册管理器
- 记录文章与图片相关的 CRUD 操作日志，并支持在后台里直接筛选查看

## 启动方式

在项目根目录运行：

```bash
npm run cms:local
```

启动后访问：

```text
http://127.0.0.1:4010
```

后台顶部还带了一块命令面板，支持直接执行：

- `清缓存` -> `npm run clean`
- `构建` -> `npm run build`
- `启动预览` -> `npm run server`
- `停止预览`
- `部署` -> `npm run deploy`

命令执行日志会直接显示在后台里，不需要你再单独切终端看。

## 内容操作日志

后台现在会把文章和图片相关的 CRUD 操作记录到项目根目录的：

`/.local-cms-audit.log`

日志里会保存：

- 操作时间
- 操作对象（文章 / 图片 / 图片目录）
- 操作类型（创建、读取、更新、删除）
- 目标对象
- 请求来源信息与详细字段

同时后台左侧会新增一个“日志”模式，可以直接按对象和操作类型筛选最近记录，并在右侧查看详情。

## 封面图上传

文章编辑区现在带了一个封面图上传区，支持：

- 拖动本地图片到上传区域
- 点击选择本地图片文件
- 选择已有的 `source/images/` 子目录
- 直接新建新的图片子目录

上传成功后，图片路径会自动追加到封面图路径列表里。

## 中文稿一键排版

中文稿区域现在有一个 `一键排版` 按钮。

它会调用本地保存的 LLM 配置，把当前中文标题、概括和正文发送给模型，让模型返回排版后的 Markdown 正文，并直接回填到中文正文框里。

当前实现默认按 OpenAI 兼容的 Chat Completions 接口发送请求，所以你可以切换不同供应商，只要它支持兼容格式即可。

## 中文稿一键翻译英文稿

英文稿区域现在有一个 `一键翻译` 按钮。

它会调用同一套本地保存的 LLM 配置，把当前中文标题、概括、标签和正文发送给模型，要求模型返回：

- 英文标题
- 英文一句话概括
- 英文标签
- 英文 Markdown 正文

返回结果会直接回填到右侧英文稿编辑区。

翻译完成后，后台还会自动按项目写作规范补上一条统一的 `Translation note`：

- 位置优先放在 `<!-- more -->` 后面
- 自动写入这次实际使用的模型名
- 自动写入翻译时间
- 如果正文里已经有旧的翻译说明，会自动替换成最新版本，不会重复叠加

为了尽量贴合你站点现有的英文文章风格，翻译接口还会实时读取项目里的 [`docs/writing-style-guide.md`](/Users/andycao/Documents/Project/greatandyc.github.io/docs/writing-style-guide.md)，把其中和英文写作、开头概括、翻译说明相关的规范一起发给模型。

如果当前文章的 slug 和中英文标题已经齐全，后台还会顺手自动保存到对应的英文 Markdown 文件；如果信息还没补齐，也没关系，结果会先留在编辑区，等你手动保存。

### LLM 配置保存位置

LLM 配置会保存在项目根目录的：

`/.env`

当前后台会把下面这些字段写进 `.env`：

- `LOCAL_CMS_LLM_ENDPOINT`
- `LOCAL_CMS_LLM_API_KEY`
- `LOCAL_CMS_LLM_MODEL`
- `LOCAL_CMS_LLM_TEMPERATURE`
- `LOCAL_CMS_LLM_PROMPT`
- `LOCAL_CMS_TRANSLATION_PROMPT`

这个文件已经加入 `.gitignore`，不会被自动提交。

如果你之前已经用过旧版本后台，仓库根目录里的 `/.local-cms.json` 仍然可以作为兼容兜底读取；但新的保存都会写到 `.env`。

仓库里也提供了一个模板文件：

`/.env.example`

如果你想改端口，可以这样：

```bash
LOCAL_CMS_PORT=4012 npm run cms:local
```

## 当前支持的内容

### 1. 文章

本地后台会读取：

`source/_posts/*.zh-CN.md`
`source/_posts/*.en.md`

并按“同一个基名”为一组显示成一条文章记录。

你可以在后台里直接编辑：

- 发布时间（保存时自动同步为当前时间）
- slug
- 是否启用 `toc`
- 分类（支持预设、自定义、加入预设）
- 封面图 / 代表图路径
- 中文标题、概括、标签、正文
- 英文标题、概括、标签、正文

保存后会自动写回：

- `source/_posts/xxxx.zh-CN.md`
- `source/_posts/xxxx.en.md`

### 2. 独立页面

当前后台也提供了这些页面入口：

- `source/about/index.md`
- `source/en/about/index.md`
- `source/gallery/index.md`
- `source/en/gallery/index.md`
- `source/categories/index.md`
- `source/en/categories/index.md`
- `source/tags/index.md`
- `source/en/tags/index.md`

页面编辑器支持：

- 标题
- 页面时间（保存时自动同步为当前时间）
- 语言
- `comments`
- `toc`
- 额外 front matter YAML
- 正文

### 3. 画廊

画廊不是单纯改：

`source/gallery/index.md`
`source/en/gallery/index.md`

这两份文件只是画廊首页介绍文案。

真正的相册内容来源是：

`content/gallery/*.md`

前台消费的数据文件是：

`source/_data/gallery.yml`

现在本地 CMS 在你打开 `Gallery 中文` 或 `Gallery English` 页面时，会额外显示一个 `画廊内容管理` 区域，专门管理这条链路。

你可以在这里直接：

- 查看当前所有相册列表
- 新建相册
- 编辑 slug、中英文标题、时期、地点、器材、简介、标签
- 给相册增删照片
- 调整照片顺序
- 给每张照片填写中英文标题、中英文说明和 meta
- 直接上传图片到 `source/images/` 的指定目录，并自动追加为新的照片条目

每次保存相册时，后台会自动：

- 回写对应的 `content/gallery/<slug>.md`
- 同步更新 `source/_data/gallery.yml`

也就是说，后续你维护画廊时，不需要再自己去手敲 Markdown 表格和同步数据文件了。

## 分类规则

文章分类不会强迫你回到代码里手写中英文两份配置。

后台会读取：

`_config.yml` 里的 `category_map`

并在界面里生成分类下拉框。你只需要选一次，保存时会自动写成：

- 中文分类，例如 `教程`
- 英文分类，例如 `Tutorial`

如果当前文章需要一个新分类，可以直接在后台里：

- 选择“自定义分类”，填写中文分类名和英文分类名
- 直接保存当前文章
- 或者点“加入预设分类”，把这对分类写进 `_config.yml`，后续新文章直接从下拉框里复用

所以后续你新增文章时，不需要再自己对照中英文分类，也不用手动改配置文件。

## 当前这版的边界

这是一版优先解决“写文章很麻烦”的本地后台，不是完整站点控制台。

当前重点解决的是：

- 文章双语编辑
- 独立页面修改
- 分类映射
- 画廊相册管理与同步

暂时还没有做：

- 菜单 / 友情链接 / 主题配置的可视化修改
- 自动预览 Markdown 渲染结果

这些都可以后续继续补，但没必要一开始全塞进去。

## 推荐工作流

1. 先开本地后台：`npm run cms:local`
2. 开本地博客预览：`npm run server`
3. 在后台编辑内容
4. 在博客预览页检查效果
5. 需要时再提交和部署

这样以后你写内容，基本就不需要直接碰 `_posts` 目录了。
