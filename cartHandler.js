const { removeFromCart, clearCart } = require('./data');
const { generateUniqueSessionId } = require('./utils');

async function cartHandler(bot, msg, userData) {
  const userId = msg.from.id;
  const userCart = userData.cart;

  if (!userCart || userCart.length === 0) {
    await bot.sendMessage(userId, 'Ваша корзина пуста.');
  } else {
    // Generate a unique session identifier
    const sessionId = generateUniqueSessionId();
    userData.state = sessionId;

    let message = 'Предметы в вашей корзине:\n\n';
    userCart.forEach((item, index) => {
      message += `Название: *${item.name}*\nРазмер: *${item.size}*\nКоличество: *${item.quantity}*\nЦена: *${item.price * item.quantity}₽*\n\n`;
    });

    const inlineKeyboard = userCart.map((item, index) => [
      {
        text: `Убрать ${item.name}`,
        callback_data: `remove_item_${index}_${sessionId}`,
      },
    ]);

    inlineKeyboard.push([
      {
        text: 'Очистить корзину.',
        callback_data: `clear_cart_${sessionId}`,
      },
    ]);

    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    };

    const sentMessage = await bot.sendMessage(userId, message, options);
    userData.messageId = sentMessage.message_id;
  }
}
async function handleCartItemRemoval(callbackQuery, bot, userData) {
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  const sessionId = userData.state;

  if (sessionId === null || (sessionId && callbackQuery.message.message_id === userData.messageId)) {
    if (data.startsWith('remove_item_')) {
      const [_, itemIndex, sessionIdFromData] = data.split('_');
      removeFromCart(userData, parseInt(itemIndex));
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Предмет убран из корзины.',
      });
      await cartHandler(bot, { from: { id: userId } }, userData);
    } else if (data.startsWith('clear_cart_')) {
      clearCart(userData);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Корзина очищена.',
      });
      await cartHandler(bot, { from: { id: userId } }, userData);
    }
  } else {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Ошибка сессии, пожалуйста, используйте команду /start.',
    });
  }

  // Reset the state after the session is completed
  userData.state = null;
}

module.exports = {
  cartHandler,
  handleCartItemRemoval,
};