document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const accessScreen = document.getElementById('access-screen');
    const reportScreen = document.getElementById('report-screen');
    const accessForm = document.getElementById('access-form');
    const codeInput = document.getElementById('access-code');
    const errorMsg = document.getElementById('access-error');
    const exitBtn = document.getElementById('exit-btn');
    const exportBtn = document.getElementById('export-btn');
    
    // 1. Check URL for code on load
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    
    if (codeFromUrl) {
        codeInput.value = codeFromUrl;
        loadPatientData(codeFromUrl);
    }

    // 2. Handle Login Form Submit
    accessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = codeInput.value.trim();
        if(code) loadPatientData(code);
    });

    // 3. Main Data Loading Function
    async function loadPatientData(code) {
        const btn = accessForm.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        btn.disabled = true;
        errorMsg.classList.add('hidden');

        try {
            // A. Fetch Data (Parallel for speed)
            const [vitalsResult, medsResult, historyResult] = await Promise.all([
                supabase.rpc('get_vitals_by_code', { lookup_code: code }),
                supabase.rpc('get_meds_by_code', { lookup_code: code }),
                // Soft fail for heatmap logic
                supabase.rpc('get_med_history_by_code', { lookup_code: code })
            ]);

            // CHECK SPECIFIC ERRORS
            if (vitalsResult.error) {
                console.error("Vitals Error:", vitalsResult.error);
                throw new Error(vitalsResult.error.message); // Shows specific SQL error
            }
            if (medsResult.error) {
                console.error("Meds Error:", medsResult.error);
                throw new Error(medsResult.error.message);
            }

            const vitals = vitalsResult.data;
            const meds = medsResult.data;
            // Handle Heatmap error gracefully (don't block page if just this fails)
            const medHistory = historyResult.error ? [] : historyResult.data;

            // B. Validate Access
            // If data is empty, check if it's because code is invalid or just no logs
            // Ideally we'd have a separate "check_code" function, but for now:
            // If the RPC returned success but empty arrays, the code MIGHT be valid (user has no data).
            // If the code was invalid, the SQL function usually returns empty set anyway.
            
            // --- CRITICAL FIX: Switch Screens BEFORE Rendering Charts ---
            accessScreen.classList.add('hidden');
            reportScreen.classList.remove('hidden');
            window.scrollTo(0, 0); 

            // C. Render Data
            renderDashboard(vitals || [], meds || [], medHistory || [], code);

        } catch (err) {
            console.error("Load Error:", err);
            // Show the ACTUAL error message to help debugging
            errorMsg.textContent = "Error: " + err.message; 
            errorMsg.classList.remove('hidden');
            
            // Revert Button
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // 4. Render Dashboard
    function renderDashboard(vitals, meds, medHistory, code) {
        try {
            document.getElementById('report-date').textContent = new Date().toLocaleDateString();
            document.getElementById('display-code').textContent = code;

            // --- Table ---
            const tbody = document.querySelector('#vitals-table tbody');
            tbody.innerHTML = '';
            const recentVitals = vitals.slice(0, 15);
            
            if (recentVitals.length === 0) {
                document.querySelector('.table-wrapper').classList.add('hidden');
                document.getElementById('no-vitals-msg').classList.remove('hidden');
            } else {
                document.querySelector('.table-wrapper').classList.remove('hidden');
                document.getElementById('no-vitals-msg').classList.add('hidden');
                
                recentVitals.forEach(log => {
                    const dateObj = new Date(log.logged_at);
                    const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                    const bp = (log.systolic_bp) ? `${log.systolic_bp}/${log.diastolic_bp}` : '-';
                    const row = `<tr><td>${dateStr}</td><td>${bp}</td><td>${log.heart_rate || '-'}</td><td>${log.glucose || '-'}</td></tr>`;
                    tbody.innerHTML += row;
                });
            }

            // --- Chart ---
            renderChart(vitals);

            // --- Heatmap ---
            renderHeatmap(meds, medHistory);

            // --- Med Cards ---
            const medsContainer = document.getElementById('meds-container');
            medsContainer.innerHTML = '';
            if (meds.length === 0) document.getElementById('no-meds-msg').classList.remove('hidden');
            else {
                document.getElementById('no-meds-msg').classList.add('hidden');
                meds.forEach(m => {
                    const lastTaken = m.last_taken 
                        ? new Date(m.last_taken).toLocaleString() 
                        : 'No log history';

                    const card = `
                        <div class="doc-med-card">
                            <h4>${escapeHtml(m.name)}</h4>
                            <p><strong>${escapeHtml(m.dosage)}</strong> • ${escapeHtml(m.frequency)}</p>
                            <p style="margin-top:5px; padding-top:5px; border-top:1px dashed #e9ecef; font-size:0.85rem; color:#6c757d">
                                <i class="fa-solid fa-clock-rotate-left"></i> Last: ${lastTaken}
                            </p>
                        </div>`;
                    medsContainer.innerHTML += card;
                });
            }
        } catch (renderErr) {
            console.error("Render Error:", renderErr);
        }
    }

    // 5. Chart JS
    function renderChart(vitals) {
        if (!vitals || vitals.length === 0) return;
        
        const data = [...vitals].reverse(); 
        const labels = data.map(v => new Date(v.logged_at).toLocaleString([], {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'}));
        
        const ctx = document.getElementById('docChart').getContext('2d');
        
        if (window.myDocChart) window.myDocChart.destroy();

        window.myDocChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Systolic BP', data: data.map(v => v.systolic_bp), borderColor: '#0d6efd', tension: 0.2 },
                    { label: 'Glucose', data: data.map(v => v.glucose), borderColor: '#fd7e14', tension: 0.2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { ticks: { maxTicksLimit: 10 } } }
            }
        });
    }

    // 6. Heatmap Logic
    function renderHeatmap(meds, history) {
        const container = document.getElementById('heatmap-container');
        if (!meds || meds.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No medications tracked.</p>';
            return;
        }

        const days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]); 
        }

        const historyMap = {}; 
        history.forEach(h => {
            if(h.taken_at) {
                const dateKey = new Date(h.taken_at).toISOString().split('T')[0];
                const key = `${h.med_name}_${dateKey}`;
                historyMap[key] = true;
            }
        });

        let html = `<div class="heatmap-grid" style="grid-template-columns: 150px repeat(30, 1fr);">`;
        html += `<div></div>`; 
        days.forEach(day => {
            const dObj = new Date(day);
            html += `<div class="heatmap-day-header">${dObj.getDate()}</div>`;
        });

        meds.forEach(med => {
            html += `<div class="heatmap-label" title="${escapeHtml(med.name)}">${escapeHtml(med.name)}</div>`;
            days.forEach(day => {
                const key = `${med.name}_${day}`;
                const isTaken = historyMap[key];
                const bgClass = isTaken ? 'taken' : '';
                html += `<div class="heatmap-cell ${bgClass}" title="${day}: ${isTaken ? 'Taken' : 'Missed/No Data'}"></div>`;
            });
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    // 7. Export PDF
    exportBtn.addEventListener('click', () => {
        const element = document.getElementById('printable-area');
        const container = document.querySelector('.container');
        
        container.classList.add('pdf-mode');

        const opt = {
            margin:       0.4,
            filename:     'HealthTrack_Report.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            container.classList.remove('pdf-mode');
        });
    });

    // 8. Exit
    exitBtn.addEventListener('click', () => {
        window.location.href = window.location.pathname;
    });

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
});