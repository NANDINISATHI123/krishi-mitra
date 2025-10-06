import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdkltjioxncejjktvtxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2x0amlveG5jZWpqa3R2dHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ1NTAsImV4cCI6MjA3NTIyMDU1MH0.8hakD_JmjXlFmD8oRhMwWn76ADm_NzjXcE8Tu2PqXEg';

// NOTE: In a production app, these keys should be stored in environment variables.
// For this project, they are included here for simplicity.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
