const { generateUniqueSessionId } = require("./utils");
const {
  clearCart,
  setPurchaseInfo,
  getPurchaseInfo,
  clearPurchaseInfo,
  cacncelOptions,
  menuOptions
} = require("./data");
require('dotenv').config();

const adminChatId = process.env.adminChatId
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
  let message = 'Детали  вашего  заказа:\n\n';
  cart.forEach((item) => {
    message += `<b>${item.name}</b> - Размер: <b>${item.size}</b>, Количество: <b>${item.quantity}</b>, Цена: <b>${item.price * item.quantity}₽</b>\n`;
  })
  const sentMessage = await bot.sendMessage(
    userId,
`${message}
Пожалуйста, предоставьте ваш адрес:`, cacncelOptions
  );
  userData.messageId = sentMessage.message_id;
}

async function handlePersonalInfo(msg, bot, userData) {
	const userId = msg.from.id;
	const sessionId = userData.state;
  const cart = userData.cart;
  
	if (sessionId && sessionId.startsWith('personal_info_') && msg.text !== "Вернуться в меню") {
    let finalPrice = 0
    cart.forEach((item) => {
      finalPrice = finalPrice + (item.price * item.quantity)
    });
	  if (msg.text) {
		const personalInfo = msg.text;
		setPurchaseInfo(userData, { personalInfo });
		const cardNumber = '5536 9139 9709 6165';
		const messageText = 
`Пожалуйста, оплатите заказ по номеру карты и пришлите чек об оплате. <b><u>Не пишите комментарии к переводу</u></b>

Общая сумма к оплате: <b>${finalPrice}₽</b>

Тинькофф <code>${cardNumber}</code> (Александра Р.)`;

		const sentMessage = await bot.sendMessage(userId, messageText, cacncelOptions);
		userData.messageId = sentMessage.message_id;
		userData.state = `payment_photo_${sessionId.split('_')[2]}`;
	  }
	} 
  }

async function handlePaymentPhoto(msg, bot, userData) {
  const userId = msg.from.id;
  const username = msg.from.username;
  const sessionId = userData.state;
  const cart = userData.cart;
	
  try {
    if (sessionId && sessionId.startsWith("payment_photo_")) {
      if (msg.photo) {
        const paymentPhoto = msg.photo[msg.photo.length - 1].file_id;
        const purchaseInfo = getPurchaseInfo(userData);

        if (purchaseInfo) {
          let finalPrice = 0
          // Create the order details message for the admin
          let adminOrderDetails = `Новый заказ от @${username}!

<b>Персональная информация:</b>
${purchaseInfo.personalInfo}

<b>Предметы:</b>
`;
        cart.forEach((item) => {
            adminOrderDetails += `${item.name} - Размер: ${item.size}, Кол-во: ${item.quantity}, Цена: ${item.price * item.quantity}₽\n`;
            finalPrice = finalPrice + (item.price * item.quantity)
          });
          adminOrderDetails  += `
Общая сумма к оплате: <b>${finalPrice}₽</b>`
          // Send the order details and payment confirmation photo to the admin
          await bot.sendMessage(adminChatId, adminOrderDetails,  {parse_mode: "HTML"});
          await bot.sendPhoto(adminChatId, paymentPhoto);

          // Send the order confirmation message to the user
          await bot.sendMessage(userId, `Спасибо за покупку, если остались вопросы, пишите @fffkorobka`, menuOptions);

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
