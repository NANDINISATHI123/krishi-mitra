import { CalendarTask, UserTaskStatus } from '../types';
import { supabase } from '../lib/supabaseClient';
import { mockCalendarTasks } from '../lib/data';

// --- For Employees ---
export const getTasksForMonth = async (month: number): Promise<CalendarTask[]> => {
    const { data, error } = await supabase
        .from('calendar_tasks')
        .select('*')
        .eq('month', month)
        .order('day_of_month');
        
    if (error) {
        console.error('Error fetching calendar tasks, falling back to mock:', error.message);
        return mockCalendarTasks.filter(t => t.month === month);
    }
    if (!data || data.length === 0) {
        console.log('No calendar tasks in DB for this month, falling back to mock data for demonstration.');
        return mockCalendarTasks.filter(t => t.month === month);
    }
    return data;
};

export const getUserTaskStatuses = async (userId: string): Promise<UserTaskStatus[]> => {
    try {
        const { data, error } = await supabase
            .from('user_task_status')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            // This will catch errors like the table not existing.
            // We log it for developers but don't crash the app.
            console.warn('Could not fetch user task statuses:', error.message);
            return [];
        }
        return data;
    } catch (e) {
        console.error('A critical error occurred while fetching task statuses:', e);
        return [];
    }
};

export const updateTaskStatus = async (userId: string, taskId: string, isDone: boolean): Promise<UserTaskStatus | null> => {
    const { data, error } = await supabase
        .from('user_task_status')
        .upsert({ user_id: userId, task_id: taskId, is_done: isDone }, { onConflict: 'user_id, task_id' })
        .select()
        .single();
    
    if (error) {
        console.error('Error updating task status:', error.message);
        throw error;
    }
    return data;
};

// --- For Admins ---
export const getTasks = async (): Promise<CalendarTask[]> => {
    const { data, error } = await supabase.from('calendar_tasks').select('*').order('month').order('day_of_month');
    if (error) {
        console.error('Error fetching all tasks:', error);
        return [];
    }
    return data;
};

export const saveTask = async (task: Omit<CalendarTask, 'id' | 'created_at'>): Promise<CalendarTask | null> => {
    const { data, error } = await supabase.from('calendar_tasks').insert(task).select().single();
    if (error) {
        console.error('Error saving task:', error);
        return null;
    }
    return data;
};

export const updateTask = async (task: CalendarTask): Promise<CalendarTask | null> => {
    const { data, error } = await supabase.from('calendar_tasks').update(task).eq('id', task.id).select().single();
    if (error) {
        console.error('Error updating task:', error);
        return null;
    }
    return data;
};

export const deleteTask = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('calendar_tasks').delete().eq('id', id);
    if (error) {
        console.error('Error deleting task:', error);
        return false;
    }
    return true;
};
