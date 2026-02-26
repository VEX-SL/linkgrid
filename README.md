<div align="center">

<img src="./assets/logo.png" alt="LinkGrid Logo" width="120" height="120">

# LinkGrid 🌐

### A Modern Self-Hosted Link-in-Bio Platform

[![Stars](https://img.shields.io/github/stars/VEX-SL/linkgrid?style=for-the-badge&logo=github)](https://github.com/VEX-SL/linkgrid/stargazers)
[![Forks](https://img.shields.io/github/forks/VEX-SL/linkgrid?style=for-the-badge&logo=github)](https://github.com/VEX-SL/linkgrid/network/members)
[![License](https://img.shields.io/github/license/VEX-SL/linkgrid?style=for-the-badge)](LICENSE)

A self-hosted, themeable link-in-bio platform with optional admin panel and zero frontend dependencies.

[Live Demo](https://vexlinks.vercel.app) •
[Report Bug](https://github.com/VEX-SL/linkgrid/issues) •
[Request Feature](https://github.com/VEX-SL/linkgrid/issues)

</div>

---

## 🎯 Why LinkGrid?

- ✅ **Self-hosted** – Full control over your data  
- 🎨 **5 Built-in Themes** – minimal, cyber, glass, terminal, elegant  
- ⚙️ **Optional Admin Panel** – Real-time link management
- 🚀 **Optimized Performance** – No heavy frameworks  
- 💾 **Persistent Storage** – File-based JSON system  
- 📱 **Fully Responsive** – Mobile-first design  
- ♿ **Accessibility Ready** – Reduced motion & keyboard support  
- 🔓 **MIT Licensed** – Free for personal & commercial use  

---

## 📸 Screenshots

### 🌙 Elegant Theme (Default)

<img src="./screenshots/elegant.png" alt="Elegant Theme" width="100%">

### 🎨 Theme Preview

| Minimal | Cyber | Glass | Terminal | Elegant |
|---------|--------|--------|----------|----------|
| ![](./screenshots/minimal.png) | ![](./screenshots/cyber.png) | ![](./screenshots/glass.png) | ![](./screenshots/terminal.png) | ![](./screenshots/elegant.png) |

---

## 🚀 Quick Start

### 🔹 Static Mode (No Admin Panel)

```bash
git clone https://github.com/VEX-SL/linkgrid.git
cd linkgrid
```

Edit:

```
public/links.json
public/settings.json
```

Deploy to:
* GitHub Pages
* Vercel
* Netlify
* Any static hosting

### 🔹 Full Mode (With Admin Panel)

```bash
git clone https://github.com/VEX-SL/linkgrid.git
cd linkgrid
npm install
npm start
```

Then open:

```
http://localhost:3125
```

---

## ⚙️ Configuration

### settings.json

```json
{
  "theme": "elegant",
  "profilePhoto": true,
  "name": "Your Name",
  "bio": "Your tagline here",
  "footer": "© 2026 Your Name",
  "adminPanel": false
}
```

### links.json

```json
[
  {
    "name": "GitHub",
    "url": "https://github.com/yourusername",
    "icon": "fa-brands fa-github"
  },
  {
    "name": "Email",
    "url": "mailto:you@example.com",
    "icon": "fa-solid fa-envelope"
  }
]
```

---

## 🛠️ Tech Stack

### Frontend
* HTML5
* CSS3 (CSS Variables + Themes)
* Vanilla JavaScript (ES6+)
* Font Awesome 6

### Backend (Optional)
* Node.js
* Express
* JSON File Storage

---

## 🌐 Deployment

### Static Deployment
Use GitHub Pages, Vercel, or Netlify.

**Note:** Admin panel requires Node.js environment.

### Full Deployment
Use:
* Railway
* Render
* VPS with Node.js

---

## 🔒 Security Note

If you enable `"adminPanel": true`, anyone can edit links unless authentication is added.

For production, consider adding basic auth middleware inside `index.js`.

---

## 🗺️ Roadmap

- [x] Multi-theme system
- [x] Admin panel with file persistence
- [x] Profile avatar
- [ ] Analytics module
- [ ] Import / Export
- [ ] Theme builder
- [ ] Docker support

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

## 📜 License

MIT License — Free for commercial and personal use.

---

## ☕ Support The Project

If you like LinkGrid, consider supporting:

**Buy Me a Coffee** 👉 https://buymeacoffee.com/vex_sl

---

<div align="center">

Made with ❤️ and JavaScript

</div>
