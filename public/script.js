// ==================== LOCALIZATION ====================
const LANG = {
    en: {
        welcomeToast: '👋 Welcome!',
        redirecting: 'Redirecting to',
        loading: 'Loading...',
        linkAdded: 'Link added! ✨',
        linkDeleted: 'Link deleted',
        usingDefaultSettings: 'Using default settings',
        usingFallbackLinks: 'Using fallback links',
        modalTitle: 'Add / Edit Link',
        labelName: 'Platform name:',
        labelUrl: 'URL:',
        labelIcon: 'Icon class:',
        iconHelp: 'Enter "auto" for automatic favicon, or <a href="https://fontawesome.com/icons" target="_blank" rel="noopener">Font Awesome</a> class',
        submitBtn: 'Save',
        addNewLink: 'Add New Link',
        placeholderName: 'e.g. GitHub',
        placeholderUrl: 'https://...',
        placeholderIcon: 'auto or fa-brands fa-github',
        searchPlaceholder: 'Search links... 🔍',
        linksSaved: 'Links reordered successfully! ✨',
        saveFailed: 'Failed to save new order!',
        noResults: 'No links found'
    }
};

const lang = LANG.en;

// ==================== DOM ELEMENTS ====================
const elements = {
    linksContainer: document.getElementById('links-container'),
    profileAvatarContainer: document.getElementById('profile-avatar-container'),
    profileName: document.getElementById('profile-name'),
    profileBio: document.getElementById('profile-bio'),
    footerText: document.getElementById('footer-text'),
    adminButtonContainer: document.getElementById('admin-button-container'),
    addLinkBtn: document.getElementById('add-link-btn'),
    modal: document.getElementById('link-modal'),
    closeModal: document.querySelector('.close-modal'),
    linkForm: document.getElementById('link-form'),
    modalTitle: document.getElementById('modal-title'),
    labelName: document.getElementById('label-name'),
    labelUrl: document.getElementById('label-url'),
    labelIcon: document.getElementById('label-icon'),
    iconHelp: document.getElementById('icon-help'),
    submitBtn: document.getElementById('submit-btn'),
    linkNameInput: document.getElementById('link-name'),
    linkUrlInput: document.getElementById('link-url'),
    linkIconInput: document.getElementById('link-icon'),
    searchInput: null,
    resultsCount: null,
    searchClearBtn: null
};

// ==================== GLOBAL VARIABLES ====================
let settings = {};
let links = [];
let filteredLinks = [];
let searchQuery = '';
let sortableInstance = null;

// ==================== UTILITY FUNCTIONS ====================
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

function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
        return match ? match[1] : null;
    }
}

function getFaviconUrl(url) {
    const domain = extractDomain(url);
    if (!domain) return null;
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ==================== DATA FETCHING (NOW USING /api/settings) ====================
async function fetchSettings() {
    try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Network error');
        return await response.json();
    } catch (error) {
        console.warn(lang.usingDefaultSettings);
        return {
            theme: 'elegant',
            profilePhoto: false,
            profilePhotoUrl: '/static/profile.jpg',
            name: 'Your Name',
            bio: 'Your bio or tagline',
            footer: 'All rights reserved VEX© 2026',
            adminPanel: false,
            search: true
        };
    }
}

async function fetchLinks() {
    try {
        const response = await fetch('/api/links');
        if (!response.ok) throw new Error('Network error');
        let data = await response.json();
        data = data.map(link => ({
            ...link,
            clicks: link.clicks || 0
        }));
        return data;
    } catch (error) {
        console.warn(lang.usingFallbackLinks);
        showToast(lang.usingFallbackLinks, 4000);
        return [
            { name: "GitHub", url: "https://github.com/yourusername", icon: "auto", clicks: 0 },
            { name: "LinkedIn", url: "https://linkedin.com/in/yourusername", icon: "auto", clicks: 0 }
        ];
    }
}

async function saveLinks(newLinks) {
    try {
        const response = await fetch('/api/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLinks)
        });
        if (!response.ok) throw new Error('Failed to save');
        return await response.json();
    } catch (error) {
        console.error('Error saving links:', error);
        showToast('Failed to save links!', 3000);
        return null;
    }
}

// ==================== SETTINGS APPLICATION ====================
function applySettings(settingsData) {
    settings = settingsData;
    document.body.className = `theme-${(settings.theme || 'elegant').toLowerCase()}`;
    if (elements.profileName) elements.profileName.textContent = settings.name || '';
    if (elements.profileBio) elements.profileBio.textContent = settings.bio || '';
    if (elements.footerText) elements.footerText.textContent = settings.footer || '';

    if (elements.profileAvatarContainer) {
        elements.profileAvatarContainer.innerHTML = '';
        if (settings.profilePhoto) {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'profile-avatar';
            const img = document.createElement('img');
            img.src = settings.profilePhotoUrl || '/static/profile.jpg';
            img.alt = settings.name || 'Avatar';
            img.onerror = () => avatarDiv.remove();
            avatarDiv.appendChild(img);
            elements.profileAvatarContainer.appendChild(avatarDiv);
        }
    }

    if (elements.adminButtonContainer) {
        elements.adminButtonContainer.style.display = settings.adminPanel ? 'block' : 'none';
    }

    const settingsPageButton = document.getElementById('settings-page-button');
    if (settingsPageButton) {
        settingsPageButton.style.display = settings.adminPanel ? 'block' : 'none';
    }
}

// ==================== FILTERING LOGIC ====================
function filterLinks() {
    const q = searchQuery.toLowerCase();
    if (!q) {
        filteredLinks = [...links];
        return filteredLinks;
    }
    const result = links.filter(link =>
        link.name.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q)
    );
    filteredLinks = result;
    return result;
}

function updateSearchUI() {
    if (!elements.resultsCount) return;
    elements.resultsCount.textContent = `${filteredLinks.length} of ${links.length}`;
    if (elements.searchClearBtn) {
        elements.searchClearBtn.style.display = searchQuery ? 'block' : 'none';
    }
}

// ==================== RENDERING ====================
function renderLinks(linksToRender, isAdmin = false) {
    if (!elements.linksContainer) return;

    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }

    elements.linksContainer.innerHTML = '';

    if (!linksToRender || linksToRender.length === 0) {
        elements.linksContainer.innerHTML = `<div class="loading">${lang.noResults || 'No links found'}</div>`;
        return;
    }

    linksToRender.forEach((link, index) => {
        const card = document.createElement('a');
        card.href = link.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'link-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.linkData = { ...link };
        card.dataset.linkName = link.name;
        card.dataset.linkUrl = link.url;

        const useFavicon = link.icon && link.icon.toLowerCase() === 'auto';
        if (useFavicon) {
            const faviconUrl = getFaviconUrl(link.url);
            if (faviconUrl) {
                card.innerHTML = `
                    <img src="${faviconUrl}" 
                         class="favicon-img" 
                         alt="${link.name} favicon"
                         onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <i class="fa-solid fa-globe fallback-icon" style="display: none;" aria-hidden="true"></i>
                    <span>${link.name}</span>
                `;
            } else {
                card.innerHTML = `<i class="fa-solid fa-globe" aria-hidden="true"></i><span>${link.name}</span>`;
            }
        } else {
            card.innerHTML = `<i class="${link.icon}" aria-hidden="true"></i><span>${link.name}</span>`;
        }

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) return;
            fetch('/api/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: link.name, url: link.url }),
                keepalive: true
            }).catch(err => console.warn('Analytics error:', err));
            showToast(`${lang.redirecting} ${link.name}...`, 2000);
        });

        if (isAdmin) {
            const deleteBtn = document.createElement('span');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.className = 'delete-btn';
            deleteBtn.setAttribute('aria-label', 'Delete link');
            deleteBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const updatedLinks = links.filter(l => l.name !== link.name || l.url !== link.url);
                const result = await saveLinks(updatedLinks);
                if (result) {
                    links = updatedLinks;
                    filterAndRender(true);
                    showToast(lang.linkDeleted);
                }
            };
            card.appendChild(deleteBtn);
        }

        elements.linksContainer.appendChild(card);
    });

    if (isAdmin) {
        setTimeout(() => {
            initSortable();
        }, 50);
    }
}

function filterAndRender(isAdmin = false) {
    const filtered = filterLinks();
    renderLinks(filtered, isAdmin);
    updateSearchUI();
}

// ==================== SEARCH UI ====================
function initSearch() {
    if (!settings.search) return;
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-module';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = lang.searchPlaceholder;
    const searchIcon = document.createElement('i');
    searchIcon.className = 'fa-solid fa-search search-icon';
    const resultsCount = document.createElement('span');
    resultsCount.className = 'results-count';
    const clearBtn = document.createElement('button');
    clearBtn.className = 'search-clear';
    clearBtn.innerHTML = '&times;';
    clearBtn.style.display = 'none';

    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(resultsCount);
    searchContainer.appendChild(clearBtn);
    elements.linksContainer.parentNode.insertBefore(searchContainer, elements.linksContainer);

    const handleSearch = debounce(() => {
        searchQuery = searchInput.value.trim();
        filterAndRender(settings.adminPanel);
    }, 300);

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        filterAndRender(settings.adminPanel);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        filterAndRender(settings.adminPanel);
        searchInput.focus();
    });

    elements.searchInput = searchInput;
    elements.resultsCount = resultsCount;
    elements.searchClearBtn = clearBtn;
}

// ==================== SORTABLE (DRAG & DROP) ====================
function initSortable() {
    if (!settings.adminPanel || !elements.linksContainer) return;
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }
    const cards = elements.linksContainer.querySelectorAll('.link-card');
    if (cards.length === 0) return;

    sortableInstance = new Sortable(elements.linksContainer, {
        animation: 150,
        filter: ".delete-btn",
        preventOnFilter: false,
        dragClass: "dragging",
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        handle: '.link-card',
        onStart: function (evt) {
            evt.item.classList.add('is-dragging');
        },
        onEnd: async function (evt) {
            evt.item.classList.remove('is-dragging');
            const cards = elements.linksContainer.querySelectorAll('.link-card');
            const newOrder = [];
            cards.forEach(card => {
                if (card.linkData) {
                    newOrder.push({ ...card.linkData });
                }
            });
            if (newOrder.length === 0) {
                console.error('No valid link data found');
                showToast(lang.saveFailed, 3000);
                filterAndRender(true);
                return;
            }
            const result = await saveLinks(newOrder);
            if (result) {
                links = newOrder;
                showToast(lang.linksSaved);
                setTimeout(() => {
                    filterAndRender(true);
                }, 100);
            } else {
                showToast(lang.saveFailed, 3000);
                filterAndRender(true);
            }
        }
    });
}

// ==================== ADMIN PANEL MODAL ====================
function setupAdminModal() {
    if (!settings.adminPanel) return;
    if (elements.modalTitle) elements.modalTitle.textContent = lang.modalTitle;
    if (elements.labelName) elements.labelName.textContent = lang.labelName;
    if (elements.labelUrl) elements.labelUrl.textContent = lang.labelUrl;
    if (elements.labelIcon) elements.labelIcon.textContent = lang.labelIcon;
    if (elements.submitBtn) elements.submitBtn.textContent = lang.submitBtn;
    if (elements.iconHelp) elements.iconHelp.innerHTML = lang.iconHelp;
    if (elements.linkNameInput) elements.linkNameInput.placeholder = lang.placeholderName;
    if (elements.linkUrlInput) elements.linkUrlInput.placeholder = lang.placeholderUrl;
    if (elements.linkIconInput) elements.linkIconInput.placeholder = lang.placeholderIcon;

    elements.addLinkBtn.addEventListener('click', () => {
        elements.modal.style.display = 'block';
        elements.linkNameInput.focus();
    });

    elements.closeModal.addEventListener('click', () => {
        elements.modal.style.display = 'none';
        elements.linkForm.reset();
    });

    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            elements.modal.style.display = 'none';
            elements.linkForm.reset();
        }
    });

    elements.linkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newLink = {
            name: elements.linkNameInput.value.trim(),
            url: elements.linkUrlInput.value.trim(),
            icon: elements.linkIconInput.value.trim() || 'fa-solid fa-globe',
            clicks: 0
        };
        const updatedLinks = [...links, newLink];
        const result = await saveLinks(updatedLinks);
        if (result) {
            links = updatedLinks;
            elements.modal.style.display = 'none';
            elements.linkForm.reset();
            filterAndRender(true);
            showToast(lang.linkAdded);
        } else {
            showToast('Failed to add link!', 3000);
        }
    });
}

// ==================== INITIALIZATION ====================
async function init() {
    if (elements.linksContainer) {
        elements.linksContainer.innerHTML = `<div class="loading">${lang.loading}</div>`;
    }

    const [settingsData, linksData] = await Promise.all([
        fetchSettings(),
        fetchLinks()
    ]);

    settings = settingsData;
    links = linksData;
    filteredLinks = links;

    applySettings(settings);

    if (settings.adminPanel && settings.adminPage) {
        const adminBtnContainer = document.getElementById('admin-button-container');
        if (adminBtnContainer) {
            const analyticsBtn = document.createElement('button');
            analyticsBtn.className = 'add-btn';
            analyticsBtn.innerHTML = '<i class="fa-solid fa-chart-simple"></i> <span>Analytics</span>';
            analyticsBtn.style.marginLeft = '1rem';
            analyticsBtn.addEventListener('click', () => {
                window.location.href = '/admin';
            });
            adminBtnContainer.appendChild(analyticsBtn);
        }
    }

    if (settings.adminPanel) {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.innerHTML = '<i class="fa-solid fa-gear"></i> <span>Settings</span>';
            settingsBtn.addEventListener('click', () => {
                window.location.href = '/settings';
            });
        }
    }

    if (settings.search) {
        initSearch();
    }

    filterAndRender(settings.adminPanel);

    if (settings.adminPanel) setupAdminModal();

    setTimeout(() => showToast(lang.welcomeToast, 3000), 500);

    setTimeout(() => {
        const avatar = document.querySelector('.profile-avatar img');
        if (avatar) {
            avatar.addEventListener('click', () => {
                showToast('This is my avatar. ✨', 1500);
            });
        }
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
