
// Global variable to store all fetched products
let allProducts = [];
let displayedProducts = [];
let currentCount = 0;
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
    image.src = product.data.imageUrl; // Access data directly
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
        addToCart(product, 1); // Add one of item to cart on click
        quantity.textContent = Number(quantity.textContent) + 1;
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
    let sortedProducts = [...allProducts]; // Create a shallow copy to sort

    // Determine the field and sort direction
    const [field, direction] = filterValue.split('-');
    
    sortedProducts.sort((a, b) => {
        let valA, valB;

        // Default orientation from database if 'popular'
        if (field === 'popular') return 0; 
        
        // Convert the values to numbers for comparison
        valA = Number(a.data[field]);
        valB = Number(b.data[field]);

        if (direction === 'less') {
            // Ascending (A - B)
            return valA - valB;
        } else if (direction === 'more') {
            // Descending (B - A)
            return valB - valA;
        }
        return 0; // Default case
    });

    const container = document.getElementById("products-container");
    container.innerHTML = ''; // Clear current items

    // 1. Save the result to our global variable
    displayedProducts = sortedProducts;
    
    // 2. Reset the counter
    currentCount = 0;

    // 3. Render the first batch immediately
    renderNextBatch();


}


// INITIAL FETCH AND SETUP

db.collection("products").get().then((querySnapshot) => {
    // 1. Store all products in the global array
    querySnapshot.forEach((product) => {
        allProducts.push({
            id: product.id,
            data: product.data()
        });
    });

    // Initial render (using the default filter/order)
    const initialFilter = document.getElementById("product-filters").value;
    sortAndRenderProducts(initialFilter);

    // Attach event listener to the filter
    const filterElement = document.getElementById("product-filters");
    filterElement.addEventListener('change', (event) => {
        sortAndRenderProducts(event.target.value);
    });

    const watcher = document.getElementById("scroll-watcher");
    if (watcher) observer.observe(watcher);
});