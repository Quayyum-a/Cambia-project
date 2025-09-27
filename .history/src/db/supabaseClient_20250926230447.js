const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = require('../config/env');

if (!supabaseUrl) {
  console.warn('Supabase URL not set (SUPABASE_URL). Backend will continue but Supabase features are disabled.');
}

const isDemoMode = supabaseUrl === 'https://your-project.supabase.co' ||
                   supabaseAnonKey === 'your_supabase_anon_key' ||
                   supabaseServiceRoleKey === 'your_supabase_service_role_key';

const supabaseAnon = supabaseUrl && supabaseAnonKey && !isDemoMode
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;

const supabaseService = supabaseUrl && supabaseServiceRoleKey && !isDemoMode
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null;

if (isDemoMode) {
  console.log('Running in demo mode - Supabase features disabled');
}

module.exports = { supabaseAnon, supabaseService };
