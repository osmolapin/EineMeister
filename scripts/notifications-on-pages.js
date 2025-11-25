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

function createModalElement(title, content) {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'dynamicModal';       // Unique id for different styles.
    modalOverlay.className = 'modal-overlay';  // for CSS
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Close button
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';

    // For text
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;

    const bodyElement = document.createElement('p');
    bodyElement.innerHTML = content;

    modalContent.appendChild(closeButton);
    modalContent.appendChild(titleElement);
    modalContent.appendChild(bodyElement);
    modalOverlay.appendChild(modalContent);

    document.body.appendChild(modalOverlay);
    return modalOverlay;
}

export function showModal(title, content) {
    ensureStylesLoaded();
    let currentModal = createModalElement(title, content);

    
    currentModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Closing
    const closeModal = () => {
        document.body.removeChild(currentModal);
        document.body.style.overflow = 'auto';
    };

    // Can close with X
    currentModal.querySelector('.close-button').onclick = closeModal;

    // Close on click in the backround
    currentModal.onclick = (e) => {
        if (e.target === currentModal) {
            closeModal();
        }
    };
    
    // Can close with escape
    document.addEventListener('keydown', function onKeydown(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', onKeydown); 
        }
    });
}
export function modalConfirm(title, message) {
    ensureStylesLoaded();
    return new Promise((resolve) => {
        
        const buttonHTML = `
            <p>${message}</p>
            <div class="modal-buttons" style="margin-top: 20px; text-align: right;">
                <button id="modalConfirmCancel" class="modal-action-btn secondary-btn" style="background-color: #ccc; margin-right: 10px;">Tühista</button>
                <button id="modalConfirmOK" class="modal-action-btn primary-btn" style="background-color: #1a5319;">Jah, tühjenda</button>
            </div>
        `;
        

        let currentModal = createModalElement(title, buttonHTML);
        currentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 

        // function to close modal and resolve the promise
        const cleanUpAndResolve = (result) => {
            currentModal.remove(); 
            document.body.style.overflow = 'auto';
            resolve(result); 
        };

 
        const okButton = document.getElementById('modalConfirmOK');
        const cancelButton = document.getElementById('modalConfirmCancel');
        
        okButton.onclick = () => cleanUpAndResolve(true);
        cancelButton.onclick = () => cleanUpAndResolve(false);


        currentModal.onclick = (e) => {
            if (e.target.id === 'dynamicModal') {
                cleanUpAndResolve(false);
            }
        };


        currentModal.querySelector('.close-button').onclick = () => cleanUpAndResolve(false);
        

        document.addEventListener('keydown', function onKeydown(e) {
            if (e.key === 'Escape' && document.getElementById('dynamicModal')) {
                cleanUpAndResolve(false);
                document.removeEventListener('keydown', onKeydown); 
            }
        });
    });
}
const MODAL_STYLES = `
.modal-overlay {
    display: none; 
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Inter', sans-serif;
}


.modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 450px;
    

    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); 
    border: 1px solid #d6efd8;
    position: relative;
    color: #333;
    animation-name: modalopen;
    animation-duration: 0.3s;
}

@keyframes modalopen {
    from {opacity: 0; transform: translateY(-20px);} 
    to {opacity: 1; transform: translateY(0);}
}


.modal-content h2 {
    font-size: 1.8em;
    font-weight: 700;
    color: #1a5319; /* Tume roheline */
    margin: 0 0 15px 0;
    padding: 0;
}


.modal-content p {
    font-size: 1em;
    color: #555;
    margin: 0 0 15px 0;
}

.close-button {
    color: #555;
    font-size: 30px;
    font-weight: 300;
    position: absolute;
    top: 10px;
    right: 15px;
    cursor: pointer;
    line-height: 1;
    transition: color 0.15s;
}

.close-button:hover,
.close-button:focus {
    color: #1a5319;
    text-decoration: none;
}


.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.modal-action-btn {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.2s, box-shadow 0.2s;
    line-height: 1;
}

.primary-btn {
    background-color: #1a5319;
    color: white;
}

.primary-btn:hover {
    background-color: #2f7c30;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Tühistamise nupp*/
.secondary-btn {
    background-color: #f0f0f0;
    color: #333;
}

.secondary-btn:hover {
    background-color: #e0e0e0;
}
`;
let stylesInserted = false;

function ensureStylesLoaded() {
    if (stylesInserted) return;

    const styleElement = document.createElement('style');
    // To avoid doubles
    styleElement.id = 'global-notification-styles'; 
    styleElement.textContent = MODAL_STYLES;
    document.head.appendChild(styleElement);
    
    stylesInserted = true;
}