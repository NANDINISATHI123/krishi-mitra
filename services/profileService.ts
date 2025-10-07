import { Profile } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

/**
 * Fetches all user profiles from the database for an admin.
 * This uses a remote procedure call (RPC) to a Postgres function in the database
 * to bypass restrictive Row Level Security (RLS) policies.
 */
export const getProfiles = async (): Promise<Profile[]> => {
    try {
        const { data, error } = await supabase.rpc('get_all_users_admin');
        if (error) throw error;
        return data as Profile[];
    } catch (error) {
        console.error('Error fetching profiles via RPC:', error);
        return [];
    }
};

/**
 * Updates the role of a specific user. This is an admin-only action.
 * It uses an RPC call to a secure database function.
 */
export const updateProfileRole = async (userId: string, role: 'admin' | 'employee'): Promise<boolean> => {
    try {
        const { error } = await supabase.rpc('update_user_role', {
            user_id: userId,
            new_role: role,
        });
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating user role via RPC:', error);
        return false;
    }
};