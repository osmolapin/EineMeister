const db = firebase.firestore();

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


db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((product) => {
        // product.id -> string of id
        // product.data() is a dictionary containing values with these keys:
        // name, description, imageUrl, price, calories, carbs, fats proteins, ingredients, storing, weight

        const card = document.createElement("div");
        card.classList.add("product-card")
        card.setAttribute('data-product-id', product.id);
        
        const image = document.createElement("img");
        image.src = product.data()["imageUrl"];
        image.alt = product.data()["name"];
        image.classList.add("product-image");
        image.style = "height: 203px"
        image.onclick = () => createProductPage(card.getAttribute('data-product-id'));
        
        const title = document.createElement("div");
        title.classList.add("product-title");
        title.textContent = product.data()["name"];
        title.onclick = () => createProductPage(card.getAttribute('data-product-id'));
        
        const price = document.createElement("div");
        price.classList.add("product-price")
        price.textContent = product.data()["price"] + " €"

        const removeButton = document.createElement("button");
        price.classList.add("product-amount-button")
        removeButton.textContent = "-"
        removeButton.value = -1;
        removeButton.onclick = () => changeProductQuantity(card.getAttribute('data-product-id'), removeButton.value);

        const addButton = document.createElement("button");
        price.classList.add("product-amount-button");
        addButton.textContent = "+";
        addButton.value = 1;
        addButton.onclick = () => changeProductQuantity(card.getAttribute('data-product-id'), addButton.value);

        const quantity = document.createElement("div");
        quantity.classList.add("product-quantity");
        quantity.textContent = 0;
        quantity.id = product.id;
        quantity.value = 0;

        const buttonAndQuantityContainer = document.createElement("div");
        quantity.classList.add("button-and-quantity-container");

        buttonAndQuantityContainer.appendChild(removeButton);
        buttonAndQuantityContainer.appendChild(quantity);
        buttonAndQuantityContainer.appendChild(addButton);
        
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(buttonAndQuantityContainer);
        document.getElementById("products-container").appendChild(card);
      });
    }); 
