import { PRODUCT_SALE, PROMOTION_SALE } from './constants/discounts.js';
import products from './store/products.js';

let cartElement,
  totalElement,
  selectOptionsElement,
  appendButtonElement,
  stockInfoElement;

let lastAddedItemId,
  bonusPoint = 0,
  totalAmount = 0,
  itemCount = 0;

const STOCK_ALERT = 5;

function main() {
  let root = document.getElementById('app');

  let h1 = document.createElement('h1');
  h1.className = 'text-2xl font-bold mb-4';
  h1.textContent = '장바구니';

  let rootElement = document.createElement('div');
  rootElement.className = 'bg-gray-100 p-8';

  cartElement = document.createElement('div');
  cartElement.id = 'cart-items';

  totalElement = document.createElement('div');
  totalElement.id = 'cart-total';
  totalElement.className = 'text-xl font-bold my-4';

  selectOptionsElement = document.createElement('select');
  selectOptionsElement.id = 'product-select';
  selectOptionsElement.className = 'border rounded p-2 mr-2';

  appendButtonElement = document.createElement('button');
  appendButtonElement.id = 'add-to-cart';
  appendButtonElement.className = 'bg-blue-500 text-white px-4 py-2 rounded';
  appendButtonElement.textContent = '추가';

  stockInfoElement = document.createElement('div');
  stockInfoElement.id = 'stock-status';
  stockInfoElement.className = 'text-sm text-gray-500 mt-2';

  let wrap = document.createElement('div');
  wrap.className =
    'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8';
  wrap.appendChild(h1);
  wrap.appendChild(cartElement);
  wrap.appendChild(totalElement);
  wrap.appendChild(selectOptionsElement);
  wrap.appendChild(appendButtonElement);
  wrap.appendChild(stockInfoElement);

  updateSelectOptions();

  rootElement.appendChild(wrap);
  root.appendChild(rootElement);

  calculateCart();

  setTimeout(function () {
    setInterval(function () {
      let luckyItem = products[Math.floor(Math.random() * products.length)];
      const isNotSoldOut = luckyItem.stock > 0;
      if (Math.random() < PROMOTION_SALE.LUCKY.PROBABILITY && isNotSoldOut) {
        luckyItem.price = Math.round(
          luckyItem.price * PROMOTION_SALE.LUCKY.DISCOUNT_RATE
        );
        alert(`번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);
        updateSelectOptions();
      }
    }, PROMOTION_SALE.LUCKY.INTERVAL);
  }, Math.random() * PROMOTION_SALE.LUCKY.INITIAL_DELAY);

  setTimeout(function () {
    setInterval(function () {
      if (lastAddedItemId) {
        let suggest = products.find(function (product) {
          return product.id !== lastAddedItemId && product.stock > 0;
        });
        if (suggest) {
          alert(
            `${suggest.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`
          );
          suggest.price = Math.round(
            suggest.price * PROMOTION_SALE.RECOMMENDED.DISCOUNT_RATE
          );
          updateSelectOptions();
        }
      }
    }, PROMOTION_SALE.RECOMMENDED.INTERVAL);
  }, Math.random() * PROMOTION_SALE.RECOMMENDED.INITIAL_DELAY);
}

function updateSelectOptions() {
  selectOptionsElement.innerHTML = '';
  products.forEach(function (product) {
    let optionElement = document.createElement('option');
    optionElement.value = product.id;
    optionElement.textContent = `${product.name} - ${product.price}원`;

    const isSoldOut = product.stock === 0;
    if (isSoldOut) {
      optionElement.disabled = true;
    }

    selectOptionsElement.appendChild(optionElement);
  });
}

function calculateCart() {
  itemCount = 0;
  totalAmount = 0;

  let subTotal = 0;
  let cartItems = cartElement.children;

  Array.from(cartItems).forEach(function (cartItem) {
    let currentItem = getCurrentCartItem(cartItem.id);

    let quantity = parseInt(
      cartItem.querySelector('span').textContent.split('x ')[1]
    );

    let itemTotal = currentItem.price * quantity;
    let discountRate = 0;
    itemCount += quantity;
    subTotal += itemTotal;

    if (quantity >= PRODUCT_SALE.QUANTITY) {
      discountRate = currentItem.discount;
    }

    totalAmount += itemTotal * (1 - discountRate);
  });

  let discountRate = 0;
  if (itemCount >= PROMOTION_SALE.BULK.QUANTITY) {
    let bulkDiscount = totalAmount * PROMOTION_SALE.BULK.DISCOUNT_RATE;
    let itemDiscount = subTotal - totalAmount;
    if (bulkDiscount > itemDiscount) {
      totalAmount = subTotal * (1 - PROMOTION_SALE.BULK.DISCOUNT_RATE);
      discountRate = PROMOTION_SALE.BULK.DISCOUNT_RATE;
    } else {
      discountRate = (subTotal - totalAmount) / subTotal;
    }
  } else {
    discountRate = (subTotal - totalAmount) / subTotal;
  }

  const isTuesday = new Date().getDay() === 2;
  if (isTuesday) {
    totalAmount *= 1 - PROMOTION_SALE.TUESDAY.DISCOUNT_RATE;
    discountRate = Math.max(discountRate, PROMOTION_SALE.TUESDAY.DISCOUNT_RATE);
  }
  totalElement.textContent = `총액: ${Math.round(totalAmount)}원`;

  const isDiscountApplied = discountRate > 0;
  if (isDiscountApplied) {
    let spanElement = document.createElement('span');
    spanElement.className = 'text-green-500 ml-2';
    spanElement.textContent = `(${(discountRate * 100).toFixed(1)}% 할인 적용)`;
    totalElement.appendChild(spanElement);
  }

  renderStockInfo();
  renderBonusPoint();
}

function renderStockInfo() {
  let message = '';
  products.forEach(function (product) {
    const isLowStock = product.stock < STOCK_ALERT;
    if (isLowStock) {
      const isSoldOut = product.stock === 0;
      message += `${product.name}: ${
        isSoldOut ? '품절' : `재고 부족 (${product.stock}개 남음)`
      }\n`;
    }
  });
  stockInfoElement.textContent = message;
}

const renderBonusPoint = () => {
  bonusPoint = Math.floor(totalAmount / 1000);
  let pointElement = document.getElementById('loyalty-points');
  if (!pointElement) {
    pointElement = document.createElement('span');
    pointElement.id = 'loyalty-points';
    pointElement.className = 'text-blue-500 ml-2';
    totalElement.appendChild(pointElement);
  }
  pointElement.textContent = `(포인트: ${bonusPoint})`;
};

main();

function getCurrentCartItem(cartItemId) {
  return products.find(function (product) {
    return product.id === cartItemId;
  });
}

appendButtonElement.addEventListener('click', function () {
  let selectedItemId = selectOptionsElement.value;

  let itemToAdd = getCurrentCartItem(selectedItemId);

  if (itemToAdd && itemToAdd.stock > 0) {
    let itemElement = document.getElementById(itemToAdd.id);
    if (itemElement) {
      let newQuantity =
        parseInt(itemElement.querySelector('span').textContent.split('x ')[1]) +
        1;
      if (newQuantity <= itemToAdd.stock) {
        itemElement.querySelector('span').textContent =
          `${itemToAdd.name} - ${itemToAdd.price}원 x ${newQuantity}`;
        itemToAdd.stock--;
      } else {
        alert('재고가 부족합니다.', itemToAdd.stock);
      }
    } else {
      let newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className = 'flex justify-between items-center mb-2';
      newItem.innerHTML =
        `<span>${itemToAdd.name} - ${itemToAdd.price}원 x 1</span><div>` +
        `<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${itemToAdd.id}" data-change="-1">-</button>` +
        `<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${itemToAdd.id}" data-change="1">+</button>` +
        `<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="${itemToAdd.id}">삭제</button></div>`;
      cartElement.appendChild(newItem);
      itemToAdd.stock--;
    }
    calculateCart();
    lastAddedItemId = selectedItemId;
  }
});

cartElement.addEventListener('click', function (event) {
  let target = event.target;
  if (
    target.classList.contains('quantity-change') ||
    target.classList.contains('remove-item')
  ) {
    let productId = target.dataset.productId;
    let productItemElement = document.getElementById(productId);
    let product = getCurrentCartItem(productId);
    if (target.classList.contains('quantity-change')) {
      let quantityChange = parseInt(target.dataset.change);
      let newQuantity =
        parseInt(
          productItemElement.querySelector('span').textContent.split('x ')[1]
        ) + quantityChange;
      if (
        newQuantity > 0 &&
        newQuantity <=
          product.stock +
            parseInt(
              productItemElement
                .querySelector('span')
                .textContent.split('x ')[1]
            )
      ) {
        productItemElement.querySelector('span').textContent =
          `${productItemElement.querySelector('span').textContent.split('x ')[0]}x ${newQuantity}`;
        product.stock -= quantityChange;
      } else if (newQuantity <= 0) {
        productItemElement.remove();
        product.stock -= quantityChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (target.classList.contains('remove-item')) {
      let removeQuantity = parseInt(
        productItemElement.querySelector('span').textContent.split('x ')[1]
      );
      product.stock += removeQuantity;
      productItemElement.remove();
    }
    calculateCart();
  }
});
