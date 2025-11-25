const auth = firebase.auth();

function signUp() {
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var cpassword = document.getElementById("cpassword");

  if (password.value !== cpassword.value) {
    alert("Paroolid ei kattu");
    return;
  }

  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then((userCredential) => {
        var user = userCredential.user;
        var userId = user.uid; 

        console.log("User created with ID:", userId);

        // Save to users database
        return db.collection("users").doc(userId).set({
            email: email.value,
        });
    })
    .then(() => {
        alert("Kasutaja lisatud andmebaasi");
        window.location.href = "/index.html";
    })
    .catch((e) => {
        console.error(e);
        alert("Viga: " + e.message);
    });
}