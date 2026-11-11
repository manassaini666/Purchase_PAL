// telegram.js - Purchase Pal Telegram Notification Service

/**
 * Sends an instant notification or transaction alert to the user's Telegram bot.
 */
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

/**
 * Express Webhook Handler endpoint
 */
export async function handleTelegramWebhook(req, res) {
  try {
    const update = req.body;
    
    // Check if the update contains a message
    if (update && update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      console.log(`📩 Received message from Telegram [${chatId}]: ${text}`);

      // Example response logic: Agar user '/start' bhejé
      if (text === '/start') {
        await sendTelegramAlert(
          '🤖 *Welcome to Purchase Pal Bot!*\nYour webhook is successfully connected and active.',
          chatId.toString()
        );
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}