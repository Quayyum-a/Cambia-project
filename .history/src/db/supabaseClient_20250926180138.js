const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = require('../config/env');

if (!supabaseUrl) {
  console.warn('Supabase URL not set (SUPABASE_URL). Backend will continue but Supabase features are disabled.');
}

const supabaseAnon = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;

const supabaseService = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null;

module.exports = { supabaseAnon, supabaseService };
