const { generateUniqueSessionId } = require('./utils');
const { clearCart, setPurchaseInfo, getPurchaseInfo, clearPurchaseInfo } = require('./data');

async function buyHandler(bot, msg, userData) {
	const userId = msg.from.id;
	const cart = userData.cart;
  
	if (cart.length === 0) {
	  await bot.sendMessage(userId, 'Your cart is empty. Please add items to your cart before proceeding with the purchase.');
	  return;
	}
  
	// Generate a unique session identifier
	const sessionId = `personal_info_${generateUniqueSessionId()}`;
	userData.state = sessionId;
  
	const sentMessage = await bot.sendMessage(userId, 'Please provide your personal information and address:');
	userData.messageId = sentMessage.message_id;
  }

  async function handlePersonalInfo(msg, bot, userData) {
	const userId = msg.from.id;
	const sessionId = userData.state;
  
	if (sessionId && sessionId.startsWith('personal_info_')) {
	  const personalInfo = msg.text;
	  setPurchaseInfo(userData, { personalInfo });
  
	  const sentMessage = await bot.sendMessage(userId, 'Please provide a photo of your payment confirmation:');
	  userData.messageId = sentMessage.message_id;
	  userData.state = `payment_photo_${sessionId.split('_')[2]}`;
	} else {
	  await bot.sendMessage(userId, 'Invalid session. Please start a new purchase.');
	  userData.state = null;
	}
  }

  async function handlePaymentPhoto(msg, bot, userData) {
	const userId = msg.from.id;
	const sessionId = userData.state;
  
	try {
	  if (sessionId && msg.photo) {
		const paymentPhoto = msg.photo[msg.photo.length - 1].file_id;
		const purchaseInfo = getPurchaseInfo(userData);
  
		if (purchaseInfo) {
		  // Create the order details message for the admin
		  let adminOrderDetails = `New Order Received!
  Personal Information: ${purchaseInfo.personalInfo}
  Order Items:
  `;
		  userData.cart.forEach((item) => {
			adminOrderDetails += `${item.name} - Size: ${item.size}, Quantity: ${item.quantity}, Price: $${item.price}\n`;
		  });
  
		  // Send the order details and payment confirmation photo to the admin
		  const adminChatId = '6705653406'; // Replace with the actual chat ID of the admin user
		  await bot.sendMessage(adminChatId, adminOrderDetails);
		  await bot.sendPhoto(adminChatId, paymentPhoto);
  
		  // Create the order confirmation message for the user
		  let userOrderConfirmation = 'Thank you for your order! Here are the details of your purchase:\n\n';
		  userData.cart.forEach((item) => {
			userOrderConfirmation += `${item.name} - Size: ${item.size}, Quantity: ${item.quantity}, Price: $${item.price}\n`;
		  });
  
		  // Send the order confirmation message to the user
		  await bot.sendMessage(userId, userOrderConfirmation);
  
		  // Clear the user's cart and purchase information after placing the order
		  clearCart(userData);
		  clearPurchaseInfo(userData);
		} else {
		  await bot.sendMessage(userId, 'Sorry, there was an error processing your order. Please try again.');
		}
	  } else {
		await bot.sendMessage(userId, 'Invalid session or missing payment photo. Please start a new purchase.');
	  }
	} catch (error) {
	  console.error('Error in handlePaymentPhoto:', error);
	  await bot.sendMessage(userId, 'Sorry, there was an error processing your payment photo. Please try again.');
	}
  
	userData.state = null;
  }

module.exports = {
  buyHandler,
  handlePersonalInfo,
  handlePaymentPhoto,
};