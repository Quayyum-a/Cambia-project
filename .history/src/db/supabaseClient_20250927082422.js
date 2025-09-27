const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = require('../config/env');

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Supabase configuration missing. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

if (supabaseUrl === 'https://your-project.supabase.co' ||
    supabaseAnonKey === 'your_supabase_anon_key' ||
    supabaseServiceRoleKey === 'your_supabase_service_role_key') {
  throw new Error('Supabase configuration uses placeholder values. Please update with your actual Supabase project credentials.');
}

// Create Supabase clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

console.log('✅ Supabase clients initialized successfully');

module.exports = { supabaseAnon, supabaseService };
