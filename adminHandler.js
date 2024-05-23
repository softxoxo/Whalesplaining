const { tShirts, clearCart, restoreTShirtSizes,  } = require("./data");
const { retrievePreviousUsers } = require("./utils");
const getAdminChatId = () => process.env.adminChatId;
const getIvaChatId = () => process.env.ivaChatId;
const ivaChatId = getIvaChatId()
const fs = require('fs');
const path = require('path');
const os = require('os');

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

async function handleBanCommand(bot, msg, match, bannedUsers) {
  const userId = msg.from.id;
  const adminChatId = getAdminChatId();

  if (userId.toString() !== adminChatId) {
    return;
  }

  const bannedUserId = parseInt(match[1], 10);

  if (isNaN(bannedUserId)) {
    await bot.sendMessage(adminChatId, 'Please provide a valid user ID.');
    return;
  }

  if (!bannedUsers.includes(bannedUserId)) {
    bannedUsers.push(bannedUserId);
    await bot.sendMessage(adminChatId, `User with ID ${bannedUserId} has been banned.`);
  } else {
    await bot.sendMessage(adminChatId, `User with ID ${bannedUserId} is already banned.`);
  }
}

async function handleUnbanCommand(bot, msg, match, bannedUsers) {
  const userId = msg.from.id;
  const adminChatId = getAdminChatId();

  if (userId.toString() !== adminChatId) {
    return;
  }

  const bannedUserId = parseInt(match[1], 10);

  if (isNaN(bannedUserId)) {
    await bot.sendMessage(adminChatId, 'Please provide a valid user ID.');
    return;
  }

  const index = bannedUsers.indexOf(bannedUserId);
  if (index !== -1) {
    bannedUsers.splice(index, 1);
    await bot.sendMessage(adminChatId, `User with ID ${bannedUserId} has been unbanned.`);
  } else {
    await bot.sendMessage(adminChatId, `User with ID ${bannedUserId} is not banned.`);
  }
}

let previousUsers = [ 6196211833, 6817485569 ];

async function handleSendCommand(bot, msg, userData) {
  const userId = msg.from.id;
  const adminChatId = getAdminChatId();

  if (userId.toString() !== adminChatId) {
    return;
  }

  const messageText = msg.text.slice(6).trim();

  if (!messageText) {
    await bot.sendMessage(adminChatId, "Пожалуйста, напишите сообщение.");
    return;
  }

  // Retrieve previous users from userData

  for (const recipientId of previousUsers) {
    try {
      await bot.sendMessage(recipientId, messageText);
      console.log(`Message sent to user ${recipientId}`);
    } catch (error) {
      console.error(`Error sending message to user ${recipientId}:`, error);
    }
  }

  await bot.sendMessage(adminChatId, "Message sent to all users.");
}

async function handleCancelOrderCommand(bot, callbackQuery, userData) {
  const adminChatId = getAdminChatId();
  const data = callbackQuery.data;
  const userId = data.split('_')[2];

  const cart = userData[userId].cart;

  if (cart && cart.length > 0) {
    // Restore the t-shirt sizes based on the canceled order
    restoreTShirtSizes(cart);

    // Send a cancellation message to the user
    await bot.sendMessage(
      userId,
      "Ваш заказ был отменен, за дополнительной информацией обратитесь к @fffkorobka"
    );

    // Send a confirmation message to the admin
    await bot.sendMessage(adminChatId, `Order for user ${userId} has been cancelled.`);
  } else {
    await bot.sendMessage(adminChatId, `No active order found for user ${userId}.`);
  }
}

async function handleBanUserCommand(bot, callbackQuery, bannedUsers, userData) {
  const adminChatId = getAdminChatId();
  const data = callbackQuery.data;
  const userId = parseInt(data.split('_')[2], 10);
  const cart = userData[userId].cart;

  if (cart && cart.length > 0) {
    // Restore the t-shirt sizes based on the canceled order
    restoreTShirtSizes(cart);
  }
  await handleBanCommand(bot, { from: { id: adminChatId } }, [null, userId], bannedUsers);
}

async function handleSaveCommand(bot, msg, userData) {
  const userId = msg.from.id;
  const adminChatId = getAdminChatId();

  if (userId.toString() !== adminChatId) {
    return;
  }

  try {
    // Retrieve previous users from userData
    const previousUsers = retrievePreviousUsers(userData);

    // Create a temporary file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, 'previous_users.json');

    // Write the JSON data to the temporary file
    fs.writeFileSync(tempFilePath, JSON.stringify(previousUsers, null, 2));

    // Send the JSON file to the specified user
    await bot.sendDocument(ivaChatId, tempFilePath);
    await bot.sendMessage(adminChatId, "Previous users data saved and sent to IVA.");

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);
  } catch (error) {
    console.error("Error sending previous users data:", error);
    await bot.sendMessage(adminChatId, "An error occurred while saving and sending previous users data.");
  }
}

module.exports = {
  handleItemsCommand,
  handleUpdateCommand,
  handleUpdateSelection,
  handleBanCommand,
  handleUnbanCommand,
  handleSendCommand,
  handleCancelOrderCommand,
  handleBanUserCommand,
  handleSaveCommand
};