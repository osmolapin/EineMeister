var firebaseConfig = {
  apiKey: "AIzaSyAP-nzuF31UZbgHyc5AGsxgrNCVC1jb9hk",
  authDomain: "einemeister-84e8c.firebaseapp.com",
  projectId: "einemeister-84e8c",
  storageBucket: "einemeister-84e8c.firebasestorage.app",
  messagingSenderId: "699963249863",
  appId: "1:699963249863:web:392a4b3bbab29450d9dae2",
  measurementId: "G-5YW3F3X62G"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// Signup function
function signUp() {
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var cpassword = document.getElementById("cpassword");

  if (password.value !== cpassword.value) {
    alert("Paroolid ei kattu");
    return;
  }

  const queryAuth = auth.createUserWithEmailAndPassword(email.value, password.value);
  
  queryAuth.then(() => {
        // If authentication succeeded send user to login page
        alert("Kasutaja lisatud andmebaasi"); 
        window.location.href = "login.html"; 
        
    })
    .catch((e) => {
        // If failed alert user
        alert(e.message);
    });
  
}