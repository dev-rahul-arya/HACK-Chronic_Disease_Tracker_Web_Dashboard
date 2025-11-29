document.addEventListener('DOMContentLoaded', async () => {
    
    // --- Variables ---
    const medList = document.getElementById('medications-list');
    const loadingEl = document.getElementById('med-loading');
    const emptyState = document.getElementById('empty-state');
    
    // Modal Elements
    const modal = document.getElementById('med-modal');
    const openBtn = document.getElementById('open-med-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-modal');
    const addForm = document.getElementById('add-med-form');
    
    // Form Elements for Edit Logic
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('med-submit-btn');
    const medIdInput = document.getElementById('med-id');
    const nameInput = document.getElementById('med-name');
    const dosageInput = document.getElementById('med-dosage');
    const freqInput = document.getElementById('med-frequency');

    let currentUser = null;

    // --- Init ---
    const init = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '../auth.html';
            return;
        }
        currentUser = session.user;
        fetchMedications();
    };

    // --- Fetch & Render ---
    async function fetchMedications() {
        loadingEl.classList.remove('hidden');
        medList.innerHTML = '';
        emptyState.classList.add('hidden');

        const { data, error } = await supabase
            .from('medications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        loadingEl.classList.add('hidden');

        if (error) {
            console.error('Error fetching meds:', error);
            return;
        }

        if (data.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            renderMedications(data);
        }
    }

    function renderMedications(meds) {
        medList.innerHTML = ''; // Clear list
        meds.forEach(med => {
            const li = document.createElement('li');
            li.className = 'med-item';
            
            li.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <div class="med-icon">
                        <i class="fa-solid fa-pills"></i>
                    </div>
                    <div class="med-info">
                        <span class="med-name">${escapeHtml(med.name)}</span>
                        <span class="med-dose">${escapeHtml(med.dosage)} • ${escapeHtml(med.frequency)}</span>
                    </div>
                </div>
                <div class="action-buttons" style="display: flex; gap: 10px;">
                    <button class="btn-edit" onclick="openEditModal('${med.id}', '${escapeHtml(med.name)}', '${escapeHtml(med.dosage)}', '${escapeHtml(med.frequency)}')" title="Edit" style="border:none; background:none; color: #0b5ed7; cursor: pointer; font-size: 1rem;">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteMedication('${med.id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            medList.appendChild(li);
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // --- Add / Edit Logic ---
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = medIdInput.value; // If ID exists, we are editing
        const name = nameInput.value;
        const dosage = dosageInput.value;
        const frequency = freqInput.value;

        submitBtn.disabled = true;
        submitBtn.textContent = id ? 'Updating...' : 'Adding...';

        let error;

        if (id) {
            // Update Existing
            const { error: updateError } = await supabase
                .from('medications')
                .update({ name, dosage, frequency })
                .eq('id', id);
            error = updateError;
        } else {
            // Insert New
            const { error: insertError } = await supabase
                .from('medications')
                .insert([{ user_id: currentUser.id, name, dosage, frequency }]);
            error = insertError;
        }

        if (error) {
            alert('Error saving medication: ' + error.message);
        } else {
            closeModal();
            fetchMedications();
        }

        submitBtn.disabled = false;
        submitBtn.textContent = id ? 'Update Medicine' : 'Add Medicine';
    });

    // --- Global Functions (Edit/Delete) ---
    // Attached to window so inline onclick="" works
    window.openEditModal = (id, name, dosage, freq) => {
        modalTitle.textContent = 'Edit Medication';
        submitBtn.textContent = 'Update Medicine';
        medIdInput.value = id;
        nameInput.value = name;
        dosageInput.value = dosage;
        freqInput.value = freq;
        
        // Open Modal
        modal.classList.add('active');
    };

    window.deleteMedication = async (id) => {
        if (!confirm('Are you sure you want to remove this medication?')) return;
        const { error } = await supabase.from('medications').delete().eq('id', id);
        if (error) alert('Error deleting: ' + error.message);
        else fetchMedications();
    };

    // --- Modal Controls ---
    function openModal() {
        // Reset to "Add Mode"
        addForm.reset();
        medIdInput.value = '';
        modalTitle.textContent = 'Add Medication';
        submitBtn.textContent = 'Add Medicine';
        
        modal.classList.add('active');
        nameInput.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    init();
});