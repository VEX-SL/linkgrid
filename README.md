# 🌐 LinkGrid

<div align="center">
  <img src="./assets/logo.png" alt="LinkGrid Logo" width="120" height="120">
  
  ### A Modern Self-Hosted Link-in-Bio Platform
  
  **Beautiful • Fast • Full Control**
  
  ![GitHub Stars](https://img.shields.io/github/stars/VEX-SL/linkgrid?style=for-the-badge&logo=github)
  ![GitHub Forks](https://img.shields.io/github/forks/VEX-SL/linkgrid?style=for-the-badge&logo=github)
  ![License](https://img.shields.io/github/license/VEX-SL/linkgrid?style=for-the-badge)
  ![Node Version](https://img.shields.io/badge/node-18+-brightgreen?style=for-the-badge&logo=node.js)
  
  [Live Demo](https://vexlinks.vercel.app) •
  [Report Bug](https://github.com/VEX-SL/linkgrid/issues) •
  [Request Feature](https://github.com/VEX-SL/linkgrid/issues)
  
</div>

---

## ✨ Why LinkGrid?

| Feature | Description |
|---------|-------------|
| ✅ **Self-hosted** | Your data stays yours, no third-party tracking |
| 🎨 **5 Built-in Themes** | Minimal, Cyber, Glass, Terminal, Elegant |
| ⚙️ **Optional Admin Panel** | Manage links in real time with drag & drop |
| 🔍 **Live Search** | Instant filtering with result count |
| 📊 **Built-in Analytics** | Track clicks, countries, devices, and hourly activity |
| 🖼️ **Automatic Favicons** | Just write `"icon": "auto"` and we fetch them for you |
| 🚀 **Blazing Fast** | Pure vanilla JS, no heavy frameworks |
| 💾 **File-based Storage** | Simple JSON files, easy to backup or edit manually |
| 📱 **Fully Responsive** | Looks perfect on any device |
| ♿ **Accessibility Ready** | Respects prefers-reduced-motion, keyboard navigation |
| 🔓 **MIT Licensed** | Free for personal and commercial use |

---


## LinkGrid 🆚 Other Link-in-Bio Tools

| Feature | LinkGrid | Linktree | Bio.link | Carrd |
|----------|-----------|-----------|-----------|--------|
| **Hosting Model** | ✅ Self-hosted (you control server & data) | ❌ Fully hosted SaaS | ❌ Fully hosted SaaS | ❌ Hosted platform |
| **Data Ownership** | ✅ Full control | ⚠️ Stored on their servers | ⚠️ Stored on their servers | ⚠️ Stored on their servers |
| **Tracking & Analytics** | 📊 Built-in, minimal & self-controlled | 📊 Includes third-party analytics scripts | 📊 Platform analytics | 📊 Limited analytics (plan-based) |
| **Customization** | 🎨 Full CSS control (themes + variables) | 🎨 Template-based | 🎨 Basic customization | 🎨 Flexible (requires design effort) |
| **Backend Access** | ⚙️ Yes (Node.js + JSON storage) | ❌ No backend access | ❌ No backend access | ❌ No backend access |
| **Performance** | ⚡ Lightweight (Vanilla JS, no frameworks) | ⚠️ Includes external scripts | ⚠️ Includes external scripts | ⚠️ Depends on setup |
| **Pricing Model** | 💸 Free & Open Source (MIT) | 💸 Freemium / Paid tiers | 💸 Freemium | 💸 Paid plans |
| **Watermark / Branding** | 🚫 None | ⚠️ Present on free plan | ⚠️ Present on free plan | ⚠️ Present on free plan |
| **Open Source** | 🌟 Yes | ❌ No | ❌ No | ❌ No |

---

## 📸 Screenshots

<div align="center">
  
| Elegant Theme (Default) | Admin Panel – Analytics |
|:-----------------------:|:-----------------------:|
| ![Elegant Theme](./screenshots/elegant.png) | ![Admin Analytics](./screenshots/admin-analytics.png) |

| Drag & Drop Reorder | Live Search |
|:-------------------:|:-----------:|
| ![Drag Drop](./screenshots/dragdrop.png) | ![Search](./screenshots/search.png) |

</div>

---

## 🚀 Quick Start

### 🔹 Static Mode (No Admin Panel)

Perfect for simple deployments without backend functionality.

```bash
git clone https://github.com/VEX-SL/linkgrid.git
cd linkgrid
```

Edit the files inside `public/data/`:
- `settings.json` – appearance and features
- `links.json` – your links

Then deploy to any static host: **GitHub Pages**, **Vercel**, **Netlify**, etc.

---

### 🔹 Full Mode (With Admin Panel & Analytics)

> ⚠️ Requires **Node.js 18+**

```bash
git clone https://github.com/VEX-SL/linkgrid.git
cd linkgrid
npm install
npm start
```

Open [http://localhost:3125](http://localhost:3125) 🎉

---

## ⚙️ Configuration

### `public/data/settings.json`

```json
{
  "theme": "elegant",
  "profilePhoto": true,
  "profilePhotoUrl": "/static/profile.jpg",
  "name": "Your Name",
  "bio": "Your bio or tagline",
  "footer": "All rights reserved VEX© 2026",
  "adminPanel": false,
  "adminPage": true,
  "adminPassword": "your-secret-password",
  "search": true
}
```

#### Configuration Options

| Field | Description |
|-------|-------------|
| `theme` | One of: `elegant`, `minimal`, `cyber`, `glass`, `terminal` |
| `profilePhoto` | Show/hide profile image |
| `profilePhotoUrl` | Path to your photo (place it in `public/`) |
| `name`, `bio`, `footer` | Your personal info |
| `adminPanel` | Show **Add New Link** button on main page (requires backend) |
| `adminPage` | Enable `/admin` route for analytics and full management |
| `adminPassword` | Password to protect `/admin` (if empty, no login) |
| `search` | Enable live search on main page |

---

### `public/data/links.json`

```json
[
  {
    "name": "GitHub",
    "url": "https://github.com/yourusername",
    "icon": "auto"
  },
  {
    "name": "LinkedIn",
    "url": "https://linkedin.com/in/yourusername",
    "icon": "fa-brands fa-linkedin"
  }
]
```

#### Icon Options

- **`"icon": "auto"`** – Automatically fetches the site's favicon (uses DuckDuckGo's favicon service)
- **`"icon": "fa-brands fa-github"`** – Uses a Font Awesome class  
  [Browse all icons](https://fontawesome.com/icons)

---

# 🏗️ Architecture

LinkGrid is built as a hybrid application -- it can run purely static
(frontend only) or as a full-stack Node.js app with admin features and
analytics.

------------------------------------------------------------------------

## Frontend (Static)

### Pure Stack

-   HTML / CSS / JavaScript
-   No frameworks
-   Minimal dependencies

### Theming

-   Uses CSS Variables
-   All five themes are defined in `style.css`
-   Theme toggled via a class on `<body>`

### Dynamic Rendering

-   `index.html` loads `settings.json` and `links.json` via `fetch()`
-   Grid is generated dynamically using vanilla JavaScript

### Favicon Auto-fetch

When `"icon": "auto"` is set: - Script extracts the domain - Requests:
`https://icons.duckduckgo.com/ip3/{domain}.ico`

### Live Search

-   Enabled with `"search": true` in `settings.json`
-   Filters both name and URL
-   Real-time filtering using a simple `filter()` loop

> ⚠️ Search and admin drag‑&‑drop cannot be active simultaneously on the
> same page. Use only one in production.

### Drag & Drop

-   Implemented with SortableJS when `adminPanel` is active
-   After reordering, new sequence is sent to `/api/links` (backend
    required)

------------------------------------------------------------------------

## Backend (Node.js + Express)

### Express Server

-   Serves static files
-   Provides REST API endpoints

### File-Based Storage

All data resides in `public/data/`:

-   `settings.json` -- User configuration
-   `links.json` -- List of links
-   `statistics.json` -- Auto-generated analytics

### Analytics Pipeline

1.  User clicks a link\
2.  Frontend sends `POST /api/click` with `{ name, url }`\
3.  Server extracts:
    -   IP address
    -   Geolocation (via geoip-lite)
    -   Device type (via express-useragent)\
4.  Server updates `statistics.json` incrementally

### Admin Authentication

-   Session-based protection for `/admin`
-   Password stored in `settings.json` (plain text)
-   For production: use HTTPS and hashing

### Session Management

-   Uses `express-session`

------------------------------------------------------------------------

## Data Flow

    ┌─────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │  Browser    │ ──► │  Express API    │ ──► │  JSON Files     │
    │ (index.html)│      │ (index.js)      │      │ (public/data/)  │
    └─────────────┘      └─────────────────┘      └─────────────────┘
           ▲                                               │
           └───────────────────────────────────────────────┘
                         (static files)

------------------------------------------------------------------------

## Why This Architecture?

-   **Simplicity** -- No database setup required\
-   **Performance** -- Lightweight, no ORM overhead\
-   **Flexibility** -- Can be hosted static or on VPS\
-   **Privacy** -- Full data ownership

------------------------------------------------------------------------

## Known Limitations

-   Concurrent writes to JSON files are not locked (fine for low
    traffic)
-   IP geolocation is approximate (MaxMind GeoLite via geoip-lite)
-   Admin password stored in plain text (add hashing for production)

---

## 🧠 Advanced Features

### 🔍 Live Search

When `"search": true` in `settings.json`, a search bar appears above your links.
- Filters both **name** and **URL**
- Shows live count (e.g., `5 of 12`)

> ⚠️ **Warning:** Do not enable search together with `adminPanel` on a production site – the search UI will interfere with the admin drag-&-drop controls. During development you can enable both for testing, but for live use keep only one active.

---

### 🖱️ Drag & Drop Reorder (Admin Panel)

When `adminPanel` is active, you can reorder links by dragging them.  
The new order is **automatically saved** to `links.json`.

---

### 📊 Analytics Dashboard

Visit `/admin` (requires `adminPage: true` and a password).

**You'll see:**
- ✅ Total clicks
- 📈 Clicks per link (with last click time)
- 🌍 Top countries
- 📱 Device breakdown
- ⏰ Hourly activity chart (simple text-based bars)

All data is stored in `public/data/statistics.json`.

---

### 🔐 Admin Authentication

If you set `adminPassword` in `settings.json`, the `/admin` page will ask for a password.

> ⚠️ The password is sent in plain text – for production, consider adding **HTTPS** and a stronger auth layer.

---

## 📁 File Structure

```
linkgrid/
├── index.js                # Express server (optional)
├── package.json
├── (profile.jpg, favicon.png etc.)
├── public/
│   ├── index.html          # Main page
│   ├── admin.html          # Analytics dashboard
│   ├── style.css           # All themes & styles
│   ├── script.js           # Frontend logic
│   ├── data/
│   │   ├── settings.json   # Your configuration
│   │   ├── links.json      # Your links
│   │   └── statistics.json # Auto-generated analytics
└── screenshots/            # For README
```

---

## 🌐 Deployment

### Static Hosting (GitHub Pages / Vercel / Netlify)

1. Push the whole repo
2. Set the publish directory to `public/` (or root if you keep everything there)

> ⚠️ **Note:** Admin panel and analytics will **not work** – they require the Node.js backend.

---

### Full Stack (Node.js)

- **Railway / Render / Heroku** – Just connect your repo and set the start command to `node index.js`
- **VPS** – Run with `pm2` for persistence

```bash
pm2 start index.js --name linkgrid
pm2 save
pm2 startup
```

---

## ⚠️ Important Notes

1. **Admin Panel:** When `adminPanel: true`, the **Add New Link** button appears on the main page. This mode is meant for private use or with authentication. The drag-&-drop feature saves directly to `links.json`.

2. **Privacy:** The analytics system records IP addresses (to determine country) – be aware of privacy regulations (GDPR). You can anonymize by removing IP storage in `index.js`.

3. **Favicon Service:** The favicon service (`icons.duckduckgo.com`) is fast and reliable, but if you prefer another source, change the URL in `getFaviconUrl()` inside `script.js`.

---

## 🗺️ Roadmap

- [x] Multi-theme system
- [x] Admin panel with file persistence
- [x] Profile avatar
- [x] Analytics (clicks, countries, devices)
- [x] Drag & drop reorder
- [x] Live search
- [x] Automatic favicons (`"icon": "auto"`)
- [ ] Theme builder (custom CSS)
- [ ] Import / Export links
- [ ] Docker support

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing`
5. Open a Pull Request

---

## 📜 License

**MIT License** – Free for personal and commercial use.

See [LICENSE](LICENSE) for more information.

---

## ☕ Support

If you like LinkGrid, consider buying me a coffee:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/vex_sl)

---

## 📬 Contact

VEX – [@VEX_SL](https://x.com/VEX_SL_) – [Email](hamzaowad1713@gmail.com)

Project Link: [https://github.com/VEX-SL/linkgrid](https://github.com/VEX-SL/linkgrid)

---

<div align="center">
  
  **Made with ❤️ and JavaScript**
  
  ⭐ Star us on GitHub — it helps!
  
</div>
