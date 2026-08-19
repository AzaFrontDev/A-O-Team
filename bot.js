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
    // 1. Вытягиваем whatsapp и email вместо contact
    const { name, whatsapp, email, service, message } = req.body || {};

    // 2. Валидация: email не проверяем на пустоту, он опционален
    if (!name || !whatsapp || !service || !message) {
      return res.status(400).json({ error: "Пожалуйста, заполните все обязательные поля." });
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
        case "Доработка":
        case "Реворк":
          return "🟢 [БЫСТРАЯ ЗАДАЧА]";
        default:
          return "🟡 [СТАНДАРТ]";
      }
    })();

    // 3. Формируем итоговый текст сообщения с новыми переменными
    const text = 
`🚀 <b>Новая заявка с сайта AO Team!</b>
${priorityBadge}

👤 <b>Имя:</b> ${escapeHtml(name)}
📱 <b>WhatsApp:</b> ${escapeHtml(whatsapp)}
📧 <b>Email:</b> ${escapeHtml(email || "Не указан")}
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
