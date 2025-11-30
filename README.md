# Chronic Disease Tracker Web Dashboard

Many chronic disease patients (diabetes, hypertension, etc.) struggle to consistently track their vitals and medicines, leading to missed doses, poor visibility of trends, and rushed consultations where doctors lack organized data. This project is a simple web-based dashboard that lets patients log daily health parameters and medication intake, and allows doctors to quickly view summarized trends instead of scattered notes or screenshots.

## Features

- Responsive web app for patients to register, add disease profiles, and log daily vitals (blood sugar, blood pressure) and medicines.
- Visual dashboard with charts showing trends over time, missed doses, and alerts when readings cross safe ranges.
- Doctor view with secure code/link sharing, allowing doctors to see summarized reports (graphs and key stats) before or during consultations.
- Basic reminders via email or on-site notifications to reduce missed logs and medication doses.
- Secure, role-based access (patient vs doctor) with privacy controls letting patients choose what to share.

## Technology Stack

- HTML, CSS, JavaScript for responsive UI and interactive charts using Chart.js.
- PostgreSQL managed by Supabase for storing users, disease profiles, vitals logs, medications, and doctor access links securely.
- GitHub for version control.
- Deployment on cloud platforms like Render or Vercel for hosting the web app and providing a live demo.

## Installation & Setup

1. Clone the repository:
```   
git clone https://github.com/dev-rahul-arya/HACK-Chronic_Disease_Tracker_Web_Dashboard.git
cd chronic-disease-tracker
```

2. Set up a new Supabase project at [supabase.com](https://supabase.com):
- Create a new project and secure it with a password.
- Wait for provisioning to complete.

3. Database schema setup:
- Open Supabase Dashboard → SQL Editor.
- Run the full schema SQL script from `sql_commands/full_schema.sql` in this repository to create tables, enable Row Level Security (RLS), and create necessary functions.

4. Connect frontend to Supabase:
- Copy your Supabase project URL and anon/public API key from Project Settings → API.
- Replace the placeholders in `assets/js/supabase-client.js` with your keys.

5. Run the application locally:
- Use VS Code Live Server extension or Python simple HTTP server.
- Open `http://localhost:8000` in your browser to start using the app.

## Project Structure
```
/chronic-disease-tracker
│
├── /assets
│   ├── /css            # Stylesheets (dashboard.css, doctor.css, style.css)
│   ├── /js             # JavaScript logic (dashboard.js, doctor-view.js, auth.js, etc.)
│   └── /images         # Static assets
│
├── /dashboard          # Patient-facing pages
│   ├── index.html      # Main dashboard
│   ├── log-vitals.html
│   ├── medications.html
│   └── doctor-access.html
│
├── /doctor             # Doctor view (external access)
│   └── index.html
│
└── sql_commands
    └── full_schema.sql # SQL script to create DB schema & security functions
```

## Contributing

Feel free to fork the repo and submit pull requests to improve features or fix bugs. Issues and feature requests are welcome.

## License

This project is open source under the MIT License.
