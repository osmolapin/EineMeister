import {showModal, modalConfirm} from '/scripts/notifications-on-pages.js';
const saved_carts_collection = 'savedCarts';
let currentUserId = null;
 const dbRef = (typeof window !== 'undefined' && window.db) ? window.db
            : (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore()
            : null;

async function loadCarts(cartData) {
    const mainContainer = document.querySelector('.main-content');
    const cartWrapper = document.createElement('div');
    const docId = cartData.id; 
    const calculatedTotal = cartData.items ? cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    
    if (!mainContainer) {
        console.error("loadCarts: .main-content not found.");
        return;
    }
    
    let itemImageHtml = `<i class="fas fa-shopping-basket"></i>`;

    
    cartWrapper.className = 'cart-wrapper';
    cartWrapper.innerHTML = `
        <div class="cart-container" data-cart-doc-id="${docId}">

            <div class="cart-icon-col">
                ${itemImageHtml}
            </div>

            <span class="cart-name">${cartData.name || 'Nimetu ostukorv'}</span>

            <div class="cart-actions">
                <button class="remove-cart">
                    <img src="/images/trash.png" alt="Eemalda">
                    <span>Eemalda</span>
                </button>
                <span class="cart-price">${calculatedTotal.toFixed(2)}€</span>
            </div>
        </div>
        
        <div class="dropdown-hidden hidden">
            <div class="product-header">
                <span class="product-name-col">Toode</span>
                <span class="product-qty-col">Kogus</span>
                <span class="product-price-col">Hind</span>
            </div>
            
            <div class="product-list">
                ${cartData.items && cartData.items.length > 0 ? cartData.items.map(item => 
                    `<div class="product-item">
                        <span class="product-name-col">${item.name}</span>
                        <span class="product-qty-col">${item.quantity}x</span>
                        <span class="product-price-col">${(item.price * item.quantity).toFixed(2)}€</span>
                    </div>`
                ).join('') : '<p class="empty-cart-message">Ostukorv on tühi.</p>'}
            </div>
        </div>
     `;

    mainContainer.appendChild(cartWrapper);
}

async function fetchUserCarts(currentUserId) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error("Main content container not found.");
        return;
    }
    const existingHeader = mainContent.querySelector('h1') ? mainContent.querySelector('h1').outerHTML : '';
    mainContent.innerHTML = existingHeader;
    if (!currentUserId) {
        console.error("User not logged in.")
        mainContent.innerHTML += "<p style='text-align:center;'>Palun logi sisse, et oma ostukorve näha.</p>";
        return;
    }
    if (!dbRef) {
        console.error("fetchUserCarts: Firestore (dbRef) not available.");
        mainContent.innerHTML += "<p>Viga: Andmebaasi ei saa kasutada.</p>";
        return;
    }
    console.log("Attempting to fetch carts for userId:", currentUserId);
    try{
        const querySnapshot = await dbRef.collection(saved_carts_collection)
                                 .where("userId", "==", currentUserId)
                                 .get();
        console.log("Query successful. Documents found:", querySnapshot.size);
        
        if (querySnapshot.empty) {
            mainContent.innerHTML += "<p style='text-align:center;'>Sul ei ole ühtegi salvestatud ostukorvi.</p>";
            return;
        }

    const cartLoadPromises = [];
    querySnapshot.forEach((doc) => {
        const cartData = doc.data();
        cartData.id = doc.id; 
        cartLoadPromises.push(loadCarts(cartData));
    });
    await Promise.all(cartLoadPromises);
    attachEventListeners();
    } catch (error) {
        console.error("Viga ostukorvide laadimisel:", error);
        mainContent.innerHTML += "<p>Viga andmete laadimisel. Proovige hiljem uuesti.</p>";
    }
}

function attachEventListeners() {
    

    document.querySelectorAll('.cart-container').forEach(container => {
        container.addEventListener('click', (event) => {

            if (event.target.closest('.remove-cart')) {
                return;
            }
            
            const parentWrapper = container.closest('.cart-wrapper');
            const dropdown = parentWrapper.querySelector('.dropdown-hidden');
            

            if (dropdown) { 
                dropdown.classList.toggle('hidden');
                container.classList.toggle('active');
            } else {
                console.warn("Dropdown element (.dropdown-hidden) not found for this cart.");
            }
        });
    });


    document.querySelectorAll('.remove-cart').forEach(button => {
        button.addEventListener('click', async (event) => {
            
            event.stopPropagation();
            
            const cartContainer = event.target.closest('.cart-container');
            

            if (!event.target.closest('.remove-cart')) {

                return;
            }

            const cartName = cartContainer.querySelector('.cart-name').textContent;
            const docId = cartContainer.dataset.cartDocId;

            if (!docId) {
                console.error("Viga: Ostukorvi ID puudub kustutamiseks.");
                return;
            }

            const confirmed = await modalConfirm(
                "Kinnita eemaldamine",
                `Oled kindel, et soovid ostukorvi "${cartName}" eemaldada?`
            );
            
            if (confirmed) {
                const success = await deleteCart(docId);
                if (success) {
                    cartContainer.closest('.cart-wrapper').remove();
                    showModal(`Ostukorv "${cartName}" edukalt eemaldatud!`, " ");
                }
            }
        });
    });
}

async function deleteCart(docId) {
    
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.error("Firebase Firestore pole laetud.");
        alert("Viga: Andmebaasi ei saa kasutada kustutamiseks.");
            return false;
        }
    try {
        await dbRef.collection(saved_carts_collection).doc(docId).delete();
        console.log(`Ostukorv ${docId} edukalt eemaldatud.`);
        return true;
    } catch (error) {
        console.error("Viga ostukorvi eemaldamisel:", error);
        alert("Viga: Ostukorvi eemaldamine ebaõnnestus.");
        return false;
    }
}

document.addEventListener('authStatusReady', (e) => {
    const detail = e.detail || {};
    currentUserId = detail.userId;
    console.log("authStatusReady: currentUserId =", currentUserId);
    fetchUserCarts(currentUserId)
});