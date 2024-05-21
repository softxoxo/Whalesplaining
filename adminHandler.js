const { tShirts } = require("./data");

const getAdminChatId = () => process.env.adminChatId;

async function handleItemsCommand(bot, msg) {
  const userId = msg.from.id;
  const adminChatId = getAdminChatId();

  if (userId.toString() !== adminChatId) {
    return;
  }

  let message = 'Items:\n\n';
  tShirts.forEach((tShirt) => {
    message += `<b>${tShirt.name}</b> - ${tShirt.price}₽\n`;
    for (const [size, quantity] of Object.entries(tShirt.sizes)) {
      message += `  Size: ${size} - Quantity: ${quantity}\n`;
    }
    message += '\n';
  });

  await bot.sendMessage(adminChatId, message, { parse_mode: 'HTML' });
}

async function handleUpdateCommand(bot, msg) {
  const userId = msg.from.id;
  const adminChatId = getAdminChatId();

  if (userId.toString() !== adminChatId) {
    return;
  }

  const buttons = tShirts.map((tShirt) => [{
    text: tShirt.name,
    callback_data: `update_item_${tShirt.id}`
  }]);

  await bot.sendMessage(adminChatId, "Выберите, какой предмет обновить:", {
    reply_markup: {
      inline_keyboard: buttons
    }
  });
}

async function handleUpdateSelection(bot, callbackQuery) {
  const userId = callbackQuery.from.id;
  const adminChatId = getAdminChatId();

  if (userId.toString() !== adminChatId) {
    return;
  }

  const data = callbackQuery.data;
  const itemId = parseInt(data.split('_')[2], 10);
  const selectedTShirt = tShirts.find((tShirt) => tShirt.id === itemId);
  if (data.startsWith('update_item_')) {

    if (!selectedTShirt) {
      await bot.sendMessage(adminChatId, "Item not found.");
      return;
    }

    const sizeButtons = Object.keys(selectedTShirt.sizes).map((size) => [{
      text: size,
      callback_data: `update_size_${itemId}_${size}`
    }]);

    await bot.sendMessage(adminChatId, `Выберите размер для ${selectedTShirt.name}:`, {
      reply_markup: {
        inline_keyboard: sizeButtons
      }
    });
  } else if (data.startsWith('update_size_')) {
    const dataParts = data.split('_');
    const itemId = parseInt(dataParts[2], 10);
    const size = dataParts.slice(3).join('_');

    await bot.sendMessage(adminChatId, `Укажите количество предметов для обновления ${selectedTShirt.name} ${size}:`);

    const awaitQuantityMessageHandler = async (msg) => {
      const newQuantity = parseInt(msg.text, 10);
      if (!isNaN(newQuantity)) {
        const selectedTShirt = tShirts.find((tShirt) => tShirt.id === itemId);
        if (selectedTShirt) {
          selectedTShirt.sizes[size] = newQuantity;
          await bot.sendMessage(adminChatId, `Обновлено количество вещей ${size} на ${newQuantity}  для предмета ${selectedTShirt.name}.`);
          // Remove the listener after the update is done
          bot.removeListener('message', awaitQuantityMessageHandler);
        } else {
          await bot.sendMessage(adminChatId, "Item not found.");
        }
      } else {
        await bot.sendMessage(adminChatId, "Пожалуйста, отправьте число.");
      }
    };
    // Remove any existing listeners before adding a new one
    bot.removeListener('message', awaitQuantityMessageHandler);
    bot.on('message', awaitQuantityMessageHandler);
  }
}

module.exports = {
  handleItemsCommand,
  handleUpdateCommand,
  handleUpdateSelection
};
