document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. Authentication Check ---
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) window.location.href = '../auth.html';
        else {
            const email = session.user.email;
            document.querySelectorAll('#user-email').forEach(el => el.textContent = email);
            const avatarUrl = `https://ui-avatars.com/api/?name=${email}&background=0b5ed7&color=fff&bold=true`;
            document.getElementById('user-avatar').src = avatarUrl;
        }
    };
    await checkAuth();

    // --- 2. Sidebar Toggle (Mobile) ---
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');

    if (openBtn && closeBtn) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !openBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    // --- 3. Profile Dropdown Logic ---
    const profileToggle = document.getElementById('dashboard-profile-toggle');
    const profileDropdown = document.getElementById('dashboard-dropdown-menu');

    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // --- 4. Logout Logic ---
    document.querySelectorAll('.logout, .logout-link, #header-logout-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = '../index.html';
        });
    });

    // --- 5. Chart.js Logic (With Filter Update) ---
    const ctx = document.getElementById('healthChart');
    
    // Data Presets
    const data7Days = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        bp: [120, 118, 122, 121, 119, 125, 120],
        glucose: [95, 92, 98, 94, 96, 100, 95]
    };

    const data30Days = {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
        bp: [118, 122, 119, 121],
        glucose: [94, 98, 95, 96]
    };

    if (ctx) {
        // Initialize Chart
        let healthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data7Days.labels,
                datasets: [
                    {
                        label: 'Systolic BP',
                        data: data7Days.bp,
                        borderColor: '#0b5ed7',
                        backgroundColor: 'rgba(11, 94, 215, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#0b5ed7',
                        borderWidth: 2
                    },
                    {
                        label: 'Glucose',
                        data: data7Days.glucose,
                        borderColor: '#fd7e14',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointRadius: 3,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
                },
                scales: {
                    y: { beginAtZero: false, grid: { color: '#f1f3f5', drawBorder: false } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Handle Filter Change
        const chartFilter = document.getElementById('chart-filter');
        if (chartFilter) {
            chartFilter.addEventListener('change', (e) => {
                const value = e.target.value;
                
                if (value === '7') {
                    healthChart.data.labels = data7Days.labels;
                    healthChart.data.datasets[0].data = data7Days.bp;
                    healthChart.data.datasets[1].data = data7Days.glucose;
                } else if (value === '30') {
                    healthChart.data.labels = data30Days.labels;
                    healthChart.data.datasets[0].data = data30Days.bp;
                    healthChart.data.datasets[1].data = data30Days.glucose;
                }
                
                healthChart.update();
            });
        }
    }
});