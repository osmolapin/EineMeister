
// Function is started after successful login
function handleLoginSuccess() {
    window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const emailOrUsername = loginForm.elements['email'].value;
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