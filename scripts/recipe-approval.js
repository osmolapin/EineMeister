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

function confirmRecipe(id, title) {
    const recipeRow = document.querySelector(`[data-recipe-id="${id}"]`);
    if (recipeRow) {
        recipeRow.remove();
        showToast(`Retsept kinnitatud: ${title}`, 'success');
        checkEmptyState();
    }
}

function deleteRecipe(id, title) {
    const recipeRow = document.querySelector(`[data-recipe-id="${id}"]`);
    if (recipeRow) {
        recipeRow.remove();
        showToast(`Retsept kustutatud: ${title}`, 'error');
        checkEmptyState();
    }
}

function checkEmptyState() {
    const recipeGrid = document.getElementById('recipeGrid');
    const emptyState = document.getElementById('emptyState');

    if (recipeGrid.children.length === 0) {
        recipeGrid.style.display = 'none';
        emptyState.style.display = 'block';
    }
}

// Navigation handling
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});