const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Включаем CORS для запросов с вашего фронтенда
app.use(cors());
app.use(express.json());

// Функция безопасного экранирования HTML
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

    // Безопасная HTML-разметка без риска поломки парсинга
    const text = 
`🚀 <b>Новая заявка с сайта A&amp;O Team!</b>

👤 <b>Имя:</b> ${escapeHtml(name)}
💬 <b>Связь:</b> ${escapeHtml(contact)}
📝 <b>Описание проекта:</b>
${escapeHtml(message)}`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.description || "Telegram API error");
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Express /api/contact error:", error);
    res.status(500).json({ error: "Ошибка отправки в Telegram." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});