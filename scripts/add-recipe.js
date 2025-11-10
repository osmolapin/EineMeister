// Impordime Firebase funktsioonid
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAP-nzuF31UZbgHyc5AGsxgrNCVC1jb9hk",
  authDomain: "einemeister-84e8c.firebaseapp.com",
  projectId: "einemeister-84e8c",
  storageBucket: "einemeister-84e8c.firebasestorage.app",
  messagingSenderId: "699963249863",
  appId: "1:699963249863:web:392a4b3bbab29450d9dae2",
  measurementId: "G-5YW3F3X62G"
};

// 2. Initialiseerime Firebase ja Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Leiame vormi HTML-ist
// See ID peab klappima sinu <form> sildiga
const recipeForm = document.getElementById("add-recipe-form");

// 4. Lisame "submit" kuular
recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Peatab lehe uuesti laadimise

  try {
    // 5. Kogume andmed vormist ID-de järgi
    const recipeData = {
      name: document.getElementById("form-name").value,
      description: document.getElementById("form-description").value,
      instructions: document.getElementById("form-instructions").value,
      calories: document.getElementById("form-calories").value,
      proteins: document.getElementById("form-proteins").value,
      fats: document.getElementById("form-fats").value,
      carbs: document.getElementById("form-carbs").value,
      ingredients: document.getElementById("form-ingredients").value,
      imageUrl: document.getElementById("form-image-url").value,
      createdAt: new Date()
    };

    // 6. Saadame andmed "recipes" kollektsiooni
    const docRef = await addDoc(collection(db, "recipes"), recipeData);

    alert("Retsept edukalt lisatud! Dokumendi ID: " + docRef.id);
    recipeForm.reset();

  } catch (err) {
    console.error("Viga dokumendi lisamisel: ", err);
    alert("Viga: " + err.message);
  }
});