# 本地内容后台使用说明

这个本地 CMS 的目标很明确：

- 不再直接翻 `_posts` 手改双语 Markdown
- 在浏览器里完成文章录入和维护
- 用统一表单管理中文、英文、分类、封面图和正文
- 继续把最终内容保存回仓库里的 Markdown 文件
- 顺手在同一个后台里执行常用 Hexo 命令
- 在后台里直接上传封面图并创建 `source/images/` 子目录
- 给中文稿接入可配置的 LLM 一键排版

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

### LLM 配置保存位置

LLM 配置会保存在项目根目录的：

`/.env`

当前后台会把下面这些字段写进 `.env`：

- `LOCAL_CMS_LLM_ENDPOINT`
- `LOCAL_CMS_LLM_API_KEY`
- `LOCAL_CMS_LLM_MODEL`
- `LOCAL_CMS_LLM_TEMPERATURE`
- `LOCAL_CMS_LLM_PROMPT`

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

暂时还没有做：

- 图片上传器
- 菜单 / 友情链接 / 主题配置的可视化修改
- 自动生成英文稿
- 自动预览 Markdown 渲染结果

这些都可以后续继续补，但没必要一开始全塞进去。

## 推荐工作流

1. 先开本地后台：`npm run cms:local`
2. 开本地博客预览：`npm run server`
3. 在后台编辑内容
4. 在博客预览页检查效果
5. 需要时再提交和部署

这样以后你写内容，基本就不需要直接碰 `_posts` 目录了。
