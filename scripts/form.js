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