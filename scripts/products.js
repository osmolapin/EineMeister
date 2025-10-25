var firebaseConfig = {
  apiKey: "AIzaSyAP-nzuF31UZbgHyc5AGsxgrNCVC1jb9hk",
  authDomain: "einemeister-84e8c.firebaseapp.com",
  projectId: "einemeister-84e8c",
  storageBucket: "einemeister-84e8c.firebasestorage.app",
  messagingSenderId: "699963249863",
  appId: "1:699963249863:web:392a4b3bbab29450d9dae2",
  measurementId: "G-5YW3F3X62G"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((product) => {
        // Product.id -> string of id
        // product.data() is a dictionary containing values with these keys:
        // name, description, imageUrl, price, calories, carbs, fats proteins, ingredients, storing, weight

        const card = document.createElement("div");
        card.classList.add("product-card")
        
        const image = document.createElement("img");
        image.src = product.data()["imageUrl"];
        image.alt = product.data()["name"];
        image.classList.add("product-image");
        image.style = "height: 203px"
        
        const title = document.createElement("div");
        title.classList.add("product-title");
        title.textContent = product.data()["name"];
        
        const price = document.createElement("div");
        price.classList.add("product-price")
        price.textContent = product.data()["price"] + " €"

        const removeButton = document.createElement("button");
        price.classList.add("product-amount-button")
        removeButton.textContent = "-"

        const addButton = document.createElement("button");
        price.classList.add("product-amount-button");
        addButton.textContent = "+";

        const quantity = document.createElement("div");
        quantity.classList.add("product-quantity");
        quantity.textContent = 0

        
        card.appendChild(image)
        card.appendChild(title)
        card.appendChild(price)
        card.appendChild(removeButton)
        card.appendChild(quantity)
        card.appendChild(addButton)

        document.getElementById("products-container").appendChild(card)
      });
    }); 