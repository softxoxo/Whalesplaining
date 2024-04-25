const TelegramBot = require("node-telegram-bot-api");
const { generateUniqueSessionId } = require("./utils");
const {
  buyHandler,
  handlePersonalInfo,
  handlePaymentPhoto,
} = require("./buyHandler");
const { cartHandler, handleCartItemRemoval } = require("./cartHandler");
const infoHandler = require("./infoHandler");
const { shopHandler, handleTShirtSelection } = require("./shopHandler");
const helpHandler = require("./helpHandler");
const startHandler = require("./startHandler");
const {
  addToCart,
  clearUserSelection,
  getUserSelection,
  tShirts,
  menuOptions
} = require("./data");

const token = "6751671474:AAGeQESCFaOpXi18rrU6VolcHCYzjCk4_DE";
const bot = new TelegramBot(token, { polling: true });

const userData = {};

bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id;
  if (!userData[userId]) {
    userData[userId] = {
      id: userId,
      cart: [],
      state: null,
      purchaseInfo: null,
    };
  }
  startHandler(bot, msg, userData[userId]);
});

bot.onText(/Оформить заказ/, async (msg) => {
  const userId = msg.from.id;

  if (userData[userId].state === null) {
    try {
      await buyHandler(bot, msg, userData[userId]);
    } catch (error) {
      console.error("Error processing buy:", error);
      await bot.sendMessage(userId, "Sorry, there was an error processing your purchase. Please try again.");
    }
  } 
});

bot.onText(/Корзина/, async (msg) => {
  const userId = msg.from.id;
  if (userData[userId] && userData[userId].state === null) {
    cartHandler(bot, msg, userData[userId]);
  }
});

bot.onText(/Инфо/, (msg) => {
  const userId = msg.from.id;
  if (userData[userId]) {
    infoHandler(bot, msg, userData[userId]);
  }
});

bot.onText(/Магазин/, (msg) => {
  const userId = msg.from.id;
  if (userData[userId] && userData[userId].state === null) {
    shopHandler(bot, msg, userData[userId]);
  }
});

bot.onText(/Помощь/, (msg) => {
  const userId = msg.from.id;
  if (userData[userId]) {
    helpHandler(bot, msg, userData[userId]);
  }
});

bot.onText(/Вернуться в меню/, (msg) => {
  const userId = msg.from.id;
  
  bot.sendMessage(userId, 'Вы вернулись в меню.', menuOptions);
  userData[userId].state = null;
});

bot.onText(/Таблица размеров/, (msg) => {
  const userId = msg.from.id;
  bot.sendMediaGroup(userId, [{
    type: 'photo',
    media: './photos/size_table.png',
    caption: "",
    parse_mode: 'Markdown',
  }])
});

bot.on('callback_query', async (callbackQuery) => {
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (userData[userId]) {
    if (data.startsWith('select_tshirt_') || data.startsWith('select_size_')) {
      await handleTShirtSelection(callbackQuery, bot, userData[userId]);
    } else if (data.startsWith('remove_item_') || data.startsWith('clear_cart_')) {
      await handleCartItemRemoval(callbackQuery, bot, userData[userId]);
    } 
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (userData[userId]) {
    if (userData[userId].state === 'awaiting_quantity' && msg.text) {
      const quantity = parseInt(msg.text);
      if (!isNaN(quantity) && quantity > 0) {
        const userSelection = getUserSelection(userData[userId]);
        const selectedTShirt = tShirts.find((tShirt) => tShirt.id === userSelection.tShirtId);
        const item = {
          name: selectedTShirt.name,
          size: userSelection.size,
          quantity: quantity,
          price: selectedTShirt.price,
        };
        addToCart(userData[userId], item);
        clearUserSelection(userData[userId]);
        userData[userId].state = null;
        await bot.sendMessage(chatId, `${quantity} x ${selectedTShirt.name} (Size: ${userSelection.size}) за ${selectedTShirt.price * quantity}₽ ${quantity >  1 ? 'добавлены' : 'добавлена'} в вашу корзину.`, menuOptions);
      } else {
        await bot.sendMessage(chatId, 'Неверное количество, укажите цифру.');
      }
    } else if (userData[userId].state && userData[userId].state.startsWith('personal_info_') && msg.text) {
      await handlePersonalInfo(msg, bot, userData[userId]);
    } else if (userData[userId].state && userData[userId].state.startsWith('payment_photo_')) {
      if (msg.photo) {
        await handlePaymentPhoto(msg, bot, userData[userId]);
      } else if (msg.text !== "Вернуться в меню") {
        await bot.sendMessage(chatId, 'Пожалуйста, приложите фото.');
      }
      
      
    } else if (userData[userId].state !== null) {
      // Reset the state if an unexpected message is received
      userData[userId].state = null;
    }
  } else if(msg.text !== "/start") {
      userData[userId] = {
        id: userId,
        cart: [],
        state: null,
        purchaseInfo: null,
      };
    startHandler(bot, msg, userData[userId]);
  }
});
