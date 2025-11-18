document.addEventListener('DOMContentLoaded', () => {
    const recipeContainer = document.querySelector('.recipe-container');
    const loadingMessage = document.getElementById('loading-message');


    const createRecipeCard = (recipeData, recipeId) => {
        const recipeCard = document.createElement('a');
        recipeCard.href = `recipe.html?id=${recipeId}&type=example`; 
        recipeCard.classList.add('recipe-card'); 

        const name = recipeData.name || 'Nimetu retsept';
        const price = (recipeData.price !== undefined && recipeData.price !== null) ? parseFloat(recipeData.price).toFixed(2) : 'N/A';
        const imageUrl = recipeData.imageUrl || '/images/default-recipe.jpg';
        

        const calories = recipeData.calories || 0;
        const carbs = recipeData.carbs || 0;
        const protein = recipeData.proteins || 0;
        const fat = recipeData.fats || 0;

        recipeCard.innerHTML = `
            <img src="${imageUrl}" alt="${name}" class="recipe-card-image">
            <div class="recipe-card-info-header">
                <h3>${name}</h3>
                <p class="price">Toidukorra hind ${price} €</p>
            </div>
            <div class="recipe-card-macros">
                <div class="macro-item"><span>${calories} kcal</span>Kalorid</div>
                <div class="macro-item"><span>${carbs}g</span>Süsivesikud</div>
                <div class="macro-item"><span>${protein}g</span>Valgud</div>
                <div class="macro-item"><span>${fat}g</span>Rasvad</div>
            </div>
        `;

        return recipeCard;
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