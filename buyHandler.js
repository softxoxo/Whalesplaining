module.exports = (bot, msg) => {
	const chatId = msg.chat.id;
	const infoMessage = `
	buy`;
	bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' });
  };