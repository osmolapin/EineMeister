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
    const container = document.getElementById('cart-list-container')
    // Check if container exists before continuing
    if (!container) {
        return;
    }
    // empty the container before updating it
    container.innerHTML = '';
    let totalSum = 0;

    const totalSumElement = document.querySelector('.total-sum')
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Ostukorv on tühi.</p>';
        if (totalSumElement) {
            totalSumElement.innerText = '0.0€'
        }
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
                <img src="${item.imageUrl || '/images/default.jpg'}" alt="${item.name}">
           <div class="item-details">
               <p class="item-name">${item.name}</p> 
               <p class="item-description"></p> 
           </div>
           <div class="item-quantity">
               <button class="quantity-minus" type="button" data-id="${item.id}">-</button> 
               <input type="number" value="${item.quantity}" class="quantity-input" min="0" readonly> 
               <button class="quantity-plus" type="button" data-id="${item.id}">+</button>
           </div>
           <p class="item-price">${itemTotal.toFixed(2)}€</p>
                `;
        // add element into this container
        container.appendChild(cartItemDiv);
    });
    // Update cart total sum
    updateCartTotals(totalSum);
}
// To see total sum
function updateCartTotals(totalSum) {
    const totalSumElement = document.querySelector('.total-sum');
    if (totalSumElement) {
        totalSumElement.innerText = totalSum.toFixed(2) + '€';
    }
}

function addToCart(productDetails, quantity = 1) {
    let cart = getCart();
    const productId = productDetails.id;
    const priceValue = Number(productDetails.data.price); 

    const itemToSave = {
        id: productId,
        name: productDetails.data.name,
        price: priceValue, // Veendu, et hind on number
        imageUrl: productDetails.data.imageUrl
    };

    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += quantity;
    } else {
        cart.push({ ...itemToSave, quantity: quantity });
    }

    saveCart(cart);
    renderCart();
    alert(`${quantity} x ${productDetails.data.name} lisatud ostukorvi!`);
}

function changeProductQuantity(thisProductId, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === thisProductId);

    if (itemIndex !== -1) {
    // Update data in local storage
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity < 1) {
        // If quantity is under 1, item is removed from cart
        cart.splice(itemIndex, 1);
    }
    saveCart(cart);
    // Render the cart again for HTML to update
    renderCart();
    }
}

// Additon of event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Renderda ostukorv alati lehe laadimisel
    renderCart();

    const cartContainer = document.getElementById('cart-list-container');
    
    // 🐞 PARANDUS: Kasuta sündmuste delegeerimist ja eemalda vigased viited (GamepadButton)
    if (cartContainer) {
        cartContainer.addEventListener('click', (event) => {
            const target = event.target;
            // Loeme ID otse nupult, millele andsime data-id atribuudi
            const productId = target.getAttribute('data-id'); 
            
            if (productId) {
                let change = 0;
                if (target.classList.contains('quantity-plus')) {
                    change = 1;
                } else if (target.classList.contains('quantity-minus')) {
                    change = -1;
                }
                
                if (change !== 0) {
                    changeProductQuantity(productId, change);
                }
            }
        });
    }
});