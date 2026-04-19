---
title: 告别服务器繁忙：搭建 DeepSeek 私人 AI 的实践记录
date: 2026-04-16 11:00:00
lang: zh-CN
slug: deepseek-private-ai-guide
permalink: 2026/04/16/deepseek-private-ai-guide/
description: 从官方服务繁忙的背景切入，梳理共享 API、云端部署和本地部署的差异，并记录一条更适合普通用户的私有化使用路径。
tags:
  - DeepSeek
  - API
  - AI
categories:
  - 教程
toc: true
---
# 告别服务器繁忙：搭建 DeepSeek 私人 AI 的实践记录

想直接实践的朋友可以跳到How部分直接开始动手搭建
背景
随着ChatGPT的横空出世，关于AI和大模型LLM的讨论一直保持着极高的热度。开发出人气推理模型Deepseek-R1的当红炸子鸡杭州深度求索公司传闻不断——“美国封锁”、“总理接见”、“AppStore全球榜首”、“创始人在武警保护下回家过年”……融合了科技自信、中美争霸、商业前沿等事件于一身的Deepseek在今天已然成为了“AI”在中国的代名词。
当你发现楼下剪头发的大叔大妈、常年闲云野鹤的爷爷奶奶也开始神秘兮兮地和你讨论起了AI，你就应该意识到，AI时代的巨浪已经到来，我们都无法置身事外。
![alt text](/images/feishu-migration/deepseek-private-ai-guide/ai_era_wave_dalle.png)
DALL-E-3生成
然而作为一个普通用户，相信大家目前遇到的最大的问题是：使用Deepseek官方的时候，小鲸鱼下面的动画转动半天，结果却回复你“已深度思考——服务器繁忙，请稍后再试。”
![alt text](/images/feishu-migration/deepseek-private-ai-guide/deepseek_server_busy_error.png)
![alt text](/images/feishu-migration/deepseek-private-ai-guide/deepseek_on_thinking_busy.png)
因此本文试图通过来自网络的公开信息，简单解释什么是AI、为什么要私有化部署AI、以及怎么最快捷部署自己的AI服务。
注：本文是科普向的参考文章，至于为什么是科普向，因为太难的我也不懂

<!-- more -->

What:什么是AI、大模型、Deepseek-R1和开源……
AI(Artificial intelligence)
定义：人工智能是一个构建能够推理、学习和行动的计算机和机器的科学领域，这种推理、学习和行动通常需要人类智力，或者涉及超出人类分析能力的数据规模。AI 是一个广博的领域，涵盖许多不同的学科，包括计算机科学、数据分析和统计、硬件和软件工程、语言学、神经学，甚至哲学和心理学。
在业务使用的操作层面上，AI 是一组主要基于机器学习和深度学习的技术，用于数据分析、预测、对象分类、自然语言处理、推荐、智能数据检索等等。
https://cloud.google.com/learn/what-is-artificial-intelligence?hl=zh-CN
大模型(Large Language Model)
定义：大语言模型，是由具有大量参数（通常数十亿个权重或更多）的人工神经网络组成的一类语言模型，使用自监督学习或半监督学习对大量未标记文本进行训练。
https://zh.wikipedia.org/wiki/%E5%A4%A7%E5%9E%8B%E8%AF%AD%E8%A8%80%E6%A8%A1%E5%9E%8B
Deepseek-R1
定义：R1是Reasoning 1的缩写，指Deepseek公司开发的第一代推理模型的名字。在2025年1月20日开源以来，以其价格低廉但性能却能媲美顶尖闭源产品的特点，迅速引发全球关注。
用一个示意图来说明就是，DeepseekR1是一个有推理能力的大模型、是目前被广泛应用的AI模型之一
![alt text](/images/feishu-migration/deepseek-private-ai-guide/deepseek_r1_concept_logic.png)
Deepseek-R1和Kimi、豆包、ChatGPT等模型有什么区别：目前综合成本和中文推理能力来说，Deepseek-R1的能力最强
开源
定义：开源是一种分散的生产模式，允许任何人修改和共享技术，因为其设计可公开访问。该术语起源于软件开发环境，表示软件符合某些自由发布标准。https://aws.amazon.com/cn/what-is/open-source/
目的是通过公开基础资源，让更多人参与到学习和建设中来
为什么Deepseek要开源？
笔者认为既有商业上的考量，也有公益的贡献。相关讨论可见：https://www.zhihu.com/question/11072234148
https://finance.sina.com.cn/money/fund/fundzmt/2025-02-04/doc-ineiirxc2794659.shtml
开源的影响是什么？
引发美国科技界震动/关注、登上苹果App Store全球 157 个国家下载榜榜首、人才招聘/资金投资供不应求。
显然开源是一个成功的战略
 
最简单理解，Deepseek-R1可以看作一本当前物美价廉的“答案之书”，任何人都可以下载搬运给自己使用，你给他任何问题，它就会给你一个八九不离十的答案。只是你要让这个“答案之书”运行起来，需要强劲配备配套的基础设施和昂贵的显卡——就好比原神你可以免费玩，但是你用老人机肯定是运行不了的。
![alt text](/images/feishu-migration/deepseek-private-ai-guide/answer_book_comparison_dalle.png)
DALL-E-3生成
Why: 为什么服务器繁忙、API调用
为什么服务器繁忙？
1.大量的本土访问：连老大爷都开始用了，再加上数量巨大的有需要高强度使用的苦逼硕博，国内访问量可想而知，在运维团队没能跟上的情况下，只能出台限制措施。
2.国外访问：如前文所言Deepseek App登顶全球下载榜首，带来了更大的服务器压力，由于频繁遭受攻击，现在已关闭国外IP的注册
3.竞争对手的网络攻击
虚假的商战：不断更新版本抢占市场
真实的商战：派黑客攻击对方服务器
 
所以并不是因为你问了它奇怪的问题导致被“盯上”或“封号”，当然如果真的被封号了，我觉得你得反思一下你平时都在问啥问题。
![alt text](/images/feishu-migration/deepseek-private-ai-guide/donnie_yen_puzzled_meme.png)
图源:甄子丹
为什么要API调用
除了官网网页和APP使用Deepseek-R1以外，还可以通过共享API调用、云端部署和本地部署来使用Deepseek-R1，隐私程度递增。
API调用
API定义：是一种接口，它定义了软件组件或系统之间如何进行通信和交互的规则和规范。 它允许开发者在不了解底层实现细节的情况下，使用其他软件的功能，从而实现软件的模块化、重用性、互操作性和高效开发。
如果把获取Deepseek-R1的回复比喻成吃到一个美味佳肴。
共享API调用是从大饭馆（各大互联网公司）叫外卖、云端部署是租个专业厨房（服务器）做菜（你可以做给自己吃，甚至可以发展自己的外卖业务）、本地部署是在自己家的豪宅里装专业厨房做菜
![alt text](/images/feishu-migration/deepseek-private-ai-guide/api_request_response_flowchart.png)
图中1-4显示了获取Deepseek回复的过程：
1. 用户发起请求： 用户 (用户1, 用户2, 用户3...) 通过手机等设备，经由网络 (无线信号图标所示)，向 API接口发送服务请求 (例如，输入文字、图片等)。
2. API 转发请求至模型：API接口接收到用户请求后，将请求转发给 Deepseek-R1模型 进行处理。
3-4. API 返回模型结果：Deepseek-R1模型处理完用户请求后，将结果返回给API接口，API接口再通过网络将结果返回给用户。用户最终在设备上接收到 Deepseek-R1 模型的回复。
 
简而言之，流程就是：用户请求 -> API -> Deepseek-R1模型 (云服务器支撑) -> API -> 用户回复
云端部署
和共享API调用的区别在于，这是你独享的，类似于公交车和私家车的区别，也可以理解为独占的API调用
本地部署
那么本地部署廉价部署大模型就不可能了吗？显然还是有解决方案的
通过量化和蒸馏等技术，让模型的运行需求降低，不过同样的也会带来一些诸如回答问题不够准确，回答速度慢等问题，以下是一些参考配置，相关教程可自行搜索。
![alt text](/images/feishu-migration/deepseek-private-ai-guide/deepseek_local_deploy_hardware_spec.png)
https://fisherdaddy.com/posts/deepseek-r1-local-deployment-hardware-guide/
配置参考
注：以”DeepSeek-R1-Distill-Qwen-1.5B”为例，Distill指“知识蒸馏”技术，Qwen为阿里云训练的的通义千问大模型，1.5B指参数量为15亿 (1.5 Billion)，这个数字越大就越“聪明“。
因此”DeepSeek-R1-Distill-Qwen-1.5B”指DeepSeek 团队开发的、R1版本的模型。它是一个经过知识蒸馏技术训练得到的模型，基于或衍生自阿里云的通义千问 (Qwen) 模型架构，并且模型的大小约为 15亿参数。以此类推，其他模型命名方式也类似
满血版和参数量最小蒸馏版的区别大概就是如图下派大星的区别
![alt text](/images/feishu-migration/deepseek-private-ai-guide/distill_vs_full_model_patric_meme.png)
本地部署的大模型的优点在于，只有硬件成本费用、完全离线，隐私保护到最高，而且你还可以通过一些“越狱”方法，解开大模型的能力限制，限于篇幅和可能的法律风险，此处就不多介绍。
![alt text](/images/feishu-migration/deepseek-private-ai-guide/dragon_raja_finger_eva_cyber.png)
参考:《龙族》芬格尔&Eva
 
为什么私有化部署要收费？而官网免费？
这时候可能有人问了，“我用网页版豆包、Deepseek都是免费，怎么你说的这些都要收钱，要我付钱，想都别想，我只想白嫖。”
![alt text](/images/feishu-migration/deepseek-private-ai-guide/free_rider_logic_meme.png)
这里就不得不提一些商业上的逻辑。
官网免费版是普惠服务，资源有限，而私有化部署需要提供更稳定、更专属的资源，成本更高。
现在AI大模型的商业战争还是群雄逐鹿，或许三分天下的时候，因此现在还是烧钱抢占用户的时候，自然不会收钱，等谁能统一天下的时候广告就会随之而来。
而本文讲的部署、调用API，服务器运行着就有场地费、电费、网络费等开支，不可能免费提供的，不过你要相信，只需要一点点的费用，它创造的价值、提升的效率肯定是物有所值的。
 
题外话：关于AI时代广告和隐私的一些想法
![alt text](/images/feishu-migration/deepseek-private-ai-guide/personalized_ads_privacy_leak.png)
上图是笔者在近期在某电商平台搜索了电子书阅读器后，出现在朋友圈的广告，虽然笔者做决策的时候会考虑很多因素，但是对于大部分人来说，广告会在很大程度上影响、诱导用户的行为，这在AI时代会是一个更大的问题。
举个例子，你在和AI的多次对话中暴露了自己的学校、住址、经济情况等信息，AI识别出你的画像是：学历知识水平较低、家庭经济困难、和家人朋友疏远、性格孤僻喜欢冒险、负债30万。假如某一天晚上在你伤心欲绝希望得到AI的安慰的时候角落里面弹出一个高薪招聘广告，你真的能保证自己不会受到影响吗？
![alt text](/images/feishu-migration/deepseek-private-ai-guide/no_more_bets_scam_movie_still.png)
图源:金晨《孤注一掷》
在信息化的当代，信息完全不泄露几乎不可能，我们能做的就是尽可能少地暴露自己的隐私，例如不使用来路不明的AI软件和接口，尽量少暴露自己的个人信息，实在不行，在开头加上“我有一个朋友”。
 
How: 怎么私有化部署以Chatbox为例
如果你说，上面叽里咕噜讲一大堆，我文科生看不懂啊，写的什么玩意，什么API调用云服务器的
我一看到数学、代码就头晕眼花紧张焦虑干呕盗汗，有没有简单像官网那样下载安装一键可用的啊（“我外卖都不会叫，有没有直接喂到我嘴里的”）
有的 兄弟 有的 
虽然不是官网那样即开即用，但是只要注册账号，配置好应用之后就可以用了
就是这款开源软件Chatbox
官网：https://chatboxai.app/zh
根据软件的关于页面，开发者是在腾讯做软件工程师的Benn，开发这个工具软件的初衷为了方便自己，后面做大了便成为了方便大家
声明：笔者没有收钱（甚至为了试验这个API能不能用花了28.96RMB），如果因为本文Chatbox的开发者收入大增，看到了可以给我结一下广告费。
目前这个项目在代码托管网站Github上面已经收获了30K（非常高）的Star(可以理解为点赞)
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_github_star_ranking.png)
三端适配，购买了API和token之后经过简单配置就可以使用了
Token可以简单理解为余额，生成文字和理解文字都会消耗token产生费用。
笔者使用Chatbox的API，问了3个问题，包含思考在内一共大约3600个中文字符，消耗了4514个token，供参考计算价格。
以下是Step By Step的教程：
第一步：官网下载软件
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_official_download_page.png)
首先登录网站官网：https://chatboxai.app/zh，按照自己需求下载按照客户端
第二步：进入定价页面
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_pricing_plans_step2.png)
第三步：根据自己的需求选择订阅计划并打钱
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_sub_plan_detail_part1.png)
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_sub_plan_detail_part2.png)
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_payment_method_selection.png)
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_order_confirmation_page.png)
请务必在此处填写正确的邮箱，这是找回API Key的唯一凭证
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_email_verification_input.png)
笔者建议：不要买太久的，因为AI发展速度太快，说不定未来没多久就有某公司帮家人们把价格打下来了。
第四步：查看自己的API key
支付成功后在跳转的网页可以查看Key，也会在邮箱受到Key和使用指南
 
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_api_key_web_view.png)
第五步，打开Chatbox应用，复制粘贴自己的Api Key到App里
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_app_settings_entry.png)
![alt text](/images/feishu-migration/deepseek-private-ai-guide/chatbox_api_key_config_input.png)
第六步，开始使用吧！
如果你不想用Chatbox的API，你还可以使用其他API供应商的服务，因为Deepseek开源了他们的大模型，因此有能力部署满血版的公司都开始搭建运行在自己服务器的大模型，并且提供API，而且现在为了吸引客户，都有不少的免费额度，但是相对来说会稍微复杂一些。
API供应商：阿里云、腾讯云、火山引擎、硅基流动、商汤科技等
火山引擎（字节跳动）：免费50w Token
官方网站：https://www.volcengine.com/
硅基流动：邀请送14元优惠券
官方网站https://siliconflow.cn/zh-cn/
商汤大装置云：限时2000w Token
官方网站https://www.sensecore.cn/?lang=zh-CN
以及淘宝上各种的杂七杂八API供应商
*对于非大型公司的API请警惕隐私泄露问题
 
关于如何获得这些平台的API使用指南：在谷歌/必应/小红书/知乎/抖音/快手/Bilibili等社交媒体、搜索引擎上搜索相关关键词，然后一个个去找详细的教程，相信聪明好学的你肯定可以找到答案
![alt text](/images/feishu-migration/deepseek-private-ai-guide/eight_immortals_search_tutorial.png)
八仙过海各显神通
 
不过如果你一毛钱都不想花、又不愿意稍微动点脑筋读一下文档自己研究、教学都塞到你嘴边了你也不看，然后你还想白嫖使用最新的科技产品
那你应该得知道这个不可能三角
![alt text](/images/feishu-migration/deepseek-private-ai-guide/impossible_triangle_ai_tech.png)
对此，考研英语教师刘晓燕的评价是：
 
结语
可以预见的未来，随着机器人和人工智能的发展，很多基础的岗位都将被替代，那么我们作为人本身的价值是什么呢？
Deepseek给我的回复是：
“人类真正的危机不在于被替代，而在于用旧时代的价值框架衡量新时代的可能性。当机器接管确定性领域时，我们反而获得了探索不确定性的自由——这正是文明演进最珍贵的动力。你的价值不在于和AI竞争效率，而在于开拓那些尚未被算法定义的疆域。“
 
笔者曰：正如《天才基本法》里说的那样——“一以贯之的努力，不得懈怠的人生。每天的微小积累会决定最终结果，这就是答案。”与其过分担忧未来，不如着眼眼下，在AI时代的浪潮中，做一个英勇向前的浪花。
![alt text](/images/feishu-migration/deepseek-private-ai-guide/unplugging_ai_server_humor.png)
*大家还是要多加锻炼，如果实在到了不可控的地步，还可以做拔AI服务器电源运动的先锋攻坚队，在活着的人里混口饭吃应该还是不难的。
 
版权所有
转载请联系后台
关键词：#AI #人工智能 #Deepsekk 
 
赞赏：如果觉得这篇文章写的不错可以给我打钱，填补我花钱买Chatbox订阅花掉的28.96元人民币的开支
