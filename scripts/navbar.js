function toggleDropdown(event) {
    // Prevents the default link action (navigation)
    if (event) event.preventDefault(); 
    const dropdownMenu = document.getElementById('user-dropdown-menu'); 
    
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('active');
    }
}

// Logging out function
function handleLogout(event) {
    if (event) event.preventDefault();

    firebase.auth().signOut().then(() => {
        // If logout is successful, redirect to logged out page
        window.location.href = '/pages/logged_out.html';
    }).catch((error) => {
        console.error("Väljalogimise viga:", error);
    });
}

// ------------------- Navbar  -------------------
// Function changes according to login status
function updateNavigation(user) {
    const loggedInContainer = document.getElementById('logged-in-container'); 
    const loggedOutLink = document.getElementById('logged-out-link'); 
    const logoutLink = document.getElementById('logout-link');

    if (user) {
        // Logged in state
        if (loggedInContainer) loggedInContainer.style.display = 'list-item';
        if (loggedOutLink) loggedOutLink.style.display = 'none';
        
        // Logout event listener
        if (logoutLink) {
            // Remove previous listener to avoid duplicates
            logoutLink.removeEventListener('click', handleLogout); 
            logoutLink.addEventListener('click', handleLogout);
        }

    } else {
        // Logged out state
        if (loggedInContainer) loggedInContainer.style.display = 'none';
        if (loggedOutLink) loggedOutLink.style.display = 'list-item';
    }
}
    
// ------------------- For page loading -------------------

document.addEventListener('DOMContentLoaded', () => {
    // Dropdown menu toggle/ click listener
    const userIcon = document.getElementById('user-profile-icon');
    if (userIcon) {
        userIcon.addEventListener('click', toggleDropdown);
    }
    
    // Hide dropdown when clicking outside
    const dropdownContainer = document.getElementById('logged-in-container');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    
    document.addEventListener('click', (event) => {
        if (dropdownContainer && dropdownMenu && 
            !dropdownContainer.contains(event.target) && 
            dropdownMenu.classList.contains('active')) 
        {
            dropdownMenu.classList.remove('active');
        }
    });

    // Launch login state check/listener
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(updateNavigation); 
    } else {
        console.error("Firebase Auth pole kättesaadav. Kontrolli HTML-i skriptide laadimise järjekorda!");
    }
});