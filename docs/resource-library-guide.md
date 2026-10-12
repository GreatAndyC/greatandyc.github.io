# 资料库维护

资料库页面位于 `source/resources/index.md` 和 `source/en/resources/index.md`，分别生成 `/resources/` 与 `/en/resources/`。这里只列公开可下载的文件；文章仍由 `source/_posts/` 管理，下载文件放在 `source/downloads/`。

## 发布一份文档

1. 确认文件允许公开分发，检查文件内容、元数据和引用。放入 `source/downloads/`；不要把仅靠 PDF 编辑密码保护的文件当作私有文件。
2. 在 `source/_posts/` 写对应的背景文章，说明版本、来源、适用范围和必要的引注。双语内容按现有文章规则维护。
3. 在两份资料库页面的文件列表中各加一行，使用同一份文件的下载链接，填写文件名、一行简介、格式和实际大小。整行是下载链接；背景文章留在文章页和归档中。
4. 运行 `npm run build`，确认 `public/downloads/` 中有文件，检查两种语言页面上的链接。

## 存储与图标

下载文件随仓库提交到 GitHub。构建会把 `source/downloads/` 复制到 `public/downloads/`，GitHub Actions 再将生成的网站发布到 `gh-pages` 分支，由 GitHub Pages 提供下载。当前页面搜索只在浏览器内筛选列表，不需要数据库或额外存储。文件和下载链接都是公开的，并计入 GitHub 的仓库及 Pages 容量。[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) 对发布站点设有 1 GB 大小上限和每月 100 GB 流量软上限。

公开文件规模增长时，可以保留资料库页面和文件说明在 GitHub，把下载文件放到对象存储，例如 [Cloudflare R2](https://developers.cloudflare.com/r2/buckets/public-buckets/)，并通过自有子域名和缓存提供下载。页面只需改文件链接。[跨域链接的 HTML `download` 属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download)不能保证触发下载；对象响应应提供 `Content-Disposition: attachment`。付费或私密文件不能放在公开的 Pages 或公开存储桶，需要另设用户验证和受控下载入口。

文件图标共用白色文档轮廓，以颜色区分文档、表格、演示、压缩包、图片、音频和视频，并按链接扩展名自动显示格式缩写：PDF、DOC/DOCX、XLS/XLSX、CSV、PPT/PPTX、TXT、MD、ZIP、7Z、JPG/JPEG、PNG、WEBP、SVG、MP3、WAV、M4A、MP4、MOV。未知扩展名显示 `FILE`。链接带查询参数或没有扩展名时，可在下载行的 `<a>` 上设置 `data-file-type="PDF"` 等简短标记；不需要单独上传图标图片。

## 开始一个专栏

早报 PDF 可以列在文件下载区；如另写正文文章，则仍由 `source/_posts/` 管理。早报文章统一使用 `HN-Brief` 标签，翻译精选文章统一使用 `Annotated-Translation` 标签；后续文章会自动进入对应语言的标签页。早报包含日期、原文链接、摘要和个人评论；翻译精选分别标明原文、译注与个人判断，并检查原文的转载条件。

目前 `/atom.xml` 是全站 RSS，不是专栏专属订阅。邮件、付费和访问控制需要独立服务；在选定平台和规则之前，不应把公开的 `source/downloads/` 当作付费文件存放处。
