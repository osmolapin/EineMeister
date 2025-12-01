const auth = firebase.auth();
import {showModal, modalConfirm} from '/scripts/notifications-on-pages.js';
function handleLoginSuccess() {
    window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const rememberCheckbox = document.getElementById("remember");

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const email = loginForm.elements['email'].value;
            const password = loginForm.elements['password'].value;

            let persistenceMode = firebase.auth.Auth.Persistence.SESSION
            if (rememberCheckbox.checked) {
                persistenceMode = firebase.auth.Auth.Persistence.LOCAL
            }

            // Set persistence
            auth.setPersistence(persistenceMode)
                .then(() => {
                    return auth.signInWithEmailAndPassword(email, password);
                })
                .then(() => {
                    handleLoginSuccess();
                })
                .catch((error) => {
                    console.error(error);
                    showModal("Sisselogimine ebaõnnestus ", "Kontrollige, et sisestasite korrektse emaili ning parooli.");
                });
        });
    }
});
