import { KnowledgeAnswer, QuestionHistory, Bookmark } from '../types.js';
import { GoogleGenAI, Type } from '@google/genai';
import { Language } from '../lib/translations.js';
import { supabase } from '../lib/supabaseClient.js';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getKnowledgeAnswer = async (query: string, lang: Language): Promise<KnowledgeAnswer> => {
    const langInstruction = lang === 'te' ? 'You MUST respond only in the Telugu language.' : 'Please provide the answer in English.';
    const prompt = `
        You are an expert in organic and sustainable farming, specifically for small-scale farmers in India. 
        Analyze the following question and provide a clear, concise, and actionable answer.
        Also, provide three related questions a farmer might ask next.
        ${langInstruction}
        
        Question: "${query}"

        Respond ONLY in the structured JSON format defined by the schema.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            answer: { type: Type.STRING, description: "The detailed, practical answer to the user's question." },
            related_questions: {
                type: Type.ARRAY,
                description: "An array of three relevant follow-up questions.",
                items: { type: Type.STRING }
            }
        },
        required: ["answer", "related_questions"]
    };

    try {
        const proxyResponse = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'getKnowledgeAnswer',
                payload: { prompt, schema }
            })
        });

        if (!proxyResponse.ok) {
            const errorBody = await proxyResponse.json();
            throw new Error(errorBody.error || `Proxy request failed with status ${proxyResponse.status}`);
        }
        
        const result = await proxyResponse.json();
        const resultJson = JSON.parse(result.text);

        return {
            question: query,
            answer: resultJson.answer,
            likes: 0,
            dislikes: 0,
            related: resultJson.related_questions || [],
        };

    } catch (error) {
        console.error("Secure knowledge base call failed:", error);
        throw new Error("Failed to get an answer. Please try again.");
    }
};

// --- History and Bookmarks ---
export const getHistory = async (userId: string): Promise<QuestionHistory[]> => {
    const { data, error } = await supabase.from('question_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    return error ? [] : data;
};

export const addHistory = async (userId: string, question: string): Promise<QuestionHistory | null> => {
    const { data, error } = await supabase.from('question_history').insert({ user_id: userId, question }).select().single();
    if (error) {
        console.error("Error adding history:", error);
        throw error;
    }
    return data;
};

export const getBookmarks = async (userId: string): Promise<Bookmark[]> => {
    const { data, error } = await supabase.from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return error ? [] : data;
};

export const addBookmark = async (userId: string, question: string, answer: string): Promise<Bookmark | null> => {
    const { data, error } = await supabase.from('bookmarks').insert({ user_id: userId, question, answer }).select().single();
    if (error) {
        console.error("Error adding bookmark:", error);
        throw error;
    }
    return data;
};