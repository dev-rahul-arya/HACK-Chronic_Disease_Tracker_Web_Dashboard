# Chronic_Disease_Tracker_Web_Dashboard

Many chronic disease patients (diabetes, hypertension, etc.) struggle to consistently track their vitals and medicines, leading to missed doses, poor visibility of trends, and rushed consultations where doctors lack organized data. There is a need for a simple web-based dashboard that lets patients log daily health parameters and medication intake, and allows doctors to quickly view summarized trends instead of scattered notes or screenshots.  

Proposed Solution:  
1. Responsive web app where patients register, add their disease profile, and log daily vitals (e.g., blood sugar, blood pressure) and medicines.  
2. Visual dashboard with charts showing trends over time, missed doses, and simple alerts when readings cross safe ranges.  
3. Doctor view where patients can share a secure code/link so doctors see a summarized report (graphs and key stats) before or during consultations.  
4. Basic reminders via email or on-site notifications to reduce missed logging and missed medication.  
5. Secure, role‑based access (patient vs doctor) with simple privacy controls so patients choose exactly what to share.  

Tech Stack:  
1. HTML, CSS, and JavaScript for a responsive user interface and interactive charts (using a lightweight JS chart library such as Chart.js).  
2. PostgreSQL (via Supabase) to store users, disease profiles, vitals logs, and doctor access links in a secure, managed database.  
3. GitHub for version control, with deployment on a cloud platform like Render or Vercel to host the web app and provide a live demo link.

⚙️ Installation & Setup

Follow these steps to run the project locally.

1. Clone the Repository

Open your terminal and run:

git clone https://github.com/dev-rahul-arya/HACK-Chronic_Disease_Tracker_Web_Dashboard.git
cd chronic-disease-tracker


2. Set Up Supabase

Go to Supabase.com and sign in.

Click "New Project".

Give it a name (e.g., HealthTrack) and set a database password.

Wait for the database to provision.

3. Database Schema Setup (SQL)

You need to create the tables and security functions for the app to work.

In your Supabase Dashboard, go to the SQL Editor (icon on the left sidebar).

Click "New Query".

Open the file sql_commands/full_schema.sql from this repository.

Copy the entire content of that file.

Paste it into the Supabase SQL Editor and click "Run".

Note: This script creates the health_logs, medications, medication_logs, and doctor_access tables, enables Row Level Security (RLS), and creates the secure functions needed for the Doctor View.

4. Connect Frontend to Supabase

In Supabase, go to Project Settings (Cog icon) -> API.

Copy the Project URL and the anon / public Key.

Open the file assets/js/supabase-client.js in your code editor.

Replace the placeholder values with your actual keys:

const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';


5. Run the Application

Since this is a static HTML/JS app, you can run it using any simple local server.

Using VS Code Live Server (Recommended):

Install the "Live Server" extension in VS Code.

Right-click on index.html.

Select "Open with Live Server".

Using Python:

python3 -m http.server


Then open http://localhost:8000 in your browser.

📂 Project Structure

/chronic-disease-tracker
│
├── /assets
│   ├── /css            # Styles (dashboard.css, doctor.css, style.css)
│   ├── /js             # Logic (dashboard.js, doctor-view.js, auth.js, etc.)
│   └── /images         # Static assets
│
├── /dashboard          # Patient Pages
│   ├── index.html      # Main Dashboard
│   ├── log-vitals.html
│   ├── medications.html
│   └── doctor-access.html
│
├── /doctor             # External
