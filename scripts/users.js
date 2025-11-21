function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

let allUsers = [];
let allAdmins = [];

function createUserCard(user) {
    const card = document.createElement("div");
    card.classList.add("user-card");
    card.setAttribute('data-user-id', user.id);

    // Determine button class and text based on admin status
    const btnClassAdmin = user.isAdmin ? "btn btn-is-admin" : "btn btn-not-admin";
    const btnTextAdmin = user.isAdmin ? "Admin" : "Ei ole admin";

    const btnClassBlacklist = user.isBlacklisted ? "btn btn-is-admin" : "btn btn-not-admin";
    const btnTextBlacklist = user.isBlacklisted ? "On blacklistis" : "Ei ole blacklistis";

    card.innerHTML = `
        <div class="user-row">
            <div class="user-card">
                <div class="user-email">${user.email}</div>
            </div>

            <div class="action-panel">
                <div class="button-group">
                    <button class="${btnClassAdmin}" onclick="toggleButton('admins','${user.id}', ${user.isAdmin})">${btnTextAdmin}</button>
                    <button class="${btnClassBlacklist}" onclick="toggleButton('blacklist','${user.id}', ${user.isBlacklisted})">${btnTextBlacklist}</button>
                </div>
            </div>
        </div>
    `;

    return card;
}

function renderUsers(usersArray) {
    const container = document.getElementById("users-container");
    container.innerHTML = '';
    usersArray.forEach(user => {
        container.appendChild(createUserCard(user));
    });
}

async function loadPage() {
    allUsers = [];
    
    try {
        // Get info from both collections
        const [blacklistSnapshot, adminsSnapshot, usersSnapshot] = await Promise.all([
            db.collection("blacklist").get(),
            db.collection("admins").get(),
            db.collection("users").get()
        ]);

        // Store all admin ids
        const adminIds = new Set();
        adminsSnapshot.forEach(doc => adminIds.add(doc.id));

        const blacklistIds = new Set();
        blacklistSnapshot.forEach(doc => blacklistIds.add(doc.id));

        usersSnapshot.forEach((userDoc) => {
            allUsers.push({
                id: userDoc.id,
                email: userDoc.data().email,
                // isAdmin and isBlacklisted - true or false
                isAdmin: adminIds.has(userDoc.id),
                isBlacklisted: blacklistIds.has(userDoc.id)
            });
        });

        renderUsers(allUsers);

    } catch (error) {
        console.error("Error loading data:", error);
        showToast("Andmete laadimine ebaõnnestus", "error");
    }
};

function toggleButton(collection ,userId, currentStatus) {
    if (currentStatus) {
        // If currently admin/blacklisted
        db.collection(collection).doc(userId).delete().then(() => {
            showToast("Kasutaja uuendatud", "success");
            loadPage();
        });
    } else {
        // If not admin/blacklisted
        db.collection(collection).doc(userId).set({
        }).then(() => {
            showToast("Kasutaja uuendatud", "success");
            loadPage();
        });
    }
}

// Initial Load
loadPage();