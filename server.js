const express = require("express");
const RiveScript = require("rivescript");
const path = require("path");

const app = express();
const bot = new RiveScript({ utf8: true });

// بارگذاری Brain
bot.loadDirectory("./brain")
  .then(() => bot.sortReplies())
  .catch((err) => console.error("خطا در بارگذاری brain:", err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // سرو کردن فایل‌های استاتیک

// API endpoint
app.post("/api/chat", async (req, res) => {
    const { user, message } = req.body;

    if (!user || !message) {
        return res.status(400).json({ error: "پارامترهای 'user' و 'message' الزامی هستند" });
    }

    try {
        // گرفتن پاسخ بات
        const reply = await bot.reply(user, message);

        // گرفتن تمام متغیرهای ذخیره شده برای کاربر
        const vars = await bot.getUservars(user);

        // برگرداندن reply و vars به کلاینت
        res.json({ reply, vars });

    } catch (error) {
        console.error("خطای سرور:", error);
        res.status(500).json({ error: "خطای داخلی سرور" });
    }
});

// سرور
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
