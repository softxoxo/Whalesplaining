const { tShirts, setUserSelection, getUserSelection, shopOptions } = require('./data');

async function shopHandler(bot, msg, userData) {
	const userId = msg.from.id;
	await bot.sendMessage(userId, 'Доступные товары:', shopOptions);
  
	const mediaGroup = tShirts.map((tShirt) => {
	  const availableSizes = Object.values(tShirt.sizes).some(quantity => quantity > 0);
	  const sizesText = availableSizes ? `Размеры: ${Object.entries(tShirt.sizes).filter(([size, quantity]) => quantity > 0).map(([size, quantity]) => size).join(', ')}` : 'Нет в наличии';
	  
	  return {
		type: 'photo',
		media: tShirt.photo,
		caption: `*${tShirt.name}*\ Цена: ${tShirt.price}₽\ ${sizesText}\n\n`,
		parse_mode: 'Markdown',
	  };
	});
  
	try {
	  await bot.sendMediaGroup(userId, mediaGroup);
	  const options = {
		reply_markup: {
		  inline_keyboard: tShirts.map((tShirt) => {
			const availableSizes = Object.values(tShirt.sizes).some(quantity => quantity > 0);
			return [{
			  text: `${tShirt.name} - ${availableSizes ? tShirt.price + '₽' : 'Нет в наличии'}`,
			  callback_data: `select_tshirt_${tShirt.id}`,
			}];
		  }),
		},
	  };
	  const sentMessage = await bot.sendMessage(userId, "Пожалуйста, выберите футболку, чтобы продолжить покупку. Если вы хотите оставить заявку на футболку не в наличии, то напишите @fffkorobka:", options);
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
  
	try {
	  if (sessionId === null || (sessionId && callbackQuery.message.message_id === userData.messageId)) {
		if (data.startsWith("select_tshirt_")) {
		  const tShirtId = parseInt(data.split("_")[2]);
		  const selectedTShirt = tShirts.find((tShirt) => tShirt.id === tShirtId);
  
		  if (selectedTShirt) {
			await setUserSelection(userData, { tShirtId });
  
			const availableSizes = Object.entries(selectedTShirt.sizes).filter(([size, quantity]) => quantity > 0);
			const sizesButtons = availableSizes.map(([size, quantity]) => [{
			  text: `${size} - ${quantity}`,
			  callback_data: `select_size_${tShirtId}_${size}`,
			}]);
  
			if (sizesButtons.length === 0) {
			  await bot.sendMessage(callbackQuery.message.chat.id, `${selectedTShirt.name} нет в наличии.`);
			} else {
			  sizesButtons.push([{ text: "Назад", callback_data: "back_to_shop" }]); // Adding the "Back" button
  
			  const sentMessage = await bot.sendPhoto(callbackQuery.message.chat.id, selectedTShirt.photo, {
				caption: `Вы выбрали *${selectedTShirt.name}*\n\nПожалуйста, выберите размер :`,
				parse_mode: "Markdown",
				reply_markup: {
				  inline_keyboard: sizesButtons,
				},
			  });
  
			  // Delete the last sent message (previous message)
			  if (userData.messageId) {
				try {
				  await bot.deleteMessage(callbackQuery.message.chat.id, userData.messageId);
				} catch (error) {
				  if (error.response && error.response.statusCode === 400) {
					console.error("Error deleting message: message to delete not found");
				  } else {
					console.error("Error deleting message:", error);
				  }
				}
			  }
  
			  userData.messageId = sentMessage.message_id;
			}
		  }
		} else if (data.startsWith("select_size_")) {
		  const [tShirtId, size] = data.split("_").slice(2);
		  const selectedTShirt = tShirts.find((tShirt) => tShirt.id === parseInt(tShirtId));
		  const userSelection = getUserSelection(userData);
  
		  if (selectedTShirt && userSelection && userSelection.tShirtId === selectedTShirt.id) {
			await setUserSelection(userData, { ...userSelection, size });
  
			const sentMessage = await bot.sendPhoto(callbackQuery.message.chat.id, selectedTShirt.photo, {
			  caption: `Вы выбрали размер *${size}* для *${selectedTShirt.name}*\n\nПожалуйста, укажите количество футболок для предзаказа:`,
			  parse_mode: "Markdown",
			});
  
			if (userData.messageId) {
			  try {
				await bot.deleteMessage(callbackQuery.message.chat.id, userData.messageId);
			  } catch (error) {
				if (error.response && error.response.statusCode === 400) {
				  console.error("Error deleting message: message to delete not found");
				} else {
				  console.error("Error deleting message:", error);
				}
			  }
			}
  
			userData.messageId = sentMessage.message_id;
			userData.state = "awaiting_quantity";
		  }
		} else if (data === "back_to_shop") { // Handling "Back" button
		  if (userData.messageId) {
			try {
			  await bot.deleteMessage(callbackQuery.message.chat.id, userData.messageId);
			} catch (error) {
			  if (error.response && error.response.statusCode === 400) {
				console.error("Error deleting message: message to delete not found");
			  } else {
				console.error("Error deleting message:", error);
			  }
			}
		  }
		  shopHandler(bot, { from: { id: userId } }, userData); // Calling shopHandler to bring user back to shop
		}
	  } else {
		await bot.answerCallbackQuery(callbackQuery.id, {
		  text: "Ошибка сессии, пожалуйста, используйте команду /start.",
		});
	  }
	} catch (error) {
	  console.error("Error in handleTShirtSelection:", error);
	  await bot.sendMessage(callbackQuery.message.chat.id, "Sorry, there was an error processing your request. Please try again later.");
	}
  }

  module.exports = {
	shopHandler,
	handleTShirtSelection,
  };