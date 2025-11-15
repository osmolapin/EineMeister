// Global variable to store all fetched recipes
let allRecipes = [];

function createrecipePage(thisrecipeId) {
  window.location.href = `recipe.html?id=${thisrecipeId}&type=real`;
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

    const image = document.createElement("img");
    image.src = recipe.data.imageUrl;
    image.alt = recipe.data.name;
    image.classList.add("recipe-image");
    image.style.height = "203px";
    image.onclick = () => createrecipePage(card.getAttribute('data-recipe-id'));

    const title = document.createElement("div");
    title.classList.add("recipe-title");
    title.textContent = recipe.data.name;
    title.onclick = () => createrecipePage(card.getAttribute('data-recipe-id'));

    const price = document.createElement("div");
    price.innerHTML = `
    <div class="recipe-price">
        <span class="recipe-price-lable">Toidukorra hind</span>
        <span class="recipe-price-num">${recipe.data.price} €</span>
    </div>
    `;

    const extraInfo = document.createElement("div");
    extraInfo.classList.add("recipe-extra-info");
    extraInfo.innerHTML = `
        <div class="macro-item">
            <span class="macro-value">${recipe.data.calories} kcal</span>
            <span class="macro-name">Kalorid</span>
        </div>
        <div class="macro-item">
            <span class="macro-value">${recipe.data.carbs} g</span>
            <span class="macro-name">Süsivesikud</span>
        </div>
        <div class="macro-item">
            <span class="macro-value">${recipe.data.proteins} g</span>
            <span class="macro-name">Valgud</span>
        </div>
        <div class="macro-item">
            <span class="macro-value">${recipe.data.fats} g</span>
            <span class="macro-name">Rasvad</span>
        </div>
    `;

    // Assemble the Card
    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(extraInfo);

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


/**
 * Sorts the recipes based on the filter value and renders them to the DOM.
 * @param {string} filterValue - The value from the select element (e.g., 'hind-less').
 */
function sortAndRenderRecipes(filterValue) {
    let sortedRecipes = [...allRecipes]; // Create a shallow copy to sort

    // Assumes the format is FIELD-DIRECTION (e.g., 'kalorid-less')
    const [field, direction] = filterValue.split('-');

    sortedRecipes.sort((a, b) => {
        let valA, valB;

        // Default orientation from database if 'popular'
        if (field === 'popular') return 0;

        // Convert the relevant data fields to numbers for comparison
        // We use the 'field' variable (e.g., 'hind', 'kalorid', 'valgud')
        valA = Number(a.data[field]);
        valB = Number(b.data[field]);

        if (direction === 'less') {
            // Ascending sort (smaller values first: A - B)
            return valA - valB;
        } else if (direction === 'more') {
            // Descending sort (larger values first: B - A)
            return valB - valA;
        }
        return 0;
    });

    // Render the sorted list
    renderRecipes(sortedRecipes);
}


// INITIAL FETCH AND EVENT SETUP

db.collection("recipes").get().then((querySnapshot) => {
    // Store all recipes in the global array
    querySnapshot.forEach((recipe) => {
        allRecipes.push({
            id: recipe.id,
            data: recipe.data()
        });
    });

    const filterElement = document.getElementById("recipe-filters");

    // Initial render using the default selected filter
    const initialFilter = filterElement ? filterElement.value : 'popular-more';
    sortAndRenderRecipes(initialFilter);

    // Attach event listener to the filter
    if (filterElement) {
        filterElement.addEventListener('change', (event) => {
            sortAndRenderRecipes(event.target.value);
        });
    }
});