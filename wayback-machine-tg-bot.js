const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const url = require('url');

// 替换为你从@BotFather获得的Telegram bot的token
const tg_token = process.env.tg_token;

// 创建一个使用'polling'获取新更新的bot
const bot = new TelegramBot(tg_token, {polling: true});

// 监听/start命令
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `欢迎使用 wayback-machine-tg-bot !\n使用方法:\n1. 发送一个网址给我。\n2. 我会尝试将这个网址保存到Wayback Machine。\n3. 如果成功，我会发送一个存档后的网址给你。`);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    let urlToSave = msg.text;

    // 如果接收到的是/start命令，直接返回
    if (urlToSave === '/start') {
        return;
    }

    // 验证接收到的文本是否是一个有效的URL
    try {
        new URL(urlToSave);
    } catch (err) {
        bot.sendMessage(chatId, `错误: 无法识别的URL。`);
        return;
    }
    bot.sendMessage(chatId, `已接收到URL, 正在处理中。`);
    let waybackUrl = `http://web.archive.org/save/${urlToSave}`;

    http.get(waybackUrl, (res) => {
        let statusCode = res.statusCode;

        // console.log(res.statusCode);
        // res.on('data', (chunk) => {
        //     console.log(chunk.toString());
        // });
        
        if (statusCode === 302) {
            // 如果成功触发了Wayback Machine的保存过程，发送一条消息并附上存档版本的URL
            bot.sendMessage(chatId, `成功触发了Wayback Machine的保存过程。\n存档版本位于: ${res.headers.location}`);
        } 
        else {
            // 如果保存失败，发送一条消息
            bot.sendMessage(chatId, `保存 ${urlToSave} 到Wayback Machine失败。状态码: ${statusCode}`);
            if(statusCode === 523){
                bot.sendMessage(chatId, `源站不可达。这通常是因为Wayback Machine无法访问被存档的网站或网站拒绝被Wayback Machine存档。`);
            }
        }
    }).on('error', (e) => {
        // 如果请求过程中发生错误，发送一条消息
        bot.sendMessage(chatId, `发生错误：${e.message}`);
    });
});
