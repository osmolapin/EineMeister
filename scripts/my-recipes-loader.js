function createrecipePage(thisrecipeId) {
  window.location.href = `recipe.html?id=${thisrecipeId}&type=example`;
}

document.addEventListener('DOMContentLoaded', () => {
    const recipeContainer = document.querySelector('.recipe-container');
    const loadingMessage = document.getElementById('loading-message');


    const createRecipeCard = (recipeData, recipeId) => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");
        card.setAttribute('data-recipe-id', recipeId);

        const image = document.createElement("img");
        image.src = recipeData.imageUrl;
        image.alt = recipeData.name;
        image.classList.add("recipe-image");
        image.style.height = "203px";
        image.onclick = () => createrecipePage(card.getAttribute('data-recipe-id'));

        const title = document.createElement("div");
        title.classList.add("recipe-title");
        title.textContent = recipeData.name;
        title.onclick = () => createrecipePage(card.getAttribute('data-recipe-id'));

        const price = document.createElement("div");
        price.innerHTML = `
        <div class="recipe-price">
            <span class="recipe-price-lable">Toidukorra hind</span>
            <span class="recipe-price-num">${recipeData.price} €</span>
        </div>
        `;

        const extraInfo = document.createElement("div");
        extraInfo.classList.add("recipe-extra-info");
        extraInfo.innerHTML = `
            <div class="macro-item">
                <span class="macro-value">${recipeData.calories} kcal</span>
                <span class="macro-name">Kalorid</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${recipeData.carbs} g</span>
                <span class="macro-name">Süsivesikud</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${recipeData.proteins} g</span>
                <span class="macro-name">Valgud</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${recipeData.fats} g</span>
                <span class="macro-name">Rasvad</span>
            </div>
        `;

        // Assemble the Card
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(extraInfo);

        return card;
    };

    // Listen for auth state changes to get the current user
firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            loadingMessage.textContent = 'Retseptid laetakse...';

            const submittedRecipesPromise = db.collection("submittedRecipes")
                .where("userId", "==", userId)
                .get();
                
            const approvedRecipesPromise = db.collection("recipes")
                .where("userId", "==", userId)
                .get();
            

            Promise.all([submittedRecipesPromise, approvedRecipesPromise])
                .then(([submittedSnapshot, approvedSnapshot]) => {
                    recipeContainer.innerHTML = ''; // Tühjenda laadimissõnum

                    let recipeCount = 0;

                    const processAndDisplay = (snapshot, collectionName) => {
                        snapshot.forEach((doc) => {
                            const recipeData = doc.data();
                            const recipeId = doc.id;

                            const recipeCard = createRecipeCard(recipeData, recipeId, collectionName); 
                            recipeContainer.appendChild(recipeCard);
                            recipeCount++;
                        });
                    };

                    processAndDisplay(submittedSnapshot, 'submittedRecipes');

                    processAndDisplay(approvedSnapshot, 'recipes');
                    
                    if (recipeCount === 0) {
                        const noRecipesMessage = document.createElement('p');
                        noRecipesMessage.textContent = 'Sa ei ole veel ühtegi retsepti lisanud.';
                        noRecipesMessage.style.gridColumn = '1 / -1';
                        recipeContainer.appendChild(noRecipesMessage);
                    }
                })
                .catch((error) => {
                    console.error("Viga retseptide laadimisel:", error);
                    recipeContainer.innerHTML = '';
                    const errorMessage = document.createElement('p');
                    errorMessage.textContent = 'Viga retseptide laadimisel. Proovige hiljem uuesti.';
                    errorMessage.style.gridColumn = '1 / -1';
                    recipeContainer.appendChild(errorMessage);
                });
        } else {
            // User is signed out.
            recipeContainer.innerHTML = '<p>Palun logige sisse, et näha oma retsepte.</p>';
        }
    });
});