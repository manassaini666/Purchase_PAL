// telegram.js - Purchase Pal Telegram Notification Service

export async function sendTelegramAlert(message, customChatId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('❌ Telegram configuration missing: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Telegram alert sent successfully to chat ID:', chatId);
      return true;
    } else {
      console.error('❌ Failed to send Telegram alert:', data.description || data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error executing Telegram fetch request:', error);
    return false;
  }
}