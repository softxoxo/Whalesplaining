const {
	menuOptions
  } = require("./data");
  
  module.exports = async (bot, msg) => {
	const userId = msg.from.id;
	const message = `Привет <b>${msg.chat.first_name}</b>! Это бот для заказов <b>Whalesplaining</b>. Доступные команды:

<b>Магазин</b> - Просмотр и выбор футболок
<b>Корзина</b> - Просмотр и управление корзиной
<b>Оформить заказ</b> - Приступить к покупке
<b>Помощь</b> - Связь с нами
<b>Инфо</b> - информация о составе футболок и доставке
	
Если остались вопросы, напишите @fffkorobka`;
  
	try {
	  await bot.sendMessage(userId, message, menuOptions);
	} catch (error) {
	  console.error('Error sending message:', error);
	}
  };