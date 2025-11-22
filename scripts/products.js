
// Global variable to store all fetched products
let allProducts = [];

/**
 * 
 * @param {string} thisProductId - Product ID i.e '0NyO0AKRArvNeszw4giY'
 * @param {int} type - 1 = increment value, -1 = decrement value
 */


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

    // Clear the current container content
    const container = document.getElementById("products-container");
    container.innerHTML = '';

    // Append the sorted products
    sortedProducts.forEach(product => {
        container.appendChild(createProductCard(product));
    });
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
});