import { Report } from '../types.js';
import { supabase } from '../lib/supabaseClient.js';

// Type for the data needed to create a report, excluding DB-generated fields
type ReportForCreation = Omit<Report, 'id' | 'created_at' | 'photo_url'>;

/**
 * Fetches all diagnosis reports from the database for an admin.
 * This uses a remote procedure call (RPC) to a Postgres function in the database.
 * This is the correct way to fetch all reports for an admin, as it can bypass
 * restrictive Row Level Security (RLS) policies that cause errors with direct selects.
 * NOTE: This requires a corresponding `get_all_reports_admin` function to be created in the database.
 */
export const getReports = async (): Promise<Report[]> => {
    const { data, error } = await supabase.rpc('get_all_reports_admin');

    if (error) {
        console.error('Error fetching reports via RPC:', error.message);
        // The error "Could not find the function..." means the backend function is missing.
        return [];
    }
    return data as Report[];
};

/**
 * Fetches diagnosis reports for a specific user.
 * @param userId - The ID of the user whose reports to fetch.
 */
export const getReportsForUser = async (userId: string): Promise<Report[]> => {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user reports:', error.message);
        return [];
    }
    return data as Report[];
};

/**
 * Adds a new diagnosis report, including uploading the image to storage.
 * @param reportData - The report data from the AI diagnosis.
 * @param imageFile - The original image file to be uploaded.
 */
export const addReport = async (reportData: ReportForCreation, imageFile: File): Promise<Report | null> => {
    if (!reportData.user_id) {
        throw new Error('User must be logged in to create a report.');
    }

    // 1. Upload image to Supabase Storage
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${reportData.user_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(filePath, imageFile);

    if (uploadError) {
        console.error('Error uploading image:', uploadError.message);
        return null;
    }

    // 2. Get the public URL of the uploaded image
    const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(filePath);
    
    const photo_url = urlData.publicUrl;

    // 3. Insert the full report into the 'reports' table
    const reportToInsert = {
        ...reportData,
        photo_url,
    };

    const { data: insertedData, error: insertError } = await supabase
        .from('reports')
        .insert(reportToInsert)
        .select()
        .single();
    
    if (insertError) {
        console.error('Error inserting report:', insertError.message);
        return null;
    }

    return insertedData as Report;
};