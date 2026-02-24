const linksContainer = document.getElementById('links-container');

// ========== Toast Notification ==========
function showToast(message, duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

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

// ========== Data Fetching ==========
async function fetchLinks() {
    try {
        const response = await fetch('links.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch links.json:', error);
        showToast('Using fallback links', 4000);
        // Fallback minimal links
        return [
            { name: "GitHub", url: "https://github.com/yourusername", icon: "fa-brands fa-github" },
            { name: "LinkedIn", url: "https://linkedin.com/in/yourusername", icon: "fa-brands fa-linkedin" }
        ];
    }
}

// ========== Render Links ==========
function renderLinks(links) {
    if (!linksContainer) return;
    linksContainer.innerHTML = '';

    links.forEach((link, index) => {
        const card = document.createElement('a');
        card.href = link.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'link-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <i class="${link.icon}" aria-hidden="true"></i>
            <span>${link.name}</span>
        `;
        card.addEventListener('click', () => showToast(`Redirecting to ${link.name}...`, 2000));
        linksContainer.appendChild(card);
    });
}

// ========== Initialization ==========
async function init() {
    linksContainer.innerHTML = '<div class="loading">Links are loading...</div>';
    const links = await fetchLinks();
    renderLinks(links);
    setTimeout(() => showToast('👋 Welcome!', 3000), 500);
}

document.addEventListener('DOMContentLoaded', init);

// ========== Optional Avatar Interaction ==========

/*const avatar = document.querySelector('.profile-avatar img');
if (avatar) {
    avatar.addEventListener('click', () => {
        showToast('This is my avatar. ✨', 1500);
    });
}*/

// ========== Advanced Admin Panel (commented) ==========
/*
   To enable interactive add/delete, uncomment the following code,
   the corresponding HTML, and the CSS in style.css.
   WARNING: This allows any visitor to modify your links.
*/

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