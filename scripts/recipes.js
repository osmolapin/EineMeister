const db = firebase.firestore();

function createrecipePage(thisrecipeId) {
  window.location.href = `recipe.html?id=${thisrecipeId}`;
}


db.collection("recipes").get().then((querySnapshot) => {
    querySnapshot.forEach((recipe) => {
        // recipe.id -> string of id
        // recipe.data() is a dictionary containing values with these keys:
        // name, description, imageUrl, price, calories, carbs, fats proteins, ingredients, storing, weight

        const card = document.createElement("div");
        card.classList.add("recipe-card")
        card.setAttribute('data-recipe-id', recipe.id);
        
        const image = document.createElement("img");
        image.src = recipe.data()["imageUrl"];
        image.alt = recipe.data()["name"];
        image.classList.add("recipe-image");
        image.style = "height: 203px"
        image.onclick = () => createrecipePage(card.getAttribute('data-recipe-id'));
        
        const title = document.createElement("div");
        title.classList.add("recipe-title");
        title.textContent = recipe.data()["name"];
        title.onclick = () => createrecipePage(card.getAttribute('data-recipe-id'));
        
        const price = document.createElement("div");
        price.classList.add("recipe-price")
        price.textContent = recipe.data()["price"] + " €"

        const extraInfo = document.createElement("div");

        const calories = document.createElement("p");
        calories.classList.add("calories");
        calories.textContent = recipe.data()["calories"];

        const carbs = document.createElement("p");
        carbs.classList.add("carbs");
        carbs.textContent = recipe.data()["carbs"];

        const proteins = document.createElement("p");
        proteins.classList.add("proteins");
        proteins.textContent = recipe.data()["proteins"];

        const fats = document.createElement("p");
        fats.classList.add("fats");
        fats.textContent = recipe.data()["fats"];
        
        extraInfo.appendChild(calories);
        extraInfo.appendChild(carbs);
        extraInfo.appendChild(proteins);
        extraInfo.appendChild(fats);
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(extraInfo);
        document.getElementById("recipe-container").appendChild(card);
      });
    }); 
