/* * So that navbar works correctly, make sure to include Firebase SDK and initialize Firebase in your HTML file before this script.
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
        this.attachShadow({ mode: 'open' });
        // Bind methods for correct 'this' context
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.updateNavigation = this.updateNavigation.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }
    
    // Function to connect HTML/CSS with JS. 
    connectedCallback() {
        // Loads the navbar template into the shadow DOM
        this.shadowRoot.innerHTML = this.getNavbarTemplate();
        
        // Set up event listeners
        this.setEventListeners();

        // Launch Firebase and Auth listener
        if (typeof firebase !== 'undefined' && firebase.auth) {
            // Store the listener to be able to unsubscribe later
            this.authListener = firebase.auth().onAuthStateChanged(this.updateNavigation); 
        } else {
            console.error("Firebase Auth pole kättesaadav.");
            // Set a default state if Firebase is unavailable
            this.updateNavigation(null); 
        }
    }

    // Cleans up the listeners when the component is removed
    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick);
        if (this.authListener) {
            this.authListener(); // Unsubscribe the Firebase listener
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
            // Redirect after successful logout
            window.location.href = '/pages/logged_out.html';
        }).catch((error) => {
            console.error("Väljalogimise viga:", error);
        });
    }

    handleOutsideClick(event) {
        const dropdownMenu = this.shadowRoot.getElementById('user-dropdown-menu');
        
        // Is the dropdown open?
        if (dropdownMenu && dropdownMenu.classList.contains('active')) {
            
            // Use event.composedPath() to see where the click originated.
            const path = event.composedPath();

            // If the click path DOES NOT include the host element 
            // (the <header-navbar> tag itself), the click was external.
            if (!path.includes(this.shadowRoot.host)) {
                // Close the dropdown
                this.toggleDropdown();
            } 
        }
    }

    // ------------------- Navbar  -------------------
    // Function changes according to login status
    updateNavigation(user) {
        const userIcon = this.shadowRoot.getElementById('user-profile-icon');
        const loggedOutButton = this.shadowRoot.getElementById('logged-out-button');
        const loggedOutImage = this.shadowRoot.getElementById('logged-out-image');
        const logoutLink = this.shadowRoot.getElementById('logout-link');

        if (user) {
            // Logged in state - show profile icon, hide login buttons
            if (userIcon) userIcon.classList.remove('hidden');
            if (loggedOutButton) loggedOutButton.classList.add('hidden');
            if (loggedOutImage) loggedOutImage.classList.add('hidden');
            
            // Set up logout listener
            if (logoutLink) {
                logoutLink.removeEventListener('click', this.handleLogout); 
                logoutLink.addEventListener('click', this.handleLogout);
            }

        } else {
            // Logged out state - show login buttons, hide profile icon
            if (userIcon) userIcon.classList.add('hidden');
            if (loggedOutButton) loggedOutButton.classList.remove('hidden');
            if (loggedOutImage) loggedOutImage.classList.remove('hidden');
            
            // Ensure dropdown is closed
            const dropdownMenu = this.shadowRoot.getElementById('user-dropdown-menu'); 
            if (dropdownMenu) dropdownMenu.classList.remove('active');
        }
    }
        

    setEventListeners() {
        const userIcon = this.shadowRoot.getElementById('user-profile-icon');

        // Dropdown menu toggle/ click listener (only needed for the logged-in icon)
        if (userIcon) {
            userIcon.addEventListener('click', this.toggleDropdown);
        }
        // Handle clicks everywhere but the navbar
        document.addEventListener('click', this.handleOutsideClick);
    }

    getNavbarTemplate() {
        return `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }

                .navbar {
                    background-color: #80af81;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 5px 25px;
                    height: 60px;
                }
                
                .logo a img {
                    height: 40px;
                    width: auto;
                    display: block;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    flex-grow: 1; 
                    max-width: 500px;
                    margin: 0 20px;
                }
                
                .search-bar input {
                    font-size: 16px;
                    padding: 10px;
                    width: 100%;
                    border-radius: 5px 0 0 5px;
                    border: none;
                    outline: none;
                }
                
                .search-bar button {
                    border: none;
                    background-color: #6a966b;
                    padding: 8px 15px;
                    cursor: pointer;
                    outline: none;
                    border-radius: 0 5px 5px 0;
                    transition: background-color 0.2s;
                    height: 40px;
                    display: flex;
                    align-items: center;
                }

                .search-bar button:hover, .search-bar button:focus {
                    background-color: #4b684b;
                }

                .search-bar button img {
                    width: 20px;
                    height: 20px;
                }
                
                /* --- Navigation List Styles --- */
                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                
                ul li a {
                    font-size: 17px;
                    font-weight: normal;
                    color: black;
                    text-decoration: none;
                    padding: 5px 0;
                    transition: color 0.2s;
                }
                
                ul li a:hover, ul li a:focus {
                    color: #333;
                }

                .navbar ul li a img {
                    height: 25px;
                    width: 25px;
                    vertical-align: middle;
                }

                /* --- Login Button Styles (Desktop) --- */
                .login-button {
                    font-size: 17px;
                    padding: 8px 15px;
                    border: none;
                    border-radius: 5px;
                    background-color: #f0f0f0;
                    color: black;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .login-button:hover, .login-button:focus {
                    background-color: #e0e0e0;
                }

                /* --- Dropdown Styles --- */
                .navbar ul .dropdown {
                    position: relative;
                }
                
                .navbar ul .dropdown-menu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    right: 0;
                    min-width: 160px;
                    box-shadow: 0px 4px 12px 0px rgba(0,0,0,0.15);
                    z-index: 10; 
                    list-style: none;
                    background-color: white;
                    border-radius: 5px;
                    overflow: hidden;
                }

                .navbar ul .dropdown-menu li {
                    display: block;
                }
                
                .navbar ul .dropdown-menu a {
                    color: black;
                    font-size: 16px;
                    padding: 10px 16px;
                    text-decoration: none;
                    display: block;
                    text-align: left;
                    width: 100%;
                }

                .navbar ul .dropdown-menu a:hover {
                    background-color: #f0f0f0;
                    color: black;
                }
                
                /* JS-managed state */
                .navbar ul .dropdown-menu.active {
                    display: block;
                }

                .hidden {
                    display: none !important;
                }
                .mobile-icon { display: none; }
                .desktop-text { display: inline; }
                
                /* --- Mobile / Tablet Styles --- */
                @media (max-width: 992px) {
                    .navbar {
                        height: 70px;
                        padding: 5px 15px;
                    }

                    .search-bar {
                        margin: 0 10px;
                        max-width: 60%;
                    }

                    /* 1. HIDE THE DESKTOP LOGIN BUTTON TEXT */
                    .login-button .desktop-text {
                        display: none;
                    }
                    
                    /* 2. SHOW THE MOBILE ICON */
                    .login-button .mobile-icon {
                        display: block;
                        height: 25px; /* Ensure the icon is sized */
                        width: 25px;
                        margin: auto; /* Center the icon if space allows */
                    }
                    
                    /* 3. ENSURE THE LOGIN LINK LOOKS LIKE A SIMPLE ICON */
                    .login-button { 
                        background: none; /* Remove background */
                        padding: 0 !important; /* Remove button padding */
                        border: none;
                    }
                    
                    /* The 'hidden' class applied by JS will control which link is visible. */
                    
                    ul {
                        gap: 5px; 
                    }
                }

                @media (max-width: 768px) {
                    /* On smaller phones, reduce padding and focus on core elements */
                    .navbar {
                        padding: 5px 10px;
                    }
                    
                    .search-bar {
                        max-width: 50vw; 
                    }
                }
            </style>
            <header>
                <nav class="navbar">
                    <div class="logo"><a href="/index.html"><img src="/images/logo.png" alt="Einemeister logo"></a></div>
                    
                    <div class="search-bar">
                        <input type="text" placeholder="Otsi toodet">
                        <button ><img src="/images/search.png" alt="search icon"></button>
                    </div>
                    
                    <ul>
                        <li><a href="/pages/shopping-cart.html"><img src="/images/shopping_cart.png" alt="shopping cart icon"></a></li>

                        <li id="profile-container" class="dropdown">
                            <a href="/pages/login.html" class="login-button dropdown-toggle" id="logged-out-button">
                                <span class="desktop-text">Logi sisse</span>
                                <img src="/images/account_circle.png" alt="user-profile-icon" class="mobile-icon hidden-on-desktop">
                            </a>
                            <a href="#" class="dropdown-toggle hidden" id="user-profile-icon">
                                <img src="/images/account_circle.png" alt="user-profile-icon">
                            </a>
                            
                            <ul class="dropdown-menu" id="user-dropdown-menu">
                                <li><a href="/pages/my-recipes.html">Minu retseptid</a></li>
                                <li><a href="/pages/saved-carts.html">Minu ostukorvid</a></li>
                                <li><a href="#" id="logout-link">Logi välja</a></li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </header>
        `;
    }
}
customElements.define('header-navbar', navbarComponent);