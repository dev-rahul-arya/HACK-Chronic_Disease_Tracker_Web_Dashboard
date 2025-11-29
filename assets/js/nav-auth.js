document.addEventListener('DOMContentLoaded', async () => {
    
    const navAuthButtons = document.getElementById('nav-auth-buttons');
    const navProfileSection = document.getElementById('nav-profile-section');
    const userEmailDisplay = document.getElementById('user-email-display');
    const userNameDisplay = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('logout-btn');
    
    // --- 1. Check Session Status ---
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // User is logged in
        navAuthButtons.style.display = 'none';
        navProfileSection.style.display = 'block';

        // Update UI with user data
        const email = session.user.email;
        userEmailDisplay.textContent = email;
        
        // (Optional) If you stored a name in user_metadata during sign up
        // userNameDisplay.textContent = session.user.user_metadata.full_name || "My Account"; 
        
        // Generate a dynamic avatar based on email/name
        userAvatar.src = `https://ui-avatars.com/api/?name=${email}&background=0d6efd&color=fff`;

    } else {
        // User is logged out
        navAuthButtons.style.display = 'flex';
        navProfileSection.style.display = 'none';
    }

    // --- 2. Dropdown Toggle Logic ---
    const profileToggle = document.getElementById('profile-toggle');
    const profileDropdown = document.getElementById('profile-dropdown-menu');

    if (profileToggle) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling
            profileDropdown.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (profileDropdown && profileDropdown.classList.contains('active')) {
            if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        }
    });

    // --- 3. Logout Logic ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.signOut();
            if (!error) {
                window.location.reload(); // Refresh to reset UI to logged-out state
            } else {
                alert('Error logging out');
            }
        });
    }
});