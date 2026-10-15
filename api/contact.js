// api/contact.js
// Vercel Serverless Function — моментальная отправка заявок A&O Team в Telegram

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = async function handler(req, res) {
  // CORS-заголовки (для preview-доменов Vercel и локальной разработки)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return res.status(400).json({ error: "Некорректный формат JSON." });
      }
    }

    const { name, whatsapp, contact, email, service, message } = body || {};
    const userContact = (whatsapp || contact || "").trim();
    const userName = (name || "").trim();
    const userMessage = (message || "").trim();
    const userEmail = (email || "").trim();

    if (!userName || !userContact || !service || !userMessage) {
      return res.status(400).json({ error: "Пожалуйста, заполните все обязательные поля." });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables");
      return res.status(500).json({ error: "Переменные окружения Telegram не настроены в Vercel." });
    }

    const serviceTrimmed = String(service).trim();
    const priorityBadge = (() => {
      switch (serviceTrimmed) {
        case "E-Commerce & Web-сервисы":
        case "Многостраничные платформы":
        case "Многостраничник":
        case "Саппорт: Премиум":
          return "🔴 [ВЫСОКИЙ ПРИОРИТЕТ / VIP SLA]";
        case "Комплексный редизайн":
        case "Конверсионный лендинг":
        case "Лендинг":
        case "Редизайн":
        case "Саппорт: Люкс":
          return "🟡 [СТАНДАРТ / ПОВЫШЕННЫЙ SLA]";
        case "Промо & Сайты-визитки":
        case "Доработка & Рефакторинг":
        case "Сайт-визитка":
        case "Доработка":
        case "Реворк":
        case "Саппорт: Стандарт":
        case "Базовый саппорт":
        case "Активное ведение":
          return "🟢 [БЫСТРАЯ ЗАДАЧА / САППОРТ]";
        case "Кастомное решение":
          return "💎 [КАСТОМНЫЙ SLA]";
        case "Консультация":
          return "💬 [КОНСУЛЬТАЦИЯ]";
        default:
          return "🟡 [СТАНДАРТ]";
      }
    })();

    const text = 
`🚀 <b>Новая заявка с сайта AO Team!</b>
${priorityBadge}

👤 <b>Имя:</b> ${escapeHtml(userName)}
📱 <b>Контакт (TG/WA):</b> ${escapeHtml(userContact)}
📧 <b>Email:</b> ${escapeHtml(userEmail || "Не указан")}
🛠 <b>Услуга:</b> ${escapeHtml(serviceTrimmed)}
📝 <b>Описание проекта:</b>
${escapeHtml(userMessage)}`;

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

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Vercel Serverless /api/contact error:", error);
    return res.status(500).json({ error: "Ошибка отправки заявки." });
  }
};
