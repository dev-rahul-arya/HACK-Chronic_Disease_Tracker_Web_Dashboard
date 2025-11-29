// elements
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const toggleBtn = document.getElementById('toggle-auth');
const toggleText = document.getElementById('toggle-text');
const authSubtitle = document.getElementById('auth-subtitle');
const alertBox = document.getElementById('auth-alert');

// State: 'login' or 'signup'
let authMode = 'login';

// --- 1. Toggle between Login and Signup ---
toggleBtn.addEventListener('click', () => {
    if (authMode === 'login') {
        authMode = 'signup';
        submitBtn.textContent = 'Create Account';
        toggleText.textContent = 'Already have an account?';
        toggleBtn.textContent = 'Login';
        authSubtitle.textContent = 'Create an account to start tracking';
    } else {
        authMode = 'login';
        submitBtn.textContent = 'Login';
        toggleText.textContent = "Don't have an account?";
        toggleBtn.textContent = 'Sign Up';
        authSubtitle.textContent = 'Login to manage your health';
    }
    // Clear errors when switching
    alertBox.classList.add('hidden');
});

// --- 2. Handle Form Submission ---
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value;
    const password = passwordInput.value;

    // Reset UI
    alertBox.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        let error = null;
        let data = null;

        if (authMode === 'signup') {
            // Supabase Sign Up
            const res = await supabase.auth.signUp({
                email: email,
                password: password,
            });
            error = res.error;
            data = res.data;
            
            if (!error && data) {
                alert("Registration successful! Please check your email to verify your account before logging in.");
                // Switch back to login mode
                toggleBtn.click();
            }

        } else {
            // Supabase Login
            const res = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            error = res.error;
            data = res.data;

            if (!error && data.session) {
                // Success: Redirect to Dashboard
                window.location.href = 'dashboard/index.html';
            }
        }

        if (error) throw error;

    } catch (err) {
        showError(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = authMode === 'login' ? 'Login' : 'Create Account';
    }
});

// Helper: Show Error Message
function showError(msg) {
    alertBox.textContent = msg;
    alertBox.classList.remove('hidden');
}

// --- 3. Check if already logged in ---
// If user visits auth.html but is already logged in, send them to dashboard
async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
        window.location.href = 'dashboard/index.html';
    }
}
checkSession();