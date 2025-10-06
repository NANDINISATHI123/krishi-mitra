import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these placeholders with your actual Supabase keys.
// You can find these in your Supabase project settings under "API".
const supabaseUrl = 'https://wdkltjioxncejjktvtxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2x0amlveG5jZWpqa3R2dHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ1NTAsImV4cCI6MjA3NTIyMDU1MH0.8hakD_JmjXlFmD8oRhMwWn76ADm_NzjXcE8Tu2PqXEg';

// FIX: Removed the check for placeholder keys. This check causes a TypeScript error
// when the actual keys are provided, as TypeScript treats the constant variables
// as literal types which cannot match the placeholder strings.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);