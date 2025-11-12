function getRecipeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); 
}

const recipeId = getRecipeIdFromUrl()
const db = firebase.firestore();

var recipeRef = db.collection("recipes").doc(recipeId);


recipeRef.get().then((doc) => {
    const imageElement = document.getElementById("recipe-image");
    imageElement.src = doc.data()["imageUrl"];

    const title = document.getElementById("recipe-title");
    title.textContent = doc.data()["name"];

    const price = document.getElementById("recipe-price");
    price.textContent = doc.data()["price"] + " €";

    const description = document.getElementById("description");
    description.textContent = doc.data()["description"]

    const instructions = document.getElementById("instructions");
    instructions.textContent = doc.data()["instructions"]

    const ingredients = document.getElementById("ingredients");
    // Getting ingredients names from database
    arrayOfIngredients = doc.data()["ingredients"].split(",");

    const productPromises = [];

    // Loop and create all the promises
    for (var i = 0; i < arrayOfIngredients.length; i += 2) {
        const portion = arrayOfIngredients[i]; // The portion of the product i.e 1 viil, 20g...
        const productId = arrayOfIngredients[i + 1]; // The id of the product in database

        // Create the promise and push it to the array.
        // We use .then() to transform the raw Firestore document 
        // into the final string format immediately.
        const promise = db.collection("products").doc(productId).get().then((productDoc) => {
            if (productDoc.exists) {
                return portion + " " + productDoc.data()["name"];
            } else {
                return portion + " (Product not found)";
            }
        });

        productPromises.push(promise);
    }

    // Wait for ALL promises to complete
    Promise.all(productPromises)
        .then((finalProductsList) => {
            
            // Add all the data in the finalProductsList to the page
            finalProductsList.forEach(element => {
                const listItem = document.createElement('li');
                listItem.textContent = element;
                ingredients.appendChild(listItem);
            });
        })
        .catch((error) => {
            // Handle any error that occurred during the fetching process
            console.error("Error fetching ingredient details:", error);
            ingredients.textContent = "Error loading ingredients.";
        });

    const calories = document.getElementById("calories")
    calories.textContent = "Kalorid " + doc.data()["calories"] + " kcal"

    const carbs = document.getElementById("carbs")
    carbs.textContent = "Süsivesikud " + doc.data()["carbs"] + " g"

    const proteins = document.getElementById("proteins")
    proteins.textContent = "Valgud " + doc.data()["proteins"] + " g"

    const fats = document.getElementById("fats")
    fats.textContent = "Rasvad " + doc.data()["fats"] + " g"
});
