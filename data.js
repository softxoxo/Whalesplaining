const tShirts = [
	{
	  id: 1,
	  name: 'Черная кит',
	  price: 3000,
	  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
	  photo: './photos/black_whale.jpg',
	},
	{
	  id: 2,
	  name: 'Черная Маленький Кит',
	  price: 3000,
	  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
	  photo: './photos/black_small_whale.jpg',
	},
	{
	  id: 3,
	  name: 'Змея Join, or die',
	  price: 3000,
	  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
	  photo: './photos/black_snake.jpg',
	},
	{
	  id: 4,
	  name: "Кёко Don't tread on me",
	  price: 3000,
	  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
	  photo: './photos/white_anime.jpg',
	},
	{
	  id: 5,
	  name: 'Кёко и кит',
	  price: 3000,
	  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
	  photo: './photos/white_animeshka_and_fish.jpg',
	},
	{
	  id: 6,
	  name: 'Нап хуяп',
	  price: 4000,
	  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
	  photo: './photos/black_colorful_animeshka.jpg',
	},
  ];



  const cacncelOptions = {
	reply_markup: {
	  keyboard: [
		['Вернуться в меню'],
	  ],
	  resize_keyboard: true,
	  one_time_keyboard: false,
	},
	parse_mode: "HTML"
  };

  const menuOptions = {
	reply_markup: {
	  keyboard: [
		['Магазин'],
		['Корзина', 'Оформить заказ'],
		['Инфо', 'Помощь'],
	  ],
	  resize_keyboard: true,
	  one_time_keyboard: false,
	},
	parse_mode: "HTML"
  };
  const shopOptions = {
	reply_markup: {
	  keyboard: [
		['Таблица размеров'],
		['Вернуться в меню'],
	  ],
	  resize_keyboard: true,
	  one_time_keyboard: false,
	},
  };
  
  function addToCart(userData, item) {
	userData.cart.push(item);
  }
  
  function removeFromCart(userData, itemIndex) {
	userData.cart.splice(itemIndex, 1);
  }
  
  function clearCart(userData) {
	userData.cart = [];
  }
  
  function setUserSelection(userData, selection) {
	userData.selection = selection;
  }
  
  function getUserSelection(userData) {
	return userData.selection;
  }
  
  function clearUserSelection(userData) {
	userData.selection = null;
  }
  
  function setPurchaseInfo(userData, info) {
	userData.purchaseInfo = info;
  }
  
  function getPurchaseInfo(userData) {
	return userData.purchaseInfo;
  }
  
  function clearPurchaseInfo(userData) {
	userData.purchaseInfo = null;
  }
  
  module.exports = {
	tShirts,
	addToCart,
	removeFromCart,
	clearCart,
	setUserSelection,
	getUserSelection,
	clearUserSelection,
	setPurchaseInfo,
	getPurchaseInfo,
	clearPurchaseInfo,
	cacncelOptions,
	menuOptions,
	shopOptions
  };