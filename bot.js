const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/api/contact", async (req, res) => {
  try {
    const { name, contact, message } = req.body || {};

    if (!name || !contact || !message) {
      return res.status(400).json({ error: "Пожалуйста, заполните все поля." });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: "Telegram secrets are not configured." });
    }

    const text = `🚀 *Новая заявка с сайта A&O Team!*

👤 *Имя:* ${name}
💬 *Связь:* ${contact}
📝 *Описание проекта:*
${message}`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.description || "Telegram API error");
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка отправки в Telegram." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});