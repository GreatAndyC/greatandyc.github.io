# AndyCao's Blog

[![Hexo](https://img.shields.io/badge/Framework-Hexo-blue.svg)](https://hexo.io/)
[![Theme](https://img.shields.io/badge/Theme-NexT-green.svg)](https://github.com/theme-next/hexo-theme-next)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 此仓库为基于 Hexo 框架搭建的私人博客源码，由 [AndyCao](https://github.com/GreatAndyC) 维护。

## 🌐 在线访问

博客地址位于：caoyueyang.org

---

## 🛠️ 技术栈

- **框架**: [Hexo](https://hexo.io/)
- **主题**: [NexT](https://github.com/theme-next/hexo-theme-next)
- **部署**: GitHub Pages
- **渲染**: Nunjucks, Swig (NexT support)

## 📋 文章管理 SOP

为了确保博客内容的质量和发布流程的顺畅，请遵循以下步骤：

### 1. 创建新文章
在终端输入以下命令创建文章，Hexo 会根据 `scaffolds/post.md` 模板生成文件：
```bash
npx hexo new "文章标题"
```
文件将自动生成在：`source/_posts/文章标题.md`

### 2. 编辑文章元数据 (Front-matter)
打开生成的 `.md` 文件，编辑顶部的 YAML 配置（元数据）：
- **title**: 文章标题
- **date**: 发布日期（自动生成，通常不需手动修改）
- **tags**: [标签1, 标签2] (使用方括号，英文逗号分隔)
- **categories**: 分类名

### 3. 本地预览与调试
在发布前，务必开启本地服务器检查排版和图片显示：
```bash
npx hexo s
```
访问 `http://localhost:4000` 实时预览。

### 4. 发布与推送
确认无误后，执行一键部署。这将生成静态网页并推送至 GitHub 分支：
```bash
npx hexo clean && npx hexo g -d
```

### 5. (可选) 源码备份
如果您修改了站点配置或重要文件，别忘了将**源码仓库**本身推送到远程：
```bash
git add .
git commit -m "feat: 添加新文章 [文章标题]"
# git push 由您手动操作
```

---

## 🚀 快速开始

如果您想在本地运行或编辑此博客，请确保已安装 [Node.js](https://nodejs.org/)。

### 1. 安装依赖

```bash
npm install
```

### 2. 撰写文章

```bash
npx hexo new "我的新文章"
```

### 3. 本地预览

启动本地服务器，访问 `http://localhost:4000`。

```bash
npx hexo server
```

### 4. 生成与部署

生成静态文件并推送到 GitHub 仓库相关分支（通常是 `gh-pages`）。

```bash
npx hexo clean && npx hexo generate --deploy
```

## 📂 项目结构

```text
.
├── _config.yml         # 站点配置文件
├── package.json        # 应用程序信息和依赖
├── scaffolds/          # 模板文件夹
├── source/             # 资源文件夹（文章 Markdown、图片等）
│   └── _posts/         # 文章库
├── themes/             # 主题文件夹 (NexT)
└── tools/              # 自定义工具
```

## 📝 维护指南

- **添加文章**: 在 `source/_posts` 下创建或使用 `hexo new` 命令。
- **配置修改**: 修改根目录下的 `_config.yml` 进行站点配置，修改 `themes/next/_config.yml`（或其替代方案）进行主题配置。

## 📄 开源协议

本项目代码部分遵循 MIT 协议。文章内容版权归作者所有。
