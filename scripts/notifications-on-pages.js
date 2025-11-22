// This js is dedicated to functions that can work on multiple pages
// Can use these functions using import {function-name} from '/scripts/notifications-on-pages.js'
const TOAST_CONTAINER_ID = 'toast-notification-container';

export function showToast(itemId, message, type) {
    const TOAST_ID = `toast-${itemId}`;
    let toast = document.getElementById(TOAST_ID);

    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = TOAST_CONTAINER_ID;
        document.body.appendChild(container);
    }
    if (toast) {
        clearTimeout(toast.autoHideTimeout);
        clearTimeout(toast.removalTimeout);
        toast.style.animation = 'slideIn 0.3s ease-out';
        toast.textContent = message;
        toast.className = `toast ${type}`;
        } else {
        toast = document.createElement('div');
        toast.id = TOAST_ID; 
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.prepend(toast);
    }
    toast.autoHideTimeout = setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        toast.removalTimeout = setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
                // Kontrolli, kas konteiner jääb tühjaks ja eemalda see
                if (container.children.length === 0) {
                    document.body.removeChild(container);
                }
            }
        }, 300); 
    }, 3000); 
}