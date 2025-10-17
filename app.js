const RiveScript = require("rivescript");

// ساخت بات
const bot = new RiveScript({ utf8: true });

// بارگذاری فایل .rive
bot.loadDirectory("./brain").then(() => {
    bot.sortReplies();
    console.log("بات آماده است! برای خروج Ctrl+C را فشار دهید.");
    startChat();
}).catch(err => console.error(err));

const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

function startChat() {
    readline.question("You> ", async (msg) => {
        const reply = await bot.reply("localuser", msg);
        console.log("Bot>", reply);
        startChat();
    });
}
