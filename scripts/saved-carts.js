import {showModal, modalConfirm} from '/scripts/notifications-on-pages.js';
const saved_carts_collection = 'savedCarts';
let currentUserId = null;
 const dbRef = (typeof window !== 'undefined' && window.db) ? window.db
            : (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore()
            : null;

function loadCarts(cartData) {
    const mainContainer = document.querySelector('.main-content');
    const cartWrapper = document.createElement('div');
    const docId = cartData.id; 
    const calculatedTotal = cartData.items ? cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    if (!mainContainer) {
        console.error("loadCarts: .main-content not found.");
        return;
    }
    cartWrapper.className = 'cart-wrapper';
    cartWrapper.innerHTML = `
            <div class="cart-container" data-cart-doc-id="${docId}">
            <span class="cart-name">${cartData.name || 'Nimetu ostukorv'}</span>
            <div class="cart-actions">
                <button class="remove-cart">
                    Eemalda ostukorv
                    <img src="/images/trash.png" alt="remove-cart-icon">
                </button>
                <span class="cart-price">${calculatedTotal.toFixed(2)}€</span>
            </div>
        </div>

        <div class="dropdown-hidden hidden">
            <ul>
                ${cartData.items ? cartData.items.map(item => 
                    `<li>${item.name} (${item.quantity}x) - ${(item.price * item.quantity).toFixed(2)}€</li>`
                ).join('') : '<li>Ostukorv on tühi.</li>'}
            </ul>
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
        const querySnapshot = await db.collection(saved_carts_collection)
                                      .where("userId", "==", currentUserId)
                                      .get();
        console.log("Query successful. Documents found:", querySnapshot.size);
        
        if (querySnapshot.empty) {
            mainContent.innerHTML += "<p style='text-align:center;'>Sul ei ole ühtegi salvestatud ostukorvi.</p>";
            return;
        }
    
    querySnapshot.forEach((doc) => {
        const cartData = doc.data();
        cartData.id = doc.id; 
        loadCarts(cartData);
    });
    attachEventListeners();
    } catch (error) {
        console.error("Viga ostukorvide laadimisel:", error);
        mainContent.innerHTML += "<p>Viga andmete laadimisel. Proovige hiljem uuesti.</p>";
    }
}

function attachEventListeners() {
    document.querySelectorAll('.cart-container').forEach(container => {
        container.addEventListener('click', (event) => {
            // Prevent the click from triggering if the remove button was pressed
            if (event.target.closest('.remove-cart')) {
                return;
            }
            const parentWrapper = container.closest('.cart-wrapper');
            const dropdown = parentWrapper.querySelector('.dropdown-hidden');
            // Toggle dropdown
            dropdown.classList.toggle('hidden');
            container.classList.toggle('active');
        });
    });

    // remove button functionality
    document.querySelectorAll('.remove-cart').forEach(button => {
        button.addEventListener('click', async (event) => {
            // Stop the click from opening the dropdown
            event.stopPropagation();
            const cartContainer = event.target.closest('.cart-container');
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
        await db.collection(saved_carts_collection).doc(docId).delete(); 
        console.log(`Ostukorv ${docId} edukalt eemaldatud.`);
        return true;
    } catch (error) {
        console.error("Viga ostukorvi eemaldamisel:", error);
        alert("Viga: Ostukorvi eemaldamine ebaõnnestus.");
        return false;
    }
}
// Start fetching carts only when the user's auth status is known (Unchanged)
document.addEventListener('authStatusReady', (e) => {
    const detail = e.detail || {};
    currentUserId = detail.userId;
    console.log("authStatusReady: currentUserId =", currentUserId);
    fetchUserCarts(currentUserId)
});