function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function addDocument(collection, dataObject) {
    db.collection(collection).add({
        imageUrl: dataObject.imageUrl,
        calories: dataObject.calories,
        description: dataObject.description,
        fats: dataObject.fats,
        name: dataObject.name,
        price: dataObject.price,
        ingredients: dataObject.ingredients,
        proteins: dataObject.proteins,
        carbs: dataObject.carbs,
        instructions: dataObject.instructions,
        userId: dataObject.userId
    });
}
function extractInfoFromDocument(collection, id) {
    return db.collection(collection).doc(id).get().then((doc) => {
        if (!doc.exists) {
            console.error("Document not found for ID:", id);
            return null;
        }

        return {
            imageUrl: doc.data()["imageUrl"],
            calories: doc.data()["calories"],
            description: doc.data()["description"],
            fats: doc.data()["fats"],
            name: doc.data()["name"],
            price: doc.data()["price"],
            ingredients: doc.data()["ingredients"],
            proteins: doc.data()["proteins"],
            carbs: doc.data()["carbs"],
            instructions: doc.data()["instructions"],
            userId: doc.data()["userId"]
        };
    });
}

function deleteDocument(collection, id) {
    db.collection(collection).doc(id).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}

function confirmRecipe(id) {
    extractInfoFromDocument("submittedRecipes", id)
        .then(dataObject => {
            // This block only runs after data has been fetched

            if (dataObject) {
                addDocument("recipes", dataObject);

                deleteDocument("submittedRecipes", id);
                showToast(`Retsept kinnitatud!`, 'success');

                loadPage();
            } else {
                console.log("Confirmation failed: Recipe data not found.");
            }
        })
        .catch(error => {
            console.error("Error during recipe confirmation process:", error);
        });
}

function deleteRecipe(id) {
    deleteDocument("submittedRecipes", id)
    showToast(`Retsept kustutatud!`, 'error');
    loadPage()
}

let allRecipes = [];

function createrecipePage(thisrecipeId) {
  window.location.href = `recipe.html?id=${thisrecipeId}&type=example`;
}

/**
 * Creates the HTML card for a single recipe.
 * @param {object} recipe - An object with recipe.id and recipe.data (the fields).
 * @returns {HTMLElement} - The fully constructed recipe card div.
 */
function createRecipeCard(recipe) {
    const card = document.createElement("div");
    card.classList.add("recipe-card");
    card.setAttribute('data-recipe-id', recipe.id);

    card.innerHTML = `
        <div class="recipe-row" data-recipe-id="1">
        <div class="recipe-card">
            <div class="recipe-image">
                <a onclick="createrecipePage('${recipe.id}')"><img src="${recipe.data.imageUrl}"></a>
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.data.name}</h3>
                <p class="recipe-price">Toidukorra hind ${recipe.data.price} €</p>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <div class="nutrition-value">${recipe.data.calories} kcal</div>
                        <div class="nutrition-label">Kaloried</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${recipe.data.carbs} g</div>
                        <div class="nutrition-label">Süsivesikud</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${recipe.data.proteins}g</div>
                        <div class="nutrition-label">Valgud</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${recipe.data.fats}g</div>
                        <div class="nutrition-label">Rasvad</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="action-panel">
            <p class="submitted-by">Esitas Kasutaja</p>
            <div class="button-group">
                <button class="btn btn-confirm" onclick="confirmRecipe('${card.getAttribute('data-recipe-id')}')">Kinnita</button>
                <button class="btn btn-delete" onclick="deleteRecipe('${card.getAttribute('data-recipe-id')}')">Kustuta</button>
            </div>
        </div>
    </div>
    `;

    return card;
}

/**
 * Renders the given array of recipes to the DOM.
 * @param {Array<object>} recipesArray - The array of recipes to display.
 */
function renderRecipes(recipesArray) {
    const container = document.getElementById("recipe-container");
    container.innerHTML = '';

    recipesArray.forEach(recipe => {
        container.appendChild(createRecipeCard(recipe));
    });
}

// INITIAL FETCH AND EVENT SETUP
function loadPage() {
    allRecipes = []
    db.collection("submittedRecipes").get().then((querySnapshot) => {
        // Store all recipes in the global array
        querySnapshot.forEach((recipe) => {
            allRecipes.push({
                id: recipe.id,
                data: recipe.data()
            });
        });

        renderRecipes(allRecipes);
    });
};

loadPage();