require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

function readJson(file) {
    try {
        const raw = fs.readFileSync(file, 'utf8').trim();
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Ensure data files exist
if (!fs.existsSync(USERS_FILE)) writeJson(USERS_FILE, []);
if (!fs.existsSync(GAMES_FILE)) writeJson(GAMES_FILE, []);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 week
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ───── Auth routes ─────
app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required.' });
    }

    const users = readJson(USERS_FILE);
    const user = users.find(u => u.email === email.toLowerCase().trim());

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.userId = user.id;
    req.session.email = user.email;
    res.json({ ok: true, user: { id: user.id, email: user.email } });
});

app.post('/api/register', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password || password.length < 6) {
        return res.status(400).json({ error: 'Valid email and 6+ char password required.' });
    }

    const users = readJson(USERS_FILE);
    const cleanEmail = email.toLowerCase().trim();
    if (users.find(u => u.email === cleanEmail)) {
        return res.status(409).json({ error: 'Account already exists.' });
    }

    const newUser = {
        id: Date.now().toString(36),
        email: cleanEmail,
        password,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeJson(USERS_FILE, users);

    req.session.userId = newUser.id;
    req.session.email = newUser.email;
    res.json({ ok: true, user: { id: newUser.id, email: newUser.email } });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
    if (req.session.userId) {
        return res.json({ authenticated: true, email: req.session.email });
    }
    res.json({ authenticated: false });
});

// ───── Games routes ─────
app.get('/api/games', (req, res) => {
    res.json(readJson(GAMES_FILE));
});

// ───── Groq AI route ─────
app.post('/api/chat', async (req, res) => {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message required' });
    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: 'GROQ_API_KEY not configured.' });
    }

    try {
        const Groq = require('groq-sdk').default || require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: message }]
        });

        res.json({ reply: completion.choices[0]?.message?.content || '' });
    } catch (err) {
        console.error('Groq error:', err);
        res.status(500).json({ error: 'AI request failed.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
