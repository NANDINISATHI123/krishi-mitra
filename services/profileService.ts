import { Profile } from '../types.js';
import { supabase } from '../lib/supabaseClient.js';

/**
 * Fetches all user profiles from the database for an admin.
 * This uses a remote procedure call (RPC) to a Postgres function in the database
 * to bypass restrictive Row Level Security (RLS) policies.
 */
export const getProfiles = async (): Promise<Profile[]> => {
    const { data, error } = await supabase.rpc('get_all_users_admin');

    if (error) {
        console.error('Error fetching profiles via RPC:', error.message);
        return [];
    }
    return data as Profile[];
};

/**
 * Updates the role of a specific user. This is an admin-only action.
 * It directly calls the `auth.admin.updateUserById` method, which requires
 * the service_role key to be used in the Supabase client.
 * For this client-side app, we'll use an RPC to a secure database function.
 * 
 * NOTE: This requires a corresponding `update_user_role` function to be created in the database.
 * The function should be defined as `SECURITY DEFINER` to have the necessary permissions.
 */
export const updateProfileRole = async (userId: string, role: 'admin' | 'employee'): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.rpc('update_user_role', {
        user_id: userId,
        new_role: role,
    });
    
    if (error) {
        console.error('Error updating user role via RPC:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true };
};