document.addEventListener('DOMContentLoaded', () => {

    const recipeForm = document.getElementById("add-recipe-form");
    // Leia Esita nupp
    const submitButton = document.querySelector('button[type="submit"]'); 

    // Kui vormi ei leitud, logi viga (ennetav kaitse)
    if (!recipeForm) {
        console.error("Viga: HTML-is puudub element ID-ga 'add-recipe-form'.");
        return;
    }

    let currentUserId = null;

    // Turvalukk: Keela nupp alguses, et vältida ajastusvigu enne oleku teadasaamist
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Kontrollin sisselogimist...";
    }

    // Kuula sündmust, mis kinnitab sisselogimise oleku (tuleb auth-status.js-st)
    document.addEventListener('authStatusReady', (e) => {
        const detail = e.detail || {};
        currentUserId = detail.userId;
        
        // Konsoolisõnum, mida soovisid, kuvatakse nüüd õigel ajal
        console.log("authStatusReady: currentUserId =", currentUserId);

        // Luba/keela nupp vastavalt sisselogimise olekule
        if (submitButton) {
            if (currentUserId) {
                submitButton.disabled = false;
                submitButton.textContent = "Esita retsept";
            } else {
                submitButton.disabled = true;
                submitButton.textContent = "Palun logi sisse";
            }
        }
    });

    // Vormi esitamise loogika
    recipeForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Lõplik kontroll kasutaja olemasolu kohta
        if (!currentUserId) {
            alert("Retsepti lisamiseks pead olema sisse logitud!");
            return; 
        }
        
        // Keela nupp esitamise ajaks
        if (submitButton) submitButton.disabled = true;
        const userId = currentUserId; 

        try {
            // Kontrollime, et globaalne 'db' on saadaval
            if (typeof db === 'undefined' || typeof firebase.firestore === 'undefined') {
                 throw new Error("Firestore (db) pole saadaval. Kontrolli HTML-is SDK ja konfiguratsioonifailide laadimise järjekorda.");
            }
            
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
                // Kasutame V8 serveri ajatempli
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
                userId: userId
            };

            // V8 SALVESTAMISE SÜNTAKS, kasutades globaalset 'db' muutujat
            const docRef = await db.collection("submittedRecipes").add(recipeData);

            alert("Retsept edukalt lisatud! Dokumendi ID: " + docRef.id);
            recipeForm.reset();

        } catch (err) {
            console.error("Viga dokumendi lisamisel: ", err);
            alert("Viga: " + err.message);
        } finally {
            // Luba nupp uuesti
            if (submitButton && currentUserId) {
                submitButton.disabled = false;
                submitButton.textContent = "Esita retsept";
            }
        }
    });
});