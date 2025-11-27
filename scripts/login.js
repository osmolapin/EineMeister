const auth = firebase.auth();

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

            const persistenceMode = firebase.auth.Auth.Persistence.SESSION
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
                    alert("Sisselogimine ebaõnnestus: " + error.message);
                });
        });
    }
});
