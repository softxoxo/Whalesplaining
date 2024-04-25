const { tShirts, setUserSelection, getUserSelection, shopOptions } = require('./data');

async function shopHandler(bot, msg, userData) {
  const userId = msg.from.id;
  await bot.sendMessage(userId, 'Доступные товары:', shopOptions)
  const mediaGroup = tShirts.map((tShirt) => ({
    type: 'photo',
    media: tShirt.photo,
    caption: `*${tShirt.name}*\ Цена: ${tShirt.price}₽\ Размеры: ${tShirt.sizes.join(', ')}\n\n`,
    parse_mode: 'Markdown',
  }));
  try {
    await bot.sendMediaGroup(userId, mediaGroup);
    const options = {
      reply_markup: {
        inline_keyboard: tShirts.map((tShirt) => [
          {
            text: `${tShirt.name} - ${tShirt.price}₽`,
            callback_data: `select_tshirt_${tShirt.id}`,
          },
        ]),
      },
    };
    const sentMessage = await bot.sendMessage(userId, "Пожалуйста, выберите футболку, чтобы продолжить покупку:", options);
    userData.messageId = sentMessage.message_id;
  } catch (error) {
    console.error('Error sending media group:', error);
    await bot.sendMessage(userId, 'Sorry, there was an error displaying the t-shirts. Please try again later.');
  }
}

async function handleTShirtSelection(callbackQuery, bot, userData) {
	const userId = callbackQuery.from.id;
	const data = callbackQuery.data;
	const sessionId = userData.state;
  
	if (sessionId === null || (sessionId && callbackQuery.message.message_id === userData.messageId)) {
	  if (data.startsWith('select_tshirt_')) {
		const tShirtId = parseInt(data.split('_')[2]);
		const selectedTShirt = tShirts.find((tShirt) => tShirt.id === tShirtId);
  
		if (selectedTShirt) {
		  await setUserSelection(userData, { tShirtId });
		  try {
			await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
		  } catch (error) {
			console.error('Error deleting message:', error);
		  }
  
		  try {
			const sentMessage = await bot.sendPhoto(callbackQuery.message.chat.id, selectedTShirt.photo, {
			  caption: `Вы выбрали *${selectedTShirt.name}*\n\nПожалуйста, выберите размер :`,
			  parse_mode: 'Markdown',
			  reply_markup: {
				inline_keyboard: selectedTShirt.sizes.map((size) => [
				  {
					text: size,
					callback_data: `select_size_${tShirtId}_${size}`,
				  },
				]),
			  },
			});
			userData.messageId = sentMessage.message_id;
		  } catch (error) {
			console.error('Error sending photo:', error);
			await bot.sendMessage(callbackQuery.message.chat.id, 'Sorry, there was an error processing your request. Please try again later.');
		  }
		}
	  } else if (data.startsWith('select_size_')) {
		const [tShirtId, size] = data.split('_').slice(2);
		const selectedTShirt = tShirts.find((tShirt) => tShirt.id === parseInt(tShirtId));
		const userSelection = getUserSelection(userData);
  
		if (selectedTShirt && userSelection && userSelection.tShirtId === selectedTShirt.id) {
		  await setUserSelection(userData, { ...userSelection, size });
		  try {
			await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
		  } catch (error) {
			console.error('Error deleting message:', error);
		  }
  
		  try {
			const sentMessage = await bot.sendPhoto(callbackQuery.message.chat.id, selectedTShirt.photo, {
				caption: `Вы выбрали размер *${size}* для *${selectedTShirt.name}*\n\nПожалуйста, укажите количество футболок для предзаказа:`,
				parse_mode: 'Markdown',
			  });
			userData.messageId = sentMessage.message_id;
			userData.state = 'awaiting_quantity';
		  } catch (error) {
			console.error('Error sending message:', error);
			await bot.sendMessage(callbackQuery.message.chat.id, 'Sorry, there was an error processing your request. Please try again later.');
		  }
		}
	  }
	} else {
	  await bot.answerCallbackQuery(callbackQuery.id, {
		text: 'Ошибка сессии, пожалуйста, используйте команду /start.',
	  });
	}
  }
  
  module.exports = {
	shopHandler,
	handleTShirtSelection,
  };