# wayback-machine-tg-bot

## 运行环境

- node.js
- npm

## 部署

下载项目

```bash
git clone https://github.com/chen2438/wayback-machine-tg-bot.git
cd wayback-machine-tg-bot
npm install
```

在 https://t.me/BotFather 创建你的 Telegram Bot 并获取 token

![image-20230712201123310](https://media.opennet.top/i/2023/07/12/64ae986f283a9.png)

加载你的 Telegram Bot HTTP API Token

```bash
export tg_token=你的 API Token
```

启动应用

```bash
node wayback-machine-tg-bot.js
```

使用 pm2 启动应用，持久化应用程序

```bash
# Ctrl+C 关闭刚才启动的node.js程序
npm install -g pm2
pm2 start wayback-machine-tg-bot.js
pm2 save
pm2 startup
```

## 运行演示

```
Me: 
/start

Bot: 
欢迎使用 wayback-machine-tg-bot !
使用方法:
1. 发送一个网址给我。
2. 我会尝试将这个网址保存到Wayback Machine。
3. 如果成功，我会发送一个存档后的网址给你。

Me:
https://icp.gov.moe/aboutus.php

Bot:
成功触发了Wayback Machine的保存过程。
存档版本位于: http://web.archive.org/web/20230712121858/https://icp.gov.moe/aboutus.php
```

![image-20230712201956247](https://media.opennet.top/i/2023/07/12/64ae9a6fa2010.png)

## 提示

- Wayback Machine 可能会对短时间内发起大量请求的 IP 地址进行封禁，请勿在一个 IP 地址上共享此服务。
- 已知 知乎 已经拒绝被 Wayback Machine 存档。