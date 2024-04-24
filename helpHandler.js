module.exports = (bot, msg) => {
	const chatId = msg.chat.id;
	const infoMessage = `Если остались вопросы, пишите @fffkorobka`;
	bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' });
  };