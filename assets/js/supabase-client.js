// assets/js/supabase-client.js

// 1. Configuration provided by you
const SUPABASE_URL = 'https://fcpqvudurlbzwzcacbjl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Rehm8XocAe9j_KsW5GT4QQ_R-juEbsU';

// 2. Initialize the client (assumes supabase-js is loaded via CDN in HTML)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Export for use in other files
// (Since we aren't using a bundler like Webpack, 'supabase' is globally available via window, 
// but this file ensures it's configured).
console.log("Supabase Client Initialized");