var globalCurrentUserId = null; 
var authStatusChecked = false;
var user_pages = [
    "saved-carts.html",
    "my-recipes.html", 
    "add-recipe.html"
];
var admin_pages = [
    "manage-users-admin.html",
    "recipe-approval-admin.html"
];

var blacklist_pages = [
    "add-recipe.html"
]

async function checkUser(user, database) {
    if (user) {
        var docRef = db.collection(database).doc(globalCurrentUserId);
        
        try {
            var doc = await docRef.get();
            
            if (doc.exists) {
                console.log(doc.exists)
                return true;
            } else {
                console.log(doc.exists)
                return false;
            }
        } catch (error) {
            console.log("Error getting document:", error);
        }
    }
}

// Tracker what starts on every page load
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
        globalCurrentUserId = user ? user.uid : null;
        authStatusChecked = true;
        console.log("Auth status muutus. Kasutaja ID:", globalCurrentUserId);

        // For listeners, uID in detail
        document.dispatchEvent(new CustomEvent('authStatusReady', {
            detail: { 
                // If user logged out, userID = null
                userId: globalCurrentUserId 
            }
        }));

        var currentPageName = window.location.pathname.split("/").pop();
        var isAdmin = false;

        // Only check database if a user is logged in
        isAdmin = await checkUser(user, "admins");
        isBlacklisted = await checkUser(user, "blacklist");
        
        // User tries to access Admin Page
        if (admin_pages.includes(currentPageName)) {
            if (isAdmin) {
                console.log("Access Granted: Admin");
                document.body.style.display = "block"; // Show Page
                console.log(isBlacklisted);
            } else {
                console.log("Access Denied");
                window.location.href = "/pages/login.html";
            }
        } 
        else if (blacklist_pages.includes(currentPageName)) {
            if (user && !isBlacklisted) {
                console.log("Access Granted: User, not blacklisted");
                document.body.style.display = "block"; // Show Page
            } else {
                console.log("Not logged in");
                window.location.href = "/index.html";
            }
        } 
        // User tries to access User Page
        else if (user_pages.includes(currentPageName)) {
            if (user) {
                console.log("Access Granted: User");
                document.body.style.display = "block"; // Show Page
            } else {
                console.log("Not logged in");
                window.location.href = "/pages/login.html";
            }
        } 
        // Public Page (Login, Landing, etc)
        else {
            document.body.style.display = "block"; // Show Page
        }
    });
}