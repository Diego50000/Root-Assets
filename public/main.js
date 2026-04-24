const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const authMessage = document.getElementById('auth-message');

// --- REGISTRATION ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.ok) {
        authMessage.innerText = "Registration successful! You are logged in.";
        checkSession(); // Update the UI
    } else {
        authMessage.innerText = "Error: " + data.error;
    }
});

// --- LOGIN ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.ok) {
        authMessage.innerText = "Login successful!";
        checkSession(); // Update the UI
    } else {
        authMessage.innerText = "Error: " + data.error;
    }
});

// --- LOGOUT ---
logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    authMessage.innerText = "Logged out successfully.";
    checkSession();
});

// --- CHECK SESSION ON LOAD ---
async function checkSession() {
    const response = await fetch('/api/session');
    const data = await response.json();

    if (data.authenticated) {
        // Hide forms, show logout if logged in
        registerForm.style.display = 'none';
        loginForm.style.display = 'none';
        logoutBtn.style.display = 'block';
        authMessage.innerText = `Welcome, ${data.email}!`;
    } else {
        // Show forms, hide logout if logged out
        registerForm.style.display = 'block';
        loginForm.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

// Run this when the page first loads
checkSession();