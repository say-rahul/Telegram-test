import express from "express";
import fetch from "node-fetch";
import moment from "moment-timezone"; // ✅ Import moment-timezone

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ✅ Ping route for testing connectivity
app.get("/ping", (req, res) => {
  res.send("pong");
});

// ✅ Send message to Telegram
app.post("/send", async (req, res) => {
  try {
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.json({ success: true, telegramResponse: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Time endpoint
app.get("/time", (req, res) => {
  try {
    const chennaiTime = moment().tz("Asia/Kolkata").format(); // ISO string
    res.json({ timezone: "Asia/Kolkata", datetime: chennaiTime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Latest Telegram update
app.get("/telegram-latest-update", async (req, res) => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.ok) {
      return res.status(500).json({ error: "Failed to fetch updates from Telegram" });
    }

    const updates = data.result;
    if (updates.length === 0) {
      return res.json({ text: "" }); // No updates yet
    }

    // Get the latest update
    const latestUpdate = updates[updates.length - 1];
    const text = latestUpdate.message?.text || "";

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
