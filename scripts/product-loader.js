function getRecipeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); 
}

const productId = getRecipeIdFromUrl()
const db = firebase.firestore();

var productRef = db.collection("products").doc(productId);

productRef.get().then((doc) => {
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
   calories.textContent = doc.data()["calories"] + " kcal"

   const carbs = document.getElementById("carbs")
   carbs.textContent = doc.data()["carbs"] + " g"

   const proteins = document.getElementById("proteins")
   proteins.textContent = doc.data()["proteins"] + " g"

   const fats = document.getElementById("fats")
   fats.textContent = doc.data()["fats"] + " g"

   const storing = document.getElementById("storing");
   storing.textContent = doc.data()["storing"]
});
