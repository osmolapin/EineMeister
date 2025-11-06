function getRecipeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); 
}

const productId = getRecipeIdFromUrl()
const db = firebase.firestore();

let currentProductData = null; 

var productRef = db.collection("products").doc(productId);

productRef.get().then((doc) => {
    // Kontrolli, kas dokument on olemas
    if (!doc.exists) {
        // Võite siin kuvada veateate
        console.error("Tootet ei leitud ID-ga:", productId);
        return;
    }
    
    // Salvesta andmed õiges formaadis enne, kui neid kasutatakse
    currentProductData = {
        id: doc.id,
        data: doc.data()
    };
    
    // Andmete lühend
    const data = doc.data();

   const imageElement = document.getElementById("product-image");
   imageElement.src = doc.data()["imageUrl"];

   const title = document.getElementById("product-title");
   title.textContent = doc.data()["name"];

   const price = document.getElementById("product-price");
   price.textContent = doc.data()["price"] + " €";

   const description = document.getElementById("description");
   description.textContent = doc.data()["description"]

   const ingredients = document.getElementById("ingredients");
   ingredients.textContent = doc.data()["ingredients"]

   const calories = document.getElementById("calories")
   calories.textContent = "Kalorid " + doc.data()["calories"] + " kcal"

   const carbs = document.getElementById("carbs")
   carbs.textContent = "Süsivesikud " + doc.data()["carbs"] + " g"

   const proteins = document.getElementById("proteins")
   proteins.textContent = "Valgud " + doc.data()["proteins"] + " g"

   const fats = document.getElementById("fats")
   fats.textContent = "Rasvad " + doc.data()["fats"] + " g"

   const storing = document.getElementById("storing");
   storing.textContent = doc.data()["storing"]

   setupAddToCartButton(currentProductData);
});

function setupAddToCartButton(productDetails) {
    const addToCartButton = document.querySelector('.add-to-cart-button');
    
    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            // Lisame vaikimisi 1 tk. Kui on koguse input, tuleks see siit lugeda.
            const quantity = 1; 
            
            // Kontrollime, kas addToCart funktsioon on olemas (laetud shopping-cart.js failist)
            if (typeof addToCart === 'function') {
                addToCart(productDetails, quantity);
            } else {
                alert("Viga: Ostukorvi lisamise funktsioon pole kättesaadav.");
            }
        });
    }
}