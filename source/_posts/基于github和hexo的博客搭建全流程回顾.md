---
title: 基于github和hexo的博客搭建全流程回顾
date: 2025-09-01 17:45:17
tags:
  - Hexo
categories:
  - 教程
---

# 基本流程
1. 拥有一个Github账号
2. 安装好Git、node.js、hexo
3. 通过Cloudflare购买域名
4. 参考教程部署基于hexo的静态网页博客
*保持全程梯子连接*
*任何不懂的问题都可以问GPT老师*

参考链接
1. [知乎用户：枫叶-从零开始搭建个人博客(1-8篇)](https://zhuanlan.zhihu.com/p/106060640)
2. [攻城狮杰森的博客:快速搭建个人博客 —— 保姆级教程](https://pdpeng.github.io/2022/01/19/setup-personal-blog/#%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7)

## 具体细节
### 1.注册Gtihub、安装Git、配置好本地和Github仓库的SSH连接
鉴于网络上教程已经非常多，此处便多赘述。
*注意Github的双重验证登录以及SSH连接配置*

### 2.在Cloudflare购买域名
首先在[阿里云万网](wanwang.aliyun.com)搜索自己想要的域名是否被注册，然后到[Cloudflare](dash.cloudflare.com)购买域名，需要使用到外币信用卡或Paypal支付。
*在不同的域名商处购买同一个域名价格不太一样，不过笔者嫌麻烦就直接在Cloudflare上面买了*

### 3.安装node.js、hexo，并且在Github上面创建xxxx.github.io的仓库
- node.js的安装教程中文互联网也有很多
- hexo通过Git命令行安装即可 `npm install -g hexo-cli`
    - hexo本质上类似于一个「工厂」，输入是文章（.md 文件），输出是网页（.html 文件） 
 - 可以参考文章：[个人博客第5篇——安装node.js和Hexo](https://zhuanlan.zhihu.com/p/105715224)
- Github上创建名为
> xxxx.github.io
的仓库会自动解析为github page的免费托管主页，相当于一个免费的服务器

中间遇到的问题有
1. token确定身份问题
2. 验证ssh密钥问题

均通过和Chatgpt反复提问以及Google搜索解决
等成功配置好后，就可以在网页里面输入`xxxx.github.io`访问已经搭建好的Hexo博客网站了

### 4.通过Cloudflare配置DNS
为域名
>caoyueyang.org
添加四条A记录，成功后就能通过域名访问网站了
```
类型: A
名称: @
值: 185.199.108.153
TTL: Auto
代理状态: DNS only (灰色小云)
```

Github pages官方建议添加四条，以此增加服务稳定性
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

同时再添加一条CAME记录，让www子域名也能访问(前缀增加www之后也会自动跳转到购买的域名)
```
类型: CNAME
名称: www
值: greatandyc.github.io
TTL: Auto
代理状态: DNS only (灰色小云)
```
**等到Github Pages页面完成DNS解析和HTTPS证书自动申请后即完成博客框架的搭建**

### 5.Hexo配置文件更改
在一开始本地创建的博客根目录下的`_config.yml`文件中可以对网页进行配置

通过命令行`git clone https://github.com/theme-next/hexo-theme-next themes/next`可以下载别人制作的博客主题，这里笔者选了和[教程](https://zhuanlan.zhihu.com/p/105584373)一样的主题`next`

同时还可与在主题的配置文件里面对next的细分主题进行选择，此处不过多赘述，可以自行询问GPT老师和Google

参考教程[优化主题](https://zhuanlan.zhihu.com/p/106060640)对主页的栏目设置(侧边栏、评论区、友链等)完成后，主页应该如下图类似：
<img src="/images/mainpage.png" alt=""
     style="width:500px; border:2px solid #ccc; box-shadow:2px 2px 8px rgba(0,0,0,0.3); display:block; margin:auto;">
之后便可以愉快地在博客里面增加文章了

本地文章保存在`Blog/source/_posts`中
通过在Git bash里面输入命令`hexo clean && hexo g && hexo d`即可完成网页的更新，具体流程可参考博客的[新博客工作流](https://caoyueyang.org/2025/09/01/%E6%96%B0%E5%8D%9A%E5%AE%A2%E5%B7%A5%E4%BD%9C%E6%B5%81/)，优化md格式可以参考本博客的[Markdown基本语法](https://caoyueyang.org/2025/09/01/%E5%9B%9E%E9%A1%BE%E5%8D%9A%E5%AE%A2%E5%BB%BA%E7%AB%8B%E6%95%99%E7%A8%8B/)