document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. Load User Data ---
    const emailInput = document.getElementById('settings-email');
    const nameInput = document.getElementById('full-name');
    const alertBox = document.getElementById('settings-alert');
    
    let currentUser = null;

    const loadSettings = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            window.location.href = '../auth.html';
            return;
        }

        currentUser = session.user;
        
        // Populate fields
        emailInput.value = currentUser.email;
        
        // Supabase stores extra data like 'full_name' in user_metadata
        if (currentUser.user_metadata && currentUser.user_metadata.full_name) {
            nameInput.value = currentUser.user_metadata.full_name;
        }
    };
    
    await loadSettings();

    // --- 2. Update Profile Handler ---
    const profileForm = document.getElementById('profile-form');
    
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = profileForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;
        
        hideAlert();

        const newName = nameInput.value;

        // Update User Metadata in Supabase Auth
        const { data, error } = await supabase.auth.updateUser({
            data: { full_name: newName }
        });

        if (error) {
            showAlert('Error updating profile: ' + error.message, 'error');
        } else {
            showAlert('Profile updated successfully!', 'success');
            // Update the display name in the header immediately
            const headerName = document.getElementById('user-name-display');
            if (headerName) headerName.textContent = newName || 'My Account';
        }

        btn.textContent = originalText;
        btn.disabled = false;
    });

    // --- 3. Update Password Handler ---
    const passwordForm = document.getElementById('password-form');
    
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = document.getElementById('new-password').value;
        const btn = passwordForm.querySelector('button');
        const originalText = btn.textContent;
        
        if (newPassword.length < 6) {
            showAlert('Password must be at least 6 characters.', 'error');
            return;
        }

        btn.textContent = 'Updating...';
        btn.disabled = true;
        hideAlert();

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            showAlert('Error updating password: ' + error.message, 'error');
        } else {
            showAlert('Password changed successfully!', 'success');
            document.getElementById('new-password').value = ''; // Clear input
        }

        btn.textContent = originalText;
        btn.disabled = false;
    });

    // Helper Functions
    function showAlert(msg, type) {
        alertBox.textContent = msg;
        alertBox.className = `alert-box ${type}`; // 'success' or 'error' defined in dashboard.css
        alertBox.style.display = 'block';
        window.scrollTo(0, 0);
    }

    function hideAlert() {
        alertBox.style.display = 'none';
    }
});