# 🌐 LinkGrid

<div align="center"> <img src="./assets/logo.png" alt="LinkGrid Logo" width="120" height="120">

\# LinkGrid --- Self-Hosted Link Infrastructure

\### The Complete, Developer-First Link-in-Bio System

**Fast • Private • Extensible • Production-Ready • Zero SaaS Lock-In**

![Stars](https://img.shields.io/github/stars/VEX-SL/linkgrid?style=for-the-badge&logo=github)
![Forks](https://img.shields.io/github/forks/VEX-SL/linkgrid?style=for-the-badge&logo=github)
![License](https://img.shields.io/github/license/VEX-SL/linkgrid?style=for-the-badge)
![Node](https://img.shields.io/badge/node-18+-brightgreen?style=for-the-badge&logo=node.js)
![Status](https://img.shields.io/badge/status-production_ready-success?style=for-the-badge)
:::

------------------------------------------------------------------------

# 🚀 What is LinkGrid?

LinkGrid is a fully self-hosted, production-ready alternative to
commercial link-in-bio platforms.

It is designed for: - Developers - Creators - Agencies - Privacy-focused
users - SaaS builders

You own: - Your data - Your analytics - Your hosting - Your
infrastructure

No third-party tracking.\
No recurring fees.\
No vendor lock-in.

------------------------------------------------------------------------

# 🧠 System Architecture

Frontend Layer: - Vanilla JavaScript (No framework overhead) - Dynamic
DOM rendering - Client-side state handling - Responsive UI

Backend Layer: - Node.js - Express Server - RESTful API Endpoints - JSON
File Storage - Session-based Authentication

Storage Layer: - settings.json - links.json - statistics.json

Design Principles: - Minimal dependencies - High performance - Easy
extensibility - Transparent data flow

------------------------------------------------------------------------

# ✨ Feature Breakdown

## 🎨 Professional Theme Engine

-   5 built-in themes
-   Dark-first design philosophy
-   Instant switching
-   Modular theme structure
-   Easy custom theme extension

## 🔐 Security Layer

-   Admin authentication
-   7-day persistent sessions
-   Protected routes
-   Configurable admin password
-   JSON isolation strategy

## 📊 Advanced Local Analytics

-   Total click counter
-   Per-link tracking
-   Hourly activity distribution
-   Country detection (IP-based lookup)
-   Device type classification
-   Local JSON storage
-   No external analytics providers

## ⚙️ Full Web Control Panel

-   Live link creation
-   Inline editing
-   Drag & drop reordering
-   Real-time saving
-   Toggle system controls
-   Theme management
-   Profile customization

## 🔍 Optimized Search Engine

-   Real-time filtering
-   Minimum character threshold
-   Efficient DOM update logic
-   Performance-optimized rendering

## 🖼 Smart Favicon Detection

-   Automatic domain-based favicon fetching
-   Fallback handling
-   Clean UI alignment

------------------------------------------------------------------------

# 📈 Performance Philosophy

-   Lightweight runtime
-   No heavy framework bundle
-   Minimal memory footprint
-   Fast initial paint
-   Efficient event handling
-   Optimized DOM mutation strategy

Designed to scale vertically (VPS-ready).

------------------------------------------------------------------------

# 🆚 Competitive Comparison

  Feature                LinkGrid   Linktree   Carrd
  ---------------------- ---------- ---------- ---------
  Self Hosted            ✅         ❌         ❌
  Own Analytics          ✅         ❌         ❌
  No Monthly Fees        ✅         ❌         ❌
  Full Backend Control   ✅         ❌         ❌
  Open Source            ✅         ❌         ❌
  Extendable             ✅         Limited    Limited

------------------------------------------------------------------------

# 📦 Installation Guide

## Static Mode

Best for simple hosting.

``` bash
git clone https://github.com/VEX-SL/linkgrid.git
cd linkgrid
```

Edit JSON files and deploy to: - GitHub Pages - Netlify - Vercel

Admin + analytics disabled in static mode.

------------------------------------------------------------------------

## Full Production Mode

Requirements: - Node.js 18+

``` bash
git clone https://github.com/VEX-SL/linkgrid.git
cd linkgrid
npm install
npm start
```

Open: http://localhost:3125

------------------------------------------------------------------------

# 🏗 Production Deployment (Recommended)

Use PM2:

``` bash
npm install -g pm2
pm2 start index.js --name linkgrid
pm2 save
pm2 startup
```

Recommended Additions: - NGINX reverse proxy - HTTPS (Let's Encrypt) -
Firewall rules - Rate limiting (optional enhancement)

------------------------------------------------------------------------

# 🔒 Security Best Practices

-   Set strong admin password before deployment
-   Do not expose raw JSON endpoints
-   Use HTTPS in production
-   Restrict server ports
-   Use environment variables for sensitive configs
-   Regular backup of data directory

------------------------------------------------------------------------

# 🛣 Enterprise Roadmap

-   Multi-user system
-   Role-based access control
-   Database mode (MongoDB / PostgreSQL)
-   Docker image
-   API key system
-   Webhook support
-   Custom domain manager
-   Plugin system

------------------------------------------------------------------------

# 🧩 Extending LinkGrid

You can extend LinkGrid by:

-   Replacing JSON storage with database
-   Creating new themes
-   Adding middleware
-   Creating custom analytics dashboards
-   Integrating external APIs

Designed for modification.

------------------------------------------------------------------------

# 🤝 Contribution Guidelines

1.  Fork repository
2.  Create feature branch
3.  Follow clean code principles
4.  Avoid unnecessary dependencies
5.  Open Pull Request

Performance-first mindset required.

------------------------------------------------------------------------

# 📜 License

MIT License

Free for commercial & private use.

------------------------------------------------------------------------

# ☕ Support the Project

⭐ Star the repository\
☕ Support development\
https://buymeacoffee.com/vex_sl

------------------------------------------------------------------------

<div align="center"> **Made with ❤️ and JavaScript** ⭐ Star us on GitHub — it helps! </div>
