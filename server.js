const express = require("express");
const RiveScript = require("rivescript");
const path = require("path");

// const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
// const { log } = require("console");

const app = express();
const bot = new RiveScript({ utf8: true });

// --- بارگذاری brain ---
async function loadBotBrain() {
    try {
        await bot.loadDirectory("./brain"); // بارگذاری brain
        bot.sortReplies();
        console.log("Brain is ready");
    } catch (err) {
        console.error("Loading brain error:", err);
    }
}



// فراخوانی async
loadBotBrain();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // سرو کردن فایل‌های استاتیک



// --- ElevenLabs Client ---
// const client = new ElevenLabsClient({
//   apiKey: "sk_4b663cdaca10535f191b3552fb1f87a7a3782651442c2cfd",
// });

// app.post("/tts", async (req, res) => {
//     const { text } = req.body;
//     if (!text) return res.status(400).send("متن ارسال نشده");
  
//     try {
//       // Use one of ElevenLabs' predefined voice IDs instead of "alloy"
//       // For example, "21m00Tcm4TlvDq8ikWAM" is one of their default voices
//       const audioStream = await client.textToSpeech.convert("21m00Tcm4TlvDq8ikWAM", {
//         text: text,
//         model_id: "eleven_turbo_v2_5"
//       });
  
//       res.setHeader("Content-Type", "audio/mpeg");
//       res.setHeader("Content-Disposition", 'inline; filename="speech.mp3"');
  
//       // Stream the audio response
//       for await (const chunk of audioStream) {
//         res.write(chunk);
//       }
//       res.end();
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("خطا در تبدیل متن به صدا");
//     }
//   });
  

// --- Chat endpoint ---
app.post("/api/chat", async (req, res) => {
  const { user, message } = req.body;

console.log(message);


  if (!user || !message) {
    return res.status(400).json({ error: "پارامترهای 'user' و 'message' الزامی هستند" });
  }

  try {
    const reply = await bot.reply(user, message);
    const vars = await bot.getUservars(user);
    res.json({ reply, vars });
  } catch (error) {
    console.error("خطای سرور:", error);
    res.status(500).json({ error: "خطای داخلی سرور" });
  }
});

// --- راه‌اندازی سرور ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
