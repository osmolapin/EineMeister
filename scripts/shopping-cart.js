const CART_STORAGE_KEY = 'shoppingCart';

// function to update cart
function getCart() {
    // Take date from local storage
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    // If there is no data, then return empty cart, but if there is returns cart with items
    return cartData ? JSON.parse(cartData) : [];
}
// function to save cart when moving between pages and even when browser is closed
// turns cart data into string to save it
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// functions to show cart 
function renderCart() {
    const cart = getCart()
    const container =document.getElementByIdyId('cart-list-container')
    // empty the container before updating it
    container.innerHTML = '';
    let totalSum = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Ostukorv on tühi.</p>';
        document.querySelector('.total-sum').innerText = '0.00€';
        return;
    }

    cart.forEach(item =>{
        // To calculate each items total pricing
        const itemTotal = item.price * item.quantity;
        totalSum += itemTotal;
        // Make a HTML element when item is added to cart
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML=`
         <img src="/images/" alt="item-picture">
                <div class="item-details">
                    <p class="item-name">Item name</p>
                    <p class="item-description">Description</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-minus">-</button>
                    <input type="number" value="1" class="quantity-input" min="0">
                    <button class="quantity-plus">+</button>
                </div>
                <p class="item-price">0.0€</p>`;
        // add element into this container
        cotainer.appendChild(cartItemDiv);
    });
    // Update cart total sum
    updateCartTotals(totalSum);
}
// To see total sum
function updateCartTotals(totalSum) {
    document.querySelector('.total-sum').innerText = totalSum.toFixed(2) + '€';
}

function changeProductQuantity(thisProductId, type) {
    
   let numElement = document.getElementById(thisProductId);
   numValue = Number(numElement.textContent);

   if (type == 1) {
    numValue++;

   } else if (type == -1) {
    if (numValue > 0) {
      numValue--;
    }

   }
   numElement.innerText = numValue;
}

