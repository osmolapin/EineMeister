document.addEventListener('DOMContentLoaded', () => {
    const recipeContainer = document.querySelector('.recipe-container');
    const loadingMessage = document.getElementById('loading-message');

    // 1. KORREKTNE FUNKTSIOON KAARDI LOOMISEKS (RUUDUSTIKU STRUKTUURIGA)
    const createRecipeCard = (recipeData, recipeId) => {
        const recipeCard = document.createElement('a');
        recipeCard.href = `recipe.html?id=${recipeId}&type=example`; 
        recipeCard.classList.add('recipe-card'); 

        const name = recipeData.name || 'Nimetu retsept';
        // Vormindab hinna kahe kohaga, kui andmed on olemas
        const price = (recipeData.price !== undefined && recipeData.price !== null) ? parseFloat(recipeData.price).toFixed(2) : 'N/A';
        const imageUrl = recipeData.imageUrl || '/images/default-recipe.jpg';
        
        // MAKRONÄITAJATE VÄLJAD
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
            // User is signed in.
            const userId = user.uid;
            loadingMessage.textContent = 'Retseptid laetakse...';

            // Query Firestore for recipes submitted by this user
            db.collection("submittedRecipes")
              .where("userId", "==", userId)
              .get()
              .then((querySnapshot) => {
                  recipeContainer.innerHTML = ''; // Clear loading message/default content
                  
                  if (querySnapshot.empty) {
                      // Handle case where no recipes are found
                      const noRecipesMessage = document.createElement('p');
                      noRecipesMessage.textContent = 'Sa ei ole veel ühtegi retsepti lisanud.';
                      noRecipesMessage.style.gridColumn = '1 / -1';
                      recipeContainer.appendChild(noRecipesMessage);
                      return;
                  }

                  // Iterate over recipes and create HTML elements
                  querySnapshot.forEach((doc) => {
                      const recipeData = doc.data();
                      const recipeId = doc.id; // This is the ID used for the link
                      
                      // 2. KASUTAB ÜLALMÄÄRATUD FUNKTSIOONI
                      const recipeCard = createRecipeCard(recipeData, recipeId); 

                      recipeContainer.appendChild(recipeCard);
                  });
              })
              .catch((error) => {
                  console.error("Error getting user recipes:", error);
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