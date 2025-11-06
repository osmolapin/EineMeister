const db = firebase.firestore();
// Global variable to store all fetched products
let allProducts = [];

/**
 * 
 * @param {string} thisProductId - Product ID i.e '0NyO0AKRArvNeszw4giY'
 * @param {int} type - 1 = increment value, -1 = decrement value
 */
function changeProductQuantity(thisProductId, type) {
  // The product's unique identifier (product.id) is assigned as the key for the on-screen quantity element
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
    removeButton.onclick = () => changeProductQuantity(card.getAttribute('data-product-id'), removeButton.value);

    const addButton = document.createElement("button");
    addButton.classList.add("product-amount-button");
    addButton.textContent = "+";
    addButton.value = 1;
    addButton.onclick = () => changeProductQuantity(card.getAttribute('data-product-id'), addButton.value);

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

// Add product to cart function
function addProductToCart (thisProductId) {
    const quantityElement = document.getElementById(thisProductId);
    const quantityToAdd = Number(quantityElement. textContent);

    if (quantityToAdd <= 0) {
        alert("Please select at least one item to add to the cart.");
        return;
    }
    // Finding full product data using the global array
    const productData = allProducts.find(p => p.id === thisProductId);

    if (!productData) {
        console.error("Product data not found for ID:", thisProductId);
        return;
    }

    // Assumes getCart() is available globally
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === thisProductId);
    
    // structure the item for cart(make sure it includes all what renderCart needs)
    const itemToSave = {
        id: productData.id,
        name: productData.data.name,
        price: productData.data.price,
        imageUrl: productData.data.imageUrl
};

if(itemIndex > 0) {
    cart[itemIndex].quantity += quantityToAdd;
} else {
    // if product is new, add it
    cart.push({ ...itemToSave, quantity: quantityToAdd });
}
saveCart(cart); // Assumes saveCart() is available globally
alert('{quantityToAdd} x {itemToSave}.name added to cart!');
}