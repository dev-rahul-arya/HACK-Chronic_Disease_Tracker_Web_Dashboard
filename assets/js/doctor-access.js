document.addEventListener('DOMContentLoaded', async () => {
    
    // --- Variables ---
    const generateForm = document.getElementById('generate-access-form');
    const labelInput = document.getElementById('doctor-label');
    const codesList = document.getElementById('active-codes-list');
    const loadingEl = document.getElementById('loading-codes');
    const emptyState = document.getElementById('empty-codes');
    
    let currentUser = null;

    // --- Init ---
    const init = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '../auth.html';
            return;
        }
        currentUser = session.user;
        fetchAccessCodes();
    };

    // --- 1. Fetch Active Codes ---
    async function fetchAccessCodes() {
        loadingEl.style.display = 'block';
        codesList.innerHTML = '';
        emptyState.classList.add('hidden');

        const { data, error } = await supabase
            .from('doctor_access')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        loadingEl.style.display = 'none';

        if (error) {
            console.error('Error fetching codes:', error);
            return;
        }

        if (!data || data.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            renderCodes(data);
        }
    }

    // --- 2. Render List ---
    function renderCodes(codes) {
        codes.forEach(item => {
            const date = new Date(item.created_at).toLocaleDateString();
            const url = `${window.location.origin}/doctor/view.html?code=${item.access_code}`;
            
            const div = document.createElement('div');
            div.className = 'access-item';
            div.innerHTML = `
                <div class="access-info">
                    <h4>${escapeHtml(item.doctor_name || 'Shared Link')}</h4>
                    <span class="access-meta">Created on: ${date}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <div class="link-box">
                        <span class="code-text">...${item.access_code.slice(-4)}</span> <!-- Masked for UI cleaness, copy full link below -->
                        <button class="copy-btn" onclick="copyLink('${url}')" title="Copy Full Link">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                    
                    <button class="revoke-btn" onclick="revokeAccess('${item.id}')">
                        <i class="fa-solid fa-ban"></i> Revoke
                    </button>
                </div>
            `;
            codesList.appendChild(div);
        });
    }

    // --- 3. Generate New Code ---
    generateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = generateForm.querySelector('button');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

        // Create a random 12-char string
        const code = generateRandomString(12);
        const label = labelInput.value.trim() || 'Shared Link';

        const { error } = await supabase
            .from('doctor_access')
            .insert([{
                user_id: currentUser.id,
                access_code: code,
                doctor_name: label
            }]);

        if (error) {
            alert('Error generating link: ' + error.message);
        } else {
            labelInput.value = ''; // Reset input
            fetchAccessCodes(); // Reload list
        }

        btn.disabled = false;
        btn.innerHTML = originalText;
    });

    // --- 4. Revoke Access ---
    window.revokeAccess = async (id) => {
        if (!confirm('Are you sure? The doctor using this link will immediately lose access.')) return;

        const { error } = await supabase
            .from('doctor_access')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error revoking access: ' + error.message);
        } else {
            fetchAccessCodes();
        }
    };

    // --- Helpers ---
    window.copyLink = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            prompt("Copy this link:", text); // Fallback
        });
    };

    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    init();
});