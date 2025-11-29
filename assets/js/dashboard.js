document.addEventListener('DOMContentLoaded', async () => {
    
    let currentUser = null;

    // --- 1. Authentication Check ---
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            window.location.href = '../auth.html';
        } else {
            currentUser = session.user;
            const email = session.user.email;
            
            // Update UI elements
            document.querySelectorAll('#user-email').forEach(el => el.textContent = email);
            const avatarUrl = `https://ui-avatars.com/api/?name=${email}&background=0b5ed7&color=fff&bold=true`;
            document.getElementById('user-avatar').src = avatarUrl;
            
            // Start loading data
            loadUpcomingMeds(); 
        }
    };
    
    await checkAuth();

    // --- 2. Load Upcoming Meds & Update Counts ---
    async function loadUpcomingMeds() {
        const medListContainer = document.getElementById('dashboard-upcoming-meds');
        const pendingCountEl = document.getElementById('pending-meds-count');

        if (!medListContainer) return; 

        // 1. Fetch ALL User's Medications (Removed limit for accurate count)
        const { data: meds, error } = await supabase
            .from('medications')
            .select('*')
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('Error loading meds:', error);
            medListContainer.innerHTML = '<li style="padding:15px; color:#dc3545;">Failed to load meds.</li>';
            if(pendingCountEl) pendingCountEl.textContent = '0 medications';
            return;
        }

        if (!meds || meds.length === 0) {
            medListContainer.innerHTML = `
                <li style="padding:15px; text-align:center; color:#6c757d;">
                    No medications set.<br>
                    <a href="medications.html" style="color:#0b5ed7; font-weight:600; text-decoration:none;">Add one here</a>
                </li>`;
            if(pendingCountEl) pendingCountEl.textContent = '0 medications';
            return;
        }

        // 2. Fetch Today's Logs
        const todayStart = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
        
        const { data: logs } = await supabase
            .from('medication_logs')
            .select('medication_id')
            .eq('user_id', currentUser.id)
            .gte('taken_at', todayStart);

        const takenMedIds = new Set(logs ? logs.map(l => l.medication_id) : []);

        // 3. Calculate & Update Header Count
        const pendingCount = Math.max(0, meds.length - takenMedIds.size);
        if(pendingCountEl) {
            pendingCountEl.textContent = `${pendingCount} medications`;
            // Optional: color code it
            if(pendingCount > 0) pendingCountEl.style.color = '#ffc107'; // yellow for attention
            else pendingCountEl.style.color = 'white'; // default
        }

        // 4. Render List (Only show top 4 to keep dashboard clean)
        medListContainer.innerHTML = '';
        
        // Slice the array to show only first 4 items
        meds.slice(0, 4).forEach(med => {
            const isTaken = takenMedIds.has(med.id);
            const li = document.createElement('li');
            li.className = 'med-item';
            
            li.innerHTML = `
                <div class="med-icon">
                    <i class="fa-solid fa-pills"></i>
                </div>
                <div class="med-info">
                    <span class="med-name">${escapeHtml(med.name)}</span>
                    <span class="med-dose">${escapeHtml(med.dosage)} • ${escapeHtml(med.frequency)}</span>
                </div>
                <label class="custom-checkbox">
                    <input type="checkbox" class="med-check" data-id="${med.id}" title="Mark as taken" ${isTaken ? 'checked disabled' : ''}>
                    <span class="checkmark"></span>
                </label>
            `;
            medListContainer.appendChild(li);
        });

        // 5. Add Event Listeners
        document.querySelectorAll('.med-check').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    const medId = e.target.dataset.id;
                    await logMedicationTaken(medId, e.target);
                    // Update count locally for instant feedback
                    const currentTxt = pendingCountEl.textContent;
                    const currentNum = parseInt(currentTxt) || 0;
                    if(currentNum > 0) pendingCountEl.textContent = `${currentNum - 1} medications`;
                }
            });
        });
    }

    // --- 3. Log Medication History ---
    async function logMedicationTaken(medId, checkboxElement) {
        checkboxElement.disabled = true;

        const { error } = await supabase
            .from('medication_logs')
            .insert([{
                user_id: currentUser.id,
                medication_id: medId,
                status: 'taken',
                taken_at: new Date().toISOString()
            }]);

        if (error) {
            alert('Error saving history: ' + error.message);
            checkboxElement.checked = false;
            checkboxElement.disabled = false;
        } else {
            console.log('Medication logged successfully');
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // --- Standard Dashboard Logic (Sidebar, Auth, etc.) ---
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');

    if (openBtn && closeBtn) {
        openBtn.addEventListener('click', () => sidebar.classList.add('active'));
        closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active') && !sidebar.contains(e.target) && !openBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    const profileToggle = document.getElementById('dashboard-profile-toggle');
    const profileDropdown = document.getElementById('dashboard-dropdown-menu');
    if (profileToggle) {
        profileToggle.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('active'); });
        document.addEventListener('click', (e) => { if (!profileToggle.contains(e.target)) profileDropdown.classList.remove('active'); });
    }

    document.querySelectorAll('.logout, .logout-link, #header-logout-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = '../index.html';
        });
    });

    // Chart Logic
    const ctx = document.getElementById('healthChart');
    if (ctx) {
        const data7Days = { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], bp: [120, 118, 122, 121, 119, 125, 120], glucose: [95, 92, 98, 94, 96, 100, 95] };
        const data30Days = { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], bp: [118, 122, 119, 121], glucose: [94, 98, 95, 96] };

        let healthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data7Days.labels,
                datasets: [
                    { label: 'Systolic BP', data: data7Days.bp, borderColor: '#0b5ed7', backgroundColor: 'rgba(11, 94, 215, 0.1)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: '#0b5ed7', borderWidth: 2 },
                    { label: 'Glucose', data: data7Days.glucose, borderColor: '#fd7e14', backgroundColor: 'transparent', borderDash: [5, 5], tension: 0.4, pointRadius: 3, borderWidth: 2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } } },
                scales: { y: { beginAtZero: false, grid: { color: '#f1f3f5', drawBorder: false } }, x: { grid: { display: false } } }
            }
        });

        const chartFilter = document.getElementById('chart-filter');
        if (chartFilter) {
            chartFilter.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value === '7') { healthChart.data.labels = data7Days.labels; healthChart.data.datasets[0].data = data7Days.bp; healthChart.data.datasets[1].data = data7Days.glucose; }
                else if (value === '30') { healthChart.data.labels = data30Days.labels; healthChart.data.datasets[0].data = data30Days.bp; healthChart.data.datasets[1].data = data30Days.glucose; }
                healthChart.update();
            });
        }
    }
});