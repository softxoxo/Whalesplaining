const {
	menuOptions
  } = require("./data");
  
  module.exports = async (bot, msg) => {
	const userId = msg.from.id;
	const message = `Привет ${msg.chat.first_name}! Это бот для заказов Whalesplaining. Доступные команды:

	Магазин - Просмотр и выбор футболок
	Корзина - Просмотр и управление корзиной
	Оформить заказ - Приступить к покупке
	Помощь - Связь с нами
	Инфо - информация о предзаказах, доставке и материалах
	
	Если остались вопросы, напишите @fffkorobka`;
  
	try {
	  await bot.sendMessage(userId, message, menuOptions);
	} catch (error) {
	  console.error('Error sending message:', error);
	}
  };