export type Language = 'en' | 'te';
export type Theme = 'light' | 'dark';
export type FontSize = 'sm' | 'base' | 'lg';

export interface DbRecord {
    id: string;
    created_at: string;
}

export interface Profile extends DbRecord {
    name: string;
    email: string;
    role: 'admin' | 'employee';
}

export interface Report extends DbRecord {
    user_id: string;
    user_email: string;
    disease: string;
    confidence: number;
    treatment: string;
    ai_explanation: string;
    similar_cases: { id: string; photo: string; disease: string }[];
    photo_url: string;
}

export interface Testimonial {
    id: string;
    name: string;
    location: string;
    quote: string;
    quote_te: string;
    image: string;
}

export interface CalendarTask extends DbRecord {
    title: string;
    title_te: string;
    description: string;
    description_te: string;
    month: number;
    day_of_month: number;
}

export interface UserTaskStatus {
    user_id: string;
    task_id: string;
    is_done: boolean;
}

export interface Supplier extends DbRecord {
    name: string;
    district: string;
    contact: string;
    products: string[];
    mapsLink: string;
}

export interface Tutorial extends DbRecord {
    title: string;
    title_te: string;
    category: string;
    videoUrl: string;
    thumbnail: string;
    description: string;
    description_te: string;
}

export interface CommunityPost extends DbRecord {
    content: string;
    user_id: string;
    photo_url?: string;
    profiles?: { name: string };
}

export interface Feedback extends DbRecord {
    message: string;
    user_id: string;
    profiles?: { email: string };
}

export interface WeatherRisk {
    severity: 'Low' | 'Medium' | 'High';
    prediction_en: string;
    prediction_te: string;
}

export interface KnowledgeAnswer {
    question: string;
    answer: string;
    likes: number;
    dislikes: number;
    related: string[];
}

export interface QuestionHistory extends DbRecord {
    user_id: string;
    question: string;
}

export interface Bookmark extends DbRecord {
    user_id: string;
    question: string;
    answer: string;
}

export interface Outcome extends DbRecord {
    user_id: string;
    date: string;
    crop_name: string;
    yield_amount: number;
    yield_unit: string;
    revenue: number;
    notes?: string;
}

export interface OfflineAction {
    id?: number;
    service: 'community' | 'tracker' | 'calendar' | 'knowledge' | 'diagnosis' | 'admin' | 'content';
    method: string;
    payload: any;
    timestamp: number;
    file?: {
        blob: Blob,
        name: string,
        type: string,
    }
}