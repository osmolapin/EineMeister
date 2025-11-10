
// Tracker what starts on every page load
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
        
        // GlobalId
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
    });
}