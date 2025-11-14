function getRecipeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

const recipeId = getRecipeIdFromUrl()
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
                return [portion, productDoc.data()["name"], productDoc.data()["imageUrl"]];
            } else {
                return portion + " (Product not found)";
            }
        });

        productPromises.push(promise);
    }

    // Wait for ALL promises to complete
    Promise.all(productPromises)
    .then((finalProductsList) => {
        finalProductsList.forEach(([portion, element, productImage]) => {


            const productHolder = document.createElement('div');
            const content = document.createElement("p");
            const portionSize = document.createElement("p");
            const image = document.createElement("img");
            const checkboxElement = document.createElement("input");
            const productTextElement = document.createElement("div");

            image.src = productImage;
            image.classList.add("product-image");

            content.textContent = element;
            content.classList.add("product-info");

            portionSize.textContent = portion;
            portionSize.classList.add("product-portion");

            checkboxElement.type = "checkbox";
            checkboxElement.classList.add("product-checkbox");
            checkboxElement.checked = true;

            productHolder.classList.add("product-container");

            productTextElement.classList.add("product-details");

            productTextElement.appendChild(portionSize);
            productTextElement.appendChild(content);

            productHolder.appendChild(image);
            productHolder.appendChild(productTextElement);
            productHolder.appendChild(checkboxElement);
            
            ingredients.appendChild(productHolder);
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
