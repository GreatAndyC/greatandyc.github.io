# 本地内容后台使用说明

这个本地 CMS 的目标很明确：

- 不再直接翻 `_posts` 手改双语 Markdown
- 在浏览器里完成文章录入和维护
- 用统一表单管理中文、英文、分类、封面图和正文
- 继续把最终内容保存回仓库里的 Markdown 文件
- 顺手在同一个后台里执行常用 Hexo 命令

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
- 分类
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

文章分类不会让你手写中英文两份文本。

后台会读取：

`_config.yml` 里的 `category_map`

并在界面里生成分类下拉框。你只需要选一次，保存时会自动写成：

- 中文分类，例如 `教程`
- 英文分类，例如 `Tutorial`

所以后续你新增文章时，不需要再自己对照中英文分类。

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
