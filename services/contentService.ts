

import { Supplier, Tutorial } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { mockTutorials } from '../lib/data.ts';

// --- Tutorials ---
export const getTutorials = async (isAdmin: boolean = false): Promise<Tutorial[]> => {
    if (isAdmin) {
        // Use RPC for admin to bypass RLS
        const { data, error } = await supabase.rpc('get_all_tutorials_admin');
        if (error) {
            console.error('Error fetching admin tutorials:', error);
            return [];
        }
        return data;
    }

    const { data, error } = await supabase.from('tutorials').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching tutorials, falling back to mock data:', error);
        return mockTutorials;
    }
    if (!data || data.length === 0) {
        console.log('No tutorials found in database, falling back to mock data for demonstration.');
        return mockTutorials;
    }
    return data;
};

export const saveTutorial = async (tutorial: Omit<Tutorial, 'id' | 'created_at'>): Promise<Tutorial | null> => {
    const { data, error } = await supabase.from('tutorials').insert(tutorial).select().single();
    if (error) {
        console.error('Error saving tutorial:', error);
        return null;
    }
    return data;
};

export const updateTutorial = async (tutorial: Tutorial): Promise<Tutorial | null> => {
    const { data, error } = await supabase.from('tutorials').update(tutorial).eq('id', tutorial.id).select().single();
    if (error) {
        console.error('Error updating tutorial:', error);
        return null;
    }
    return data;
};

export const deleteTutorial = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('tutorials').delete().eq('id', id);
    if (error) {
        console.error('Error deleting tutorial:', error);
        return false;
    }
    return true;
};

// --- Suppliers ---
export const getSuppliers = async (isAdmin: boolean = false): Promise<Supplier[]> => {
    if (isAdmin) {
        // Use RPC for admin to bypass RLS
        const { data, error } = await supabase.rpc('get_all_suppliers_admin');
        if (error) {
            console.error('Error fetching admin suppliers:', error);
            return [];
        }
        return data;
    }
    const { data, error } = await supabase.from('suppliers').select('*').order('name');
    if (error) {
        console.error('Error fetching suppliers:', error);
        return [];
    }
    return data;
};

export const saveSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier | null> => {
    const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
    if (error) {
        console.error('Error saving supplier:', error);
        return null;
    }
    return data;
};

export const updateSupplier = async (supplier: Supplier): Promise<Supplier | null> => {
    const { data, error } = await supabase.from('suppliers').update(supplier).eq('id', supplier.id).select().single();
    if (error) {
        console.error('Error updating supplier:', error);
        return null;
    }
    return data;
};

export const deleteSupplier = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) {
        console.error('Error deleting supplier:', error);
        return false;
    }
    return true;
};