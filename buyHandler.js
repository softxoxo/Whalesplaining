const { generateUniqueSessionId } = require("./utils");
const {
  clearCart,
  setPurchaseInfo,
  getPurchaseInfo,
  clearPurchaseInfo,
  cacncelOptions,
  menuOptions
} = require("./data");

async function buyHandler(bot, msg, userData) {
  const userId = msg.from.id;
  const cart = userData.cart;

  if (cart.length === 0) {
    await bot.sendMessage(
      userId,
      "Ваша корзина пуста. Пожалуйста, добавьте товары в корзину, прежде чем продолжить покупку."
    );
    return;
  }

  // Generate a unique session identifier
  const sessionId = `personal_info_${generateUniqueSessionId()}`;
  userData.state = sessionId;

  const sentMessage = await bot.sendMessage(
    userId,
    "Пожалуйста, предоставьте ваш адрес:", cacncelOptions
  );
  userData.messageId = sentMessage.message_id;
}

async function handlePersonalInfo(msg, bot, userData) {
	const userId = msg.from.id;
	const sessionId = userData.state;
  
	if (sessionId && sessionId.startsWith('personal_info_') && msg.text !== "Вернуться в меню") {
	  if (msg.text) {
		const personalInfo = msg.text;
		setPurchaseInfo(userData, { personalInfo });
		
		const sentMessage = await bot.sendMessage(userId, 'Пожалуйста, приложите фото чека об оплате:', cacncelOptions);
		userData.messageId = sentMessage.message_id;
		userData.state = `payment_photo_${sessionId.split('_')[2]}`;
	  }
	} 
  }

async function handlePaymentPhoto(msg, bot, userData) {
  const userId = msg.from.id;
  const username = msg.from.username;
  const sessionId = userData.state;
	
  try {
    if (sessionId && sessionId.startsWith("payment_photo_")) {
      if (msg.photo) {
        const paymentPhoto = msg.photo[msg.photo.length - 1].file_id;
        const purchaseInfo = getPurchaseInfo(userData);

        if (purchaseInfo) {
          // Create the order details message for the admin
          let adminOrderDetails = `Новый заказ от @${username}!
				Персональная информация: ${purchaseInfo.personalInfo}
				Предметы:
				`;
          userData.cart.forEach((item) => {
            adminOrderDetails += `${item.name} - Размер: ${item.size}, Кол-во: ${item.quantity}, Цена: ${item.price * item.quantity}₽\n`;
          });

          // Send the order details and payment confirmation photo to the admin
          const adminChatId = "6705653406"; // Replace with the actual chat ID of the admin user
          await bot.sendMessage(adminChatId, adminOrderDetails);
          await bot.sendPhoto(adminChatId, paymentPhoto);

          // Create the order confirmation message for the user
          let userOrderConfirmation =
            "Спасибо за покупку, вот детали вашего заказа:\n";
          userData.cart.forEach((item) => {
            userOrderConfirmation += `${item.name} - Размер: ${item.size}, Количество: ${item.quantity}, Цена: ${item.price * item.quantity}₽\n`;
          });

          // Send the order confirmation message to the user
          await bot.sendMessage(userId, userOrderConfirmation);
          await bot.sendMessage(userId, `Если остались вопросы, пишите @fffkorobka`, menuOptions);

          // Clear the user's cart and purchase information after placing the order
          clearCart(userData);
          clearPurchaseInfo(userData);
        } else {
          await bot.sendMessage(
            userId,
            "Sorry, there was an error processing your order. Please try again."
          );
        }
      } else {
        await bot.sendMessage(
          userId,
          "Please provide a photo of your payment confirmation."
        );
      }
    } 
  } catch (error) {
    console.error("Error in handlePaymentPhoto:", error);
    await bot.sendMessage(
      userId,
      "Sorry, there was an error processing your payment photo. Please try again."
    );
  }

  userData.state = null;
}

module.exports = {
  buyHandler,
  handlePersonalInfo,
  handlePaymentPhoto,
};
