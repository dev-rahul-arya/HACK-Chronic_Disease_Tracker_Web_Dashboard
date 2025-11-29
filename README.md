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
