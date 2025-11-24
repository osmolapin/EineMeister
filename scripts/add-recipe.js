// 1. ÕIGED IMPORDID (Brauseri jaoks)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// 2. SINU FIREBASE VÕTMED (Pane siia oma päris võtmed tagasi!)
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

// 3. INITIALISEERIMINE (Ainult App ja Firestore)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. CLOUDINARY SEADED (Pane siia oma Cloudinary andmed)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhyfccb4a/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "recipes_pics";

// 5. LEIAME ELEMENDID HTML-IST
const recipeForm = document.getElementById("add-recipe-form");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const submitButton = recipeForm.querySelector("button.submit");

// SIIN ON SEE KRIITILINE KOHT: Leiame tekstiosa üles
const dropZoneText = document.getElementById("drop-zone-text");

let selectedFile = null;

// --- FAILI VALIMISE LOOGIKA ---
function handleFile(file) {
  if (file && file.type.startsWith("image/")) {
    selectedFile = file;

    // Kontrollime, kas tekstielement on olemas, enne kui muudame
    if (dropZoneText) {
      dropZoneText.textContent = `Valitud fail: ${file.name}`;
    } else {
      console.error("VIGA: Ei leidnud elementi id-ga 'drop-zone-text'. Kontrolli HTML-i!");
    }

  } else {
    selectedFile = null;
    alert("Viga: Palun vali pildifail!");
  }
}

// Kuularid (Listeners)
fileInput.addEventListener("change", (e) => { handleFile(e.target.files[0]); });

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  handleFile(e.dataTransfer.files[0]);
});


// --- VORMI SAATMISE LOOGIKA ---
recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = "Salvestan, palun oota...";

  try {
    // SAMM A: Kontroll
    if (!selectedFile) {
      alert("Palun vali pilt!");
      throw new Error("Pilt puudub");
    }

    // SAMM B: Cloudinary
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error.message || "Pildi üleslaadimine ebaõnnestus");
    }

    const imageUrl = data.secure_url;

    // SAMM C: Andmete kogumine
    const recipeData = {
      name: document.getElementById("form-name").value,
      description: document.getElementById("form-description").value,
      instructions: document.getElementById("form-instructions").value,
      calories: document.getElementById("form-calories").value,
      proteins: document.getElementById("form-proteins").value,
      fats: document.getElementById("form-fats").value,
      carbs: document.getElementById("form-carbs").value,
      ingredients: document.getElementById("form-ingredients").value,
      imageUrl: imageUrl,
      createdAt: new Date()
    };

    // SAMM D: Firestore
    const docRef = await addDoc(collection(db, "submittedRecipes"), recipeData);

    alert("Retsept edukalt lisatud!");

    // Puhastus
    recipeForm.reset();
    if (dropZoneText) dropZoneText.textContent = "Lohista pilt siia või klõpsa, et valida fail";
    selectedFile = null;

  } catch (err) {
    if (err.message !== "Pilt puudub") {
      console.error("Viga: ", err);
      alert("Tekkis viga: " + err.message);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Esita retsept";
  }
});