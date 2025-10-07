import { OfflineAction, KnowledgeAnswer } from '../types.js';
import { addReport } from './reportService.js';
import { updateTaskStatus } from './calendarService.js';
import { addBookmark } from './knowledgeService.js';
import { addOutcome } from './trackerService.js';
import { addPost } from './communityService.js';
import { 
    saveTutorial, updateTutorial, deleteTutorial, 
    saveSupplier, updateSupplier, deleteSupplier 
} from './contentService.js';
import { getRealDiagnosis } from './geminiService.js';
import { translations } from '../lib/translations.js';

type TranslationFunction = (key: keyof typeof translations['en']) => string;
type ShowToastFunction = (message: string, type?: 'success' | 'error' | 'info') => void;

const DB_NAME = 'krishi-mitra-offline';
const DB_VERSION = 2; // Incremented to add knowledge cache
const ACTION_QUEUE_STORE = 'action_queue';
const CONTENT_CACHE_STORE = 'content_cache';
const KNOWLEDGE_CACHE_STORE = 'knowledge_cache';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(ACTION_QUEUE_STORE)) {
                db.createObjectStore(ACTION_QUEUE_STORE, { keyPath: 'timestamp' });
            }
            if (!db.objectStoreNames.contains(CONTENT_CACHE_STORE)) {
                db.createObjectStore(CONTENT_CACHE_STORE, { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains(KNOWLEDGE_CACHE_STORE)) {
                db.createObjectStore(KNOWLEDGE_CACHE_STORE, { keyPath: 'question' });
            }
        };
    });
};

export const addActionToQueue = async (action: Omit<OfflineAction, 'timestamp'>): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(ACTION_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(ACTION_QUEUE_STORE);
    store.put({ ...action, timestamp: new Date().getTime() });
};

export const getQueuedActions = async (): Promise<OfflineAction[]> => {
    const db = await openDB();
    const tx = db.transaction(ACTION_QUEUE_STORE, 'readonly');
    const store = tx.objectStore(ACTION_QUEUE_STORE);
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

export const processActionQueue = async (showToast: ShowToastFunction, t: TranslationFunction): Promise<{ success: boolean; }> => {
    const actions = await getQueuedActions();
    if (actions.length === 0) return { success: false };

    console.log(`Processing ${actions.length} queued actions...`);
    let hasFailures = false;
    const successfulTimestamps: number[] = [];

    for (const action of actions) {
        try {
            switch (action.service) {
                case 'diagnosis':
                    if (action.method === 'addReport' && action.file) {
                        const diagnosisResult = await getRealDiagnosis(action.file.blob as File);
                        if(diagnosisResult.is_plant && diagnosisResult.is_identifiable) {
                             const reportData = {
                                ...action.payload.reportData,
                                disease: diagnosisResult.disease,
                                confidence: diagnosisResult.confidence,
                                treatment: diagnosisResult.treatment,
                                ai_explanation: diagnosisResult.ai_explanation,
                                similar_cases: diagnosisResult.similar_cases,
                            };
                            await addReport(reportData, action.file.blob as File);
                        } else {
                            console.warn("Offline diagnosis failed for a queued item:", diagnosisResult);
                            throw new Error("Diagnosis of queued item failed.");
                        }
                    }
                    break;
                case 'calendar':
                    if (action.method === 'updateTaskStatus') {
                        await updateTaskStatus(action.payload.userId, action.payload.taskId, action.payload.isDone);
                    }
                    break;
                case 'knowledge':
                     if (action.method === 'addBookmark') {
                        await addBookmark(action.payload.userId, action.payload.question, action.payload.answer);
                    }
                    break;
                case 'tracker':
                    if (action.method === 'addOutcome') {
                        await addOutcome(action.payload);
                    }
                    break;
                case 'community':
                    if (action.method === 'addPost') {
                        const imageFile = action.file ? action.file.blob as File : undefined;
                        await addPost(action.payload.content, action.payload.userId, imageFile);
                    }
                    break;
                 case 'content':
                    switch(action.method) {
                        case 'saveTutorial': await saveTutorial(action.payload); break;
                        case 'updateTutorial': await updateTutorial(action.payload); break;
                        case 'deleteTutorial': await deleteTutorial(action.payload.tutorialId); break;
                        case 'saveSupplier': await saveSupplier(action.payload); break;
                        case 'updateSupplier': await updateSupplier(action.payload); break;
                        case 'deleteSupplier': await deleteSupplier(action.payload.supplierId); break;
                    }
                    break;
            }
            successfulTimestamps.push(action.timestamp);
        } catch (error) {
            console.error(`Failed to process action for service '${action.service}':`, error);
            hasFailures = true;
        }
    }

    if (successfulTimestamps.length > 0) {
        const db = await openDB();
        const tx = db.transaction(ACTION_QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(ACTION_QUEUE_STORE);
        await Promise.all(successfulTimestamps.map(ts => 
            new Promise<void>(resolve => {
                const req = store.delete(ts);
                req.onsuccess = () => resolve();
                req.onerror = () => resolve(); // Don't let a delete error stop everything
            })
        ));
    }

    if (hasFailures) {
        showToast(t('error_offline_action_failed'), 'error');
    }
    
    // 'success' means at least one action was processed and we should refresh data.
    return { success: successfulTimestamps.length > 0 };
};

// --- Generic Content Caching ---

export const cacheContent = async (key: string, data: any): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(CONTENT_CACHE_STORE, 'readwrite');
    const store = tx.objectStore(CONTENT_CACHE_STORE);
    store.put({ key, data });
};

export const getCachedContent = async (key: string): Promise<any | null> => {
    const db = await openDB();
    const tx = db.transaction(CONTENT_CACHE_STORE, 'readonly');
    const store = tx.objectStore(CONTENT_CACHE_STORE);
    const result = await new Promise<{ key: string, data: any }>((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
    return result ? result.data : null;
};

// --- Specific Knowledge Base Caching ---
export const cacheKnowledgeAnswer = async (answer: KnowledgeAnswer): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(KNOWLEDGE_CACHE_STORE, 'readwrite');
    const store = tx.objectStore(KNOWLEDGE_CACHE_STORE);
    store.put(answer);
};

export const getCachedKnowledgeAnswer = async (question: string): Promise<KnowledgeAnswer | null> => {
    const db = await openDB();
    const tx = db.transaction(KNOWLEDGE_CACHE_STORE, 'readonly');
    const store = tx.objectStore(KNOWLEDGE_CACHE_STORE);
     const result = await new Promise<KnowledgeAnswer>((resolve, reject) => {
        const request = store.get(question);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
    return result || null;
};