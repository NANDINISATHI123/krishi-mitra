import { CommunityPost, Feedback, Profile } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

// --- Community Feed ---
export const getPosts = async (): Promise<CommunityPost[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (name)
        `)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    return data as any[];
};

export const addPost = async (content: string, userId: string, imageFile?: File | null): Promise<CommunityPost | null> => {
    try {
        let photo_url: string | undefined = undefined;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `posts/${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('community-images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('community-images')
                .getPublicUrl(filePath);
            photo_url = urlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('posts')
            .insert({ content, user_id: userId, photo_url })
            .select(`
                *,
                profiles (name)
            `)
            .single();
        
        if (error) throw error;

        return data as any;
    } catch (error) {
        console.error('Error adding post:', error);
        return null;
    }
};

// --- Feedback ---
export const getFeedback = async (): Promise<Feedback[]> => {
    const { data, error } = await supabase
        .from('feedback')
        .select(`
            *,
            profiles (email)
        `)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching feedback:', error);
        return [];
    }
    return data as any[];
};

export const addFeedback = async (message: string, profile: Profile): Promise<Feedback | null> => {
    const { data, error } = await supabase
        .from('feedback')
        .insert({ message, user_id: profile.id })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding feedback:', error);
        return null;
    }
    return data;
};

export const deleteFeedback = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting feedback:', error);
        return false;
    }
    return true;
};

// --- Admin Functions ---

export const getAllPostsAdmin = async (): Promise<CommunityPost[]> => {
    const { data, error } = await supabase.rpc('get_all_posts_admin');
    if (error) {
        console.error('Error fetching all posts for admin via RPC:', error);
        return [];
    }
    return data as any[];
};

export const getAllFeedbackAdmin = async (): Promise<Feedback[]> => {
    const { data, error } = await supabase.rpc('get_all_feedback_admin');
    if (error) {
        console.error('Error fetching all feedback for admin via RPC:', error);
        return [];
    }
    return data as any[];
};