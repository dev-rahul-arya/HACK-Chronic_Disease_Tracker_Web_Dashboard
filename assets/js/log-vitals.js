document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Set Date Display
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);

    // 2. Handle Form Submission
    const form = document.getElementById('vitals-form');
    const alertBox = document.getElementById('form-alert');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable button to prevent double submit
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        alertBox.className = 'alert-box hidden'; // Hide previous alerts

        // Get User ID
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '../auth.html';
            return;
        }

        // Collect Data
        const formData = {
            user_id: session.user.id,
            systolic_bp: document.getElementById('systolic').value || null,
            diastolic_bp: document.getElementById('diastolic').value || null,
            heart_rate: document.getElementById('heart-rate').value || null,
            glucose: document.getElementById('glucose').value || null,
            weight: document.getElementById('weight').value || null,
            glucose_context: document.getElementById('glucose-context').value,
            notes: document.getElementById('notes').value,
            logged_at: new Date().toISOString()
        };

        // Validate: At least one metric should be present
        if (!formData.systolic_bp && !formData.heart_rate && !formData.glucose && !formData.weight) {
            showAlert('Please enter at least one health metric (BP, Heart Rate, Glucose, or Weight).', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        try {
            // Insert into Supabase 'health_logs' table
            const { error } = await supabase
                .from('health_logs')
                .insert([formData]);

            if (error) throw error;

            // Success
            showAlert('Vitals logged successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Error logging vitals:', error);
            showAlert('Error saving data: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = `alert-box ${type}`;
        // Scroll to top to see alert
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});