# LinkGrid 🌐

A modern, lightning-fast, and fully customizable **link-in-bio** solution built with cutting-edge JavaScript (ES6+), CSS3, and HTML5. Designed for developers, creators, and professionals who want a stylish, performant, and self-hosted page to showcase their social links, portfolio, or contact info. With a **dark, eye-friendly theme** and smooth animations – ready to be dropped into your CV or personal website.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![JSON](https://img.shields.io/badge/JSON-000?logo=json&logoColor=white)

---

## ✨ **Features**

- **Dark & Calm Aesthetic** – Carefully chosen color palette reduces eye strain, with subtle glass‑morphism effects.
- **Fully Responsive** – Looks great on mobile, tablet, and desktop.
- **Easy Customization** – Update your links, icons, and personal info in seconds via a `links.json` file.
- **Modern JavaScript (ES6+)** – Uses `async/await`, `fetch`, modules, and dynamic DOM rendering.
- **Smooth Animations** – Staggered fade‑ins, hover effects, and a toast notification system.
- **Accessibility Friendly** – Respects `prefers-reduced-motion` and includes focus states.
- **No Build Step** – Pure HTML, CSS, JS – works out of the box with any static server.
- **Self-Hosted & Free** – No tracking, no watermarks, no subscription. You own your data.

---

## 🆚 **Why LinkGrid?** (vs. other link-in-bio tools)

| Feature | LinkGrid | Linktree | Bio.link | Carrd |
|---------|----------|----------|----------|-------|
| **Self-hosted** | ✅ You own everything | ❌ Third‑party service | ❌ Third‑party service | ❌ Hosted on their platform |
| **Performance** | ⚡ < 50ms load time (no bloat) | 🐢 Often heavy tracking | 🐑 Average | 🐇 Depends on plan |
| **Customization** | 🎨 Unlimited (CSS variables) | 🎨 Limited to templates | 🎨 Basic | 🎨 Good but requires code |
| **Price** | 💸 **Free forever** | 💸 Freemium / Pro | 💸 Freemium | 💸 Starts at $9/year |
| **Watermark** | 🚫 No watermark | ⚠️ On free plan | ⚠️ On free plan | ⚠️ On free plan |
| **Analytics** | 📊 Optional (you can add your own) | 📊 Built‑in (but basic) | 📊 Built‑in | 📊 Via integrations |
| **Open Source** | 🌟 Yes (MIT) | ❌ Closed | ❌ Closed | ❌ Closed |

**Bottom line:** LinkGrid gives you complete control, superior performance, and zero cost – perfect for developers who want to showcase their skills while maintaining a professional presence.

---

## 🚀 **Live Demo**

👉 [View Live Demo](https://vexlinks.vercel.app)

---

## 📸 **Screenshot**

<div align="center">
  <img src="./screenshots/1.png" alt="Full view" width="45%" style="margin:5px"/>
</div>

---

## 🛠️ **Technologies Used**

- **HTML5** – Semantic structure.
- **CSS3** – Custom properties, Flexbox, Grid, animations, media queries.
- **JavaScript (ES6+)** – Modules, Fetch API, Promises, DOM manipulation.
- **Font Awesome 6** – Icon library (latest v6.7.2).
- **Google Fonts (Inter)** – Clean, modern typography.

---

## 📦 **Getting Started**

### **Prerequisites**

- A modern web browser.
- A local development server (e.g., [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code) – required because `fetch` works over `http://`, not `file://`.

### **Installation**

1. **Clone the repository**

```bash
git clone https://github.com/VEX-SL/linkgrid.git
cd linkgrid
```

2. **Open with a local server**

If you use VS Code, right‑click `index.html` and select **Open with Live Server**.

Or run a simple Python server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

3. **Start customizing!** (See below)

---

## 🎨 Customization Guide

### 1. Personal Information (Name & Bio)

Edit the `index.html` file:

```html
<header>
    <h1 class="name">Your Name</h1>
    <p class="bio">Your short bio or tagline</p>
</header>
```

### 2. Links & Icons

All links are stored in `links.json`. Open it and modify the array:

```json
[
    {
        "name": "GitHub",
        "url": "https://github.com/yourusername",
        "icon": "fa-brands fa-github"
    },
    {
        "name": "LinkedIn",
        "url": "https://linkedin.com/in/yourusername",
        "icon": "fa-brands fa-linkedin"
    }
]
```

- `name` – Display name of the platform.
- `url` – Full URL (including `https://`). For email, use `mailto:you@example.com`.
- `icon` – Font Awesome 6 icon class. Find the complete list of available icons at [Font Awesome Icons](https://fontawesome.com/icons).

> **Note:** Icons like `fa-brands fa-x-twitter` (X/Twitter) and `fa-brands fa-signal-messenger` (Signal) are fully supported in Font Awesome 6.7.2+.

### 3. Colors & Theme

The color scheme is controlled by CSS variables in `style.css` (inside `:root`). Tweak them to match your brand:

```css
:root {
    --bg-primary: #0a0d12;
    --bg-secondary: #14181f;
    --bg-card: #1e242c;
    --bg-card-hover: #2a313c;
    --text-primary: #edf2f7;
    --text-secondary: #a0b3c9;
    --accent: #3182ce;
    --accent-light: #5a9fd4;
    /* ... */
}
```

### 4. Animations & Effects

- **Animation speeds** – Adjust `transition` and `animation` durations in the CSS.
- **Hover effects** – Modify the `.link-card:hover` rules.
- **Toast notifications** – Change the `showToast` function in `script.js` to alter message duration or styling.

### 5. Add / Remove Links Dynamically (Optional)

If you prefer an interactive editor, follow the instructions in the **Advanced Customization** section below.

---

## 📁 Project Structure

```text
linkgrid/
├── favicon.png         # Site Icon
├── index.html          # Main HTML file
├── style.css           # All styles (dark theme, animations)
├── script.js           # JavaScript logic (fetch, render, toast)
├── links.json          # Your links data (easy to edit)
├── screenshots/        # Folder for your screenshots
└── README.md           # This file
```

---

## 🔧 Advanced Customization

### Using Local Storage as a Mini‑CMS

If you want to add/edit links directly from the browser, you can enable the built‑in admin panel:

1. Uncomment the HTML for the "Add Link" button and modal in `index.html`.
2. Uncomment the corresponding CSS in `style.css` (the `.add-btn`, `.modal`, `.delete-btn` sections).
3. Uncomment the JavaScript code at the bottom of `script.js` (the admin panel section).

This will allow you to:

- Click a button to open a modal.
- Enter a new link (name, URL, icon) and save it.
- Links are saved to `localStorage` and persist across sessions.
- Delete links by clicking the "×" that appears on hover.

> ⚠️ **Important Security Note:**  
> The admin panel uses `localStorage` and is disabled by default. If you enable it, any visitor to your site will be able to add, edit, or delete links because the code runs entirely on the client side. This is fine for personal use or local testing, but **do not enable it on a public website** unless you implement proper authentication.
>
> The recommended and safest way to manage your links is to edit the `links.json` file directly and redeploy your site. That way, you retain full control and no one else can modify your links.

### Hosting on GitHub Pages

1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**.
3. Select the `main` branch and `/root` folder.
4. Your site will be live at `https://yourusername.github.io/linkgrid/`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/VEX-SL/linkgrid/issues).

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

VEX – [@VEX_SL](https://twitter.com/VEX_SL) – vex@example.com

Project Link: [https://github.com/VEX-SL/linkgrid](https://github.com/VEX-SL/linkgrid)

---

<p align="center">Made with ❤️ and JavaScript</p>
