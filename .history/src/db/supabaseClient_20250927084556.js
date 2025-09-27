const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = require('../config/env');

// Check if Supabase is properly configured
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey &&
                    supabaseUrl !== 'https://your-project.supabase.co' &&
                    supabaseAnonKey !== 'your_supabase_anon_key' &&
                    supabaseServiceRoleKey !== 'your_supabase_service_role_key';

if (!isConfigured) {
  console.warn('⚠️  Supabase not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY for full functionality.');
  console.log('📝 App will run in limited mode - authentication and data operations will fail.');
  console.log('🔧 Configure Supabase at: https://supabase.com');

  // Export null clients for limited functionality
  module.exports = { supabaseAnon: null, supabaseService: null };
} else {
  // Create Supabase clients
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });

  console.log('✅ Supabase clients initialized successfully');

  module.exports = { supabaseAnon, supabaseService };
}
