// 4. CLOUDINARY SEADED (Pane siia oma Cloudinary andmed)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhyfccb4a/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "recipes_pics";

let allProducts = [];
let recipeIngredients = [];
let currentSelectedProduct = null;
let selectedFile = null;
var userId = null;

const searchInput = document.getElementById("product-search");
const searchResults = document.getElementById("search-results");
const quantityInput = document.getElementById("ingredient-quantity");
const quantityRecipeInput = document.getElementById("ingredient-quantity-recipe");
const addBtn = document.getElementById("add-ingredient-btn");
const listElement = document.getElementById("ingredients-list");
const totalPriceDisplay = document.getElementById("total-price-display");

const dropZone = document.getElementById("drop-zone");
const dropZoneText = document.getElementById("drop-zone-text");
const fileInput = document.getElementById("file-input");
const recipeForm = document.getElementById("add-recipe-form");
const submitButton = recipeForm.querySelector("button.submit");

// Testime, kas kood hakkas tööle (Vaata konsooli!)
console.log("JS fail laetud edukalt!");

// ==========================================
// 4. TOODETE LAADIMINE ANDMEBAASIST
// ==========================================
async function loadProducts() {
  console.log("ALUSTAN toodete laadimist...");
  try {
    allProducts = [];
    db.collection("products").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allProducts.push({
            id: doc.id,
            // Kontrollime erinevaid nimekujusid (name, Name, title jne)
            name: data.name || "Nimetu",
            price: Number(data.price) || 0,
            imageUrl: data.imageUrl || ""
          });
        });
    });
    console.log("KOKKU laetud tooteid mällu:", allProducts.length);
    if (allProducts.length > 0) console.log("Näidis:", allProducts[0]);

  } catch (err) {
    console.error("VIGA andmebaasi lugemisel:", err);
  }
}
loadProducts();


// ==========================================
// 5. OTSINGU LOOGIKA
// ==========================================
searchInput.addEventListener("input", (e) => {
  const text = e.target.value.toLowerCase().trim();
  searchResults.innerHTML = "";

  if (text.length < 1) {
    searchResults.style.display = "none";
    return;
  }

  const matches = allProducts.filter(product => {
    return product.name && product.name.toLowerCase().includes(text);
  });

  if (matches.length > 0) {
    searchResults.style.display = "block";
    matches.forEach(product => {
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.padding = "10px";
      div.style.cursor = "pointer";
      div.style.borderBottom = "1px solid #eee";

      let imageHtml = '';
      if (product.imageUrl) {
        imageHtml = `<img src="${product.imageUrl}" style="width:30px; height:30px; object-fit:cover; margin-right:10px; border-radius:4px;">`;
      }

      div.innerHTML = `${imageHtml}<div><strong>${product.name}</strong> <span style="color:#666;">(${product.price.toFixed(2)} €)</div>`;

      div.addEventListener("click", () => selectProduct(product));
      searchResults.appendChild(div);
    });
  } else {
    searchResults.style.display = "block";
    searchResults.innerHTML = '<div style="padding:10px; color:#999;">Ei leitud.</div>';
  }
});

function selectProduct(product) {
  searchInput.value = product.name;
  currentSelectedProduct = product;
  searchResults.style.display = "none";
  quantityInput.focus();
}

// Peidame dropdowni klikkides mujale
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) searchResults.style.display = "none";
});


// ==========================================
// 6. KOOSTISOSADE LISAMINE
// ==========================================
addBtn.addEventListener("click", () => {
  const quantity = parseFloat(quantityInput.value);
  const quantityRecipe = quantityRecipeInput.value;

  if (!currentSelectedProduct || !quantity) {
    alert("Vali toode ja sisesta kogus!");
    return;
  }

  const cost = (currentSelectedProduct.price * quantity).toFixed(2);

  recipeIngredients.push({
    productId: currentSelectedProduct.id,
    name: currentSelectedProduct.name,
    quantity: quantity,
    quantityRecipe: quantityRecipe,
    cost: parseFloat(cost)
  });

  updateIngredientsList();
  console.log(recipeIngredients);

  // Reset väljad
  searchInput.value = "";
  quantityInput.value = "1";
  quantityRecipeInput.value = "";
  currentSelectedProduct = null;
});

function updateIngredientsList() {
  listElement.innerHTML = "";
  let totalRecipePrice = 0;

  recipeIngredients.forEach((item, index) => {
    totalRecipePrice += item.cost;
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name}, Toote arv: ${item.quantity}, Toote kogus: ${item.quantityRecipe}</span>
      <span>  ${item.cost.toFixed(2)}€ <button onclick="removeIngredient(${index})" style="color:red; margin-left:10px; cursor:pointer;">X</button></span>
    `;
    listElement.appendChild(li);
  });
  totalPriceDisplay.textContent = totalRecipePrice.toFixed(2);
}

window.removeIngredient = (index) => {
  recipeIngredients.splice(index, 1);
  updateIngredientsList();
};


// ==========================================
// 7. PILDI HALDUS & TÜHISTAMINE
// ==========================================
function handleFile(file) {
  if (file && file.type.startsWith("image/")) {
    selectedFile = file;
    if (dropZoneText) {
      dropZoneText.textContent = `Valitud fail: ${file.name}`;
      dropZone.style.borderColor = "#4CAF50";
      dropZone.style.backgroundColor = "#e8f5e9";
    }
  } else {
    selectedFile = null;
    alert("Viga: Palun vali pildifail!");
  }
}
fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drag-over"); });
dropZone.addEventListener("dragleave", () => { dropZone.classList.remove("drag-over"); });
dropZone.addEventListener("drop", (e) => { e.preventDefault(); dropZone.classList.remove("drag-over"); handleFile(e.dataTransfer.files[0]); });

// Tühista nupp
const cancelButton = recipeForm.querySelector("button.cancel");
cancelButton.addEventListener("click", () => {
  if (!confirm("Oled kindel? Andmed kaovad.")) return;
  window.location.href = "/pages/my-recipes.html"
});


// ==========================================
// 8. VORMI SAATMINE (LÕPP)
// ==========================================
recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log(e);
  submitButton.disabled = true;
  submitButton.textContent = "Salvestan...";

  try {
    if (!selectedFile) throw new Error("Pilt puudub!");
    if (recipeIngredients.length === 0) throw new Error("Lisa vähemalt üks koostisosa!");
    let finalRecipeFormat = createFormattedRecipe(recipeIngredients);
    console.log(finalRecipeFormat);

    // Cloudinary üleslaadimine
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message || "Pildi üleslaadimine ebaõnnestus");

    // Andmete koostamine
    const recipeData = {
      name: document.getElementById("form-name").value,
      description: document.getElementById("form-description").value,
      instructions: document.getElementById("form-instructions").value,
      calories: document.getElementById("form-calories").value,
      proteins: document.getElementById("form-proteins").value,
      fats: document.getElementById("form-fats").value,
      carbs: document.getElementById("form-carbs").value,
      userId: userId,
      ingredients: finalRecipeFormat,
      price: parseFloat(document.getElementById("total-price-display").textContent),

      imageUrl: data.secure_url,
    };

    // Saatmine
    console.log(recipeData);
    await db.collection("submittedRecipes").add(recipeData);

    alert("Retsept salvestatud!");
    window.location.reload();

  } catch (err) {
    console.error(err);
    alert("Viga: " + err.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Esita retsept";
  }
}); //

function createFormattedRecipgie(recipes) {
  let finalFormat = "";
  recipes.forEach(recipe => {
    if (finalFormat == "") {
      finalFormat += recipe.quantityRecipe + "," + recipe.productId;
    } else {
      finalFormat += "," + recipe.quantityRecipe + "," + recipe.productId;
    }
  });
  return finalFormat;
}

document.addEventListener('authStatusReady', (e) => {
    const detail = e.detail || {};
    userId = detail.userId;
    console.log("authStatusReady: currentUserId =", userId);
});