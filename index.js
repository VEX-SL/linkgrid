// index.js - Main server file for LinkGrid
// Uses Express, JSONbin.io for persistent storage, sessions, bcrypt, and geolocation

const express = require('express');
const path = require('path');
const geoip = require('geoip-lite');
const useragent = require('express-useragent');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs').promises; // used for file uploads and sessions folder

const app = express();
const port = process.env.PORT || 3000;
const environment = process.env.NODE_ENV || 'development';
const saltRounds = 10; // for bcrypt hashing

// ==================== JSONbin CONFIGURATION ====================
// These environment variables must be set in production (or .env)
const JSONBIN_KEY = process.env.JSONBIN_KEY;
const SETTINGS_BIN_ID = process.env.SETTINGS_BIN_ID;
const LINKS_BIN_ID = process.env.LINKS_BIN_ID;
const STATS_BIN_ID = process.env.STATS_BIN_ID;

/**
 * Helper function to read data from a JSONbin.io bin.
 * @param {string} binId - The bin identifier
 * @returns {Promise<Object>} The parsed JSON record
 */
async function readJSONBin(binId) {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    if (!response.ok) throw new Error(`JSONbin read error: ${response.status}`);
    const data = await response.json();
    return data.record;
}

/**
 * Helper function to write data to a JSONbin.io bin.
 * @param {string} binId - The bin identifier
 * @param {Object} data - The data to store
 * @returns {Promise<Object>} The API response
 */
async function writeJSONBin(binId, data) {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_KEY
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`JSONbin write error: ${response.status}`);
    return response.json();
}

// ==================== MIDDLEWARE ====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(useragent.express()); // adds device info to req.useragent

// Trust proxy (for platforms like Railway, Replit) – important for getting real client IP
app.set('trust proxy', true);

// ==================== SESSION SETUP ====================
let sessionStore;

if (environment === 'production') {
    // In production, use file-based session store to avoid memory leaks
    const FileStore = require('session-file-store')(session);
    sessionStore = new FileStore({
        path: path.join(__dirname, 'sessions'),
        ttl: 86400, // 1 day in seconds
        retries: 0,
        reapInterval: 3600 // clean expired sessions every hour
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
    rolling: true, // refresh session on each request
    cookie: {
        secure: environment === 'production', // true only in production (HTTPS)
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Ensure sessions folder exists in production
if (environment === 'production') {
    const sessionsDir = path.join(__dirname, 'sessions');
    fs.mkdir(sessionsDir, { recursive: true }).catch(() => {});
}

// ==================== FILE UPLOAD CONFIG ====================
const upload = multer({ dest: path.join(__dirname, 'public', 'uploads') });
fs.mkdir(path.join(__dirname, 'public', 'uploads'), { recursive: true }).catch(() => {});

// ==================== HELPER: GET REAL CLIENT IP ====================
/**
 * Extract the real client IP from request, taking into account X-Forwarded-For headers.
 * @param {Object} req - Express request object
 * @returns {string} The client IP address
 */
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        return ips[0]; // first IP is the original client
    }
    return req.ip || req.connection.remoteAddress;
}

// ==================== GEO LOCATION FUNCTION ====================
/**
 * Get country code from IP address using ip-api.com (fallback to geoip-lite).
 * @param {string} ip - The IP address
 * @returns {Promise<string|null>} Country code (e.g., 'US') or null
 */
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

// ==================== STATISTICS UPDATE FUNCTION (USING JSONBIN) ====================
/**
 * Update click statistics for a given link.
 * @param {string} linkName - Name of the clicked link
 * @param {string} linkUrl - URL of the clicked link
 * @param {Object} req - Express request object (to get IP, user-agent)
 * @returns {Promise<boolean>} True if successful
 */
async function updateStatistics(linkName, linkUrl, req) {
    try {
        let stats = await readJSONBin(STATS_BIN_ID);
        const ip = getClientIp(req);
        console.log('Client IP for analytics:', ip);

        let country = 'Unknown';
        const apiCountry = await getCountryFromIP(ip);
        if (apiCountry) {
            country = apiCountry;
        } else {
            const geo = geoip.lookup(ip);
            country = geo ? geo.country : 'Unknown';
        }

        const device = req.useragent.isMobile ? 'mobile' : (req.useragent.isTablet ? 'tablet' : 'desktop');
        const hour = new Date().getHours();

        // Find or create stats for this link
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

        // Update global totals
        stats.totals.countries[country] = (stats.totals.countries[country] || 0) + 1;
        stats.totals.devices[device] = (stats.totals.devices[device] || 0) + 1;
        stats.totals.hourly[hour] = (stats.totals.hourly[hour] || 0) + 1;
        stats.totals.totalClicks = (stats.totals.totalClicks || 0) + 1;

        await writeJSONBin(STATS_BIN_ID, stats);
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

// API: Get settings (from JSONbin)
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await readJSONBin(SETTINGS_BIN_ID);
        res.json(settings);
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ error: 'Failed to read settings' });
    }
});

// API: Get links (from JSONbin)
app.get('/api/links', async (req, res) => {
    try {
        const links = await readJSONBin(LINKS_BIN_ID);
        res.json(links);
    } catch (error) {
        console.error('Error reading links:', error);
        res.status(500).json({ error: 'Failed to read links' });
    }
});

// API: Save links (to JSONbin)
app.post('/api/links', async (req, res) => {
    try {
        const links = req.body;
        if (!Array.isArray(links)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }
        await writeJSONBin(LINKS_BIN_ID, links);
        res.json({ success: true, message: 'Links saved successfully' });
    } catch (error) {
        console.error('Error saving links:', error);
        res.status(500).json({ error: 'Failed to save links' });
    }
});

// ==================== ANALYTICS ====================
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

app.get('/api/analytics', async (req, res) => {
    try {
        const stats = await readJSONBin(STATS_BIN_ID);
        res.json(stats);
    } catch (error) {
        console.error('Error reading analytics:', error);
        res.json({ links: [], totals: {} });
    }
});

app.post('/api/analytics/reset', async (req, res) => {
    try {
        if (!req.session.adminAuthenticated) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const freshStats = {
            links: [],
            totals: {
                countries: {},
                devices: {},
                hourly: new Array(24).fill(0),
                totalClicks: 0
            }
        };
        await writeJSONBin(STATS_BIN_ID, freshStats);
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
        const settings = await readJSONBin(SETTINGS_BIN_ID);

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
        const settings = await readJSONBin(SETTINGS_BIN_ID);
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
        const settings = await readJSONBin(SETTINGS_BIN_ID);
        if (req.query.error === 'session') {
            if (req.session) req.session.destroy(() => {});
            return showSettingsLogin(res, 'Your session has expired. Please login again.');
        }
        if (settings.adminPassword && !req.session.adminAuthenticated) {
            return showSettingsLogin(res);
        }
        res.sendFile(path.join(__dirname, 'public', 'settings.html'));
    } catch (error) {
        res.status(500).send('Error loading settings page');
    }
});

/**
 * Helper function to display the settings login page.
 * @param {Object} res - Express response object
 * @param {string} errorMsg - Optional error message to display
 */
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
        const settings = await readJSONBin(SETTINGS_BIN_ID);
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
        res.status(500).send('Error');
    }
});

app.post('/settings', upload.single('profilePhotoFile'), async (req, res) => {
    try {
        if (!req.session.adminAuthenticated) {
            return res.redirect('/settings?error=session');
        }

        let settings = await readJSONBin(SETTINGS_BIN_ID);
        const { theme, name, bio, footer, adminPage, adminPassword, search, profilePhoto, security } = req.body;

        // adminPanel has been removed – we force it to false
        settings.theme = theme;
        settings.name = name;
        settings.bio = bio;
        settings.footer = footer;
        settings.adminPanel = false; // Important: adminPanel is always disabled
        settings.adminPage = adminPage === 'on';
        settings.search = search === 'on';
        settings.security = security === 'on';
        if (adminPassword && adminPassword.trim() !== '') {
            const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
            settings.adminPassword = hashedPassword;
        }
        settings.profilePhoto = profilePhoto === 'on';

        if (req.file) {
            const oldPath = req.file.path;
            const ext = path.extname(req.file.originalname);
            const newFilename = `profile${ext}`;
            const newPath = path.join(__dirname, 'public', newFilename);
            await fs.rename(oldPath, newPath);
            settings.profilePhotoUrl = `/static/${newFilename}`;
        }

        await writeJSONBin(SETTINGS_BIN_ID, settings);
        res.redirect('/settings?success=true');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving settings');
    }
});

app.get('/settings/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Error destroying session:', err);
        res.clearCookie('connect.sid', { path: '/' });
        res.redirect('/');
    });
});

// ==================== LINKS MANAGEMENT PAGE (ADMIN STYLE) ====================
app.get('/links', async (req, res) => {
    try {
        const settings = await readJSONBin(SETTINGS_BIN_ID);

        if (settings.adminPassword && !req.session.adminAuthenticated) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Links Login</title>
                    <style>
                        body{font-family:Inter,sans-serif;background:#0f1419;color:#f8fafc;display:flex;justify-content:center;align-items:center;height:100vh;}
                        .login-box{background:rgba(30,35,48,0.8);padding:2rem;border-radius:28px;backdrop-filter:blur(10px);border:1px solid rgba(95,124,175,0.2);width:350px;}
                        input{padding:0.8rem;border-radius:30px;border:1px solid rgba(95,124,175,0.2);background:rgba(30,35,48,0.8);color:white;width:100%;margin-bottom:1rem;}
                        button{background:#5f7caf;color:white;border:none;padding:0.8rem 2rem;border-radius:30px;cursor:pointer;width:100%;}
                    </style>
                </head>
                <body>
                    <div class="login-box">
                        <h2>Links Management Login</h2>
                        <form method="post" action="/links/login">
                            <input type="password" name="password" placeholder="Enter admin password" required>
                            <button type="submit">Login</button>
                        </form>
                    </div>
                </body>
                </html>
            `);
        }

        res.sendFile(path.join(__dirname, 'public', 'admin-links.html'));
    } catch (error) {
        console.error('Error loading links page:', error);
        res.status(500).send('Error loading links page');
    }
});

app.post('/links/login', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { password } = req.body;
        const settings = await readJSONBin(SETTINGS_BIN_ID);

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
                res.redirect('/links');
            });
        } else {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Links Login</title>
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
                        <h2>Links Management Login</h2>
                        <div class="error">Invalid password</div>
                        <form method="post" action="/links/login">
                            <input type="password" name="password" placeholder="Enter admin password" required>
                            <button type="submit">Login</button>
                        </form>
                    </div>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Error in /links/login:', error);
        res.status(500).send('Error');
    }
});

// ==================== MISC ROUTES ====================
// Favicon endpoint (serves favicon.png from public folder)
app.get('/docs/favicon', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.png'));
});

// Preparation page (helper for JSONbin setup)
app.get('/prepare', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'prepare.html'));
});

// ==================== CATCH-ALL ====================
// Redirect any unknown routes to home
app.use((req, res) => {
    res.redirect('/');
});

// ==================== START SERVER ====================
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} in ${environment} mode + prepare page is running`);
});

