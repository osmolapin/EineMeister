import {showToast} from '/scripts/notifications-on-pages.js';
const CART_STORAGE_KEY = 'shoppingCart';
const saved_carts = 'savedCarts';
let lastSavedCartString = '[]'; 
let currentUserId = null;

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
    // If cart is empty then this is there:
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

function addToCart(thisProductId, quantity = 1) {
    let cart = getCart();
    const productId = thisProductId.id;
    const priceValue = Number(thisProductId.data.price); 

    const itemToSave = {
        id: productId,
        name: thisProductId.data.name,
        price: priceValue,
        imageUrl: thisProductId.data.imageUrl
    };

    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += quantity;
    } else {
        cart.push({ ...itemToSave, quantity: quantity });
    }

    saveCart(cart);
    renderCart();
    // alert(`${quantity} x ${thisProductId.data.name} lisatud ostukorvi!`); -----------------  Not neccessary, but if needed then its here.
    checkCartStatus();
    const message = `${quantity} x ${thisProductId.data.name} lisatud ostukorvi!`;
    showToast(message, 'success');
}
window.addToCart = addToCart

function changeProductQuantity(thisProductId, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === thisProductId);

    let newQuantity = 0;

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        newQuantity = cart[itemIndex].quantity;

        if (newQuantity < 1) {
            cart.splice(itemIndex, 1);
            newQuantity = 0;
        }

        saveCart(cart);
        renderCart();
        checkCartStatus();
    }

    return newQuantity;
}
window.changeProductQuantity = changeProductQuantity;
// For saving cart function
function checkCartStatus() {
    const currentCart = getCart();
    const currentCartString = JSON.stringify(currentCart);
    
    if (currentCart.length === 0) {
        updateSaveButtonState(false);
        return;
    }

    if (currentCartString !== lastSavedCartString) {
        updateSaveButtonState(false); // Cart has changed, can save again
    } else {
        updateSaveButtonState(true); // Cart is the same
    }
}

document.addEventListener('authStatusReady', (e) => {
    const detail = e.detail || {};
    currentUserId = detail.userId;
    console.log("authStatusReady: currentUserId =", currentUserId);
    checkCartStatus();
});

// Additon of event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    const cartContainer = document.getElementById('cart-list-container');
    
    if (cartContainer) {
        cartContainer.addEventListener('click', (event) => {
            const target = event.target;
            // Read productId from the button that has data-id
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

    const saveButton = document.querySelector('.save-cart-button');
    const nameInput = document.querySelector('.save-cart input[placeholder="Lisage ostukorvile nimi"]');

    if (saveButton && nameInput) {
        saveButton.addEventListener('click', () => {
            const cartName = nameInput.value.trim();
            saveCurrentCart(cartName, currentUserId)
                .then((success) => {
                    if (success) {
                        lastSavedCartString = localStorage.getItem(CART_STORAGE_KEY);
                        updateSaveButtonState(true);
                        nameInput.value = '';
                    }
                });
        });
    }

    
    const emptyCartButton = document.querySelector('.empty-cart-button');
    if (emptyCartButton) {
        emptyCartButton.addEventListener('click', () => {
            // If user clicks OK then confirm returns true
            if (confirm("Oled kindel, et soovid kogu ostukorvi tühjendada?")) {
                emptyCart();
                alert("Ostukorv tühjendatud!");
            }
        });
    }
});
// Empty the cart function
function emptyCart() {
    // Deletes data from localStorage
    localStorage.removeItem(CART_STORAGE_KEY);
    renderCart();
    checkCartStatus();
}

// Function to save cart with users id and save them to firestore
function saveCurrentCart(cartName, userId) {
    console.log("saveCurrentCart käivitati. userId =", userId, "cartName =", cartName);
    console.log("Kasutaja ID salvestamisel:", userId);
    if (!userId) {
        alert("Salvestamiseks pead olema sisse logitud!");
        return false;
    }
    if (!cartName) {
        alert("Palun sisesta ostukorvile nimi.");
        return false;
    }

    const currentCart = getCart(); // Take data from the current cart
    if (currentCart.length === 0) {
        alert("Ostukorv on tühi, salvestamine ebaõnnestus.");
        return false;
    }

    // To save data to database
    const cartData = {
        userId: userId,
        name: cartName,
        items: currentCart,
        totalItems: currentCart.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (!db) {
        console.error("Firebase Firestore pole laetud.");
        alert("Viga: Andmebaasi ei saa kasutada");
        return false;
    }
    // Use userId and cartName to make a unique document
    const docRef = db.collection(saved_carts).doc(`${userId}_${cartName}`);
    return docRef.set(cartData, { merge: true })
    .then(() => {
        console.log("Ostukorv salvestatud.");
        return true;
    })

    .catch((error) => {
            console.error("Viga ostukorvi salvestamisel:", error);
            alert("Viga: Ostukorvi salvestamine ebaõnnestus.");
            return false;
        });
}
// Function to change button after saving cart
function updateSaveButtonState(isSaved = false) {
    const button = document.querySelector('.save-cart-button');
    const img = button ? button.querySelector('img') : null;

    if (button && img) {
        if (isSaved) {
            button.textContent = ' Ostukorv salvestatud';
            img.src = '/images/filled_heart.png';
            button.prepend(img);
            button.classList.add('saved-state');
        } else {
            button.textContent = ' Salvesta ostukorv';
            img.src = '/images/empty_heart.png';
            button.prepend(img);
            button.classList.remove('saved-state');
        }
    }
}
window.addToCart = addToCart;