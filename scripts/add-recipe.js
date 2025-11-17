import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAP-nzuF31UZbgHyc5AGsxgrNCVC1jb9hk",
  authDomain: "einemeister-84e8c.firebaseapp.com",
  projectId: "einemeister-84e8c",
  storageBucket: "einemeister-84e8c.firebasestorage.app",
  messagingSenderId: "699963249863",
  appId: "1:699963249863:web:392a4b3bbab29450d9dae2",
  measurementId: "G-5YW3F3X62G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const recipeForm = document.getElementById("add-recipe-form");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const submitButton = recipeForm.querySelector("button.submit");

let selectedFile = null;

function handleFile(file) {
  if (file && file.type.startsWith("image/")) {
    selectedFile = file;
    dropZone.textContent = `Valitud fail: ${file.name}`;
  } else {
    selectedFile = null;
    alert("Viga: Palun vali pildifail!");
  }
}

fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

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



recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitButton.disabled = true;
  submitButton.textContent = "Salvestan, palun oota...";

  try {
    if (!selectedFile) {
      alert("Palun vali pilt!");
      throw new Error("Pilt puudub");
    }

    const storageRef = ref(storage, 'recipes/' + selectedFile.name);
    await uploadBytes(storageRef, selectedFile);

    const imageUrl = await getDownloadURL(storageRef);

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

    const docRef = await addDoc(collection(db, "recipes"), recipeData);

    alert("Retsept edukalt lisatud! Dokumendi ID: " + docRef.id);

    recipeForm.reset();
    dropZone.textContent = "Lohista pilt siia või klõpsa, et valida fail";
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