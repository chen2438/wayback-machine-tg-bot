const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const http = require('http');
const { format } = require('date-fns');
const url = require('url');

let tg_token = require('./config.js');
const bot = new TelegramBot(tg_token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `欢迎使用 wayback-machine-tg-bot !\n使用方法:\n1. 发送一个网址给我。\n2. 我会尝试将这个网址保存到Wayback Machine。\n3. 如果成功，我会发送一个存档后的网址给你。`);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    let urlToSave = msg.text;
    if (urlToSave === '/start') return;

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
        if (statusCode === 302) {
            bot.sendMessage(chatId, `成功触发了Wayback Machine的保存过程。\n存档版本位于: ${res.headers.location}`);
        }
        else {
            bot.sendMessage(chatId, `保存 ${urlToSave} 到Wayback Machine失败。状态码: ${statusCode}`);
            if (statusCode === 523) {
                bot.sendMessage(chatId, `源站不可达。这通常是因为Wayback Machine无法访问被存档的网站或网站拒绝被Wayback Machine存档。`);
            }
        }
    }).on('error', (e) => {
        bot.sendMessage(chatId, `发生错误：${e.message}`);
    });
    async function printPDF() {
        try {
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            //await page.setViewport({ width: 375, height: 812 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67');

            await page.goto(urlToSave, { waitUntil: 'networkidle0', timeout: 60000 });

            const pdf = await page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true,
            });

            await browser.close();
            return pdf;
        } catch (error) {
            bot.sendMessage(chatId, `打印PDF时发生错误:${error}`);
            throw error;
        }
    }

    printPDF().then(pdf => {
        const urlObj = new URL(urlToSave);
        const domain = urlObj.hostname;
        const dateStr = format(new Date(), 'yyyyMMddHHmmss');
        const filename = `${domain}.${dateStr}.pdf`;
        bot.sendDocument(chatId, pdf, {}, { filename: filename });
    }).catch(error => {
        bot.sendMessage(chatId, `发送PDF时发生错误:${error}`);
    });

});
