import { addToCart, changeProductQuantity } from '/scripts/shopping-cart.js';
// Global variable to store all fetched products
let allProducts = [];
let displayedProducts = [];
let currentCount = 0;
// Products loaded to page at a time
const BATCH_SIZE = 15;


function createProductPage(thisProductId) {
  window.location.href = `product.html?id=${thisProductId}`;
}
/**
* Function to create the HTML card for a single product
* @param {string} product - product object from database
* @returns {HTMLElement} - The fully constructed product card div.
*/
function createProductCard(product) {
    // product.id is the Firestore document ID
    // product.data is the dictionary of fields (name, price, calories, etc.)

    const card = document.createElement("div");
    card.classList.add("product-card");
    card.setAttribute('data-product-id', product.id);

    const image = document.createElement("img");
    image.src = product.data.imageUrl;
    image.alt = product.data.name;
    image.classList.add("product-image");
    image.style = "height: 203px";
    image.onclick = () => createProductPage(card.getAttribute('data-product-id'));

    const title = document.createElement("div");
    title.classList.add("product-title");
    title.textContent = product.data.name;
    title.onclick = () => createProductPage(card.getAttribute('data-product-id'));

    const price = document.createElement("div");
    price.classList.add("product-price");
    price.textContent = product.data.price + " €";

    const removeButton = document.createElement("button");
    removeButton.classList.add("product-amount-button");
    removeButton.textContent = "-";
    removeButton.value = -1;
    removeButton.onclick = () => {
        const productId = card.getAttribute('data-product-id');
        const newQuantity = changeProductQuantity(productId, -1);
        quantity.textContent = newQuantity;
    };


    const addButton = document.createElement("button");
    addButton.classList.add("product-amount-button");
    addButton.textContent = "+";
    addButton.value = 1;
    addButton.onclick = () => {
        // Find item from allProducts
    const product = allProducts.find(p => p.id === card.getAttribute('data-product-id'));
        if (product) {
            const newQuantity = addToCart(product, 1); // Add one of item to cart on click
            quantity.textContent = newQuantity;
        }
    };

    const quantity = document.createElement("div");
    quantity.classList.add("product-quantity");
    quantity.textContent = 0;
    quantity.id = product.id;
    quantity.value = 0;

    const buttonAndQuantityContainer = document.createElement("div");
    buttonAndQuantityContainer.classList.add("button-and-quantity-container");

    buttonAndQuantityContainer.appendChild(removeButton);
    buttonAndQuantityContainer.appendChild(quantity);
    buttonAndQuantityContainer.appendChild(addButton);

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(buttonAndQuantityContainer);

    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartItem = cart.find(item => item.id === product.id);
    const initialQuantity = cartItem ? cartItem.quantity : 0;
    quantity.textContent = initialQuantity;

    return card;
}

function renderNextBatch() {
    const container = document.getElementById("products-container");
    
    // Grab the next batch (e.g., 0-30, then 30-60)
    const batch = displayedProducts.slice(currentCount, currentCount + BATCH_SIZE);

    batch.forEach(product => {
        container.appendChild(createProductCard(product));
    });

    currentCount += batch.length;
}

const observer = new IntersectionObserver((entries) => {
    // If watcher is visible and haven't shown all products yet
    if (entries[0].isIntersecting && currentCount < displayedProducts.length) {
        renderNextBatch();
    }
}, { rootMargin: "200px" }); // Triggers loading 200px before the bottom

/**
 * Sorts the products based on the filter value and renders them.
 * @param {string} filterValue - The value from the select element (e.g., 'hind-less').
 */
function sortAndRenderProducts(filterValue) {
    let result = [...allProducts]; // Copy original list

    const allCheckbox = document.getElementById('all');
    const selectedTypes = getSelectedTypes(); // Get list of checked categories (e.g., ['liha'])

    // FILTERING LOGIC
    if (allCheckbox && allCheckbox.checked) {
        // CASE 1 - "All" is checked. 
        // Do nothing, show all products.
    } 
    else if (selectedTypes.length > 0) {
        // CASE 2 - Specific categories are checked.
        result = result.filter(product => {
            const productType = product.data["type"] || ""; 
            return selectedTypes.includes(productType);
        });
    } 
    else {
        // CASE 3 - "All" is unchecked AND no categories are checked.
        // Show nothing.
        result = [];
    }

    // SORTING LOGIC
    const [field, direction] = filterValue.split('-');
    
    result.sort((a, b) => {
        if (field === 'popular') return 0; 
        
        const valA = Number(a.data[field]);
        const valB = Number(b.data[field]);

        if (direction === 'less') return valA - valB;
        if (direction === 'more') return valB - valA;
        return 0; 
    });

    displayedProducts = result; 
    currentCount = 0;
    
    const container = document.getElementById("products-container");
    container.innerHTML = '';
    renderNextBatch();
}


// INITIAL FETCH AND SETUP

db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((product) => {
        allProducts.push({
            id: product.id,
            data: product.data()
        });
    });

    // Run the setup
    initializeFilters();

    // Initial Render
    const initialFilter = document.getElementById("product-filters").value;
    sortAndRenderProducts(initialFilter);

    // Start Scroll Watcher
    const watcher = document.getElementById("scroll-watcher");
    if (watcher) observer.observe(watcher);
});


const allCheckbox = document.getElementById('all');
// Targets all category checkboxes using the name attribute
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');

function openNav() {
  document.getElementById("sortSidebar").style.width = "250px";
}

function closeNav() {
  document.getElementById("sortSidebar").style.width = "0";
}

// Logic for All Category Checkboxes
allCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    
    // Force all other boxes to match "All"
    categoryCheckboxes.forEach(cb => {
        cb.checked = isChecked;
        updateVisualState(cb);
    });
    
    updateVisualState(this);

    triggerSort(); 
});

// Logic for Individual Category Checkboxes
categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', function() {
        updateVisualState(this);

        // Check if we need to toggle the "All" box (all checkboxes but "all" must be checked")
        const total = categoryCheckboxes.length;
        const checkedCount = getSelectedTypes().length;

        if (checkedCount === total) {
            allCheckbox.checked = true;
        } else {
            // If even one is unchecked, "All" must be unchecked
            allCheckbox.checked = false;
        }
        updateVisualState(allCheckbox);

        triggerSort();
    });
});

function triggerSort() {
    const filterVal = document.getElementById("product-filters").value;
    sortAndRenderProducts(filterVal);
}

/**
 * Toggles the 'active-filter' CSS class on the label assigned to the checkbox.
 * @param {HTMLElement} checkbox The input element that was changed.
 */
function updateVisualState(checkbox) {
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    if (!label) return;

    if (checkbox.checked) {
        label.classList.add('active-filter');
    } else {
        label.classList.remove('active-filter');
    }
}

function getSelectedTypes() {
    return Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value); 
}

function initializeFilters() {
    // Apply visual classes to whatever is checked in HTML by default
    if (allCheckbox) updateVisualState(allCheckbox);
    categoryCheckboxes.forEach(cb => updateVisualState(cb));

    // Dropdown sort change
    const filterElement = document.getElementById("product-filters");
    if (filterElement) {
        filterElement.addEventListener('change', (event) => {
            sortAndRenderProducts(event.target.value);
        });
    }
}