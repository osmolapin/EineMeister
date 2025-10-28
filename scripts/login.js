
// Function is started after successful login
function handleLoginSuccess() {
    window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        // Check login status
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // If user is logged in, redirect to homepage
                window.location.href = '/index.html';
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const emailOrUsername = loginForm.elements['username'].value;
            const password = loginForm.elements['password'].value;

            firebase.auth().signInWithEmailAndPassword(emailOrUsername, password)
            .then(() => {
                handleLoginSuccess();
            })
            .catch((error) => {
                alert("Sisselogimine ebaõnnestus: " + error.message);
            });
        });
    }
});