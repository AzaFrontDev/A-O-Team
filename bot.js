const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Включаем CORS для запросов с фронтенда
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
    const { name, contact, service, message } = req.body || {};

    if (!name || !contact || !service || !message) {
      return res.status(400).json({ error: "Пожалуйста, заполните все поля." });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: "Telegram secrets are not configured." });
    }

    const serviceTrimmed = String(service).trim();
    const priorityBadge = (() => {
      switch (serviceTrimmed) {
        case "Многостраничник":
          return "🔴 [ВЫСОКИЙ ПРИОРИТЕТ]";
        case "Лендинг":
        case "Редизайн":
          return "🟡 [СТАНДАРТ]";
        case "Сайт-визитка":
        case "Доработка / Re-work":
          return "🟢 [БЫСТРАЯ ЗАДАЧА]";
        default:
          return "🟡 [СТАНДАРТ]";
      }
    })();

    // Формируем итоговый текст сообщения
    const text = 
`🚀 <b>Новая заявка с сайта AO Team!</b>
${priorityBadge}

👤 <b>Имя:</b> ${escapeHtml(name)}
💬 <b>Связь:</b> ${escapeHtml(contact)}
🛠 <b>Услуга:</b> ${escapeHtml(serviceTrimmed)}
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
    res.status(500).json({ error: "Ошибка отправки." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});