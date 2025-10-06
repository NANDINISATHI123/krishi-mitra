import { createClient } from '@supabase/supabase-js';

// These keys are from your Supabase project settings under "API".
const supabaseUrl = 'https://wdkltjioxncejjktvtxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2x0amlveG5jZWpqa3R2dHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ1NTAsImV4cCI6MjA3NTIyMDU1MH0.8hakD_JmjXlFmD8oRhMwWn76ADm_NzjXcE8Tu2PqXEg';

// =================================================================================
// SECURITY WARNING:
// Your Supabase keys are hardcoded here. The public `anon` key is designed to be
// exposed in the browser, but this is ONLY safe if you have enabled Row Level
// Security (RLS) on ALL of your database tables.
//
// The `supabase/schema.sql` file for this project enables RLS.
//
// - NEVER disable RLS on your tables.
// - NEVER hardcode your Supabase `service_role` key in any frontend code.
//
// Without RLS, anyone could read, modify, or delete your entire database.
// =================================================================================

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
