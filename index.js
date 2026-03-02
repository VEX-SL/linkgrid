// index.js - Main server file for LinkGrid
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const geoip = require('geoip-lite');
const useragent = require('express-useragent');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt'); // For password hashing

const app = express();
const port = 3000;
const environment = process.env.NODE_ENV || 'development';
const saltRounds = 10; // Number of salt rounds for bcrypt

// ==================== MIDDLEWARE ====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(useragent.express()); // Adds device info to req.useragent

// Trust proxy (Railway, Render, etc.) – important for getting real client IP
app.set('trust proxy', true);

// ==================== SESSION SETUP ====================
let sessionStore;

// Use FileStore in production, MemoryStore in development
if (process.env.NODE_ENV === 'production') {
    const FileStore = require('session-file-store')(session);
    sessionStore = new FileStore({
        path: path.join(__dirname, 'sessions'),
        ttl: 86400, // 1 day in seconds
        retries: 0,
        reapInterval: 3600 // Clean expired sessions every hour
    });
    console.log('Using FileStore for sessions (production)');
} else {
    console.log('Using MemoryStore for sessions (development)');
}

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Create sessions folder in production
if (process.env.NODE_ENV === 'production') {
    const sessionsDir = path.join(__dirname, 'sessions');
    fs.mkdir(sessionsDir, { recursive: true }).catch(() => {});
}

// ==================== FILE UPLOAD CONFIG ====================
const upload = multer({ dest: path.join(__dirname, 'public', 'uploads') });
fs.mkdir(path.join(__dirname, 'public', 'uploads'), { recursive: true }).catch(() => {});

// ==================== HELPER: GET REAL CLIENT IP ====================
function getClientIp(req) {
    // Check X-Forwarded-For header (common with proxies)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // X-Forwarded-For can be "client, proxy1, proxy2"
        const ips = forwarded.split(',').map(ip => ip.trim());
        return ips[0]; // first IP is the real client
    }
    // Fallback to req.ip or remoteAddress
    return req.ip || req.connection.remoteAddress;
}

// ==================== GEO LOCATION FUNCTION ====================
async function getCountryFromIP(ip) {
    // Ignore local / internal IPs
    if (ip === '::1' || ip === '127.0.0.1' || 
        ip.startsWith('10.') || ip.startsWith('192.168.') || 
        ip.startsWith('172.16.') || ip.startsWith('172.17.') ||
        ip.startsWith('172.18.') || ip.startsWith('172.19.') ||
        ip.startsWith('172.20.') || ip.startsWith('172.21.') ||
        ip.startsWith('172.22.') || ip.startsWith('172.23.') ||
        ip.startsWith('172.24.') || ip.startsWith('172.25.') ||
        ip.startsWith('172.26.') || ip.startsWith('172.27.') ||
        ip.startsWith('172.28.') || ip.startsWith('172.29.') ||
        ip.startsWith('172.30.') || ip.startsWith('172.31.')) {
        return 'Local';
    }
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.countryCode || null;
    } catch (error) {
        console.error('ip-api error:', error.message);
        return null;
    }
}

// ==================== STATISTICS UPDATE FUNCTION ====================
async function updateStatistics(linkName, linkUrl, req) {
    try {
        const statsPath = path.join(__dirname, 'public', 'data', 'statistics.json');
        let stats = {
            links: [],
            totals: {
                countries: {},
                devices: {},
                hourly: new Array(24).fill(0),
                totalClicks: 0
            }
        };

        try {
            const data = await fs.readFile(statsPath, 'utf8');
            stats = JSON.parse(data);
        } catch (err) {
            // File doesn't exist, use default structure
        }

        // Get real client IP
        const ip = getClientIp(req);
        console.log('Client IP for analytics:', ip); // For debugging

        let country = 'Unknown';

        // Try ip-api.com first
        const apiCountry = await getCountryFromIP(ip);
        if (apiCountry) {
            country = apiCountry;
        } else {
            // Fallback to geoip-lite
            const geo = geoip.lookup(ip);
            country = geo ? geo.country : 'Unknown';
        }

        const device = req.useragent.isMobile ? 'mobile' : (req.useragent.isTablet ? 'tablet' : 'desktop');
        const hour = new Date().getHours();

        let linkStats = stats.links.find(l => l.name === linkName && l.url === linkUrl);
        if (!linkStats) {
            linkStats = {
                name: linkName,
                url: linkUrl,
                clicks: 0,
                lastClicked: null,
                countries: {},
                devices: {},
                hourly: new Array(24).fill(0)
            };
            stats.links.push(linkStats);
        }

        // Update link stats
        linkStats.clicks += 1;
        linkStats.lastClicked = new Date().toISOString();
        linkStats.countries[country] = (linkStats.countries[country] || 0) + 1;
        linkStats.devices[device] = (linkStats.devices[device] || 0) + 1;
        linkStats.hourly[hour] = (linkStats.hourly[hour] || 0) + 1;

        // Update totals
        stats.totals.countries[country] = (stats.totals.countries[country] || 0) + 1;
        stats.totals.devices[device] = (stats.totals.devices[device] || 0) + 1;
        stats.totals.hourly[hour] = (stats.totals.hourly[hour] || 0) + 1;
        stats.totals.totalClicks = (stats.totals.totalClicks || 0) + 1;

        await fs.writeFile(statsPath, JSON.stringify(stats, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error updating statistics:', error);
        return false;
    }
}

// ==================== BASIC ROUTES ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Get links
app.get('/api/links', async (req, res) => {
    try {
        const linksPath = path.join(__dirname, 'public', 'data', 'links.json');
        const data = await fs.readFile(linksPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading links:', error);
        res.status(500).json({ error: 'Failed to read links' });
    }
});

// API: Save links
app.post('/api/links', async (req, res) => {
    try {
        const linksPath = path.join(__dirname, 'public', 'data', 'links.json');
        const links = req.body;
        if (!Array.isArray(links)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }
        await fs.writeFile(linksPath, JSON.stringify(links, null, 2), 'utf8');
        res.json({ success: true, message: 'Links saved successfully' });
    } catch (error) {
        console.error('Error saving links:', error);
        res.status(500).json({ error: 'Failed to save links' });
    }
});

// ==================== ANALYTICS ====================
// Record a click
app.post('/api/click', async (req, res) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL required' });
        }
        const success = await updateStatistics(name, url, req);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to update statistics' });
        }
    } catch (error) {
        console.error('Error recording click:', error);
        res.status(500).json({ error: 'Failed to record click' });
    }
});

// API to fetch analytics data
app.get('/api/analytics', async (req, res) => {
    try {
        const statsPath = path.join(__dirname, 'public', 'data', 'statistics.json');
        let stats = { links: [], totals: {} };
        try {
            const data = await fs.readFile(statsPath, 'utf8');
            stats = JSON.parse(data);
        } catch (err) {
            // File doesn't exist, return empty structure
        }
        res.json(stats);
    } catch (error) {
        console.error('Error reading analytics:', error);
        res.status(500).json({ error: 'Failed to read analytics' });
    }
});

// ==================== RESET ANALYTICS ====================
app.post('/api/analytics/reset', async (req, res) => {
    try {
        // Check authentication
        if (!req.session.adminAuthenticated) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const statsPath = path.join(__dirname, 'public', 'data', 'statistics.json');
        
        // Create fresh empty stats structure
        const freshStats = {
            links: [],
            totals: {
                countries: {},
                devices: {},
                hourly: new Array(24).fill(0),
                totalClicks: 0
            }
        };

        // Write empty stats to file
        await fs.writeFile(statsPath, JSON.stringify(freshStats, null, 2), 'utf8');
        
        res.json({ success: true, message: 'Analytics reset successfully' });
    } catch (error) {
        console.error('Error resetting analytics:', error);
        res.status(500).json({ error: 'Failed to reset analytics' });
    }
});

// ==================== ADMIN PAGE ====================
app.post('/admin/login', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { password } = req.body;
        const settingsPath = path.join(__dirname, 'public', 'data', 'settings.json');
        const settingsData = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(settingsData);

        let isMatch = false;
        if (settings.adminPassword) {
            // Check if stored password is bcrypt hash
            if (settings.adminPassword.startsWith('$2b$') || settings.adminPassword.startsWith('$2a$')) {
                isMatch = await bcrypt.compare(password, settings.adminPassword);
            } else {
                // Backward compatibility with plain text passwords
                isMatch = (settings.adminPassword === password);
            }
        }

        if (isMatch) {
            req.session.adminAuthenticated = true;
            req.session.save((err) => {
                if (err) console.error('Session save error:', err);
                res.redirect('/admin');
            });
        } else {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head><title>Admin Login</title><style>
                    body{font-family:Inter,sans-serif;background:#0f1419;color:#f8fafc;display:flex;justify-content:center;align-items:center;height:100vh;}
                    .login-box{background:rgba(30,35,48,0.8);padding:2rem;border-radius:28px;backdrop-filter:blur(10px);border:1px solid rgba(95,124,175,0.2);}
                    input{padding:0.8rem;border-radius:30px;border:1px solid rgba(95,124,175,0.2);background:rgba(30,35,48,0.8);color:white;width:100%;margin-bottom:1rem;}
                    button{background:#5f7caf;color:white;border:none;padding:0.8rem 2rem;border-radius:30px;cursor:pointer;width:100%;}
                </style></head>
                <body>
                    <div class="login-box">
                        <h2>Admin Login</h2>
                        <form method="post" action="/admin/login">
                            <input type="password" name="password" placeholder="Enter password" required>
                            <button type="submit">Login</button>
                        </form>
                        <p style="color:red; text-align:center;">Invalid password</p>
                    </div>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

app.get('/admin', async (req, res) => {
    try {
        const settingsPath = path.join(__dirname, 'public', 'data', 'settings.json');
        const settingsData = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(settingsData);

        if (!settings.adminPage) {
            return res.status(404).send('Admin page disabled');
        }

        if (settings.adminPassword && !req.session.adminAuthenticated) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head><title>Admin Login</title><style>
                    body{font-family:Inter,sans-serif;background:#0f1419;color:#f8fafc;display:flex;justify-content:center;align-items:center;height:100vh;}
                    .login-box{background:rgba(30,35,48,0.8);padding:2rem;border-radius:28px;backdrop-filter:blur(10px);border:1px solid rgba(95,124,175,0.2);}
                    input{padding:0.8rem;border-radius:30px;border:1px solid rgba(95,124,175,0.2);background:rgba(30,35,48,0.8);color:white;width:100%;margin-bottom:1rem;}
                    button{background:#5f7caf;color:white;border:none;padding:0.8rem 2rem;border-radius:30px;cursor:pointer;width:100%;}
                </style></head>
                <body>
                    <div class="login-box">
                        <h2>Admin Login</h2>
                        <form method="post" action="/admin/login">
                            <input type="password" name="password" placeholder="Enter password" required>
                            <button type="submit">Login</button>
                        </form>
                    </div>
                </body>
                </html>
            `);
        }

        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } catch (error) {
        res.status(500).send('Error loading admin page');
    }
});

// Logout route
app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Error destroying session:', err);
        res.clearCookie('connect.sid', { path: '/' });
        res.redirect('/');
    });
});

// ==================== SETTINGS PAGE ====================
app.get('/settings', async (req, res) => {
    try {
        const settingsPath = path.join(__dirname, 'public', 'data', 'settings.json');
        const settingsData = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(settingsData);

        // If there's a session error parameter, force session destruction and show login
        if (req.query.error === 'session') {
            if (req.session) {
                req.session.destroy(() => {});
            }
            return showSettingsLogin(res, 'Your session has expired. Please login again.');
        }

        // Normal authentication check
        if (settings.adminPassword && !req.session.adminAuthenticated) {
            return showSettingsLogin(res);
        }

        res.sendFile(path.join(__dirname, 'public', 'settings.html'));
    } catch (error) {
        res.status(500).send('Error loading settings page');
    }
});

// Helper to display settings login page
function showSettingsLogin(res, errorMsg = '') {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Settings Login</title>
            <style>
                body{font-family:Inter,sans-serif;background:#0f1419;color:#f8fafc;display:flex;justify-content:center;align-items:center;height:100vh;}
                .login-box{background:rgba(30,35,48,0.8);padding:2rem;border-radius:28px;backdrop-filter:blur(10px);border:1px solid rgba(95,124,175,0.2);width:350px;}
                input{padding:0.8rem;border-radius:30px;border:1px solid rgba(95,124,175,0.2);background:rgba(30,35,48,0.8);color:white;width:100%;margin-bottom:1rem;}
                button{background:#5f7caf;color:white;border:none;padding:0.8rem 2rem;border-radius:30px;cursor:pointer;width:100%;}
                .error{color:#ef4444;text-align:center;margin-bottom:1rem;}
            </style>
        </head>
        <body>
            <div class="login-box">
                <h2>Settings Login</h2>
                ${errorMsg ? `<div class="error">${errorMsg}</div>` : ''}
                <form method="post" action="/settings/login">
                    <input type="password" name="password" placeholder="Enter admin password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        </body>
        </html>
    `);
}

app.post('/settings/login', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { password } = req.body;
        const settingsPath = path.join(__dirname, 'public', 'data', 'settings.json');
        const settingsData = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(settingsData);

        let isMatch = false;
        if (settings.adminPassword) {
            if (settings.adminPassword.startsWith('$2b$') || settings.adminPassword.startsWith('$2a$')) {
                isMatch = await bcrypt.compare(password, settings.adminPassword);
            } else {
                isMatch = (settings.adminPassword === password);
            }
        }

        if (isMatch) {
            req.session.adminAuthenticated = true;
            req.session.save((err) => {
                if (err) console.error('Session save error:', err);
                res.redirect('/settings');
            });
        } else {
            showSettingsLogin(res, 'Invalid password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

app.post('/settings', upload.single('profilePhotoFile'), async (req, res) => {
    try {
        if (!req.session.adminAuthenticated) {
            return res.redirect('/settings?error=session');
        }

        const settingsPath = path.join(__dirname, 'public', 'data', 'settings.json');
        const settingsData = await fs.readFile(settingsPath, 'utf8');
        let settings = JSON.parse(settingsData);

        const { theme, name, bio, footer, adminPanel, adminPage, adminPassword, search, profilePhoto, security } = req.body;

        let newAdminPanel = adminPanel === 'on';
        let newSearch = search === 'on';
        if (newAdminPanel && newSearch) newSearch = false;

        let newSecurity = security === 'on';
        if (newSecurity && environment === 'development') {
            return res.redirect('/settings?error=security-dev');
        }

        settings.theme = theme;
        settings.name = name;
        settings.bio = bio;
        settings.footer = footer;
        settings.adminPanel = newAdminPanel;
        settings.search = newSearch;
        settings.adminPage = adminPage === 'on';
        settings.security = newSecurity;
        
        // Handle password: if a new password is provided (non-empty), hash it
        if (adminPassword && adminPassword.trim() !== '') {
            const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
            settings.adminPassword = hashedPassword;
        }
        // If empty, keep the current password (no change)

        settings.profilePhoto = profilePhoto === 'on';

        // Handle file upload
        if (req.file) {
            const oldPath = req.file.path;
            const ext = path.extname(req.file.originalname);
            const newFilename = `profile${ext}`;
            const newPath = path.join(__dirname, 'public', newFilename);
            await fs.rename(oldPath, newPath);
            settings.profilePhotoUrl = `/static/${newFilename}`;
        }

        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
        res.redirect('/settings?success=true');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving settings');
    }
});

// Optional: dedicated logout for settings
app.get('/settings/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Error destroying session:', err);
        res.clearCookie('connect.sid', { path: '/' });
        res.redirect('/');
    });
});

// Favicon endpoint (uses settings.json to get custom favicon)
app.get('/docs/favicon', (req, res) => {
    const f = require('fs');
    const settings = f.readFileSync(path.join(__dirname, 'public', 'data', 'settings.json'), 'utf8');
    const parsed = JSON.parse(settings);
    const favicon = parsed.faviconUrl || '/favicon.ico';
    res.sendFile(path.join(__dirname, 'public', favicon));
});

// ==================== CATCH-ALL ====================
app.use((req, res) => {
    res.redirect('/');
});

// ==================== START SERVER ====================
app.listen(port);

