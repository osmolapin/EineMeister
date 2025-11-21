var globalCurrentUserId = null; 
var authStatusChecked = false;
var user_pages = [
    "saved-carts.html",
    "my-recipes.html", 
];
var admin_pages = [
    "manage-users-admin.html",
    "recipe-approval-admin.html"
];

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
        if (user) {
            var docRef = db.collection("admins").doc(globalCurrentUserId);
            
            try {
                var doc = await docRef.get();
                
                if (doc.exists) {
                    isAdmin = true;
                } else {
                    isAdmin = false;
                }
            } catch (error) {
                console.log("Error getting document:", error);
            }
        }
        
        // User tries to access Admin Page
        if (admin_pages.includes(currentPageName)) {
            if (isAdmin) {
                console.log("Access Granted: Admin");
                document.body.style.display = "block"; // Show Page
            } else {
                console.log("Access Denied");
                window.location.href = "/pages/login.html";
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