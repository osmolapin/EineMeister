function getRecipeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getRecipeTypeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('type'); 
}

const recipeType = getRecipeTypeFromUrl();
const recipeId = getRecipeIdFromUrl();


// Define Promises for both potential recipe collections (submitted and approved)
const submittedRefPromise = db.collection("submittedRecipes").doc(recipeId).get();
const approvedRefPromise = db.collection("recipes").doc(recipeId).get();


// Use Promise.all to handle both query results and determine the correct document
Promise.all([submittedRefPromise, approvedRefPromise])
    .then(([submittedDoc, approvedDoc]) => {
        let doc;

        
        // If type is 'submitted' or 'example', and the submitted document exists.
        if ((recipeType === "submitted" || recipeType === "example") && submittedDoc.exists) {
            doc = submittedDoc;
        // If type is 'approved', and the approved document exists.
        } else if (recipeType === "approved" && approvedDoc.exists) {
            doc = approvedDoc;
            
        // If type is missing or the explicit match failed, check both collections.

        } else if (approvedDoc.exists) {
            doc = approvedDoc;
        // Then check the Submitted/Draft version (submittedRecipes).
        } else if (submittedDoc.exists) {
            doc = submittedDoc;
        } else {
            // Document not found in either collection (critical error)
            console.error("Recipe not found in either submittedRecipes or recipes collection.");
            document.body.innerHTML = "<h1>Viga: Retsepti ei leitud.</h1>";
            return;
        }
        
        const data = doc.data(); 

        if (recipeType == "example") {
            let back = document.getElementById("backbutton");
            if (back) {
                back.href = "/pages/my-recipes.html"
            }
        }
        
        const imageElement = document.getElementById("recipe-image");
        imageElement.src = data["imageUrl"] || '/images/default-recipe.jpg';

        const title = document.getElementById("recipe-title");
        title.textContent = data["name"] || 'Nimetu retsept';

        const price = document.getElementById("recipe-price");
        price.textContent = (data["price"] !== undefined ? parseFloat(data["price"]).toFixed(2) : 'N/A') + " €";

        const description = document.getElementById("description");
        description.textContent = data["description"] || 'Kirjeldus puudub.';

        const instructions = document.getElementById("instructions");
        instructions.textContent = data["instructions"] || 'Valmistamisjuhised puuduvad.';

        const ingredients = document.getElementById("ingredients");
        

        const arrayOfIngredients = (data["ingredients"] || "").split(","); 

        const productPromises = [];


        for (var i = 0; i < arrayOfIngredients.length; i += 2) {
            const portion = arrayOfIngredients[i]; 
            const productId = arrayOfIngredients[i + 1]; 

            if (!productId) continue; 

            // Create a Promise for fetching each product detail
            const promise = db.collection("products").doc(productId).get().then((productDoc) => {
                if (productDoc.exists) {
                    const productData = productDoc.data();
                    // Return the necessary details as an array
                    return [portion, productData["name"], productData["imageUrl"], productData["price"], productDoc.id];
                } else {
                    return [portion, "Toodet ei leitud", null, 0, null]; // Product not found fallback
                }
            });

            productPromises.push(promise);
        }

        // Wait for ALL product detail Promises to complete
        return Promise.all(productPromises)
            .then((finalProductsList) => {
                ingredients.innerHTML = ''; // Clear existing content
                
                finalProductsList.forEach(([portion, element, productImage, productPrice, productId]) => {
                    
                    const finalImage = productImage || '/images/default-product.jpg'; 
                    
                    const productHolder = document.createElement('div');
                    const content = document.createElement("p");
                    const portionSize = document.createElement("p");
                    const image = document.createElement("img");
                    const checkboxElement = document.createElement("input");
                    const productTextElement = document.createElement("div");

                    image.src = finalImage;
                    image.classList.add("product-image");

                    content.textContent = element;
                    content.classList.add("product-info");

                    portionSize.textContent = portion;
                    portionSize.classList.add("product-portion");

                    checkboxElement.type = "checkbox";
                    checkboxElement.classList.add("product-checkbox");
                    checkboxElement.checked = true;

                    checkboxElement.setAttribute('data-product-id', productId);
                    checkboxElement.setAttribute('data-product-name', element);
                    checkboxElement.setAttribute('data-product-price', productPrice);
                    checkboxElement.setAttribute('data-product-image-url', finalImage);

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
            .then(() => data); 
    })
    .then((data) => {
        // If data is null/undefined (because the recipe wasn't found), stop execution
        if (!data) return; 


        const calories = document.getElementById("calories")
        calories.textContent = "Kalorid " + (data["calories"] || 0) + " kcal"

        const carbs = document.getElementById("carbs")
        carbs.textContent = "Süsivesikud " + (data["carbs"] || 0) + " g"

        const proteins = document.getElementById("proteins")
        proteins.textContent = "Valgud " + (data["proteins"] || 0) + " g"

        const fats = document.getElementById("fats")
        fats.textContent = "Rasvad " + (data["fats"] || 0) + " g"
    })
    .catch((error) => { 
        // Catch any network or general Firestore errors
        console.error("Error retrieving recipe document:", error);
        document.body.innerHTML = "<h1>Viga: Retsepti laadimisel tekkis võrguprobleem.</h1>";
    });