(function () {
    'use strict';

    const form       = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const pwInput    = document.getElementById('password');
    const emailErr   = document.getElementById('emailError');
    const pwErr      = document.getElementById('passwordError');
    const submitBtn  = document.getElementById('submitBtn');
    const togglePw   = document.getElementById('togglePw');
    const eyeIcon    = document.getElementById('eyeIcon');

    // ── Password visibility toggle ──────────────────
    const eyeOpen  = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    const eyeClosed= `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;

    togglePw.addEventListener('click', () => {
        const isPassword = pwInput.type === 'password';
        pwInput.type = isPassword ? 'text' : 'password';
        eyeIcon.innerHTML = isPassword ? eyeClosed : eyeOpen;
    });

    // ── Validation helpers ──────────────────────────
    function isValidEmail(val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    }

    function showError(input, errorEl, msg) {
        input.classList.add('error');
        errorEl.textContent = msg;
    }

    function clearError(input, errorEl) {
        input.classList.remove('error');
        errorEl.textContent = '';
    }

    // ── Inline validation on blur ───────────────────
    emailInput.addEventListener('blur', () => {
        if (emailInput.value && !isValidEmail(emailInput.value)) {
            showError(emailInput, emailErr, 'Please enter a valid email address.');
        } else {
            clearError(emailInput, emailErr);
        }
    });

    emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('error') && isValidEmail(emailInput.value)) {
            clearError(emailInput, emailErr);
        }
    });

    pwInput.addEventListener('input', () => {
        if (pwInput.classList.contains('error') && pwInput.value.length >= 6) {
            clearError(pwInput, pwErr);
        }
    });

    // ── Form submit ─────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let valid = true;

        if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
            showError(emailInput, emailErr, 'Please enter a valid email address.');
            valid = false;
        }

        if (!pwInput.value || pwInput.value.length < 6) {
            showError(pwInput, pwErr, 'Password must be at least 6 characters.');
            valid = false;
        }

        if (!valid) return;

        // Loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulated async auth — replace with real fetch
        await new Promise(r => setTimeout(r, 1400));

        // Reset (replace with redirect or error handling)
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Demo: shake on "wrong" creds
        form.style.animation = 'none';
        form.offsetHeight; // reflow
        form.style.animation = '';
        showError(emailInput, emailErr, 'Invalid email or password.');
        showError(pwInput, pwErr, '');
        emailInput.focus();
    });
})();