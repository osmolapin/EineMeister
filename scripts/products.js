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

const db = firebase.firestore();

db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // doc.data() is a dictionary containing values with these keys:
        // name, description, imageUrl, price, calories, carbs, fats proteins, ingredients, storing, weight
        console.log(doc.id, " -> " ,doc.data());
    });
}); 