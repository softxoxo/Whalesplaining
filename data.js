const tShirts = [
	{
		id: 1,
		name: "Черная кит",
		price: 3000,
		sizes: { 
		  XS: 0,
		  S: 0,
		  M: 0,
		  L: 0,
		  XL: 0,
		  XXL: 0
		},
		photo: "./photos/black_whale.jpg",
	  },
	  {
		id: 2,
		name: "Кёко Don't tread on me",
		price: 3000,
		sizes: {
		  XS: 0,
		  S: 0,
		  M: 0,
		  L: 0,
		  XL: 0,
		  XXL: 0
		},
		photo: "./photos/white_anime.jpg",
	  },
	  {
		id: 3,
		name: "Черная Маленький Кит",
		price: 3000,
		sizes: {
		  XS: 0,
		  S: 0,
		  M: 0,
		  L: 0,
		  XL: 0,
		  XXL: 0
		},
		photo: "./photos/black_small_whale.jpg",
	  },
  {
    id: 4,
    name: "Змея Join, or die",
    price: 3000,
    sizes: {
		XS: 0,
		S: 0,
		M: 0,
		L: 0,
		XL: 0,
		XXL: 0
	  },
    photo: "./photos/black_snake.jpg",
  },
  {
    id: 5,
    name: "Кёко и кит",
    price: 3000,
    sizes: {
		XS: 0,
		S: 0,
		M: 0,
		L: 0,
		XL: 0,
		XXL: 0
	  },
    photo: "./photos/white_animeshka_and_fish.jpg",
  },
  {
    id: 6,
    name: "Нап хуяп",
    price: 4000,
    sizes: {
		XS: 0,
		S: 0,
		M: 0,
		L: 0,
		XL: 0,
		XXL: 0
	  },
    photo: "./photos/black_colorful_animeshka.jpg",
  },
];

const cacncelOptions = {
  reply_markup: {
    keyboard: [["Вернуться в меню"]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
  parse_mode: "HTML",
};

const menuOptions = {
  reply_markup: {
    keyboard: [["Магазин"], ["Корзина", "Оформить заказ"], ["Инфо", "Помощь"]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
  parse_mode: "HTML",
};
const shopOptions = {
  reply_markup: {
    keyboard: [["Таблица размеров"], ["Вернуться в меню"]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

function updateTShirtSizes(tShirtId, size, quantity) {
	const tShirt = tShirts.find((t) => t.id === tShirtId);
	if (tShirt) {
	  tShirt.sizes[size] -= quantity;
	}
  }

  function restoreTShirtSizes(cart) {
	cart.forEach((item) => {
	  const tShirt = tShirts.find((t) => t.id === item.id);
	  if (tShirt) {
		tShirt.sizes[item.size] += item.quantity;
	  }
	});
  }

function addToCart(userData, item) {
  userData.cart.push(item);
}

function clearCart(userData, itemsToRemove) {
	if (userData.cart.length > 0) {
		userData.cart = userData.cart.filter((item) => !itemsToRemove.includes(item));
	} else {
		userData.cart  = []
	}
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
  clearCart,
  setUserSelection,
  getUserSelection,
  clearUserSelection,
  setPurchaseInfo,
  getPurchaseInfo,
  clearPurchaseInfo,
  cacncelOptions,
  menuOptions,
  shopOptions,
  updateTShirtSizes,
  restoreTShirtSizes
};
