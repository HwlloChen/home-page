# HomePage

Hi there!👋

#### 介绍
 :tw-1f680: :tw-1f680: :tw-1f680: 个人服务器主页的最佳选择 :kissing_heart: 自建服务器用户的下一代个人服务器主页  
 为无公网IPv4却喜欢自建服务器的用户专门设计的个人主页！

目前已被用于ChenServer的新主页。

使用 [Vuejs](https://vuejs.org) 和 [mdui](https://mdui.org)

[Demo Page(https://etaris.moe)](https://etaris.moe)

以GPLv3协议开源。

#### 特性

- 可自定义的前端主题系统
- 使用Material Design 3(Material You)设计风格
- 支持连接Navidrome音乐服务器
- 对音乐进行分享🥰
- 主题自动适配
- 支持连接Hitokoto一言
- 站长个人信息卡片
- 支持Artalk等社交系统
- 基础后台管理功能`/admin`
- (计划中)支持使用不算子或51.la统计数据

#### 初始化

```bash
# 克隆仓库
git clone https://gitee.com/HwlloChen/home-page.git

# 下载依赖包
npm install

# 启动开发环境
npm run dev

# 打包生产环境
npm run build

```

#### 配置

- 编辑`utils/globalVars.js`以适应你的环境。
- 程序打包好后可以直接以静态页面部署到服务器上
- 注意设置`/music`, `/admin`相关配置，此处以Nginx为例：
  ```nginx
  server {
      # ......
      # 之前的配置

      location /music {
          try_files $uri $uri/ /index.html;
      }

      location /admin {
          try_files $uri $uri/ /index.html;
      }

      # 之后的配置
      # ......
  }
  ```