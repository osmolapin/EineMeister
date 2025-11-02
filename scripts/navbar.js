/* 
* So that navar works correctly, make sure to include Firebase SDK and initialize Firebase in your HTML file before this script.
* <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
* <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
* <script src="/scripts/firebase-config-global.js"></script>
* <script src="/scripts/navbar.js" defer></script> 
* And if want login functionality, include login.js as well
* <script src="/scripts/login.js" defer></script>
* Add <header-navbar></header-navbar> in your HTML where you want the navbar to appear
* On the page margin should be 0
*/

class navbarComponent extends HTMLElement {
    constructor() {
        super();
        // Bind methods so they correctly reference 'this' (the component)
        this.attachShadow({ mode: 'open' });
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.updateNavigation = this.updateNavigation.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }
// Function to connect HTML/CSS with JS. 
connectedCallback() {
    // Loads the navbar template into the shadow DOM(function before this)
        this.shadowRoot.innerHTML = this.getNavbarTemplate();
        // Set up event listeners
        this.setEventListeners();
        // Launch Firebase and Auth listener
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(this.updateNavigation); 
        } else {
            console.error("Firebase Auth pole kättesaadav. Kontrolli HTML-i skriptide laadimise järjekorda!");
        }
    }

toggleDropdown(event) {
    // Prevents the default link action (navigation)
    if (event) event.preventDefault(); 
    const dropdownMenu = this.shadowRoot.getElementById('user-dropdown-menu'); 
    
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('active');
    }
}

// Logging out function
handleLogout(event) {
    if (event) event.preventDefault();

    firebase.auth().signOut().then(() => {
        // If logout is successful, redirect to logged out page
        window.location.href = '/pages/logged_out.html';
    }).catch((error) => {
        console.error("Väljalogimise viga:", error);
    });
}
handleOutsideClick(event) {
        const dropdownMenu = this.shadowRoot.getElementById('user-dropdown-menu'); 
        
        // Check if the click is outside the component AND the menu is open
        if (!this.contains(event.target) && dropdownMenu && dropdownMenu.classList.contains('active')) {
            this.toggleDropdown();
        }
    }

// ------------------- Navbar  -------------------
// Function changes according to login status
updateNavigation(user) {
    const loggedInContainer = this.shadowRoot.getElementById('logged-in-container'); 
    const loggedOutLink = this.shadowRoot.getElementById('logged-out-link'); 
    const logoutLink = this.shadowRoot.getElementById('logout-link');

    if (user) {
        // Logged in state
        if (loggedInContainer) loggedInContainer.style.display = 'list-item';
        if (loggedOutLink) loggedOutLink.style.display = 'none';
        
        // Logout event listener
        if (logoutLink) {
            // Remove previous listener to avoid duplicates
            logoutLink.removeEventListener('click', this.handleLogout); 
            logoutLink.addEventListener('click', this.handleLogout);
        }

    } else {
        // Logged out state
        if (loggedInContainer) loggedInContainer.style.display = 'none';
        if (loggedOutLink) loggedOutLink.style.display = 'list-item';
    }
}
    
// ------------------- For page loading -------------------

setEventListeners() {
        const userIcon = this.shadowRoot.getElementById('user-profile-icon');
        const logoutLink = this.shadowRoot.getElementById('logout-link');

        // Dropdown menu toggle/ click listener
        if (userIcon) {
            userIcon.addEventListener('click', this.toggleDropdown);
        }
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', this.handleOutsideClick);
        
        // Initial setup for logout link
        if (logoutLink) {
             logoutLink.addEventListener('click', this.handleLogout);
        }
    }
// Cleans up the global event listener when the component is removed
    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick);
    }

getNavbarTemplate() {
    return `
    <style>
/* Navbar styles */
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
*{
    margin: 0px;
    padding: 0;
    font-family: Inter, sans-serif;
}

.navbar{
    background-color: #80af81;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 25px;
    height: 3vw;
}
.search-bar{
    display: flex;
    align-items: center;
}
.search-bar input{
    font-size: 20px;
    width: 60vw;
    max-width: 40vw;
    padding: 10px;
    border-radius: 5px;
    border: none;
    outline: none;
    align-items: center;
}
.search-bar button{
    padding: 10px 15px;
    border: none;
    background-color: #80af81;
    color: black;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
}
ul{
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 20px;
    align-items: center;
}
ul li a{
    align-items: center;
    font-size: 20px;
    font-weight: normal;
    color: black;
    text-decoration: none;
    padding: 0;
}
.login-button{
    font-size: 17px;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background-color: #f0f0f0;
    color: black;
    cursor: pointer;
}

.hidden {
    display: none !important;
}

.navbar ul .dropdown {
    position: relative;
    display: inline-block;
}
.navbar ul .dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    padding: 0;
    margin: 0;
    list-style: none;
    background-color: white;
    border-radius: 5px;
}
.navbar ul .dropdown-menu li {
    display: block;
    width: 100%;
}
.navbar ul .dropdown-menu a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    text-align: left;
}
.navbar ul .dropdown-menu.active {
    display: block;
}
    </style>
    <header>
        <nav class="navbar">
            <div class="logo"><a href="index.html"><img src="/images/logo.png" alt="Einemeister logo"></a></div>
            <div class="search-bar">
                <input type="text" placeholder="Otsi toodet">
                <button ><img src="/images/search.png" alt="search"></button>
            </div>
            <ul>
                <li><a href="/ostukorv.html"><img src="/images/shopping_cart.png" alt="ostukorvi logo"></a></li>

                <li id="logged-out-link"><a href="/pages/login.html" class="login-button">Logi sisse</a></li>
                
            <li id="logged-in-container" class="dropdown" style="display:none;">
                <a href="#" class="dropdown-toggle" id="user-profile-icon">
                    <img src="images/account_circle.png" alt="user-profile-icon">
                    </a>
                    <ul class="dropdown-menu" id="user-dropdown-menu">
                        <li><a href="#">Lisa retsept</a></li>
                        <li><a href="#">Minu ostukorvid</a></li>
                        <li><a href="#" id="logout-link">Logi välja</a></li>
                    </ul>
            </li>
        </nav>
    </header>
    `;
}
}
// if browser sees navbar, it knows to use this component
customElements.define('header-navbar', navbarComponent);