const auth = firebase.auth();
import {showModal, modalConfirm} from '/scripts/notifications-on-pages.js';
function emailCheck(email) {
    email = email.toLowerCase();
    return /[^@]+@[^@]+\.[^@]+/.test(email);
}

function passwordCheck(password) {
    if (password.length < 8) {
        return false;
    }

    let uppercase = 0;
    let lowercase = 0;
    let number = 0;
    const allowedSigns = "!@#%";

    for (let i = 0; i < password.length; i++) {
        let char = password.charAt(i);

        // Exclude ' ' because ' ' * 1 is 0, me rn -> (╯°□°)╯︵ ┻━┻
        if (!isNaN(char * 1) && char !== ' ') {
            number++;
        } 
        // Check if char
        else if (char.toLowerCase() !== char.toUpperCase()) {
            if (char === char.toUpperCase()) {
                uppercase++;
            } else {
                lowercase++;
            }
        }
        else if (allowedSigns.includes(char)) {
            continue;
        }
        else {
            return false;
        }
    }

    if (uppercase >= 1 && lowercase >= 1 && number >= 1) {
        return true;
    } else {
        return false;
    }
}

function inputValidation(email, password, cpassword, emailfeedback, passwordfeedback, cpasswordfeedback) {
    if (!emailCheck(email.value)) {
    email.style.borderColor = "red";
    emailfeedback.style.display  = "block";
    return false;

  } else {
    email.style.borderColor = "black";
    emailfeedback.style.display = "none";
  }

  if (!passwordCheck(password.value)) {
    password.style.borderColor = "red";
    passwordfeedback.style.display  = "block";
    return false;
  } else {
    password.style.borderColor = "black";
    passwordfeedback.style.display  = "none";
  }

  if (password.value !== cpassword.value) {
    password.style.borderColor = "red";
    cpassword.style.borderColor = "red";
    passwordfeedback.style.display  = "block";
    cpasswordfeedback.style.display  = "block";

    return false;
  } else {
    password.style.borderColor = "black";
    cpassword.style.borderColor = "black";
    passwordfeedback.style.display  = "none";
    cpasswordfeedback.style.display  = "none";
  }
    return true
}

function signUp() {
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var cpassword = document.getElementById("cpassword");

  var emailfeedback = document.getElementById("efeedback");
  var passwordfeedback = document.getElementById("pfeedback");
  var cpasswordfeedback = document.getElementById("cfeedback");

  if (inputValidation(email, password, cpassword, emailfeedback, passwordfeedback, cpasswordfeedback)) {
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
        showModal("Konto loomine edukas", "Konto on registreeritud")
        window.location.href = "/index.html";
    })
    .catch((e) => {
        console.error(e);
        showModal("Viga konto loomisel", "Palun proovige uuesti!");
        console.log("Viga konto registreerimisel:" + e.error)
    });
  }
}
window.signUp = signUp