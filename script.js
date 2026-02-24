// script.js - ES6 module for fetching and rendering links
// ================= CUSTOMIZATION FEATURES =================
// 1. Edit links.json to add/remove your personal links.
// 2. Change toast messages and duration in showToast().
// 3. Modify the fallback links in FALLBACK_LINKS constant.
// 4. Adjust animation delays in renderLinks() (index * 0.1s).
// 5. Enable/disable the background effect by uncommenting the mousemove event.
// 6. Customize the loading and error messages.
// ===========================================================

// DOM elements
// script.js - ES6 module for fetching and displaying links from links.json

const linksContainer = document.getElementById('links-container');

// ==================== Toast Notifications ====================
function showToast(message, duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== Data Fetching ====================
async function fetchLinksFromJSON() {
    try {
        const response = await fetch('links.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching links from JSON:', error);
        showToast('Failed to load links, using backup data', 4000);

        // Very simple backup data
        return [
            { name: "GitHub", url: "https://github.com/VEX-SL", icon: "fa-brands fa-github" }
        ];
    }
}

function getLinksFromStorage() {
    const saved = localStorage.getItem('userLinks');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            localStorage.removeItem('userLinks');
        }
    }
    return null;
}

async function getLinks() {
    // 1. Check localStorage first
    const stored = getLinksFromStorage();
    if (stored) return stored;

    // 2. Then fetch from JSON
    const jsonLinks = await fetchLinksFromJSON();
    return jsonLinks;
}

// ==================== Rendering ====================
function renderLinks(links) {
    if (!linksContainer) return;
    linksContainer.innerHTML = '';

    links.forEach((link, index) => {
        const linkCard = document.createElement('a');
        linkCard.href = link.url;
        linkCard.target = '_blank';
        linkCard.rel = 'noopener noreferrer';
        linkCard.className = 'link-card';
        linkCard.style.animationDelay = `${index * 0.1}s`;
        linkCard.innerHTML = `
            <i class="${link.icon}" aria-hidden="true"></i>
            <span>${link.name}</span>
        `;

        linkCard.addEventListener('click', () => {
            showToast(`Redirecting to ${link.name}...`, 2000);
        });

        linksContainer.appendChild(linkCard);
    });
}

// ==================== Initialization ====================
async function init() {
    try {
        linksContainer.innerHTML = '<div class="loading">Links are loading...</div>';
        const links = await getLinks();
        renderLinks(links);

        setTimeout(() => {
            showToast('👋 Welcome to My Links Page!', 3000);
        }, 500);
    } catch (error) {
        console.error('Error initializing the page:', error);
        linksContainer.innerHTML = '<div class="error">An error occurred while loading links, please try again later.</div>';
    }
}

document.addEventListener('DOMContentLoaded', init);

// ========== ADVANCED INTERACTIVE CUSTOMIZATION ==========
// The following code enables an in‑page admin panel. 
// To activate: uncomment the HTML in index.html and this section.
// =========================================================

/*
window.adminPanelEnabled = true;

const addBtn = document.getElementById('add-link-btn');
const modal = document.getElementById('link-modal');
const closeModal = document.querySelector('.close-modal');
const linkForm = document.getElementById('link-form');

if (addBtn) {
    addBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

if (linkForm) {
    linkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newLink = {
            name: document.getElementById('link-name').value,
            url: document.getElementById('link-url').value,
            icon: document.getElementById('link-icon').value
        };
        
        const currentLinks = await getLinks();
        currentLinks.push(newLink);
        
        localStorage.setItem('userLinks', JSON.stringify(currentLinks));
        renderLinks(currentLinks);
        
        modal.style.display = 'none';
        linkForm.reset();
        showToast('Link added successfully! ✨');
    });
}

// Re-render to show delete buttons
getLinks().then(links => renderLinks(links));
*/

// Optional interactive background effect (disabled by default)
/* window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    document.body.style.background = `
        radial-gradient(circle at ${x * 100}% ${y * 100}%, 
        rgba(66, 153, 225, 0.15), 
        rgba(26, 32, 44, 0.9))
    `;
}); */